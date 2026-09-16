"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Recebimentos() {
  const hoje = new Date()

  const [recebimentos, setRecebimentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [contratos, setContratos] = useState([])

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  const [mes, setMes] = useState(
    hoje.getMonth() + 1
  )

  const [ano, setAno] = useState(
    hoje.getFullYear()
  )

  const [busca, setBusca] = useState("")

  const [modalAberto, setModalAberto] =
    useState(false)

  const [recebimentoSelecionado, setRecebimentoSelecionado] =
    useState(null)

  const [formaPagamento, setFormaPagamento] =
    useState("")

  const [dataPagamento, setDataPagamento] =
    useState(
      hoje.toISOString().split("T")[0]
    )

  async function carregarDados() {
    setLoading(true)
    setErro("")

    try {
      const [
        recebimentosResult,
        clientesResult,
        contratosResult,
      ] = await Promise.all([
        supabase
          .from("recebimentos")
          .select("*")
          .order("data_vencimento", {
            ascending: true,
          }),

        supabase
          .from("clientes")
          .select("*")
          .order("id", {
            ascending: false,
          }),

        supabase
          .from("contratos")
          .select("*")
          .order("id", {
            ascending: false,
          }),
      ])

      if (recebimentosResult.error) {
        throw recebimentosResult.error
      }

      if (clientesResult.error) {
        throw clientesResult.error
      }

      if (contratosResult.error) {
        throw contratosResult.error
      }

      setRecebimentos(
        recebimentosResult.data || []
      )

      setClientes(
        clientesResult.data || []
      )

      setContratos(
        contratosResult.data || []
      )
    } catch (error) {
      console.error(
        "Erro ao carregar recebimentos:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar os recebimentos."
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

  function acessarPagina(url) {
    window.location.href = url
  }

  function formatarMoeda(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "R$ 0,00"
    }

    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  function formatarData(data) {
    if (!data) return "-"

    const partes = String(data).split("-")

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }

    return data
  }

  function obterMesAno(data) {
    if (!data) return null

    const partes = String(data).split("-")

    if (partes.length < 2) return null

    return {
      mes: Number(partes[1]),
      ano: Number(partes[0]),
    }
  }

  function nomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) => item.id === clienteId
    )

    return cliente?.nome || "Cliente não informado"
  }

  function contratoRelacionado(contratoId) {
    return contratos.find(
      (item) => item.id === contratoId
    )
  }
  const recebimentosDoPeriodo = useMemo(() => {
    return recebimentos.filter((recebimento) => {
      const dataReferencia =
        recebimento.data_vencimento ||
        recebimento.data_recebimento ||
        recebimento.data_pagamento

      const periodo = obterMesAno(dataReferencia)

      if (!periodo) return false

      return (
        periodo.mes === Number(mes) &&
        periodo.ano === Number(ano)
      )
    })
  }, [recebimentos, mes, ano])

  const recebimentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return recebimentosDoPeriodo
    }

    return recebimentosDoPeriodo.filter(
      (recebimento) => {
        const cliente = nomeCliente(
          recebimento.cliente_id
        )

        const contrato =
          contratoRelacionado(
            recebimento.contrato_id
          )

        return (
          String(cliente)
            .toLowerCase()
            .includes(termo) ||
          String(
            recebimento.descricao || ""
          )
            .toLowerCase()
            .includes(termo) ||
          String(
            recebimento.tipo || ""
          )
            .toLowerCase()
            .includes(termo) ||
          String(
            recebimento.status || ""
          )
            .toLowerCase()
            .includes(termo) ||
          String(
            contrato?.numero || ""
          )
            .toLowerCase()
            .includes(termo)
        )
      }
    )
  }, [
    recebimentosDoPeriodo,
    busca,
    clientes,
    contratos,
  ])

  const recebimentosPendentes = useMemo(() => {
    return recebimentosFiltrados.filter(
      (recebimento) => {
        const status = String(
          recebimento.status || ""
        ).toLowerCase()

        return (
          status !== "pago" &&
          status !== "recebido" &&
          status !== "realizado"
        )
      }
    )
  }, [recebimentosFiltrados])

  const recebimentosRealizados = useMemo(() => {
    return recebimentosFiltrados.filter(
      (recebimento) => {
        const status = String(
          recebimento.status || ""
        ).toLowerCase()

        return (
          status === "pago" ||
          status === "recebido" ||
          status === "realizado"
        )
      }
    )
  }, [recebimentosFiltrados])

  const resumo = useMemo(() => {
    const total = recebimentosDoPeriodo.reduce(
      (soma, recebimento) =>
        soma +
        Number(recebimento.valor || 0),
      0
    )

    const pendente = recebimentosDoPeriodo
      .filter((recebimento) => {
        const status = String(
          recebimento.status || ""
        ).toLowerCase()

        return (
          status !== "pago" &&
          status !== "recebido" &&
          status !== "realizado"
        )
      })
      .reduce(
        (soma, recebimento) =>
          soma +
          Number(recebimento.valor || 0),
        0
      )

    const realizado = recebimentosDoPeriodo
      .filter((recebimento) => {
        const status = String(
          recebimento.status || ""
        ).toLowerCase()

        return (
          status === "pago" ||
          status === "recebido" ||
          status === "realizado"
        )
      })
      .reduce(
        (soma, recebimento) =>
          soma +
          Number(recebimento.valor || 0),
        0
      )

    return {
      total,
      pendente,
      realizado,
      quantidadeTotal:
        recebimentosDoPeriodo.length,
      quantidadePendente:
        recebimentosDoPeriodo.filter(
          (recebimento) => {
            const status = String(
              recebimento.status || ""
            ).toLowerCase()

            return (
              status !== "pago" &&
              status !== "recebido" &&
              status !== "realizado"
            )
          }
        ).length,
      quantidadeRealizada:
        recebimentosDoPeriodo.filter(
          (recebimento) => {
            const status = String(
              recebimento.status || ""
            ).toLowerCase()

            return (
              status === "pago" ||
              status === "recebido" ||
              status === "realizado"
            )
          }
        ).length,
    }
  }, [recebimentosDoPeriodo])

  function abrirConfirmacaoRecebimento(
    recebimento
  ) {
    limparMensagens()

    setRecebimentoSelecionado(
      recebimento
    )

    setFormaPagamento(
      recebimento.forma_pagamento || ""
    )

    setDataPagamento(
      recebimento.data_recebimento ||
        recebimento.data_pagamento ||
        hoje.toISOString().split("T")[0]
    )

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setRecebimentoSelecionado(null)
    setFormaPagamento("")
  }

  async function confirmarRecebimento() {
    if (!recebimentoSelecionado) {
      return
    }

    setSalvando(true)
    limparMensagens()

    try {
      const dados = {
        status: "pago",
        forma_pagamento:
          formaPagamento || null,
        data_recebimento:
          dataPagamento || null,
      }

      const { error } = await supabase
        .from("recebimentos")
        .update(dados)
        .eq(
          "id",
          recebimentoSelecionado.id
        )

      if (error) {
        throw error
      }

      setSucesso(
        "Recebimento confirmado com sucesso!"
      )

      setModalAberto(false)
      setRecebimentoSelecionado(null)

      await carregarDados()
    } catch (error) {
      console.error(
        "Erro ao confirmar recebimento:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível confirmar o recebimento."
      )
    } finally {
      setSalvando(false)
    }
  }
  return (
    <div className="container-fluid py-4">

      {/* ========================================
          CABEÇALHO
      ======================================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Recebimentos
          </h2>

          <p className="text-muted mb-0">
            Controle e acompanhamento dos recebimentos
          </p>

        </div>

        <button
          type="button"
          className="btn btn-primary mt-3 mt-md-0"
          onClick={() =>
            acessarPagina("/recebimentos/novo")
          }
        >
          <i className="bi bi-plus-lg me-2"></i>
          Novo recebimento
        </button>

      </div>

      {/* ========================================
          ALERTA DE ERRO
      ======================================== */}

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
            onClick={() => setErro("")}
            aria-label="Fechar"
          />

        </div>

      )}

      {/* ========================================
          ALERTA DE SUCESSO
      ======================================== */}

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
            onClick={() => setSucesso("")}
            aria-label="Fechar"
          />

        </div>

      )}

      {/* ========================================
          ACESSO RÁPIDO
      ======================================== */}

         {/* ACESSO RÁPIDO */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex align-items-center mb-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3"
              style={{
                width: "42px",
                height: "42px",
              }}
            >
              <i className="bi bi-lightning-charge fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>

              <small className="text-muted">
                Acesse rapidamente os principais módulos
              </small>
            </div>
          </div>

          <div className="row g-2">

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/")}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/clientes")}
              >
                <i className="bi bi-people me-2"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/imoveis")}
              >
                <i className="bi bi-buildings me-2"></i>
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/contratos")}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={() => acessarPagina("/recebimentos")}
              >
                <i className="bi bi-cash-coin me-2"></i>
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/despesas")}
              >
                <i className="bi bi-receipt me-2"></i>
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/financeiro")}
              >
                <i className="bi bi-wallet2 me-2"></i>
                Financeiro
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/manutencoes")}
              >
                <i className="bi bi-tools me-2"></i>
                Manutenções
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/visitas")}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Visitas
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/comunicacao")}
              >
                <i className="bi bi-whatsapp me-2"></i>
                Comunicação
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/relatorios")}
              >
                <i className="bi bi-bar-chart me-2"></i>
                Relatórios
              </button>
            </div>

            <div className="col-6 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/configuracoes")}
              >
                <i className="bi bi-gear me-2"></i>
                Configurações
              </button>
            </div>

          </div>
        </div>
      </div>
      {/* ========================================
          PERÍODO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3"
              style={{
                width: "42px",
                height: "42px",
              }}
            >
              <i className="bi bi-calendar3 fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Período
              </h5>

              <small className="text-muted">
                Selecione o período para consultar os recebimentos
              </small>
            </div>

          </div>

          <div className="row g-3">

            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Mês
              </label>

              <select
                className="form-select"
                value={mes}
                onChange={(e) =>
                  setMes(Number(e.target.value))
                }
              >
                <option value={1}>Janeiro</option>
                <option value={2}>Fevereiro</option>
                <option value={3}>Março</option>
                <option value={4}>Abril</option>
                <option value={5}>Maio</option>
                <option value={6}>Junho</option>
                <option value={7}>Julho</option>
                <option value={8}>Agosto</option>
                <option value={9}>Setembro</option>
                <option value={10}>Outubro</option>
                <option value={11}>Novembro</option>
                <option value={12}>Dezembro</option>
              </select>

            </div>

            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
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
                  {
                    length: 7,
                  },
                  (_, indice) =>
                    hoje.getFullYear() -
                    3 +
                    indice
                ).map((anoOpcao) => (
                  <option
                    key={anoOpcao}
                    value={anoOpcao}
                  >
                    {anoOpcao}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================
          RESUMO DE RECEBIMENTOS
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-4">

            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3"
              style={{
                width: "42px",
                height: "42px",
              }}
            >
              <i className="bi bi-bar-chart-line fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Resumo de recebimentos
              </h5>

              <small className="text-muted">
                Visão geral do período selecionado
              </small>
            </div>

          </div>

          <div className="row g-3">

            {/* TOTAL */}

            <div className="col-12 col-md-4">

              <div className="card h-100 border-0 bg-light">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <small className="text-muted">
                        Total previsto
                      </small>

                      <h4 className="fw-bold mb-1">
                        {formatarMoeda(
                          resumo.total
                        )}
                      </h4>

                      <small className="text-muted">
                        {resumo.quantidadeTotal}{" "}
                        recebimento(s)
                      </small>

                    </div>

                    <div className="text-primary fs-3">
                      <i className="bi bi-cash-stack"></i>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* PENDENTE */}

            <div className="col-12 col-md-4">

              <div className="card h-100 border-0 bg-warning bg-opacity-10">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <small className="text-muted">
                        Pendente
                      </small>

                      <h4 className="fw-bold mb-1">
                        {formatarMoeda(
                          resumo.pendente
                        )}
                      </h4>

                      <small className="text-muted">
                        {resumo.quantidadePendente}{" "}
                        pendente(s)
                      </small>

                    </div>

                    <div className="text-warning fs-3">
                      <i className="bi bi-clock-history"></i>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* REALIZADO */}

            <div className="col-12 col-md-4">

              <div className="card h-100 border-0 bg-success bg-opacity-10">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <small className="text-muted">
                        Recebido
                      </small>

                      <h4 className="fw-bold mb-1">
                        {formatarMoeda(
                          resumo.realizado
                        )}
                      </h4>

                      <small className="text-muted">
                        {resumo.quantidadeRealizada}{" "}
                        realizado(s)
                      </small>

                    </div>

                    <div className="text-success fs-3">
                      <i className="bi bi-check-circle"></i>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
      {/* ========================================
          RECEBIMENTOS PENDENTES
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

            <div>

              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning me-3"
                  style={{
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-clock-history fs-5"></i>
                </div>

                <div>

                  <h5 className="fw-bold mb-1">
                    Recebimentos pendentes
                  </h5>

                  <small className="text-muted">
                    Valores que ainda não foram recebidos
                  </small>

                </div>

              </div>

            </div>

            <span className="badge bg-warning text-dark rounded-pill mt-3 mt-md-0">

              {recebimentosPendentes.length}{" "}

              {recebimentosPendentes.length === 1
                ? "pendente"
                : "pendentes"}

            </span>

          </div>

          {/* BUSCA */}

          <div className="row g-3 mb-4">

            <div className="col-12">

              <label className="form-label fw-semibold">
                Buscar recebimento
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Cliente, descrição, tipo..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />

              </div>

            </div>

          </div>

          {/* TABELA */}

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th>
                    Cliente
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Vencimento
                  </th>

                  <th>
                    Valor
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="text-end">
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5"
                    >

                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >

                        <span className="visually-hidden">
                          Carregando...
                        </span>

                      </div>

                      <div className="text-muted mt-2">
                        Carregando recebimentos...
                      </div>

                    </td>

                  </tr>

                ) : recebimentosPendentes.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5"
                    >

                      <i className="bi bi-check-circle fs-1 text-success"></i>

                      <div className="fw-semibold mt-2">
                        Nenhum recebimento pendente
                      </div>

                      <small className="text-muted">
                        Não existem recebimentos pendentes
                        para o período selecionado.
                      </small>

                    </td>

                  </tr>

                ) : (

                  recebimentosPendentes.map(
                    (recebimento) => (

                      <tr
                        key={recebimento.id}
                      >

                        {/* CLIENTE */}

                        <td>

                          <div className="fw-semibold">

                            {nomeCliente(
                              recebimento.cliente_id
                            )}

                          </div>

                          {recebimento.descricao && (

                            <small className="text-muted">

                              {recebimento.descricao}

                            </small>

                          )}

                        </td>

                        {/* TIPO */}

                        <td>

                          <span>

                            {recebimento.tipo ||
                              "Recebimento"}

                          </span>

                        </td>

                        {/* VENCIMENTO */}

                        <td>

                          {formatarData(
                            recebimento.data_vencimento
                          )}

                        </td>

                        {/* VALOR */}

                        <td>

                          <span className="fw-semibold">

                            {formatarMoeda(
                              recebimento.valor
                            )}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span className="badge bg-warning text-dark">

                            Pendente

                          </span>

                        </td>

                        {/* AÇÕES */}

                        <td className="text-end">

                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              abrirConfirmacaoRecebimento(
                                recebimento
                              )
                            }
                          >

                            <i className="bi bi-check-lg me-1"></i>

                            Receber

                          </button>

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

      {/* ========================================
          RECEBIMENTOS REALIZADOS
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

            <div>

              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success me-3"
                  style={{
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-check-circle fs-5"></i>
                </div>

                <div>

                  <h5 className="fw-bold mb-1">
                    Recebimentos realizados
                  </h5>

                  <small className="text-muted">
                    Recebimentos confirmados no período
                  </small>

                </div>

              </div>

            </div>

            <span className="badge bg-success rounded-pill mt-3 mt-md-0">

              {recebimentosRealizados.length}{" "}

              {recebimentosRealizados.length === 1
                ? "realizado"
                : "realizados"}

            </span>

          </div>

          {/* TABELA */}

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th>
                    Cliente
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Data do recebimento
                  </th>

                  <th>
                    Valor
                  </th>

                  <th>
                    Forma de pagamento
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5"
                    >

                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >

                        <span className="visually-hidden">
                          Carregando...
                        </span>

                      </div>

                      <div className="text-muted mt-2">
                        Carregando recebimentos...
                      </div>

                    </td>

                  </tr>

                ) : recebimentosRealizados.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5"
                    >

                      <i className="bi bi-cash-stack fs-1 text-muted"></i>

                      <div className="fw-semibold mt-2">
                        Nenhum recebimento realizado
                      </div>

                      <small className="text-muted">
                        Ainda não existem recebimentos
                        realizados no período selecionado.
                      </small>

                    </td>

                  </tr>

                ) : (

                  recebimentosRealizados.map(
                    (recebimento) => (

                      <tr
                        key={recebimento.id}
                      >

                        {/* CLIENTE */}

                        <td>

                          <div className="fw-semibold">

                            {nomeCliente(
                              recebimento.cliente_id
                            )}

                          </div>

                          {recebimento.descricao && (

                            <small className="text-muted">

                              {recebimento.descricao}

                            </small>

                          )}

                        </td>

                        {/* TIPO */}

                        <td>

                          {recebimento.tipo ||
                            "Recebimento"}

                        </td>

                        {/* DATA */}

                        <td>

                          {formatarData(
                            recebimento.data_recebimento ||
                              recebimento.data_pagamento ||
                              recebimento.data_vencimento
                          )}

                        </td>

                        {/* VALOR */}

                        <td>

                          <span className="fw-semibold text-success">

                            {formatarMoeda(
                              recebimento.valor
                            )}

                          </span>

                        </td>

                        {/* FORMA DE PAGAMENTO */}

                        <td>

                          {recebimento.forma_pagamento ||
                            "-"}

                        </td>

                        {/* STATUS */}

                        <td>

                          <span className="badge bg-success">

                            <i className="bi bi-check-lg me-1"></i>

                            Recebido

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
      {/* ========================================
          MODAL - CONFIRMAR RECEBIMENTO
      ======================================== */}

      {modalAberto && recebimentoSelecionado && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold mb-1">

                    <i className="bi bi-check-circle text-success me-2"></i>

                    Confirmar recebimento

                  </h5>

                  <small className="text-muted">

                    Registre o pagamento recebido.

                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={fecharModal}
                  disabled={salvando}
                />

              </div>

              {/* CORPO */}

              <div className="modal-body">

                {/* RESUMO DO RECEBIMENTO */}

                <div className="card shadow-sm border-0 bg-light mb-4">

                  <div className="card-body">

                    <div className="row g-3">

                      {/* CLIENTE */}

                      <div className="col-12 col-md-6">

                        <small className="text-muted d-block">
                          Cliente
                        </small>

                        <span className="fw-semibold">

                          {nomeCliente(
                            recebimentoSelecionado.cliente_id
                          )}

                        </span>

                      </div>

                      {/* VALOR */}

                      <div className="col-12 col-md-6">

                        <small className="text-muted d-block">
                          Valor
                        </small>

                        <span className="fw-bold text-success fs-5">

                          {formatarMoeda(
                            recebimentoSelecionado.valor
                          )}

                        </span>

                      </div>

                      {/* TIPO */}

                      <div className="col-12 col-md-6">

                        <small className="text-muted d-block">
                          Tipo
                        </small>

                        <span className="fw-semibold">

                          {recebimentoSelecionado.tipo ||
                            "Recebimento"}

                        </span>

                      </div>

                      {/* VENCIMENTO */}

                      <div className="col-12 col-md-6">

                        <small className="text-muted d-block">
                          Vencimento
                        </small>

                        <span className="fw-semibold">

                          {formatarData(
                            recebimentoSelecionado.data_vencimento
                          )}

                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* DADOS DO PAGAMENTO */}

                <div className="card shadow-sm border-0">

                  <div className="card-body">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success me-3"
                        style={{
                          width: "42px",
                          height: "42px",
                        }}
                      >

                        <i className="bi bi-cash-coin fs-5"></i>

                      </div>

                      <div>

                        <h6 className="fw-bold mb-0">
                          Dados do pagamento
                        </h6>

                        <small className="text-muted">
                          Informe como e quando o valor foi recebido.
                        </small>

                      </div>

                    </div>

                    <div className="row g-3">

                      {/* FORMA DE PAGAMENTO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label fw-semibold">

                          Forma de pagamento

                        </label>

                        <select
                          className="form-select"
                          value={formaPagamento}
                          onChange={(e) =>
                            setFormaPagamento(
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Selecione
                          </option>

                          <option value="Pix">
                            Pix
                          </option>

                          <option value="Dinheiro">
                            Dinheiro
                          </option>

                          <option value="Transferência">
                            Transferência
                          </option>

                          <option value="Cartão">
                            Cartão
                          </option>

                          <option value="Boleto">
                            Boleto
                          </option>

                          <option value="Cheque">
                            Cheque
                          </option>

                          <option value="Outro">
                            Outro
                          </option>

                        </select>

                      </div>

                      {/* DATA DO RECEBIMENTO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label fw-semibold">

                          Data do recebimento

                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={dataPagamento}
                          onChange={(e) =>
                            setDataPagamento(
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* RODAPÉ */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharModal}
                  disabled={salvando}
                >

                  <i className="bi bi-x-lg me-2"></i>

                  Cancelar

                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmarRecebimento}
                  disabled={salvando}
                >

                  {salvando ? (

                    <>

                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>

                      Confirmando...

                    </>

                  ) : (

                    <>

                      <i className="bi bi-check-lg me-2"></i>

                      Confirmar recebimento

                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}
    </div>
  )
}