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

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }
  async function salvarImovel(e) {
    e.preventDefault()

    setSalvando(true)
    limparMensagens()

    try {
      const dados = {
        codigo: form.codigo || null,
        titulo: form.titulo || null,
        tipo: form.tipo || null,
        finalidade: form.finalidade || null,
        status: form.status || null,

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

      let error

      if (editando) {
        const resultado = await supabase
          .from("imoveis")
          .update(dados)
          .eq("id", editando.id)

        error = resultado.error
      } else {
        const resultado = await supabase
          .from("imoveis")
          .insert([dados])

        error = resultado.error
      }

      if (error) {
        throw error
      }

      setSucesso(
        editando
          ? "Imóvel atualizado com sucesso!"
          : "Imóvel cadastrado com sucesso!"
      )

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

  async function excluirImovel(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este imóvel?"
    )

    if (!confirmar) return

    limparMensagens()

    try {
      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      setSucesso(
        "Imóvel excluído com sucesso!"
      )

      await carregarImoveis()
    } catch (error) {
      console.error(
        "Erro ao excluir imóvel:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível excluir o imóvel."
      )
    }
  }

  const imoveisFiltrados = useMemo(() => {
    const texto = busca
      .toLowerCase()
      .trim()

    return imoveis.filter((imovel) => {
      const correspondeBusca =
        !texto ||
        String(imovel.codigo || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.titulo || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.tipo || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.finalidade || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.bairro || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.cidade || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.status || "")
          .toLowerCase()
          .includes(texto)

      const correspondeStatus =
        filtroStatus === "todos" ||
        imovel.status === filtroStatus

      return (
        correspondeBusca &&
        correspondeStatus
      )
    })
  }, [imoveis, busca, filtroStatus])

  const totalImoveis = imoveis.length

  const imoveisDisponiveis =
    imoveis.filter(
      (imovel) =>
        imovel.status === "disponivel"
    ).length

  const imoveisAlugados =
    imoveis.filter(
      (imovel) =>
        imovel.status === "alugado"
    ).length

  const imoveisManutencao =
    imoveis.filter(
      (imovel) =>
        imovel.status === "manutencao"
    ).length

  return (
    <div className="container-fluid py-4">
      {/* CABEÇALHO */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

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
            type="button"
            className="btn btn-outline-primary"
            onClick={carregarImoveis}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirNovoImovel}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Novo imóvel
          </button>

        </div>
      </div>

      {/* MENSAGEM DE ERRO */}

      {erro && (
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>

          <div>{erro}</div>

          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setErro("")}
          ></button>
        </div>
      )}

      {/* MENSAGEM DE SUCESSO */}

      {sucesso && (
        <div
          className="alert alert-success d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>

          <div>{sucesso}</div>

          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}

      {/* ACESSO RÁPIDO */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-1">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{
                width: "38px",
                height: "38px",
              }}
            >
              <i className="bi bi-lightning-charge-fill text-primary"></i>
            </div>

            <h5 className="fw-bold mb-0">
              Acesso rápido
            </h5>

          </div>

          <p className="text-muted small mb-3">
            Acesse rapidamente as principais áreas do sistema
          </p>

          <div className="row g-2">

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/")}
              >
                <i className="bi bi-speedometer2 me-1"></i>
                Dashboard
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/clientes")}
              >
                <i className="bi bi-people me-1"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-primary w-100"
                onClick={() => acessarPagina("/imoveis")}
              >
                <i className="bi bi-house-door me-1"></i>
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/contratos")}
              >
                <i className="bi bi-file-earmark-text me-1"></i>
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/recebimentos")}
              >
                <i className="bi bi-cash-coin me-1"></i>
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/despesas")}
              >
                <i className="bi bi-wallet2 me-1"></i>
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/financeiro")}
              >
                <i className="bi bi-bar-chart-line me-1"></i>
                Financeiro
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/manutencoes")}
              >
                <i className="bi bi-tools me-1"></i>
                Manutenções
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/visitas")}
              >
                <i className="bi bi-calendar-check me-1"></i>
                Visitas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/comunicacao")}
              >
                <i className="bi bi-whatsapp me-1"></i>
                Comunicação
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/relatorios")}
              >
                <i className="bi bi-file-earmark-bar-graph me-1"></i>
                Relatórios
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/configuracoes")}
              >
                <i className="bi bi-gear me-1"></i>
                Configurações
              </button>
            </div>

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
                  <p className="text-muted small mb-1">
                    Total de imóveis
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalImoveis}
                  </h3>
                </div>

                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-house-door text-primary fs-4"></i>
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
                  <p className="text-muted small mb-1">
                    Disponíveis
                  </p>

                  <h3 className="fw-bold mb-0 text-success">
                    {imoveisDisponiveis}
                  </h3>
                </div>

                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-check-circle text-success fs-4"></i>
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
                  <p className="text-muted small mb-1">
                    Alugados
                  </p>

                  <h3 className="fw-bold mb-0 text-primary">
                    {imoveisAlugados}
                  </h3>
                </div>

                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-key-fill text-primary fs-4"></i>
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
                  <p className="text-muted small mb-1">
                    Em manutenção
                  </p>

                  <h3 className="fw-bold mb-0 text-warning">
                    {imoveisManutencao}
                  </h3>
                </div>

                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-tools text-warning fs-4"></i>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* LISTA DE IMÓVEIS */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                Lista de imóveis
              </h5>

              <p className="text-muted small mb-0">
                Consulte, pesquise e gerencie os imóveis cadastrados.
              </p>
            </div>

            <span className="badge bg-light text-dark border">
              {imoveisFiltrados.length} imóvel(is)
            </span>

          </div>

          {/* FILTROS */}

          <div className="row g-2 mb-4">

            <div className="col-12 col-md-6">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código, título, bairro, cidade..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />

              </div>

            </div>

            <div className="col-12 col-md-4">

              <select
                className="form-select"
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value)
                }
              >
                <option value="todos">
                  Todos os status
                </option>

                <option value="disponivel">
                  Disponível
                </option>

                <option value="alugado">
                  Alugado
                </option>

                <option value="manutencao">
                  Em manutenção
                </option>

                <option value="indisponivel">
                  Indisponível
                </option>

              </select>

            </div>

            <div className="col-12 col-md-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={carregarImoveis}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Atualizar
              </button>

            </div>

          </div>
          {/* RESULTADOS */}

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
                Carregando imóveis...
              </p>

            </div>

          ) : imoveisFiltrados.length === 0 ? (

            <div className="text-center py-5">

              <i className="bi bi-house-x display-4 text-muted"></i>

              <h5 className="fw-bold mt-3">
                Nenhum imóvel encontrado
              </h5>

              <p className="text-muted mb-3">
                Não encontramos imóveis com os filtros informados.
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

              <table className="table table-hover align-middle">

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

                  {imoveisFiltrados.map((imovel) => (

                    <tr key={imovel.id}>

                      <td>
                        <span className="fw-semibold">
                          {imovel.codigo ||
                            `#${imovel.id}`}
                        </span>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {imovel.titulo ||
                            "Sem título"}
                        </div>

                        <small className="text-muted">
                          {imovel.tipo ||
                            "Não informado"}
                        </small>
                      </td>

                      <td>
                        <div>
                          {imovel.bairro ||
                            "Bairro não informado"}
                        </div>

                        <small className="text-muted">
                          {imovel.cidade || ""}

                          {imovel.estado
                            ? ` - ${imovel.estado}`
                            : ""}
                        </small>
                      </td>

                      <td>

                        <div className="small">
                          <i className="bi bi-door-open me-1"></i>
                          {imovel.quartos || 0}
                          {" "}quartos
                        </div>

                        <div className="small">
                          <i className="bi bi-droplet me-1"></i>
                          {imovel.banheiros || 0}
                          {" "}banheiros
                        </div>

                        <div className="small">
                          <i className="bi bi-car-front me-1"></i>
                          {imovel.vagas || 0}
                          {" "}vagas
                        </div>

                      </td>

                      <td>

                        <span className="fw-semibold">

                          {imovel.valor
                            ? Number(
                                imovel.valor
                              ).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              )
                            : "Não informado"}

                        </span>

                      </td>

                      <td>

                        <span
                          className={
                            imovel.status ===
                            "disponivel"
                              ? "badge bg-success"
                              : imovel.status ===
                                "alugado"
                              ? "badge bg-primary"
                              : imovel.status ===
                                "manutencao"
                              ? "badge bg-warning text-dark"
                              : "badge bg-secondary"
                          }
                        >

                          {imovel.status ===
                          "disponivel"
                            ? "Disponível"
                            : imovel.status ===
                              "alugado"
                            ? "Alugado"
                            : imovel.status ===
                              "manutencao"
                            ? "Manutenção"
                            : "Indisponível"}

                        </span>

                      </td>

                      <td>

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Editar"
                            onClick={() =>
                              abrirEditarImovel(
                                imovel
                              )
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Excluir"
                            onClick={() =>
                              excluirImovel(
                                imovel.id
                              )
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

      {/* MODAL DE CADASTRO / EDIÇÃO */}

      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-xl modal-dialog-scrollable">

            <div className="modal-content">

              <form onSubmit={salvarImovel}>

                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold">
                      {editando
                        ? "Editar imóvel"
                        : "Novo imóvel"}
                    </h5>

                    <small className="text-muted">
                      {editando
                        ? "Atualize os dados do imóvel."
                        : "Cadastre um novo imóvel no sistema."}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={fecharModal}
                    disabled={salvando}
                  ></button>

                </div>

                <div className="modal-body">

                  {/* IDENTIFICAÇÃO */}

                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-house-door me-2 text-primary"></i>
                    Identificação
                  </h6>

                  <div className="row g-3 mb-4">

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
                        placeholder="Ex.: IMV001"
                      />
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label fw-semibold">
                        Título
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
                        placeholder="Ex.: Casa ampla no centro"
                      />
                    </div>

                    <div className="col-12 col-md-2">
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
                        <option value="Casa">
                          Casa
                        </option>

                        <option value="Apartamento">
                          Apartamento
                        </option>

                        <option value="Terreno">
                          Terreno
                        </option>

                        <option value="Sala Comercial">
                          Sala Comercial
                        </option>

                        <option value="Comercial">
                          Comercial
                        </option>

                        <option value="Chácara">
                          Chácara
                        </option>

                        <option value="Sítio">
                          Sítio
                        </option>

                        <option value="Galpão">
                          Galpão
                        </option>

                        <option value="Outro">
                          Outro
                        </option>

                      </select>
                    </div>

                    <div className="col-12 col-md-2">
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

                    <div className="col-12 col-md-3">
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
                          Em manutenção
                        </option>

                        <option value="indisponivel">
                          Indisponível
                        </option>

                      </select>
                    </div>

                  </div>

                  {/* CARACTERÍSTICAS */}

                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-list-check me-2 text-primary"></i>
                    Características
                  </h6>

                  <div className="row g-3 mb-4">

                    <div className="col-12 col-md-3">
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

                    <div className="col-12 col-md-2">
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

                    <div className="col-12 col-md-2">
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

                    <div className="col-12 col-md-2">
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
                        placeholder="Ex.: 120"
                      />
                    </div>

                  </div>

                  {/* ENDEREÇO */}

                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    Endereço
                  </h6>

                  <div className="row g-3 mb-4">

                    <div className="col-12 col-md-7">
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
                        placeholder="Rua, avenida, estrada..."
                      />
                    </div>

                    <div className="col-12 col-md-2">
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

                    <div className="col-12 col-md-3">
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
                        placeholder="Casa, bloco, apto..."
                      />
                    </div>

                    <div className="col-12 col-md-4">
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

                    <div className="col-12 col-md-4">
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

                    <div className="col-12 col-md-2">
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

                    <div className="col-12 col-md-2">
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

                  {/* DESCRIÇÃO */}

                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-card-text me-2 text-primary"></i>
                    Descrição
                  </h6>

                  <div className="row g-3">

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Descrição do imóvel
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
                        placeholder="Informações adicionais..."
                      ></textarea>

                    </div>

                  </div>

                </div> 
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

    </div>
  )
}