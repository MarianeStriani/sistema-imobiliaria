"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FinanceiroPage() {
  const [recebimentos, setRecebimentos] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const hoje = new Date();

  const [mes, setMes] = useState(
    String(hoje.getMonth() + 1)
  );

  const [ano, setAno] = useState(
    String(hoje.getFullYear())
  );

  async function carregarDados() {
    setLoading(true);
    setErro("");

    try {
      const [
        {
          data: recebimentosData,
          error: recebimentosError,
        },
        {
          data: despesasData,
          error: despesasError,
        },
      ] = await Promise.all([
        supabase
          .from("recebimentos")
          .select("*"),

        supabase
          .from("despesas")
          .select("*"),
      ]);

      if (recebimentosError) {
        throw new Error(
          recebimentosError.message
        );
      }

      if (despesasError) {
        throw new Error(
          despesasError.message
        );
      }

      setRecebimentos(
        recebimentosData || []
      );

      setDespesas(
        despesasData || []
      );
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível carregar os dados financeiros."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function pagamentoConfirmado(status) {
    const valor = String(status || "")
      .trim()
      .toLowerCase();

    return [
      "pago",
      "recebido",
      "confirmado",
      "realizado",
    ].includes(valor);
  }

  function dataValida(valor) {
    if (!valor) {
      return false;
    }

    const dataConvertida = new Date(valor);

    return !Number.isNaN(
      dataConvertida.getTime()
    );
  }

  function formatarData(valor) {
    if (!dataValida(valor)) {
      return "-";
    }

    return new Date(
      valor
    ).toLocaleDateString("pt-BR");
  }

  function formatarMoeda(valor) {
    return Number(
      valor || 0
    ).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function acessarPagina(pagina) {
    window.location.href = pagina;
  }

  const movimentos = useMemo(() => {
    const entradas = (
      recebimentos || []
    )
      .filter((item) =>
        pagamentoConfirmado(
          item.status
        )
      )
      .filter((item) =>
        dataValida(
          item.data_recebimento
        )
      )
      .map((item) => ({
        id: `recebimento-${item.id}`,
        tipo: "entrada",
        descricao:
          item.descricao ||
          item.tipo_recebimento ||
          "Recebimento",
        valor: Number(
          item.valor || 0
        ),
        data:
          item.data_recebimento,
        formaPagamento:
          item.forma_pagamento ||
          "-",
      }));

    const saidas = (
      despesas || []
    )
      .filter((item) =>
        pagamentoConfirmado(
          item.status
        )
      )
      .filter((item) =>
        dataValida(
          item.data_despesa
        )
      )
      .map((item) => ({
        id: `despesa-${item.id}`,
        tipo: "saida",
        descricao:
          item.descricao ||
          item.categoria ||
          "Despesa",
        valor: Number(
          item.valor || 0
        ),
        data:
          item.data_despesa,
        formaPagamento:
          item.forma_pagamento ||
          "-",
      }));

    return [
      ...entradas,
      ...saidas,
    ].sort(
      (a, b) =>
        new Date(b.data) -
        new Date(a.data)
    );
  }, [
    recebimentos,
    despesas,
  ]);

  const movimentosDoPeriodo =
    useMemo(() => {
      return movimentos.filter(
        (movimento) => {
          const data =
            new Date(
              movimento.data
            );

          return (
            data.getMonth() + 1 ===
              Number(mes) &&
            data.getFullYear() ===
              Number(ano)
          );
        }
      );
    }, [
      movimentos,
      mes,
      ano,
    ]);

  const entradas = useMemo(() => {
    return movimentosDoPeriodo
      .filter(
        (movimento) =>
          movimento.tipo ===
          "entrada"
      )
      .reduce(
        (
          total,
          movimento
        ) =>
          total +
          movimento.valor,
        0
      );
  }, [
    movimentosDoPeriodo,
  ]);

  const saidas = useMemo(() => {
    return movimentosDoPeriodo
      .filter(
        (movimento) =>
          movimento.tipo ===
          "saida"
      )
      .reduce(
        (
          total,
          movimento
        ) =>
          total +
          movimento.valor,
        0
      );
  }, [
    movimentosDoPeriodo,
  ]);

  const saldoAtual = useMemo(() => {
    return movimentos.reduce(
      (
        saldo,
        movimento
      ) => {
        if (
          movimento.tipo ===
          "entrada"
        ) {
          return (
            saldo +
            movimento.valor
          );
        }

        return (
          saldo -
          movimento.valor
        );
      },
      0
    );
  }, [movimentos]);

  const resultadoPeriodo =
    entradas - saidas;

  const meses = [
    {
      valor: "1",
      nome: "Janeiro",
    },
    {
      valor: "2",
      nome: "Fevereiro",
    },
    {
      valor: "3",
      nome: "Março",
    },
    {
      valor: "4",
      nome: "Abril",
    },
    {
      valor: "5",
      nome: "Maio",
    },
    {
      valor: "6",
      nome: "Junho",
    },
    {
      valor: "7",
      nome: "Julho",
    },
    {
      valor: "8",
      nome: "Agosto",
    },
    {
      valor: "9",
      nome: "Setembro",
    },
    {
      valor: "10",
      nome: "Outubro",
    },
    {
      valor: "11",
      nome: "Novembro",
    },
    {
      valor: "12",
      nome: "Dezembro",
    },
  ];

  return (
    <div className="container-fluid py-4">

      {/* ACESSO RÁPIDO */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: "48px",
                height: "48px",
              }}
            >
              <i className="bi bi-buildings text-primary fs-4"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>

              <small className="text-muted">
                Navegue rapidamente pelo sistema
              </small>
            </div>

          </div>

          <div className="row g-2">

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
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
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/clientes"
                  )
                }
              >
                <i className="bi bi-people d-block fs-5 mb-1"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/imoveis"
                  )
                }
              >
                <i className="bi bi-house-door d-block fs-5 mb-1"></i>
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/contratos"
                  )
                }
              >
                <i className="bi bi-file-earmark-text d-block fs-5 mb-1"></i>
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/recebimentos"
                  )
                }
              >
                <i className="bi bi-cash-coin d-block fs-5 mb-1"></i>
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/despesas"
                  )
                }
              >
                <i className="bi bi-wallet2 d-block fs-5 mb-1"></i>
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/financeiro"
                  )
                }
              >
                <i className="bi bi-bar-chart-line d-block fs-5 mb-1"></i>
                Financeiro
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* CABEÇALHO */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">

        <div className="d-flex align-items-center">

          <div
            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: "48px",
              height: "48px",
            }}
          >
            <i className="bi bi-bar-chart-line text-primary fs-4"></i>
          </div>

          <div>

            <h2 className="mb-1 fw-bold">
              ImobGest - Financeiro
            </h2>

            <p className="text-muted mb-0">
              Controle financeiro do sistema
            </p>

          </div>

        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={carregarDados}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>

          {loading
            ? "Atualizando..."
            : "Atualizar"}

        </button>

      </div>

      {/* ALERTAS */}
      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>

          {erro}

          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
            onClick={() =>
              setErro("")
            }
          ></button>

        </div>
      )}

      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>

          {sucesso}

          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
            onClick={() =>
              setSucesso("")
            }
          ></button>

        </div>
      )}

      {/* RESUMO FINANCEIRO */}
      <div className="row g-4 mb-4">

        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Saldo atual
                  </p>

                  <h3 className="fw-bold mb-0">
                    {formatarMoeda(
                      saldoAtual
                    )}
                  </h3>

                </div>

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-wallet2 text-primary fs-4"></i>
                </div>

              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Entradas
                  </p>

                  <h3 className="fw-bold text-success mb-0">
                    {formatarMoeda(
                      entradas
                    )}
                  </h3>

                </div>

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-down-circle text-success fs-4"></i>
                </div>

              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Saídas
                  </p>

                  <h3 className="fw-bold text-danger mb-0">
                    {formatarMoeda(
                      saidas
                    )}
                  </h3>

                </div>

                <div
                  className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-up-circle text-danger fs-4"></i>
                </div>

              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Resultado
                  </p>

                  <h3
                    className={
                      resultadoPeriodo >= 0
                        ? "fw-bold text-success mb-0"
                        : "fw-bold text-danger mb-0"
                    }
                  >
                    {formatarMoeda(
                      resultadoPeriodo
                    )}
                  </h3>

                </div>

                <div
                  className={
                    resultadoPeriodo >= 0
                      ? "bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                      : "bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  }
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i
                    className={
                      resultadoPeriodo >= 0
                        ? "bi bi-bar-chart-line text-success fs-4"
                        : "bi bi-bar-chart-line text-danger fs-4"
                    }
                  ></i>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* FILTROS */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: "48px",
                height: "48px",
              }}
            >
              <i className="bi bi-funnel text-primary fs-4"></i>
            </div>

            <div>

              <h5 className="mb-1 fw-bold">
                Filtros
              </h5>

              <small className="text-muted">
                Selecione o período para consultar as movimentações
              </small>

            </div>

          </div>

          <div className="row g-3">

            <div className="col-12 col-md-6">

              <label
                htmlFor="mes"
                className="form-label fw-semibold"
              >
                Mês
              </label>

              <select
                id="mes"
                className="form-select"
                value={mes}
                onChange={(e) =>
                  setMes(
                    e.target.value
                  )
                }
              >

                {meses.map(
                  (item) => (
                    <option
                      key={
                        item.valor
                      }
                      value={
                        item.valor
                      }
                    >
                      {item.nome}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="col-12 col-md-6">

              <label
                htmlFor="ano"
                className="form-label fw-semibold"
              >
                Ano
              </label>

              <input
                id="ano"
                type="number"
                className="form-control"
                value={ano}
                min="2000"
                max="2100"
                onChange={(e) =>
                  setAno(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

        </div>

      </div>

      {/* RESUMO DO PERÍODO */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: "48px",
                height: "48px",
              }}
            >
              <i className="bi bi-bar-chart-line text-primary fs-4"></i>
            </div>

            <div>

              <h5 className="mb-1 fw-bold">
                Resumo financeiro
              </h5>

              <small className="text-muted">
                Resultado do período selecionado
              </small>

            </div>

          </div>

          <div className="row g-3">

            <div className="col-12 col-md-4">

              <div className="border rounded p-3 h-100">

                <div className="d-flex align-items-center justify-content-between">

                  <span className="text-muted">
                    Entradas
                  </span>

                  <i className="bi bi-arrow-down-circle text-success fs-4"></i>

                </div>

                <h5 className="fw-bold text-success mt-2 mb-0">
                  {formatarMoeda(
                    entradas
                  )}
                </h5>

              </div>

            </div>

            <div className="col-12 col-md-4">

              <div className="border rounded p-3 h-100">

                <div className="d-flex align-items-center justify-content-between">

                  <span className="text-muted">
                    Saídas
                  </span>

                  <i className="bi bi-arrow-up-circle text-danger fs-4"></i>

                </div>

                <h5 className="fw-bold text-danger mt-2 mb-0">
                  {formatarMoeda(
                    saidas
                  )}
                </h5>

              </div>

            </div>

            <div className="col-12 col-md-4">

              <div className="border rounded p-3 h-100">

                <div className="d-flex align-items-center justify-content-between">

                  <span className="text-muted">
                    Resultado
                  </span>

                  <i
                    className={
                      resultadoPeriodo >= 0
                        ? "bi bi-graph-up-arrow text-success fs-4"
                        : "bi bi-graph-down-arrow text-danger fs-4"
                    }
                  ></i>

                </div>

                <h5
                  className={
                    resultadoPeriodo >= 0
                      ? "fw-bold text-success mt-2 mb-0"
                      : "fw-bold text-danger mt-2 mb-0"
                  }
                >
                  {formatarMoeda(
                    resultadoPeriodo
                  )}
                </h5>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* EXTRATO FINANCEIRO */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">

            <div className="d-flex align-items-center">

              <div
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <i className="bi bi-list-ul text-primary fs-4"></i>
              </div>

              <div>

                <h5 className="mb-1 fw-bold">
                  Extrato financeiro
                </h5>

                <small className="text-muted">
                  Movimentações financeiras do período selecionado
                </small>

              </div>

            </div>

            <span className="badge bg-light text-dark border">
              {movimentosDoPeriodo.length} movimentação
              {movimentosDoPeriodo.length !==
              1
                ? "s"
                : ""}
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
                Carregando movimentações...
              </p>

            </div>
          ) : movimentosDoPeriodo.length ===
            0 ? (
            <div className="text-center py-5">

              <i className="bi bi-inbox fs-1 text-muted"></i>

              <h6 className="fw-bold mt-3 mb-2">
                Nenhuma movimentação encontrada
              </h6>

              <p className="text-muted mb-0">
                Não existem movimentações financeiras
                para o período selecionado.
              </p>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>

                  <tr>

                    <th>
                      Data
                    </th>

                    <th>
                      Descrição
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Forma de pagamento
                    </th>

                    <th className="text-end">
                      Valor
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {movimentosDoPeriodo.map(
                    (
                      movimento
                    ) => (
                      <tr
                        key={
                          movimento.id
                        }
                      >

                        <td>
                          {formatarData(
                            movimento.data
                          )}
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {
                              movimento.descricao
                            }
                          </span>
                        </td>

                        <td>

                          {movimento.tipo ===
                          "entrada" ? (
                            <span className="badge bg-success">

                              <i className="bi bi-arrow-down me-1"></i>

                              Entrada

                            </span>
                          ) : (
                            <span className="badge bg-danger">

                              <i className="bi bi-arrow-up me-1"></i>

                              Saída

                            </span>
                          )}

                        </td>

                        <td>
                          {
                            movimento.formaPagamento
                          }
                        </td>

                        <td className="text-end">

                          <span
                            className={
                              movimento.tipo ===
                              "entrada"
                                ? "fw-bold text-success"
                                : "fw-bold text-danger"
                            }
                          >

                            {movimento.tipo ===
                            "entrada"
                              ? "+"
                              : "-"}

                            {" "}

                            {formatarMoeda(
                              movimento.valor
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

      {/* ENTRADAS E SAÍDAS */}
      <div className="row g-4 mb-4">

        {/* ENTRADAS */}
        <div className="col-12 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center mb-3">

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-down-circle text-success fs-4"></i>
                </div>

                <div>

                  <h5 className="mb-1 fw-bold">
                    Entradas
                  </h5>

                  <small className="text-muted">
                    Valores recebidos no período
                  </small>

                </div>

              </div>

              <div className="d-flex align-items-center justify-content-between border rounded p-3">

                <span className="text-muted">
                  Total recebido
                </span>

                <strong className="text-success">
                  {formatarMoeda(
                    entradas
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>

        {/* SAÍDAS */}
        <div className="col-12 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center mb-3">

                <div
                  className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-arrow-up-circle text-danger fs-4"></i>
                </div>

                <div>

                  <h5 className="mb-1 fw-bold">
                    Saídas
                  </h5>

                  <small className="text-muted">
                    Valores gastos no período
                  </small>

                </div>

              </div>

              <div className="d-flex align-items-center justify-content-between border rounded p-3">

                <span className="text-muted">
                  Total gasto
                </span>

                <strong className="text-danger">
                  {formatarMoeda(
                    saidas
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* SALDO DO PERÍODO */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

            <div className="d-flex align-items-center">

              <div
                className={
                  resultadoPeriodo >= 0
                    ? "bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                    : "bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                }
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <i
                  className={
                    resultadoPeriodo >= 0
                      ? "bi bi-wallet text-success fs-4"
                      : "bi bi-wallet text-danger fs-4"
                  }
                ></i>
              </div>

              <div>

                <h5 className="mb-1 fw-bold">
                  Saldo do período
                </h5>

                <small className="text-muted">
                  Entradas menos saídas
                </small>

              </div>

            </div>

            <div className="text-end">

              <h3
                className={
                  resultadoPeriodo >= 0
                    ? "fw-bold text-success mb-0"
                    : "fw-bold text-danger mb-0"
                }
              >
                {formatarMoeda(
                  resultadoPeriodo
                )}
              </h3>

            </div>

          </div>

        </div>

      </div>

      {/* RODAPÉ */}
      <footer className="text-center text-muted py-4">

        <div className="fw-semibold">
          ImobGest
        </div>

        <small>
          Dashboard atualizado em{" "}
          {hoje.toLocaleDateString(
            "pt-BR"
          )}
        </small>

      </footer>

    </div>
  );
}
