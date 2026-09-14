"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Recebimentos() {
  const hoje = new Date()

  const [contratos, setContratos] = useState([])
  const [recebimentos, setRecebimentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [imoveis, setImoveis] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState("novo")

  const [tipoRecebimento, setTipoRecebimento] =
    useState("aluguel_mensal")

  const [contratoSelecionado, setContratoSelecionado] =
    useState(null)

  const [clienteId, setClienteId] = useState("")
  const [imovelId, setImovelId] = useState("")

  const [competencia, setCompetencia] =
    useState(
      `${ano}-${String(mes).padStart(2, "0")}-01`
    )

  const [dataVencimento, setDataVencimento] =
    useState("")

  const [dataRecebimento, setDataRecebimento] =
    useState(
      hoje.toISOString().split("T")[0]
    )

  const [quantidade, setQuantidade] =
    useState(1)

  const [valorUnitario, setValorUnitario] =
    useState("")

  const [valor, setValor] = useState("")

  const [desconto, setDesconto] =
    useState("")

  const [totalParcelas, setTotalParcelas] =
    useState(1)

  const [primeiraDataVencimento, setPrimeiraDataVencimento] =
    useState("")

  const [intervaloParcelas, setIntervaloParcelas] =
    useState(1)

  const [parcela, setParcela] =
    useState(1)

  const [formaPagamento, setFormaPagamento] =
    useState("PIX")

  const [status, setStatus] =
    useState("Pendente")

  const [descricao, setDescricao] =
    useState("")

  const [observacoes, setObservacoes] =
    useState("")

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    setCompetencia(
      `${ano}-${String(mes).padStart(2, "0")}-01`
    )
  }, [mes, ano])

  async function carregarDados() {
    setCarregando(true)
    setErro("")

    const [
      contratosResponse,
      recebimentosResponse,
      clientesResponse,
      imoveisResponse,
    ] = await Promise.all([
      supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("recebimentos")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("clientes")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("imoveis")
        .select("*")
        .order("id", { ascending: false }),
    ])

    if (contratosResponse.error) {
      console.error(
        "Erro contratos:",
        contratosResponse.error
      )
    }

    if (recebimentosResponse.error) {
      console.error(
        "Erro recebimentos:",
        recebimentosResponse.error
      )

      setErro(
        "Não foi possível carregar os recebimentos."
      )
    }

    if (clientesResponse.error) {
      console.error(
        "Erro clientes:",
        clientesResponse.error
      )
    }

    if (imoveisResponse.error) {
      console.error(
        "Erro imóveis:",
        imoveisResponse.error
      )
    }

    setContratos(
      contratosResponse.data || []
    )

    setRecebimentos(
      recebimentosResponse.data || []
    )

    setClientes(
      clientesResponse.data || []
    )

    setImoveis(
      imoveisResponse.data || []
    )

    setCarregando(false)
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString(
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

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function contratoEstaAtivo(contrato) {
    if (!contrato) return false

    if (
      String(contrato.status).toLowerCase() !==
      "ativo"
    ) {
      return false
    }

    return true
  }

  const contratosAtivos = useMemo(() => {
    return contratos.filter(contratoEstaAtivo)
  }, [contratos])

  function obterDataVencimento(contrato) {
    if (!contrato?.inicio) return null

    const inicio = new Date(
      `${contrato.inicio}T00:00:00`
    )

    if (Number.isNaN(inicio.getTime())) {
      return null
    }

    const dia = inicio.getDate()

    const ultimoDia = new Date(
      ano,
      mes,
      0
    ).getDate()

    const diaFinal = Math.min(
      dia,
      ultimoDia
    )

    const data = new Date(
      ano,
      mes - 1,
      diaFinal
    )

    return `${data.getFullYear()}-${String(
      data.getMonth() + 1
    ).padStart(2, "0")}-${String(
      data.getDate()
    ).padStart(2, "0")}`
  }

  function buscarRecebimento(contratoId) {
    return recebimentos.find(
      (item) =>
        String(item.contrato_id) ===
        String(contratoId)
    )
  }

  const pendentes = useMemo(() => {
    return contratosAtivos
      .map((contrato) => {
        const recebimento =
          buscarRecebimento(contrato.id)

        if (
          recebimento &&
          String(
            recebimento.status
          ).toLowerCase() === "recebido"
        ) {
          return null
        }

        return {
          ...contrato,
          vencimento:
            recebimento?.data_vencimento ||
            obterDataVencimento(contrato),
          recebimento,
        }
      })
      .filter(Boolean)
  }, [
    contratosAtivos,
    recebimentos,
    mes,
    ano,
  ])

  const recebidos = useMemo(() => {
    return recebimentos.filter(
      (item) =>
        String(item.status).toLowerCase() ===
        "recebido"
    )
  }, [recebimentos])

  const quantidadePendentes =
    pendentes.length

  const valorPendente =
    pendentes.reduce(
      (total, item) =>
        total +
        Number(item.valor || 0),
      0
    )

  const quantidadeRecebidos =
    recebidos.length

  const valorRecebido =
    recebidos.reduce(
      (total, item) =>
        total +
        Number(item.valor || 0),
      0
    )

  function limparFormulario() {
    setTipoRecebimento("aluguel_mensal")
    setContratoSelecionado(null)

    setClienteId("")
    setImovelId("")

    setCompetencia(
      `${ano}-${String(mes).padStart(2, "0")}-01`
    )

    setDataVencimento("")
    setDataRecebimento(
      hoje.toISOString().split("T")[0]
    )

    setQuantidade(1)
    setValorUnitario("")
    setValor("")
    setDesconto("")

    setTotalParcelas(1)
    setPrimeiraDataVencimento("")
    setIntervaloParcelas(1)
    setParcela(1)

    setFormaPagamento("PIX")
    setStatus("Pendente")
    setDescricao("")
    setObservacoes("")
  }

  function abrirNovoRecebimento() {
    limparFormulario()
    setModoModal("novo")
    setMensagem("")
    setErro("")
    setModalAberto(true)
  }

  function abrirModalRecebimento(contrato) {
    limparFormulario()

    setModoModal("acusar")
    setContratoSelecionado(contrato)

    setClienteId(
      contrato.cliente_id
        ? String(contrato.cliente_id)
        : ""
    )

    setImovelId(
      contrato.imovel_id
        ? String(contrato.imovel_id)
        : ""
    )

    setTipoRecebimento(
      contrato.tipo === "Temporada"
        ? "diaria"
        : "aluguel_mensal"
    )

    setValor(
      Number(contrato.valor || 0)
    )

    setDataVencimento(
      obterDataVencimento(contrato) || ""
    )

    setStatus("Recebido")

    setMensagem("")
    setErro("")
    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setContratoSelecionado(null)
    limparFormulario()
  }

  function obterNomeCliente(id) {
    if (!id) return ""

    const cliente = clientes.find(
      (item) =>
        String(item.id) === String(id)
    )

    if (!cliente) return ""

    return (
      cliente.nome ||
      cliente.name ||
      cliente.razao_social ||
      cliente.nome_completo ||
      ""
    )
  }

  function obterNomeImovel(id) {
    if (!id) return ""

    const imovel = imoveis.find(
      (item) =>
        String(item.id) === String(id)
    )

    if (!imovel) return ""

    return (
      imovel.nome ||
      imovel.titulo ||
      imovel.endereco ||
      imovel.descricao ||
      ""
    )
  }

  function calcularTotalDiaria() {
    return (
      Number(quantidade || 0) *
      Number(valorUnitario || 0)
    )
  }

  function calcularTotalVenda() {
    return Math.max(
      0,
      Number(quantidade || 0) *
        Number(valorUnitario || 0) -
        Number(desconto || 0)
    )
  }

  function calcularValorParcela() {
    return (
      Number(valor || 0) /
      Math.max(
        1,
        Number(totalParcelas || 1)
      )
    )
  }

  async function salvarRecebimento() {
    setErro("")
    setMensagem("")

    if (
      tipoRecebimento === "aluguel_mensal" &&
      !valor
    ) {
      setErro(
        "Informe o valor do aluguel."
      )
      return
    }

    if (
      tipoRecebimento === "diaria" &&
      (!quantidade || !valorUnitario)
    ) {
      setErro(
        "Informe a quantidade de diárias e o valor por diária."
      )
      return
    }

    if (
      tipoRecebimento === "venda_unitaria" &&
      (!quantidade || !valorUnitario)
    ) {
      setErro(
        "Informe a quantidade e o valor unitário."
      )
      return
    }

    if (
      tipoRecebimento === "venda_parcelada" &&
      (!valor || !totalParcelas)
    ) {
      setErro(
        "Informe o valor total da venda e a quantidade de parcelas."
      )
      return
    }

    if (
      modoModal === "acusar" &&
      !dataRecebimento
    ) {
      setErro(
        "Informe a data do recebimento."
      )
      return
    }

    setSalvando(true)

    let valorFinal = 0

    if (
      tipoRecebimento ===
      "aluguel_mensal"
    ) {
      valorFinal = Number(valor || 0)
    }

    if (
      tipoRecebimento === "diaria"
    ) {
      valorFinal =
        calcularTotalDiaria()
    }

    if (
      tipoRecebimento ===
      "venda_unitaria"
    ) {
      valorFinal =
        calcularTotalVenda()
    }

    if (
      tipoRecebimento ===
      "venda_parcelada"
    ) {
      valorFinal =
        calcularValorParcela()
    }

    const clienteNome =
      obterNomeCliente(clienteId)

    const imovelNome =
      obterNomeImovel(imovelId)

    const dadosBase = {
      tipo_recebimento:
        tipoRecebimento,

      contrato_id:
        contratoSelecionado?.id ||
        null,

      cliente_id:
        clienteId
          ? Number(clienteId)
          : null,

      imovel_id:
        imovelId
          ? Number(imovelId)
          : null,

      competencia:
        competencia || null,

      data_vencimento:
        dataVencimento || null,

      data_recebimento:
        status === "Recebido"
          ? dataRecebimento || null
          : null,

      quantidade:
        Number(quantidade || 0),

      valor_unitario:
        Number(valorUnitario || 0),

      valor:
        Number(valorFinal || 0),

      desconto:
        Number(desconto || 0),

      forma_pagamento:
        formaPagamento,

      status,

      descricao:
        descricao ||
        `${tipoRecebimento} - ${
          clienteNome || "Cliente"
        }${
          imovelNome
            ? ` - ${imovelNome}`
            : ""
        }`,

      observacoes:
        observacoes || null,

      parcela:
        tipoRecebimento ===
        "venda_parcelada"
          ? Number(parcela || 1)
          : null,

      total_parcelas:
        tipoRecebimento ===
        "venda_parcelada"
          ? Number(
              totalParcelas || 1
            )
          : null,

      intervalo_parcelas:
        tipoRecebimento ===
        "venda_parcelada"
          ? Number(
              intervaloParcelas || 1
            )
          : 1,

      primeira_data_vencimento:
        tipoRecebimento ===
        "venda_parcelada"
          ? primeiraDataVencimento ||
            null
          : null,

      updated_at:
        new Date().toISOString(),
    }

    let resposta

    if (
      modoModal === "acusar" &&
      contratoSelecionado?.recebimento?.id
    ) {
      resposta = await supabase
        .from("recebimentos")
        .update(dadosBase)
        .eq(
          "id",
          contratoSelecionado
            .recebimento.id
        )
    } else if (
      tipoRecebimento ===
      "venda_parcelada"
    ) {
      const quantidadeParcelas =
        Math.max(
          1,
          Number(totalParcelas || 1)
        )

      const valorParcela =
        Number(valor || 0) /
        quantidadeParcelas

      const registros = []

      for (
        let i = 1;
        i <= quantidadeParcelas;
        i++
      ) {
        let vencimento =
          primeiraDataVencimento

        if (vencimento) {
          const data =
            new Date(
              `${vencimento}T00:00:00`
            )

          data.setMonth(
            data.getMonth() +
              (i - 1) *
                Number(
                  intervaloParcelas ||
                    1
                )
          )

          vencimento =
            `${data.getFullYear()}-${String(
              data.getMonth() + 1
            ).padStart(2, "0")}-${String(
              data.getDate()
            ).padStart(2, "0")}`
        }

        registros.push({
          ...dadosBase,

          parcela: i,

          total_parcelas:
            quantidadeParcelas,

          valor:
            Number(
              valorParcela.toFixed(2)
            ),

          data_vencimento:
            vencimento || null,

          data_recebimento:
            status === "Recebido" &&
            i === 1
              ? dataRecebimento
              : null,

          status:
            i === 1 &&
            status === "Recebido"
              ? "Recebido"
              : "Pendente",
        })
      }

      resposta = await supabase
        .from("recebimentos")
        .insert(registros)
    } else {
      resposta = await supabase
        .from("recebimentos")
        .insert([dadosBase])
    }

    if (resposta.error) {
      console.error(
        "Erro ao salvar recebimento:",
        resposta.error
      )

      setErro(
        `Não foi possível salvar o recebimento: ${resposta.error.message}`
      )

      setSalvando(false)
      return
    }

    setModalAberto(false)
    setContratoSelecionado(null)
    setSalvando(false)

    setMensagem(
      modoModal === "acusar"
        ? "Pagamento recebido e registrado com sucesso."
        : "Recebimento cadastrado com sucesso."
    )

    await carregarDados()
  }

  function mudarMes(valor) {
    let novoMes = mes + valor
    let novoAno = ano

    if (novoMes > 12) {
      novoMes = 1
      novoAno++
    }

    if (novoMes < 1) {
      novoMes = 12
      novoAno--
    }

    setMes(novoMes)
    setAno(novoAno)
  }

  function nomeMes(numero) {
    const nomes = [
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

    return nomes[numero - 1]
  }

  function abrirWhatsAppLembrete(
    contrato
  ) {
    const telefone =
      contrato.telefone ||
      contrato.celular ||
      contrato.whatsapp ||
      ""

    const texto =
      `Olá, ${
        contrato.cliente ||
        "tudo bem"
      }! 👋\n\n` +
      `Este é um lembrete referente ao pagamento do imóvel ${
        contrato.imovel ||
        ""
      }.\n\n` +
      `📅 Vencimento: ${
        formatarData(
          contrato.vencimento
        )
      }\n` +
      `💰 Valor: ${
        formatarValor(
          contrato.valor
        )
      }\n\n` +
      `Caso o pagamento já tenha sido realizado, por favor desconsidere esta mensagem.\n\n` +
      `Obrigado!`

    const numero =
      String(telefone).replace(
        /\D/g,
        ""
      )

    const url = numero
      ? `https://wa.me/${numero}?text=${encodeURIComponent(
          texto
        )}`
      : `https://wa.me/?text=${encodeURIComponent(
          texto
        )}`

    window.open(
      url,
      "_blank"
    )
  }

  function abrirWhatsAppConfirmacao(
    recebimento
  ) {
    const texto =
      `Olá, tudo bem? 👋\n\n` +
      `Confirmamos o recebimento do pagamento.\n\n` +
      `💰 Valor: ${
        formatarValor(
          recebimento.valor
        )
      }\n` +
      `📅 Data: ${
        formatarData(
          recebimento.data_recebimento
        )
      }\n\n` +
      `Obrigado!`

    const telefone =
      recebimento.telefone ||
      recebimento.celular ||
      recebimento.whatsapp ||
      ""

    const numero =
      String(telefone).replace(
        /\D/g,
        ""
      )

    const url = numero
      ? `https://wa.me/${numero}?text=${encodeURIComponent(
          texto
        )}`
      : `https://wa.me/?text=${encodeURIComponent(
          texto
        )}`

    window.open(
      url,
      "_blank"
    )
  }

  return (
    <main className="container py-4">

      {/* TÍTULO */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">

        <div>
          <h1 className="fw-bold mb-1">
            Recebimentos
          </h1>

          <p className="text-muted mb-0">
            Controle de pagamentos dos contratos imobiliários
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">

          <button
            type="button"
            className="btn btn-primary"
            onClick={
              abrirNovoRecebimento
            }
          >
            ➕ Novo recebimento
          </button>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={carregarDados}
            disabled={carregando}
          >
            {carregando
              ? "Atualizando..."
              : "🔄 Atualizar"}
          </button>

        </div>

      </div>

      {/* ACESSO RÁPIDO */}
      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            ⚡ Acesso rápido
          </h5>

          <div className="d-flex gap-2 flex-wrap">

            <a
              href="/"
              className="btn btn-primary"
            >
              🏠 Início
            </a>

            <a
              href="/clientes"
              className="btn btn-light border"
            >
              👥 Clientes
            </a>

            <a
              href="/imoveis"
              className="btn btn-light border"
            >
              🏢 Imóveis
            </a>

            <a
              href="/contratos"
              className="btn btn-light border"
            >
              📄 Contratos
            </a>

            <a
              href="/recebimentos"
              className="btn btn-light border"
            >
              💰 Recebimentos
            </a>

            <a
              href="/despesas"
              className="btn btn-light border"
            >
              💸 Despesas
            </a>

            <a
              href="/financeiro"
              className="btn btn-light border"
            >
              📊 Financeiro
            </a>

          </div>

        </div>

      </div>

      {/* MENSAGENS */}
      {mensagem && (
        <div className="alert alert-success shadow-sm">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="alert alert-danger shadow-sm">
          {erro}
        </div>
      )}

            {/* PERÍODO */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Período dos recebimentos
              </h5>

              <span className="text-muted">
                Visualizando {nomeMes(mes)} de {ano}
              </span>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border"
                onClick={() => mudarMes(-1)}
              >
                ← Anterior
              </button>

              <button
                type="button"
                className="btn btn-light border"
                onClick={() => mudarMes(1)}
              >
                Próximo →
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* RESUMO */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small">
                Pendentes
              </div>

              <div className="fs-3 fw-bold text-danger">
                {quantidadePendentes}
              </div>

              <div className="small text-muted">
                aguardando pagamento
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small">
                Valor pendente
              </div>

              <div className="fs-4 fw-bold text-danger">
                {formatarValor(valorPendente)}
              </div>

              <div className="small text-muted">
                total a receber
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small">
                Recebidos
              </div>

              <div className="fs-3 fw-bold text-success">
                {quantidadeRecebidos}
              </div>

              <div className="small text-muted">
                pagamentos confirmados
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small">
                Total recebido
              </div>

              <div className="fs-4 fw-bold text-success">
                {formatarValor(valorRecebido)}
              </div>

              <div className="small text-muted">
                pagamentos confirmados
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PENDENTES E RECEBIDOS */}
      <div className="row g-4">

        {/* PENDENTES */}
        <div className="col-12 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-header bg-white border-0 pt-4 px-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h4 className="fw-bold text-danger mb-1">
                    🔴 Pendentes
                  </h4>

                  <small className="text-muted">
                    Pagamentos aguardando recebimento
                  </small>
                </div>

                <span className="badge rounded-pill bg-danger">
                  {quantidadePendentes}
                </span>

              </div>

            </div>

            <div className="card-body px-4">

              {carregando ? (

                <div className="text-center py-5">

                  <div className="spinner-border text-primary" />

                  <p className="text-muted mt-3 mb-0">
                    Carregando recebimentos...
                  </p>

                </div>

              ) : pendentes.length === 0 ? (

                <div className="text-center py-5">

                  <div className="fs-1">
                    🎉
                  </div>

                  <h5 className="fw-bold mt-3">
                    Nenhum pagamento pendente
                  </h5>

                  <p className="text-muted mb-0">
                    Não existem pagamentos pendentes.
                  </p>

                </div>

              ) : (

                <div className="d-flex flex-column gap-3">

                  {pendentes.map((contrato) => (

                    <div
                      key={contrato.id}
                      className="border rounded-4 p-3 bg-light"
                    >

                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">

                        <div>

                          <h5 className="fw-bold mb-1">
                            {contrato.cliente ||
                              "Cliente não informado"}
                          </h5>

                          <div className="text-muted">
                            🏢{" "}
                            {contrato.imovel ||
                              "Imóvel não informado"}
                          </div>

                        </div>

                        <span className="badge bg-danger">
                          Pendente
                        </span>

                      </div>

                      <div className="row g-2 mb-3">

                        <div className="col-6">
                          <div className="bg-white rounded-3 p-2">

                            <small className="text-muted d-block">
                              Vencimento
                            </small>

                            <strong>
                              {formatarData(
                                contrato.vencimento
                              )}
                            </strong>

                          </div>
                        </div>

                        <div className="col-6">
                          <div className="bg-white rounded-3 p-2">

                            <small className="text-muted d-block">
                              Valor
                            </small>

                            <strong className="text-primary">
                              {formatarValor(
                                contrato.valor
                              )}
                            </strong>

                          </div>
                        </div>

                      </div>

                      <div className="d-grid gap-2">

                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() =>
                            abrirModalRecebimento(
                              contrato
                            )
                          }
                        >
                          💰 Acusar recebimento
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() =>
                            abrirWhatsAppLembrete(
                              contrato
                            )
                          }
                        >
                          📱 Lembrar do pagamento
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

        {/* RECEBIDOS */}
        <div className="col-12 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-header bg-white border-0 pt-4 px-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <h4 className="fw-bold text-success mb-1">
                    🟢 Recebidos
                  </h4>

                  <small className="text-muted">
                    Pagamentos confirmados
                  </small>

                </div>

                <span className="badge rounded-pill bg-success">
                  {quantidadeRecebidos}
                </span>

              </div>

            </div>

            <div className="card-body px-4">

              {carregando ? (

                <div className="text-center py-5">

                  <div className="spinner-border text-primary" />

                  <p className="text-muted mt-3 mb-0">
                    Carregando recebimentos...
                  </p>

                </div>

              ) : recebidos.length === 0 ? (

                <div className="text-center py-5">

                  <div className="fs-1">
                    💰
                  </div>

                  <h5 className="fw-bold mt-3">
                    Nenhum pagamento recebido
                  </h5>

                  <p className="text-muted mb-0">
                    Ainda não existem recebimentos.
                  </p>

                </div>

              ) : (

                <div className="d-flex flex-column gap-3">

                  {recebidos.map((recebimento) => (

                    <div
                      key={recebimento.id}
                      className="border rounded-4 p-3"
                    >

                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">

                        <div>

                          <h5 className="fw-bold mb-1">
                            {recebimento.descricao ||
                              "Pagamento recebido"}
                          </h5>

                          <div className="text-muted">

                            {recebimento.tipo_recebimento ===
                            "aluguel_mensal"
                              ? "🏠 Aluguel mensal"
                              : recebimento.tipo_recebimento ===
                                "diaria"
                              ? "📅 Diária"
                              : recebimento.tipo_recebimento ===
                                "venda_unitaria"
                              ? "🏷️ Venda unitária"
                              : "📑 Venda parcelada"}

                          </div>

                        </div>

                        <span className="badge bg-success">
                          Recebido
                        </span>

                      </div>

                      <div className="row g-2 mb-3">

                        <div className="col-6">
                          <div className="bg-light rounded-3 p-2">

                            <small className="text-muted d-block">
                              Data
                            </small>

                            <strong>
                              {formatarData(
                                recebimento.data_recebimento
                              )}
                            </strong>

                          </div>
                        </div>

                        <div className="col-6">
                          <div className="bg-light rounded-3 p-2">

                            <small className="text-muted d-block">
                              Valor
                            </small>

                            <strong className="text-success">
                              {formatarValor(
                                recebimento.valor
                              )}
                            </strong>

                          </div>
                        </div>

                      </div>

                      {recebimento.forma_pagamento && (
                        <div className="small text-muted mb-3">
                          💳 Forma de pagamento:{" "}
                          {recebimento.forma_pagamento}
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-success w-100"
                        onClick={() =>
                          abrirWhatsAppConfirmacao(
                            recebimento
                          )
                        }
                      >
                        📱 Confirmação de pagamento
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* MODAL NOVO RECEBIMENTO / ACUSAR RECEBIMENTO */}
      {modalAberto && (

        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">

              {/* CABEÇALHO DO MODAL */}
              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">
                    {modoModal === "acusar"
                      ? "💰 Acusar recebimento"
                      : "➕ Novo recebimento"}
                  </h5>

                  <small className="text-muted">
                    {modoModal === "acusar"
                      ? "Confirme os dados do pagamento."
                      : "Cadastre um novo recebimento."}
                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                />

              </div>

              {/* CORPO */}
              <div className="modal-body">

                {erro && (
                  <div className="alert alert-danger">
                    {erro}
                  </div>
                )}

                {/* TIPO */}
                {modoModal === "novo" && (

                  <div className="mb-4">

                    <label className="form-label fw-bold">
                      Tipo de recebimento
                    </label>

                    <select
                      className="form-select"
                      value={tipoRecebimento}
                      onChange={(e) =>
                        setTipoRecebimento(
                          e.target.value
                        )
                      }
                    >

                      <option value="aluguel_mensal">
                        🏠 Aluguel mês a mês
                      </option>

                      <option value="diaria">
                        📅 Por diária
                      </option>

                      <option value="venda_unitaria">
                        🏷️ Venda unitária
                      </option>

                      <option value="venda_parcelada">
                        📑 Venda parcelada
                      </option>

                    </select>

                  </div>

                )}

                {/* DADOS DO CONTRATO */}
                {modoModal === "acusar" && (

                  <div className="alert alert-light border">

                    <div className="fw-bold">
                      {contratoSelecionado?.cliente ||
                        "Cliente não informado"}
                    </div>

                    <div className="text-muted">
                      🏢{" "}
                      {contratoSelecionado?.imovel ||
                        "Imóvel não informado"}
                    </div>

                    <div className="mt-2">
                      Valor:{" "}
                      <strong>
                        {formatarValor(
                          contratoSelecionado?.valor
                        )}
                      </strong>
                    </div>

                  </div>

                )}

                {/* CLIENTE / IMÓVEL */}
                {modoModal === "novo" && (

                  <div className="row g-3">

                    <div className="col-12 col-md-6">

                      <label className="form-label">
                        Cliente
                      </label>

                      <select
                        className="form-select"
                        value={clienteId}
                        onChange={(e) =>
                          setClienteId(
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Selecione o cliente
                        </option>

                        {clientes.map((cliente) => (

                          <option
                            key={cliente.id}
                            value={cliente.id}
                          >
                            {cliente.nome ||
                              cliente.name ||
                              cliente.razao_social ||
                              `Cliente ${cliente.id}`}
                          </option>

                        ))}

                      </select>

                    </div>

                    <div className="col-12 col-md-6">

                      <label className="form-label">
                        Imóvel
                      </label>

                      <select
                        className="form-select"
                        value={imovelId}
                        onChange={(e) =>
                          setImovelId(
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Selecione o imóvel
                        </option>

                        {imoveis.map((imovel) => (

                          <option
                            key={imovel.id}
                            value={imovel.id}
                          >
                            {imovel.nome ||
                              imovel.titulo ||
                              imovel.endereco ||
                              `Imóvel ${imovel.id}`}
                          </option>

                        ))}

                      </select>

                    </div>

                  </div>

                )}

                {/* ALUGUEL MENSAL */}
                {tipoRecebimento ===
                  "aluguel_mensal" && (

                  <div className="row g-3 mt-1">

                    <div className="col-12 col-md-6">

                      <label className="form-label">
                        Competência
                      </label>

                      <input
                        type="month"
                        className="form-control"
                        value={competencia.substring(0, 7)}
                        onChange={(e) =>
                          setCompetencia(
                            `${e.target.value}-01`
                          )
                        }
                      />

                    </div>

                    <div className="col-12 col-md-6">

                                            <label className="form-label fw-semibold">
                        Data de vencimento
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={dataVencimento}
                        onChange={(e) => setDataVencimento(e.target.value)}
                      />
                    </div>
                  )}

                  {/* DIÁRIA */}
                  {tipoRecebimento === "diaria" && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Data
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={dataDiaria}
                          onChange={(e) => setDataDiaria(e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Quantidade de diárias
                        </label>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="form-control"
                          value={quantidade}
                          onChange={(e) => setQuantidade(e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Valor por diária
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={valorUnitario}
                          onChange={(e) => setValorUnitario(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* VENDA UNITÁRIA */}
                  {tipoRecebimento === "venda_unitaria" && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Quantidade
                        </label>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="form-control"
                          value={quantidade}
                          onChange={(e) => setQuantidade(e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Valor unitário
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={valorUnitario}
                          onChange={(e) => setValorUnitario(e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Desconto
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={desconto}
                          onChange={(e) => setDesconto(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* VENDA PARCELADA */}
                  {tipoRecebimento === "venda_parcelada" && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Valor total da venda
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={valorTotalVenda}
                          onChange={(e) =>
                            setValorTotalVenda(e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Quantidade de parcelas
                        </label>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="form-control"
                          value={totalParcelas}
                          onChange={(e) =>
                            setTotalParcelas(e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Valor da parcela
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={valorParcela}
                          onChange={(e) =>
                            setValorParcela(e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Primeira data de vencimento
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={primeiraDataVencimento}
                          onChange={(e) =>
                            setPrimeiraDataVencimento(e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Intervalo entre parcelas
                        </label>

                        <select
                          className="form-select"
                          value={intervaloParcelas}
                          onChange={(e) =>
                            setIntervaloParcelas(e.target.value)
                          }
                        >
                          <option value="1">Mensal</option>
                          <option value="2">A cada 2 meses</option>
                          <option value="3">A cada 3 meses</option>
                          <option value="6">A cada 6 meses</option>
                          <option value="12">Anual</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* VALOR */}
                  {tipoRecebimento !== "venda_parcelada" &&
                    tipoRecebimento !== "diaria" &&
                    tipoRecebimento !== "venda_unitaria" && (
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Valor
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                        />
                      </div>
                    )}

                  {/* DATA DO RECEBIMENTO */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Data do recebimento
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={dataRecebimento}
                      onChange={(e) =>
                        setDataRecebimento(e.target.value)
                      }
                    />
                  </div>

                  {/* FORMA DE PAGAMENTO */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Forma de pagamento
                    </label>

                    <select
                      className="form-select"
                      value={formaPagamento}
                      onChange={(e) =>
                        setFormaPagamento(e.target.value)
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Transferência">
                        Transferência
                      </option>
                      <option value="Boleto">Boleto</option>
                      <option value="Cartão de crédito">
                        Cartão de crédito
                      </option>
                      <option value="Cartão de débito">
                        Cartão de débito
                      </option>
                      <option value="Cheque">Cheque</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {/* STATUS */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Status
                    </label>

                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Recebido">Recebido</option>
                      <option value="Atrasado">Atrasado</option>
                      <option value="Cancelado">Cancelado</option>
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
                      value={observacoes}
                      onChange={(e) =>
                        setObservacoes(e.target.value)
                      }
                      placeholder="Digite alguma observação..."
                    />
                  </div>

                  {/* RESUMO */}
                  <div className="col-12">
                    <div className="alert alert-light border mb-0">
                      <strong>Resumo do recebimento</strong>

                      <div className="mt-2">
                        {tipoRecebimento === "diaria" && (
                          <>
                            Quantidade:{" "}
                            <strong>{quantidade || 0}</strong>
                            {" × "}
                            R${" "}
                            <strong>
                              {Number(valorUnitario || 0).toFixed(2)}
                            </strong>
                          </>
                        )}

                        {tipoRecebimento === "venda_unitaria" && (
                          <>
                            Quantidade:{" "}
                            <strong>{quantidade || 0}</strong>
                            {" × "}
                            R${" "}
                            <strong>
                              {Number(valorUnitario || 0).toFixed(2)}
                            </strong>
                            {" − desconto de R$ "}
                            <strong>
                              {Number(desconto || 0).toFixed(2)}
                            </strong>
                          </>
                        )}

                        {tipoRecebimento === "venda_parcelada" && (
                          <>
                            Venda de R${" "}
                            <strong>
                              {Number(valorTotalVenda || 0).toFixed(2)}
                            </strong>
                            {" em "}
                            <strong>{totalParcelas || 0}</strong>
                            {" parcelas de R$ "}
                            <strong>
                              {Number(valorParcela || 0).toFixed(2)}
                            </strong>
                          </>
                        )}

                        {tipoRecebimento === "aluguel_mensal" && (
                          <>
                            Valor mensal: R${" "}
                            <strong>
                              {Number(valor || 0).toFixed(2)}
                            </strong>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RODAPÉ DO MODAL */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={salvarRecebimento}
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "💾 Salvar recebimento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
           