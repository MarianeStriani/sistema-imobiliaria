"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Recebimentos() {
  const [contratos, setContratos] = useState([])
  const [recebimentos, setRecebimentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState("")

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    setMensagem("")

    const [contratosResponse, recebimentosResponse] = await Promise.all([
      supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("recebimentos")
        .select("*")
        .order("id", { ascending: false }),
    ])

    if (contratosResponse.error) {
      console.error(contratosResponse.error)
      setMensagem("Erro ao carregar os contratos.")
    }

    if (recebimentosResponse.error) {
      console.error(recebimentosResponse.error)
      setMensagem("Erro ao carregar os recebimentos.")
    }

    setContratos(contratosResponse.data || [])
    setRecebimentos(recebimentosResponse.data || [])
    setCarregando(false)
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(data) {
    if (!data) return "-"

    const partes = String(data).split("-")

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }

    return data
  }

  function obterIdContrato(contrato) {
    return contrato.id
  }

  function obterRecebimentoDoContrato(contrato) {
    return recebimentos.find(
      (recebimento) =>
        String(recebimento.contrato_id) === String(obterIdContrato(contrato))
    )
  }

  const contratosAtivos = useMemo(() => {
    return contratos.filter(
      (contrato) =>
        String(contrato.status || "").toLowerCase() === "ativo"
    )
  }, [contratos])

  const pendentes = useMemo(() => {
    return contratosAtivos.filter((contrato) => {
      const recebimento = obterRecebimentoDoContrato(contrato)

      return !recebimento || recebimento.status !== "Recebido"
    })
  }, [contratosAtivos, recebimentos])

  const recebidos = useMemo(() => {
    return recebimentos.filter(
      (recebimento) =>
        String(recebimento.status || "").toLowerCase() ===
        "recebido"
    )
  }, [recebimentos])

  const totalPendente = useMemo(() => {
    return pendentes.reduce(
      (total, contrato) => total + Number(contrato.valor || 0),
      0
    )
  }, [pendentes])

  const totalRecebido = useMemo(() => {
    return recebidos.reduce(
      (total, recebimento) => total + Number(recebimento.valor || 0),
      0
    )
  }, [recebidos])

  async function salvarRecebimento(contrato) {
    setMensagem("")

    const recebimentoExistente = obterRecebimentoDoContrato(contrato)

    const dados = {
      contrato_id: contrato.id,
      cliente: contrato.cliente,
      imovel: contrato.imovel,
      vencimento: contrato.termino || null,
      valor: Number(contrato.valor || 0),
      status: "Recebido",
      data_recebimento: new Date().toISOString().split("T")[0],
    }

    let resultado

    if (recebimentoExistente) {
      resultado = await supabase
        .from("recebimentos")
        .update(dados)
        .eq("id", recebimentoExistente.id)
    } else {
      resultado = await supabase
        .from("recebimentos")
        .insert([dados])
    }

    if (resultado.error) {
      console.error(resultado.error)
      setMensagem(
        `Erro ao salvar o recebimento: ${resultado.error.message}`
      )
      return
    }

    setMensagem("Pagamento registrado com sucesso.")
    await carregarDados()
  }

  function lembrarPagamento(contrato) {
    const telefone = contrato.telefone || contrato.whatsapp || ""

    const mensagemWhatsApp =
      `Olá, ${contrato.cliente || ""}! ` +
      `Este é um lembrete referente ao pagamento do imóvel ` +
      `${contrato.imovel || ""}. ` +
      `Valor: ${formatarMoeda(contrato.valor)}. ` +
      `Por favor, verifique o pagamento do aluguel.`

    const numero = String(telefone).replace(/\D/g, "")

    const url = numero
      ? `https://wa.me/${numero}?text=${encodeURIComponent(
          mensagemWhatsApp
        )}`
      : `https://wa.me/?text=${encodeURIComponent(
          mensagemWhatsApp
        )}`

    window.open(url, "_blank")
  }

  function confirmarPagamento(recebimento) {
    const telefone =
      recebimento.telefone || recebimento.whatsapp || ""

    const mensagemWhatsApp =
      `Olá, ${recebimento.cliente || ""}! ` +
      `Confirmamos o recebimento do pagamento referente ao imóvel ` +
      `${recebimento.imovel || ""}, ` +
      `no valor de ${formatarMoeda(recebimento.valor)}. ` +
      `Obrigado!`

    const numero = String(telefone).replace(/\D/g, "")

    const url = numero
      ? `https://wa.me/${numero}?text=${encodeURIComponent(
          mensagemWhatsApp
        )}`
      : `https://wa.me/?text=${encodeURIComponent(
          mensagemWhatsApp
        )}`

    window.open(url, "_blank")
  }

  return (
    <div className="p-4 md:p-6">

      {/* MANTER O CABEÇALHO / ACESSO PADRÃO DO SISTEMA */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Pagamentos pendentes
          </p>

          <p className="text-2xl font-bold text-red-600">
            {pendentes.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Valor pendente
          </p>

          <p className="text-2xl font-bold">
            {formatarMoeda(totalPendente)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Pagamentos recebidos
          </p>

          <p className="text-2xl font-bold text-green-600">
            {recebidos.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Valor recebido
          </p>

          <p className="text-2xl font-bold">
            {formatarMoeda(totalRecebido)}
          </p>
        </div>
      </div>

      {mensagem && (
        <div className="mb-5 rounded-lg border bg-white p-3 text-sm">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Carregando recebimentos...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PENDENTES */}

          <section>
            <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    🔴 Recebimentos Pendentes
                  </h2>

                  <p className="text-sm text-gray-500">
                    Pagamentos gerados automaticamente pelos contratos
                    ativos.
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  {pendentes.length}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {pendentes.length === 0 ? (
                <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
                  Nenhum pagamento pendente.
                </div>
              ) : (
                pendentes.map((contrato) => {
                  const recebimento =
                    obterRecebimentoDoContrato(contrato)

                  return (
                    <div
                      key={contrato.id}
                      className="rounded-xl border bg-white p-5 shadow-sm"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          🔴 Pendente
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Cliente:</strong>{" "}
                          {contrato.cliente || "-"}
                        </p>

                        <p>
                          <strong>Imóvel:</strong>{" "}
                          {contrato.imovel || "-"}
                        </p>

                        <p>
                          <strong>Vencimento:</strong>{" "}
                          {formatarData(contrato.vencimento)}
                        </p>

                        <p>
                          <strong>Valor:</strong>{" "}
                          {formatarMoeda(contrato.valor)}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            salvarRecebimento(contrato)
                          }
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          💾 Marcar como recebido e salvar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            lembrarPagamento(contrato)
                          }
                          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          🔔 Lembrar do pagamento
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* RECEBIDOS */}

          <section>
            <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    🟢 Recebimentos Recebidos
                  </h2>

                  <p className="text-sm text-gray-500">
                    Pagamentos já confirmados no sistema.
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  {recebidos.length}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {recebidos.length === 0 ? (
                <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
                  Nenhum pagamento recebido.
                </div>
              ) : (
                recebidos.map((recebimento) => (
                  <div
                    key={recebimento.id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        🟢 Recebido
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Cliente:</strong>{" "}
                        {recebimento.cliente || "-"}
                      </p>

                      <p>
                        <strong>Imóvel:</strong>{" "}
                        {recebimento.imovel || "-"}
                      </p>

                      <p>
                        <strong>Vencimento:</strong>{" "}
                        {formatarData(recebimento.vencimento)}
                      </p>

                      <p>
                        <strong>Valor:</strong>{" "}
                        {formatarMoeda(recebimento.valor)}
                      </p>

                      <p>
                        <strong>Recebido em:</strong>{" "}
                        {formatarData(
                          recebimento.data_recebimento
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        confirmarPagamento(recebimento)
                      }
                      className="mt-5 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      📱 Confirmação de pagamento
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  )
}