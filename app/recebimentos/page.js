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
  // CLIENTE
  // ========================================

  function obterNomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) =>
        String(item.id) === String(clienteId)
    )

    if (!cliente) {
      return "Cliente não informado"
    }

    return (
      cliente.nome ||
      cliente.nome_completo ||
      cliente.razao_social ||
      "Cliente"
    )
  }

  // ========================================
  // CONTRATO
  // ========================================

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

  // ========================================
  // STATUS
  // ========================================

  function obterStatus(recebimento) {
    return (
      recebimento.status ||
      recebimento.situacao ||
      "Pendente"
    )
  }

  // ========================================
  // DESCRIÇÃO
  // CORRIGIDO: tipo_recebimento
  // ========================================

  function obterDescricao(recebimento) {
    return (
      recebimento.descricao ||
      recebimento.tipo_recebimento ||
      "Recebimento"
    )
  }

  // ========================================
  // VERIFICAR SE ESTÁ PAGO
  // ========================================

  function estaPago(recebimento) {
    const status = String(
      obterStatus(recebimento)
    ).toLowerCase()

    return (
      status === "recebido" ||
      status === "pago"
    )
  }

  // ========================================
  // ABRIR NOVO RECEBIMENTO
  // ========================================

  function abrirNovoRecebimento() {
    limparMensagens()

    setNovoRecebimento({
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

    setNovoRecebimentoAberto(true)
  }

  // ========================================
  // FECHAR NOVO RECEBIMENTO
  // ========================================

  function fecharNovoRecebimento() {
    if (salvando) return

    setNovoRecebimentoAberto(false)
  }

  // ========================================
  // ALTERAR NOVO RECEBIMENTO
  // ========================================

  function alterarNovoRecebimento(
    campo,
    valor
  ) {
    setNovoRecebimento((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  // ========================================
  // CONFIRMAÇÃO DE RECEBIMENTO
  // ========================================

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
    if (salvando) return

    setModalAberto(false)

    setRecebimentoSelecionado(null)

    setFormaPagamento("")
  }

  // ========================================
  // CONFIRMAR RECEBIMENTO
  // ========================================

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
  // ========================================
  // PERÍODO
  // ========================================

  const recebimentosDoPeriodo =
    recebimentos.filter((recebimento) => {
      if (!recebimento.data_vencimento) {
        return false
      }

      const data = new Date(
        `${recebimento.data_vencimento}T00:00:00`
      )

      return (
        data.getMonth() + 1 === mes &&
        data.getFullYear() === ano
      )
    })

  // ========================================
  // BUSCA
  // ========================================

  const recebimentosFiltrados =
    recebimentosDoPeriodo.filter(
      (recebimento) => {
        const termo = busca
          .toLowerCase()
          .trim()

        if (!termo) {
          return true
        }

        const nomeCliente =
          obterNomeCliente(
            recebimento.cliente_id
          )

        const descricao =
          obterDescricao(recebimento)

        const numeroContrato =
          obterNumeroContrato(
            recebimento.contrato_id
          )

        return (
          nomeCliente
            .toLowerCase()
            .includes(termo) ||
          descricao
            .toLowerCase()
            .includes(termo) ||
          String(numeroContrato)
            .toLowerCase()
            .includes(termo)
        )
      }
    )

  // ========================================
  // PENDENTES
  // ========================================

  const recebimentosPendentes =
    recebimentosFiltrados.filter(
      (recebimento) =>
        !estaPago(recebimento)
    )

  // ========================================
  // RECEBIDOS
  // ========================================

  const recebimentosRecebidos =
    recebimentosFiltrados.filter(
      (recebimento) =>
        estaPago(recebimento)
    )

  // ========================================
  // TOTAL PENDENTE
  // ========================================

  const totalPendente =
    recebimentosPendentes.reduce(
      (total, recebimento) =>
        total +
        Number(
          recebimento.valor || 0
        ),
      0
    )

  // ========================================
  // TOTAL RECEBIDO
  // ========================================

  const totalRecebido =
    recebimentosRecebidos.reduce(
      (total, recebimento) =>
        total +
        Number(
          recebimento.valor || 0
        ),
      0
    )

  // ========================================
  // NOME DO MÊS
  // ========================================

  const nomeMes =
    new Date(
      ano,
      mes - 1,
      1
    ).toLocaleDateString(
      "pt-BR",
      {
        month: "long",
      }
    )

  // ========================================
  // MÊS ANTERIOR
  // ========================================

  function mesAnterior() {
    if (mes === 1) {
      setMes(12)
      setAno(ano - 1)
    } else {
      setMes(mes - 1)
    }
  }

  // ========================================
  // PRÓXIMO MÊS
  // ========================================

  function proximoMes() {
    if (mes === 12) {
      setMes(1)
      setAno(ano + 1)
    } else {
      setMes(mes + 1)
    }
  }

  // ========================================
  // SELECIONAR CLIENTE
  // ========================================

  function selecionarCliente(clienteId) {
    alterarNovoRecebimento(
      "cliente_id",
      clienteId
    )

    // Tenta localizar automaticamente
    // um contrato desse cliente.
    const contrato =
      contratos.find(
        (item) =>
          String(item.cliente_id) ===
          String(clienteId)
      )

    if (contrato) {
      alterarNovoRecebimento(
        "contrato_id",
        contrato.id
      )

      alterarNovoRecebimento(
        "numero_contrato",
        contrato.numero_contrato ||
          contrato.numero ||
          ""
      )
    } else {
      alterarNovoRecebimento(
        "contrato_id",
        ""
      )

      alterarNovoRecebimento(
        "numero_contrato",
        ""
      )
    }
  }

  // ========================================
  // CONTRATOS DO CLIENTE
  // ========================================

  const contratosDoCliente =
    useMemo(() => {
      if (
        !novoRecebimento.cliente_id
      ) {
        return []
      }

      return contratos.filter(
        (contrato) =>
          String(
            contrato.cliente_id
          ) ===
          String(
            novoRecebimento.cliente_id
          )
      )
    }, [
      contratos,
      novoRecebimento.cliente_id,
    ])

  // ========================================
  // SELECIONAR CONTRATO
  // ========================================

  function selecionarContrato(
    contratoId
  ) {
    alterarNovoRecebimento(
      "contrato_id",
      contratoId
    )

    const contrato =
      contratos.find(
        (item) =>
          String(item.id) ===
          String(contratoId)
      )

    if (contrato) {
      alterarNovoRecebimento(
        "numero_contrato",
        contrato.numero_contrato ||
          contrato.numero ||
          ""
      )

      if (
        contrato.valor &&
        !novoRecebimento.valor
      ) {
        alterarNovoRecebimento(
          "valor",
          contrato.valor
        )
      }
    }
  }

  // ========================================
  // SALVAR NOVO RECEBIMENTO
  // ========================================

  async function salvarNovoRecebimento() {
    limparMensagens()

    if (
      !novoRecebimento.cliente_id
    ) {
      setErro(
        "Selecione um cliente."
      )
      return
    }

    if (
      !novoRecebimento.valor
    ) {
      setErro(
        "Informe o valor do recebimento."
      )
      return
    }

    if (
      !novoRecebimento.data_vencimento
    ) {
      setErro(
        "Informe a data de vencimento."
      )
      return
    }

    const valorNumerico =
      Number(
        String(
          novoRecebimento.valor
        )
          .replace(/\./g, "")
          .replace(",", ".")
      )

    if (
      Number.isNaN(valorNumerico) ||
      valorNumerico <= 0
    ) {
      setErro(
        "Informe um valor válido."
      )
      return
    }

    try {
      setSalvando(true)

      const dados = {
        cliente_id:
          novoRecebimento.cliente_id ||
          null,

        contrato_id:
          novoRecebimento.contrato_id ||
          null,

        // ==================================
        // CORREÇÃO PRINCIPAL
        // ==================================
        tipo_recebimento:
          novoRecebimento.tipo,

        descricao:
          novoRecebimento.descricao ||
          null,

        numero_contrato:
          novoRecebimento.numero_contrato ||
          null,

        valor:
          valorNumerico,

        data_vencimento:
          novoRecebimento.data_vencimento,

        forma_pagamento:
          novoRecebimento.forma_pagamento ||
          null,

        status:
          novoRecebimento.status ||
          "Pendente",

        observacoes:
          novoRecebimento.observacoes ||
          null,
      }

      const { error } =
        await supabase
          .from("recebimentos")
          .insert([dados])

      if (error) {
        throw error
      }

      setNovoRecebimentoAberto(
        false
      )

      setSucesso(
        "Recebimento cadastrado com sucesso!"
      )

      await carregarDados()

    } catch (error) {
      console.error(
        "Erro ao salvar recebimento:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível salvar o recebimento."
      )

    } finally {
      setSalvando(false)
    }
  }
  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="container-fluid py-4">

      {/* ========================================
          CABEÇALHO
      ======================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Recebimentos
          </h2>

          <p className="text-muted mb-0">
            Controle dos recebimentos da imobiliária
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirNovoRecebimento}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Novo recebimento
        </button>

      </div>

      {/* ========================================
          MENSAGEM DE ERRO
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
          ></button>
        </div>
      )}

      {/* ========================================
          MENSAGEM DE SUCESSO
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
          ></button>
        </div>
      )}

      {/* ========================================
          ACESSO RÁPIDO
      ======================================== */}

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
                className="btn btn-primary w-100 py-2"
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
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/financeiro")
                }
              >
                <i className="bi bi-bar-chart-line d-block fs-5 mb-1"></i>
                Financeiro
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/manutencoes")
                }
              >
                <i className="bi bi-tools d-block fs-5 mb-1"></i>
                Manutenções
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/visitas")
                }
              >
                <i className="bi bi-calendar-check d-block fs-5 mb-1"></i>
                Visitas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/comunicacao")
                }
              >
                <i className="bi bi-whatsapp d-block fs-5 mb-1"></i>
                Comunicação
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/relatorios")
                }
              >
                <i className="bi bi-file-earmark-bar-graph d-block fs-5 mb-1"></i>
                Relatórios
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/configuracoes")
                }
              >
                <i className="bi bi-gear d-block fs-5 mb-1"></i>
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

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Período
              </h5>

              <small className="text-muted">
                Consulte os recebimentos por mês
              </small>
            </div>

            <div className="d-flex align-items-center gap-2">

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={mesAnterior}
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              <div
                className="text-center"
                style={{
                  minWidth: "160px",
                }}
              >
                <strong className="text-capitalize">
                  {nomeMes}
                </strong>

                <div className="small text-muted">
                  {ano}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={proximoMes}
              >
                <i className="bi bi-chevron-right"></i>
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* ========================================
          BUSCA
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

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
              placeholder="Cliente, contrato ou descrição..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
            />

          </div>

        </div>
      </div>
      {/* ========================================
          RESUMO
      ======================================== */}

      <div className="row g-3 mb-4">

        {/* PENDENTE */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center">

                <div
                  className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-clock-history text-warning fs-4"></i>
                </div>

                <div>
                  <small className="text-muted">
                    Pendente
                  </small>

                  <h4 className="fw-bold mb-0">
                    {formatarMoeda(totalPendente)}
                  </h4>
                </div>

              </div>

              <hr />

              <small className="text-muted">
                {recebimentosPendentes.length}{" "}
                recebimento(s) pendente(s)
              </small>

            </div>
          </div>
        </div>

        {/* RECEBIDO */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center">

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>

                <div>
                  <small className="text-muted">
                    Recebido
                  </small>

                  <h4 className="fw-bold mb-0">
                    {formatarMoeda(totalRecebido)}
                  </h4>
                </div>

              </div>

              <hr />

              <small className="text-muted">
                {recebimentosRecebidos.length}{" "}
                recebimento(s) recebido(s)
              </small>

            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center">

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
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

              <hr />

              <small className="text-muted">
                {recebimentosFiltrados.length}{" "}
                recebimento(s) no período
              </small>

            </div>
          </div>
        </div>

      </div>

      {/* ========================================
          RECEBIMENTOS PENDENTES
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Recebimentos pendentes
              </h5>

              <small className="text-muted">
                Valores que ainda precisam ser recebidos
              </small>
            </div>

            <span className="badge text-bg-warning">
              {recebimentosPendentes.length}
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

          ) : recebimentosPendentes.length === 0 ? (

            <div className="text-center py-5">

              <div
                className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-check-lg text-success fs-2"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum recebimento pendente
              </h6>

              <p className="text-muted mb-0">
                Não existem recebimentos pendentes
                para o período selecionado.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>Vencimento</th>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Contrato</th>
                    <th>Forma</th>
                    <th className="text-end">
                      Valor
                    </th>
                    <th className="text-center">
                      Ação
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {recebimentosPendentes.map(
                    (recebimento) => (

                      <tr
                        key={
                          recebimento.id
                        }
                      >

                        <td>
                          {formatarData(
                            recebimento.data_vencimento
                          )}
                        </td>

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
                          {recebimento.forma_pagamento ||
                            "-"}
                        </td>

                        <td className="text-end fw-semibold">
                          {formatarMoeda(
                            recebimento.valor
                          )}
                        </td>

                        <td className="text-center">

                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              abrirConfirmacao(
                                recebimento
                              )
                            }
                          >
                            <i className="bi bi-check2-circle me-1"></i>

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
      {/* ========================================
          RECEBIMENTOS RECEBIDOS
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Recebimentos recebidos
              </h5>

              <small className="text-muted">
                Valores já confirmados
              </small>
            </div>

            <span className="badge text-bg-success">
              {recebimentosRecebidos.length}
            </span>

          </div>

          {recebimentosRecebidos.length === 0 ? (

            <div className="text-center py-5">

              <div
                className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-receipt text-secondary fs-2"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum recebimento encontrado
              </h6>

              <p className="text-muted mb-0">
                Não existem recebimentos confirmados
                para o período selecionado.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>Vencimento</th>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Contrato</th>
                    <th>Pagamento</th>
                    <th className="text-end">
                      Valor
                    </th>
                    <th className="text-center">
                      Status
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {recebimentosRecebidos.map(
                    (recebimento) => (

                      <tr
                        key={
                          recebimento.id
                        }
                      >

                        <td>
                          {formatarData(
                            recebimento.data_vencimento
                          )}
                        </td>

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
                          <div>
                            {recebimento.forma_pagamento ||
                              "-"}

                            {recebimento.data_pagamento && (
                              <small className="text-muted d-block">
                                {formatarData(
                                  recebimento.data_pagamento
                                )}
                              </small>
                            )}
                          </div>
                        </td>

                        <td className="text-end fw-semibold text-success">
                          {formatarMoeda(
                            recebimento.valor
                          )}
                        </td>

                        <td className="text-center">

                          <span className="badge text-bg-success">
                            <i className="bi bi-check-circle me-1"></i>
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
      {/* ========================================
          MODAL - NOVO RECEBIMENTO
      ======================================== */}

      {novoRecebimentoAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO */}
              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    Novo recebimento
                  </h5>

                  <small className="text-muted">
                    Cadastre um novo recebimento
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={
                    fecharNovoRecebimento
                  }
                  disabled={salvando}
                ></button>

              </div>

              {/* CORPO */}
              <div className="modal-body">

                <div className="row g-3">

                  {/* CLIENTE */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Cliente
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <select
                      className="form-select"
                      value={
                        novoRecebimento.cliente_id
                      }
                      onChange={(e) =>
                        selecionarCliente(
                          e.target.value
                        )
                      }
                      disabled={salvando}
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
                            {cliente.nome ||
                              cliente.nome_completo ||
                              cliente.razao_social ||
                              "Cliente"}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                  {/* TIPO */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Tipo de recebimento
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
                      disabled={salvando}
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
                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Descrição
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex.: Aluguel referente ao mês..."
                      value={
                        novoRecebimento.descricao
                      }
                      onChange={(e) =>
                        alterarNovoRecebimento(
                          "descricao",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    />

                  </div>

                  {/* CONTRATO */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      N° do Contrato
                    </label>

                    <select
                      className="form-select"
                      value={
                        novoRecebimento.contrato_id
                      }
                      onChange={(e) =>
                        selecionarContrato(
                          e.target.value
                        )
                      }
                      disabled={
                        salvando ||
                        !novoRecebimento.cliente_id
                      }
                    >

                      <option value="">
                        {novoRecebimento.cliente_id
                          ? "Selecione o contrato"
                          : "Selecione primeiro o cliente"}
                      </option>

                      {contratosDoCliente.map(
                        (contrato) => (

                          <option
                            key={contrato.id}
                            value={contrato.id}
                          >
                            {contrato.numero_contrato ||
                              contrato.numero ||
                              `Contrato #${contrato.id}`}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                  {/* VALOR */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Valor
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <div className="input-group">

                      <span className="input-group-text">
                        R$
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="0,00"
                        value={
                          novoRecebimento.valor
                        }
                        onChange={(e) =>
                          alterarNovoRecebimento(
                            "valor",
                            e.target.value
                          )
                        }
                        disabled={salvando}
                      />

                    </div>

                  </div>

                  {/* DATA DE VENCIMENTO */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Data de vencimento
                      <span className="text-danger">
                        {" "}*
                      </span>
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
                      disabled={salvando}
                    />

                  </div>

                  {/* FORMA DE PAGAMENTO */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
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
                      disabled={salvando}
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

                    <label className="form-label fw-semibold">
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
                      disabled={salvando}
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

                    <label className="form-label fw-semibold">
                      Observações
                    </label>

                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Informações adicionais..."
                      value={
                        novoRecebimento.observacoes
                      }
                      onChange={(e) =>
                        alterarNovoRecebimento(
                          "observacoes",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    ></textarea>

                  </div>

                </div>

              </div>

              {/* RODAPÉ */}
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
                      Salvar recebimento
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}
      {/* ========================================
          MODAL - CONFIRMAR RECEBIMENTO
      ======================================== */}

      {modalAberto &&
        recebimentoSelecionado && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{
              backgroundColor:
                "rgba(0, 0, 0, 0.5)",
            }}
          >

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content border-0 shadow">

                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold mb-1">
                      Confirmar recebimento
                    </h5>

                    <small className="text-muted">
                      Registre o pagamento recebido
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={
                      fecharConfirmacao
                    }
                    disabled={salvando}
                  ></button>

                </div>

                <div className="modal-body">

                  <div className="bg-light rounded p-3 mb-4">

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

                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        Valor
                      </span>

                      <strong className="text-success">
                        {formatarMoeda(
                          recebimentoSelecionado.valor
                        )}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span className="text-muted">
                        Vencimento
                      </span>

                      <strong>
                        {formatarData(
                          recebimentoSelecionado.data_vencimento
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Forma de pagamento
                    </label>

                    <select
                      className="form-select"
                      value={
                        formaPagamento
                      }
                      onChange={(e) =>
                        setFormaPagamento(
                          e.target.value
                        )
                      }
                      disabled={salvando}
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

                  <div>

                    <label className="form-label fw-semibold">
                      Data do pagamento
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={
                        dataPagamento
                      }
                      onChange={(e) =>
                        setDataPagamento(
                          e.target.value
                        )
                      }
                      disabled={salvando}
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
                      confirmarRecebimento
                    }
                    disabled={
                      salvando ||
                      !formaPagamento
                    }
                  >

                    {salvando ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        Confirmando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Confirmar recebimento
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </div>
        )}
      {/* ========================================
          FIM DA PÁGINA
      ======================================== */}

    </div>
  )
}