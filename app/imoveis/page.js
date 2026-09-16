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

  // ==========================================
  // CARREGAR IMÓVEIS
  // ==========================================

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

  // ==========================================
  // MENSAGENS
  // ==========================================

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  // ==========================================
  // NAVEGAÇÃO
  // ==========================================

  function acessarPagina(url) {
    window.location.href = url
  }

  // ==========================================
  // FORMULÁRIO INICIAL
  // ==========================================

  function formularioInicial() {
    return {
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
    }
  }

  // ==========================================
  // NOVO IMÓVEL
  // ==========================================

  function abrirNovoImovel() {
    limparMensagens()

    setEditando(null)
    setForm(formularioInicial())
    setModalAberto(true)
  }

  // ==========================================
  // EDITAR IMÓVEL
  // ==========================================

  function abrirEditarImovel(imovel) {
    limparMensagens()

    setEditando(imovel)

    setForm({
      codigo: imovel.codigo || "",
      titulo: imovel.titulo || "",
      tipo: imovel.tipo || "Casa",
      finalidade: imovel.finalidade || "Aluguel",
      status: imovel.status || "disponivel",

      valor:
        imovel.valor !== null &&
        imovel.valor !== undefined
          ? imovel.valor
          : "",

      quartos:
        imovel.quartos !== null &&
        imovel.quartos !== undefined
          ? imovel.quartos
          : "",

      banheiros:
        imovel.banheiros !== null &&
        imovel.banheiros !== undefined
          ? imovel.banheiros
          : "",

      vagas:
        imovel.vagas !== null &&
        imovel.vagas !== undefined
          ? imovel.vagas
          : "",

      area:
        imovel.area !== null &&
        imovel.area !== undefined
          ? imovel.area
          : "",

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

  // ==========================================
  // FECHAR MODAL
  // ==========================================

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }

  // ==========================================
  // ALTERAR CAMPO
  // ==========================================

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  // ==========================================
  // SALVAR IMÓVEL
  // ==========================================

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

  // ==========================================
  // EXCLUIR IMÓVEL
  // ==========================================

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
  // ==========================================
  // FORMATADORES
  // ==========================================

  function formatarMoeda(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "R$ 0,00"
    }

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function obterStatusLabel(status) {
    const statusMap = {
      disponivel: "Disponível",
      alugado: "Alugado",
      vendido: "Vendido",
      manutencao: "Manutenção",
      manutenção: "Manutenção",
      reservado: "Reservado",
      indisponivel: "Indisponível",
    }

    return (
      statusMap[status] ||
      status ||
      "Não informado"
    )
  }

  function obterStatusClass(status) {
    const classes = {
      disponivel: "bg-success",
      alugado: "bg-primary",
      vendido: "bg-secondary",
      manutencao: "bg-warning text-dark",
      manutenção: "bg-warning text-dark",
      reservado: "bg-info text-dark",
      indisponivel: "bg-danger",
    }

    return classes[status] || "bg-secondary"
  }

  // ==========================================
  // IMÓVEIS FILTRADOS
  // ==========================================

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
        String(imovel.finalidade || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.endereco || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.bairro || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.cidade || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.estado || "")
          .toLowerCase()
          .includes(termo) ||
        String(imoveis.length)
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

  // ==========================================
  // RESUMO
  // ==========================================

  const resumo = useMemo(() => {
    const total = imoveis.length

    const disponiveis = imoveis.filter(
      (imovel) =>
        imovel.status === "disponivel"
    ).length

    const alugados = imoveis.filter(
      (imovel) =>
        imovel.status === "alugado"
    ).length

    const manutencao = imoveis.filter(
      (imovel) =>
        imovel.status === "manutencao" ||
        imovel.status === "manutenção"
    ).length

    const vendidos = imoveis.filter(
      (imovel) =>
        imovel.status === "vendido"
    ).length

    return {
      total,
      disponiveis,
      alugados,
      manutencao,
      vendidos,
    }
  }, [imoveis])

  // ==========================================
  // INÍCIO DA PÁGINA
  // ==========================================

  return (
    <div className="container-fluid py-4">

      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Imóveis
          </h2>

          <p className="text-muted mb-0">
            Gerencie os imóveis cadastrados
        </p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={carregarImoveis}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Atualizando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2" />
                Atualizar
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirNovoImovel}
          >
            <i className="bi bi-plus-lg me-2" />
            Novo imóvel
          </button>
        </div>
      </div>

      {/* ALERTA DE ERRO */}
      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {erro}

          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
            onClick={() => setErro("")}
          />
        </div>
      )}

      {/* ALERTA DE SUCESSO */}
      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2" />
          {sucesso}

          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
            onClick={() => setSucesso("")}
          />
        </div>
      )}

      {/* ========================================
          ACESSO RÁPIDO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex align-items-center mb-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3"
              style={{
                width: "42px",
                height: "42px",
              }}
            >
              <i className="bi bi-lightning-charge-fill fs-5" />
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>

              <small className="text-muted">
                Acesse rapidamente os módulos do sistema
              </small>
            </div>
          </div>

          <div className="row g-2">

            {/* DASHBOARD */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/")
                }
              >
                <i className="bi bi-speedometer2 me-1" />
                Dashboard
              </button>
            </div>

            {/* CLIENTES */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/clientes")
                }
              >
                <i className="bi bi-people me-1" />
                Clientes
              </button>
            </div>

            {/* IMÓVEIS - ATIVO */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/imoveis")
                }
              >
                <i className="bi bi-house-door me-1" />
                Imóveis
              </button>
            </div>

            {/* CONTRATOS */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/contratos")
                }
              >
                <i className="bi bi-file-earmark-text me-1" />
                Contratos
              </button>
            </div>

            {/* RECEBIMENTOS */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/recebimentos")
                }
              >
                <i className="bi bi-cash-coin me-1" />
                Recebimentos
              </button>
            </div>

            {/* DESPESAS */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/despesas")
                }
              >
                <i className="bi bi-wallet2 me-1" />
                Despesas
              </button>
            </div>

            {/* FINANCEIRO */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/financeiro")
                }
              >
                <i className="bi bi-bar-chart-line me-1" />
                Financeiro
              </button>
            </div>

            {/* MANUTENÇÕES */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/manutencoes")
                }
              >
                <i className="bi bi-tools me-1" />
                Manutenções
              </button>
            </div>

            {/* VISITAS */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/visitas")
                }
              >
                <i className="bi bi-calendar-check me-1" />
                Visitas
              </button>
            </div>

            {/* COMUNICAÇÃO */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/comunicacao")
                }
              >
                <i className="bi bi-whatsapp me-1" />
                Comunicação
              </button>
            </div>

            {/* RELATÓRIOS */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/relatorios")
                }
              >
                <i className="bi bi-file-earmark-bar-graph me-1" />
                Relatórios
              </button>
            </div>

            {/* CONFIGURAÇÕES */}
            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/configuracoes")
                }
              >
                <i className="bi bi-gear me-1" />
                Configurações
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================
          CARDS DE RESUMO
      ======================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-buildings fs-4" />
                </div>

                <div>
                  <small className="text-muted d-block">
                    Total de imóveis
                  </small>

                  <h4 className="fw-bold mb-0">
                    {resumo.total}
                  </h4>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* DISPONÍVEIS */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-house-check fs-4" />
                </div>

                <div>
                  <small className="text-muted d-block">
                    Disponíveis
                  </small>

                  <h4 className="fw-bold mb-0">
                    {resumo.disponiveis}
                  </h4>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ALUGADOS */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 text-info me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-house-heart fs-4" />
                </div>

                <div>
                  <small className="text-muted d-block">
                    Alugados
                  </small>

                  <h4 className="fw-bold mb-0">
                    {resumo.alugados}
                  </h4>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
      {/* ========================================
          LISTA DE IMÓVEIS
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        {/* CABEÇALHO DO CARD */}
        <div className="card-header bg-white border-0 pt-4 px-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">

            <div>
              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <p className="text-muted mb-0">
                Consulte, edite e gerencie os imóveis
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirNovoImovel}
            >
              <i className="bi bi-plus-lg me-2" />
              Novo imóvel
            </button>

          </div>
        </div>

        {/* FILTROS */}
        <div className="card-body px-4">

          <div className="row g-3">

            {/* BUSCA */}
            <div className="col-12 col-md-8">

              <label className="form-label fw-semibold">
                Buscar imóvel
              </label>

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <i className="bi bi-search" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código, título, endereço, cidade..."
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
                    <i className="bi bi-x-lg" />
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

                <option value="vendido">
                  Vendido
                </option>

                <option value="manutencao">
                  Manutenção
                </option>

                <option value="reservado">
                  Reservado
                </option>

                <option value="indisponivel">
                  Indisponível
                </option>
              </select>

            </div>

          </div>

          {/* INFORMAÇÕES DOS FILTROS */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 gap-2">

            <small className="text-muted">
              Exibindo{" "}
              <strong>
                {imoveisFiltrados.length}
              </strong>{" "}
              de{" "}
              <strong>
                {imoveis.length}
              </strong>{" "}
              imóveis
            </small>

            {(busca ||
              filtroStatus !== "todos") && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setBusca("")
                  setFiltroStatus("todos")
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1" />
                Limpar filtros
              </button>
            )}

          </div>

        </div>

        {/* ATUALIZAR LISTA */}
        <div className="border-top px-4 py-3">
          <div className="d-flex justify-content-end">

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={carregarImoveis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Atualizando...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2" />
                  Atualizar lista
                </>
              )}
            </button>

          </div>
        </div>

        {/* CONTEÚDO */}
        {loading ? (
          <div className="card-body py-5 text-center">

            <div
              className="spinner-border text-primary mb-3"
              role="status"
            />

            <p className="text-muted mb-0">
              Carregando imóveis...
            </p>

          </div>
        ) : imoveisFiltrados.length === 0 ? (
          <div className="card-body py-5 text-center">

            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-light text-muted mx-auto mb-3"
              style={{
                width: "64px",
                height: "64px",
              }}
            >
              <i className="bi bi-house-x fs-3" />
            </div>

            <h5 className="fw-bold">
              Nenhum imóvel encontrado
            </h5>

            <p className="text-muted mb-3">
              {busca ||
              filtroStatus !== "todos"
                ? "Tente alterar os filtros utilizados."
                : "Ainda não existem imóveis cadastrados."}
            </p>

            {!busca &&
              filtroStatus === "todos" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={abrirNovoImovel}
                >
                  <i className="bi bi-plus-lg me-2" />
                  Cadastrar primeiro imóvel
                </button>
              )}

          </div>
        ) : (
          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>

                  <th className="px-4">
                    Imóvel
                  </th>

                  <th>
                    Código
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Localização
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

                {imoveisFiltrados.map(
                  (imovel) => (
                    <tr key={imovel.id}>

                      {/* IMÓVEL */}
                      <td className="px-4">

                        <div className="d-flex align-items-center">

                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3 flex-shrink-0"
                            style={{
                              width: "42px",
                              height: "42px",
                            }}
                          >
                            <i className="bi bi-house-door fs-5" />
                          </div>

                          <div>

                            <div className="fw-semibold">
                              {imovel.titulo ||
                                "Imóvel sem título"}
                            </div>

                            {imovel.endereco && (
                              <small className="text-muted">
                                {imovel.endereco}
                                {imovel.numero
                                  ? `, ${imovel.numero}`
                                  : ""}
                              </small>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* CÓDIGO */}
                      <td>

                        {imovel.codigo ? (
                          <span className="fw-semibold">
                            {imovel.codigo}
                          </span>
                        ) : (
                          <span className="text-muted">
                            —
                          </span>
                        )}

                      </td>

                      {/* TIPO */}
                      <td>

                        <span className="text-capitalize">
                          {imovel.tipo ||
                            "Não informado"}
                        </span>

                        {imovel.finalidade && (
                          <small className="d-block text-muted">
                            {imovel.finalidade}
                          </small>
                        )}

                      </td>

                      {/* LOCALIZAÇÃO */}
                      <td>

                        {imovel.bairro && (
                          <div>
                            {imovel.bairro}
                          </div>
                        )}

                        {imovel.cidade ||
                        imovel.estado ? (
                          <small className="text-muted">
                            {imovel.cidade || ""}
                            {imovel.cidade &&
                            imovel.estado
                              ? " - "
                              : ""}
                            {imovel.estado || ""}
                          </small>
                        ) : (
                          !imovel.bairro && (
                            <span className="text-muted">
                              —
                            </span>
                          )
                        )}

                      </td>

                      {/* VALOR */}
                      <td>

                        <span className="fw-semibold">
                          {formatarMoeda(
                            imovel.valor
                          )}
                        </span>

                      </td>

                      {/* STATUS */}
                      <td>

                        <span
                          className={`badge ${obterStatusClass(
                            imovel.status
                          )}`}
                        >
                          {obterStatusLabel(
                            imovel.status
                          )}
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
                              abrirEditarImovel(
                                imovel
                              )
                            }
                          >
                            <i className="bi bi-pencil" />
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
                            <i className="bi bi-trash" />
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
      {/* ========================================
          MODAL - NOVO / EDITAR IMÓVEL
      ======================================== */}

      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO */}
              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-house-door me-2 text-primary" />

                    {editando
                      ? "Editar imóvel"
                      : "Novo imóvel"}
                  </h5>

                  <small className="text-muted">
                    {editando
                      ? "Atualize os dados do imóvel cadastrado."
                      : "Preencha os dados para cadastrar um novo imóvel."}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={fecharModal}
                  disabled={salvando}
                />

              </div>

              {/* FORMULÁRIO */}
              <form onSubmit={salvarImovel}>

                <div className="modal-body">

                  {/* ==================================
                      DADOS PRINCIPAIS
                  ================================== */}

                  <div className="mb-4">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-info-circle me-2 text-primary" />
                      Dados do imóvel
                    </h6>

                    <div className="row g-3">

                      {/* CÓDIGO */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          Código
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex.: IMV001"
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
                      <div className="col-12 col-md-8">
                        <label className="form-label fw-semibold">
                          Título do imóvel
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex.: Casa residencial"
                          value={form.titulo}
                          onChange={(e) =>
                            alterarCampo(
                              "titulo",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* TIPO */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          Tipo de imóvel
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

                          <option value="Sobrado">
                            Sobrado
                          </option>

                          <option value="Kitnet">
                            Kitnet
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

                          <option value="Comercial">
                            Comercial
                          </option>

                          <option value="Rural">
                            Rural
                          </option>

                          <option value="Outro">
                            Outro
                          </option>
                        </select>
                      </div>

                      {/* FINALIDADE */}
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
                          <option value="disponivel">
                            Disponível
                          </option>

                          <option value="alugado">
                            Alugado
                          </option>

                          <option value="vendido">
                            Vendido
                          </option>

                          <option value="manutencao">
                            Manutenção
                          </option>

                          <option value="reservado">
                            Reservado
                          </option>

                          <option value="indisponivel">
                            Indisponível
                          </option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* ==================================
                      CARACTERÍSTICAS E VALORES
                  ================================== */}

                  <div className="mb-4">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-rulers me-2 text-primary" />
                      Características e valores
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
                            step="0.01"
                            min="0"
                            className="form-control"
                            placeholder="0,00"
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
                      <div className="col-6 col-md-2">
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

                      {/* BANHEIROS */}
                      <div className="col-6 col-md-2">
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

                      {/* VAGAS */}
                      <div className="col-6 col-md-2">
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

                      {/* ÁREA */}
                      <div className="col-6 col-md-2">
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

                  {/* ==================================
                      ENDEREÇO
                  ================================== */}

                  <div className="mb-4">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-geo-alt me-2 text-primary" />
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
                          placeholder="Rua, Avenida..."
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
                      <div className="col-6 col-md-4">
                        <label className="form-label fw-semibold">
                          Número
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Número"
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
                          placeholder="Apto, bloco, casa..."
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
                      <div className="col-6 col-md-4">
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

                        <input
                          type="text"
                          className="form-control"
                          placeholder="SP"
                          maxLength="2"
                          value={form.estado}
                          onChange={(e) =>
                            alterarCampo(
                              "estado",
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                      </div>

                    </div>
                  </div>

                  {/* ==================================
                      DESCRIÇÃO
                  ================================== */}

                  <div className="mb-3">

                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-card-text me-2 text-primary" />
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
                          placeholder="Descreva as características do imóvel..."
                          value={form.descricao}
                          onChange={(e) =>
                            alterarCampo(
                              "descricao",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* OBSERVAÇÕES */}
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Observações
                        </label>

                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Informações adicionais..."
                          value={form.observacoes}
                          onChange={(e) =>
                            alterarCampo(
                              "observacoes",
                              e.target.value
                                  )
                          }
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
                    <i className="bi bi-x-lg me-2" />
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
                        />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2" />

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
}                      )
                          }
                        />
                     