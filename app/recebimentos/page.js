"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Recebimentos() {
  const hoje = new Date()

  const [contratos, setContratos] = useState([])
  const [recebimentos, setRecebimentos] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState("")

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const [modalAberto, setModalAberto] = useState(false)
  const [contratoSelecionado, setContratoSelecionado] =
    useState(null)

  const [dataRecebimento, setDataRecebimento] =
    useState(
      hoje.toISOString().split("T")[0]
    )

  const [formaPagamento, setFormaPagamento] =
    useState("PIX")

  const [observacoes, setObservacoes] =
    useState("")

  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    setMensagem("")

    const contratosResponse = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false })

    if (contratosResponse.error) {
      console.error(contratosResponse.error)

      setMensagem(
        "Erro ao carregar os contratos."
      )

      setContratos([])
    } else {
      setContratos(
        contratosResponse.data || []
      )
    }

    const recebimentosResponse = await supabase
      .from("recebimentos")
      .select("*")
      .order("id", { ascending: false })

    if (recebimentosResponse.error) {
      console.error(recebimentosResponse.error)

      setRecebimentos([])
    } else {
      setRecebimentos(
        recebimentosResponse.data || []
      )
    }

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

  function obterDataVencimento(contrato) {
    if (!contrato?.inicio) return null

    const dataInicio = new Date(
      `${contrato.inicio}T00:00:00`
    )

    if (Number.isNaN(dataInicio.getTime())) {
      return null
    }

    const dia = dataInicio.getDate()

    const ultimoDiaDoMes = new Date(
      ano,
      mes,
      0
    ).getDate()

    const diaVencimento = Math.min(
      dia,
      ultimoDiaDoMes
    )

    const data = new Date(
      ano,
      mes - 1,
      diaVencimento
    )

    return `${data.getFullYear()}-${String(
      data.getMonth() + 1
    ).padStart(2, "0")}-${String(
      data.getDate()
    ).padStart(2, "0")}`
  }

  function contratoEstaAtivo(contrato) {
    if (!contrato) return false

    if (
      String(contrato.status).toLowerCase() !==
      "ativo"
    ) {
      return false
    }

    if (contrato.inicio) {
      const inicio = new Date(
        `${contrato.inicio}T00:00:00`
      )

      const referencia = new Date(
        ano,
        mes - 1,
        1
      )

      if (inicio > referencia) {
        return false
      }
    }

    if (contrato.termino) {
      const termino = new Date(
        `${contrato.termino}T23:59:59`
      )

      const ultimoDia = new Date(
        ano,
        mes,
        0,
        23,
        59,
        59
      )

      if (termino < ultimoDia) {
        return false
      }
    }

    return true
  }

  const contratosAtivos = useMemo(() => {
    return contratos.filter(contratoEstaAtivo)
  }, [contratos, mes, ano])

  function buscarRecebimento(contratoId) {
    return recebimentos.find(
      (recebimento) =>
        String(recebimento.contrato_id) ===
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
      (recebimento) => {
        if (
          String(
            recebimento.status
          ).toLowerCase() !== "recebido"
        ) {
          return false
        }

        if (!recebimento.data_recebimento) {
          return true
        }

        const data = new Date(
          `${recebimento.data_recebimento}T00:00:00`
        )

        return (
          data.getMonth() + 1 === mes &&
          data.getFullYear() === ano
        )
      }
    )
  }, [recebimentos, mes, ano])

  const quantidadePendentes =
    pendentes.length

  const valorPendente =
    pendentes.reduce(
      (total, contrato) =>
        total +
        Number(contrato.valor || 0),
      0
    )

  const quantidadeRecebidos =
    recebidos.length

  const valorRecebido =
    recebidos.reduce(
      (total, recebimento) =>
        total +
        Number(recebimento.valor || 0),
      0
    )

  function abrirModalRecebimento(
    contrato
  ) {
    setContratoSelecionado(contrato)

    setDataRecebimento(
      new Date()
        .toISOString()
        .split("T")[0]
    )

    setFormaPagamento("PIX")
    setObservacoes("")
    setMensagem("")

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setContratoSelecionado(null)
  }

  async function confirmarRecebimento() {
    if (!contratoSelecionado) {
      return
    }

    if (!dataRecebimento) {
      setMensagem(
        "Informe a data do recebimento."
      )

      return
    }

    setSalvando(true)
    setMensagem("")

    const dados = {
      contrato_id:
        contratoSelecionado.id,

      valor: Number(
        contratoSelecionado.valor || 0
      ),

      status: "Recebido",

      data_recebimento:
        dataRecebimento,

      forma_pagamento:
        formaPagamento,

      observacoes:
        observacoes || null,
    }

    const recebimentoExistente =
      contratoSelecionado.recebimento

    let resposta

    if (recebimentoExistente?.id) {
      resposta = await supabase
        .from("recebimentos")
        .update(dados)
        .eq(
          "id",
          recebimentoExistente.id
        )
    } else {
      resposta = await supabase
        .from("recebimentos")
        .insert([dados])
    }

    if (resposta.error) {
      console.error(
        resposta.error
      )

      setMensagem(
        "Não foi possível registrar o recebimento. Verifique as colunas da tabela recebimentos no Supabase."
      )

      setSalvando(false)

      return
    }

    setModalAberto(false)
    setContratoSelecionado(null)

    setMensagem(
      "Pagamento recebido e registrado com sucesso."
    )

    setSalvando(false)

    await carregarDados()
  }

  function abrirWhatsAppLembrete(
    contrato
  ) {
    const telefone =
      contrato.telefone ||
      contrato.celular ||
      contrato.whatsapp ||
      ""

    const mensagemWhatsApp =
      `Olá, ${
        contrato.cliente || ""
      }! Tudo bem?\n\n` +
      `Este é um lembrete referente ao pagamento do imóvel ${
        contrato.imovel || ""
      }.\n\n` +
      `Vencimento: ${
        formatarData(
          contrato.vencimento
        )
      }\n` +
      `Valor: ${
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
          mensagemWhatsApp
        )}`
      : `https://wa.me/?text=${encodeURIComponent(
          mensagemWhatsApp
        )}`

    window.open(
      url,
      "_blank"
    )
  }

  function abrirWhatsAppConfirmacao(
    recebimento
  ) {
    const mensagemWhatsApp =
      `Olá, ${
        recebimento.cliente || ""
      }! Tudo bem?\n\n` +
      `Confirmamos o recebimento do pagamento referente ao imóvel ${
        recebimento.imovel || ""
      }.\n\n` +
      `Valor recebido: ${
        formatarValor(
          recebimento.valor
        )
      }\n` +
      `Data do recebimento: ${
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
          mensagemWhatsApp
        )}`
      : `https://wa.me/?text=${encodeURIComponent(
          mensagemWhatsApp
        )}`

    window.open(
      url,
      "_blank"
    )
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

  return (
    <main className="container py-4">

      {/* TÍTULO */}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <div>
          <h1 className="fw-bold mb-1">
            Recebimentos
          </h1>

          <p className="text-muted mb-0">
            Controle de pagamentos dos contratos imobiliários
          </p>
        </div>

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

      {/* MENSAGEM */}
      {mensagem && (
        <div className="alert alert-info shadow-sm">
          {mensagem}
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
                Visualizando{" "}
                {nomeMes(mes)} de {ano}
              </span>
            </div>

            <div className="d-flex gap-2">

              <button
                className="btn btn-light border"
                onClick={() =>
                  mudarMes(-1)
                }
              >
                ← Anterior
              </button>

              <button
                className="btn btn-light border"
                onClick={() =>
                  mudarMes(1)
                }
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
                {formatarValor(
                  valorPendente
                )}
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
                {formatarValor(
                  valorRecebido
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* DUAS COLUNAS */}
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
                    Todos os pagamentos estão em dia.
                  </p>

                </div>

              ) : (

                <div className="d-flex flex-column gap-3">

                  {pendentes.map(
                    (contrato) => (

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

                          <span className="badge bg-danger-subtle text-danger">
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

                    )
                  )}

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
                    Ainda não existem recebimentos neste período.
                  </p>

                </div>

              ) : (

                <div className="d-flex flex-column gap-3">

                  {recebidos.map(
                    (recebimento) => (

                      <div
                        key={recebimento.id}
                        className="border rounded-4 p-3"
                      >

                        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">

                          <div>

                            <h5 className="fw-bold mb-1">
                              {recebimento.cliente ||
                                "Cliente"}
                            </h5>

                            <div className="text-muted">
                              🏢{" "}
                              {recebimento.imovel ||
                                "Imóvel"}
                            </div>

                          </div>

                          <span className="badge bg-success-subtle text-success">
                            Recebido
                          </span>

                        </div>

                        <div className="row g-2 mb-3">

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

                          <div className="col-6">

                            <div className="bg-light rounded-3 p-2">

                              <small className="text-muted d-block">
                                Recebido em
                              </small>

                              <strong>
                                {formatarData(
                                  recebimento.data_recebimento
                                )}
                              </strong>

                            </div>

                          </div>

                          <div className="col-12">

                            <div className="bg-light rounded-3 p-2">

                              <small className="text-muted d-block">
                                Forma de pagamento
                              </small>

                              <strong>
                                {recebimento.forma_pagamento ||
                                  "-"}
                              </strong>

                            </div>

                          </div>

                        </div>

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

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* MODAL DE ACUSAR RECEBIMENTO */}
      {modalAberto &&
        contratoSelecionado && (

          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
              backgroundColor:
                "rgba(0, 0, 0, 0.55)",
            }}
          >

            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">

              <div className="modal-content border-0 shadow-lg rounded-4">

                <div className="modal-header border-0">

                  <div>

                    <h5 className="modal-title fw-bold">
                      💰 Acusar recebimento
                    </h5>

                    <small className="text-muted">
                      Confirme os dados do pagamento
                    </small>

                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={fecharModal}
                    disabled={salvando}
                  />

                </div>

                <div className="modal-body">

                  {/* CLIENTE */}
                  <div className="mb-3">

                    <label className="form-label text-muted small">
                      Cliente
                    </label>

                    <div className="form-control bg-light">
                      {contratoSelecionado.cliente ||
                        "Não informado"}
                    </div>

                  </div>

                  {/* IMÓVEL */}
                  <div className="mb-3">

                    <label className="form-label text-muted small">
                      Imóvel
                    </label>

                    <div className="form-control bg-light">
                      {contratoSelecionado.imovel ||
                        "Não informado"}
                    </div>

                  </div>

                  {/* VENCIMENTO E VALOR */}
                  <div className="row g-3 mb-3">

                    <div className="col-6">

                      <label className="form-label text-muted small">
                        Vencimento
                      </label>

                      <div className="form-control bg-light">
                        {formatarData(
                          contratoSelecionado.vencimento
                        )}
                      </div>

                    </div>

                    <div className="col-6">

                      <label className="form-label text-muted small">
                        Valor
                      </label>

                      <div className="form-control bg-light fw-bold text-success">
                        {formatarValor(
                          contratoSelecionado.valor
                        )}
                      </div>

                    </div>

                  </div>

                  {/* DATA */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Data do recebimento
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={dataRecebimento}
                      onChange={(e) =>
                        setDataRecebimento(
                          e.target.value
                        )
                      }
                    />

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

                      <option value="PIX">
                        PIX
                      </option>

                      <option value="Transferência">
                        Transferência
                      </option>

                      <option value="Dinheiro">
                        Dinheiro
                      </option>

                      <option value="Cartão">
                        Cartão
                      </option>

                      <option value="Boleto">
                        Boleto
                      </option>

                      <option value="Outro">
                        Outro
                      </option>

                    </select>

                  </div>

                  {/* OBSERVAÇÕES */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Observações
                    </label>

                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Observações sobre o recebimento..."
                      value={observacoes}
                      onChange={(e) =>
                        setObservacoes(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {mensagem && (
                    <div className="alert alert-warning mb-0">
                      {mensagem}
                    </div>
                  )}

                </div>

                <div className="modal-footer border-0">

                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={fecharModal}
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
                    disabled={salvando}
                  >
                    {salvando
                      ? "Salvando..."
                      : "✓ Confirmar recebimento"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

    </main>
  )
}