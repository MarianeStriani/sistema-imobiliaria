"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DespesasPage() {
  const [despesas, setDespesas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState("");

  const [modalAberto, setModalAberto] =
    useState(false);

  const [editando, setEditando] =
    useState(null);

  const hoje = new Date();

  const [form, setForm] = useState({
    categoria: "",
    descricao: "",
    valor: "",
    data_despesa: "",
    forma_pagamento: "",
    status: "Pago",
    observações: "",
  });

  async function carregarDespesas() {
    setLoading(true);
    setErro("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("despesas")
        .select("*")
        .order("data_despesa", {
          ascending: false,
        });

      if (error) {
        throw new Error(
          error.message
        );
      }

      setDespesas(data || []);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível carregar as despesas."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  function abrirNovaDespesa() {
    setEditando(null);

    setForm({
      categoria: "",
      descricao: "",
      valor: "",
      data_despesa: "",
      forma_pagamento: "",
      status: "Pago",
      observações: "",
    });

    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEditarDespesa(despesa) {
    setEditando(despesa);

    setForm({
      categoria:
        despesa.categoria || "",
      descricao:
        despesa.descricao || "",
      valor:
        despesa.valor ?? "",
      data_despesa:
        despesa.data_despesa || "",
      forma_pagamento:
        despesa.forma_pagamento || "",
      status:
        despesa.status || "Pago",
      observações:
        despesa.observações || "",
    });

    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(false);
    setEditando(null);
  }

  function alterarCampo(campo, valor) {
    setForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  function acessarPagina(pagina) {
    window.location.href = pagina;
  }

  function formatarMoeda(valor) {
    return Number(
      valor || 0
    ).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(valor) {
    if (!valor) {
      return "-";
    }

    const data = new Date(
      `${valor}T00:00:00`
    );

    if (
      Number.isNaN(
        data.getTime()
      )
    ) {
      return "-";
    }

    return data.toLocaleDateString(
      "pt-BR"
    );
  }

  async function salvarDespesa(e) {
    e.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      if (
        !form.categoria.trim()
      ) {
        throw new Error(
          "Informe a categoria da despesa."
        );
      }

      if (
        !form.descricao.trim()
      ) {
        throw new Error(
          "Informe a descrição da despesa."
        );
      }

      if (
        !form.valor ||
        Number(form.valor) <= 0
      ) {
        throw new Error(
          "Informe um valor válido para a despesa."
        );
      }

      if (
        !form.data_despesa
      ) {
        throw new Error(
          "Informe a data da despesa."
        );
      }

      const dados = {
        categoria:
          form.categoria.trim(),

        descricao:
          form.descricao.trim(),

        valor: Number(
          form.valor
        ),

        data_despesa:
          form.data_despesa,

        forma_pagamento:
          form.forma_pagamento ||
          null,

        status:
          form.status,

        observações:
          form.observações.trim() ||
          null,
      };

      if (editando) {
        const {
          error,
        } = await supabase
          .from("despesas")
          .update(dados)
          .eq(
            "id",
            editando.id
          );

        if (error) {
          throw new Error(
            error.message
          );
        }

        setSucesso(
          "Despesa atualizada com sucesso."
        );
      } else {
        const {
          error,
        } = await supabase
          .from("despesas")
          .insert([
            dados,
          ]);

        if (error) {
          throw new Error(
            error.message
          );
        }

        setSucesso(
          "Despesa cadastrada com sucesso."
        );
      }

      await carregarDespesas();

      setModalAberto(false);
      setEditando(null);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível salvar a despesa."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirDespesa(id) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir esta despesa?"
      );

    if (!confirmar) {
      return;
    }

    setErro("");
    setSucesso("");

    try {
      const {
        error,
      } = await supabase
        .from("despesas")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(
          error.message
        );
      }

      setDespesas(
        (listaAtual) =>
          listaAtual.filter(
            (item) =>
              item.id !== id
          )
      );

      setSucesso(
        "Despesa excluída com sucesso."
      );
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível excluir a despesa."
      );
    }
  }

  const despesasFiltradas =
    despesas.filter(
      (despesa) => {
        const textoBusca =
          busca
            .toLowerCase()
            .trim();

        const correspondeBusca =
          !textoBusca ||
          String(
            despesa.categoria ||
              ""
          )
            .toLowerCase()
            .includes(
              textoBusca
            ) ||
          String(
            despesa.descricao ||
              ""
          )
            .toLowerCase()
            .includes(
              textoBusca
            ) ||
          String(
            despesa.forma_pagamento ||
              ""
          )
            .toLowerCase()
            .includes(
              textoBusca
            );

        const correspondeStatus =
          !filtroStatus ||
          String(
            despesa.status || ""
          ).toLowerCase() ===
            filtroStatus.toLowerCase();

        return (
          correspondeBusca &&
          correspondeStatus
        );
      }
    );

  const totalDespesas =
    despesas.length;

  const totalFiltradas =
    despesasFiltradas.length;

  const valorTotal = despesas.reduce(
    (total, despesa) =>
      total +
      Number(
        despesa.valor || 0
      ),
    0
  );

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
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">

        <div className="d-flex align-items-center">

          <div
            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: "48px",
              height: "48px",
            }}
          >
            <i className="bi bi-wallet2 text-primary fs-4"></i>
          </div>

          <div>

            <h2 className="mb-1 fw-bold">
              ImobGest - Despesas
            </h2>

            <p className="text-muted mb-0">
              Controle e gerenciamento das despesas
            </p>

          </div>

        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={
            carregarDespesas
          }
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

      {/* RESUMO */}
      <div className="row g-4 mb-4">

        <div className="col-12 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Total de despesas
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalDespesas}
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
                    Valor total
                  </p>

                  <h3 className="fw-bold text-danger mb-0">
                    {formatarMoeda(
                      valorTotal
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
                  <i className="bi bi-cash-stack text-danger fs-4"></i>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* DESPESAS CADASTRADAS */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">

            <div className="d-flex align-items-center">

              <div
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <i className="bi bi-wallet2 text-primary fs-4"></i>
              </div>

              <div>

                <h5 className="mb-1 fw-bold">
                  Despesas cadastradas
                </h5>

                <small className="text-muted">
                  Gerencie as despesas do sistema
                </small>

              </div>

            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={
                abrirNovaDespesa
              }
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nova despesa
            </button>

          </div>

          {/* FILTROS */}
          <div className="card border-0 bg-light mb-4">

            <div className="card-body">

              <div className="row g-3">

                <div className="col-12 col-md-8">

                  <label
                    htmlFor="busca"
                    className="form-label fw-semibold"
                  >
                    Buscar
                  </label>

                  <div className="input-group">

                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>

                    <input
                      id="busca"
                      type="text"
                      className="form-control"
                      placeholder="Categoria, descrição ou forma de pagamento..."
                      value={busca}
                      onChange={(e) =>
                        setBusca(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="col-12 col-md-4">

                  <label
                    htmlFor="filtroStatus"
                    className="form-label fw-semibold"
                  >
                    Status
                  </label>

                  <select
                    id="filtroStatus"
                    className="form-select"
                    value={
                      filtroStatus
                    }
                    onChange={(e) =>
                      setFiltroStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Todos
                    </option>

                    <option value="Pago">
                      Pago
                    </option>

                    <option value="Pendente">
                      Pendente
                    </option>

                    <option value="Cancelado">
                      Cancelado
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </div>

          {/* TABELA */}
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
                Carregando despesas...
              </p>

            </div>
          ) : despesasFiltradas.length ===
            0 ? (
            <div className="text-center py-5">

              <i className="bi bi-wallet2 fs-1 text-muted"></i>

              <h6 className="fw-bold mt-3 mb-2">
                Nenhuma despesa encontrada
              </h6>

              <p className="text-muted mb-3">
                Não existem despesas para os filtros selecionados.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  abrirNovaDespesa
                }
              >
                <i className="bi bi-plus-lg me-2"></i>
                Cadastrar despesa
              </button>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>

                  <tr>

                    <th>
                      Categoria
                    </th>

                    <th>
                      Descrição
                    </th>

                    <th>
                      Data
                    </th>

                    <th>
                      Forma de pagamento
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end">
                      Valor
                    </th>

                    <th className="text-end">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {despesasFiltradas.map(
                    (despesa) => (
                      <tr
                        key={
                          despesa.id
                        }
                      >

                        <td>

                          <span className="fw-semibold">
                            {
                              despesa.categoria ||
                              "-"
                            }
                          </span>

                        </td>

                        <td>
                          {
                            despesa.descricao ||
                            "-"
                          }
                        </td>

                        <td>
                          {formatarData(
                            despesa.data_despesa
                          )}
                        </td>

                        <td>
                          {
                            despesa.forma_pagamento ||
                            "-"
                          }
                        </td>

                        <td>

                          {String(
                            despesa.status ||
                              ""
                          ).toLowerCase() ===
                          "pago" ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Pago
                            </span>
                          ) : String(
                              despesa.status ||
                                ""
                            ).toLowerCase() ===
                            "cancelado" ? (
                            <span className="badge bg-secondary">
                              <i className="bi bi-x-circle me-1"></i>
                              Cancelado
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-clock me-1"></i>
                              Pendente
                            </span>
                          )}

                        </td>

                        <td className="text-end">

                          <span className="fw-bold text-danger">
                            {formatarMoeda(
                              despesa.valor
                            )}
                          </span>

                        </td>

                        <td className="text-end">

                          <div className="d-flex justify-content-end gap-2">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Editar"
                              onClick={() =>
                                abrirEditarDespesa(
                                  despesa
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                                Editar
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir"
                              onClick={() =>
                                excluirDespesa(
                                  despesa.id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                                Excluir
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* RESULTADOS */}
          {!loading &&
            despesas.length > 0 && (
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">

                <small className="text-muted">
                  Exibindo{" "}
                  {totalFiltradas}{" "}
                  de{" "}
                  {totalDespesas}{" "}
                  despesas
                </small>

                <strong className="text-danger">
                  Total:{" "}
                  {formatarMoeda(
                    valorTotal
                  )}
                </strong>

              </div>
            )}

        </div>

      </div>

      {/* MODAL */}
      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <div className="d-flex align-items-center">

                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <i className="bi bi-wallet2 text-primary fs-4"></i>
                  </div>

                  <div>

                    <h5 className="modal-title fw-bold mb-0">
                      {editando
                        ? "Editar despesa"
                        : "Nova despesa"}
                    </h5>

                    <small className="text-muted">
                      Preencha os dados da despesa
                    </small>

                  </div>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={
                    fecharModal
                  }
                  disabled={
                    salvando
                  }
                ></button>

              </div>

              <form
                onSubmit={
                  salvarDespesa
                }
              >

                <div className="modal-body">

                  <div className="row g-3">

                    {/* CATEGORIA */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="categoria"
                        className="form-label fw-semibold"
                      >
                        Categoria
                      </label>

                      <select
                        id="categoria"
                        className="form-select"
                        value={
                          form.categoria
                        }
                        onChange={(e) =>
                          alterarCampo(
                            "categoria",
                            e.target.value
                          )
                        }
                        required
                      >

                        <option value="">
                          Selecione
                        </option>

                        <option value="Aluguel">
                          Aluguel
                        </option>

                        <option value="Manutenção">
                          Manutenção
                        </option>

                        <option value="Energia">
                          Energia
                        </option>

                        <option value="Água">
                          Água
                        </option>

                        <option value="Internet">
                          Internet
                        </option>

                        <option value="Impostos">
                          Impostos
                        </option>

                        <option value="Limpeza">
                          Limpeza
                        </option>

                        <option value="Materiais">
                          Materiais
                        </option>

                        <option value="Outros">
                          Outros
                        </option>

                      </select>

                    </div>

                    {/* DATA */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="data_despesa"
                        className="form-label fw-semibold"
                      >
                        Data da despesa
                      </label>

                      <input
                        id="data_despesa"
                        type="date"
                        className="form-control"
                        value={
                          form.data_despesa
                        }
                        onChange={(e) =>
                          alterarCampo(
                            "data_despesa",
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* DESCRIÇÃO */}
                    <div className="col-12">

                      <label
                        htmlFor="descricao"
                        className="form-label fw-semibold"
                      >
                        Descrição
                      </label>

                      <input
                        id="descricao"
                        type="text"
                        className="form-control"
                        placeholder="Ex.: Manutenção hidráulica do imóvel"
                        value={
                          form.descricao
                        }
                        onChange={(e) =>
                          alterarCampo(
                            "descricao",
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* VALOR */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="valor"
                        className="form-label fw-semibold"
                      >
                        Valor
                      </label>

                      <div className="input-group">

                        <span className="input-group-text">
                          R$
                        </span>

                        <input
                          id="valor"
                          type="number"
                          className="form-control"
                          placeholder="0,00"
                          value={
                            form.valor
                          }
                          min="0.01"
                          step="0.01"
                          onChange={(e) =>
                            alterarCampo(
                              "valor",
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>

                    </div>

                    {/* FORMA DE PAGAMENTO */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="forma_pagamento"
                        className="form-label fw-semibold"
                      >
                        Forma de pagamento
                      </label>

                      <select
                        id="forma_pagamento"
                        className="form-select"
                        value={
                          form.forma_pagamento
                        }
                        onChange={(e) =>
                          alterarCampo(
                            "forma_pagamento",
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Selecione
                        </option>

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

                        <option value="Boleto">
                          Boleto
                        </option>

                      </select>

                    </div>

                    {/* STATUS */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="status"
                        className="form-label fw-semibold"
                      >
                        Status
                      </label>

                      <select
                        id="status"
                        className="form-select"
                        value={
                          form.status
                        }
                        onChange={(e) =>
                          alterarCampo(
                            "status",
                            e.target.value
                          )
                        }
                      >

                        <option value="Pago">
                          Pago
                        </option>

                        <option value="Pendente">
                          Pendente
                        </option>

                        <option value="Cancelado">
                          Cancelado
                        </option>

                      </select>

                    </div>

                    {/* OBSERVAÇÕES */}
                    <div className="col-12">

                      <label
                        htmlFor="observacoes"
                        className="form-label fw-semibold"
                      >
                        Observações
                      </label>

                      <textarea
                        id="observacoes"
                        className="form-control"
                        rows="3"
                        placeholder="Observações adicionais..."
                        value={
                          form.observações
                        }
                        onChange={(e) =>
                          alterarCampo(
                            "observações",
                            e.target.value
                          )
                        }
                      ></textarea>

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      fecharModal
                    }
                    disabled={
                      salvando
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      salvando
                    }
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
                        <i className="bi bi-check-lg me-2"></i>

                        {editando
                          ? "Salvar alterações"
                          : "Cadastrar despesa"}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* RODAPÉ */}
      <footer className="text-center text-muted py-4">

        <div className="fw-semibold">
          ImobGest
        </div>

        <small>
          Página atualizada em{" "}
          {hoje.toLocaleDateString(
            "pt-BR"
          )}
        </small>

      </footer>

    </div>
  );
}
