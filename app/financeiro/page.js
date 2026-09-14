"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Financeiro() {
  const hoje = new Date()

  const [mes, setMes] = useState(
    hoje.getMonth() + 1
  )

  const [ano, setAno] = useState(
    hoje.getFullYear()
  )

  const [recebimentos, setRecebimentos] = useState([])

  const [carregando, setCarregando] = useState(true)

  const [erro, setErro] = useState("")

  // ==========================================
  // CARREGAR RECEBIMENTOS
  // ==========================================

  useEffect(() => {
    carregarRecebimentos()
  }, [])

  async function carregarRecebimentos() {
    setCarregando(true)
    setErro("")

    const { data, error } = await supabase
      .from("recebimentos")
      .select(`
        *,
        clientes (
          nome
        ),
        contratos (
          numero,
          cliente,
          imovel,
          tipo
        )
      `)
      .order("data_recebimento", {
        ascending: false,
      })

    if (error) {
      console.error(error)

      setErro(
        "Não foi possível carregar os recebimentos."
      )

      setRecebimentos([])
    } else {
      setRecebimentos(data || [])
    }

    setCarregando(false)
  }

  // ==========================================
  // RECEBIMENTOS DO MÊS
  // ==========================================

  const recebimentosDoMes = useMemo(() => {
    return recebimentos.filter((item) => {
      if (!item.data_recebimento) {
        return false
      }

      const data = new Date(
        item.data_recebimento + "T00:00:00"
      )

      return (
        data.getMonth() + 1 === Number(mes) &&
        data.getFullYear() === Number(ano)
      )
    })
  }, [
    recebimentos,
    mes,
    ano,
  ])

  // ==========================================
  // TOTAL RECEBIDO
  // ==========================================

  const totalRecebido = useMemo(() => {
    return recebimentosDoMes
      .filter(
        (item) =>
          item.status !== "Pendente"
      )
      .reduce(
        (total, item) =>
          total + Number(item.valor || 0),
        0
      )
  }, [recebimentosDoMes])

  // ==========================================
  // DESPESAS
  //
  // Por enquanto não temos uma tabela de
  // despesas no banco.
  // ==========================================

  const totalDespesas = 0

  // ==========================================
  // SALDO DISPONÍVEL
  // ==========================================

  const saldoDisponivel =
    totalRecebido - totalDespesas

  // ==========================================
  // VALORES POR CATEGORIA
  // ==========================================

  const valoresCategorias = useMemo(() => {
    const categorias = {
      "Locação": 0,
      "Compra e Venda": 0,
      "Temporada": 0,
      "Administração": 0,
    }

    recebimentosDoMes
      .filter(
        (item) =>
          item.status !== "Pendente"
      )
      .forEach((item) => {
        const categoria =
          item.categoria

        if (
          Object.prototype.hasOwnProperty.call(
            categorias,
            categoria
          )
        ) {
          categorias[categoria] += Number(
            item.valor || 0
          )
        }
      })

    return categorias
  }, [recebimentosDoMes])

  // ==========================================
  // FORMATAÇÃO DE MOEDA
  // ==========================================

  function moeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  // ==========================================
  // NOME DO MÊS
  // ==========================================

  function nomeMes(numero) {
    const meses = [
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

    return meses[
      Number(numero) - 1
    ]
  }

  // ==========================================
  // MÊS ANTERIOR
  // ==========================================

  function mesAnterior() {
    if (Number(mes) === 1) {
      setMes(12)
      setAno(Number(ano) - 1)
    } else {
      setMes(Number(mes) - 1)
    }
  }

  // ==========================================
  // PRÓXIMO MÊS
  // ==========================================

  function mesSeguinte() {
    if (Number(mes) === 12) {
      setMes(1)
      setAno(Number(ano) + 1)
    } else {
      setMes(Number(mes) + 1)
    }
  }

  // ==========================================
  // MÊS ATUAL
  // ==========================================

  function mesAtual() {
    const data = new Date()

    setMes(
      data.getMonth() + 1
    )

    setAno(
      data.getFullYear()
    )
  }

  // ==========================================
  // TELA
  // ==========================================

  return (
    <div className="container-fluid py-4">

      {/* =====================================
          CABEÇALHO
      ===================================== */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>

          <h1 className="fw-bold mb-1">
            Financeiro
          </h1>

          <p className="text-muted mb-0">
            Resumo financeiro da imobiliária
          </p>

        </div>

        <button
          className="btn btn-outline-primary"
          onClick={carregarRecebimentos}
        >
          🔄 Atualizar
        </button>

      </div>

      {/* =====================================
          ACESSO RÁPIDO
      ===================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Acesso rápido
          </h5>

          <div className="d-flex flex-wrap gap-2">

            <a
              href="/"
              className="btn btn-outline-primary"
            >
              📊 Dashboard
            </a>

            <a
              href="/recebimentos"
              className="btn btn-outline-success"
            >
              💰 Recebimentos
            </a>

            <a
              href="/contratos"
              className="btn btn-outline-dark"
            >
              📄 Contratos
            </a>

            <a
              href="/clientes"
              className="btn btn-outline-secondary"
            >
              👥 Clientes
            </a>

            <a
              href="/imoveis"
              className="btn btn-outline-info"
            >
              🏠 Imóveis
            </a>

          </div>

        </div>

      </div>

      {/* =====================================
          FILTRO POR MÊS
      ===================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>

              <h5 className="fw-bold mb-1">
                Período
              </h5>

              <span className="text-muted">
                {nomeMes(mes)} de {ano}
              </span>

            </div>

            <div className="d-flex gap-2 flex-wrap">

              <button
                className="btn btn-outline-secondary"
                onClick={mesAnterior}
              >
                ◀
              </button>

              <select
                className="form-select"
                style={{
                  width: "150px",
                }}
                value={mes}
                onChange={(e) =>
                  setMes(
                    Number(
                      e.target.value
                    )
                  )
                }
              >

                {Array.from(
                  {
                    length: 12,
                  },
                  (_, index) => (
                    <option
                      key={index + 1}
                      value={index + 1}
                    >
                      {nomeMes(
                        index + 1
                      )}
                    </option>
                  )
                )}

              </select>

              <input
                type="number"
                className="form-control"
                style={{
                  width: "100px",
                }}
                value={ano}
                onChange={(e) =>
                  setAno(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              <button
                className="btn btn-outline-secondary"
                onClick={mesSeguinte}
              >
                ▶
              </button>

              <button
                className="btn btn-primary"
                onClick={mesAtual}
              >
                Mês atual
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          CARDS PRINCIPAIS
      ===================================== */}

      <div className="row g-4 mb-4">

        {/* TOTAL RECEBIDO */}

        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted mb-2">
                💰 Total recebido
              </div>

              <div className="fs-2 fw-bold text-success">
                {moeda(
                  totalRecebido
                )}
              </div>

              <small className="text-muted">
                Recebimentos pagos no mês
              </small>

            </div>

          </div>

        </div>

        {/* DESPESAS */}

        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted mb-2">
                💸 Despesas
              </div>

              <div className="fs-2 fw-bold text-danger">
                {moeda(
                  totalDespesas
                )}
              </div>

              <small className="text-muted">
                Despesas cadastradas
              </small>

            </div>

          </div>

        </div>

        {/* SALDO */}

        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted mb-2">
                🏦 Saldo disponível
              </div>

              <div
                className={`fs-2 fw-bold ${
                  saldoDisponivel >= 0
                    ? "text-primary"
                    : "text-danger"
                }`}
              >
                {moeda(
                  saldoDisponivel
                )}
              </div>

              <small className="text-muted">
                Recebimentos - despesas
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          VALORES POR CATEGORIA
      ===================================== */}

      <h4 className="fw-bold mb-3">
        Valores recebidos por categoria
      </h4>

      <div className="row g-4 mb-4">

        {/* LOCAÇÃO */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted">
                🏠 Locação
              </div>

              <div className="fs-4 fw-bold text-success mt-2">
                {moeda(
                  valoresCategorias[
                    "Locação"
                  ]
                )}
              </div>

            </div>

          </div>

        </div>

        {/* COMPRA E VENDA */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted">
                🤝 Compra e Venda
              </div>

              <div className="fs-4 fw-bold text-success mt-2">
                {moeda(
                  valoresCategorias[
                    "Compra e Venda"
                  ]
                )}
              </div>

            </div>

          </div>

        </div>

        {/* TEMPORADA */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted">
                🌴 Temporada
              </div>

              <div className="fs-4 fw-bold text-success mt-2">
                {moeda(
                  valoresCategorias[
                    "Temporada"
                  ]
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ADMINISTRAÇÃO */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted">
                📋 Administração
              </div>

              <div className="fs-4 fw-bold text-success mt-2">
                {moeda(
                  valoresCategorias[
                    "Administração"
                  ]
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          RESUMO
      ===================================== */}

      <div className="card shadow-sm border-0">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Resumo do período
          </h5>

          <div className="table-responsive">

            <table className="table mb-0">

              <tbody>

                <tr>

                  <td>
                    Total recebido
                  </td>

                  <td className="text-end fw-bold text-success">
                    {moeda(
                      totalRecebido
                    )}
                  </td>

                </tr>

                <tr>

                  <td>
                    Despesas
                  </td>

                  <td className="text-end fw-bold text-danger">
                    {moeda(
                      totalDespesas
                    )}
                  </td>

                </tr>

                <tr className="table-light">

                  <td className="fw-bold">
                    Saldo disponível
                  </td>

                  <td
                    className={`text-end fw-bold fs-5 ${
                      saldoDisponivel >= 0
                        ? "text-primary"
                        : "text-danger"
                    }`}
                  >
                    {moeda(
                      saldoDisponivel
                    )}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================
          CARREGANDO
      ===================================== */}

      {carregando && (
        <div className="alert alert-info mt-4">
          Carregando informações financeiras...
        </div>
      )}

      {/* =====================================
          ERRO
      ===================================== */}

      {erro && (
        <div className="alert alert-danger mt-4">
          {erro}
        </div>
      )}

    </div>
  )
}
