"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { supabase } from "../../lib/supabase"

export default function Recebimentos() {
  const hoje = new Date()

  // ========================================
  // DADOS
  // ========================================

  const [recebimentos, setRecebimentos] =
    useState([])

  const [clientes, setClientes] =
    useState([])

  const [contratos, setContratos] =
    useState([])

  // ========================================
  // CONTROLE
  // ========================================

  const [loading, setLoading] =
    useState(true)

  const [salvando, setSalvando] =
    useState(false)

  const [erro, setErro] =
    useState("")

  const [sucesso, setSucesso] =
    useState("")

  // ========================================
  // PERÍODO
  // ========================================

  const [mes, setMes] = useState(
    hoje.getMonth() + 1
  )

  const [ano, setAno] = useState(
    hoje.getFullYear()
  )

  const [busca, setBusca] =
    useState("")

  // ========================================
  // MODAL NOVO RECEBIMENTO
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
  // MODAL CONFIRMAR RECEBIMENTO
  // ========================================

  const [
    modalAberto,
    setModalAberto,
  ] = useState(false)

  const [
    recebimentoSelecionado,
    setRecebimentoSelecionado,
  ] = useState(null)

  const [
    formaPagamento,
    setFormaPagamento,
  ] = useState("")

  const [
    dataPagamento,
    setDataPagamento,
  ] = useState(
    hoje.toISOString().split("T")[0]
  )
  // ========================================
  // CARREGAR DADOS
  // ========================================

  async function carregarDados() {
    try {
      setLoading(true)
      setErro("")

      const [
        { data: dadosRecebimentos, error: erroRecebimentos },
        { data: dadosClientes, error: erroClientes },
        { data: dadosContratos, error: erroContratos },
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

      if (erroRecebimentos) {
        throw new Error(
          `Erro ao carregar recebimentos: ${erroRecebimentos.message}`
        )
      }

      if (erroClientes) {
        throw new Error(
          `Erro ao carregar clientes: ${erroClientes.message}`
        )
      }

      if (erroContratos) {
        throw new Error(
          `Erro ao carregar contratos: ${erroContratos.message}`
        )
      }

      setRecebimentos(dadosRecebimentos || [])
      setClientes(dadosClientes || [])
      setContratos(dadosContratos || [])
    } catch (error) {
      console.error(error)

      setErro(
        error?.message ||
          "Não foi possível carregar os dados."
      )
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // CARREGAR AO ABRIR A PÁGINA
  // ========================================

  useEffect(() => {
    carregarDados()
  }, [])

  // ========================================
  // LIMPAR MENSAGENS
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
  // FORMATAÇÃO DE MOEDA
  // ========================================

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  // ========================================
  // FORMATAÇÃO DE DATA
  // ========================================

  function formatarData(data) {
    if (!data) return "-"

    const partes = String(data).split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  // ========================================
  // OBTÉM MÊS E ANO
  // ========================================

  function obterMesAno(data) {
    if (!data) return null

    const partes = String(data).split("-")

    if (partes.length < 2) {
      return null
    }

    return {
      mes: Number(partes[1]),
      ano: Number(partes[0]),
    }
  }

  // ========================================
  // NOME DO CLIENTE
  // ========================================

  function nomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) =>
        String(item.id) === String(clienteId)
    )

    if (!cliente) {
      return "Cliente não identificado"
    }

    return (
      cliente.nome ||
      cliente.razao_social ||
      cliente.nome_completo ||
      `Cliente #${cliente.id}`
    )
  }

  // ========================================
  // CONTRATO RELACIONADO
  // ========================================

  function contratoRelacionado(contratoId) {
    if (!contratoId) {
      return null
    }

    return (
      contratos.find(
        (item) =>
          String(item.id) === String(contratoId)
      ) || null
    )
  }

  // ========================================
  // NÚMERO DO CONTRATO
  // ========================================

  function numeroDoContrato(contratoId) {
    const contrato = contratoRelacionado(
      contratoId
    )

    if (!contrato) {
      return contratoId
        ? `Contrato #${contratoId}`
        : "-"
    }

    return (
      contrato.numero ||
      contrato.numero_contrato ||
      contrato.codigo ||
      `Contrato #${contrato.id}`
    )
  }
  // ========================================
  // RECEBIMENTOS DO PERÍODO
  // ========================================

  const recebimentosDoPeriodo = useMemo(() => {
    return recebimentos.filter((item) => {
      const info = obterMesAno(
        item.data_vencimento
      )

      if (!info) return false

      return (
        info.mes === Number(mes) &&
        info.ano === Number(ano)
      )
    })
  }, [recebimentos, mes, ano])

  // ========================================
  // RECEBIMENTOS FILTRADOS
  // ========================================

  const recebimentosFiltrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase()

    if (!termo) {
      return recebimentosDoPeriodo
    }

    return recebimentosDoPeriodo.filter(
      (item) => {
        const cliente = nomeCliente(
          item.cliente_id
        )

        const contrato = numeroDoContrato(
          item.contrato_id
        )

        return [
          cliente,
          item.descricao,
          item.tipo,
          item.status,
          contrato,
          item.numero_contrato,
        ]
          .filter(Boolean)
          .some((valor) =>
            String(valor)
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
  // PENDENTES
  // ========================================

  const recebimentosPendentes =
    useMemo(() => {
      return recebimentosFiltrados.filter(
        (item) => {
          const status = String(
            item.status || ""
          ).toLowerCase()

          return ![
            "pago",
            "recebido",
            "realizado",
          ].includes(status)
        }
      )
    }, [recebimentosFiltrados])

  // ========================================
  // RECEBIDOS
  // ========================================

  const recebimentosRealizados =
    useMemo(() => {
      return recebimentosFiltrados.filter(
        (item) => {
          const status = String(
            item.status || ""
          ).toLowerCase()

          return [
            "pago",
            "recebido",
            "realizado",
          ].includes(status)
        }
      )
    }, [recebimentosFiltrados])

  // ========================================
  // RESUMO
  // ========================================

  const resumo = useMemo(() => {
    const total = recebimentosFiltrados.reduce(
      (soma, item) =>
        soma + Number(item.valor || 0),
      0
    )

    const pendente =
      recebimentosPendentes.reduce(
        (soma, item) =>
          soma + Number(item.valor || 0),
        0
      )

    const recebido =
      recebimentosRealizados.reduce(
        (soma, item) =>
          soma + Number(item.valor || 0),
        0
      )

    return {
      total,
      pendente,
      recebido,
      quantidade: recebimentosFiltrados.length,
    }
  }, [
    recebimentosFiltrados,
    recebimentosPendentes,
    recebimentosRealizados,
  ])

  // ========================================
  // ALTERAR CAMPO DO NOVO RECEBIMENTO
  // ========================================

  function alterarCampoNovoRecebimento(
    campo,
    valor
  ) {
    setNovoRecebimento((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  // ========================================
  // ABRIR MODAL NOVO RECEBIMENTO
  // ========================================

  function abrirNovoRecebimento() {
    limparMensagens()

    const dataAtual =
      new Date().toISOString().split("T")[0]

    setNovoRecebimento({
      cliente_id: "",
      contrato_id: "",
      tipo: "Aluguel mensal",
      descricao: "",
      numero_contrato: "",
      valor: "",
      data_vencimento: dataAtual,
      forma_pagamento: "Pix",
      status: "Pendente",
      observacoes: "",
    })

    setNovoRecebimentoAberto(true)
  }

  // ========================================
  // FECHAR MODAL NOVO RECEBIMENTO
  // ========================================

  function fecharNovoRecebimento() {
    if (salvando) return

    setNovoRecebimentoAberto(false)
  }
  // ========================================
  // SALVAR NOVO RECEBIMENTO
  // ========================================

  async function salvarNovoRecebimento(e) {
    e.preventDefault()

    limparMensagens()

    // ----------------------------------------
    // VALIDAÇÕES
    // ----------------------------------------

    if (!novoRecebimento.cliente_id) {
      setErro("Selecione um cliente.")
      return
    }

    if (!novoRecebimento.tipo) {
      setErro(
        "Selecione o tipo de recebimento."
      )
      return
    }

    if (!novoRecebimento.valor) {
      setErro("Informe o valor do recebimento.")
      return
    }

    if (!novoRecebimento.data_vencimento) {
      setErro(
        "Informe a data de vencimento."
      )
      return
    }

    try {
      setSalvando(true)

      // --------------------------------------
      // DADOS PARA O SUPABASE
      // --------------------------------------

      const dados = {
        cliente_id: novoRecebimento.cliente_id,
        contrato_id:
          novoRecebimento.contrato_id || null,

        tipo: novoRecebimento.tipo,

        descricao:
          novoRecebimento.descricao || null,

        valor: Number(
          String(novoRecebimento.valor)
            .replace(/\./g, "")
            .replace(",", ".")
        ),

        data_vencimento:
          novoRecebimento.data_vencimento,

        forma_pagamento:
          novoRecebimento.forma_pagamento ||
          null,

        status:
          novoRecebimento.status ===
          "Recebido"
            ? "pago"
            : "pendente",

        observacoes:
          novoRecebimento.observacoes || null,
      }

      // --------------------------------------
      // SE FOR RECEBIDO, REGISTRA A DATA
      // --------------------------------------

      if (
        novoRecebimento.status ===
        "Recebido"
      ) {
        dados.data_recebimento =
          new Date()
            .toISOString()
            .split("T")[0]
      }

      // --------------------------------------
      // INSERIR
      // --------------------------------------

      const { data, error } =
        await supabase
          .from("recebimentos")
          .insert([dados])
          .select()
          .single()

      if (error) {
        console.error(
          "Erro ao salvar recebimento:",
          error
        )

        throw new Error(
          error.message ||
            "Não foi possível salvar o recebimento."
        )
      }

      // --------------------------------------
      // ATUALIZAR LISTA
      // --------------------------------------

      setRecebimentos((anterior) => [
        data,
        ...anterior,
      ])

      // --------------------------------------
      // FECHAR MODAL
      // --------------------------------------

      setNovoRecebimentoAberto(false)

      // --------------------------------------
      // MENSAGEM DE SUCESSO
      // --------------------------------------

      setSucesso(
        "Recebimento cadastrado com sucesso."
      )

      // --------------------------------------
      // LIMPAR FORMULÁRIO
      // --------------------------------------

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

      // --------------------------------------
      // REMOVE A MENSAGEM APÓS ALGUNS
      // SEGUNDOS
      // --------------------------------------

      setTimeout(() => {
        setSucesso("")
      }, 4000)
    } catch (error) {
      console.error(error)

      setErro(
        error?.message ||
          "Erro ao cadastrar recebimento."
      )
    } finally {
      setSalvando(false)
    }
  }

  // ========================================
  // QUANDO SELECIONAR UM CONTRATO
  // PREENCHE O NÚMERO DO CONTRATO
  // ========================================

  function selecionarContrato(contratoId) {
    const contrato = contratoRelacionado(
      contratoId
    )

    setNovoRecebimento((anterior) => ({
      ...anterior,

      contrato_id: contratoId,

      numero_contrato: contrato
        ? numeroDoContrato(contrato.id)
        : "",
    }))
  }

  // ========================================
  // ABRIR CONFIRMAÇÃO DE RECEBIMENTO
  // ========================================

  function abrirConfirmacaoRecebimento(
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
      recebimento.data_recebimento ||
        new Date()
          .toISOString()
          .split("T")[0]
    )

    setModalAberto(true)
  }

  // ========================================
  // FECHAR MODAL DE CONFIRMAÇÃO
  // ========================================

  function fecharModal() {
    setModalAberto(false)
    setRecebimentoSelecionado(null)
  }
  // ========================================
  // CONFIRMAR RECEBIMENTO
  // ========================================

  async function confirmarRecebimento() {
    if (!recebimentoSelecionado) {
      return
    }

    try {
      setSalvando(true)
      limparMensagens()

      const { data, error } = await supabase
        .from("recebimentos")
        .update({
          status: "pago",
          forma_pagamento:
            formaPagamento || null,
          data_recebimento:
            dataPagamento || null,
        })
        .eq(
          "id",
          recebimentoSelecionado.id
        )
        .select()
        .single()

      if (error) {
        console.error(
          "Erro ao confirmar recebimento:",
          error
        )

        throw new Error(
          error.message ||
            "Não foi possível confirmar o recebimento."
        )
      }

      // --------------------------------------
      // ATUALIZA A LISTA NA TELA
      // --------------------------------------

      setRecebimentos((anterior) =>
        anterior.map((item) =>
          item.id === data.id
            ? data
            : item
        )
      )

      // --------------------------------------
      // FECHA O MODAL
      // --------------------------------------

      setModalAberto(false)
      setRecebimentoSelecionado(null)

      // --------------------------------------
      // MENSAGEM
      // --------------------------------------

      setSucesso(
        "Recebimento confirmado com sucesso."
      )

      setTimeout(() => {
        setSucesso("")
      }, 4000)
    } catch (error) {
      console.error(error)

      setErro(
        error?.message ||
          "Erro ao confirmar recebimento."
      )
    } finally {
      setSalvando(false)
    }
  }

  // ========================================
  // ALTERAR MÊS
  // ========================================

  function alterarMes(valor) {
    const novoMes = Number(valor)

    if (novoMes < 1) {
      setMes(12)
      setAno((anterior) => anterior - 1)
      return
    }

    if (novoMes > 12) {
      setMes(1)
      setAno((anterior) => anterior + 1)
      return
    }

    setMes(novoMes)
  }

  // ========================================
  // LIMPAR BUSCA
  // ========================================

  function limparBusca() {
    setBusca("")
  }

  // ========================================
  // STATUS EXIBIDO
  // ========================================

  function textoStatus(status) {
    const valor = String(
      status || ""
    ).toLowerCase()

    if (
      [
        "pago",
        "recebido",
        "realizado",
      ].includes(valor)
    ) {
      return "Recebido"
    }

    return "Pendente"
  }

  // ========================================
  // CLASSE DO STATUS
  // ========================================

  function classeStatus(status) {
    const valor = String(
      status || ""
    ).toLowerCase()

    if (
      [
        "pago",
        "recebido",
        "realizado",
      ].includes(valor)
    ) {
      return "bg-success-subtle text-success"
    }

    return "bg-warning-subtle text-warning-emphasis"
  }

  // ========================================
  // CLASSE DO TIPO
  // ========================================

  function textoTipo(tipo) {
    if (!tipo) return "-"

    const valor = String(tipo)
      .toLowerCase()

    if (
      valor === "aluguel" ||
      valor === "aluguel mensal"
    ) {
      return "Aluguel mensal"
    }

    if (valor === "diaria") {
      return "Diária"
    }

    if (
      valor === "venda_unitaria" ||
      valor === "venda unitária"
    ) {
      return "Venda unitária"
    }

    if (
      valor === "venda_parcelada" ||
      valor === "venda parcelada"
    ) {
      return "Venda parcelada"
    }

    return tipo
  }

  // ========================================
  // CLASSE DA FORMA DE PAGAMENTO
  // ========================================

  function textoFormaPagamento(
    forma
  ) {
    if (!forma) return "-"

    const valor = String(forma)
      .toLowerCase()

    if (valor === "dinheiro") {
      return "Dinheiro"
    }

    if (
      valor === "cartao" ||
      valor === "cartão"
    ) {
      return "Cartão"
    }

    if (valor === "deposito") {
      return "Depósito"
    }

    if (valor === "pix") {
      return "Pix"
    }

    return forma
  }
  return (
    <main className="container-fluid py-4">

      {/* ========================================
          CABEÇALHO
      ======================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

        <div>
          <h1 className="fw-bold mb-1">
            Recebimentos
          </h1>

          <p className="text-muted mb-0">
            Controle de recebimentos e valores
            a receber
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary mt-3 mt-md-0"
          onClick={abrirNovoRecebimento}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Novo recebimento
        </button>

      </div>


      {/* ========================================
          ACESSO RÁPIDO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10
                         text-primary rounded-circle
                         d-flex align-items-center
                         justify-content-center me-2"
              style={{
                width: "38px",
                height: "38px",
              }}
            >
              <i className="bi bi-lightning-charge-fill"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>

              <small className="text-muted">
                Acesse rapidamente os módulos
                do sistema
              </small>
            </div>

          </div>


          <div className="d-flex flex-wrap gap-2">

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/")
              }
            >
              <i className="bi bi-speedometer2 me-1"></i>
              Dashboard
            </button>


            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                acessarPagina("/clientes")
              }
            >
              <i className="bi bi-people me-1"></i>
              Clientes
            </button>


            <button
              type="button"
              className="btn btn-outline-success"
              onClick={() =>
                acessarPagina("/imoveis")
              }
            >
              <i className="bi bi-house me-1"></i>
              Imóveis
            </button>


            <button
              type="button"
              className="btn btn-outline-warning"
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
            >
              <i className="bi bi-cash-stack me-1"></i>
              Recebimentos
            </button>


            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() =>
                acessarPagina("/despesas")
              }
            >
              <i className="bi bi-wallet2 me-1"></i>
              Despesas
            </button>


            <button
              type="button"
              className="btn btn-outline-info"
              onClick={() =>
                acessarPagina("/financeiro")
              }
            >
              <i className="bi bi-bank me-1"></i>
              Financeiro
            </button>


            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() =>
                acessarPagina("/manutencoes")
              }
            >
              <i className="bi bi-tools me-1"></i>
              Manutenções
            </button>


            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                acessarPagina("/visitas")
              }
            >
              <i className="bi bi-calendar-check me-1"></i>
              Visitas
            </button>


            <button
              type="button"
              className="btn btn-outline-success"
              onClick={() =>
                acessarPagina("/comunicacao")
              }
            >
              <i className="bi bi-whatsapp me-1"></i>
              Comunicação
            </button>


            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/relatorios")
              }
            >
              <i className="bi bi-bar-chart me-1"></i>
              Relatórios
            </button>


            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() =>
                acessarPagina("/configuracoes")
              }
            >
              <i className="bi bi-gear me-1"></i>
              Configurações
            </button>

          </div>

        </div>

      </div>


      {/* ========================================
          MENSAGENS
      ======================================== */}

      {erro && (
        <div
          className="alert alert-danger
                     alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {erro}

          <button
            type="button"
            className="btn-close"
            onClick={() => setErro("")}
          ></button>
        </div>
      )}


      {sucesso && (
        <div
          className="alert alert-success
                     alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}
      {/* ========================================
          PERÍODO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10
                         text-primary rounded-circle
                         d-flex align-items-center
                         justify-content-center me-2"
              style={{
                width: "38px",
                height: "38px",
              }}
            >
              <i className="bi bi-calendar3"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Período
              </h5>

              <small className="text-muted">
                Selecione o mês e o ano
              </small>
            </div>

          </div>


          <div className="row g-3">

            {/* MÊS */}

            <div className="col-12 col-md-4">

              <label className="form-label fw-semibold">
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


            {/* ANO */}

            <div className="col-12 col-md-4">

              <label className="form-label fw-semibold">
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
                  {
                    length: 7,
                  },
                  (_, index) =>
                    new Date().getFullYear() -
                    3 +
                    index
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


            {/* BUSCA */}

            <div className="col-12 col-md-4">

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
                    onClick={limparBusca}
                    title="Limpar busca"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================
          RESUMO
      ======================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}

        <div className="col-12 col-md-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Total
                  </p>

                  <h4 className="fw-bold mb-0">
                    {formatarMoeda(
                      resumo.total
                    )}
                  </h4>
                </div>

                <div
                  className="bg-primary bg-opacity-10
                             text-primary rounded-circle
                             d-flex align-items-center
                             justify-content-center"
                  style={{
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-cash-stack"></i>
                </div>

              </div>

              <small className="text-muted">
                {resumo.quantidade} recebimento(s)
              </small>

            </div>

          </div>

        </div>


        {/* PENDENTE */}

        <div className="col-12 col-md-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Pendente
                  </p>

                  <h4 className="fw-bold mb-0 text-warning">
                    {formatarMoeda(
                      resumo.pendente
                    )}
                  </h4>
                </div>

                <div
                  className="bg-warning bg-opacity-10
                             text-warning rounded-circle
                             d-flex align-items-center
                             justify-content-center"
                  style={{
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-clock"></i>
                </div>

              </div>

              <small className="text-muted">
                Aguardando pagamento
              </small>

            </div>

          </div>

        </div>


        {/* RECEBIDO */}

        <div className="col-12 col-md-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Recebido
                  </p>

                  <h4 className="fw-bold mb-0 text-success">
                    {formatarMoeda(
                      resumo.recebido
                    )}
                  </h4>
                </div>

                <div
                  className="bg-success bg-opacity-10
                             text-success rounded-circle
                             d-flex align-items-center
                             justify-content-center"
                  style={{
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-check-circle"></i>
                </div>

              </div>

              <small className="text-muted">
                Pagamentos confirmados
              </small>

            </div>

          </div>

        </div>


        {/* QUANTIDADE */}

        <div className="col-12 col-md-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Quantidade
                  </p>

                  <h4 className="fw-bold mb-0">
                    {resumo.quantidade}
                  </h4>
                </div>

                <div
                  className="bg-info bg-opacity-10
                             text-info rounded-circle
                             d-flex align-items-center
                             justify-content-center"
                  style={{
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-list-check"></i>
                </div>

              </div>

              <small className="text-muted">
                No período selecionado
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

          <div className="d-flex flex-column flex-md-row
                          justify-content-between
                          align-items-md-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Recebimentos pendentes
              </h5>

              <small className="text-muted">
                Valores que ainda aguardam pagamento
              </small>

            </div>

            <span className="badge bg-warning-subtle text-warning-emphasis mt-2 mt-md-0">
              {recebimentosPendentes.length}
              {" "}
              pendente(s)
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
                className="bg-success bg-opacity-10
                           text-success rounded-circle
                           d-inline-flex
                           align-items-center
                           justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-check-lg fs-3"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum recebimento pendente
              </h6>

              <p className="text-muted mb-0">
                Não há valores pendentes
                para o período selecionado.
              </p>

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
                      Descrição
                    </th>

                    <th>
                      Contrato
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

                  {recebimentosPendentes.map(
                    (item) => (
                      <tr key={item.id}>

                        <td>
                          <div className="fw-semibold">
                            {nomeCliente(
                              item.cliente_id
                            )}
                          </div>
                        </td>


                        <td>
                          <span className="badge bg-light text-dark border">
                            {textoTipo(
                              item.tipo
                            )}
                          </span>
                        </td>


                        <td>
                          {item.descricao || "-"}
                        </td>


                        <td>
                          {numeroDoContrato(
                            item.contrato_id
                          )}
                        </td>


                        <td>
                          {formatarData(
                            item.data_vencimento
                          )}
                        </td>


                        <td>
                          <strong>
                            {formatarMoeda(
                              item.valor
                            )}
                          </strong>
                        </td>


                        <td>
                          <span
                            className={`badge ${classeStatus(
                              item.status
                            )}`}
                          >
                            <i className="bi bi-clock me-1"></i>
                            {textoStatus(
                              item.status
                            )}
                          </span>
                        </td>


                        <td className="text-end">

                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              abrirConfirmacaoRecebimento(
                                item
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


      {/* ========================================
          TOTAL PENDENTE
      ======================================== */}

      {!loading &&
        recebimentosPendentes.length > 0 && (
          <div className="d-flex justify-content-end mb-4">

            <div className="text-end">

              <small className="text-muted d-block">
                Total pendente
              </small>

              <h5 className="fw-bold text-warning mb-0">
                {formatarMoeda(
                  resumo.pendente
                )}
              </h5>

            </div>

          </div>
        )}
      {/* ========================================
          RECEBIMENTOS REALIZADOS
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row
                          justify-content-between
                          align-items-md-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Recebimentos realizados
              </h5>

              <small className="text-muted">
                Pagamentos já confirmados
              </small>

            </div>

            <span className="badge bg-success-subtle text-success mt-2 mt-md-0">
              {recebimentosRealizados.length}
              {" "}
              recebido(s)
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

          ) : recebimentosRealizados.length === 0 ? (

            <div className="text-center py-5">

              <div
                className="bg-info bg-opacity-10
                           text-info rounded-circle
                           d-inline-flex
                           align-items-center
                           justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-receipt fs-3"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum recebimento realizado
              </h6>

              <p className="text-muted mb-0">
                Ainda não existem pagamentos
                confirmados neste período.
              </p>

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
                      Descrição
                    </th>

                    <th>
                      Contrato
                    </th>

                    <th>
                      Data recebimento
                    </th>

                    <th>
                      Forma de pagamento
                    </th>

                    <th>
                      Valor
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recebimentosRealizados.map(
                    (item) => (
                      <tr key={item.id}>

                        <td>

                          <div className="fw-semibold">
                            {nomeCliente(
                              item.cliente_id
                            )}
                          </div>

                        </td>


                        <td>

                          <span className="badge bg-light text-dark border">
                            {textoTipo(
                              item.tipo
                            )}
                          </span>

                        </td>


                        <td>
                          {item.descricao || "-"}
                        </td>


                        <td>
                          {numeroDoContrato(
                            item.contrato_id
                          )}
                        </td>


                        <td>
                          {formatarData(
                            item.data_recebimento ||
                              item.data_vencimento
                          )}
                        </td>


                        <td>

                          <span className="text-muted">

                            <i className="bi bi-credit-card me-1"></i>

                            {textoFormaPagamento(
                              item.forma_pagamento
                            )}

                          </span>

                        </td>


                        <td>

                          <strong className="text-success">

                            {formatarMoeda(
                              item.valor
                            )}

                          </strong>

                        </td>


                        <td>

                          <span
                            className={`badge ${classeStatus(
                              item.status
                            )}`}
                          >

                            <i className="bi bi-check-circle me-1"></i>

                            {textoStatus(
                              item.status
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


      {/* ========================================
          TOTAL RECEBIDO
      ======================================== */}

      {!loading &&
        recebimentosRealizados.length > 0 && (
          <div className="d-flex justify-content-end mb-4">

            <div className="text-end">

              <small className="text-muted d-block">
                Total recebido
              </small>

              <h5 className="fw-bold text-success mb-0">
                {formatarMoeda(
                  resumo.recebido
                )}
              </h5>

            </div>

          </div>
        )}
      {/* ========================================
          MODAL - NOVO RECEBIMENTO
      ======================================== */}

      {novoRecebimentoAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            role="document"
          >

            <div className="modal-content border-0 shadow">

              {/* ==================================
                  CABEÇALHO
              ================================== */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold mb-1">
                    <i className="bi bi-cash-stack text-primary me-2"></i>
                    Novo recebimento
                  </h5>

                  <small className="text-muted">
                    Cadastre um novo valor a receber
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


              {/* ==================================
                  FORMULÁRIO
              ================================== */}

              <form
                onSubmit={
                  salvarNovoRecebimento
                }
              >

                <div className="modal-body">

                  <div className="row g-3">

                    {/* ==============================
                        CLIENTE
                    ============================== */}

                    <div className="col-12">

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
                          alterarCampoNovoRecebimento(
                            "cliente_id",
                            e.target.value
                          )
                        }
                        required
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
                              {cliente.nome ||
                                cliente.razao_social ||
                                cliente.nome_completo ||
                                `Cliente #${cliente.id}`}
                            </option>
                          )
                        )}

                      </select>

                      {clientes.length === 0 && (
                        <small className="text-danger">
                          Nenhum cliente cadastrado.
                        </small>
                      )}

                    </div>


                    {/* ==============================
                        TIPO
                    ============================== */}

                    <div className="col-12 col-md-6">

                      <label className="form-label fw-semibold">
                        Tipo de recebimento
                        <span className="text-danger">
                          {" "}*
                        </span>
                      </label>

                      <select
                        className="form-select"
                        value={
                          novoRecebimento.tipo
                        }
                        onChange={(e) =>
                          alterarCampoNovoRecebimento(
                            "tipo",
                            e.target.value
                          )
                        }
                        required
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


                    {/* ==============================
                        NÚMERO DO CONTRATO
                    ============================== */}

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
                              {numeroDoContrato(
                                contrato.id
                              )}
                            </option>
                          )
                        )}

                      </select>

                    </div>


                    {/* ==============================
                        DESCRIÇÃO
                    ============================== */}

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Descrição
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex.: Aluguel referente ao mês de setembro"
                        value={
                          novoRecebimento.descricao
                        }
                        onChange={(e) =>
                          alterarCampoNovoRecebimento(
                            "descricao",
                            e.target.value
                          )
                        }
                      />

                    </div>


                    {/* ==============================
                        VALOR
                    ============================== */}

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
                          type="text"
                          inputMode="decimal"
                          className="form-control"
                          placeholder="0,00"
                          value={
                            novoRecebimento.valor
                          }
                          onChange={(e) =>
                            alterarCampoNovoRecebimento(
                              "valor",
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>

                    </div>


                    {/* ==============================
                        DATA DE VENCIMENTO
                    ============================== */}

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
                          alterarCampoNovoRecebimento(
                            "data_vencimento",
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>


                    {/* ==============================
                        FORMA DE PAGAMENTO
                    ============================== */}

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
                          alterarCampoNovoRecebimento(
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


                    {/* ==============================
                        STATUS
                    ============================== */}

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
                          alterarCampoNovoRecebimento(
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


                    {/* ==============================
                        OBSERVAÇÕES
                    ============================== */}

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Observações
                      </label>

                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Informações adicionais..."
                        value={
                          novoRecebimento.observacoes
                        }
                        onChange={(e) =>
                          alterarCampoNovoRecebimento(
                            "observacoes",
                            e.target.value
                          )
                        }
                      ></textarea>

                    </div>

                  </div>

                </div>


                {/* ==================================
                    RODAPÉ
                ================================== */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      fecharNovoRecebimento
                    }
                    disabled={salvando}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Cancelar
                  </button>


                  <button
                    type="submit"
                    className="btn btn-primary"
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
                        Salvar recebimento
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}
      {/* ========================================
          MODAL - CONFIRMAR RECEBIMENTO
      ======================================== */}

      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
          >

            <div className="modal-content border-0 shadow">

              {/* ==================================
                  CABEÇALHO
              ================================== */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold mb-1">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Confirmar recebimento
                  </h5>

                  <small className="text-muted">
                    Registre o pagamento recebido
                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>

              </div>


              {/* ==================================
                  CORPO
              ================================== */}

              <div className="modal-body">

                {recebimentoSelecionado && (
                  <>

                    {/* CLIENTE */}

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Cliente
                      </label>

                      <div className="form-control bg-light">

                        {nomeCliente(
                          recebimentoSelecionado.cliente_id
                        )}

                      </div>

                    </div>


                    {/* VALOR */}

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Valor
                      </label>

                      <div className="form-control bg-light fw-bold text-success">

                        {formatarMoeda(
                          recebimentoSelecionado.valor
                        )}

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


                    {/* DATA */}

                    <div className="mb-3">

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


                    {/* AVISO */}

                    <div className="alert alert-success mb-0">

                      <i className="bi bi-info-circle me-2"></i>

                      Ao confirmar, este recebimento
                      será marcado como
                      <strong>
                        {" "}Recebido
                      </strong>
                      .

                    </div>

                  </>
                )}

              </div>


              {/* ==================================
                  RODAPÉ
              ================================== */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Cancelar
                </button>


                <button
                  type="button"
                  className="btn btn-success"
                  onClick={
                    confirmarRecebimento
                  }
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


      {/* ========================================
          FIM DA PÁGINA
      ======================================== */}

    </main>
  )
}
