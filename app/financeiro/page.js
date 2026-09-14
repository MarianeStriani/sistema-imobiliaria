"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

const acessos = [
  ["🏠", "Início", "/"],
  ["👥", "Clientes", "/clientes"],
  ["🏢", "Imóveis", "/imoveis"],
  ["📄", "Contratos", "/contratos"],
  ["💰", "Recebimentos", "/recebimentos"],
  ["💸", "Despesas", "/despesas"],
  ["📊", "Financeiro", "/financeiro"],
]

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export default function Financeiro() {
  const hoje = new Date()

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [recebimentos, setRecebimentos] = useState([])
  const [despesas, setDespesas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setLoading(true)
    setErro("")

    const [r, d] = await Promise.all([
      supabase.from("recebimentos").select("*"),
      supabase.from("despesas").select("*"),
    ])

    if (r.error) {
      console.error(r.error)
      setErro("Erro ao carregar recebimentos.")
      setLoading(false)
      return
    }

    if (d.error) {
      console.error(d.error)
      setErro("Erro ao carregar despesas.")
      setLoading(false)
      return
    }

    setRecebimentos(r.data || [])
    setDespesas(d.data || [])
    setLoading(false)
  }

  function numero(valor) {
    const n = Number(valor)
    return Number.isNaN(n) ? 0 : n
  }

  function pago(status) {
    const s = String(status || "").trim().toLowerCase()
    return ["pago", "recebido", "confirmado", "realizado"].includes(s)
  }

  function dataValida(data) {
    if (!data) return false
    const d = new Date(`${data}T00:00:00`)
    return !Number.isNaN(d.getTime())
  }

  function dataBR(data) {
    if (!dataValida(data)) return "-"
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")
  }

  function moeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const movimentos = useMemo(() => {
    const entradas = recebimentos
      .filter((x) => pago(x.status) && dataValida(x.data_recebimento))
      .map((x) => ({
        id: `e-${x.id}`,
        tipo: "entrada",
        data: x.data_recebimento,
        descricao: x.descricao || x.observacoes || "Recebimento",
        categoria: x.categoria || "Recebimento",
        forma: x.forma_pagamento || "-",
        valor: numero(x.valor),
        criado: x.created_at || "",
      }))

    const saidas = despesas
      .filter((x) => pago(x.status) && dataValida(x.data_despesa))
      .map((x) => ({
        id: `s-${x.id}`,
        tipo: "saida",
        data: x.data_despesa,
        descricao:
          x.descricao ||
          x.observacoes ||
          x["observações"] ||
          "Despesa",
        categoria: x.categoria || "Despesa",
        forma: x.forma_pagamento || "-",
        valor: numero(x.valor),
        criado: x.created_at || "",
      }))

    return [...entradas, ...saidas]
  }, [recebimentos, despesas])

  const saldoAtual = useMemo(() => {
    return movimentos.reduce(
      (saldo, x) =>
        x.tipo === "entrada"
          ? saldo + x.valor
          : saldo - x.valor,
      0
    )
  }, [movimentos])

  const periodo = useMemo(() => {
    return movimentos.filter((x) => {
      const d = new Date(`${x.data}T00:00:00`)
      return (
        d.getMonth() + 1 === mes &&
        d.getFullYear() === ano
      )
    })
  }, [movimentos, mes, ano])

  const saldoAnterior = useMemo(() => {
    const inicio = new Date(ano, mes - 1, 1)

    return movimentos.reduce((saldo, x) => {
      const d = new Date(`${x.data}T00:00:00`)

      if (d < inicio) {
        return x.tipo === "entrada"
          ? saldo + x.valor
          : saldo - x.valor
      }

      return saldo
    }, 0)
  }, [movimentos, mes, ano])

  const extrato = useMemo(() => {
    const lista = [...periodo].sort((a, b) => {
      const da = new Date(`${a.data}T00:00:00`).getTime()
      const db = new Date(`${b.data}T00:00:00`).getTime()

      if (da !== db) return da - db

      return String(a.criado).localeCompare(String(b.criado))
    })

    let saldo = saldoAnterior

    return lista.map((x) => {
      saldo =
        x.tipo === "entrada"
          ? saldo + x.valor
          : saldo - x.valor

      return { ...x, saldo }
    }).reverse()
  }, [periodo, saldoAnterior])

  const entradas = periodo
    .filter((x) => x.tipo === "entrada")
    .reduce((s, x) => s + x.valor, 0)

  const saidas = periodo
    .filter((x) => x.tipo === "saida")
    .reduce((s, x) => s + x.valor, 0)

  const saldoPeriodo = saldoAnterior + entradas - saidas

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {/* ACESSO RÁPIDO */}
        <section style={styles.acessoBox}>
          <h2 style={styles.acessoTitulo}>
            ⚡ Acesso rápido
          </h2>

          <div style={styles.acessos}>
            {acessos.map(([icone, nome, caminho]) => {
              const ativo = caminho === "/financeiro"

              return (
                <Link
                  key={caminho}
                  href={caminho}
                  style={{
                    ...styles.acesso,
                    background: ativo ? "#2563eb" : "#f3f4f6",
                    color: ativo ? "#fff" : "#374151",
                  }}
                >
                  {icone} {nome}
                </Link>
              )
            })}
          </div>
        </section>

        {/* CABEÇALHO */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.titulo}>
              📊 Financeiro
            </h1>

            <p style={styles.subtitulo}>
              Extrato financeiro da imobiliária
            </p>
          </div>

          <button
            onClick={carregarDados}
            disabled={loading}
            style={styles.botaoAtualizar}
          >
            {loading ? "Atualizando..." : "↻ Atualizar"}
          </button>
        </header>

        {/* SALDO */}
        <section style={styles.saldoBox}>
          <span style={styles.label}>
            SALDO ATUAL
          </span>

          <div
            style={{
              ...styles.saldo,
              color: saldoAtual >= 0 ? "#111827" : "#dc2626",
            }}
          >
            {moeda(saldoAtual)}
          </div>

          <div style={styles.resumos}>
            <div>
              <span style={styles.label}>
                🟢 Entradas
              </span>
              <strong style={{ color: "#16a34a" }}>
                {moeda(entradas)}
              </strong>
            </div>

            <div>
              <span style={styles.label}>
                🔴 Saídas
              </span>
              <strong style={{ color: "#dc2626" }}>
                {moeda(saidas)}
              </strong>
            </div>

            <div>
              <span style={styles.label}>
                Saldo do período
              </span>
              <strong>
                {moeda(saldoPeriodo)}
              </strong>
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <section style={styles.filtros}>
          <div>
            <label style={styles.label}>
              Mês
            </label>

            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              style={styles.select}
            >
              {meses.map((nome, i) => (
                <option key={i + 1} value={i + 1}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Ano
            </label>

            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              style={styles.select}
            >
              {Array.from({ length: 7 }, (_, i) => hoje.getFullYear() - 3 + i).map(
                (a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                )
              )}
            </select>
          </div>

          <div style={styles.periodo}>
            Exibindo:{" "}
            <strong>
              {meses[mes - 1]} de {ano}
            </strong>
          </div>
        </section>

        {erro && (
          <div style={styles.erro}>
            {erro}
          </div>
        )}

        {/* EXTRATO */}
        <section style={styles.extratoBox}>
          <div style={styles.extratoTitulo}>
            <h2>Extrato</h2>
            <p>
              Movimentações realizadas no período
            </p>
          </div>

          {loading ? (
            <div style={styles.vazio}>
              Carregando extrato...
            </div>
          ) : extrato.length === 0 ? (
            <div style={styles.vazio}>
              <div style={{ fontSize: 40 }}>
                🧾
              </div>

              <strong>
                Nenhuma movimentação encontrada
              </strong>

              <p>
                Não existem entradas ou saídas pagas
                neste período.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Movimento</th>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Descrição</th>
                    <th style={styles.th}>Categoria</th>
                    <th style={styles.th}>Pagamento</th>
                    <th style={styles.thRight}>Valor</th>
                    <th style={styles.thRight}>Saldo</th>
                  </tr>
                </thead>

                <tbody>
                  {extrato.map((x) => {
                    const entrada = x.tipo === "entrada"

                    return (
                      <tr key={x.id}>
                        <td style={styles.td}>
                          <strong
                            style={{
                              color: entrada
                                ? "#15803d"
                                : "#dc2626",
                            }}
                          >
                            {entrada ? "🟢 ENTRADA" : "🔴 SAÍDA"}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {dataBR(x.data)}
                        </td>

                        <td style={styles.td}>
                          <strong>{x.descricao}</strong>
                        </td>

                        <td style={styles.td}>
                          {x.categoria}
                        </td>

                        <td style={styles.td}>
                          {x.forma}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "right",
                            fontWeight: 700,
                            color: entrada
                              ? "#16a34a"
                              : "#dc2626",
                          }}
                        >
                          {entrada ? "+" : "-"} {moeda(x.valor)}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {moeda(x.saldo)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && extrato.length > 0 && (
            <div style={styles.rodape}>
              <span>
                Saldo anterior:{" "}
                <strong>{moeda(saldoAnterior)}</strong>
              </span>

              <span style={{ color: "#15803d" }}>
                🟢 Entradas:{" "}
                <strong>{moeda(entradas)}</strong>
              </span>

              <span style={{ color: "#dc2626" }}>
                🔴 Saídas:{" "}
                <strong>{moeda(saidas)}</strong>
              </span>

              <span>
                Saldo final:{" "}
                <strong>{moeda(saldoPeriodo)}</strong>
              </span>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "#f5f7fa",
    padding: "24px",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#1f2937",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  acessoBox: {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  acessoTitulo: {
    margin: "0 0 14px",
    fontSize: "16px",
  },

  acessos: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  acesso: {
    padding: "10px 14px",
    borderRadius: "9px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    border: "1px solid #e5e7eb",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  titulo: {
    margin: 0,
    fontSize: "30px",
  },

  subtitulo: {
    margin: "5px 0 0",
    color: "#6b7280",
  },

  botaoAtualizar: {
    border: "none",
    borderRadius: "9px",
    padding: "11px 18px",
    background: "#111827",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  saldoBox: {
    background: "#fff",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  label: {
    display: "block",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "6px",
  },

  saldo: {
    fontSize: "40px",
    fontWeight: 800,
    marginBottom: "22px",
  },

  resumos: {
    display: "flex",
    gap: "35px",
    flexWrap: "wrap",
  },

  filtros: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "flex-end",
    gap: "14px",
    flexWrap: "wrap",
  },

  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    minWidth: "140px",
  },

  periodo: {
    paddingBottom: "10px",
    color: "#6b7280",
  },

  erro: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "20px",
  },

  extratoBox: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },

  extratoTitulo: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
  },

  vazio: {
    padding: "50px 20px",
    textAlign: "center",
    color: "#6b7280",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "950px",
  },

  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    color: "#6b7280",
    background: "#f9fafb",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  thRight: {
    padding: "14px 16px",
    textAlign: "right",
    fontSize: "12px",
    color: "#6b7280",
    background: "#f9fafb",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px 16px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  rodape: {
    padding: "18px 20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    background: "#fafafa",
  },
}