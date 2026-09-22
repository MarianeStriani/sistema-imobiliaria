"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Contratos() {
  const [contratos, setContratos] = useState([])
  const [clientes, setClientes] = useState([])
  const [imoveis, setImoveis] = useState([])

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  const [form, setForm] = useState({
    numero: "",
    cliente_id: "",
    imovel_id: "",
    tipo: "Aluguel",
    status: "ativo",
    data_inicio: "",
    data_fim: "",
    valor: "",
  })

  async function carregarContratos() {
    try {
      setLoading(true)
      setErro("")

      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .order("id", {
          ascending: false,
        })

      if (error) {
        throw error
      }

      setContratos(data || [])
    } catch (error) {
      console.error(
        "Erro ao carregar contratos:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar os contratos."
      )
    } finally {
      setLoading(false)
    }
  }

  async function carregarClientes() {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", {
          ascending: true,
        })

      if (error) {
        throw error
      }

      setClientes(data || [])
    } catch (error) {
      console.error(
        "Erro ao carregar clientes:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar os clientes."
      )
    }
  }

  async function carregarImoveis() {
    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .order("id", {
          ascending: false,
        })

      if (error) {
        throw error
      }

      setImoveis(data || [])
    } catch (error) {
      console.error(
        "Erro ao carregar imóveis:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar os imóveis."
      )
    }
  }

  useEffect(() => {
    async function carregarDados() {
      await Promise.all([
        carregarContratos(),
        carregarClientes(),
        carregarImoveis(),
      ])
    }

    carregarDados()
  }, [])

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  function acessarPagina(pagina) {
    window.location.href = pagina
  }

  function formularioInicial() {
    return {
      numero: "",
      cliente_id: "",
      imovel_id: "",
      tipo: "Aluguel",
      status: "ativo",
      data_inicio: "",
      data_fim: "",
      valor: "",
    }
  }

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function abrirNovoContrato() {
    limparMensagens()

    setEditando(null)
    setForm(formularioInicial())
    setModalAberto(true)
  }

  function abrirEditarContrato(contrato) {
    limparMensagens()

    setEditando(contrato)

    setForm({
      numero: contrato.numero || "",

      // A coluna real do banco é "cliente"
      cliente_id: contrato.cliente || "",

      // A coluna real do banco é "imovel"
      imovel_id: contrato.imovel || "",

      tipo: contrato.tipo || "Aluguel",

      status: contrato.status || "ativo",

      data_inicio:
        contrato.data_inicio || "",

      data_fim:
        contrato.data_fim || "",

      valor:
        contrato.valor ?? "",
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
    setForm(formularioInicial())
  }
  return (
    <div className="container-fluid py-4">

      {/* ACESSO RÁPIDO */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-3">
            <i className="bi bi-grid me-2"></i>
            Acesso rápido
          </h5>

          <div className="d-flex flex-wrap gap-2">

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/dashboard")
              }
            >
              <i className="bi bi-speedometer2 me-1"></i>
              Dashboard
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/clientes")
              }
            >
              <i className="bi bi-people me-1"></i>
              Clientes
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/imoveis")
              }
            >
              <i className="bi bi-house me-1"></i>
              Imóveis
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                acessarPagina("/contratos")
              }
            >
              <i className="bi bi-file-earmark-text me-1"></i>
              Contratos
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/recebimentos")
              }
            >
              <i className="bi bi-cash-coin me-1"></i>
              Recebimentos
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/despesas")
              }
            >
              <i className="bi bi-receipt me-1"></i>
              Despesas
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() =>
                acessarPagina("/financeiro")
              }
            >
              <i className="bi bi-bar-chart-line me-1"></i>
              Financeiro
            </button>

          </div>

        </div>
      </div>

      {/* CABEÇALHO */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            ImobGest - Contratos
          </h2>
        </div>

        <div className="d-flex gap-2">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              limparMensagens()
              carregarContratos()
              carregarClientes()
              carregarImoveis()
            }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Atualizar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirNovoContrato}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Novo contrato
          </button>

        </div>

      </div>

      {/* ALERTA DE ERRO */}
      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>

          {erro}

          <button
            type="button"
            className="btn-close"
            onClick={() => setErro("")}
          ></button>
        </div>
      )}

      {/* ALERTA DE SUCESSO */}
      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle me-2"></i>

          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}

      {/* RESUMO */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Total
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalContratos}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-file-earmark-text"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Ativos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosAtivos}
                  </h3>
                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-check-circle"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Encerrados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosEncerrados}
                  </h3>
                </div>

                <div className="fs-2 text-secondary">
                  <i className="bi bi-file-earmark-check"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Cancelados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosCancelados}
                  </h3>
                </div>

                <div className="fs-2 text-danger">
                  <i className="bi bi-x-circle"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* FILTROS */}
      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </h5>

          <div className="row g-3">

            <div className="col-12 col-md-8">

              <label className="form-label">
                Buscar
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Número, cliente, imóvel ou tipo..."
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

              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(
                    e.target.value
                  )
                }
              >
                <option value="todos">
                  Todos
                </option>

                <option value="ativo">
                  Ativo
                </option>

                <option value="encerrado">
                  Encerrado
                </option>

                <option value="cancelado">
                  Cancelado
                </option>

              </select>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          LISTA DE CONTRATOS
          ===================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Contratos cadastrados
              </h5>

              <p className="text-muted mb-0">
                Visualize e gerencie os contratos cadastrados.
              </p>
            </div>

            <span className="text-muted small">
              {contratosFiltrados.length} contrato(s)
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
                Carregando contratos...
              </p>

            </div>

          ) : contratosFiltrados.length === 0 ? (

            <div className="text-center py-5">

              <i
                className="bi bi-file-earmark-text text-muted"
                style={{
                  fontSize: "3rem",
                }}
              ></i>

              <h6 className="fw-bold mt-3">
                Nenhum contrato encontrado
              </h6>

              <p className="text-muted mb-3">
                {busca || filtroStatus !== "todos"
                  ? "Nenhum contrato corresponde aos filtros informados."
                  : "Ainda não há contratos cadastrados."}
              </p>

              {!busca &&
                filtroStatus === "todos" && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      abrirNovoContrato
                    }
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Novo contrato
                  </button>
                )}

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      Nº
                    </th>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Imóvel
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Início
                    </th>

                    <th>
                      Fim
                    </th>

                    <th>
                      Valor
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {contratosFiltrados.map(
                    (contrato) => (
                      <tr
                        key={
                          contrato.id
                        }
                      >

                        <td>
                          <span className="fw-semibold">
                            {contrato.numero ||
                              "-"}
                          </span>
                        </td>

                        <td>
                          {contrato.cliente_nome ||
                            contrato.cliente ||
                            "-"}
                        </td>

                        <td>
                          {contrato.imovel_nome ||
                            contrato.imovel ||
                            "-"}
                        </td>

                        <td>
                          {contrato.tipo ||
                            "-"}
                        </td>

                        <td>
                          {contrato.data_inicio
                            ? new Date(
                                contrato.data_inicio +
                                  "T00:00:00"
                              ).toLocaleDateString(
                                "pt-BR"
                              )
                            : "-"}
                        </td>

                        <td>
                          {contrato.data_fim
                            ? new Date(
                                contrato.data_fim +
                                  "T00:00:00"
                              ).toLocaleDateString(
                                "pt-BR"
                              )
                            : "-"}
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {Number(
                              contrato.valor || 0
                            ).toLocaleString(
                              "pt-BR",
                              {
                                style:
                                  "currency",
                                currency:
                                  "BRL",
                              }
                            )}
                          </span>
                        </td>

                        <td>

                          <span
                            className={`badge ${
                              contrato.status ===
                              "ativo"
                                ? "bg-success"
                                : contrato.status ===
                                  "cancelado"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {contrato.status ===
                            "ativo"
                              ? "Ativo"
                              : contrato.status ===
                                "cancelado"
                              ? "Cancelado"
                              : contrato.status ||
                                "-"}
                          </span>

                        </td>

                        <td>

                          <div className="d-flex justify-content-end gap-2">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                abrirEditarContrato(
                                  contrato
                                )
                              }
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                excluirContrato(
                                  contrato
                                )
                              }
                              title="Excluir"
                            >
                              <i className="bi bi-trash"></i>
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

        </div>

      </div>
      {/* MODAL - NOVO / EDITAR CONTRATO */}
      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO DO MODAL */}
              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {editando
                      ? "Editar contrato"
                      : "Novo contrato"}
                  </h5>

                  <p className="text-muted mb-0 small">
                    {editando
                      ? "Atualize os dados do contrato."
                      : "Preencha os dados para cadastrar um novo contrato."}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>

              </div>

              {/* CORPO DO MODAL */}
              <div className="modal-body">

                <div className="row g-3">

                  {/* NÚMERO DO CONTRATO */}
                  <div className="col-12 col-md-4">

                    <label className="form-label fw-semibold">
                      Número do contrato *
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.numero}
                      onChange={(e) =>
                        alterarCampo(
                          "numero",
                          e.target.value
                        )
                      }
                      placeholder="Ex.: 001/2026"
                    />

                  </div>

                  {/* TIPO */}
                  <div className="col-12 col-md-4">

                    <label className="form-label fw-semibold">
                      Tipo
                    </label>

                    <select
                      className="form-select"
                      value={form.tipo}
                      onChange={(e) =>
                        alterarCampo(
                          "tipo",
                          e.target.value
                        )
                      }
                    >
                      <option value="Aluguel">
                        Aluguel
                      </option>

                      <option value="Venda">
                        Venda
                      </option>
                    </select>

                  </div>

                  {/* STATUS */}
                  <div className="col-12 col-md-4">

                    <label className="form-label fw-semibold">
                      Status
                    </label>

                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) =>
                        alterarCampo(
                          "status",
                          e.target.value
                        )
                      }
                    >
                      <option value="ativo">
                        Ativo
                      </option>

                      <option value="encerrado">
                        Encerrado
                      </option>

                      <option value="cancelado">
                        Cancelado
                      </option>
                    </select>

                  </div>

                  {/* CLIENTE */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Cliente *
                    </label>

                    <select
                      className="form-select"
                      value={form.cliente_id}
                      onChange={(e) =>
                        alterarCampo(
                          "cliente_id",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Selecione um cliente
                      </option>

                      {clientes.map((cliente) => (
                        <option
                          key={cliente.id}
                          value={cliente.id}
                        >
                          {cliente.nome}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* IMÓVEL */}
                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Imóvel *
                    </label>

                    <select
                      className="form-select"
                      value={form.imovel_id}
                      onChange={(e) =>
                        alterarCampo(
                          "imovel_id",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Selecione um imóvel
                      </option>

                      {imoveis.map((imovel) => (
                        <option
                          key={imovel.id}
                          value={imovel.id}
                        >
                          {imovel.titulo ||
                            imovel.endereco ||
                            `Imóvel #${imovel.id}`}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* DATA DE INÍCIO */}
                  <div className="col-12 col-md-4">

                    <label className="form-label fw-semibold">
                      Data de início *
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={form.data_inicio}
                      onChange={(e) =>
                        alterarCampo(
                          "data_inicio",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {/* DATA DE FIM */}
                  <div className="col-12 col-md-4">

                    <label className="form-label fw-semibold">
                      Data de fim
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={form.data_fim}
                      onChange={(e) =>
                        alterarCampo(
                          "data_fim",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {/* VALOR */}
                  <div className="col-12 col-md-4">

                    <label className="form-label fw-semibold">
                      Valor *
                    </label>

                    <div className="input-group">

                      <span className="input-group-text">
                        R$
                      </span>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="0.01"
                        value={form.valor}
                        onChange={(e) =>
                          alterarCampo(
                            "valor",
                            e.target.value
                          )
                        }
                        placeholder="0,00"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* RODAPÉ DO MODAL */}
              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={salvarContrato}
                  disabled={salvando}
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
                      <i className="bi bi-check-lg me-1"></i>

                      {editando
                        ? "Salvar alterações"
                        : "Cadastrar contrato"}
                    </>
                  )}

                </button>

              </div>

            </div>
          </div>
        </div>
      )}
      {/* FECHAMENTO DA ÁREA PRINCIPAL */}
      </div>
    </main>
  );
}