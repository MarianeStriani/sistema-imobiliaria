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

  // ========================================
  // CARREGAR IMÓVEIS
  // ========================================

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
      console.error("Erro ao carregar imóveis:", error)

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

  // ========================================
  // LIMPAR MENSAGENS
  // ========================================

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  // ========================================
  // ABRIR NOVO IMÓVEL
  // ========================================

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

  // ========================================
  // ABRIR EDIÇÃO
  // ========================================

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

  // ========================================
  // FECHAR MODAL
  // ========================================

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }

  // ========================================
  // ALTERAR CAMPO
  // ========================================

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }
  // ========================================
  // SALVAR IMÓVEL
  // ========================================

  async function salvarImovel(e) {
    e.preventDefault()

    try {
      setSalvando(true)
      limparMensagens()

      const dados = {
        codigo: form.codigo || null,
        titulo: form.titulo,
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

      setModalAberto(false)
      setEditando(null)

      await carregarImoveis()
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error)

      setErro(
        error?.message ||
          "Não foi possível salvar o imóvel."
      )
    } finally {
      setSalvando(false)
    }
  }

  // ========================================
  // EXCLUIR IMÓVEL
  // ========================================

  async function excluirImovel(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este imóvel?"
    )

    if (!confirmar) {
      return
    }

    try {
      limparMensagens()

      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      setSucesso("Imóvel excluído com sucesso.")

      await carregarImoveis()
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error)

      setErro(
        error?.message ||
          "Não foi possível excluir o imóvel."
      )
    }
  }

  // ========================================
  // FILTROS
  // ========================================

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
        String(imovel.cidade || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.bairro || "")
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
  }, [imoveis, busca, filtroStatus])

  // ========================================
  // RESUMO
  // ========================================

  const totalImoveis = imoveis.length

  const imoveisDisponiveis = imoveis.filter(
    (imovel) => imovel.status === "disponivel"
  ).length

  const imoveisAlugados = imoveis.filter(
    (imovel) => imovel.status === "alugado"
  ).length

  const imoveisManutencao = imoveis.filter(
    (imovel) => imovel.status === "manutencao"
  ).length

  const imoveisIndisponiveis = imoveis.filter(
    (imovel) => imovel.status === "indisponivel"
  ).length

  // ========================================
  // FORMATAR VALOR
  // ========================================

  function formatarValor(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "—"
    }

    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  // ========================================
  // STATUS
  // ========================================

  function obterStatus(status) {
    const statusMap = {
      disponivel: {
        texto: "Disponível",
        classe: "bg-success-subtle text-success",
      },

      alugado: {
        texto: "Alugado",
        classe: "bg-primary-subtle text-primary",
      },

      manutencao: {
        texto: "Manutenção",
        classe: "bg-warning-subtle text-warning-emphasis",
      },

      indisponivel: {
        texto: "Indisponível",
        classe: "bg-secondary-subtle text-secondary",
      },
    }

    return (
      statusMap[status] || {
        texto: status || "—",
        classe: "bg-light text-dark",
      }
    )
  }

  // ========================================
  // INÍCIO DA PÁGINA
  // ========================================

  return (
    <div className="container-fluid py-4">
      {/* ========================================
          CABEÇALHO
      ======================================== */}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Imóveis
          </h2>

          <p className="text-muted mb-0">
            Gerencie os imóveis cadastrados na imobiliária
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={carregarImoveis}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>

                Atualizando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar
              </>
            )}
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


      {/* ========================================
          MENSAGEM DE ERRO
      ======================================== */}

      {erro && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between"
          role="alert"
        >
          <div>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {erro}
          </div>

          <button
            type="button"
            className="btn-close"
            onClick={() => setErro("")}
          ></button>
        </div>
      )}


      {/* ========================================
          MENSAGEM DE SUCESSO
      ======================================== */}

      {sucesso && (
        <div
          className="alert alert-success d-flex align-items-center justify-content-between"
          role="alert"
        >
          <div>
            <i className="bi bi-check-circle me-2"></i>
            {sucesso}
          </div>

          <button
            type="button"
            className="btn-close"
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}


      {/* ========================================
          CARDS DE RESUMO
      ======================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1 small">
                    Total de imóveis
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalImoveis}
                  </h3>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-buildings fs-5"></i>
                </div>

              </div>

            </div>
          </div>
        </div>


        {/* DISPONÍVEIS */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1 small">
                    Disponíveis
                  </p>

                  <h3 className="fw-bold mb-0">
                    {imoveisDisponiveis}
                  </h3>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-success-subtle text-success"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-check-circle fs-5"></i>
                </div>

              </div>

            </div>
          </div>
        </div>


        {/* ALUGADOS */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1 small">
                    Alugados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {imoveisAlugados}
                  </h3>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-info-subtle text-info"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-key fs-5"></i>
                </div>

              </div>

            </div>
          </div>
        </div>


        {/* MANUTENÇÃO */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1 small">
                    Em manutenção
                  </p>

                  <h3 className="fw-bold mb-0">
                    {imoveisManutencao}
                  </h3>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-warning-subtle text-warning-emphasis"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-tools fs-5"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
      {/* ========================================
          LISTA DE IMÓVEIS
      ======================================== */}

      <div className="card border-0 shadow-sm">

        {/* CABEÇALHO DA LISTA */}
        <div className="card-header bg-white border-0 pt-4 px-4">

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <p className="text-muted small mb-0">
                Consulte e gerencie os imóveis da imobiliária.
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

        </div>


        {/* FILTROS */}
        <div className="card-body px-4">

          <div className="row g-3">

            {/* BUSCA */}
            <div className="col-12 col-lg-6">

              <label className="form-label small fw-semibold">
                Pesquisar
              </label>

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Código, imóvel, bairro ou cidade..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />

              </div>

            </div>


            {/* STATUS */}
            <div className="col-12 col-md-6 col-lg-3">

              <label className="form-label small fw-semibold">
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
                  Todos os status
                </option>

                <option value="disponivel">
                  Disponíveis
                </option>

                <option value="alugado">
                  Alugados
                </option>

                <option value="manutencao">
                  Em manutenção
                </option>

                <option value="indisponivel">
                  Indisponíveis
                </option>
              </select>

            </div>


            {/* ATUALIZAR */}
            <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={carregarImoveis}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar lista
              </button>

            </div>

          </div>


          {/* INFORMAÇÕES DO FILTRO */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-4">

            <span className="text-muted small">
              Exibindo{" "}
              <strong>
                {imoveisFiltrados.length}
              </strong>{" "}
              de{" "}
              <strong>
                {imoveis.length}
              </strong>{" "}
              imóveis
            </span>

            {(busca || filtroStatus !== "todos") && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0"
                onClick={() => {
                  setBusca("")
                  setFiltroStatus("todos")
                }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Limpar filtros
              </button>
            )}

          </div>

        </div>


        {/* ========================================
            CONTEÚDO DA TABELA
        ======================================== */}

        <div className="table-responsive">

          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary mb-3"
                role="status"
              >
                <span className="visually-hidden">
                  Carregando...
                </span>
              </div>

              <p className="text-muted mb-0">
                Carregando imóveis...
              </p>

            </div>

          ) : imoveisFiltrados.length === 0 ? (

            <div className="text-center py-5 px-3">

              <div
                className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-building text-muted fs-3"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum imóvel encontrado
              </h6>

              <p className="text-muted small mb-3">
                Não existem imóveis correspondentes
                aos filtros selecionados.
              </p>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={abrirNovoImovel}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Cadastrar imóvel
              </button>

            </div>

          ) : (

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-4">
                    Código
                  </th>

                  <th>
                    Imóvel
                  </th>

                  <th>
                    Localização
                  </th>

                  <th>
                    Características
                  </th>

                  <th>
                    Valor
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="text-end px-4">
                    Ações
                  </th>

                </tr>

              </thead>


              <tbody>

                {imoveisFiltrados.map((imovel) => {

                  const statusInfo =
                    obterStatus(imovel.status)

                  return (
                    <tr key={imovel.id}>

                      {/* CÓDIGO */}
                      <td className="px-4">

                        <span className="fw-semibold">
                          {imovel.codigo || "—"}
                        </span>

                      </td>


                      {/* IMÓVEL */}
                      <td>

                        <div className="fw-semibold">
                          {imovel.titulo || "Sem título"}
                        </div>

                        <small className="text-muted">
                          {imovel.tipo || "—"}
                        </small>

                      </td>


                      {/* LOCALIZAÇÃO */}
                      <td>

                        <div>
                          {imovel.bairro ||
                            imovel.cidade ||
                            "—"}
                        </div>

                        <small className="text-muted">
                          {[
                            imovel.cidade,
                            imovel.estado,
                          ]
                            .filter(Boolean)
                            .join(" - ") || "—"}
                        </small>

                      </td>


                      {/* CARACTERÍSTICAS */}
                      <td>

                        <div className="d-flex flex-wrap gap-2">

                          {imovel.quartos !== null &&
                            imovel.quartos !== undefined && (
                              <span
                                className="text-muted small"
                                title="Quartos"
                              >
                                <i className="bi bi-door-open me-1"></i>
                                {imovel.quartos}
                              </span>
                            )}

                          {imovel.banheiros !== null &&
                            imovel.banheiros !== undefined && (
                              <span
                                className="text-muted small"
                                title="Banheiros"
                              >
                                <i className="bi bi-droplet me-1"></i>
                                {imovel.banheiros}
                              </span>
                            )}

                          {imovel.vagas !== null &&
                            imovel.vagas !== undefined && (
                              <span
                                className="text-muted small"
                                title="Vagas"
                              >
                                <i className="bi bi-car-front me-1"></i>
                                {imovel.vagas}
                              </span>
                            )}

                          {imovel.area !== null &&
                            imovel.area !== undefined && (
                              <span
                                className="text-muted small"
                                title="Área"
                              >
                                <i className="bi bi-rulers me-1"></i>
                                {imovel.area} m²
                              </span>
                            )}

                        </div>

                      </td>


                      {/* VALOR */}
                      <td>

                        <span className="fw-semibold">
                          {formatarValor(imovel.valor)}
                        </span>

                      </td>


                      {/* STATUS */}
                      <td>

                        <span
                          className={`badge rounded-pill ${statusInfo.classe}`}
                        >
                          {statusInfo.texto}
                        </span>

                      </td>


                      {/* AÇÕES */}
                      <td className="text-end px-4">

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Editar imóvel"
                            onClick={() =>
                              abrirEditarImovel(imovel)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Excluir imóvel"
                            onClick={() =>
                              excluirImovel(imovel.id)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

          )}

        </div>

      </div>
      {/* ========================================
          MODAL DE NOVO / EDITAR IMÓVEL
      ======================================== */}

      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">

              <form onSubmit={salvarImovel}>

                {/* CABEÇALHO */}
                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold mb-1">
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
                    aria-label="Fechar"
                  ></button>

                </div>


                {/* CORPO */}
                <div className="modal-body">

                  {/* ========================================
                      IDENTIFICAÇÃO
                  ======================================== */}

                  <div className="mb-4">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-building me-2"></i>
                      Identificação do imóvel
                    </h6>

                    <div className="row g-3">

                      {/* CÓDIGO */}
                      <div className="col-md-3">

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


                      {/* TÍTULO */}
                      <div className="col-md-9">

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
                          placeholder="Ex.: Casa residencial com 3 quartos"
                          required
                        />

                      </div>


                      {/* TIPO */}
                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Tipo de imóvel *
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
                          required
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


                      {/* FINALIDADE */}
                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Finalidade *
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
                          required
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


                      {/* STATUS */}
                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Status *
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
                          required
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
                  </div>


                  {/* ========================================
                      VALORES E CARACTERÍSTICAS
                  ======================================== */}

                  <div className="mb-4">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-bar-chart me-2"></i>
                      Valores e características
                    </h6>

                    <div className="row g-3">

                      {/* VALOR */}
                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Valor
                        </label>

                        <div className="input-group">

                          <span className="input-group-text">
                            R$
                          </span>

                          <input
                            type="number"
                            className="form-control"
                            value={form.valor}
                            onChange={(e) =>
                              alterarCampo(
                                "valor",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                          />

                        </div>

                      </div>


                      {/* QUARTOS */}
                      <div className="col-md-2">

                        <label className="form-label fw-semibold">
                          Quartos
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          value={form.quartos}
                          onChange={(e) =>
                            alterarCampo(
                              "quartos",
                              e.target.value
                            )
                          }
                          min="0"
                          placeholder="0"
                        />

                      </div>


                      {/* BANHEIROS */}
                      <div className="col-md-2">

                        <label className="form-label fw-semibold">
                          Banheiros
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          value={form.banheiros}
                          onChange={(e) =>
                            alterarCampo(
                              "banheiros",
                              e.target.value
                            )
                          }
                          min="0"
                          placeholder="0"
                        />

                      </div>


                      {/* VAGAS */}
                      <div className="col-md-2">

                        <label className="form-label fw-semibold">
                          Vagas
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          value={form.vagas}
                          onChange={(e) =>
                            alterarCampo(
                              "vagas",
                              e.target.value
                            )
                          }
                          min="0"
                          placeholder="0"
                        />

                      </div>


                      {/* ÁREA */}
                      <div className="col-md-2">

                        <label className="form-label fw-semibold">
                          Área (m²)
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          value={form.area}
                          onChange={(e) =>
                            alterarCampo(
                              "area",
                              e.target.value
                            )
                          }
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />

                      </div>

                    </div>
                  </div>


                  {/* ========================================
                      ENDEREÇO
                  ======================================== */}

                  <div className="mb-4">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-geo-alt me-2"></i>
                      Endereço
                    </h6>

                    <div className="row g-3">

                      {/* LOGRADOURO */}
                      <div className="col-md-7">

                        <label className="form-label fw-semibold">
                          Logradouro
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
                          placeholder="Rua, Avenida, Estrada..."
                        />

                      </div>


                      {/* NÚMERO */}
                      <div className="col-md-2">

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
                          placeholder="123"
                        />

                      </div>


                      {/* COMPLEMENTO */}
                      <div className="col-md-3">

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
                          placeholder="Casa, apto..."
                        />

                      </div>


                      {/* BAIRRO */}
                      <div className="col-md-4">

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


                      {/* CIDADE */}
                      <div className="col-md-4">

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


                      {/* ESTADO */}
                      <div className="col-md-2">

                        <label className="form-label fw-semibold">
                          Estado
                        </label>

                        <input
                          type="text"
                          className="form-control text-uppercase"
                          value={form.estado}
                          onChange={(e) =>
                            alterarCampo(
                              "estado",
                              e.target.value
                                .toUpperCase()
                                .slice(0, 2)
                            )
                          }
                          maxLength="2"
                          placeholder="SP"
                        />

                      </div>


                      {/* CEP */}
                      <div className="col-md-2">

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
                          maxLength="9"
                          placeholder="00000-000"
                        />

                      </div>

                    </div>
                  </div>


                  {/* ========================================
                      DESCRIÇÃO E OBSERVAÇÕES
                  ======================================== */}

                  <div className="mb-2">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-card-text me-2"></i>
                      Informações adicionais
                    </h6>

                    <div className="row g-3">

                      {/* DESCRIÇÃO */}
                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Descrição
                        </label>

                        <textarea
                          className="form-control"
                          rows="5"
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


                      {/* OBSERVAÇÕES */}
                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Observações
                        </label>

                        <textarea
                          className="form-control"
                          rows="5"
                          value={form.observacoes}
                          onChange={(e) =>
                            alterarCampo(
                              "observacoes",
                              e.target.value
                            )
                          }
                          placeholder="Informações internas ou detalhes importantes..."
                        ></textarea>

                      </div>

                    </div>

                  </div>

                </div>


                {/* ==============================
RODAPÉ DO MODAL
                ======================================== */}

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