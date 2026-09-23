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
  const totalImoveis = useMemo(() => {
    return imoveis.length
  }, [imoveis])

  const recebimentosMes = useMemo(() => {
    return recebimentos.filter((item) => {
      return mesmaCompetencia(
        item.data_recebimento ||
          item.data_pagamento ||
          item.data_vencimento ||
          item.created_at
      )
    })
  }, [recebimentos])

  const despesasMes = useMemo(() => {
    return despesas.filter((item) => {
      return mesmaCompetencia(
        item.data_despesa ||
          item.data_pagamento ||
          item.data_vencimento ||
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
            item.valor_pago ||
            item.total
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
            item.valor_pago ||
            item.total
        )
      )
    }, 0)
  }, [despesasMes])

  const saldoMes = totalRecebimentos - totalDespesas

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
        status.includes("atras")
      )
    }).length
  }, [recebimentos])

  const contratosVencendo = useMemo(() => {
    const limite = new Date()

    limite.setDate(limite.getDate() + 30)

    return contratos.filter((contrato) => {
      const data =
        contrato.data_fim ||
        contrato.data_final ||
        contrato.vencimento ||
        contrato.data_vencimento

      const dataVencimento = dataValida(data)

      if (!dataVencimento) {
        return false
      }

      return (
        dataVencimento >= hoje &&
        dataVencimento <= limite
      )
    }).length
  }, [contratos])

  const ultimosRecebimentos = useMemo(() => {
    return [...recebimentos]
      .sort((a, b) => {
        const dataA = dataValida(
          a.data_recebimento ||
            a.data_pagamento ||
            a.data_vencimento ||
            a.created_at
        )

        const dataB = dataValida(
          b.data_recebimento ||
            b.data_pagamento ||
            b.data_vencimento ||
            b.created_at
        )

        return (
          (dataB?.getTime() || 0) -
          (dataA?.getTime() || 0)
        )
      })
      .slice(0, 5)
  }, [recebimentos])

  const percentualAlugados =
    totalImoveis > 0
      ? Math.round(
          (imoveisAlugados / totalImoveis) * 100
        )
      : 0

  const percentualDisponiveis =
    totalImoveis > 0
      ? Math.round(
          (imoveisDisponiveis / totalImoveis) * 100
        )
      : 0

  const percentualManutencao =
    totalImoveis > 0
      ? Math.round(
          (imoveisManutencao / totalImoveis) * 100
        )
      : 0

  function acessarPagina(url) {
    window.location.href = url
  }

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Carregando...
            </span>
          </div>

          <span className="ms-3">
            Carregando dashboard...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">

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
                className="btn btn-primary w-100 py-2"
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
                className="btn btn-outline-primary w-100 py-2"
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

          </div>
        </div>
      </div>

{/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            ImobGest - Dashboard
          </h2>
        </div>
      </div>

      {/* ERRO */}
      {erro && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center"
          role="alert"
        >
          <span>
            {erro}
          </span>

          <button
            type="button"
            className="btn-close"
            onClick={() => setErro("")}
          ></button>
        </div>
      )}

      {/* CARDS PRINCIPAIS */}
      <div className="row g-3 mb-4">

        {/* CLIENTES */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">
                    Clientes
                  </p>

                  <h3 className="fw-bold mb-0">
                    {clientes.length}
                  </h3>
                </div>

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-people text-primary fs-4"></i>
                </div>
              </div>

              <button
                className="btn btn-sm btn-link text-decoration-none p-0 mt-3"
                onClick={() => acessarPagina("/clientes")}
              >
                Ver clientes
                <i className="bi bi-arrow-right ms-1"></i>
              </button>

            </div>
          </div>
        </div>

        {/* CONTRATOS */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">
                    Contratos ativos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosAtivos.length}
                  </h3>
                </div>

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-file-earmark-check text-success fs-4"></i>
                </div>
              </div>

              <button
                className="btn btn-sm btn-link text-decoration-none p-0 mt-3"
                onClick={() => acessarPagina("/contratos")}
              >
                Ver contratos
                <i className="bi bi-arrow-right ms-1"></i>
              </button>

            </div>
          </div>
        </div>

        {/* RECEBIMENTOS */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">
                    Recebimentos do mês
                  </p>

                  <h3 className="fw-bold mb-0">
                    {formatarMoeda(totalRecebimentos)}
                  </h3>
                </div>

                <div
                  className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-cash-stack text-info fs-4"></i>
                </div>
              </div>

              <button
                className="btn btn-sm btn-link text-decoration-none p-0 mt-3"
                onClick={() => acessarPagina("/recebimentos")}
              >
                Ver recebimentos
                <i className="bi bi-arrow-right ms-1"></i>
              </button>

            </div>
          </div>
        </div>

        {/* DESPESAS */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">
                    Despesas do mês
                  </p>

                  <h3 className="fw-bold mb-0">
                    {formatarMoeda(totalDespesas)}
                  </h3>
                </div>

                <div
                  className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-wallet2 text-danger fs-4"></i>
                </div>
              </div>

              <button
                className="btn btn-sm btn-link text-decoration-none p-0 mt-3"
                onClick={() => acessarPagina("/despesas")}
              >
                Ver despesas
                <i className="bi bi-arrow-right ms-1"></i>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* FINANCEIRO */}
      <div className="row g-3 mb-4">

        {/* RECEITAS */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center mb-3">
                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <i className="bi bi-arrow-down-left text-success fs-5"></i>
                </div>

                <div>
                  <small className="text-muted">
                    Receitas
                  </small>

                  <h5 className="fw-bold mb-0">
                    {formatarMoeda(totalRecebimentos)}
                  </h5>
                </div>
              </div>

              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{
                    width:
                      totalRecebimentos > 0
                        ? "100%"
                        : "0%",
                  }}
                ></div>
              </div>

            </div>
          </div>
        </div>

        {/* DESPESAS */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center mb-3">
                <div
                  className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <i className="bi bi-arrow-up-right text-danger fs-5"></i>
                </div>

                <div>
                  <small className="text-muted">
                    Despesas
                  </small>

                  <h5 className="fw-bold mb-0">
                    {formatarMoeda(totalDespesas)}
                  </h5>
                </div>
              </div>

              <div classNa