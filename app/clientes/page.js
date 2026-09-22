"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Clientes() {
  const [clientes, setClientes] = useState([])

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [busca, setBusca] = useState("")
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  const [consultandoCep, setConsultandoCep] = useState(false)

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    rg: "",
    telefone: "",
    email: "",
  })

  async function carregarClientes() {
    setLoading(true)
    setErro("")

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true })

      if (error) {
        throw error
      }

      setClientes(data || [])
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)

      setErro(
        error?.message ||
          "Não foi possível carregar os clientes."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  function abrirNovoCliente() {
    limparMensagens()

    setEditando(null)

    setForm({
      nome: "",
      cpf: "",
      rg: "",
      telefone: "",
      email: "",
    })

    setModalAberto(true)
  }

  function abrirEditarCliente(cliente) {
    limparMensagens()

    setEditando(cliente)

    setForm({
      nome: cliente.nome || "",
      cpf: cliente.cpf || "",
      rg: cliente.rg || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function acessarPagina(url) {
    window.location.href = url
  }

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return clientes
    }

    return clientes.filter((cliente) => {
      const nome = String(
        cliente.nome || ""
      ).toLowerCase()

      const cpf = String(
        cliente.cpf || ""
      ).toLowerCase()

      const telefone = String(
        cliente.telefone || ""
      ).toLowerCase()

      const email = String(
        cliente.email || ""
      ).toLowerCase()

      return (
        nome.includes(termo) ||
        cpf.includes(termo) ||
        telefone.includes(termo) ||
        email.includes(termo)
      )
    })
  }, [clientes, busca])

  async function salvarCliente(e) {
    e.preventDefault()

    limparMensagens()

    if (!form.nome.trim()) {
      setErro("Informe o nome do cliente.")
      return
    }

    setSalvando(true)

    try {
      const dados = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        rg: form.rg.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim(),
      }

      if (editando?.id) {
        const { error } = await supabase
          .from("clientes")
          .update(dados)
          .eq("id", editando.id)

        if (error) {
          throw error
        }

        setSucesso(
          "Cliente atualizado com sucesso."
        )
      } else {
        const { error } = await supabase
          .from("clientes")
          .insert([dados])

        if (error) {
          throw error
        }

        setSucesso(
          "Cliente cadastrado com sucesso."
        )
      }

      await carregarClientes()

      setModalAberto(false)
      setEditando(null)

      setForm({
        nome: "",
        cpf: "",
        rg: "",
        telefone: "",
        email: "",
      })
    } catch (error) {
      console.error(
        "Erro ao salvar cliente:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível salvar o cliente."
      )
    } finally {
      setSalvando(false)
    }
  }

  async function excluirCliente(cliente) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o cliente "${cliente.nome}"?`
    )

    if (!confirmar) {
      return
    }

    limparMensagens()

    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", cliente.id)

      if (error) {
        throw error
      }

      setSucesso(
        "Cliente excluído com sucesso."
      )

      await carregarClientes()
    } catch (error) {
      console.error(
        "Erro ao excluir cliente:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível excluir o cliente."
      )
    }
  }

  function formatarTelefone(valor) {
    if (!valor) return "-"
    return valor
  }

  function formatarCpf(valor) {
    if (!valor) return "-"
    return valor
  }

  function fecharMensagemSucesso() {
    setSucesso("")
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
            ImobGest - Clientes
          </h2>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            className="btn btn-outline-primary"
            onClick={carregarClientes}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>
        </div>

      </div>

      {/* MENSAGEM DE ERRO */}
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

      {/* MENSAGEM DE SUCESSO */}
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
            onClick={fecharMensagemSucesso}
          ></button>
        </div>
      )}

      {/* RESUMO DOS CLIENTES */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Total de clientes
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

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Resultados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {clientesFiltrados.length}
                  </h3>
                </div>

                <div
                  className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-search text-info fs-4"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

{/* LISTA DE CLIENTES */}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                Clientes cadastrados
              </h5>

            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirNovoCliente}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Novo cliente
            </button>

          </div>

          {/* FILTRO */}
          <div className="card border-0 bg-light mb-4">
            <div className="card-body">

              <div className="row g-3 align-items-end">

                <div className="col-12 col-md-8">

                  <label
                    htmlFor="buscaCliente"
                    className="form-label fw-semibold"
                  >
                    Pesquisar cliente
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>

                    <input
                      id="buscaCliente"
                      type="text"
                      className="form-control"
                      placeholder="Nome, CPF, telefone ou e-mail"
                      value={busca}
                      onChange={(e) =>
                        setBusca(e.target.value)
                      }
                    />

                    {busca && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setBusca("")}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}

                  </div>

                </div>

                <div className="col-12 col-md-4">

                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={abrirNovoCliente}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Cadastrar cliente
                  </button>

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
                Carregando clientes...
              </p>

            </div>
          ) : clientesFiltrados.length === 0 ? (

            <div className="text-center py-5">

              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "72px",
                  height: "72px",
                }}
              >
                <i className="bi bi-people text-muted fs-2"></i>
              </div>

              <h5 className="fw-bold">
                Nenhum cliente encontrado
              </h5>

              <p className="text-muted mb-3">
                {busca
                  ? "Não encontramos clientes para a pesquisa informada."
                  : "Ainda não existem clientes cadastrados."}
              </p>

              {!busca && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={abrirNovoCliente}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Cadastrar primeiro cliente
                </button>
              )}

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      Cliente
                    </th>

                    <th>
                      CPF
                    </th>

                    <th>
                      Telefone
                    </th>

                    <th>
                      E-mail
                    </th>

                    <th className="text-end">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {clientesFiltrados.map((cliente) => (

                    <tr key={cliente.id}>

                      <td>

                        <div className="d-flex align-items-center">

                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "42px",
                              height: "42px",
                              minWidth: "42px",
                            }}
                          >
                            <i className="bi bi-person text-primary"></i>
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {cliente.nome || "-"}
                            </div>

                            {cliente.rg && (
                              <small className="text-muted">
                                RG: {cliente.rg}
                              </small>
                            )}
                          </div>

                        </div>

                      </td>

                      <td>
                        {formatarCpf(cliente.cpf)}
                      </td>

                      <td>
                        {formatarTelefone(
                          cliente.telefone
                        )}
                      </td>

                      <td>
                        {cliente.email || "-"}
                      </td>

                      <td>

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Editar cliente"
                            onClick={() =>
                              abrirEditarCliente(cliente)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Excluir cliente"
                            onClick={() =>
                              excluirCliente(cliente)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          Excluir
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

{/* MODAL - NOVO / EDITAR CLIENTE */}
      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
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
                      ? "Editar cliente"
                      : "Novo cliente"}
                  </h5>

                  <p className="text-muted mb-0 small">
                    {editando
                      ? "Atualize os dados do cliente."
                      : "Preencha os dados para cadastrar um novo cliente."}
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

              {/* FORMULÁRIO */}
              <form onSubmit={salvarCliente}>

                <div className="modal-body">

                  <div className="row g-3">

                    {/* NOME */}
                    <div className="col-12">

                      <label
                        htmlFor="nome"
                        className="form-label fw-semibold"
                      >
                        Nome completo
                      </label>

                      <input
                        id="nome"
                        type="text"
                        className="form-control"
                        value={form.nome}
                        onChange={(e) =>
                          alterarCampo(
                            "nome",
                            e.target.value
                          )
                        }
                        placeholder="Digite o nome completo"
                        required
                      />

                    </div>

                    {/* CPF */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="cpf"
                        className="form-label fw-semibold"
                      >
                        CPF
                      </label>

                      <input
                        id="cpf"
                        type="text"
                        className="form-control"
                        value={form.cpf}
                        onChange={(e) =>
                          alterarCampo(
                            "cpf",
                            e.target.value
                          )
                        }
                        placeholder="Digite o CPF"
                      />

                    </div>

                    {/* RG */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="rg"
                        className="form-label fw-semibold"
                      >
                        RG
                      </label>

                      <input
                        id="rg"
                        type="text"
                        className="form-control"
                        value={form.rg}
                        onChange={(e) =>
                          alterarCampo(
                            "rg",
                            e.target.value
                          )
                        }
                        placeholder="Digite o RG"
                      />

                    </div>

                    {/* TELEFONE */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="telefone"
                        className="form-label fw-semibold"
                      >
                        Telefone
                      </label>

                      <input
                        id="telefone"
                        type="text"
                        className="form-control"
                        value={form.telefone}
                        onChange={(e) =>
                          alterarCampo(
                            "telefone",
                            e.target.value
                          )
                        }
                        placeholder="Digite o telefone"
                      />

                    </div>

                    {/* E-MAIL */}
                    <div className="col-12 col-md-6">

                      <label
                        htmlFor="email"
                        className="form-label fw-semibold"
                      >
                        E-mail
                      </label>

                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) =>
                          alterarCampo(
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="Digite o e-mail"
                      />

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
                    type="submit"
                    className="btn btn-primary"
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
                        <i className="bi bi-check-lg me-2"></i>

                        {editando
                          ? "Salvar alterações"
                          : "Cadastrar cliente"}
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
      <div className="text-center text-muted py-3">

        <small>
          ImobGest
        </small>

        <br />

        <small>
          Dashboard atualizado em{" "}
          {hoje.toLocaleDateString("pt-BR")}
        </small>

      </div>

    </div>
  )
}

