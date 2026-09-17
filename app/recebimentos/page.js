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
  function obterNomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) =>
        String(item.id) === String(clienteId)
    )

    if (!cliente) return "Cliente não informado"

    return (
      cliente.nome ||
      cliente.nome_completo ||
      cliente.razao_social ||
      "Cliente"
    )
  }

  function obterNumeroContrato(contratoId) {
    const contrato = contratos.find(
      (item) =>
        String(item.id) === String(contratoId)
    )

    if (!contrato) return "-"

    return (
      contrato.numero_contrato ||
      contrato.numero ||
      contrato.id ||
      "-"
    )
  }

  function obterStatus(recebimento) {
    return (
      recebimento.status ||
      recebimento.situacao ||
      "Pendente"
    )
  }

  function obterDescricao(recebimento) {
    return (
      recebimento.descricao ||
      recebimento.tipo ||
      "Recebimento"
    )
  }

  function estaPago(recebimento) {
    const status = String(
      obterStatus(recebimento)
    ).toLowerCase()

    return (
      status === "recebido" ||
      status === "pago"
    )
  }

  function abrirConfirmacao(recebimento) {
    limparMensagens()

    setRecebimentoSelecionado(
      recebimento
    )

    setFormaPagamento(
      recebimento.forma_pagamento || ""
    )

    setDataPagamento(
      recebimento.data_pagamento ||
        hoje.toISOString().split("T")[0]
    )

    setModalAberto(true)
  }

  function fecharConfirmacao() {
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
      const { error } = await supabase
        .from("recebimentos")
        .update({
          status: "Recebido",
          forma_pagamento:
            formaPagamento || null,
          data_pagamento:
            dataPagamento || null,
        })
        .eq(
          "id",
          recebimentoSelecionado.id
        )

      if (error) {
        throw error
      }

      setSucesso(
        "Recebimento confirmado com sucesso."
      )

      fecharConfirmacao()

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

  const recebimentosDoPeriodo = useMemo(() => {
    return recebimentos.filter(
      (recebimento) => {
        const data =
          recebimento.data_vencimento ||
          recebimento.data_pagamento

        if (!data) return false

        const partes = String(data).split("-")

        if (partes.length !== 3) {
          return false
        }

        const anoData = Number(partes[0])
        const mesData = Number(partes[1])

        return (
          anoData === Number(ano) &&
          mesData === Number(mes)
        )
      }
    )
  }, [recebimentos, mes, ano])

  const recebimentosFiltrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase()

    if (!termo) {
      return recebimentosDoPeriodo
    }

    return recebimentosDoPeriodo.filter(
      (recebimento) => {
        const cliente =
          obterNomeCliente(
            recebimento.cliente_id
          )

        const descricao =
          obterDescricao(recebimento)

        const contrato =
          obterNumeroContrato(
            recebimento.contrato_id
          )

        return (
          String(cliente)
            .toLowerCase()
            .includes(termo) ||
          String(descricao)
            .toLowerCase()
            .includes(termo) ||
          String(contrato)
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
      (recebimento) =>
        !estaPago(recebimento)
    )
  }, [recebimentosFiltrados])

  const recebimentosRecebidos = useMemo(() => {
    return recebimentosFiltrados.filter(
      (recebimento) =>
        estaPago(recebimento)
    )
  }, [recebimentosFiltrados])

  const totalPendente = useMemo(() => {
    return recebimentosPendentes.reduce(
      (total, recebimento) =>
        total + Number(recebimento.valor || 0),
      0
    )
  }, [recebimentosPendentes])

  const totalRecebido = useMemo(() => {
    return recebimentosRecebidos.reduce(
      (total, recebimento) =>
        total + Number(recebimento.valor || 0),
      0
    )
  }, [recebimentosRecebidos])

  function abrirNovoRecebimento() {
    limparMensagens()

    window.location.href =
      "/recebimentos/novo"
  }

  function mudarMes(valor) {
    let novoMes = Number(mes) + valor
    let novoAno = Number(ano)

    if (novoMes < 1) {
      novoMes = 12
      novoAno--
    }

    if (novoMes > 12) {
      novoMes = 1
      novoAno++
    }

    setMes(novoMes)
    setAno(novoAno)
  }

  function nomeMes(numero) {
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

    return meses[
      Number(numero) - 1
    ]
  }

  return (
    <div className="container-fluid py-4">
      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Recebimentos
          </h2>

          <p className="text-muted mb-0">
            Controle dos valores a receber
        </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={abrirNovoRecebimento}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Novo recebimento
        </button>
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
            onClick={() => setErro("")}
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
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}
      
                
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

        <small className="text-muted">
          Acesse rapidamente as principais áreas
        </small>
      </div>

    </div>

    <div className="row g-2">

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/")}
        >
          <i className="bi bi-speedometer2 d-block fs-5 mb-1"></i>
          Dashboard
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/clientes")}
        >
          <i className="bi bi-people d-block fs-5 mb-1"></i>
          Clientes
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/imoveis")}
        >
          <i className="bi bi-house-door d-block fs-5 mb-1"></i>
          Imóveis
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/contratos")}
        >
          <i className="bi bi-file-earmark-text d-block fs-5 mb-1"></i>
          Contratos
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-primary w-100 py-2"
          onClick={() => acessarPagina("/recebimentos")}
        >
          <i className="bi bi-cash-coin d-block fs-5 mb-1"></i>
          Recebimentos
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/despesas")}
        >
          <i className="bi bi-wallet2 d-block fs-5 mb-1"></i>
          Despesas
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/financeiro")}
        >
          <i className="bi bi-bar-chart-line d-block fs-5 mb-1"></i>
          Financeiro
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/manutencoes")}
        >
          <i className="bi bi-tools d-block fs-5 mb-1"></i>
          Manutenções
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/visitas")}
        >
          <i className="bi bi-calendar-check d-block fs-5 mb-1"></i>
          Visitas
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/comunicacao")}
        >
          <i className="bi bi-whatsapp d-block fs-5 mb-1"></i>
          Comunicação
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/relatorios")}
        >
          <i className="bi bi-file-earmark-bar-graph d-block fs-5 mb-1"></i>
          Relatórios
        </button>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <button
          className="btn btn-outline-primary w-100 py-2"
          onClick={() => acessarPagina("/configuracoes")}
        >
          <i className="bi bi-gear d-block fs-5 mb-1"></i>
          Configurações
        </button>
      </div>

    </div>

  </div>
</div>         
 
 
      {/* PERÍODO */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">

            <div>
              <h5 className="fw-bold mb-1">
                Período
              </h5>

              <p className="text-muted mb-0">
                Visualize os recebimentos por mês
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => mudarMes(-1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              <div
                className="fw-bold text-center"
                style={{
                  minWidth: "150px",
                }}
              >
                {nomeMes(mes)} de {ano}
              </div>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => mudarMes(1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* BUSCA */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <label className="form-label fw-semibold">
            Pesquisar recebimentos
          </label>

          <div className="input-group">

            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Cliente, descrição ou contrato..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
            />

            {busca && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setBusca("")}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* RESUMO */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center">

                <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-clock-history text-warning fs-4"></i>
                </div>

                <div>
                  <small className="text-muted">
                    Pendentes
                  </small>

                  <h4 className="fw-bold mb-0">
                    {formatarMoeda(totalPendente)}
                  </h4>

                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center">

                <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>

                <div>
                  <small className="text-muted">
                    Recebidos
                  </small>

                  <h4 className="fw-bold mb-0">
                    {formatarMoeda(totalRecebido)}
                  </h4>

                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center">

                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-cash-stack text-primary fs-4"></i>
                </div>

                <div>
                  <small className="text-muted">
                    Total do período
                  </small>

                  <h4 className="fw-bold mb-0">
                    {formatarMoeda(
                      totalPendente +
                        totalRecebido
                    )}
                  </h4>

                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
      {/* RECEBIMENTOS PENDENTES */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">

            <div>
              <h5 className="fw-bold mb-1">
                Recebimentos pendentes
              </h5>

              <small className="text-muted">
                Valores que ainda aguardam pagamento
              </small>
            </div>

            <span className="badge bg-warning text-dark">
              {recebimentosPendentes.length} pendente
              {recebimentosPendentes.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {loading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Carregando...
                </span>
              </div>

              <p className="text-muted mt-2 mb-0">
                Carregando recebimentos...
              </p>
            </div>
          ) : recebimentosPendentes.length === 0 ? (
            <div className="text-center py-4">

              <i className="bi bi-check-circle text-success fs-1"></i>

              <p className="fw-semibold mt-2 mb-1">
                Nenhum recebimento pendente
              </p>

              <small className="text-muted">
                Não existem valores pendentes
                para o período selecionado.
              </small>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Contrato</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th className="text-end">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recebimentosPendentes.map(
                    (recebimento) => (
                      <tr
                        key={recebimento.id}
                      >

                        <td>
                          <div className="fw-semibold">
                            {obterNomeCliente(
                              recebimento.cliente_id
                            )}
                          </div>
                        </td>

                        <td>
                          {obterDescricao(
                            recebimento
                          )}
                        </td>

                        <td>
                          {obterNumeroContrato(
                            recebimento.contrato_id
                          )}
                        </td>

                        <td>
                          {formatarData(
                            recebimento.data_vencimento
                          )}
                        </td>

                        <td>
                          <span className="fw-bold">
                            {formatarMoeda(
                              recebimento.valor
                            )}
                          </span>
                        </td>

                        <td className="text-end">

                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              abrirConfirmacao(
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
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>
      {/* RECEBIMENTOS REALIZADOS */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">

            <div>
              <h5 className="fw-bold mb-1">
                Recebimentos realizados
              </h5>

              <small className="text-muted">
                Valores já recebidos no período
              </small>
            </div>

            <span className="badge bg-success">
              {recebimentosRecebidos.length} recebido
              {recebimentosRecebidos.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {loading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Carregando...
                </span>
              </div>
            </div>
          ) : recebimentosRecebidos.length === 0 ? (
            <div className="text-center py-4">

              <i className="bi bi-wallet2 text-muted fs-1"></i>

              <p className="fw-semibold mt-2 mb-1">
                Nenhum recebimento realizado
              </p>

              <small className="text-muted">
                Ainda não existem recebimentos
                registrados neste período.
              </small>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Contrato</th>
                    <th>Pagamento</th>
                    <th>Forma</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recebimentosRecebidos.map(
                    (recebimento) => (
                      <tr
                        key={recebimento.id}
                      >

                        <td>
                          <span className="fw-semibold">
                            {obterNomeCliente(
                              recebimento.cliente_id
                            )}
                          </span>
                        </td>

                        <td>
                          {obterDescricao(
                            recebimento
                          )}
                        </td>

                        <td>
                          {obterNumeroContrato(
                            recebimento.contrato_id
                          )}
                        </td>

                        <td>
                          {formatarData(
                            recebimento.data_pagamento ||
                              recebimento.data_vencimento
                          )}
                        </td>

                        <td>
                          {recebimento.forma_pagamento ||
                            "-"}
                        </td>

                        <td>
                          <span className="fw-bold text-success">
                            {formatarMoeda(
                              recebimento.valor
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-success">
                            Recebido
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
      {/* MODAL DE CONFIRMAÇÃO */}
      {modalAberto && recebimentoSelecionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO */}
              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Confirmar recebimento
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharConfirmacao}
                  disabled={salvando}
                ></button>

              </div>

              {/* CORPO */}
              <div className="modal-body">

                <div className="alert alert-light border mb-4">

                  <div className="mb-2">
                    <small className="text-muted d-block">
                      Cliente
                    </small>

                    <strong>
                      {obterNomeCliente(
                        recebimentoSelecionado.cliente_id
                      )}
                    </strong>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted d-block">
                      Descrição
                    </small>

                    <strong>
                      {obterDescricao(
                        recebimentoSelecionado
                      )}
                    </strong>
                  </div>

                  <div>
                    <small className="text-muted d-block">
                      Valor
                    </small>

                    <strong className="text-success fs-5">
                      {formatarMoeda(
                        recebimentoSelecionado.valor
                      )}
                    </strong>
                  </div>

                </div>

                {/* FORMA DE PAGAMENTO */}
                <div className="mb-3">

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

                    <option value="Dinheiro">
                      Dinheiro
                    </option>

                    <option value="Cartão">
                      Cartão
                    </option>

                    <option value="Depósito">
                      Depósito
                    </option>

                    <option value="Pix">
                      Pix
                    </option>
                  </select>

                </div>

                {/* DATA DO PAGAMENTO */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Data do pagamento
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

              {/* RODAPÉ */}
              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharConfirmacao}
                  disabled={salvando}
                >
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
                      ></span>

                      Salvando...
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