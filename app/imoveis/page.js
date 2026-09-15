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
      finalidade:
        imovel.finalidade || "Aluguel",
      status:
        imovel.status || "disponivel",
      valor: imovel.valor ?? "",
      quartos: imovel.quartos ?? "",
      banheiros: imovel.banheiros ?? "",
      vagas: imovel.vagas ?? "",
      area: imovel.area ?? "",
      endereco: imovel.endereco || "",
      numero: imovel.numero || "",
      complemento:
        imovel.complemento || "",
      bairro: imovel.bairro || "",
      cidade: imovel.cidade || "",
      estado: imovel.estado || "",
      cep: imovel.cep || "",
      descricao: imovel.descricao || "",
      observacoes:
        imovel.observacoes || "",
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
  // ================================
  // SALVAR IMÓVEL
  // ================================

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
        complemento:
          form.complemento || null,

        bairro: form.bairro || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        cep: form.cep || null,

        descricao:
          form.descricao || null,

        observacoes:
          form.observacoes || null,
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

  // ================================
  // EXCLUIR IMÓVEL
  // ================================

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

  // ================================
  // FILTROS
  // ================================

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
  }, [
    imoveis,
    busca,
    filtroStatus,
  ])

  // ================================
  // RESUMO DOS IMÓVEIS
  // ================================

  const totalImoveis =
    imoveis.length

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

  const imoveisIndisponiveis =
    imoveis.filter(
      (imovel) =>
        imovel.status === "indisponivel"
    ).length

  // ================================
  // INÍCIO DA PÁGINA
  // ================================

  return (
    <div className="container-fluid py-4">
      {/* CABEÇALHO */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Imóveis
          </h2>

          <p className="text-muted mb-0">
            Cadastre e gerencie os imóveis da imobiliária.
          </p>
        </div>

        <div className="d-flex gap-2">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() =>
              acessarPagina("/contratos")
            }
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Contratos
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
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>

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
          <i className="bi bi-check-circle-fill me-2"></i>

          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}

      {/* CARDS DE RESUMO */}
      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <small className="text-muted">
                    Total de imóveis
                  </small>

                  <h3 className="fw-bold mt-2 mb-0">
                    {totalImoveis}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-buildings"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* DISPONÍVEIS */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <small className="text-muted">
                    Disponíveis
                  </small>

                  <h3 className="fw-bold mt-2 mb-0 text-success">
                    {imoveisDisponiveis}
                  </h3>
                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-house-check"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ALUGADOS */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <small className="text-muted">
                    Alugados
                  </small>

                  <h3 className="fw-bold mt-2 mb-0 text-primary">
                    {imoveisAlugados}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-house-door"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* MANUTENÇÃO */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <small className="text-muted">
                    Em manutenção
                  </small>

                  <h3 className="fw-bold mt-2 mb-0 text-warning">
                    {imoveisManutencao}
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

      {/* FILTROS */}
      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3">

            {/* BUSCA */}
            <div className="col-12 col-md-8">

              <label className="form-label fw-semibold">
                Buscar imóvel
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código, título, tipo, bairro ou cidade..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />

                {busca && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setBusca("")
                    }
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

              </div>

            </div>

            {/* STATUS */}
            <div className="col-12 col-md-4">

              <label className="form-label fw-semibold">
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

          </div>

        </div>
      </div>
      {/* LISTA DE IMÓVEIS */}
      <div className="card border-0 shadow-sm">

        {/* CABEÇALHO DA LISTA */}
        <div className="card-header bg-white border-0 py-3">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">

            <div>
              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <small className="text-muted">
                {imoveisFiltrados.length} imóvel(is) encontrado(s)
              </small>
            </div>

            {(busca || filtroStatus !== "todos") && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setBusca("")
                  setFiltroStatus("todos")
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Limpar filtros
              </button>
            )}

          </div>

        </div>

        {/* CONTEÚDO */}
        <div className="card-body p-0">

          {/* CARREGANDO */}
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

            /* NENHUM RESULTADO */
            <div className="text-center py-5 px-3">

              <div className="display-4 text-muted mb-3">
                <i className="bi bi-house-x"></i>
              </div>

              <h5 className="fw-bold">
                Nenhum imóvel encontrado
              </h5>

              <p className="text-muted mb-4">
                {imoveis.length === 0
                  ? "Ainda não existem imóveis cadastrados."
                  : "Nenhum imóvel corresponde aos filtros informados."}
              </p>

              {imoveis.length === 0 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={abrirNovoImovel}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Cadastrar primeiro imóvel
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setBusca("")
                    setFiltroStatus("todos")
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Limpar filtros
                </button>
              )}

            </div>
          ) : (

            /* TABELA */
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-3">
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

                    <th className="text-end px-3">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {imoveisFiltrados.map((imovel) => {

                    const status = String(
                      imovel.status || ""
                    ).toLowerCase()

                    let statusClass =
                      "bg-secondary"

                    let statusTexto =
                      imovel.status || "Indefinido"

                    if (status === "disponivel") {
                      statusClass = "bg-success"
                      statusTexto = "Disponível"
                    }

                    if (status === "alugado") {
                      statusClass = "bg-primary"
                      statusTexto = "Alugado"
                    }

                    if (status === "manutencao") {
                      statusClass = "bg-warning text-dark"
                      statusTexto = "Manutenção"
                    }

                    if (status === "indisponivel") {
                      statusClass = "bg-danger"
                      statusTexto = "Indisponível"
                    }

                    return (
                      <tr key={imovel.id}>

                        {/* CÓDIGO */}
                        <td className="px-3">

                          <span className="fw-semibold">
                            {imovel.codigo || "-"}
                          </span>

                        </td>

                        {/* IMÓVEL */}
                        <td>

                          <div className="fw-semibold">
                            {imovel.titulo || "Sem título"}
                          </div>

                          <small className="text-muted">
                            {imovel.tipo || "-"}
                          </small>

                        </td>

                        {/* LOCALIZAÇÃO */}
                        <td>

                          <div>
                            {imovel.bairro || "-"}
                          </div>

                          <small className="text-muted">
                            {imovel.cidade || "-"}
                            {imovel.estado
                              ? ` - ${imovel.estado}`
                              : ""}
                          </small>

                        </td>

                        {/* CARACTERÍSTICAS */}
                        <td>

                          <div className="d-flex flex-wrap gap-2">

                            {imovel.quartos !== null &&
                              imovel.quartos !== undefined &&
                              imovel.quartos !== "" && (
                                <span
                                  className="badge text-bg-light border"
                                  title="Quartos"
                                >
                                  <i className="bi bi-door-open me-1"></i>
                                  {imovel.quartos}
                                </span>
                              )}

                            {imovel.banheiros !== null &&
                              imovel.banheiros !== undefined &&
                              imovel.banheiros !== "" && (
                                <span
                                  className="badge text-bg-light border"
                                  title="Banheiros"
                                >
                                  <i className="bi bi-droplet me-1"></i>
                                  {imovel.banheiros}
                                </span>
                              )}

                            {imovel.vagas !== null &&
                              imovel.vagas !== undefined &&
                              imovel.vagas !== "" && (
                                <span
                                  className="badge text-bg-light border"
                                  title="Vagas"
                                >
                                  <i className="bi bi-car-front me-1"></i>
                                  {imovel.vagas}
                                </span>
                              )}

                            {imovel.area !== null &&
                              imovel.area !== undefined &&
                              imovel.area !== "" && (
                                <span
                                  className="badge text-bg-light border"
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

                          {imovel.valor !== null &&
                          imovel.valor !== undefined &&
                          imovel.valor !== "" ? (
                            <span className="fw-semibold">
                              {Number(
                                imovel.valor
                              ).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              )}
                            </span>
                          ) : (
                            <span className="text-muted">
                              Não informado
                            </span>
                          )}

                        </td>

                        {/* STATUS */}
                        <td>

                          <span
                            className={`badge ${statusClass}`}
                          >
                            {statusTexto}
                          </span>

                        </td>

                        {/* AÇÕES */}
                        <td className="text-end px-3">

                          <div className="d-flex justify-content-end gap-1">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Editar imóvel"
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
                              title="Excluir imóvel"
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
                    )
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>
      {/* MODAL - NOVO / EDITAR IMÓVEL */}
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
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">

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
                      ? "Atualize as informações do imóvel."
                      : "Preencha os dados para cadastrar um novo imóvel."}
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
              <form onSubmit={salvarImovel}>

                <div className="modal-body">

                  {/* DADOS DO IMÓVEL */}
                  <div className="mb-4">

                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      <i className="bi bi-house me-2"></i>
                      Dados do imóvel
                    </h6>

                    <div className="row g-3">

                      {/* CÓDIGO */}
                      <div className="col-12 col-md-3">

                        <label className="form-label fw-semibold">
                          Código
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex.: IM001"
                          value={form.codigo}
                          onChange={(e) =>
                            alterarCampo(
                              "codigo",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* TÍTULO */}
                      <div className="col-12 col-md-9">

                        <label className="form-label fw-semibold">
                          Título do imóvel *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex.: Casa residencial no centro"
                          value={form.titulo}
                          onChange={(e) =>
                            alterarCampo(
                              "titulo",
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>

                      {/* TIPO */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Tipo *
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

                          <option value="Kitnet">
                            Kitnet
                          </option>

                          <option value="Sobrado">
                            Sobrado
                          </option>

                          <option value="Terreno">
                            Terreno
                          </option>

                          <option value="Sala Comercial">
                            Sala Comercial
                          </option>

                          <option value="Loja">
                            Loja
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

                      {/* FINALIDADE */}
                      <div className="col-12 col-md-4">

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
                      <div className="col-12 col-md-4">

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

                  {/* VALORES E CARACTERÍSTICAS */}
                  <div className="mb-4">

                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      <i className="bi bi-bar-chart me-2"></i>
                      Valores e características
                    </h6>

                    <div className="row g-3">

                      {/* VALOR */}
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
                            className="form-control"
                            placeholder="0,00"
                            min="0"
                            step="0.01"
                            value={form.valor}
                            onChange={(e) =>
                              alterarCampo(
                                "valor",
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                      {/* QUARTOS */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Quartos
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="1"
                          placeholder="Ex.: 2"
                          value={form.quartos}
                          onChange={(e) =>
                            alterarCampo(
                              "quartos",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* BANHEIROS */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Banheiros
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="1"
                          placeholder="Ex.: 2"
                          value={form.banheiros}
                          onChange={(e) =>
                            alterarCampo(
                              "banheiros",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* VAGAS */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Vagas de garagem
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="1"
                          placeholder="Ex.: 1"
                          value={form.vagas}
                          onChange={(e) =>
                            alterarCampo(
                              "vagas",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* ÁREA */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Área
                        </label>

                        <div className="input-group">

                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            step="0.01"
                            placeholder="Ex.: 80"
                            value={form.area}
                            onChange={(e) =>
                              alterarCampo(
                                "area",
                                e.target.value
                              )
                            }
                          />

                          <span className="input-group-text">
                            m²
                          </span>

                        </div>

                      </div>

                    </div>
                  </div>

                  {/* ENDEREÇO */}
                  <div className="mb-4">

                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      <i className="bi bi-geo-alt me-2"></i>
                      Endereço
                    </h6>

                    <div className="row g-3">

                      {/* ENDEREÇO */}
                      <div className="col-12 col-md-8">

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
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Número
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex.: 123"
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
                          value={form.bairro}
                          onChange={(e) =>
                            alterarCampo(
                              "bairro",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* CEP */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          CEP
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="00000-000"
                          value={form.cep}
                          onChange={(e) =>
                            alterarCampo(
                              "cep",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* CIDADE */}
                      <div className="col-12 col-md-8">

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
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Estado
                        </label>

                        <select
                          className="form-select"
                          value={form.estado}
                          onChange={(e) =>
                            alterarCampo(
                              "estado",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Selecione
                          </option>

                          <option value="AC">
                            Acre
                          </option>

                          <option value="AL">
                            Alagoas
                          </option>

                          <option value="AP">
                            Amapá
                          </option>

                          <option value="AM">
                            Amazonas
                          </option>

                          <option value="BA">
                            Bahia
                          </option>

                          <option value="CE">
                            Ceará
                          </option>

                          <option value="DF">
                            Distrito Federal
                          </option>

                          <option value="ES">
                            Espírito Santo
                          </option>

                          <option value="GO">
                            Goiás
                          </option>

                          <option value="MA">
                            Maranhão
                          </option>

                          <option value="MT">
                            Mato Grosso
                          </option>

                          <option value="MS">
                            Mato Grosso do Sul
                          </option>

                          <option value="MG">
                            Minas Gerais
                          </option>

                          <option value="PA">
                            Pará
                          </option>

                          <option value="PB">
                            Paraíba
                          </option>

                          <option value="PR">
                            Paraná
                          </option>

                          <option value="PE">
                            Pernambuco
                          </option>

                          <option value="PI">
                                 Piauí
                          </option>

                          <option value="RJ">
                            Rio de Janeiro
                          </option>

                          <option value="RN">
                            Rio Grande do Norte
                          </option>

                          <option value="RS">
                            Rio Grande do Sul
                          </option>

                          <option value="RO">
                            Rondônia
                          </option>

                          <option value="RR">
                            Roraima
                          </option>

                          <option value="SC">
                            Santa Catarina
                          </option>

                          <option value="SP">
                            São Paulo
                          </option>

                          <option value="SE">
                            Sergipe
                          </option>

                          <option value="TO">
                            Tocantins
                          </option>

                        </select>

                      </div>

                    </div>
                  </div>

                  {/* INFORMAÇÕES ADICIONAIS */}
                  <div>

                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      <i className="bi bi-card-text me-2"></i>
                      Informações adicionais
                    </h6>

                    <div className="row g-3">

                      {/* DESCRIÇÃO */}
                      <div className="col-12">

                        <label className="form-label fw-semibold">
                          Descrição
                        </label>

                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Descreva as principais características do imóvel..."
                          value={form.descricao}
                          onChange={(e) =>
                            alterarCampo(
                              "descricao",
                              e.target.value
                            )
                          }
                        ></textarea>

                      </div>

                      {/* OBSERVAÇÕES */}
                      <div className="col-12">

                        <label className="form-label fw-semibold">
                          Observações
                        </label>

                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Informações internas ou observações importantes..."
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
      {/* RODAPÉ DA PÁGINA */}
      <div className="text-center text-muted py-4">
        <small>
          Sistema de Gestão Imobiliária
        </small>

        <div className="mt-1">
          <small>
            Gestão de imóveis
          </small>
        </div>
      </div>

    </div>
  )
}