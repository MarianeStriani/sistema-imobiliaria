"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Financeiro() {
  const hoje = new Date()

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const [recebimentos, setRecebimentos] = useState([])
  const [lancamentos, setLancamentos] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    setErro("")

    try {
      const { data: recebimentosData, error: recebimentosError } =
        await supabase
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
            ascending: true,
          })

      if (recebimentosError) {
        throw recebimentosError
      }

      const { data: lancamentosData, error: lancamentosError } =
        await supabase
          .from("lancamentos_financeiros")
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
          .order("data_lancamento", {
            ascending: true,
          })

      if (lancamentosError) {
        console.warn(
          "Não foi possível carregar lançamentos:",
          lancamentosError.message
        )

        setLancamentos([])
      } else {
        setLancamentos(lancamentosData || [])
      }

      setRecebimentos(recebimentosData || [])
    } catch (error) {
      console.error(error)

      setErro(
        "Não foi possível carregar os dados financeiros."
      )
    } finally {
      setCarregando(false)
    }
  }

  /*
   * ==========================================================
   * EXTRATO MENSAL
   * ==========================================================
   */

  const extratoMensal = useMemo(() => {
    const entradas = recebimentos
      .filter((item) => {
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
      .map((item) => ({
        id: `recebimento-${item.id}`,
        data: item.data_recebimento,
        tipo: "Entrada",
        descricao:
          item.observacoes || "Recebimento",
        contrato:
          item.contratos?.numero || "-",
        cliente:
          item.clientes?.nome ||
          item.contratos?.cliente ||
          "-",
        categoria:
          item.categoria ||
          item.contratos?.tipo ||
          "Outros",
        valor: Number(item.valor || 0),
        status: item.status || "Pago",
        origem: "recebimento",
      }))

    const outrosLancamentos = lancamentos
      .filter((item) => {
        if (!item.data_lancamento) {
          return false
        }

        const data = new Date(
          item.data_lancamento + "T00:00:00"
        )

        return (
          data.getMonth() + 1 === Number(mes) &&
          data.getFullYear() === Number(ano)
        )
      })
      .map((item) => ({
        id: `lancamento-${item.id}`,
        data: item.data_lancamento,
        tipo: item.tipo,
        descricao:
          item.descricao || "Lançamento",
        contrato:
          item.contratos?.numero || "-",
        cliente:
          item.clientes?.nome ||
          item.contratos?.cliente ||
          "-",
        categoria:
          item.categoria || "Outros",
        valor: Number(item.valor || 0),
        status: item.status || "Pago",
        origem: "lancamento",
        original: item,
      }))

    return [
      ...entradas,
      ...outrosLancamentos,
    ].sort((a, b) => {
      return (
        new Date(a.data + "T00:00:00") -
        new Date(b.data + "T00:00:00")
      )
    })
  }, [recebimentos, lancamentos, mes, ano])

  /*
   * ==========================================================
   * TOTAIS
   * ==========================================================
   */

  const totalEntradas = useMemo(() => {
    return extratoMensal
      .filter(
        (item) =>
          item.tipo === "Entrada" &&
          item.status !== "Pendente"
      )
      .reduce(
        (total, item) =>
          total + Number(item.valor || 0),
        0
      )
  }, [extratoMensal])

  const totalSaidas = useMemo(() => {
    return extratoMensal
      .filter(
        (item) =>
          item.tipo === "Saída" &&
          item.status !== "Pendente"
      )
      .reduce(
        (total, item) =>
          total + Number(item.valor || 0),
        0
      )
  }, [extratoMensal])

  const totalDisponivel =
    totalEntradas - totalSaidas

  /*
   * ==========================================================
   * FORMATAÇÃO
   * ==========================================================
   */

  function formatarMoeda(valor) {
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

    return new Date(
      data + "T00:00:00"
    ).toLocaleDateString("pt-BR")
  }

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

    return meses[Number(numero) - 1]
  }

  function mesAnterior() {
    if (Number(mes) === 1) {
      setMes(12)
      setAno(Number(ano) - 1)
    } else {
      setMes(Number(mes) - 1)
    }
  }

  function mesSeguinte() {
    if (Number(mes) === 12) {
      setMes(1)
      setAno(Number(ano) + 1)
    } else {
      setMes(Number(mes) + 1)
    }
  }

  function mesAtual() {
    const data = new Date()

    setMes(data.getMonth() + 1)
    setAno(data.getFullYear())
  }

  /*
   * ==========================================================
   * TELA
   * ==========================================================
   */

  return (
    <div className="container-fluid py-4">

      {/* ======================================================
          CABEÇALHO
      ====================================================== */}

      <div className="mb-4">
        <h1 className="fw-bold mb-1">
          Financeiro
        </h1>

        <p className="text-muted mb-0">
          Extrato mensal de entradas e saídas
        </p>
      </div>

      {/* ======================================================
          ACESSO RÁPIDO
      ====================================================== */}

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

      {/* ======================================================
          FILTRO POR MÊS
      ====================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Filtrar por mês
              </h5>

              <span className="text-muted">
                {nomeMes(mes)} de {ano}
              </span>
            </div>

            <div className="d-flex flex-wrap gap-2">

              <button
                className="btn btn-outline-secondary"
                onClick={mesAnterior}
              >
                ◀
              </button>

              <select
                className="form-select"
                style={{ width: "150px" }}
                value={mes}
                onChange={(e) =>
                  setMes(Number(e.target.value))
                }
              >

                {Array.from(
                  { length: 12 },
                  (_, index) => (
                    <option
                      key={index + 1}
                      value={index + 1}
                    >
                      {nomeMes(index + 1)}
                    </option>
                  )
                )}

              </select>

              <input
                type="number"
                className="form-control"
                style={{ width: "100px" }}
                value={ano}
                onChange={(e) =>
                  setAno(Number(e.target.value))
                }
              />

              <button
                className="btn btn-outline-secondary"
                onClick={mesSeguinte}
              >
                ▶
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={mesAtual}
              >
                Mês atual
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          RESUMO
      ====================================================== */}

      <div className="row g-3 mb-4">

        {/* ENTRADAS */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted">
                Total de entradas
              </div>

              <div className="fs-3 fw-bold text-success mt-2">
                {formatarMoeda(
                  totalEntradas
                )}
              </div>

            </div>

          </div>

        </div>

        {/* SAÍDAS */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted">
                Total de saídas
              </div>

              <div className="fs-3 fw-bold text-danger mt-2">
                {formatarMoeda(
                  totalSaidas
                )}
              </div>

            </div>

          </div>

        </div>

        {/* DISPONÍVEL */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted">
                Total disponível
              </div>

              <div
                className={`fs-3 fw-bold mt-2 ${
                  totalDisponivel >= 0
                    ? "text-primary"
                    : "text-danger"
                }`}
              >
                {formatarMoeda(
                  totalDisponivel
                )}
              </div>

              <small className="text-muted">
                Entradas − Saídas
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          EXTRATO MENSAL
      ====================================================== */}

      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Extrato mensal
              </h5>

              <small className="text-muted">
                {nomeMes(mes)} de {ano}
              </small>

            </div>

            <span className="badge text-bg-primary">
              {extratoMensal.length} lançamentos
            </span>

          </div>

          {extratoMensal.length === 0 ? (

            <div className="alert alert-light border mb-0">
              Nenhum lançamento encontrado neste mês.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Contrato</th>
                    <th>Cliente / Inquilino</th>
                    <th>Categoria</th>
                    <th>Status</th>
                    <th className="text-end">
                      Valor
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {extratoMensal.map(
                    (item) => (
                      <tr key={item.id}>

                        <td>
                          {formatarData(
                            item.data
                          )}
                        </td>

                        <td>

                          {item.tipo ===
                          "Entrada" ? (

                            <span className="badge text-bg-success">
                              Entrada
                            </span>

                          ) : (

                            <span className="badge text-bg-danger">
                              Saída
                            </span>

                          )}

                        </td>

                        <td>
                          {item.descricao}
                        </td>

                        <td>
                          {item.contrato}
                        </td>

                        <td>
                          {item.cliente}
                        </td>

                        <td>
                          {item.categoria}
                        </td>

                        <td>

                          {item.status ===
                          "Pendente" ? (

                            <span className="badge text-bg-warning">
                              Pendente
                            </span>

                          ) : (

                            <span className="badge text-bg-success">
                              Pago
                            </span>

                          )}

                        </td>

                        <td
                          className={`text-end fw-bold ${
                            item.tipo ===
                            "Entrada"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >

                          {item.tipo ===
                          "Entrada"
                            ? "+"
                            : "-"}

                          {formatarMoeda(
                            item.valor
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

                <tfoot className="table-light">

                  <tr>

                    <th
                      colSpan="7"
                      className="text-end"
                    >
                      Total disponível:
                    </th>

                    <th
                      className={`text-end fs-5 ${
                        totalDisponivel >= 0
                          ? "text-primary"
                          : "text-danger"
                      }`}
                    >
                      {formatarMoeda(
                        totalDisponivel
                      )}
                    </th>

                  </tr>

                </tfoot>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ======================================================
          CARREGANDO
      ====================================================== */}

      {carregando && (
        <div className="position-fixed bottom-0 end-0 p-3">

          <div className="alert alert-info shadow">
            Carregando financeiro...
          </div>

        </div>
      )}

      {/* ======================================================
          ERRO
      ====================================================== */}

      {erro && (
        <div className="alert alert-danger mt-3">
          {erro}
        </div>
      )}

    </div>
  )
}