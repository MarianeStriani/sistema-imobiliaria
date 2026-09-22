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

        /*
         * A coluna utilizada na tabela é
         * tipo_recebimento.
         */
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
  // INÍCIO DA INTERFACE
  // ========================================

  return (
    <div className="container-fluid py-4">
      {/* ================================== */}
      {/* ACESSO RÁPIDO */}
      {/* ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3"
              style={{
                width: "42px",
                height: "42px",
              }}
            >
              <i className="bi bi-grid fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>
            </div>

          </div>

          <div className="d-flex flex-wrap gap-2">

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/dashboard")
              }
            >
              <i className="bi bi-speedometer2 me-1"></i>
              Dashboard
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/clientes")
              }
            >
              <i className="bi bi-people me-1"></i>
              Clientes
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/imoveis")
              }
            >
              <i className="bi bi-house me-1"></i>
              Imóveis
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/contratos")
              }
            >
              <i className="bi bi-file-earmark-text me-1"></i>
              Contratos
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                acessarPagina("/recebimentos")
              }
            >
              <i className="bi bi-cash-coin me-1"></i>
              Recebimentos
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/despesas")
              }
            >
              <i className="bi bi-receipt me-1"></i>
              Despesas
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/financeiro")
              }
            >
              <i className="bi bi-bar-chart-line me-1"></i>
              Financeiro
            </button>

          </div>

        </div>
      </div>

      {/* ================================== */}
      {/* CABEÇALHO */}
      {/* ================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>

          <div className="d-flex align-items-center gap-2 mb-1">

            <div
              className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
              }}
            >
              <i className="bi bi-cash-coin fs-5"></i>
            </div>

            <h2 className="fw-bold mb-0">
              Recebimentos
            </h2>

          </div>

          <p className="text-muted mb-0">
            Gerencie os recebimentos do sistema.
          </p>

        </div>

        <div className="d-flex flex-wrap gap-2">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              limparMensagens()
              carregarDados()
            }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Atualizar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirNovoRecebimento}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Novo recebimento
          </button>

        </div>

      </div>

      {/* ================================== */}
      {/* ALERTA DE ERRO */}
      {/* ================================== */}

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

      {/* ================================== */}
      {/* ALERTA DE SUCESSO */}
      {/* ================================== */}

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
      {/* ================================== */}
      {/* PERÍODO */}
      {/* ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-12 col-md-5">

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
                <option value={1}>
                  Janeiro
                </option>

                <option value={2}>
                  Fevereiro
                </option>

                <option value={3}>
                  Março
                </option>

                <option value={4}>
                  Abril
                </option>

                <option value={5}>
                  Maio
                </option>

                <option value={6}>
                  Junho
                </option>

                <option value={7}>
                  Julho
                </option>

                <option value={8}>
                  Agosto
                </option>

                <option value={9}>
                  Setembro
                </option>

                <option value={10}>
                  Outubro
                </option>

                <option value={11}>
                  Novembro
                </option>

                <option value={12}>
                  Dezembro
                </option>
              </select>

            </div>

            <div className="col-12 col-md-4">

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
                    length: 5,
                  },
                  (_, indice) =>
                    hoje.getFullYear() -
                    2 +
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

            <div className="col-12 col-md-3">

              <div className="text-muted small">
                Período selecionado
              </div>

              <div className="fw-bold">
                {String(mes).padStart(2, "0")}/{ano}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ================================== */}
      {/* CARDS DE RESUMO */}
      {/* ================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Total
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalRecebimentos}
                  </h3>

                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-cash-stack"></i>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* RECEBIDOS */}
        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Recebidos
                  </p>

                  <h3 className="fw-bold mb-0 text-success">
                    {formatarMoeda(
                      valorRecebido
                    )}
                  </h3>

                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-check-circle"></i>
                </div>

              </div>

              <small className="text-muted">
                {recebidos.length} recebimento(s)
              </small>

            </div>

          </div>

        </div>

        {/* PENDENTES */}
        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Pendentes
                  </p>

                  <h3 className="fw-bold mb-0 text-warning">
                    {formatarMoeda(
                      valorPendente
                    )}
                  </h3>

                </div>

                <div className="fs-2 text-warning">
                  <i className="bi bi-clock-history"></i>
                </div>

              </div>

              <small className="text-muted">
                {pendentes.length} recebimento(s)
              </small>

            </div>

          </div>

        </div>

        {/* EM ABERTO */}
        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Em aberto
                  </p>

                  <h3 className="fw-bold mb-0">
                    {pendentes.length}
                  </h3>

                </div>

                <div className="fs-2 text-danger">
                  <i className="bi bi-exclamation-circle"></i>
                </div>

              </div>

              <small className="text-muted">
                aguardando recebimento
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* ================================== */}
      {/* FILTROS */}
      {/* ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-12 col-md-9">

              <label className="form-label fw-semibold">
                Buscar
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                  placeholder="Buscar por cliente, contrato, tipo ou descrição..."
                />

              </div>

            </div>

            <div className="col-12 col-md-3">

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => setBusca("")}
              >
                <i className="bi bi-x-circle me-1"></i>
                Limpar busca
              </button>

            </div>

          </div>

        </div>

      </div>
      {/* ================================== */}
      {/* LISTA DE RECEBIMENTOS */}
      {/* ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Recebimentos cadastrados
              </h5>

              <p className="text-muted mb-0">
                {recebimentosFiltrados.length} recebimento(s) encontrado(s).
              </p>

            </div>

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

              <div className="fs-1 text-muted mb-3">
                <i className="bi bi-cash-stack"></i>
              </div>

              <h5 className="fw-bold">
                Nenhum recebimento encontrado
              </h5>

              <p className="text-muted">
                Não há recebimentos para o período ou busca selecionada.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={abrirNovoRecebimento}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Cadastrar recebimento
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>

                  <tr>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Referente
                    </th>

                    <th>
                      Vencimento
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
                          {recebimento.forma_pagamento ||
                            "-"}
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

                        <td className="text-end">

                          <div className="d-flex justify-content-end gap-1">

                            {String(
                              recebimento.status || ""
                            ).toLowerCase() ===
                              "pendente" && (

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                title="Confirmar recebimento"
                                onClick={() =>
                                  abrirConfirmarRecebimento(
                                    recebimento
                                  )
                                }
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>

                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir"
                              onClick={() =>
                                excluirRecebimento(
                                  recebimento.id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
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

      {/* ================================== */}
      {/* MODAL - NOVO RECEBIMENTO */}
      {/* ================================== */}

      {novoRecebimentoAberto && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-scrollable">

            <div className="modal-content">

              {/* CABEÇALHO */}

              <div className="modal-header">

                <h5 className="modal-title fw-bold">

                  <i className="bi bi-cash-coin me-2"></i>

                  Novo recebimento

                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharNovoRecebimento}
                  disabled={salvando}
                ></button>

              </div>

              {/* CORPO */}

              <div className="modal-body">

                {/* CLIENTE E CONTRATO */}

                <div className="card border-0 bg-light mb-3">

                  <div className="card-body">

                    <h6 className="fw-bold mb-3">
                      Cliente e contrato
                    </h6>

                    <div className="row g-3">

                      {/* CLIENTE */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Cliente *
                        </label>

                        <select
                          className="form-select"
                          value={
                            novoRecebimento.cliente_id
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "cliente_id",
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Selecione um cliente
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

                        <label className="form-label">
                          Contrato
                        </label>

                        <select
                          className="form-select"
                          value={
                            novoRecebimento.contrato_id
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "contrato_id",
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Selecione um contrato
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

                    </div>

                  </div>

                </div>

                {/* DADOS DO RECEBIMENTO */}

                <div className="card border-0 bg-light mb-3">

                  <div className="card-body">

                    <h6 className="fw-bold mb-3">
                      Dados do recebimento
                    </h6>

                    <div className="row g-3">

                      {/* TIPO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Tipo
                        </label>

                        <select
                          className="form-select"
                          value={
                            novoRecebimento.tipo
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "tipo",
                              e.target.value
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
                      {/* DESCRIÇÃO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Descrição
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            novoRecebimento.descricao
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "descricao",
                              e.target.value
                            )
                          }
                          placeholder="Ex.: Aluguel referente ao mês"
                        />

                      </div>

                      {/* NÚMERO DO CONTRATO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Nº Contrato
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            novoRecebimento.numero_contrato
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "numero_contrato",
                              e.target.value
                            )
                          }
                          placeholder="Número do contrato"
                        />

                      </div>

                      {/* VALOR */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Valor *
                        </label>

                        <div className="input-group">

                          <span className="input-group-text">
                            R$
                          </span>

                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            step="0.01"
                            value={
                              novoRecebimento.valor
                            }
                            onChange={(e) =>
                              alterarNovoRecebimento(
                                "valor",
                                e.target.value
                              )
                            }
                            placeholder="0,00"
                          />

                        </div>

                      </div>

                      {/* DATA DE VENCIMENTO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Data de vencimento *
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            novoRecebimento.data_vencimento
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "data_vencimento",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* FORMA DE PAGAMENTO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Forma de pagamento
                        </label>

                        <select
                          className="form-select"
                          value={
                            novoRecebimento.forma_pagamento
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "forma_pagamento",
                              e.target.value
                            )
                          }
                        >

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

                      {/* STATUS */}

                      <div className="col-12 col-md-6">

                        <label className="form-label">
                          Status
                        </label>

                        <select
                          className="form-select"
                          value={
                            novoRecebimento.status
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "status",
                              e.target.value
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

                        <label className="form-label">
                          Observações
                        </label>

                        <textarea
                          className="form-control"
                          rows="3"
                          value={
                            novoRecebimento.observacoes
                          }
                          onChange={(e) =>
                            alterarNovoRecebimento(
                              "observacoes",
                              e.target.value
                            )
                          }
                          placeholder="Observações sobre o recebimento"
                        ></textarea>

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
                  onClick={fecharNovoRecebimento}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={salvarNovoRecebimento}
                  disabled={salvando}
                >

                  {salvando ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>

                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Cadastrar recebimento
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================================== */}
      {/* MODAL - CONFIRMAR RECEBIMENTO */}
      {/* ================================== */}

      {modalAberto &&
        recebimentoSelecionado && (

          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            style={{
              backgroundColor:
                "rgba(0, 0, 0, 0.5)",
            }}
          >

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content">

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

                <div className="modal-body">

                  <div className="alert alert-info">

                    <i className="bi bi-info-circle me-2"></i>

                    Confirme os dados do pagamento para
                    registrar este recebimento.

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Cliente
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        obterNomeCliente(
                          recebimentoSelecionado.cliente_id
                        )
                      }
                      disabled
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Valor
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={formatarMoeda(
                        recebimentoSelecionado.valor
                      )}
                      disabled
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Forma de pagamento *
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

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Data do pagamento *
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
                    onClick={confirmarPagamento}
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
                        <i className="bi bi-check-lg me-1"></i>
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