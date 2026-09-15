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

  const [mes, setMes] = useState(
    hoje.getMonth() + 1
  )

  const [ano, setAno] = useState(
    hoje.getFullYear()
  )

  const [modalAberto, setModalAberto] =
    useState(false)

  const [modoModal, setModoModal] =
    useState("novo")

  const [tipoRecebimento, setTipoRecebimento] =
    useState("aluguel_mensal")

  const [contratoSelecionado, setContratoSelecionado] =
    useState(null)

  const [clienteId, setClienteId] =
    useState("")

  const [imovelId, setImovelId] =
    useState("")

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

  const [valor, setValor] =
    useState("")

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
        .order("id", {
          ascending: false,
        }),

      supabase
        .from("recebimentos")
        .select("*")
        .order("id", {
          ascending: false,
        }),

      supabase
        .from("clientes")
        .select("*")
        .order("id", {
          ascending: false,
        }),

      supabase
        .from("imoveis")
        .select("*")
        .order("id", {
          ascending: false,
        }),
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
    return Number(
      valor || 0
    ).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  function formatarData(data) {
    if (!data) {
      return "-"
    }

    const partes =
      String(data).split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function contratoEstaAtivo(contrato) {
    if (!contrato) {
      return false
    }

    return (
      String(
        contrato.status
      ).toLowerCase() === "ativo"
    )
  }

  const contratosAtivos =
    useMemo(() => {
      return contratos.filter(
        contratoEstaAtivo
      )
    }, [contratos])

  function obterDataVencimento(
    contrato
  ) {
    if (!contrato?.inicio) {
      return null
    }

    const inicio =
      new Date(
        `${contrato.inicio}T00:00:00`
      )

    if (
      Number.isNaN(
        inicio.getTime()
      )
    ) {
      return null
    }

    const dia =
      inicio.getDate()

    const ultimoDia =
      new Date(
        ano,
        mes,
        0
      ).getDate()

    const diaFinal =
      Math.min(
        dia,
        ultimoDia
      )

    const data =
      new Date(
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

  function buscarRecebimento(
    contratoId
  ) {
    return recebimentos.find(
      (item) =>
        String(
          item.contrato_id
        ) ===
        String(contratoId)
    )
  }

  const pendentes =
    useMemo(() => {
      return contratosAtivos
        .map((contrato) => {
          const recebimento =
            buscarRecebimento(
              contrato.id
            )

          if (
            recebimento &&
            String(
              recebimento.status
            ).toLowerCase() ===
              "recebido"
          ) {
            return null
          }

          return {
            ...contrato,

            vencimento:
              recebimento?.data_vencimento ||
              obterDataVencimento(
                contrato
              ),

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

  const recebidos =
    useMemo(() => {
      return recebimentos.filter(
        (item) =>
          String(
            item.status
          ).toLowerCase() ===
          "recebido"
      )
    }, [recebimentos])

  const quantidadePendentes =
    pendentes.length

  const valorPendente =
    pendentes.reduce(
      (total, item) =>
        total +
        Number(
          item.valor || 0
        ),
      0
    )

  const quantidadeRecebidos =
    recebidos.length

  const valorRecebido =
    recebidos.reduce(
      (total, item) =>
        total +
        Number(
          item.valor || 0
        ),
      0
    )

  function limparFormulario() {
    setTipoRecebimento(
      "aluguel_mensal"
    )

    setContratoSelecionado(
      null
    )

    setClienteId("")
    setImovelId("")

    setCompetencia(
      `${ano}-${String(mes).padStart(2, "0")}-01`
    )

    setDataVencimento("")

    setDataRecebimento(
      hoje
        .toISOString()
        .split("T")[0]
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

  function abrirModalRecebimento(
    contrato
  ) {
    limparFormulario()

    setModoModal("acusar")

    setContratoSelecionado(
      contrato
    )

    setClienteId(
      contrato.cliente_id
        ? String(
            contrato.cliente_id
          )
        : ""
    )

    setImovelId(
      contrato.imovel_id
        ? String(
            contrato.imovel_id
          )
        : ""
    )

    setTipoRecebimento(
      contrato.tipo ===
        "Temporada"
        ? "diaria"
        : "aluguel_mensal"
    )

    setValor(
      Number(
        contrato.valor || 0
      )
    )

    setDataVencimento(
      obterDataVencimento(
        contrato
      ) || ""
    )

    setStatus("Recebido")

    setMensagem("")
    setErro("")
    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) {
      return
    }

    setModalAberto(false)

    setContratoSelecionado(
      null
    )

    limparFormulario()
  }

  function obterNomeCliente(id) {
    if (!id) {
      return ""
    }

    const cliente =
      clientes.find(
        (item) =>
          String(item.id) ===
          String(id)
      )

    if (!cliente) {
      return ""
    }

    return (
      cliente.nome ||
      cliente.name ||
      cliente.razao_social ||
      cliente.nome_completo ||
      ""
    )
  }

  function obterNomeImovel(id) {
    if (!id) {
      return ""
    }

    const imovel =
      imoveis.find(
        (item) =>
          String(item.id) ===
          String(id)
      )

    if (!imovel) {
      return ""
    }

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
      Number(
        quantidade || 0
      ) *
      Number(
        valorUnitario || 0
      )
    )
  }

  function calcularTotalVenda() {
    return Math.max(
      0,
      Number(
        quantidade || 0
      ) *
        Number(
          valorUnitario || 0
        ) -
        Number(
          desconto || 0
        )
    )
  }

  function calcularValorParcela() {
    return (
      Number(valor || 0) /
      Math.max(
        1,
        Number(
          totalParcelas || 1
        )
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
      tipoRecebimento === "aluguel_mensal"
    ) {
      valorFinal =
        Number(valor || 0)
    }

    if (
      tipoRecebimento === "diaria"
    ) {
      valorFinal =
        calcularTotalDiaria()
    }

    if (
      tipoRecebimento === "venda_unitaria"
    ) {
      valorFinal =
        calcularTotalVenda()
    }

    if (
      tipoRecebimento === "venda_parcelada"
    ) {
      valorFinal =
        calcularValorParcela()
    }

    const clienteNome =
      obterNomeCliente(
        clienteId
      )

    const imovelNome =
      obterNomeImovel(
        imovelId
      )

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
        Number(
          quantidade || 0
        ),

      valor_unitario:
        Number(
          valorUnitario || 0
        ),

      valor:
        Number(
          valorFinal || 0
        ),

      desconto:
        Number(
          desconto || 0
        ),

      forma_pagamento:
        formaPagamento,

      status,

      descricao:
        descricao ||
        `${tipoRecebimento} - ${
          clienteNome ||
          "Cliente"
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
          ? Number(
              parcela || 1
            )
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
      resposta =
        await supabase
          .from("recebimentos")
          .update(
            dadosBase
          )
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
          Number(
            totalParcelas || 1
          )
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
            ).padStart(
              2,
              "0"
            )}-${String(
              data.getDate()
            ).padStart(
              2,
              "0"
            )}`
        }

        registros.push({
          ...dadosBase,

          parcela: i,

          total_parcelas:
            quantidadeParcelas,

          valor:
            Number(
              valorParcela.toFixed(
                2
              )
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

      resposta =
        await supabase
          .from("recebimentos")
          .insert(
            registros
          )
    } else {
      resposta =
        await supabase
          .from("recebimentos")
          .insert([
            dadosBase,
          ])
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

    setContratoSelecionado(
      null
    )

    setSalvando(false)

    setMensagem(
      modoModal === "acusar"
        ? "Pagamento recebido e registrado com sucesso."
        : "Recebimento cadastrado com sucesso."
    )

    await carregarDados()
  }

  function mudarMes(valor) {
    let novoMes =
      mes + valor

    let novoAno =
      ano

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

    return nomes[
      numero - 1
    ]
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
      String(
        telefone
      ).replace(
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
      String(
        telefone
      ).replace(
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
            onClick={abrirNovoRecebimento}
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
                📅 Período
              </h5>

              <span className="text-muted">
                Visualização dos recebimentos
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  mudarMes(-1)
                }
              >
                ◀
              </button>

              <div
                className="fw-bold text-center"
                style={{
                  minWidth: "150px",
                }}
              >
                {nomeMes(mes)}{" "}
                {ano}
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  mudarMes(1)
                }
              >
                ▶
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* RESUMO */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">

              <div className="text-muted small">
                Pendentes
              </div>

              <div className="fs-3 fw-bold text-warning">
                {quantidadePendentes}
              </div>

              <div className="small text-muted">
                {formatarValor(
                  valorPendente
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">

              <div className="text-muted small">
                Recebidos
              </div>

              <div className="fs-3 fw-bold text-success">
                {quantidadeRecebidos}
              </div>

              <div className="small text-muted">
                {formatarValor(
                  valorRecebido
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">

              <div className="text-muted small">
                Total previsto
              </div>

              <div className="fs-3 fw-bold text-primary">
                {formatarValor(
                  valorPendente +
                    valorRecebido
                )}
              </div>

              <div className="small text-muted">
                Pendentes + recebidos
              </div>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">

              <div className="text-muted small">
                Contratos ativos
              </div>

              <div className="fs-3 fw-bold">
                {contratosAtivos.length}
              </div>

              <div className="small text-muted">
                Contratos em andamento
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* RECEBIMENTOS PENDENTES */}
      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="fw-bold mb-0">
              💰 Recebimentos pendentes
            </h5>

            <span className="badge bg-warning text-dark">
              {pendentes.length}
            </span>

          </div>

        </div>

        <div className="card-body p-0">

          {carregando ? (
            <div className="p-4 text-center text-muted">
              Carregando recebimentos...
            </div>
          ) : pendentes.length === 0 ? (
            <div className="p-4 text-center text-muted">
              Nenhum recebimento pendente encontrado.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Imóvel</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th className="text-end">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {pendentes.map(
                    (item) => {

                      const cliente =
                        obterNomeCliente(
                          item.cliente_id
                        ) ||
                        item.cliente ||
                        "Cliente"

                      const imovel =
                        obterNomeImovel(
                          item.imovel_id
                        ) ||
                        item.imovel ||
                        "Imóvel"

                      return (
                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            <strong>
                              {cliente}
                            </strong>
                          </td>

                          <td>
                            {imovel}
                          </td>

                          <td>
                            {formatarData(
                              item.vencimento
                            )}
                          </td>

                          <td className="fw-semibold">
                            {formatarValor(
                              item.recebimento?.valor ||
                                item.valor
                            )}
                          </td>

                          <td>
                            <span className="badge bg-warning text-dark">
                              Pendente
                            </span>
                          </td>

                          <td>
                            <div className="d-flex justify-content-end gap-2 flex-wrap">

                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  abrirModalRecebimento(
                                    item
                                  )
                                }
                              >
                                ✓ Acusar recebimento
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  abrirWhatsAppLembrete(
                                    item
                                  )
                                }
                              >
                                WhatsApp
                              </button>

                            </div>
                          </td>

                        </tr>
                      )
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

      {/* RECEBIMENTOS REALIZADOS */}
      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="fw-bold mb-0">
              ✅ Recebimentos realizados
            </h5>

            <span className="badge bg-success">
              {recebidos.length}
            </span>

          </div>

        </div>

        <div className="card-body p-0">

          {recebidos.length === 0 ? (
            <div className="p-4 text-center text-muted">
              Nenhum recebimento realizado.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Vencimento</th>
                    <th>Recebimento</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th className="text-end">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {recebidos.map(
                    (item) => {

                      const cliente =
                        obterNomeCliente(
                          item.cliente_id
                        ) ||
                        item.cliente ||
                        "Cliente"

                      return (
                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            <strong>
                              {cliente}
                            </strong>
                          </td>

                          <td>
                            {item.descricao ||
                              "-"}
                          </td>

                          <td>
                            {formatarData(
                              item.data_vencimento
                            )}
                          </td>

                          <td>
                            {formatarData(
                              item.data_recebimento
                            )}
                          </td>

                          <td className="fw-semibold text-success">
                            {formatarValor(
                              item.valor
                            )}
                          </td>

                          <td>
                            {item.forma_pagamento ||
                              "-"}
                          </td>

                          <td>
                            <div className="d-flex justify-content-end">

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  abrirWhatsAppConfirmacao(
                                    item
                                  )
                                }
                              >
                                WhatsApp
                              </button>

                            </div>
                          </td>

                        </tr>
                      )
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>
      {/* MODAL */}
      {modalAberto && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">

              {/* CABEÇALHO */}
              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  {modoModal === "acusar"
                    ? "✓ Acusar recebimento"
                    : "➕ Novo recebimento"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                />

              </div>

              {/* CORPO */}
              <div className="modal-body">

                {modoModal === "acusar" && (
                  <div className="alert alert-info">
                    <strong>
                      Registro de pagamento
                    </strong>

                    <br />

                    Informe os dados do recebimento
                    e confirme para registrar o pagamento.
                  </div>
                )}

                <div className="row g-3">

                  {/* TIPO */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
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
                      disabled={
                        modoModal === "acusar"
                      }
                    >

                      <option value="aluguel_mensal">
                        Aluguel mensal
                      </option>

                      <option value="diaria">
                        Diária
                      </option>

                      <option value="venda_unitaria">
                        Venda unitária
                      </option>

                      <option value="venda_parcelada">
                        Venda parcelada
                      </option>

                    </select>

                  </div>

                  {/* CLIENTE */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
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

                      {clientes.map(
                        (cliente) => (
                          <option
                            key={
                              cliente.id
                            }
                            value={
                              cliente.id
                            }
                          >
                            {cliente.nome ||
                              cliente.name ||
                              cliente.razao_social ||
                              cliente.nome_completo ||
                              `Cliente #${cliente.id}`}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* IMÓVEL */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
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

                      {imoveis.map(
                        (imovel) => (
                          <option
                            key={
                              imovel.id
                            }
                            value={
                              imovel.id
                            }
                          >
                            {imovel.nome ||
                              imovel.titulo ||
                              imovel.endereco ||
                              imovel.descricao ||
                              `Imóvel #${imovel.id}`}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* COMPETÊNCIA */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Competência
                    </label>

                    <input
                      type="month"
                      className="form-control"
                      value={
                        competencia
                          ? competencia.substring(
                              0,
                              7
                            )
                          : ""
                      }
                      onChange={(e) =>
                        setCompetencia(
                          `${e.target.value}-01`
                        )
                      }
                    />

                  </div>

                  {/* ALUGUEL MENSAL */}
                  {tipoRecebimento ===
                    "aluguel_mensal" && (
                    <>
                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Valor do aluguel
                        </label>

                        <div className="input-group">

                          <span className="input-group-text">
                            R$
                          </span>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={valor}
                            onChange={(e) =>
                              setValor(
                                e.target.value
                              )
                            }
                            placeholder="0,00"
                          />

                        </div>

                      </div>

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Data de vencimento
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            dataVencimento
                          }
                          onChange={(e) =>
                            setDataVencimento(
                              e.target.value
                            )
                          }
                        />

                      </div>
                    </>
                  )}

                  {/* DIÁRIA */}
                  {tipoRecebimento ===
                    "diaria" && (
                    <>
                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Quantidade de diárias
                        </label>

                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={
                            quantidade
                          }
                          onChange={(e) =>
                            setQuantidade(
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Valor por diária
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
                            value={
                              valorUnitario
                            }
                            onChange={(e) =>
                              setValorUnitario(
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Total
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={formatarValor(
                            calcularTotalDiaria()
                          )}
                          readOnly
                        />

                      </div>

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Data de vencimento
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            dataVencimento
                          }
                          onChange={(e) =>
                            setDataVencimento(
                              e.target.value
                            )
                          }
                        />

                      </div>
                    </>
                  )}

                  {/* VENDA UNITÁRIA */}
                  {tipoRecebimento ===
                    "venda_unitaria" && (
                    <>
                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Quantidade
                        </label>

                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={
                            quantidade
                          }
                          onChange={(e) =>
                            setQuantidade(
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Valor unitário
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
                            value={
                              valorUnitario
                            }
                            onChange={(e) =>
                              setValorUnitario(
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Desconto
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
                            value={
                              desconto
                            }
                            onChange={(e) =>
                              setDesconto(
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Total da venda
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={formatarValor(
                            calcularTotalVenda()
                          )}
                          readOnly
                        />

                      </div>

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Data de vencimento
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            dataVencimento
                          }
                          onChange={(e) =>
                            setDataVencimento(
                              e.target.value
                            )
                          }
                        />

                      </div>
                    </>
                  )}

                  {/* VENDA PARCELADA */}
                  {tipoRecebimento ===
                    "venda_parcelada" && (
                    <>
                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Valor total
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
                            value={valor}
                            onChange={(e) =>
                              setValor(
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Total de parcelas
                        </label>

                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={
                            totalParcelas
                          }
                          onChange={(e) =>
                            setTotalParcelas(
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Valor da parcela
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={formatarValor(
                            calcularValorParcela()
                          )}
                          readOnly
                        />

                      </div>

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Primeira data de vencimento
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            primeiraDataVencimento
                          }
                          onChange={(e) =>
                            setPrimeiraDataVencimento(
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Intervalo entre parcelas
                        </label>

                        <select
                          className="form-select"
                          value={
                            intervaloParcelas
                          }
                          onChange={(e) =>
                            setIntervaloParcelas(
                              e.target.value
                            )
                          }
                        >

                          <option value="1">
                            Mensal
                          </option>

                          <option value="2">
                            A cada 2 meses
                          </option>

                          <option value="3">
                            A cada 3 meses
                          </option>

                          <option value="6">
                            A cada 6 meses
                          </option>

                          <option value="12">
                            Anual
                          </option>

                        </select>

                      </div>

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Parcela atual
                        </label>

                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={parcela}
                          onChange={(e) =>
                            setParcela(
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </>
                  )}

                  {/* DATA DO RECEBIMENTO */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Data do recebimento
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={
                        dataRecebimento
                      }
                      onChange={(e) =>
                        setDataRecebimento(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {/* FORMA DE PAGAMENTO */}
                  <div className="col-md-6">

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
                    >

                      <option value="PIX">
                        PIX
                      </option>

                      <option value="Dinheiro">
                        Dinheiro
                      </option>

                      <option value="Cartão de crédito">
                        Cartão de crédito
                      </option>

                      <option value="Cartão de débito">
                        Cartão de débito
                      </option>

                      <option value="Transferência">
                        Transferência
                      </option>

                      <option value="Boleto">
                        Boleto
                      </option>

                      <option value="Outro">
                        Outro
                      </option>

                    </select>

                  </div>
{/* STATUS */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Status
                    </label>

                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) =>
                        setStatus(
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

                      <option value="Cancelado">
                        Cancelado
                      </option>

                    </select>

                  </div>

                  {/* DESCRIÇÃO */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Descrição
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        descricao
                      }
                      onChange={(e) =>
                        setDescricao(
                          e.target.value
                        )
                      }
                      placeholder="Descrição do recebimento"
                    />

                  </div>

                  {/* OBSERVAÇÕES */}
                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Observações
                    </label>

                    <textarea
                      className="form-control"
                      rows="3"
                      value={
                        observacoes
                      }
                      onChange={(e) =>
                        setObservacoes(
                          e.target.value
                        )
                      }
                      placeholder="Observações adicionais"
                    />

                  </div>

                </div>

              </div>
              {/* RODAPÉ DO MODAL */}
              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={salvarRecebimento}
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : modoModal === "acusar"
                    ? "✓ Confirmar recebimento"
                    : "💾 Salvar recebimento"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  )
}
      