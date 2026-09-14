"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

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

    const [recebimentosResult, despesasResult] =
      await Promise.all([
        supabase
          .from("recebimentos")
          .select("*"),

        supabase
          .from("despesas")
          .select("*"),
      ])

    if (recebimentosResult.error) {
      console.error(recebimentosResult.error)
      setErro(
        "Não foi possível carregar os recebimentos."
      )
      setLoading(false)
      return
    }

    if (despesasResult.error) {
      console.error(despesasResult.error)
      setErro(
        "Não foi possível carregar as despesas."
      )
      setLoading(false)
      return
    }

    setRecebimentos(
      recebimentosResult.data || []
    )

    setDespesas(
      despesasResult.data || []
    )

    setLoading(false)
  }

  function valorNumero(valor) {
    const numero = Number(valor)

    return Number.isNaN(numero) ? 0 : numero
  }

  function dataValida(data) {
    if (!data) return false

    const dataObj = new Date(
      `${data}T00:00:00`
    )

    return !Number.isNaN(
      dataObj.getTime()
    )
  }

  function formatarData(data) {
    if (!dataValida(data)) {
      return "-"
    }

    return new Date(
      `${data}T00:00:00`
    ).toLocaleDateString("pt-BR")
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  function statusPago(status) {
    const valor = String(status || "")
      .trim()
      .toLowerCase()

    return (
      valor === "pago" ||
      valor === "recebido" ||
      valor === "confirmado" ||
      valor === "realizado"
    )
  }

  /*
   * Junta recebimentos e despesas
   * em uma única lista de movimentações.
   */
  const todasMovimentacoes = useMemo(() => {
    const entradas = recebimentos
      .filter((item) =>
        statusPago(item.status)
      )
      .map((item) => ({
        id: `entrada-${item.id}`,
        tipo: "entrada",
        data: item.data_recebimento,
        descricao:
          item.descricao ||
          item.observacoes ||
          item["observações"] ||
          "Recebimento",
        categoria:
          item.categoria ||
          "Recebimento",
        forma:
          item.forma_pagamento ||
          item.formaPagamento ||
          "-",
        valor: valorNumero(item.valor),
        createdAt:
          item.created_at || "",
      }))

    const saidas = despesas
      .filter((item) =>
        statusPago(item.status)
      )
      .map((item) => ({
        id: `saida-${item.id}`,
        tipo: "saida",
        data: item.data_despesa,
        descricao:
          item.descricao ||
          item.observacoes ||
          item["observações"] ||
          item.categoria ||
          "Despesa",
        categoria:
          item.categoria ||
          "Despesa",
        forma:
          item.forma_pagamento ||
          item.formaPagamento ||
          "-",
        valor: valorNumero(item.valor),
        createdAt:
          item.created_at || "",
      }))

    return [
      ...entradas,
      ...saidas,
    ].filter((item) =>
      dataValida(item.data)
    )
  }, [
    recebimentos,
    despesas,
  ])

  /*
   * Saldo atual geral.
   */
  const saldoAtual = useMemo(() => {
    return todasMovimentacoes.reduce(
      (saldo, movimento) => {
        if (
          movimento.tipo === "entrada"
        ) {
          return (
            saldo + movimento.valor
          )
        }

        return (
          saldo - movimento.valor
        )
      },
      0
    )
  }, [todasMovimentacoes])

  /*
   * Movimentações do mês selecionado.
   */
  const movimentacoesPeriodo =
    useMemo(() => {
      return todasMovimentacoes.filter(
        (item) => {
          const data = new Date(
            `${item.data}T00:00:00`
          )

          return (
            data.getMonth() + 1 ===
              Number(mes) &&
            data.getFullYear() ===
              Number(ano)
          )
        }
      )
    }, [
      todasMovimentacoes,
      mes,
      ano,
    ])

  /*
   * Saldo existente antes do
   * primeiro dia do período.
   */
  const saldoAnterior = useMemo(() => {
    const primeiroDiaPeriodo =
      new Date(
        Number(ano),
        Number(mes) - 1,
        1
      )

    return todasMovimentacoes.reduce(
      (saldo, movimento) => {
        const dataMovimento =
          new Date(
            `${movimento.data}T00:00:00`
          )

        if (
          dataMovimento <
          primeiroDiaPeriodo
        ) {
          if (
            movimento.tipo ===
            "entrada"
          ) {
            return (
              saldo +
              movimento.valor
            )
          }

          return (
            saldo -
            movimento.valor
          )
        }

        return saldo
      },
      0
    )
  }, [
    todasMovimentacoes,
    mes,
    ano,
  ])

  /*
   * Calcula o saldo de cada
   * movimentação em ordem cronológica.
   */
  const extrato = useMemo(() => {
    const ordenadas = [
      ...movimentacoesPeriodo,
    ].sort((a, b) => {
      const dataA = new Date(
        `${a.data}T00:00:00`
      ).getTime()

      const dataB = new Date(
        `${b.data}T00:00:00`
      ).getTime()

      if (dataA !== dataB) {
        return dataA - dataB
      }

      return String(
        a.createdAt
      ).localeCompare(
        String(b.createdAt)
      )
    })

    let saldo = saldoAnterior

    return ordenadas.map(
      (movimento) => {
        if (
          movimento.tipo ===
          "entrada"
        ) {
          saldo += movimento.valor
        } else {
          saldo -= movimento.valor
        }

        return {
          ...movimento,
          saldo,
        }
      }
    )
  }, [
    movimentacoesPeriodo,
    saldoAnterior,
  ])

  /*
   * Exibe primeiro as
   * movimentações mais recentes.
   */
  const extratoExibicao =
    useMemo(() => {
      return [...extrato].reverse()
    }, [extrato])

  const totalEntradas =
    useMemo(() => {
      return movimentacoesPeriodo
        .filter(
          (item) =>
            item.tipo === "entrada"
        )
        .reduce(
          (total, item) =>
            total + item.valor,
          0
        )
    }, [movimentacoesPeriodo])

  const totalSaidas =
    useMemo(() => {
      return movimentacoesPeriodo
        .filter(
          (item) =>
            item.tipo === "saida"
        )
        .reduce(
          (total, item) =>
            total + item.valor,
          0
        )
    }, [movimentacoesPeriodo])

  const saldoFinalPeriodo =
    saldoAnterior +
    totalEntradas -
    totalSaidas

  const nomeMes =
    new Date(
      Number(ano),
      Number(mes) - 1,
      1
    ).toLocaleDateString(
      "pt-BR",
      {
        month: "long",
      }
    )

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "24px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#1f2937",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* BOTÃO TELA INICIAL */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#374151",
            background: "#ffffff",
            border:
              "1px solid #d1d5db",
            borderRadius: "8px",
            padding:
              "10px 15px",
            fontWeight: 600,
            fontSize: "14px",
            marginBottom: "18px",
          }}
        >
          🏠 Tela inicial
        </Link>

        {/* CABEÇALHO */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 700,
              }}
            >
              Financeiro
            </h1>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#6b7280",
                fontSize: "15px",
              }}
            >
              Extrato financeiro
              da imobiliária
            </p>
          </div>

          <button
            onClick={
              carregarDados
            }
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "8px",
              padding:
                "11px 18px",
              background:
                "#111827",
              color: "#ffffff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
            }}
          >
            {loading
              ? "Atualizando..."
              : "↻ Atualizar"}
          </button>
        </div>

        {/* SALDO ATUAL EM DESTAQUE */}
        <section
          style={{
            background:
              "#ffffff",
            borderRadius:
              "14px",
            padding: "28px",
            marginBottom:
              "20px",
            border:
              "1px solid #e5e7eb",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: 700,
              textTransform:
                "uppercase",
              letterSpacing:
                "0.5px",
            }}
          >
            Saldo atual
          </div>

          <div
            style={{
              fontSize: "40px",
              fontWeight: 800,
              marginTop: "8px",
              color:
                saldoAtual >= 0
                  ? "#111827"
                  : "#dc2626",
            }}
          >
            {formatarMoeda(
              saldoAtual
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "35px",
              flexWrap:
                "wrap",
              marginTop:
                "22px",
            }}
          >
            {/* ENTRADAS */}
            <div>
              <div
                style={{
                  color:
                    "#6b7280",
                  fontSize:
                    "13px",
                  marginBottom:
                    "5px",
                }}
              >
                🟢 Entradas
              </div>

              <strong
                style={{
                  color:
                    "#16a34a",
                  fontSize:
                    "18px",
                }}
              >
                {formatarMoeda(
                  totalEntradas
                )}
              </strong>
            </div>

            {/* SAÍDAS */}
            <div>
              <div
                style={{
                  color:
                    "#6b7280",
                  fontSize:
                    "13px",
                  marginBottom:
                    "5px",
                }}
              >
                🔴 Saídas
              </div>

              <strong
                style={{
                  color:
                    "#dc2626",
                  fontSize:
                    "18px",
                }}
              >
                {formatarMoeda(
                  totalSaidas
                )}
              </strong>
            </div>

            {/* SALDO DO PERÍODO */}
            <div>
              <div
                style={{
                  color:
                    "#6b7280",
                  fontSize:
                    "13px",
                  marginBottom:
                    "5px",
                }}
              >
                Saldo do período
              </div>

              <strong
                style={{
                  color:
                    saldoFinalPeriodo >=
                    0
                      ? "#111827"
                      : "#dc2626",
                  fontSize:
                    "18px",
                }}
              >
                {formatarMoeda(
                  saldoFinalPeriodo
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <section
          style={{
            background:
              "#ffffff",
            borderRadius:
              "12px",
            padding: "18px",
            marginBottom:
              "20px",
            border:
              "1px solid #e5e7eb",
            display: "flex",
            alignItems:
              "flex-end",
            gap: "14px",
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <label
              style={{
                display:
                  "block",
                fontSize:
                  "13px",
                fontWeight:
                  600,
                marginBottom:
                  "6px",
              }}
            >
              Mês
            </label>

            <select
              value={mes}
              onChange={(e) =>
                setMes(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              style={{
                padding:
                  "10px 12px",
                borderRadius:
                  "8px",
                border:
                  "1px solid #d1d5db",
                background:
                  "#ffffff",
                minWidth:
                  "150px",
              }}
            >
              {[
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
              ].map(
                (
                  nome,
                  index
                ) => (
                  <option
                    key={
                      index +
                      1
                    }
                    value={
                      index +
                      1
                    }
                  >
                    {nome}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              style={{
                display:
                  "block",
                fontSize:
                  "13px",
                fontWeight:
                  600,
                marginBottom:
                  "6px",
              }}
            >
              Ano
            </label>

            <select
              value={ano}
              onChange={(e) =>
                setAno(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              style={{
                padding:
                  "10px 12px",
                borderRadius:
                  "8px",
                border:
                  "1px solid #d1d5db",
                background:
                  "#ffffff",
                minWidth:
                  "120px",
              }}
            >
              {Array.from(
                {
                  length: 7,
                },
                (
                  _,
                  index
                ) =>
                  hoje.getFullYear() -
                  3 +
                  index
              ).map(
                (
                  anoOpcao
                ) => (
                  <option
                    key={
                      anoOpcao
                    }
                    value={
                      anoOpcao
                    }
                  >
                    {anoOpcao}
                  </option>
                )
              )}
            </select>
          </div>

          <div
            style={{
              color:
                "#6b7280",
              fontSize:
                "14px",
              paddingBottom:
                "10px",
            }}
          >
            Exibindo:{" "}
            <strong>
              {nomeMes
                .charAt(0)
                .toUpperCase() +
                nomeMes.slice(
                  1
                )}{" "}
              de {ano}
            </strong>
          </div>
        </section>

        {/* ERRO */}
        {erro && (
          <div
            style={{
              background:
                "#fef2f2",
              color:
                "#b91c1c",
              border:
                "1px solid #fecaca",
              borderRadius:
                "10px",
              padding:
                "14px 16px",
              marginBottom:
                "20px",
            }}
          >
            {erro}
          </div>
        )}

        {/* TABELA DO EXTRATO */}
        <section
          style={{
            background:
              "#ffffff",
            borderRadius:
              "14px",
            border:
              "1px solid #e5e7eb",
            overflow:
              "hidden",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize:
                  "20px",
              }}
            >
              Extrato
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color:
                  "#6b7280",
                fontSize:
                  "14px",
              }}
            >
              Movimentações
              realizadas
              no período
            </p>
          </div>

          {loading ? (
            <div
              style={{
                padding:
                  "50px",
                textAlign:
                  "center",
                color:
                  "#6b7280",
              }}
            >
              Carregando
              extrato...
            </div>
          ) : extratoExibicao.length ===
            0 ? (
            <div
              style={{
                padding:
                  "50px 20px",
                textAlign:
                  "center",
                color:
                  "#6b7280",
              }}
            >
              <div
                style={{
                  fontSize:
                    "40px",
                  marginBottom:
                    "10px",
                }}
              >
                🧾
              </div>

              <strong>
                Nenhuma
                movimentação
                encontrada
              </strong>

              <p
                style={{
                  marginTop:
                    "6px",
                }}
              >
                Não existem
                entradas ou
                saídas pagas
                neste período.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "950px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f9fafb",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <th
                      style={
                        thStyle
                      }
                    >
                      Movimento
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Data
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Descrição
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Categoria
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Forma de pagamento
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      Valor
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      Saldo
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {extratoExibicao.map(
                    (
                      movimento
                    ) => {
                      const entrada =
                        movimento.tipo ===
                        "entrada"

                      return (
                        <tr
                          key={
                            movimento.id
                          }
                          style={{
                            borderBottom:
                              "1px solid #f0f0f0",
                          }}
                        >
                          {/* ENTRADA / SAÍDA */}
                          <td
                            style={
                              tdStyle
                            }
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "9px",
                                fontWeight:
                                  700,
                                color:
                                  entrada
                                    ? "#15803d"
                                    : "#dc2626",
                              }}
                            >
                              <span
                                style={{
                                  width:
                                    "32px",
                                  height:
                                    "32px",
                                  borderRadius:
                                    "50%",
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  background:
                                    entrada
                                      ? "#dcfce7"
                                      : "#fee2e2",
                                  fontSize:
                                    "18px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                {entrada
                                  ? "↓"
                                  : "↑"}
                              </span>

                              {entrada
                                ? "ENTRADA"
                                : "SAÍDA"}
                            </div>
                          </td>

                          {/* DATA */}
                          <td
                            style={
                              tdStyle
                            }
                          >
                            {formatarData(
                              movimento.data
                            )}
                          </td>

                          {/* DESCRIÇÃO */}
                          <td
                            style={
                              tdStyle
                            }
                          >
                            <strong>
                              {
                                movimento.descricao
                              }
                            </strong>
                          </td>

                          {/* CATEGORIA */}
                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              movimento.categoria
                            }
                          </td>

                          {/* FORMA */}
                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              movimento.forma
                            }
                          </td>

                          {/* VALOR */}
                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "right",
                              fontWeight:
                                700,
                              color:
                                entrada
                                  ? "#16a34a"
                                  : "#dc2626",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {entrada
                              ? "+"
                              : "−"}{" "}
                            {formatarMoeda(
                              movimento.valor
                            )}
                          </td>

                          {/* SALDO */}
                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "right",
                              fontWeight:
                                700,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatarMoeda(
                              movimento.saldo
                            )}
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* RESUMO DO EXTRATO */}
          {!loading &&
            extratoExibicao.length >
              0 && (
              <div
                style={{
                  padding:
                    "18px 20px",
                  borderTop:
                    "1px solid #e5e7eb",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  flexWrap:
                    "wrap",
                  background:
                    "#fafafa",
                }}
              >
                <span
                  style={{
                    color:
                      "#6b7280",
                  }}
                >
                  Saldo anterior:{" "}
                  <strong>
                    {formatarMoeda(
                      saldoAnterior
                    )}
                  </strong>
                </span>

                <span
                  style={{
                    color:
                      "#15803d",
                  }}
                >
                  🟢 Entradas:{" "}
                  <strong>
                    {formatarMoeda(
                      totalEntradas
                    )}
                  </strong>
                </span>

                <span
                  style={{
                    color:
                      "#dc2626",
                  }}
                >
                  🔴 Saídas:{" "}
                  <strong>
                    {formatarMoeda(
                      totalSaidas
                    )}
                  </strong>
                </span>

                <span>
                  Saldo final:{" "}
                  <strong>
                    {formatarMoeda(
                      saldoFinalPeriodo
                    )}
                  </strong>
                </span>
              </div>
            )}
        </section>
      </div>
    </main>
  )
}

const thStyle = {
  padding:
    "14px 16px",
  textAlign:
    "left",
  fontSize:
    "12px",
  textTransform:
    "uppercase",
  letterSpacing:
    "0.4px",
  color:
    "#6b7280",
  fontWeight:
    700,
  whiteSpace:
    "nowrap",
}

const tdStyle = {
  padding:
    "15px 16px",
  fontSize:
    "14px",
  verticalAlign:
    "middle",
  whiteSpace:
    "nowrap",
}