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

  useEffect(() => {
    carregarImoveis()
  }, [])

  async function carregarImoveis() {
    try {
      setLoading(true)
      setErro("")

      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .order("id", { ascending: false })

      if (error) {
        throw error
      }

      setImoveis(data || [])
    } catch (error) {
      console.error(error)
      setErro(
        error?.message ||
          "Não foi possível carregar os imóveis."
      )
    } finally {
      setLoading(false)
    }
  }

  function abrirNovoImovel() {
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

    setErro("")
    setSucesso("")
    setModalAberto(true)
  }

  function abrirEditarImovel(imovel) {
    setEditando(imovel)

    setForm({
       async function salvarImovel(e) {
    e.preventDefault()

    try {
      setSalvando(true)
      setErro("")
      setSucesso("")

      if (!form.titulo.trim()) {
        setErro("Informe o título do imóvel.")
        return
      }

      const dados = {
        codigo: form.codigo || null,
        titulo: form.titulo,
        tipo: form.tipo,
        finalidade: form.finalidade,
        status: form.status,
        valor: form.valor === "" ? null : Number(form.valor),
        quartos: form.quartos === "" ? null : Number(form.quartos),
        banheiros:
          form.banheiros === "" ? null : Number(form.banheiros),
        vagas: form.vagas === "" ? null : Number(form.vagas),
        area: form.area === "" ? null : Number(form.area),
        endereco: form.endereco || null,
        numero: form.numero || null,
        complemento: form.complemento || null,
        bairro: form.bairro || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        cep: form.cep || null,
        descricao: form.descricao || null,
        observacoes: form.observacoes || null,
      }

      if (editando) {
        const { error } = await supabase
          .from("imoveis")
          .update(dados)
          .eq("id", editando.id)

        if (error) {
          throw error
        }

        setSucesso("Imóvel atualizado com sucesso.")
      } else {
        const { error } = await supabase
          .from("imoveis")
          .insert([dados])

        if (error) {
          throw error
        }

        setSucesso("Imóvel cadastrado com sucesso.")
      }

      await carregarImoveis()

      setModalAberto(false)
      setEditando(null)
    } catch (error) {
      console.error(error)
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
      `Deseja realmente excluir o imóvel "${imovel.titulo || imovel.codigo || "sem título"}"?`
    )

    if (!confirmar) return

    try {
      setErro("")
      setSucesso("")

      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", imovel.id)

      if (error) {
        throw error
      }

      setSucesso("Imóvel excluído com sucesso.")

      await carregarImoveis()
    } catch (error) {
      console.error(error)
      setErro(
        error?.message ||
          "Não foi possível excluir o imóvel."
      )
    }
  }

  const imoveisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

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

      return correspondeBusca && correspondeStatus
    })
  }, [imoveis, busca, filtroStatus])

  const resumo = useMemo(() => {
    return {
      total: imoveis.length,

      disponiveis: imoveis.filter(
        (item) => item.status === "disponivel"
      ).length,

      alugados: imoveis.filter(
        (item) => item.status === "alugado"
      ).length,

      manutencao: imoveis.filter(
        (item) => item.status === "manutencao"
      ).length,
    }
  }, [imoveis])

  function formatarMoeda(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—"
    }

    const numero = Number(valor)

    if (Number.isNaN(numero)) {
      return "—"
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarNumero(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—"
    }

    return Number(valor).toLocaleString("pt-BR")
  }

  function textoStatus(status) {
    const statusMap = {
      disponivel: "Disponível",
      alugado: "Alugado",
      manutencao: "Manutenção",
      indisponivel: "Indisponível",
    }

    return statusMap[status] || status || "—"
  }

  function classeStatus(status) {
    const classes = {
      disponivel: "bg-success-subtle text-success",
      alugado: "bg-primary-subtle text-primary",
      manutencao: "bg-warning-subtle text-warning-emphasis",
      indisponivel: "bg-secondary-subtle text-secondary",
    }

    return classes[status] || "bg-light text-dark"
  }
  return (
    <div className="container-fluid py-4">

      {/* CABEÇALHO */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Imóveis</h2>
          <p className="text-muted mb-0">
            Gerencie os imóveis cadastrados na imobiliária.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirNovoImovel}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Novo imóvel
        </button>
      </div>

      {/* ALERTA DE ERRO */}
      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
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
          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}

      {/* ACESSO RÁPIDO */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Acesso Rápido</h6>

          <div className="d-flex flex-wrap gap-2">

            <a
              href="/"
              className="btn btn-outline-primary btn-sm"
            >
              Dashboard
            </a>

            <a
              href="/clientes"
              className="btn btn-outline-primary btn-sm"
            >
              Clientes
            </a>

            <a
              href="/imoveis"
              className="btn btn-primary btn-sm"
            >
              Imóveis
            </a>

            <a
              href="/contratos"
              className="btn btn-outline-primary btn-sm"
            >
              Contratos
            </a>

            <a
              href="/recebimentos"
              className="btn btn-outline-primary btn-sm"
            >
              Recebimentos
            </a>

            <a
              href="/despesas"
              className="btn btn-outline-primary btn-sm"
            >
              Despesas
            </a>

            <a
              href="/financeiro"
              className="btn btn-outline-primary btn-sm"
            >
              Financeiro
            </a>

            <a
              href="/manutencoes"
              className="btn btn-outline-primary btn-sm"
            >
              Manutenções
            </a>

            <a
              href="/visitas"
              className="btn btn-outline-primary btn-sm"
            >
              Visitas
            </a>

            <a
              href="/comunicacao"
              className="btn btn-outline-primary btn-sm"
            >
              Comunicação
            </a>

            <a
              href="/relatorios"
              className="btn btn-outline-primary btn-sm"
            >
              Relatórios
            </a>

            <a
              href="/configuracoes"
              className="btn btn-outline-primary btn-sm"
            >
              Configurações
            </a>

          </div>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Total de imóveis
                  </small>

                  <h3 className="fw-bold mb-0 mt-1">
                    {resumo.total}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-buildings"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Disponíveis
                  </small>

                  <h3 className="fw-bold mb-0 mt-1">
                    {resumo.disponiveis}
                  </h3>
                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-house-check"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Alugados
                  </small>

                  <h3 className="fw-bold mb-0 mt-1">
                    {resumo.alugados}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-house-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Em manutenção
                  </small>

                  <h3 className="fw-bold mb-0 mt-1">
                    {resumo.manutencao}
                  </h3>
                </div>

                <div className="fs-2 text-warning">
                  <i className="bi bi-tools"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* LISTAGEM */}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <p className="text-muted mb-0">
                Consulte, pesquise e gerencie os imóveis.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={carregarImoveis}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Atualizar
            </button>

          </div>

          {/* BUSCA E FILTRO */}
          <div className="row g-3 mb-3">

            <div className="col-12 col-lg-8">
              <label className="form-label fw-semibold">
                Pesquisar
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Pesquisar por código, título, tipo, bairro ou cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
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
                <option value="todos">Todos</option>
                <option value="disponivel">Disponíveis</option>
                <option value="alugado">Alugados</option>
                <option value="manutencao">Manutenção</option>
                <option value="indisponivel">
                  Indisponíveis
                </option>
              </select>
            </div>

          </div>

          <div className="text-muted small mb-3">
            Exibindo {imoveisFiltrados.length} de {imoveis.length} imóveis
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-3 mb-0">
                Carregando imóveis...
              </p>
            </div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 text-muted mb-3">
                <i className="bi bi-buildings"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum imóvel encontrado
              </h6>

              <p className="text-muted mb-3">
                Cadastre um novo imóvel ou altere os filtros.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={abrirNovoImovel}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Novo imóvel
              </button>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th>Imóvel</th>
                    <th>Tipo</th>
                    <th>Localização</th>
                    <th>Valor</th>
                    <th>Características</th>
                    <th>Status</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {imoveisFiltrados.map((imovel) => (
                    <tr key={imovel.id}>

                      <td>
                        <div className="fw-semibold">
                          {imovel.titulo || "Sem título"}
                        </div>

                        {imovel.codigo && (
                          <small className="text-muted">
                            Código: {imovel.codigo}
                          </small>
                        )}
                      </td>

                      <td>
                        {imovel.tipo || "—"}
                      </td>

                      <td>
                        <div>
                          {imovel.bairro || "—"}
                        </div>

                        <small className="text-muted">
                          {imovel.cidade || ""}
                          {imovel.estado
                            ? ` - ${imovel.estado}`
                            : ""}
                        </small>
                      </td>

                      <td>
                        <span className="fw-semibold">
                          {formatarMoeda(imovel.valor)}
                        </span>
                      </td>

                      <td>
                        <div className="small">
                          {imovel.quartos !== null &&
                          imovel.quartos !== undefined &&
                          imovel.quartos !== "" ? (
                            <span className="me-2">
                              <i className="bi bi-door-open me-1"></i>
                              {formatarNumero(imovel.quartos)}
                            </span>
                          ) : null}

                          {imovel.banheiros !== null &&
                          imovel.banheiros !== undefined &&
                          imovel.banheiros !== "" ? (
                            <span className="me-2">
                              <i className="bi bi-droplet me-1"></i>
                              {formatarNumero(imovel.banheiros)}
                            </span>
                          ) : null}

                          {imovel.vagas !== null &&
                          imovel.vagas !== undefined &&
                          imovel.vagas !== "" ? (
                            <span className="me-2">
                              <i className="bi bi-car-front me-1"></i>
                              {formatarNumero(imovel.vagas)}
                            </span>
                          ) : null}
                        </div>

                        {imovel.area !== null &&
                        imovel.area !== undefined &&
                        imovel.area !== "" ? (
                          <small className="text-muted">
                            {formatarNumero(imovel.area)} m²
                          </small>
                        ) : null}
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill ${classeStatus(
                            imovel.status
                          )}`}
                        >
                          {textoStatus(imovel.status)}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              abrirEditarImovel(imovel)
                            }
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              excluirImovel(imovel)
                            }
                            title="Excluir"
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

      {/* MODAL */}
      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">

              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    {editando
                      ? "Editar imóvel"
                      : "Novo imóvel"}
                  </h5>

                  <small className="text-muted">
                    Preencha os dados do imóvel.
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>
              </div>

              <form onSubmit={salvarImovel}>

                <div className="modal-body">

                  {/* DADOS DO IMÓVEL */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Dados do imóvel
                      </h6>

                      <div className="row g-3">

                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            Código
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.codigo}
                            onChange={(e) =>
                              alterarCampo(
                                "codigo",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: IM001"
                          />
                        </div>

                        <div className="col-12 col-md-9">
                          <label className="form-label fw-semibold">
                            Título do imóvel *
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.titulo}
                            onChange={(e) =>
                              alterarCampo(
                                "titulo",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: Casa residencial no centro"
                            required
                          />
                        </div>

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
                            <option value="Casa">Casa</option>
                            <option value="Apartamento">
                              Apartamento
                            </option>
                            <option value="Comercial">
                              Comercial
                            </option>
                            <option value="Terreno">
                              Terreno
                            </option>
                            <option value="Sala Comercial">
                              Sala Comercial
                            </option>
                            <option value="Galpão">
                              Galpão
                            </option>
                            <option value="Chácara">
                              Chácara
                            </option>
                            <option value="Sítio">
                              Sítio
                            </option>
                            <option value="Outro">
                              Outro
                            </option>
                          </select>
                        </div>

                        <div className="col-12 col-md-4">
                          <label className="form-label fw-semibold">
                            Finalidade
                          </label>

                          <select
                            className="form-select"
                            value={form.finalidade}
                            onChange={(e) =>
                              alterarCampo(
                                "finalidade",
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
                            <option value="Aluguel e Venda">
                              Aluguel e Venda
                            </option>
                          </select>
                        </div>

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

                        <div className="col-12 col-md-4">
                          <label className="form-label fw-semibold">
                            Valor
                          </label>

                          <div className="input-group">
                            <span className="input-group-text">
                              R$
                            </span>

                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-control"
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
                  </div>

                  {/* CARACTERÍSTICAS */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Características
                      </h6>

                      <div className="row g-3">

                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            Quartos
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={form.quartos}
                            onChange={(e) =>
                              alterarCampo(
                                "quartos",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            Banheiros
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={form.banheiros}
                            onChange={(e) =>
                              alterarCampo(
                                "banheiros",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            Vagas
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={form.vagas}
                            onChange={(e) =>
                              alterarCampo(
                                "vagas",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            Área (m²)
                          </label>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={form.area}
                            onChange={(e) =>
                              alterarCampo(
                                "area",
                                e.target.value
                              )
                            }
                          />
                        </div>

                      </div>

                    </div>
                  </div>
                  {/* ENDEREÇO */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Endereço
                      </h6>

                      <div className="row g-3">

                        <div className="col-12 col-md-8">
                          <label className="form-label fw-semibold">
                            Endereço
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.endereco}
                            onChange={(e) =>
                              alterarCampo(
                                "endereco",
                                e.target.value
                              )
                            }
                            placeholder="Rua, avenida..."
                          />
                        </div>

                        <div className="col-12 col-md-4">
                          <label className="form-label fw-semibold">
                            Número
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
                          />
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            Complemento
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.complemento}
                            onChange={(e) =>
                              alterarCampo(
                                "complemento",
                                e.target.value
                              )
                            }
                            placeholder="Apartamento, bloco..."
                          />
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            Bairro
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.bairro}
                            onChange={(e) =>
                              alterarCampo(
                                "bairro",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            Cidade
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.cidade}
                            onChange={(e) =>
                              alterarCampo(
                                "cidade",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            Estado
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            maxLength="2"
                            value={form.estado}
                            onChange={(e) =>
                              alterarCampo(
                                "estado",
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="SP"
                          />
                        </div>

                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            CEP
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.cep}
                            onChange={(e) =>
                              alterarCampo(
                                "cep",
                                e.target.value
                              )
                            }
                            placeholder="00000-000"
                          />
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* DESCRIÇÃO E OBSERVAÇÕES */}
                  <div className="card shadow-sm border-0">
                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Descrição e observações
                      </h6>

                      <div className="row g-3">

                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            Descrição
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            value={form.descricao}
                            onChange={(e) =>
                              alterarCampo(
                                "descricao",
                                e.target.value
                              )
                            }
                            placeholder="Descreva o imóvel..."
                          ></textarea>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            Observações
                          </label>

                          <textarea
                            className="form-control"
                            rows="3"
                            value={form.observacoes}
                            onChange={(e) =>
                              alterarCampo(
                                "observacoes",
                                e.target.value
                              )
                            }
                            placeholder="Observações internas..."
                          ></textarea>
                        </div>

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
                          : "Cadastrar imóvel"}
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
        <small>Sistema de Gestão Imobiliária</small>

        <div className="mt-1">
          <small>Gestão de imóveis</small>
        </div>
      </div>

    </div>
  )
}