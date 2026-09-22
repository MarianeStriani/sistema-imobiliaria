```javascript
"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Financeiro() {
  const hoje = new Date()

  const [mes, setMes] = useState(
    hoje.getMonth() + 1
  )

  const [ano, setAno] = useState(
    hoje.getFullYear()
  )

  const [recebimentos, setRecebimentos] = useState([])
  const [despesas, setDespesas] = useState([])

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

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

  async function carregarDados() {
    setLoading(true)
    setErro("")

    try {
      const [
        recebimentosResult,
        despesasResult,
      ] = await Promise.all([
        supabase
          .from("recebimentos")
          .select("*"),

        supabase
          .from("despesas")
          .select("*"),
      ])

      if (recebimentosResult.error) {
        throw recebimentosResult.error
      }

      if (despesasResult.error) {
        throw despesasResult.error
      }

      setRecebimentos(
        recebimentosResult.data || []
      )

      setDespesas(
        despesasResult.data || []
      )
    } catch (error) {
      console.error(
        "Erro ao carregar dados financeiros:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar os dados financeiros."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  function numero(valor) {
    const n = Number(valor)

    return Number.isNaN(n) ? 0 : n
  }

  function pago(status) {
    const s = String(status || "")
      .trim()
      .toLowerCase()

    return [
      "pago",
      "recebido",
      "confirmado",
      "realizado",
    ].includes(s)
  }

  function dataValida(data) {
    if (!data) {
      return false
    }

    const dataConvertida =
      new Date(`${data}T00:00:00`)

    return !Number.isNaN(
      dataConvertida.getTime()
    )
  }

  function dataBR(data) {
    if (!dataValida(data)) {
      return "-"
    }

    return new Date(
      `${data}T00:00:00`
    ).toLocaleDateString("pt-BR")
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  const movimentos = useMemo(() => {
    const entradas = recebimentos
      .filter(
        (item) =>
          pago(item.status) &&
          dataValida(item.data_recebimento)
      )
      .map((item) => ({
        id: `e-${item.id}`,
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
          "-",
        valor: numero(item.valor),
        criado: item.created_at || "",
      }))

    const saidas = despesas
      .filter(
        (item) =>
          pago(item.status) &&
          dataValida(item.data_despesa)
      )
      .map((item) => ({
        id: `s-${item.id}`,
        tipo: "saida",
        data: item.data_despesa,
        descricao:
          item.descricao ||
          item.observacoes ||
          item["observações"] ||
          "Despesa",
        categoria:
          item.categoria ||
          "Despesa",
        forma:
          item.forma_pagamento ||
          "-",
        valor: numero(item.valor),
        criado: item.created_at || "",
      }))

    return [
      ...entradas,
      ...saidas,
    ]
  }, [
    recebimentos,
    despesas,
  ])

  const saldoAtual = useMemo(() => {
    return movimentos.reduce(
      (saldo, movimento) =>
        movimento.tipo === "entrada"
          ? saldo + movimento.valor
          : saldo - movimento.valor,
      0
    )
  }, [movimentos])

  const periodo = useMemo(() => {
    return movimentos.filter(
      (movimento) => {
        const data =
          new Date(
            `${movimento.data}T00:00:00`
          )

        return (
          data.getMonth() + 1 === mes &&
          data.getFullYear() === ano
        )
      }
    )
  }, [
    movimentos,
    mes,
    ano,
  ])

  const saldoAnterior = useMemo(() => {
    const inicio =
      new Date(
        ano,
        mes - 1,
        1
      )

    return movimentos.reduce(
      (saldo, movimento) => {
        const data =
          new Date(
            `${movimento.data}T00:00:00`
          )

        if (data < inicio) {
          return movimento.tipo === "entrada"
            ? saldo + movimento.valor
            : saldo - movimento.valor
        }

        return saldo
      },
      0
    )
  }, [
    movimentos,
    mes,
    ano,
  ])

  const extrato = useMemo(() => {
    const lista = [
      ...periodo,
    ].sort((a, b) => {
      const dataA =
        new Date(
          `${a.data}T00:00:00`
        ).getTime()

      const dataB =
        new Date(
          `${b.data}T00:00:00`
        ).getTime()

      if (dataA !== dataB) {
        return dataA - dataB
      }

      return String(a.criado).localeCompare(
        String(b.criado)
      )
    })

    let saldo = saldoAnterior

    return lista
      .map((movimento) => {
        saldo =
          movimento.tipo === "entrada"
            ? saldo + movimento.valor
            : saldo - movimento.valor

        return {
          ...movimento,
          saldo,
        }
      })
      .reverse()
  }, [
    periodo,
    saldoAnterior,
  ])

  const entradas = periodo
    .filter(
      (item) =>
        item.tipo === "entrada"
    )
    .reduce(
      (total, item) =>
        total + item.valor,
      0
    )

  const saidas = periodo
    .filter(
      (item) =>
        item.tipo === "saida"
    )
    .reduce(
      (total, item) =>
        total + item.valor,
      0
    )

  const saldoPeriodo =
    saldoAnterior +
    entradas -
    saidas

  function fecharMensagemErro() {
    setErro("")
  }

  function fecharMensagemSucesso() {
    setSucesso("")
  }

  function acessarPagina(url) {
    window.location.href = url
  }

  return (
    <div className="container-fluid py-4">

      {/* ACESSO RÁPIDO */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex align-items-center mb-3">
            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{
                width: "38px",
                height: "38px",
              }}
            >
              <i className="bi bi-lightning-charge text-primary"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>
            </div>
          </div>

          <div className="row g-2">

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/")
                }
              >
                <i className="bi bi-speedometer2 d-block fs-5 mb-1"></i>
                Dashboard
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/clientes")
                }
              >
                <i className="bi bi-people d-block fs-5 mb-1"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/imoveis")
                }
              >
                <i className="bi bi-house-door d-block fs-5 mb-1"></i>
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/contratos")
                }
              >
                <i className="bi bi-file-earmark-text d-block fs-5 mb-1"></i>
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/recebimentos")
                }
              >
                <i className="bi bi-cash-coin d-block fs-5 mb-1"></i>
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/despesas")
                }
              >
                <i className="bi bi-wallet2 d-block fs-5 mb-1"></i>
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/financeiro")
                }
              >
                <i className="bi bi-bar-chart-line d-block fs-5 mb-1"></i>
                Financeiro
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            ImobGest - Financeiro
          </h2>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            className="btn btn-outline-primary"
            onClick={carregarDados}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>

            {loading
              ? "Atualizando..."
              : "Atualizar"}
          </button>
        </div>

      </div>

      {/* MENSAGEM DE ERRO */}
      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>

          {erro}

          <button
            type="button"
            className="btn-close"
            onClick={fecharMensagemErro}
            aria-label="Fechar"
          ></button>
        </div>
      )}

      {/* MENSAGEM DE SUCESSO */}
      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle me-2"></i>

          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={fecharMensagemSucesso}
            aria-label="Fechar"
          ></button>
        </div>
      )}

      {/* RESUMO FINANCEIRO */}
      <div className="row g-3 mb-4">

        {/* SALDO ATUAL */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Saldo atual
                  </p>

                  <h3 className="fw-bold mb-0">
                    {moeda(saldoAtual)}
                  </h3>
                </div>

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-wallet2 text-primary fs-4"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ENTRADAS */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Entradas
                  </p>

                  <h3 className="fw-bold text-success mb-0">
                    {moeda(entradas)}
                  </h3>
                </div>

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-down-left text-success fs-4"></i>
                </div>

              </div>

              <small className="text-muted">
                {meses[mes - 1]} de {ano}
              </small>

            </div>
          </div>
        </div>

        {/* SAÍDAS */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Saídas
                  </p>

                  <h3 className="fw-bold text-danger mb-0">
                    {moeda(saidas)}
                  </h3>
                </div>

                <div
                  className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-up-right text-danger fs-4"></i>
                </div>

              </div>

              <small className="text-muted">
                {meses[mes - 1]} de {ano}
              </small>

            </div>
          </div>
        </div>

        {/* SALDO DO PERÍODO */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Saldo do período
                  </p>

                  <h3
                    className={`fw-bold mb-0 ${
                      saldoPeriodo >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {moeda(saldoPeriodo)}
                  </h3>
                </div>

                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    saldoPeriodo >= 0
                      ? "bg-success bg-opacity-10"
                      : "bg-danger bg-opacity-10"
                  }`}
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i
                    className={`bi bi-graph-up-arrow fs-4 ${
                      saldoPeriodo >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  ></i>
                </div>

              </div>

              <small className="text-muted">
                {meses[mes - 1]} de {ano}
              </small>

            </div>
          </div>
        </div>

      </div>

      {/* FILTRO DE PERÍODO */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{
                width: "38px",
                height: "38px",
              }}
            >
              <i className="bi bi-funnel text-primary"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Filtros
              </h5>

              <small className="text-muted">
                Selecione o período para consultar o financeiro
              </small>
            </div>

          </div>

          <div className="row g-3 align-items-end">

            <div className="col-12 col-md-6">

              <label
                htmlFor="mes"
                className="form-label fw-semibold"
              >
                Mês
              </label>

              <select
                id="mes"
                className="form-select"
                value={mes}
                onChange={(e) =>
                  setMes(
                    Number(e.target.value)
                  )
                }
              >
                {meses.map(
                  (nome, indice) => (
                    <option
                      key={indice + 1}
                      value={indice + 1}
                    >
                      {nome}
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="col-12 col-md-6">

              <label
                htmlFor="ano"
                className="form-label fw-semibold"
              >
                Ano
              </label>

              <select
                id="ano"
                className="form-select"
                value={ano}
                onChange={(e) =>
                  setAno(
                    Number(e.target.value)
                  )
                }
              >
                {[
                  ano - 2,
                  ano - 1,
                  ano,
                  ano + 1,
                  ano + 2,
                ].map(
                  (valorAno) => (
                    <option
                      key={valorAno}
                      value={valorAno}
                    >
                      {valorAno}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>

        </div>

      </div>

      {/* RESUMO DO PERÍODO */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Resumo financeiro
              </h5>

              <p className="text-muted mb-0">
                {meses[mes - 1]} de {ano}
              </p>
            </div>

            <span className="badge bg-light text-dark border">
              {periodo.length} movimentação
              {periodo.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          <div className="row g-3">

            <div className="col-12 col-md-4">

              <div className="border rounded p-3 h-100">

                <div className="d-flex align-items-center">

                  <div
                    className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <i className="bi bi-arrow-down-left text-success"></i>
                  </div>

                  <div>
                    <small className="text-muted d-block">
                      Total de entradas
                    </small>

                    <strong className="text-success">
                      {moeda(entradas)}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            <div className="col-12 col-md-4">

              <div className="border rounded p-3 h-100">

                <div className="d-flex align-items-center">

                  <div
                    className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <i className="bi bi-arrow-up-right text-danger"></i>
                  </div>

                  <div>
                    <small className="text-muted d-block">
                      Total de saídas
                    </small>

                    <strong className="text-danger">
                      {moeda(saidas)}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            <div className="col-12 col-md-4">

              <div className="border rounded p-3 h-100">

                <div className="d-flex align-items-center">

                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                      saldoPeriodo >= 0
                        ? "bg-success bg-opacity-10"
                        : "bg-danger bg-opacity-10"
                    }`}
                    style={{
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <i
                      className={`bi bi-cash-stack ${
                        saldoPeriodo >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    ></i>
                  </div>

                  <div>
                    <small className="text-muted d-block">
                      Resultado
                    </small>

                    <strong
                      className={
                        saldoPeriodo >= 0
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {moeda(
                        entradas - saidas
                      )}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* EXTRATO FINANCEIRO */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-list-ul text-primary me-2"></i>
                Extrato financeiro
              </h5>

              <small className="text-muted">
                Movimentações de{" "}
                {meses[mes - 1]} de {ano}
              </small>
            </div>

            <span className="badge bg-primary">
              {extrato.length} movimentação
              {extrato.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Carregando...
                </span>
              </div>

              <p className="text-muted mt-3 mb-0">
                Carregando informações financeiras...
              </p>

            </div>

          ) : extrato.length === 0 ? (

            <div className="text-center py-5">

              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "72px",
                  height: "72px",
                }}
              >
                <i className="bi bi-receipt text-muted fs-2"></i>
              </div>

              <h5 className="fw-bold">
                Nenhuma movimentação encontrada
              </h5>

              <p className="text-muted mb-0">
                Não existem entradas ou saídas
                registradas para{" "}
                {meses[mes - 1]} de {ano}.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      Data
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Descrição
                    </th>

                    <th>
                      Categoria
                    </th>

                    <th>
                      Forma de pagamento
                    </th>

                    <th className="text-end">
                      Valor
                    </th>

                    <th className="text-end">
                      Saldo
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {extrato.map(
                    (movimento) => (

                      <tr
                        key={
                          movimento.id
                        }
                      >

                        <td>

                          <span className="fw-semibold">
                            {dataBR(
                              movimento.data
                            )}
                          </span>

                        </td>

                        <td>

                          {movimento.tipo ===
                          "entrada" ? (

                            <span className="badge bg-success-subtle text-success">
                              <i className="bi bi-arrow-down-left me-1"></i>
                              Entrada
                            </span>

                          ) : (

                            <span className="badge bg-danger-subtle text-danger">
                              <i className="bi bi-arrow-up-right me-1"></i>
                              Saída
                            </span>

                          )}

                        </td>

                        <td>

                          <div className="d-flex align-items-center">

                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                movimento.tipo ===
                                "entrada"
                                  ? "bg-success bg-opacity-10"
                                  : "bg-danger bg-opacity-10"
                              }`}
                              style={{
                                width: "42px",
                                height: "42px",
                                minWidth: "42px",
                              }}
                            >
                              <i
                                className={`${
                                  movimento.tipo ===
                                  "entrada"
                                    ? "bi bi-arrow-down-left text-success"
                                    : "bi bi-arrow-up-right text-danger"
                                }`}
                              ></i>
                            </div>

                            <div>
                              <div className="fw-semibold">
                                {
                                  movimento.descricao
                                }
                              </div>
                            </div>

                          </div>

                        </td>

                        <td>
                          <span className="text-muted">
                            {
                              movimento.categoria
                            }
                          </span>
                        </td>

                        <td>
                          <span className="text-muted">
                            {
                              movimento.forma
                            }
                          </span>
                        </td>

                        <td className="text-end">

                          <span
                            className={`fw-bold ${
                              movimento.tipo ===
                              "entrada"
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {movimento.tipo ===
                            "entrada"
                              ? "+"
                              : "-"}{" "}
                            {moeda(
                              movimento.valor
                            )}
                          </span>

                        </td>

                        <td className="text-end">

                          <span
                            className={`fw-semibold ${
                              movimento.saldo >= 0
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {moeda(
                              movimento.saldo
                            )}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* RESUMO DE ENTRADAS E SAÍDAS */}
      <div className="row g-3 mb-4">

        {/* ENTRADAS */}
        <div className="col-12 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Entradas
                  </p>

                  <h3 className="fw-bold text-success mb-0">
                    {moeda(entradas)}
                  </h3>
                </div>

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-down-left text-success fs-4"></i>
                </div>

              </div>

              <small className="text-muted">
                Recebimentos no período
              </small>

            </div>

          </div>

        </div>

        {/* SAÍDAS */}
        <div className="col-12 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Saídas
                  </p>

                  <h3 className="fw-bold text-danger mb-0">
                    {moeda(saidas)}
                  </h3>
                </div>

                <div
                  className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-up-right text-danger fs-4"></i>
                </div>

              </div>

              <small className="text-muted">
                Despesas no período
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* RODAPÉ */}
      <div className="text-center text-muted py-3">

        <small>
          ImobGest
        </small>

        <br />

        <small>
          Dashboard atualizado em{" "}
          {hoje.toLocaleDateString(
            "pt-BR"
          )}
        </small>

      </div>

    </div>
  )
}
```
