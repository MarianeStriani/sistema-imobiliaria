"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [contratos, setContratos] = useState([])
  const [imoveis, setImoveis] = useState([])
  const [recebimentos, setRecebimentos] = useState([])
  const [despesas, setDespesas] = useState([])

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")

  async function carregarDados() {
    setLoading(true)
    setErro("")

    try {
      const [
        clientesResult,
        contratosResult,
        imoveisResult,
        recebimentosResult,
        despesasResult,
      ] = await Promise.all([
        supabase.from("clientes").select("*"),
        supabase.from("contratos").select("*"),
        supabase.from("imoveis").select("*"),
        supabase.from("recebimentos").select("*"),
        supabase.from("despesas").select("*"),
      ])

      if (clientesResult.error) {
        throw clientesResult.error
      }

      if (contratosResult.error) {
        throw contratosResult.error
      }

      setClientes(clientesResult.data || [])
      setContratos(contratosResult.data || [])

      if (imoveisResult.error) {
        setImoveis([])
      } else {
        setImoveis(imoveisResult.data || [])
      }

      if (recebimentosResult.error) {
        setRecebimentos([])
      } else {
        setRecebimentos(recebimentosResult.data || [])
      }

      if (despesasResult.error) {
        setDespesas([])
      } else {
        setDespesas(despesasResult.data || [])
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)

      setErro(
        error?.message ||
          "Não foi possível carregar os dados do dashboard."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const hoje = new Date()
  const mesAtual = hoje.getMonth() + 1
  const anoAtual = hoje.getFullYear()

  function numero(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return 0
    }

    if (typeof valor === "number") {
      return valor
    }

    const texto = String(valor)
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")

    const resultado = Number(texto)

    return Number.isNaN(resultado) ? 0 : resultado
  }

  function dataValida(valor) {
    if (!valor) return null

    const data = new Date(valor)

    if (Number.isNaN(data.getTime())) {
      return null
    }

    return data
  }

  function mesmaCompetencia(valor) {
    const data = dataValida(valor)

    if (!data) return false

    return (
      data.getMonth() + 1 === mesAtual &&
      data.getFullYear() === anoAtual
    )
  }

  function formatarMoeda(valor) {
    return numero(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(valor) {
    const data = dataValida(valor)

    if (!data) return "-"

    return data.toLocaleDateString("pt-BR")
  }

  const contratosAtivos = useMemo(() => {
    return contratos.filter((contrato) => {
      const status = String(
        contrato.status ||
          contrato.situacao ||
          contrato.estado ||
          ""
      ).toLowerCase()

      return (
        status.includes("ativo") ||
        status.includes("vigente") ||
        status === ""
      )
    })
  }, [contratos])

  const imoveisAlugados = useMemo(() => {
    if (imoveis.length === 0) {
      return contratosAtivos.length
    }

    return imoveis.filter((imovel) => {
      const status = String(
        imovel.status ||
          imovel.situacao ||
          imovel.estado ||
          ""
      ).toLowerCase()

      return (
        status.includes("alugado") ||
        status.includes("ocupado") ||
        status.includes("locado")
      )
    }).length
  }, [imoveis, contratosAtivos])

  const imoveisDisponiveis = useMemo(() => {
    if (imoveis.length === 0) {
      return 0
    }

    return imoveis.filter((imovel) => {
      const status = String(
        imovel.status ||
          imovel.situacao ||
          imovel.estado ||
          ""
      ).toLowerCase()

      return (
        status.includes("dispon") ||
        status.includes("livre")
      )
    }).length
  }, [imoveis])

  const imoveisManutencao = useMemo(() => {
    if (imoveis.length === 0) {
      return 0
    }

    return imoveis.filter((imovel) => {
      const status = String(
        imovel.status ||
          imovel.situacao ||
          imovel.estado ||
          ""
      ).toLowerCase()

      return (
        status.includes("manuten") ||
        status.includes("reparo")
      )
    }).length
  }, [imoveis])

  const recebimentosMes = useMemo(() => {
    return recebimentos.filter((item) => {
      return mesmaCompetencia(
        item.data_recebimento ||
          item.data_pagamento ||
          item.data ||
          item.created_at
      )
    })
  }, [recebimentos])

  const despesasMes = useMemo(() => {
    return despesas.filter((item) => {
      return mesmaCompetencia(
        item.data_despesa ||
          item.data_pagamento ||
          item.data ||
          item.created_at
      )
    })
  }, [despesas])

  const totalRecebimentos = useMemo(() => {
    return recebimentosMes.reduce((total, item) => {
      return (
        total +
        numero(
          item.valor ||
            item.valor_recebido ||
            item.valor_pagamento ||
            0
        )
      )
    }, 0)
  }, [recebimentosMes])

  const totalDespesas = useMemo(() => {
    return despesasMes.reduce((total, item) => {
      return (
        total +
        numero(
          item.valor ||
            item.valor_despesa ||
            0
        )
      )
    }, 0)
  }, [despesasMes])

  const saldo = totalRecebimentos - totalDespesas

  const recebimentosPendentes = useMemo(() => {
    return recebimentos.filter((item) => {
      const status = String(
        item.status ||
          item.situacao ||
          ""
      ).toLowerCase()

      return (
        status.includes("pendente") ||
        status.includes("aberto") ||
        status.includes("vencido")
      )
    }).length
  }, [recebimentos])

  const contratosVencendo = useMemo(() => {
    const limite = new Date()
    limite.setDate(limite.getDate() + 30)

    return contratos.filter((contrato) => {
      const dataFim =
        contrato.data_fim ||
        contrato.data_final ||
        contrato.fim_contrato ||
        contrato.vencimento

      const data = dataValida(dataFim)

      if (!data) return false

      return data >= hoje && data <= limite
    }).length
  }, [contratos])

  const ultimosRecebimentos = useMemo(() => {
    return [...recebimentos]
      .sort((a, b) => {
        const dataA = dataValida(
          a.data_recebimento ||
            a.data_pagamento ||
            a.data ||
            a.created_at
        )

        const dataB = dataValida(
          b.data_recebimento ||
            b.data_pagamento ||
            b.data ||
            b.created_at
        )

        return (
          (dataB?.getTime() || 0) -
          (dataA?.getTime() || 0)
        )
      })
      .slice(0, 5)
  }, [recebimentos])

  const totalImoveis =
    imoveisAlugados +
    imoveisDisponiveis +
    imoveisManutencao

  function percentual(valor) {
    if (totalImoveis === 0) {
      return 0
    }

    return (valor / totalImoveis) * 100
  }

  return (
    <main className="container-fluid py-4">
      <div className="container">

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>
            <h1 className="fw-bold mb-1">
              Dashboard
            </h1>

            <p className="text-muted mb-0">
              Visão geral da administração imobiliária
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={carregarDados}
            disabled={loading}
          >
            {loading
              ? "Atualizando..."
              : "🔄 Atualizar"}
          </button>

        </div>

        {erro && (
          <div className="alert alert-warning">
            <strong>Atenção:</strong>{" "}
            {erro}
          </div>
        )}

        <div className="row g-3 mb-4">

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">

                <div className="text-muted small mb-2">
                  Clientes
                </div>

                <div className="fs-2 fw-bold">
                  {clientes.length}
                </div>

                <div className="small text-muted">
                  Clientes cadastrados
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">

                <div className="text-muted small mb-2">
                  Contratos
                </div>

                <div className="fs-2 fw-bold">
                  {contratosAtivos.length}
                </div>

                <div className="small text-muted">
                  Contratos ativos
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">

                <div className="text-muted small mb-2">
                  Recebimentos
                </div>

                <div className="fs-4 fw-bold">
                  {formatarMoeda(
                    totalRecebimentos
                  )}
                </div>

                <div className="small text-muted">
                  Recebidos neste mês
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">

                <div className="text-muted small mb-2">
                  Saldo
                </div>

                <div className="fs-4 fw-bold">
                  {formatarMoeda(saldo)}
                </div>

                <div className="small text-muted">
                  Recebimentos − despesas
                </div>

              </div>
            </div>
          </div>

        </div>

        <div className="row g-3 mb-4">

          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <div className="text-muted small">
                  Recebimentos pendentes
                </div>

                <div className="fs-2 fw-bold mt-2">
                  {recebimentosPendentes}
                </div>

                <div className="small text-muted">
                  Aguardando pagamento
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <div className="text-muted small">
                  Contratos vencendo
                </div>

                <div className="fs-2 fw-bold mt-2">
                  {contratosVencendo}
                </div>

                <div className="small text-muted">
                  Próximos 30 dias
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <div className="text-muted small">
                  Despesas do mês
                </div>

                <div className="fs-4 fw-bold mt-2">
                  {formatarMoeda(
                    totalDespesas
                  )}
                </div>

                <div className="small text-muted">
                  Total registrado
                </div>

              </div>
            </div>
          </div>

        </div>
        <div className="row g-4 mb-4">

          {/* SITUAÇÃO DOS IMÓVEIS */}

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h5 className="fw-bold mb-4">
                  Situação dos imóveis
                </h5>

                {totalImoveis === 0 ? (
                  <div className="text-center text-muted py-5">
                    Nenhum imóvel cadastrado.
                  </div>
                ) : (
                  <div>

                    <div
                      className="mx-auto mb-4"
                      style={{
                        width: "220px",
                        height: "220px",
                        borderRadius: "50%",
                        background: `conic-gradient(
                          #198754 0% ${percentual(imoveisAlugados)}%,
                          #0d6efd ${percentual(imoveisAlugados)}% ${percentual(
                            imoveisAlugados +
                              imoveisDisponiveis
                          )}%,
                          #ffc107 ${percentual(
                            imoveisAlugados +
                              imoveisDisponiveis
                          )}% 100%
                        )`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >

                      <div
                        className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "125px",
                          height: "125px",
                        }}
                      >

                        <div className="text-center">

                          <div className="fs-3 fw-bold">
                            {totalImoveis}
                          </div>

                          <div className="small text-muted">
                            imóveis
                          </div>

                        </div>

                      </div>

                    </div>

                    <div className="row text-center g-3">

                      <div className="col-4">

                        <div className="fw-bold fs-4">
                          {imoveisAlugados}
                        </div>

                        <div className="small text-muted">
                          🟢 Alugados
                        </div>

                      </div>

                      <div className="col-4">

                        <div className="fw-bold fs-4">
                          {imoveisDisponiveis}
                        </div>

                        <div className="small text-muted">
                          🔵 Disponíveis
                        </div>

                      </div>

                      <div className="col-4">

                        <div className="fw-bold fs-4">
                          {imoveisManutencao}
                        </div>

                        <div className="small text-muted">
                          🟡 Manutenção
                        </div>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>

          {/* RESUMO FINANCEIRO */}

          <div className="col-12 col-lg-6">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h5 className="fw-bold mb-4">
                  Resumo financeiro
                </h5>

                <div className="mb-4">

                  <div className="d-flex justify-content-between mb-2">

                    <span>
                      Recebimentos
                    </span>

                    <strong>
                      {formatarMoeda(
                        totalRecebimentos
                      )}
                    </strong>

                  </div>

                  <div
                    className="progress"
                    style={{
                      height: "10px",
                    }}
                  >

                    <div
                      className="progress-bar bg-success"
                      style={{
                        width:
                          totalRecebimentos > 0
                            ? "100%"
                            : "0%",
                      }}
                    />

                  </div>

                </div>

                <div className="mb-4">

                  <div className="d-flex justify-content-between mb-2">

                    <span>
                      Despesas
                    </span>

                    <strong>
                      {formatarMoeda(
                        totalDespesas
                      )}
                    </strong>

                  </div>

                  <div
                    className="progress"
                    style={{
                      height: "10px",
                    }}
                  >

                    <div
                      className="progress-bar bg-danger"
                      style={{
                        width:
                          totalDespesas > 0
                            ? Math.min(
                                (totalDespesas /
                                  Math.max(
                                    totalRecebimentos,
                                    totalDespesas
                                  )) *
                                  100,
                                100
                              ) + "%"
                            : "0%",
                      }}
                    />

                  </div>

                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center">

                  <span className="fw-bold">
                    Saldo do mês
                  </span>

                  <span className="fs-4 fw-bold">
                    {formatarMoeda(saldo)}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ÚLTIMOS RECEBIMENTOS */}

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-3">

              <h5 className="fw-bold mb-0">
                Últimos recebimentos
              </h5>

              <a
                href="/recebimentos"
                className="btn btn-sm btn-outline-primary"
              >
                Ver todos
              </a>

            </div>

            {ultimosRecebimentos.length === 0 ? (

              <div className="text-muted text-center py-4">
                Nenhum recebimento cadastrado.
              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead>

                    <tr>
                      <th>Cliente</th>
                      <th>Descrição</th>
                      <th>Data</th>
                      <th className="text-end">
                        Valor
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {ultimosRecebimentos.map(
                      (item, index) => (

                        <tr
                          key={
                            item.id || index
                          }
                        >

                          <td>
                            {item.cliente_nome ||
                              item.cliente ||
                              item.nome_cliente ||
                              "-"}
                          </td>

                          <td>
                            {item.descricao ||
                              item.observacoes ||
                              item.observacao ||
                              "-"}
                          </td>

                          <td>
                            {formatarData(
                              item.data_recebimento ||
                                item.data_pagamento ||
                                item.data ||
                                item.created_at
                            )}
                          </td>

                          <td className="text-end fw-bold">

                            {formatarMoeda(
                              item.valor ||
                                item.valor_recebido ||
                                item.valor_pagamento ||
                                0
                            )}

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

        {/* ACESSO RÁPIDO */}

        <div className="card shadow-sm border-0">

          <div className="card-body">

            <h5 className="fw-bold mb-4">
              Acesso rápido
            </h5>

            <div className="row g-3">

              <div className="col-6 col-md-3">

                <a
                  href="/clientes"
                  className="btn btn-outline-primary w-100 py-3"
                >
                  👥
                  <br />
                  Clientes
                </a>

              </div>

              <div className="col-6 col-md-3">

                <a
                  href="/contratos"
                  className="btn btn-outline-primary w-100 py-3"
                >
                  📄
                  <br />
                  Contratos
                </a>

              </div>

              <div className="col-6 col-md-3">

                <a
                  href="/recebimentos"
                  className="btn btn-outline-success w-100 py-3"
                >
                  💰
                  <br />
                  Recebimentos
                </a>

              </div>

              <div className="col-6 col-md-3">

                <a
                  href="/despesas"
                  className="btn btn-outline-danger w-100 py-3"
                >
                  💸
                  <br />
                  Despesas
                </a>

              </div>

            </div>

          </div>

        </div>

        <div className="text-center text-muted small mt-4">
          Sistema de Gestão Imobiliária
        </div>

      </div>
    </main>
  )
}