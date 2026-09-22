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
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    observacoes: "",
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
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      observacoes: "",
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
      endereco: cliente.endereco || "",
      numero: cliente.numero || "",
      complemento: cliente.complemento || "",
      bairro: cliente.bairro || "",
      cidade: cliente.cidade || "",
      uf: cliente.uf || "",
      cep: cliente.cep || "",
      observacoes: cliente.observacoes || "",
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
async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, "")

    if (cepLimpo.length !== 8) {
      return
    }

    setConsultandoCep(true)
    setErro("")

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      )

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível consultar o CEP."
        )
      }

      const dados = await resposta.json()

      if (dados.erro) {
        setErro("CEP não encontrado.")
        return
      }

      setForm((anterior) => ({
        ...anterior,
        cep:
          dados.cep ||
          anterior.cep,
        endereco:
          dados.logradouro ||
          anterior.endereco,
        bairro:
          dados.bairro ||
          anterior.bairro,
        cidade:
          dados.localidade ||
          anterior.cidade,
        uf:
          dados.uf ||
          anterior.uf,
      }))
    } catch (error) {
      console.error(
        "Erro ao consultar CEP:",
        error
      )

      setErro(
        "Não foi possível consultar o CEP. Verifique sua conexão e tente novamente."
      )
    } finally {
      setConsultandoCep(false)
    }
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
        endereco: form.endereco.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        uf: form.uf.trim().toUpperCase(),
        cep: form.cep.trim(),
        observacoes: form.observacoes.trim(),
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
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: "",
        observacoes: "",
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
{/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Clientes
          </h2>

          <p className="text-muted mb-0">
            Gerencie os clientes da imobiliária
          </p>
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

          <button
            className="btn btn-primary"
            onClick={abrirNovoCliente}
          >
            <i className="bi bi-person-plus me-2"></i>
            Novo cliente
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

              <small className="text-muted">
                Acesse rapidamente as principais áreas
              </small>
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

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/manutencoes")}
              >
                <i className="bi bi-tools d-block fs-5 mb-1"></i>
                Manutenções
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/visitas")}
              >
                <i className="bi bi-calendar-check d-block fs-5 mb-1"></i>
                Visitas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/comunicacao")}
              >
                <i className="bi bi-whatsapp d-block fs-5 mb-1"></i>
                Comunicação
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/relatorios")}
              >
                <i className="bi bi-file-earmark-bar-graph d-block fs-5 mb-1"></i>
                Relatórios
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/configuracoes")}
              >
                <i className="bi bi-gear d-block fs-5 mb-1"></i>
                Configurações
              </button>
            </div>

          </div>
        </div>
      </div>
{/* RESUMO DOS CLIENTES */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
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

              <small className="text-muted d-block mt-3">
                Clientes cadastrados no sistema
              </small>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
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

              <small className="text-muted d-block mt-3">
                Clientes encontrados na busca
              </small>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">
                    Cadastro
                  </p>

                  <h3 className="fw-bold mb-0">
                    Ativo
                  </h3>
                </div>

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-person-check text-success fs-4"></i>
                </div>
              </div>

              <small className="text-muted d-block mt-3">
                Cadastro de clientes disponível
              </small>

            </div>
          </div>
        </div>

      </div>

      {/* LISTA DE CLIENTES */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                Clientes cadastrados
              </h5>

              <small className="text-muted">
                Consulte, edite ou exclua clientes
              </small>
            </div>

            <button
              className="btn btn-primary mt-3 mt-md-0"
              onClick={abrirNovoCliente}
            >
              <i className="bi bi-person-plus me-2"></i>
              Novo cliente
            </button>
          </div>

          {/* BUSCA */}
          <div className="row g-2 mb-4">

            <div className="col-12 col-md-9">
              <div className="input-group">

                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nome, CPF, telefone ou e-mail..."
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

            <div className="col-12 col-md-3">
              <button
                className="btn btn-outline-primary w-100"
                onClick={carregarClientes}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar lista
              </button>
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
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto"
                style={{
                  width: "70px",
                  height: "70px",
                }}
              >
                <i className="bi bi-people text-primary fs-2"></i>
              </div>

              <h5 className="fw-bold mt-3">
                Nenhum cliente encontrado
              </h5>

              <p className="text-muted mb-3">
                {busca
                  ? "Tente alterar os termos da busca."
                  : "Comece cadastrando o primeiro cliente."}
              </p>

              {!busca && (
                <button
                  className="btn btn-primary"
                  onClick={abrirNovoCliente}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Cadastrar cliente
                </button>
              )}

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Cidade</th>
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
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                            }}
                          >
                            <i className="bi bi-person text-primary"></i>
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {cliente.nome || "-"}
                            </div>

                            {cliente.email && (
                              <small className="text-muted">
                                {cliente.email}
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
                        {cliente.cidade
                          ? `${cliente.cidade}${
                              cliente.uf
                                ? ` - ${cliente.uf}`
                                : ""
                            }`
                          : "-"}
                      </td>

                      <td className="text-end">
                        <div className="btn-group">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Editar cliente"
                            onClick={() =>
                              abrirEditarCliente(cliente)
                            }
                          >
                            <i className="bi bi-pencil"></i>
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
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO DO MODAL */}
              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold">
                    {editando
                      ? "Editar cliente"
                      : "Novo cliente"}
                  </h5>

                  <small className="text-muted">
                    {editando
                      ? "Atualize os dados do cliente"
                      : "Cadastre um novo cliente no sistema"}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>

              </div>

              {/* FORMULÁRIO */}
              <form onSubmit={salvarCliente}>

                <div className="modal-body">

                  {/* DADOS PESSOAIS */}
                  <div className="mb-4">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-person text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Dados pessoais
                        </h6>

                        <small className="text-muted">
                          Informações básicas do cliente
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* NOME */}
                      <div className="col-12 col-md-8">
                        <label className="form-label fw-semibold">
                          Nome completo
                          <span className="text-danger ms-1">
                            *
                          </span>
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite o nome completo"
                          value={form.nome}
                          onChange={(e) =>
                            alterarCampo(
                              "nome",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      {/* CPF */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          CPF
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="000.000.000-00"
                          value={form.cpf}
                          onChange={(e) =>
                            alterarCampo(
                              "cpf",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* RG */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          RG
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite o RG"
                          value={form.rg}
                          onChange={(e) =>
                            alterarCampo(
                              "rg",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* TELEFONE */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          Telefone
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="(00) 00000-0000"
                          value={form.telefone}
                          onChange={(e) =>
                            alterarCampo(
                              "telefone",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* E-MAIL */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          E-mail
                        </label>

                        <input
                          type="email"
                          className="form-control"
                          placeholder="cliente@email.com"
                          value={form.email}
                          onChange={(e) =>
                            alterarCampo(
                              "email",
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* ENDEREÇO */}
                  <div className="mb-4">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-geo-alt text-success"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Endereço
                        </h6>

                        <small className="text-muted">
                          Endereço residencial ou comercial
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* CEP */}
                      <div className="col-12 col-md-3">
                        <label className="form-label fw-semibold">
                          CEP
                        </label>

                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="00000-000"
                            maxLength="9"
                            value={form.cep}
                            onChange={(e) => {
                              const valor =
                                e.target.value

                              const cepFormatado =
                                valor
                                  .replace(
                                    /\D/g,
                                    ""
                                  )
                                  .replace(
                                    /^(\d{5})(\d)/,
                                    "$1-$2"
                                  )
                                  .slice(0, 9)

                              alterarCampo(
                                "cep",
                                cepFormatado
                              )
                            }}
                            onBlur={(e) =>
                              buscarCep(
                                e.target.value
                              )
                            }
                          />

                          {consultandoCep && (
                            <span className="input-group-text">
                              <span
                                className="spinner-border spinner-border-sm text-primary"
                                role="status"
                              ></span>
                            </span>
                          )}
                        </div>

                        <small className="text-muted">
                          Digite o CEP para preencher o endereço.
                        </small>
                      </div>

                      {/* ENDEREÇO */}
                      <div className="col-12 col-md-7">
                        <label className="form-label fw-semibold">
                          Logradouro
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rua, Avenida, Estrada..."
                          value={form.endereco}
                          onChange={(e) =>
                            alterarCampo(
                              "endereco",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* NÚMERO */}
                      <div className="col-12 col-md-2">
                        <label className="form-label fw-semibold">
                          Número
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nº"
                          value={form.numero}
                          onChange={(e) =>
                            alterarCampo(
                              "numero",
                              e.target.value
                            )
                          }
                        />
                      </div>
{/* COMPLEMENTO */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          Complemento
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Apartamento, bloco..."
                          value={form.complemento}
                          onChange={(e) =>
                            alterarCampo(
                              "complemento",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* BAIRRO */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          Bairro
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite o bairro"
                          value={form.bairro}
                          onChange={(e) =>
                            alterarCampo(
                              "bairro",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* CIDADE */}
                      <div className="col-12 col-md-3">
                        <label className="form-label fw-semibold">
                          Cidade
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite a cidade"
                          value={form.cidade}
                          onChange={(e) =>
                            alterarCampo(
                              "cidade",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* UF */}
                      <div className="col-12 col-md-1">
                        <label className="form-label fw-semibold">
                          UF
                        </label>

                        <input
                          type="text"
                          className="form-control text-uppercase"
                          maxLength="2"
                          placeholder="SP"
                          value={form.uf}
                          onChange={(e) =>
                            alterarCampo(
                              "uf",
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                      </div>

                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* OBSERVAÇÕES */}
                  <div>

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-chat-left-text text-warning"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Observações
                        </h6>

                        <small className="text-muted">
                          Informações adicionais sobre o cliente
                        </small>
                      </div>

                    </div>

                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Digite observações, informações adicionais ou anotações..."
                      value={form.observacoes}
                      onChange={(e) =>
                        alterarCampo(
                          "observacoes",
                          e.target.value
                        )
                      }
                    ></textarea>

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

      {/* RODAPÉ DA PÁGINA */}
      <div className="text-center text-muted py-3">

        <small>
          Sistema de Gestão Imobiliária
        </small>

        <div className="mt-1">
          <small>
            Gestão de clientes e informações cadastrais
          </small>
        </div>

      </div>

    </div>
  )
}
