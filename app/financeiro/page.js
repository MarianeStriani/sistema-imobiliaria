"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Financeiro() {
  const hoje = new Date()

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const [recebimentos, setRecebimentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarRecebimentos()
  }, [])

  async function carregarRecebimentos() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("recebimentos")
      .select(`
        *,
        clientes (
          nome
        ),
        contratos (
          numero,
          imovel,
          cliente,
          tipo
        )
      `)
      .order("data_recebimento", {
        ascending: false
      })

    if (error) {
      console.error("Erro ao buscar recebimentos:", error)
      alert("Erro ao carregar os dados financeiros.")
      setRecebimentos([])
    } else {
      setRecebimentos(data || [])
    }

    setCarregando(false)
  }

  const nomesMeses = [
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
    "Dezembro"
  ]

  const recebimentosDoMes = useMemo(() => {
    return recebimentos.filter((item) => {
      if (!item.data_recebimento) return false

      const data = new Date(
        item.data_recebimento + "T00:00:00"
      )

      return (
        data.getMonth() + 1 === Number(mes) &&
        data.getFullYear() === Number(ano)
      )
    })
  }, [recebimentos, mes, ano])

  const pagos = recebimentosDoMes.filter(
    (item) => item.status === "Pago"
  )

  const pendentes = recebimentosDoMes.filter(
    (item) => item.status === "Pendente"
  )

  function somar(lista) {
    return lista.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    )
  }

  function somarCategoria(categoria, status = null) {
    return recebimentosDoMes
      .filter((item) => {
        const mesmaCategoria =
          item.categoria === categoria

        if (!status) {
          return mesmaCategoria
        }

        return (
          mesmaCategoria &&
          item.status === status
        )
      })
      .reduce(
        (total, item) =>
          total + Number(item.valor || 0),
        0
      )
  }

  const totalPago = somar(pagos)
  const totalPendente = somar(pendentes)
  const totalMes = totalPago + totalPendente

  const aluguelPago =
    somarCategoria("Locação", "Pago")

  const aluguelPendente =
    somarCategoria("Locação", "Pendente")

  const vendasPago =
    somarCategoria("Compra e Venda", "Pago")

  const vendasPendente =
    somarCategoria("Compra e Venda", "Pendente")

  const temporadaPago =
    somarCategoria("Temporada", "Pago")

  const temporadaPendente =
    somarCategoria("Temporada", "Pendente")

  const administracaoPago =
    somarCategoria("Administração", "Pago")

  const administracaoPendente =
    somarCategoria("Administração", "Pendente")

  function moeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    )
  }

  function formatarData(data) {
    if (!data) return "-"

    return new Date(
      data + "T00:00:00"
    ).toLocaleDateString("pt-BR")
  }

  function mesAnterior() {
    if (Number(mes) === 1) {
      setMes(12)
      setAno(Number(ano) - 1)
    } else {
      setMes(Number(mes) - 1)
    }
  }

  function proximoMes() {
    if (Number(mes) === 12) {
      setMes(1)
      setAno(Number(ano) + 1)
    } else {
      setMes(Number(mes) + 1)
    }
  }

  return (
    <main className="container-fluid py-4">

      {/* CABEÇALHO */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h1 className="fw-bold mb-1">
            Financeiro
          </h1>

          <p className="text-muted mb-0">
            Controle financeiro mensal
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={carregarRecebimentos}
        >
          Atualizar
        </button>

      </div>

      {/* SELETOR DE MÊS */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <div className="row align-items-end g-3">

            <div className="col-md-4">

              <label className="form-label fw-bold">
                Mês
              </label>

              <select
                className="form-select"
                value={mes}
                onChange={(e) =>
                  setMes(Number(e.target.value))
                }
              >
                {nomesMeses.map(
                  (nome, index) => (
                    <option
                      key={index + 1}
                      value={index + 1}
                    >
                      {nome}
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="col-md-3">

              <label className="form-label fw-bold">
                Ano
              </label>

              <select
                className="form-select"
                value={ano}
                onChange={(e) =>
                  setAno(Number(e.target.value))
                }
              >
                {Array.from(
                  { length: 11 },
                  (_, index) =>
                    hoje.getFullYear() - 5 + index
                ).map((valorAno) => (
                  <option
                    key={valorAno}
                    value={valorAno}
                  >
                    {valorAno}
                  </option>
                ))}
              </select>

            </div>

            <div className="col-md-5">

              <div className="d-flex gap-2">

                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={mesAnterior}
                >
                  ← Mês anterior
                </button>

                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={proximoMes}
                >
                  Próximo mês →
                </button>

              </div>

            </div>

          </div>

          <div className="text-center mt-4">

            <h3 className="fw-bold mb-0">
              {nomesMeses[Number(mes) - 1]} / {ano}
            </h3>

          </div>

        </div>

      </div>

      {carregando ? (

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="text-muted mt-3">
            Carregando financeiro...
          </p>

        </div>

      ) : (

        <>

          {/* RESUMO */}

          <div className="row g-3 mb-4">

            <div className="col-md-4">

              <div className="card shadow-sm border-success border-3 h-100">

                <div className="card-body">

                  <p className="text-muted mb-1">
                    Total recebido
                  </p>

                  <h2 className="fw-bold text-success">
                    {moeda(totalPago)}
                  </h2>

                  <small className="text-muted">
                    {pagos.length} pagamento(s)
                  </small>

                </div>

              </div>

            </div>

            <div className="col-md-4">

              <div className="card shadow-sm border-warning border-3 h-100">

                <div className="card-body">

                  <p className="text-muted mb-1">
                    Total pendente
                  </p>

                  <h2 className="fw-bold text-warning">
                    {moeda(totalPendente)}
                  </h2>

                  <small className="text-muted">
                    {pendentes.length} pendência(s)
                  </small>

                </div>

              </div>

            </div>

            <div className="col-md-4">

              <div className="card shadow-sm border-primary border-3 h-100">

                <div className="card-body">

                  <p className="text-muted mb-1">
                    Total do mês
                  </p>

                  <h2 className="fw-bold text-primary">
                    {moeda(totalMes)}
                  </h2>

                  <small className="text-muted">
                    Recebido + pendente
                  </small>

                </div>

              </div>

            </div>

          </div>

          {/* CATEGORIAS */}

          <h4 className="fw-bold mb-3">
            Resumo por categoria
          </h4>

          <div className="row g-3 mb-5">

            {/* LOCAÇÃO */}

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Aluguéis
                  </h5>

                  <p className="mb-1 text-success">
                    Recebido
                  </p>

                  <h4 className="fw-bold">
                    {moeda(aluguelPago)}
                  </h4>

                  <p className="mb-1 text-warning">
                    Pendente
                  </p>

                  <h5>
                    {moeda(aluguelPendente)}
                  </h5>

                </div>

              </div>

            </div>

            {/* VENDAS */}

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Vendas
                  </h5>

                  <p className="mb-1 text-success">
                    Recebido
                  </p>

                  <h4 className="fw-bold">
                    {moeda(vendasPago)}
                  </h4>

                  <p className="mb-1 text-warning">
                    Pendente
                  </p>

                  <h5>
                    {moeda(vendasPendente)}
                  </h5>

                </div>

              </div>

            </div>

            {/* TEMPORADA */}

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Temporadas
                  </h5>

                  <p className="mb-1 text-success">
                    Recebido
                  </p>

                  <h4 className="fw-bold">
                    {moeda(temporadaPago)}
                  </h4>

                  <p className="mb-1 text-warning">
                    Pendente
                  </p>

                  <h5>
                    {moeda(temporadaPendente)}
                  </h5>

                </div>

              </div>

            </div>

            {/* ADMINISTRAÇÃO */}

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Administração
                  </h5>

                  <p className="mb-1 text-success">
                    Recebido
                  </p>

                  <h4 className="fw-bold">
                    {moeda(administracaoPago)}
                  </h4>

                  <p className="mb-1 text-warning">
                    Pendente
                  </p>

                  <h5>
                    {moeda(administracaoPendente)}
                  </h5>

                </div>

              </div>

            </div>

          </div>

          {/* LANÇAMENTOS */}

          <div className="card shadow-sm">

            <div className="card-header">

              <div className="d-flex justify-content-between align-items-center">

                <h5 className="mb-0 fw-bold">
                  Lançamentos de {nomesMeses[Number(mes) - 1]} / {ano}
                </h5>

                <span className="badge bg-primary">
                  {recebimentosDoMes.length} lançamento(s)
                </span>

              </div>

            </div>

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>

                    <tr>
                      <th>Data</th>
                      <th>Cliente</th>
                      <th>Contrato</th>
                      <th>Categoria</th>
                      <th>Forma</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {recebimentosDoMes.length === 0 ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="text-center text-muted py-5"
                        >
                          Nenhum lançamento encontrado neste mês.
                        </td>

                      </tr>

                    ) : (

                      recebimentosDoMes.map(
                        (item) => (

                          <tr key={item.id}>

                            <td>
                              {formatarData(
                                item.data_recebimento
                              )}
                            </td>

                            <td>
                              {item.clientes?.nome ||
                                "-"}
                            </td>

                            <td>
                              {item.contratos?.numero ||
                                "-"}
                            </td>

                            <td>
                              {item.categoria}
                            </td>

                            <td>
                              {item.forma_pagamento ||
                                "-"}
                            </td>

                            <td className="fw-bold">
                              {moeda(item.valor)}
                            </td>

                            <td>

                              <span
                                className={
                                  item.status === "Pago"
                                    ? "badge bg-success"
                                    : "badge bg-warning text-dark"
                                }
                              >
                                {item.status}
                              </span>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </>

      )}

    </main>
  )
}