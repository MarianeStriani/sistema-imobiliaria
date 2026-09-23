"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Recebimentos() {
  const hoje = new Date()

  // ========================================
  // DADOS
  // ========================================

  const [recebimentos, setRecebimentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [contratos, setContratos] = useState([])

  // ========================================
  // CONTROLE
  // ========================================

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  // ========================================
  // PERÍODO
  // ========================================

  const [mes, setMes] = useState(
    hoje.getMonth() + 1
  )

  const [ano, setAno] = useState(
    hoje.getFullYear()
  )

  // ========================================
  // BUSCA
  // ========================================

  const [busca, setBusca] = useState("")

  // ========================================
  // MODAL - CONFIRMAR RECEBIMENTO
  // ========================================

  const [modalAberto, setModalAberto] =
    useState(false)

  const [
    recebimentoSelecionado,
    setRecebimentoSelecionado,
  ] = useState(null)

  const [formaPagamento, setFormaPagamento] =
    useState("")

  const [dataPagamento, setDataPagamento] =
    useState(
      hoje.toISOString().split("T")[0]
    )

  // ========================================
  // MODAL - NOVO RECEBIMENTO
  // ========================================

  const [
    novoRecebimentoAberto,
    setNovoRecebimentoAberto,
  ] = useState(false)

  const [
    novoRecebimento,
    setNovoRecebimento,
  ] = useState({
    cliente_id: "",
    contrato_id: "",
    tipo: "Aluguel mensal",
    descricao: "",
    numero_contrato: "",
    valor: "",
    data_vencimento: "",
    forma_pagamento: "Pix",
    status: "Pendente",
    observacoes: "",
  })

  // ========================================
  // CARREGAR DADOS
  // ========================================

  async function carregarDados() {
    try {
      setLoading(true)
      setErro("")

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

  // ========================================
  // MENSAGENS
  // ========================================

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  function acessarPagina(url) {
    window.location.href = url
  }

  // ========================================
  // FORMATAÇÃO
  // ========================================

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

  // ========================================
  // NOMES RELACIONADOS
  // ========================================

  function obterNomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) =>
        String(item.id) === String(clienteId)
    )

    return cliente?.nome || "Cliente não encontrado"
  }

  function obterNumeroContrato(contratoId) {
    const contrato = contratos.find(
      (item) =>
        String(item.id) === String(contratoId)
    )

    return contrato?.numero || "-"
  }

  // ========================================
  // FILTRO POR PERÍODO
  // ========================================

  const recebimentosDoPeriodo = useMemo(() => {
    return recebimentos.filter((recebimento) => {
      const data =
        recebimento.data_vencimento

      if (!data) return false

      const partes = String(data).split("-")

      if (partes.length !== 3) {
        return false
      }

      const anoRecebimento =
        Number(partes[0])

      const mesRecebimento =
        Number(partes[1])

      return (
        anoRecebimento === Number(ano) &&
        mesRecebimento === Number(mes)
      )
    })
  }, [recebimentos, mes, ano])

  // ========================================
  // BUSCA
  // ========================================

  const recebimentosFiltrados = useMemo(() => {
    const termo =
      busca.trim().toLowerCase()

    if (!termo) {
      return recebimentosDoPeriodo
    }

    return recebimentosDoPeriodo.filter(
      (recebimento) => {
        const nomeCliente =
          obterNomeCliente(
            recebimento.cliente_id
          )

        const numeroContrato =
          recebimento.numero_contrato ||
          obterNumeroContrato(
            recebimento.contrato_id
          )

        const tipo =
          recebimento.tipo_recebimento ||
          recebimento.tipo ||
          ""

        const descricao =
          recebimento.descricao || ""

        return (
          String(nomeCliente)
            .toLowerCase()
            .includes(termo) ||

          String(numeroContrato)
            .toLowerCase()
            .includes(termo) ||

          String(tipo)
            .toLowerCase()
            .includes(termo) ||

          String(descricao)
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

  // ========================================
  // RESUMOS
  // ========================================

  const totalRecebimentos =
    recebimentosDoPeriodo.length

  const recebidos =
    recebimentosDoPeriodo.filter(
      (recebimento) =>
        String(
          recebimento.status || ""
        ).toLowerCase() === "recebido"
    )

  const pendentes =
    recebimentosDoPeriodo.filter(
      (recebimento) =>
        String(
          recebimento.status || ""
        ).toLowerCase() === "pendente"
    )

  const valorRecebido =
    recebidos.reduce(
      (total, recebimento) =>
        total +
        Number(
          recebimento.valor || 0
        ),
      0
    )

  const valorPendente =
    pendentes.reduce(
      (total, recebimento) =>
        total +
        Number(
          recebimento.valor || 0
        ),
      0
    )

  // ========================================
  // STATUS
  // ========================================

  function classeStatus(status) {
    const valor =
      String(status || "").toLowerCase()

    if (valor === "recebido") {
      return "bg-success"
    }

    if (valor === "pendente") {
      return "bg-warning text-dark"
    }

    if (valor === "cancelado") {
      return "bg-danger"
    }

    return "bg-secondary"
  }

  function textoStatus(status) {
    const valor =
      String(status || "").toLowerCase()

    if (valor === "recebido") {
      return "Recebido"
    }

    if (valor === "pendente") {
      return "Pendente"
    }

    if (valor === "cancelado") {
      return "Cancelado"
    }

    return status || "-"
  }

  // ========================================
  // NOVO RECEBIMENTO
  // ========================================

  function formularioInicial() {
    return {
      cliente_id: "",
      contrato_id: "",
      tipo: "Aluguel mensal",
      descricao: "",
      numero_contrato: "",
      valor: "",
      data_vencimento: "",
      forma_pagamento: "Pix",
      status: "Pendente",
      observacoes: "",
    }
  }

  function alterarNovoRecebimento(
    campo,
    valor
  ) {
    setNovoRecebimento(
      (anterior) => ({
        ...anterior,
        [campo]: valor,
      })
    )
  }

  function abrirNovoRecebimento() {
    limparMensagens()

    setNovoRecebimento(
      formularioInicial()
    )

    setNovoRecebimentoAberto(true)
  }

  function fecharNovoRecebimento() {
    if (salvando) return

    setNovoRecebimentoAberto(false)

    setNovoRecebimento(
      formularioInicial()
    )
  }

  // ========================================
  // SALVAR NOVO RECEBIMENTO
  // ========================================

  async function salvarNovoRecebimento() {
    try {
      setSalvando(true)
      limparMensagens()

      if (!novoRecebimento.cliente_id) {
        setErro("Selecione um cliente.")
        return
      }

      if (!novoRecebimento.valor) {
        setErro("Informe o valor do recebimento.")
        return
      }

      if (!novoRecebimento.data_vencimento) {
        setErro("Informe a data de vencimento.")
        return
      }

      const dados = {
        cliente_id:
          novoRecebimento.cliente_id,

        contrato_id:
          novoRecebimento.contrato_id || null,

        tipo_recebimento:
          novoRecebimento.tipo,

        descricao:
          novoRecebimento.descricao || null,

        numero_contrato:
          novoRecebimento.numero_contrato ||
          null,

        valor:
          Number(novoRecebimento.valor),

        data_vencimento:
          novoRecebimento.data_vencimento,

        forma_pagamento:
          novoRecebimento.forma_pagamento ||
          null,

        status:
          novoRecebimento.status,

        observacoes:
          novoRecebimento.observacoes ||
          null,
      }

      const { error } = await supabase
        .from("recebimentos")
        .insert([dados])

      if (error) {
        throw error
      }

      setSucesso(
        "Recebimento cadastrado com sucesso."
      )

      setNovoRecebimentoAberto(false)

      setNovoRecebimento(
        formularioInicial()
      )

      await carregarDados()
    } catch (error) {
      console.error(
        "Erro ao salvar recebimento:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível cadastrar o recebimento."
      )
    } finally {
      setSalvando(false)
    }
  }

  // ========================================
  // ABRIR CONFIRMAÇÃO DE PAGAMENTO
  // ========================================

  function abrirConfirmarRecebimento(
    recebimento
  ) {
    limparMensagens()

    setRecebimentoSelecionado(
      recebimento
    )

    setFormaPagamento(
      recebimento.forma_pagamento ||
        "Pix"
    )

    setDataPagamento(
      recebimento.data_pagamento ||
        hoje.toISOString().split("T")[0]
    )

    setModalAberto(true)
  }

  // ========================================
  // FECHAR CONFIRMAÇÃO
  // ========================================

  function fecharConfirmacao() {
    if (salvando) return

    setModalAberto(false)

    setRecebimentoSelecionado(null)

    setFormaPagamento("")

    setDataPagamento(
      hoje.toISOString().split("T")[0]
    )
  }

  // ========================================
  // CONFIRMAR PAGAMENTO
  // ========================================

  async function confirmarPagamento() {
    if (!recebimentoSelecionado) {
      return
    }

    try {
      setSalvando(true)
      limparMensagens()

      if (!formaPagamento) {
        setErro(
          "Selecione a forma de pagamento."
        )
        return
      }

      if (!dataPagamento) {
        setErro(
          "Informe a data do pagamento."
        )
        return
      }

      const { error } = await supabase
        .from("recebimentos")
        .update({
          status: "Recebido",
          forma_pagamento:
            formaPagamento,
          data_pagamento:
            dataPagamento,
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

  // ========================================
  // EXCLUIR RECEBIMENTO
  // ========================================

  async function excluirRecebimento(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este recebimento?"
    )

    if (!confirmar) {
      return
    }

    try {
      limparMensagens()

      const { error } = await supabase
        .from("recebimentos")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      setSucesso(
        "Recebimento excluído com sucesso."
      )

      await carregarDados()
    } catch (error) {
      console.error(
        "Erro ao excluir recebimento:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível excluir o recebimento."
      )
    }
  }
  // ========================================
  // INTERFACE
  // ========================================

  return (
    <main className="container-fluid py-4">

      {/* ACESSO RÁPIDO */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">

        <div className="card-body">

          <h2 className="h6 fw-bold mb-3">
            Acesso rápido
          </h2>

          <div className="row g-2">

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/dashboard")
                }
              >
                Dashboard
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/imoveis")
                }
              >
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/clientes")
                }
              >
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/contratos")
                }
              >
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-primary w-100"
              >
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/despesas")
                }
              >
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/financeiro")
                }
              >
                Financeiro
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* CABEÇALHO */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h1 className="h3 fw-bold mb-1">
            Recebimentos
          </h1>

          <p className="text-muted mb-0">
            Controle dos recebimentos do sistema
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirNovoRecebimento}
        >
          <span className="me-2">+</span>
          Novo recebimento
        </button>

      </div>

      {/* MENSAGENS */}
      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <strong>Erro:</strong>{" "}
          {erro}

          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
            onClick={() => setErro("")}
          />
        </div>
      )}

      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {sucesso}

          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
            onClick={() => setSucesso("")}
          />
        </div>
      )}

      {/* FILTROS */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-12 col-md-4">

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
                onChange={(event) =>
                  setMes(
                    Number(event.target.value)
                  )
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

            <div className="col-12 col-md-3">

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
                onChange={(event) =>
                  setAno(
                    Number(event.target.value)
                  )
                }
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>

            </div>

            <div className="col-12 col-md-5">

              <label
                htmlFor="busca"
                className="form-label fw-semibold"
              >
                Buscar
              </label>

              <input
                id="busca"
                type="text"
                className="form-control"
                value={busca}
                onChange={(event) =>
                  setBusca(
                    event.target.value
                  )
                }
                placeholder="Cliente, contrato ou descrição..."
              />

            </div>

          </div>

        </div>

      </div>

      {/* RESUMO */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <p className="text-muted mb-2">
                Total de recebimentos
              </p>

              <h2 className="h4 fw-bold mb-0">
                {totalRecebimentos}
              </h2>

            </div>

          </div>

        </div>

        <div className="col-12 col-md-4">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <p className="text-muted mb-2">
                Recebidos
              </p>

              <h2 className="h4 fw-bold text-success mb-1">
                {formatarMoeda(
                  valorRecebido
                )}
              </h2>

              <small className="text-muted">
                {recebidos.length} recebimento(s)
              </small>

            </div>

          </div>

        </div>

        <div className="col-12 col-md-4">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <p className="text-muted mb-2">
                Pendentes
              </p>

              <h2 className="h4 fw-bold text-warning mb-1">
                {formatarMoeda(
                  valorPendente
                )}
              </h2>

              <small className="text-muted">
                {pendentes.length} recebimento(s)
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* LISTA */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">

            <div>

              <h2 className="h5 fw-bold mb-1">
                Lista de recebimentos
              </h2>

              <p className="text-muted small mb-0">
                Recebimentos do período selecionado.
              </p>

            </div>

            <span className="badge text-bg-light border">
              {recebimentosFiltrados.length} registro(s)
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
                Carregando recebimentos...
              </p>

            </div>

          ) : recebimentosFiltrados.length === 0 ? (

            <div className="text-center py-5">

              <div className="fs-1 mb-3">
                💰
              </div>

              <h3 className="h6 fw-bold">
                Nenhum recebimento encontrado
              </h3>

              <p className="text-muted mb-3">
                Não existem recebimentos para os filtros selecionados.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={abrirNovoRecebimento}
              >
                Novo recebimento
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Contrato</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th className="text-end">
                      Ações
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {recebimentosFiltrados.map(
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

                          {recebimento.descricao && (
                            <small className="text-muted">
                              {recebimento.descricao}
                            </small>
                          )}
                        </td>

                        <td>
                          {recebimento.tipo_recebimento ||
                            recebimento.tipo ||
                            "-"}
                        </td>

                        <td>
                          {recebimento.numero_contrato ||
                            obterNumeroContrato(
                              recebimento.contrato_id
                            )}
                        </td>

                        <td>
                          {formatarData(
                            recebimento.data_vencimento
                          )}
                        </td>

                        <td className="fw-semibold">
                          {formatarMoeda(
                            recebimento.valor
                          )}
                        </td>

                        <td>
                          <span
                            className={`badge ${classeStatus(
                              recebimento.status
                            )}`}
                          >
                            {textoStatus(
                              recebimento.status
                            )}
                          </span>
                        </td>

                        <td>

                          <div className="d-flex justify-content-end gap-2">

                            {String(
                              recebimento.status || ""
                            ).toLowerCase() ===
                              "pendente" && (

                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  abrirConfirmarRecebimento(
                                    recebimento
                                  )
                                }
                              >
                                Receber
                              </button>

                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                excluirRecebimento(
                                  recebimento.id
                                )
                              }
                            >
                              Excluir
                            </button>

                          </div>

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
      {/* MODAL - NOVO RECEBIMENTO */}

      {novoRecebimentoAberto && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 rounded-4 shadow">

              <div className="modal-header">

                <div>

                  <h2 className="modal-title h5 fw-bold mb-1">
                    Novo recebimento
                  </h2>

                  <p className="text-muted small mb-0">
                    Cadastre um novo recebimento.
                  </p>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={
                    fecharNovoRecebimento
                  }
                  disabled={salvando}
                />

              </div>

              <div className="modal-body">

                <div className="row g-3">

                  {/* CLIENTE */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-cliente"
                      className="form-label fw-semibold"
                    >
                      Cliente
                    </label>

                    <select
                      id="novo-cliente"
                      className="form-select"
                      value={
                        novoRecebimento.cliente_id
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "cliente_id",
                          event.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Selecione o cliente
                      </option>

                      {clientes.map(
                        (cliente) => (
                          <option
                            key={cliente.id}
                            value={cliente.id}
                          >
                            {cliente.nome}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* CONTRATO */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-contrato"
                      className="form-label fw-semibold"
                    >
                      Contrato
                    </label>

                    <select
                      id="novo-contrato"
                      className="form-select"
                      value={
                        novoRecebimento.contrato_id
                      }
                      onChange={(event) => {

                        const contratoId =
                          event.target.value

                        const contrato =
                          contratos.find(
                            (item) =>
                              String(
                                item.id
                              ) ===
                              String(
                                contratoId
                              )
                          )

                        alterarNovoRecebimento(
                          "contrato_id",
                          contratoId
                        )

                        if (
                          contrato?.numero
                        ) {
                          setNovoRecebimento(
                            (anterior) => ({
                              ...anterior,
                              contrato_id:
                                contratoId,
                              numero_contrato:
                                contrato.numero,
                            })
                          )
                        }

                      }}
                    >

                      <option value="">
                        Selecione o contrato
                      </option>

                      {contratos.map(
                        (contrato) => (
                          <option
                            key={contrato.id}
                            value={contrato.id}
                          >
                            {contrato.numero ||
                              `Contrato #${contrato.id}`}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* TIPO */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-tipo"
                      className="form-label fw-semibold"
                    >
                      Tipo de recebimento
                    </label>

                    <select
                      id="novo-tipo"
                      className="form-select"
                      value={
                        novoRecebimento.tipo
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "tipo",
                          event.target.value
                        )
                      }
                    >

                      <option value="Aluguel mensal">
                        Aluguel mensal
                      </option>

                      <option value="Diária">
                        Diária
                      </option>

                      <option value="Venda unitária">
                        Venda unitária
                      </option>

                      <option value="Venda parcelada">
                        Venda parcelada
                      </option>

                    </select>

                  </div>

                  {/* NÚMERO DO CONTRATO */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-numero-contrato"
                      className="form-label fw-semibold"
                    >
                      Nº do contrato
                    </label>

                    <input
                      id="novo-numero-contrato"
                      type="text"
                      className="form-control"
                      value={
                        novoRecebimento.numero_contrato
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "numero_contrato",
                          event.target.value
                        )
                      }
                      placeholder="Ex.: CT-001"
                    />

                  </div>

                  {/* DESCRIÇÃO */}

                  <div className="col-12">

                    <label
                      htmlFor="novo-descricao"
                      className="form-label fw-semibold"
                    >
                      Descrição
                    </label>

                    <input
                      id="novo-descricao"
                      type="text"
                      className="form-control"
                      value={
                        novoRecebimento.descricao
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "descricao",
                          event.target.value
                        )
                      }
                      placeholder="Descrição do recebimento"
                    />

                  </div>

                  {/* VALOR */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-valor"
                      className="form-label fw-semibold"
                    >
                      Valor
                    </label>

                    <input
                      id="novo-valor"
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={
                        novoRecebimento.valor
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "valor",
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                      required
                    />

                  </div>

                  {/* DATA DE VENCIMENTO */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-vencimento"
                      className="form-label fw-semibold"
                    >
                      Data de vencimento
                    </label>

                    <input
                      id="novo-vencimento"
                      type="date"
                      className="form-control"
                      value={
                        novoRecebimento.data_vencimento
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "data_vencimento",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                  {/* FORMA DE PAGAMENTO */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-forma"
                      className="form-label fw-semibold"
                    >
                      Forma de pagamento
                    </label>

                    <select
                      id="novo-forma"
                      className="form-select"
                      value={
                        novoRecebimento.forma_pagamento
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "forma_pagamento",
                          event.target.value
                        )
                      }
                    >

                      <option value="Pix">
                        Pix
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

                    </select>

                  </div>

                  {/* STATUS */}

                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="novo-status"
                      className="form-label fw-semibold"
                    >
                      Status
                    </label>

                    <select
                      id="novo-status"
                      className="form-select"
                      value={
                        novoRecebimento.status
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "status",
                          event.target.value
                        )
                      }
                    >

                      <option value="Pendente">
                        Pendente
                      </option>

                      <option value="Recebido">
                        Recebido
                      </option>

                    </select>

                  </div>

                  {/* OBSERVAÇÕES */}

                  <div className="col-12">

                    <label
                      htmlFor="novo-observacoes"
                      className="form-label fw-semibold"
                    >
                      Observações
                    </label>

                    <textarea
                      id="novo-observacoes"
                      className="form-control"
                      rows="3"
                      value={
                        novoRecebimento.observacoes
                      }
                      onChange={(event) =>
                        alterarNovoRecebimento(
                          "observacoes",
                          event.target.value
                        )
                      }
                      placeholder="Observações do recebimento"
                    />

                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={
                    fecharNovoRecebimento
                  }
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={
                    salvarNovoRecebimento
                  }
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar recebimento"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL - CONFIRMAR PAGAMENTO */}

      {modalAberto &&
        recebimentoSelecionado && (
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{
              backgroundColor:
                "rgba(0, 0, 0, 0.5)",
            }}
          >

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content border-0 rounded-4 shadow">

                <div className="modal-header">

                  <div>

                    <h2 className="modal-title h5 fw-bold mb-1">
                      Confirmar recebimento
                    </h2>

                    <p className="text-muted small mb-0">
                      Confirme os dados do pagamento.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fechar"
                    onClick={
                      fecharConfirmacao
                    }
                    disabled={salvando}
                  />

                </div>

                <div className="modal-body">

                  <div className="bg-light rounded-3 p-3 mb-4">

                    <div className="d-flex justify-content-between mb-2">

                      <span className="text-muted">
                        Cliente
                      </span>

                      <strong>
                        {obterNomeCliente(
                          recebimentoSelecionado.cliente_id
                        )}
                      </strong>

                    </div>

                    <div className="d-flex justify-content-between">

                      <span className="text-muted">
                        Valor
                      </span>

                      <strong className="text-success">
                        {formatarMoeda(
                          recebimentoSelecionado.valor
                        )}
                      </strong>

                    </div>

                  </div>

                  <div className="mb-3">

                    <label
                      htmlFor="forma-pagamento-confirmacao"
                      className="form-label fw-semibold"
                    >
                      Forma de pagamento
                    </label>

                    <select
                      id="forma-pagamento-confirmacao"
                      className="form-select"
                      value={formaPagamento}
                      onChange={(event) =>
                        setFormaPagamento(
                          event.target.value
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

                      <option value="Cartão">
                        Cartão
                      </option>

                      <option value="Depósito">
                        Depósito
                      </option>

                    </select>

                  </div>

                  <div className="mb-3">

                    <label
                      htmlFor="data-pagamento"
                      className="form-label fw-semibold"
                    >
                      Data do pagamento
                    </label>

                    <input
                      id="data-pagamento"
                      type="date"
                      className="form-control"
                      value={dataPagamento}
                      onChange={(event) =>
                        setDataPagamento(
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      fecharConfirmacao
                    }
                    disabled={salvando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={
                      confirmarPagamento
                    }
                    disabled={salvando}
                  >
                    {salvando
                      ? "Confirmando..."
                      : "Confirmar pagamento"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}
      {/* FIM DOS MODAIS */}

    </main>
  )
}