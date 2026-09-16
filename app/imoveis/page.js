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
  // NOVO IMÓVEL
  // ==========================================

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

    limparMensagens()
    setSalvando(true)

    try {
      const dados = {
        codigo: form.codigo || null,

        titulo:
          form.titulo || null,

        tipo:
          form.tipo || null,

        finalidade:
          form.finalidade || null,

        status:
          form.status || null,

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
          form.endereco || null,

        numero:
          form.numero || null,

        complemento:
          form.complemento || null,

        bairro:
          form.bairro || null,

        cidade:
          form.cidade || null,

        estado:
          form.estado || null,

        cep:
          form.cep || null,

        descricao:
          form.descricao || null,

        observacoes:
          form.observacoes || null,
      }

      let error

      if (editando?.id) {
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
          ? "Imóvel atualizado com sucesso."
          : "Imóvel cadastrado com sucesso."
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

  async function excluirImovel(imovel) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o imóvel "${imovel.titulo || imovel.codigo || "sem título"}"?`
    )

    if (!confirmar) {
      return
    }

    limparMensagens()

    try {
      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", imovel.id)

      if (error) {
        throw error
      }

      setSucesso(
        "Imóvel excluído com sucesso."
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
  // FILTROS
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
        String(imovel.bairro || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.cidade || "")
          .toLowerCase()
          .includes(termo) ||
        String(imovel.status || "")
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

  // ==========================================
  // CONTAGEM DOS IMÓVEIS
  // ==========================================

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

      {/* =====================================
          CABEÇALHO
      ===================================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Imóveis
          </h2>

          <p className="text-muted mb-0">
            Gerencie os imóveis da imobiliária
          </p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">

          <button
            className="btn btn-outline-primary"
            onClick={carregarImoveis}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>

          <button
            className="btn btn-primary"
            onClick={abrirNovoImovel}
          >
            <i className="bi bi-house-add me-2"></i>
            Novo imóvel
          </button>

        </div>
      </div>

      {/* =====================================
          MENSAGEM DE ERRO
      ===================================== */}

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

      {/* =====================================
          MENSAGEM DE SUCESSO
      ===================================== */}

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

      {/* =====================================
          ACESSO RÁPIDO
      ===================================== */}

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
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/clientes")}
              >
                <i className="bi bi-people d-block fs-5 mb-1"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-primary w-100 py-2"
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
      {/* =====================================
          RESUMO DOS IMÓVEIS
      ===================================== */}

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
              <i className="bi bi-bar-chart text-primary"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Resumo dos imóveis
              </h5>

              <small className="text-muted">
                Quantidade de imóveis por situação
              </small>
            </div>

          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th>
                    Situação
                  </th>

                  <th className="text-end">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>

                {/* TOTAL */}

                <tr>
                  <td>
                    <div className="d-flex align-items-center">

                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <i className="bi bi-houses text-primary"></i>
                      </div>

                      <div>
                        <div className="fw-semibold">
                          Total de imóveis
                        </div>

                        <small className="text-muted">
                          Todos os imóveis cadastrados
                        </small>
                      </div>

                    </div>
                  </td>

                  <td className="text-end">
                    <span className="badge bg-primary fs-6">
                      {totalImoveis}
                    </span>
                  </td>
                </tr>

                {/* DISPONÍVEIS */}

                <tr>
                  <td>
                    <div className="d-flex align-items-center">

                      <div
                        className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <i className="bi bi-house-check text-success"></i>
                      </div>

                      <div>
                        <div className="fw-semibold">
                          Disponíveis
                        </div>

                        <small className="text-muted">
                          Imóveis disponíveis para negociação
                        </small>
                      </div>

                    </div>
                  </td>

                  <td className="text-end">
                    <span className="badge bg-success fs-6">
                      {imoveisDisponiveis}
                    </span>
                  </td>
                </tr>

                {/* ALUGADOS */}

                <tr>
                  <td>
                    <div className="d-flex align-items-center">

                      <div
                        className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <i className="bi bi-house-check text-info"></i>
                      </div>

                      <div>
                        <div className="fw-semibold">
                          Alugados
                        </div>

                        <small className="text-muted">
                          Imóveis atualmente alugados
                        </small>
                      </div>

                    </div>
                  </td>

                  <td className="text-end">
                    <span className="badge bg-info fs-6">
                      {imoveisAlugados}
                    </span>
                  </td>
                </tr>

                {/* MANUTENÇÃO */}

                <tr>
                  <td>
                    <div className="d-flex align-items-center">

                      <div
                        className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <i className="bi bi-tools text-warning"></i>
                      </div>

                      <div>
                        <div className="fw-semibold">
                          Em manutenção
                        </div>

                        <small className="text-muted">
                          Imóveis indisponíveis para manutenção
                        </small>
                      </div>

                    </div>
                  </td>

                  <td className="text-end">
                    <span className="badge bg-warning text-dark fs-6">
                      {imoveisManutencao}
                    </span>
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* =====================================
          FILTROS
      ===================================== */}

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
              <i className="bi bi-funnel text-primary"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Filtros
              </h5>

              <small className="text-muted">
                Encontre rapidamente um imóvel
              </small>
            </div>

          </div>

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
                  placeholder="Código, título, tipo, bairro, cidade..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />

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
                  Disponíveis
                </option>

                <option value="alugado">
                  Alugados
                </option>

                <option value="manutencao">
                  Em manutenção
                </option>

              </select>

            </div>

          </div>


          {/* RESULTADO DO FILTRO */}

          <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top">

            <small className="text-muted">

              <i className="bi bi-house me-1"></i>

              Exibindo{" "}
              <strong>
                {imoveisFiltrados.length}
              </strong>{" "}
              de{" "}
              <strong>
                {totalImoveis}
              </strong>{" "}
              imóveis

            </small>


            {(busca || filtroStatus !== "todos") && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary mt-2 mt-md-0"
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

      </div>


      {/* =====================================
          TABELA DE IMÓVEIS
      ===================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <div className="d-flex align-items-center">

              <div
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "38px",
                  height: "38px",
                }}
              >
                <i className="bi bi-houses text-primary"></i>
              </div>

              <div>

                <h5 className="fw-bold mb-0">
                  Imóveis cadastrados
                </h5>

                <small className="text-muted">
                  Lista de imóveis cadastrados no sistema
                </small>

              </div>

            </div>

            <button
              type="button"
              className="btn btn-primary mt-3 mt-md-0"
              onClick={abrirNovoImovel}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Novo imóvel
            </button>

          </div>


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
          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      Imóvel
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Finalidade
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

                    <th className="text-end">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {imoveisFiltrados.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center py-5"
                      >

                        <i
                          className="bi bi-house-x text-muted"
                          style={{
                            fontSize: "2.5rem",
                          }}
                        ></i>

                        <p className="fw-semibold mt-3 mb-1">
                          Nenhum imóvel encontrado
                        </p>

                        <small className="text-muted">
                          Tente alterar os filtros ou cadastre um novo imóvel.
                        </small>

                      </td>

                    </tr>

                  ) : (

                    imoveisFiltrados.map((imovel) => (

                      <tr key={imovel.id}>

                        {/* IMÓVEL */}

                        <td>

                          <div className="d-flex align-items-center">

                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                              style={{
                                width: "40px",
                                height: "40px",
                              }}
                            >
                              <i className="bi bi-house text-primary"></i>
                            </div>

                            <div>

                              <div className="fw-semibold">
                                {imovel.titulo ||
                                  "Sem título"}
                              </div>

                              {imovel.codigo && (
                                <small className="text-muted">
                                  Código: {imovel.codigo}
                                </small>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* TIPO */}

                        <td>
                          {imovel.tipo || "-"}
                        </td>


                        {/* FINALIDADE */}

                        <td>
                          {imovel.finalidade || "-"}
                        </td>


                        {/* LOCALIZAÇÃO */}

                        <td>

                          {imovel.bairro ||
                          imovel.cidade ? (
                            <>
                              <div>
                                {imovel.bairro || "-"}
                              </div>

                              <small className="text-muted">
                                {imovel.cidade || ""}
                                {imovel.estado
                                  ? ` - ${imovel.estado}`
                                  : ""}
                              </small>
                            </>
                          ) : (
                            "-"
                          )}

                        </td>


                        {/* VALOR */}

                        <td>

                          {imovel.valor !== null &&
                          imovel.valor !== undefined &&
                          imovel.valor !== "" ? (
                            Number(
                              imovel.valor
                            ).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              }
                            )
                          ) : (
                            "-"
                          )}

                        </td>


                        {/* STATUS */}

                        <td>
                          {imovel.status ===
                            "disponivel" && (
                            <span className="badge bg-success">
                              Disponível
                            </span>
                          )}

                          {imovel.status ===
                            "alugado" && (
                            <span className="badge bg-info">
                              Alugado
                            </span>
                          )}

                          {imovel.status ===
                            "manutencao" && (
                            <span className="badge bg-warning text-dark">
                              Manutenção
                            </span>
                          )}

                          {![
                            "disponivel",
                            "alugado",
                            "manutencao",
                          ].includes(
                            imovel.status
                          ) && (
                            <span className="badge bg-secondary">
                              {imovel.status || "Não informado"}
                            </span>
                          )}
                        </td>


                        {/* AÇÕES */}

                        <td className="text-end">

                          <div className="btn-group">

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
                                  imovel
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
      {/* =====================================
          MODAL - CADASTRO / EDIÇÃO
      ===================================== */}

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

          <div className="modal-dialog modal-xl modal-dialog-scrollable">

            <div className="modal-content">

              {/* CABEÇALHO DO MODAL */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold mb-1">

                    <i className="bi bi-house-door me-2 text-primary"></i>

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
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>

              </div>


              {/* FORMULÁRIO */}

              <form onSubmit={salvarImovel}>

                <div className="modal-body">

                  {/* =================================
                      IDENTIFICAÇÃO
                  ================================= */}

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
                          <i className="bi bi-info-circle text-primary"></i>
                        </div>

                        <div>

                          <h6 className="fw-bold mb-0">
                            Identificação
                          </h6>

                          <small className="text-muted">
                            Informações principais do imóvel
                          </small>

                        </div>

                      </div>


                      <div className="row g-3">

                        {/* CÓDIGO */}

                        <div className="col-12 col-md-3">

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

                        <div className="col-12 col-md-9">

                          <label className="form-label fw-semibold">
                            Título do imóvel
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ex.: Casa residencial com 3 quartos"
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

                            <option value="Terreno">
                              Terreno
                            </option>

                            <option value="Comercial">
                              Comercial
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

                            <option value="manutencao">
                              Em manutenção
                            </option>

                          </select>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* =================================
                      VALOR E CARACTERÍSTICAS
                  ================================= */}

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
                          <i className="bi bi-house-gear text-primary"></i>
                        </div>

                        <div>

                          <h6 className="fw-bold mb-0">
                            Características
                          </h6>

                          <small className="text-muted">
                            Valores e características do imóvel
                          </small>

                        </div>

                      </div>


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

                        <div className="col-12 col-md-2">

                          <label className="form-label fw-semibold">
                            Quartos
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="0"
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

                        <div className="col-12 col-md-2">

                          <label className="form-label fw-semibold">
                            Banheiros
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="0"
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

                        <div className="col-12 col-md-2">

                          <label className="form-label fw-semibold">
                            Vagas
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="0"
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

                        <div className="col-12 col-md-2">

                          <label className="form-label fw-semibold">
                            Área (m²)
                          </label>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            placeholder="0"
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


                  {/* =================================
                      ENDEREÇO
                  ================================= */}

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
                          <i className="bi bi-geo-alt text-primary"></i>
                        </div>

                        <div>

                          <h6 className="fw-bold mb-0">
                            Endereço
                          </h6>

                          <small className="text-muted">
                            Localização do imóvel
                          </small>

                        </div>

                      </div>


                      <div className="row g-3">

                        {/* ENDEREÇO */}

                        <div className="col-12 col-md-8">

                          <label className="form-label fw-semibold">
                            Endereço
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Rua, avenida, estrada..."
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

                        <div className="col-6 col-md-2">

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


                        {/* CEP */}

                        <div className="col-6 col-md-2">

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
                            placeholder="Bairro"
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
                            placeholder="Cidade"
                            value={form.cidade}
                            onChange={(e) =>
                              alterarCampo(
                                "cidade",
                                e.target.value
                                            "cidade",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        {/* ESTADO */}

                        <div className="col-12 col-md-1">

                          <label className="form-label fw-semibold">
                            UF
                          </label>

                          <input
                            type="text"
                            maxLength="2"
                            className="form-control text-uppercase"
                            placeholder="SP"
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

                  </div>


                  {/* =================================
                      DESCRIÇÃO E OBSERVAÇÕES
                  ================================= */}

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
                          <i className="bi bi-card-text text-primary"></i>
                        </div>

                        <div>

                          <h6 className="fw-bold mb-0">
                            Descrição
                          </h6>

                          <small className="text-muted">
                            Informações adicionais sobre o imóvel
                          </small>

                        </div>

                      </div>


                      <div className="row g-3">

                        {/* DESCRIÇÃO */}

                        <div className="col-12">

                          <label className="form-label fw-semibold">
                            Descrição do imóvel
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Descreva as características, diferenciais e demais informações do imóvel..."
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
                            placeholder="Informações adicionais..."
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

                </div>


                {/* =================================
                    RODAPÉ DO MODAL
                ================================= */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={fecharModal}
                    disabled={salvando}
                  >
                    <i className="bi bi-x-circle me-2"></i>
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
                        <i className="bi bi-check-circle me-2"></i>

                        {editando
                          ? "Atualizar imóvel"
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