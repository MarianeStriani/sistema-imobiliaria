"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Imoveis() {
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
    codigo: "",
    titulo: "",
    tipo: "Casa",
    finalidade: "Aluguel",
    status: "disponivel",

    valor: "",
    quartos: "",
    banheiros: "",
    vagas: "",
    area: "",

    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",

    descricao: "",
    observacoes: "",
  })
  async function carregarImoveis() {
    setLoading(true)
    setErro("")

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarImoveis()
  }, [])
  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  function acessarPagina(url) {
    window.location.href = url
  }

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }
  function abrirNovoImovel() {
    limparMensagens()
    setEditando(null)

    setForm({
      codigo: "",
      titulo: "",
      tipo: "Casa",
      finalidade: "Aluguel",
      status: "disponivel",
      valor: "",
      quartos: "",
      banheiros: "",
      vagas: "",
      area: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      descricao: "",
      observacoes: "",
    })

    setModalAberto(true)
  }
  function abrirEditarImovel(imovel) {
    limparMensagens()
    setEditando(imovel)

    setForm({
      codigo: imovel.codigo || "",
      titulo: imovel.titulo || "",
      tipo: imovel.tipo || "Casa",
      finalidade: imovel.finalidade || "Aluguel",
      status: imovel.status || "disponivel",

      valor: imovel.valor ?? "",
      quartos: imovel.quartos ?? "",
      banheiros: imovel.banheiros ?? "",
      vagas: imovel.vagas ?? "",
      area: imovel.area ?? "",

      endereco: imovel.endereco || "",
      numero: imovel.numero || "",
      complemento: imovel.complemento || "",
      bairro: imovel.bairro || "",
      cidade: imovel.cidade || "",
      estado: imovel.estado || "",
      cep: imovel.cep || "",

      descricao: imovel.descricao || "",
      observacoes: imovel.observacoes || "",
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }
  async function salvarImovel(e) {
    e.preventDefault()

    limparMensagens()
    setSalvando(true)

    try {
      if (!form.titulo.trim()) {
        throw new Error(
          "Informe o título do imóvel."
        )
      }

      const dados = {
        codigo: form.codigo.trim() || null,
        titulo: form.titulo.trim(),
        tipo: form.tipo,
        finalidade: form.finalidade,
        status: form.status,

        valor:
          form.valor === ""
            ? null
            : Number(form.valor),

        quartos:
          form.quartos === ""
            ? null
            : Number(form.quartos),

        banheiros:
          form.banheiros === ""
            ? null
            : Number(form.banheiros),

        vagas:
          form.vagas === ""
            ? null
            : Number(form.vagas),

        area:
          form.area === ""
            ? null
            : Number(form.area),
        endereco:
          form.endereco.trim() || null,

        numero:
          form.numero.trim() || null,

        complemento:
          form.complemento.trim() || null,

        bairro:
          form.bairro.trim() || null,

        cidade:
          form.cidade.trim() || null,

        estado:
          form.estado.trim() || null,

        cep:
          form.cep.trim() || null,

        descricao:
          form.descricao.trim() || null,

        observacoes:
          form.observacoes.trim() || null,
      }

      if (editando) {
        const { error } = await supabase
          .from("imoveis")
          .update(dados)
          .eq("id", editando.id)

        if (error) throw error

        setSucesso(
          "Imóvel atualizado com sucesso."
        )
      } else {
        const { error } = await supabase
          .from("imoveis")
          .insert([dados])

        if (error) throw error

        setSucesso(
          "Imóvel cadastrado com sucesso."
        )
      }
      setModalAberto(false)
      setEditando(null)

      await carregarImoveis()

    } catch (error) {
      console.error(
        "Erro ao salvar imóvel:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível salvar o imóvel."
      )
    } finally {
      setSalvando(false)
    }
  }

  async function excluirImovel(imovel) {
    const confirmar = window.confirm(
      `Deseja realmente excluir "${imovel.titulo}"?`
    )

    if (!confirmar) return

    limparMensagens()

    try {
      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", imovel.id)

      if (error) throw error

      setSucesso(
        "Imóvel excluído com sucesso."
      )

      await carregarImoveis()
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível excluir o imóvel."
      )
    }
  }
  const imoveisFiltrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase()

    return imoveis.filter((imovel) => {
      const correspondeBusca =
        !termo ||
        String(imovel.codigo || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.titulo || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.tipo || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.bairro || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.cidade || "")
          .toLowerCase()
          .includes(termo)

      const correspondeStatus =
        filtroStatus === "todos" ||
        imovel.status === filtroStatus

      return (
        correspondeBusca &&
        correspondeStatus
      )
    })
  }, [
    imoveis,
    busca,
    filtroStatus,
  ])
  const totalImoveis = imoveis.length

  const totalResultados =
    imoveisFiltrados.length

  const totalDisponiveis =
    imoveis.filter(
      (imovel) =>
        imovel.status === "disponivel"
    ).length

  const totalAlugados =
    imoveis.filter(
      (imovel) =>
        imovel.status === "alugado"
    ).length

  const totalManutencao =
    imoveis.filter(
      (imovel) =>
        imovel.status === "manutencao"
    ).length

  const totalIndisponiveis =
    imoveis.filter(
      (imovel) =>
        imovel.status === "indisponivel"
    ).length
  function formatarMoeda(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "Não informado"
    }

    const numero = Number(valor)

    if (Number.isNaN(numero)) {
      return "Não informado"
    }

    return numero.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  function obterStatusTexto(status) {
    const nomes = {
      disponivel: "Disponível",
      alugado: "Alugado",
      manutencao: "Manutenção",
      indisponivel: "Indisponível",
    }

    return nomes[status] || status
  }

  function obterStatusClasse(status) {
    const classes = {
      disponivel:
        "bg-success-subtle text-success",

      alugado:
        "bg-primary-subtle text-primary",

      manutencao:
        "bg-warning-subtle text-warning-emphasis",

      indisponivel:
        "bg-secondary-subtle text-secondary",
    }

    return (
      classes[status] ||
      "bg-light text-secondary"
    )
  }
  function formatarEndereco(imovel) {
    const partes = [
      imovel.endereco,
      imovel.numero,
      imovel.bairro,
      imovel.cidade,
      imovel.estado,
    ].filter(Boolean)

    return partes.length
      ? partes.join(", ")
      : "Endereço não informado"
  }

  return (
    <div className="container-fluid py-4">

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

        <div>
          <h1 className="h3 fw-bold mb-1">
            Imóveis
          </h1>

          <p className="text-muted mb-0">
            Gerencie os imóveis da imobiliária
          </p>
        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-primary"
            onClick={carregarImoveis}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>

          <button
            className="btn btn-primary"
            onClick={abrirNovoImovel}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Novo imóvel
          </button>

        </div>

      </div>
      {erro && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="alert alert-success">
          <i className="bi bi-check-circle me-2"></i>
          {sucesso}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Acesso rápido
          </h5>

          <div className="d-flex flex-wrap gap-2">

            {[
              ["/", "speedometer2", "Dashboard"],
              ["/clientes", "people", "Clientes"],
              ["/imoveis", "house-door", "Imóveis"],
              ["/contratos", "file-earmark-text", "Contratos"],
              ["/recebimentos", "cash-coin", "Recebimentos"],
              ["/despesas", "wallet2", "Despesas"],
              ["/financeiro", "bar-chart-line", "Financeiro"],
              ["/manutencoes", "tools", "Manutenções"],
              ["/visitas", "calendar-check", "Visitas"],
              ["/comunicacao", "chat-dots", "Comunicação"],
              ["/relatorios", "file-earmark-bar-graph", "Relatórios"],
              ["/configuracoes", "gear", "Configurações"],
            ].map(([url, icon, nome]) => (
              <button
                key={url}
                className={
                  url === "/imoveis"
                    ? "btn btn-primary"
                    : "btn btn-outline-primary"
                }
                onClick={() =>
                  acessarPagina(url)
                }
              >
                <i
                  className={`bi bi-${icon} me-2`}
                ></i>
                {nome}
              </button>
            ))}

          </div>

        </div>
      </div>
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <small className="text-muted">
                Total de imóveis
              </small>

              <h3 className="fw-bold mt-2">
                {totalImoveis}
              </h3>

              <span className="text-muted">
                Cadastrados
              </span>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <small className="text-muted">
                Resultados
              </small>

              <h3 className="fw-bold mt-2">
                {totalResultados}
              </h3>

              <span className="text-muted">
                Encontrados
              </span>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <small className="text-muted">
                Disponíveis
              </small>

              <h3 className="fw-bold mt-2 text-success">
                {totalDisponiveis}
              </h3>

              <span className="text-muted">
                Para locação
              </span>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <small className="text-muted">
                Alugados
              </small>

              <h3 className="fw-bold mt-2 text-primary">
                {totalAlugados}
              </h3>

              <span className="text-muted">
                Em locação
              </span>

            </div>
          </div>
        </div>

      </div>

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <p className="text-muted mb-0">
                Consulte, edite ou exclua imóveis
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={abrirNovoImovel}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Novo imóvel
            </button>

          </div>

          <div className="row g-3 mb-4">

            <div className="col-12 col-lg-8">

              <label className="form-label fw-semibold">
                Buscar imóvel
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Buscar por código, título, bairro ou cidade..."
                value={busca}
                onChange={(e) =>
                  setBusca(e.target.value)
                }
              />

            </div>

            <div className="col-12 col-lg-4">

              <label className="form-label fw-semibold">
                Status
              </label>

              <select
                className="form-select"
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value)
                }
              >
                <option value="todos">
                  Todos
                </option>

                <option value="disponivel">
                  Disponível
                </option>

                <option value="alugado">
                  Alugado
                </option>

                <option value="manutencao">
                  Manutenção
                </option>

                <option value="indisponivel">
                  Indisponível
                </option>
              </select>

            </div>

          </div>
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-3">
                Carregando imóveis...
              </p>
            </div>

          ) : imoveisFiltrados.length === 0 ? (

            <div className="text-center py-5">

              <i className="bi bi-house-x display-4 text-muted"></i>

              <h5 className="fw-bold mt-3">
                Nenhum imóvel encontrado
              </h5>

              <p className="text-muted">
                Não existem imóveis para os filtros informados.
              </p>

              <button
                className="btn btn-primary"
                onClick={abrirNovoImovel}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Novo imóvel
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Imóvel</th>
                    <th>Localização</th>
                    <th>Características</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th className="text-end">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {imoveisFiltrados.map(
                    (imovel) => (
                      <tr key={imovel.id}>

                        <td>
                          <strong>
                            {imovel.codigo ||
                              `#${imovel.id}`}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {imovel.titulo}
                          </strong>

                          <br />

                          <small className="text-muted">
                            {imovel.tipo}
                          </small>
                        </td>

                        <td>
                          <small>
                            {formatarEndereco(
                              imovel
                            )}
                          </small>
                        </td>

                        <td>
                          {imovel.quartos || 0} quartos
                          <br />
                          {imovel.banheiros || 0} banheiros
                          <br />
                          {imovel.vagas || 0} vagas
                        </td>

                        <td>
                          <strong>
                            {formatarMoeda(
                              imovel.valor
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`badge rounded-pill ${obterStatusClasse(
                              imovel.status
                            )}`}
                          >
                            {obterStatusTexto(
                              imovel.status
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex justify-content-end gap-2">

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                abrirEditarImovel(
                                  imovel
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                excluirImovel(
                                  imovel
                                )
                              }
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

      <footer className="text-center text-muted py-4 mt-4">

        <strong>
          Sistema de Gestão Imobiliária
        </strong>

        <br />

        <small>
          Gestão de imóveis e informações cadastrais
        </small>

      </footer>