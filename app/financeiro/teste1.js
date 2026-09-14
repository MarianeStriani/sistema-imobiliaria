"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Financeiro() {
  const hoje = new Date()

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const [recebimentos, setRecebimentos] = useState([])
  const [contratos, setContratos] = useState([])
  const [carregando, setCarregando] = useState(true)

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

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)

    const [
      recebimentosResult,
      contratosResult
    ] = await Promise.all([
      supabase
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
            tipo,
            termino
          )
        `)
        .order("data_recebimento", {
          ascending: false
        }),

      supabase
        .from("contratos")
        .select("*")
        .order("termino", {
          ascending: true
        })
    ])

    if (recebimentosResult.error) {
      console.error(
        "Erro ao buscar recebimentos:",
        recebimentosResult.error
      )

      alert(
        "Erro ao carregar os recebimentos: " +
        recebimentosResult.error.message
      )
    }

    if (contratosResult.error) {
      console.error(
        "Erro ao buscar contratos:",
        contratosResult.error
      )

      alert(
        "Erro ao carregar os contratos: " +
        contratosResult.error.message
      )
    }

    setRecebimentos(
      recebimentosResult.data || []
    )

    setContratos(
      contratosResult.data || []
    )

    setCarregando(false)
  }

  /*
   * RECEBIMENTOS DO MÊS SELECIONADO
   */

  const recebimentosDoMes = useMemo(() => {
    return recebimentos.filter((item) => {
      if (!item.data_recebimento) {
        return false
      }

      const data = new Date(
        item.data_recebimento + "T00:00:00"
      )

      return (
        data.getMonth() + 1 === Number(mes) &&
        data.getFullYear() === Number(ano)
      )
    })
  }, [recebimentos, mes, ano])

  /*
   * CONTRATOS QUE TERMINAM NO MÊS
   */

  const contratosVencendo = useMemo(() => {
    return contratos
      .filter((contrato) => {
        if (!contrato.termino) {
          return false
        }

        const data = new Date(
          contrato.termino + "T00:00:00"
        )

        return (
          data.getMonth() + 1 === Number(mes) &&
          data.getFullYear() === Number(ano)
        )
      })
      .sort((a, b) => {
        return (
          new Date(a.termino) -
          new Date(b.termino)
        )
      })
  }, [contratos, mes, ano])

  /*
   * PAGOS E PENDENTES
   */

  const pagos = recebimentosDoMes.filter(
    (item) => item.status === "Pago"
  )

  const pendentes = recebimentosDoMes.filter(
    (item) => item.status === "Pendente"
  )

  /*
   * SOMAS
   */

  function somar(lista) {
    return lista.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    )
  }

  const totalPago = somar(pagos)

  const totalPendente = somar(pendentes)

  const totalMes =
    totalPago + totalPendente

  /*
   * CATEGORIAS
   */

  function valorCategoria(
    categoria,
    status = "Pago"
  ) {
    return recebimentosDoMes
      .filter((item) => {
        return (
          item.categoria === categoria &&
          item.status === status
        )
      })
      .reduce(
        (total, item) =>
          total + Number(item.valor || 0),
        0
      )
  }

  const aluguelPago =
    valorCategoria("Locação", "Pago")

  const vendasPago =
    valorCategoria(
      "Compra e Venda",
      "Pago"
    )

  const temporadaPago =
    valorCategoria(
      "Temporada",
      "Pago"
    )

  const administracaoPago =
    valorCategoria(
      "Administração",
      "Pago"
    )

  /*
   * FORMATAÇÕES
   */

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
    if (!data) {
      return "-"
    }

    return new Date(
      data + "T00:00:00"
    ).toLocaleDateString("pt-BR")
  }

  /*
   * NAVEGAÇÃO DOS MESES
   */

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

  function irParaMesAtual() {
    setMes(hoje.getMonth() + 1)
    setAno(hoje.getFullYear())
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
          onClick={carregarDados}
        >
          Atualizar
        </button>

      </div>

      {/* ACESSO RÁPIDO */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Acesso rápido
          </h5>

          <div className="row g-2">

            <div className="col-6 col-md-3">
              <a
                href="/recebimentos"
                className="btn btn-success w-100 py-2"
              >
                + Recebimento
              </a>
            </div>

            <div className="col-6 col-md-3">
              <a
                href="/contratos"
                className="btn btn-primary w-100 py-2"
              >
                Contratos
              </a>
            </div>

            <div className="col-6 col-md-3">
              <a
                href="/clientes"
                className="btn btn-outline-primary w-100 py-2"
              >
                Clientes
              </a>
            </div>

            <div className="col-6 col-md-3">
              <a
                href="/"
                className="btn btn-outline-secondary w-100 py-2"
              >
                Dashboard
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* SELEÇÃO DO MÊS */}

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
                  setMes(
                    Number(e.target.value)
                  )
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
                  setAno(
                    Number(e.target.value)
                  )
                }
              >

                {Array.from(
                  { length: 11 },
                  (_, index) =>
                    hoje.getFullYear() -
                    5 +
                    index
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
                  ← Anterior
                </button>

                <button
                  className="btn btn-outline-primary"
                  onClick={irParaMesAtual}
                >
                  Mês atual
                </button>

                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={proximoMes}
                >
                  Próximo →
                </button>

              </div>

            </div>

          </div>

          <div className="text-center mt-4">

            <h2 className="fw-bold mb-0">
              {nomesMeses[Number(mes) - 1]} / {ano}
            </h2>

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
            Carregando informações financeiras...
          </p>

        </div>

      ) : (

        <>

          {/* CARDS PRINCIPAIS */}

          <div className="row g-3 mb-5">

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
                    {pagos.length} recebimento(s) pago(s)
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

          {/* RECEBIDOS POR CATEGORIA */}

          <h4 className="fw-bold mb-3">
            Valores recebidos por categoria
          </h4>

          <div className="row g-3 mb-5">

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Aluguéis
                  </h5>

                  <p className="text-muted mb-1">
                    Locação
                  </p>

                  <h3 className="fw-bold text-success">
                    {moeda(aluguelPago)}
                  </h3>

                </div>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Vendas
                  </h5>

                  <p className="text-muted mb-1">
                    Compra e Venda
                  </p>

                  <h3 className="fw-bold text-success">
                    {moeda(vendasPago)}
                  </h3>

                </div>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Temporadas
                  </h5>

                  <p className="text-muted mb-1">
                    Temporada
                  </p>

                  <h3 className="fw-bold text-success">
                    {moeda(temporadaPago)}
                  </h3>

                </div>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold">
                    Administração
                  </h5>

                  <p className="text-muted mb-1">
                    Administração
                  </p>

                  <h3 className="fw-bold text-success">
                    {moeda(administracaoPago)}
                  </h3>

                </div>

              </div>

            </div>

          </div>

          {/* ÚLTIMOS RECEBIMENTOS */}

          <div className="card shadow-sm mb-5">

            <div className="card-header d-flex justify-content-between align-items-center">

              <h5 className="mb-0 fw-bold">
                Últimos recebimentos
              </h5>

              <span className="badge bg-success">
                {pagos.length} pago(s)
              </span>

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
                    </tr>

                  </thead>

                  <tbody>

                    {pagos.length === 0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="text-center text-muted py-4"
                        >
                          Nenhum recebimento pago neste mês.
                        </td>

                      </tr>

                    ) : (

                      pagos
                        .slice(0, 10)
                        .map((item) => (

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

                            <td className="fw-bold text-success">
                              {moeda(item.valor)}
                            </td>

                          </tr>

                        ))

                    )}

                  </tbody>

                </table>

              </div>

              {pagos.length > 0 && (

                <a
                  href="/recebimentos"
                  className="btn btn-outline-success"
                >
                  Ver todos os recebimentos
                </a>

              )}

            </div>

          </div>

          {/* CONTRATOS VENCENDO */}

          <div className="card shadow-sm mb-5">

            <div className="card-header">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <h5 className="mb-1 fw-bold">
                    Contratos que vencem no mês
                  </h5>

                  <small className="text-muted">
                    {nomesMeses[Number(mes) - 1]} / {ano}
                  </small>

                </div>

                <span className="badge bg-danger">
                  {contratosVencendo.length} contrato(s)
                </span>

              </div>

            </div>

            <div className="card-body">

              {contratosVencendo.length === 0 ? (

                <div className="text-center text-muted py-4">

                  <h5>
                    Nenhum contrato vence neste mês.
                  </h5>

                  <p className="mb-0">
                    Não existem contratos com data de término em{" "}
                    {nomesMeses[Number(mes) - 1]} / {ano}.
                  </p>

                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead>

                      <tr>
                        <th>Vencimento</th>
                        <th>Nº contrato</th>
                        <th>Imóvel</th>
                        <th>Cliente</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {contratosVencendo.map(
                        (contrato) => (

                          <tr key={contrato.id}>

                            <td className="fw-bold text-danger">
                              {formatarData(
                                contrato.termino
                              )}
                            </td>

                            <td>
                              {contrato.numero ||
                                "-"}
                            </td>

                            <td>
                              {contrato.imovel ||
                                "-"}
                            </td>

                            <td>
                              {contrato.cliente ||
                                "-"}
                            </td>

                            <td>
                              {contrato.tipo ||
                                "-"}
                            </td>

                            <td className="fw-bold">
                              {moeda(
                                contrato.valor
                              )}
                            </td>

                            <td>

                              <span
                                className={
                                  contrato.status ===
                                  "Ativo"
                                    ? "badge bg-success"
            : "badge bg-secondary"
                                }
                              >
                                {contrato.status ||
                                  "-"}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

              <div className="mt-3">

                <a
                  href="/contratos"
                  className="btn btn-outline-primary"
                >
                  Ver contratos
                </a>

              </div>

            </div>

          </div>

          {/* TODOS OS LANÇAMENTOS DO MÊS */}

          <div className="card shadow-sm">

            <div className="card-header">

              <h5 className="mb-0 fw-bold">
                Todos os lançamentos do mês
              </h5>

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
                                  item.status ===
                                  "Pago"
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