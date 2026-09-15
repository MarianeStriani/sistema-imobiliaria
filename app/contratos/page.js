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
        descricao: form.descricao || null,
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

      {/* MENSAGENS */}
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

        {/* TOTAL */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <i className="bi bi-houses text-primary fs-5"></i>
                </div>

                <div>
                  <div className="text-muted small">
                    Total de imóveis
                  </div>

                  <div className="fs-4 fw-bold">
                    {totalImoveis}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* DISPONÍVEIS */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <i className="bi bi-house-check text-success fs-5"></i>
                </div>

                <div>
                  <div className="text-muted small">
                    Disponíveis
                  </div>

                  <div className="fs-4 fw-bold">
                    {imoveisDisponiveis}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ALUGADOS */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">

                <div
                  className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <i className="bi bi-house-door text-info fs-5"></i>
                </div>

                <div>
                  <div className="text-muted small">
                    Alugados
                  </div>

                  <div className="fs-4 fw-bold">
                    {imoveisAlugados}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* MANUTENÇÃO */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">

                <div
                  className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <i className="bi bi-tools text-warning fs-5"></i>
                </div>

                <div>
                  <div className="text-muted small">
                    Em manutenção
                  </div>

                  <div className="fs-4 fw-bold">
                    {imoveisManutencao}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* LISTA DE IMÓVEIS */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          {/* CABEÇALHO DA LISTA */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                Lista de imóveis
              </h5>

              <p className="text-muted small mb-0">
                Consulte e gerencie os imóveis cadastrados
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

          {/* FILTROS */}
          <div className="row g-2 mb-4">

            {/* BUSCA */}
            <div className="col-12 col-md-6">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código, imóvel, tipo ou localização..."
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

            {/* STATUS */}
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
                  Manutenção
                </option>

                <option value="indisponivel">
                  Indisponível
                </option>
              </select>

            </div>

            {/* ATUALIZAR */}
            <div className="col-12 col-md-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={carregarImoveis}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar
              </button>

            </div>

          </div>

          {/* QUANTIDADE */}
          <div className="d-flex justify-content-between align-items-center mb-3">

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

          </div>
          {/* CONTEÚDO DA TABELA */}

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

              <div
                className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "70px",
                  height: "70px",
                }}
              >
                <i className="bi bi-house-x fs-2 text-muted"></i>
              </div>

              <h5 className="fw-semibold">
                Nenhum imóvel encontrado
              </h5>

              <p className="text-muted mb-3">
                Não encontramos imóveis com os
                filtros informados.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={abrirNovoImovel}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Cadastrar imóvel
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>

                    <th>Imóvel</th>

                    <th>Tipo</th>

                    <th>Localização</th>

                    <th>Valor</th>

                    <th>Características</th>

                    <th>Status</th>

                    <th className="text-end">
                      Ações
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {imoveisFiltrados.map((imovel) => {

                    const valorFormatado =
                      imovel.valor != null
                        ? Number(
                            imovel.valor
                          ).toLocaleString(
                            "pt-BR",
                            {
                              style: "currency",
                              currency: "BRL",
                            }
                          )
                        : "—"

                    let statusTexto =
                      "Indisponível"

                    let statusClasse =
                      "bg-secondary"

                    if (
                      imovel.status ===
                      "disponivel"
                    ) {
                      statusTexto =
                        "Disponível"

                      statusClasse =
                        "bg-success"
                    }

                    if (
                      imovel.status ===
                      "alugado"
                    ) {
                      statusTexto =
                        "Alugado"

                      statusClasse =
                        "bg-primary"
                    }

                    if (
                      imovel.status ===
                      "manutencao"
                    ) {
                      statusTexto =
                        "Manutenção"

                      statusClasse =
                        "bg-warning text-dark"
                    }

                    return (
                      <tr key={imovel.id}>

                        {/* IMÓVEL */}
                        <td>
                          <div className="d-flex align-items-center">

                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "42px",
                                height: "42px",
                              }}
                            >
                              <i className="bi bi-house-door text-primary"></i>
                            </div>

                            <div>

                              <div className="fw-semibold">
                                {imovel.titulo ||
                                  "Imóvel sem título"}
                              </div>

                              <small className="text-muted">
                                {imovel.codigo
                                  ? `Código: ${imovel.codigo}`
                                  : "Sem código"}
                              </small>

                            </div>

                          </div>
                        </td>

                        {/* TIPO */}
                        <td>
                          <div className="fw-semibold">
                            {imovel.tipo || "—"}
                          </div>

                          <small className="text-muted">
                            {imovel.finalidade ||
                              "—"}
                          </small>
                        </td>

                        {/* LOCALIZAÇÃO */}
                        <td>
                          <div className="fw-semibold">
                            {imovel.bairro ||
                              "—"}
                          </div>

                          <small className="text-muted">
                            {imovel.cidade || "—"}
                            {imovel.estado
                              ? ` - ${imovel.estado}`
                              : ""}
                          </small>
                        </td>

                        {/* VALOR */}
                        <td>
                          <span className="fw-semibold">
                            {valorFormatado}
                          </span>
                        </td>

                        {/* CARACTERÍSTICAS */}
                        <td>
                          <div className="d-flex flex-wrap gap-2">

                            {imovel.quartos != null && (
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-door-open me-1"></i>
                                {imovel.quartos} quartos
                              </span>
                            )}

                            {imovel.banheiros != null && (
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-droplet me-1"></i>
                                {imovel.banheiros} banheiros
                              </span>
                            )}

                            {imovel.vagas != null && (
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-car-front me-1"></i>
                                {imovel.vagas} vagas
                              </span>
                            )}

                            {imovel.area != null && (
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-bounding-box me-1"></i>
                                {imovel.area} m²
                              </span>
                            )}

                          </div>
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`badge ${statusClasse}`}
                          >
                            {statusTexto}
                          </span>
                        </td>

                        {/* AÇÕES */}
                        <td className="text-end">

                          <div className="btn-group">

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
                    )
                  })}

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
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO DO MODAL */}
              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {editando
                      ? "Editar imóvel"
                      : "Novo imóvel"}
                  </h5>

                  <p className="text-muted small mb-0">
                    {editando
                      ? "Atualize os dados do imóvel"
                      : "Cadastre um novo imóvel no sistema"}
                  </p>
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
                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                      }}
                    >
                      <i className="bi bi-house-door text-primary"></i>
                    </div>

                    <div>
                      <h6 className="fw-bold mb-1">
                        Dados do imóvel
                      </h6>

                      <small className="text-muted">
                        Informe os dados principais do imóvel.
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
                        value={form.codigo}
                        onChange={(e) =>
                          alterarCampo(
                            "codigo",
                            e.target.value
                          )
                        }
                        placeholder="Ex.: IMV-001"
                      />

                    </div>

                    {/* TÍTULO */}
                    <div className="col-12 col-md-9">

                      <label className="form-label fw-semibold">
                        Título do imóvel
                        <span className="text-danger">
                          {" "}*
                        </span>
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
                        placeholder="Ex.: Casa térrea com 3 quartos"
                        required
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
                        <option value="Casa">
                          Casa
                        </option>

                        <option value="Apartamento">
                          Apartamento
                        </option>

                        <option value="Sobrado">
                          Sobrado
                        </option>

                        <option value="Comercial">
                          Comercial
                        </option>

                        <option value="Terreno">
                          Terreno
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
                          Manutenção
                        </option>

                        <option value="indisponivel">
                          Indisponível
                        </option>
                      </select>

                    </div>

                  </div>

                  <hr className="my-4" />

                  {/* INFORMAÇÕES FINANCEIRAS */}
                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                      }}
                    >
                      <i className="bi bi-cash-coin text-success"></i>
                    </div>

                    <div>
                      <h6 className="fw-bold mb-1">
                        Informações financeiras
                      </h6>

                      <small className="text-muted">
                        Informe o valor relacionado ao imóvel.
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
                          className="form-control"
                          value={form.valor}
                          onChange={(e) =>
                            alterarCampo(
                              "valor",
                              e.target.value
                            )
                          }
                          placeholder="0,00"
                          min="0"
                          step="0.01"
                        />

                      </div>

                    </div>

                  </div>
                  <hr className="my-4" />

                  {/* CARACTERÍSTICAS */}
                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                      }}
                    >
                      <i className="bi bi-grid-3x3-gap text-info"></i>
                    </div>

                    <div>
                      <h6 className="fw-bold mb-1">
                        Características
                      </h6>

                      <small className="text-muted">
                        Informe as características do imóvel.
                      </small>
                    </div>

                  </div>

                  <div className="row g-3">

                    {/* QUARTOS */}
                    <div className="col-12 col-md-3">

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
                    <div className="col-12 col-md-3">

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
                    <div className="col-12 col-md-3">

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
                    <div className="col-12 col-md-3">

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

                  <hr className="my-4" />

                  {/* ENDEREÇO */}
                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                      }}
                    >
                      <i className="bi bi-geo-alt text-warning"></i>
                    </div>

                    <div>
                      <h6 className="fw-bold mb-1">
                        Endereço
                      </h6>

                      <small className="text-muted">
                        Informe a localização do imóvel.
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

                    {/* NÚMERO */}
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
                        placeholder="Número"
                      />

                    </div>

                    {/* COMPLEMENTO */}
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
                        placeholder="Apartamento, bloco, casa..."
                      />

                    </div>

                    {/* BAIRRO */}
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
                        placeholder="Bairro"
                      />

                    </div>

                    {/* CIDADE */}
                    <div className="col-12 col-md-5">

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
                        placeholder="Cidade"
                      />

                    </div>

                    {/* ESTADO */}
                    <div className="col-12 col-md-3">

                      <label className="form-label fw-semibold">
                        Estado
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={form.estado}
                        onChange={(e) =>
                          alterarCampo(
                            "estado",
                            e.target.value
                          )
                        }
                        placeholder="SP"
                        maxLength="2"
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
                  <hr className="my-4" />

                  {/* DESCRIÇÃO */}
                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                      }}
                    >
                      <i className="bi bi-card-text text-secondary"></i>
                    </div>

                    <div>
                      <h6 className="fw-bold mb-1">
                        Descrição
                      </h6>

                      <small className="text-muted">
                        Adicione uma descrição detalhada do imóvel.
                      </small>
                    </div>

                  </div>

                  <div className="row g-3">

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Descrição do imóvel
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
                        placeholder="Descreva o imóvel, seus ambientes, diferenciais e outras informações importantes..."
                      ></textarea>

                    </div>

                  </div>

                  <hr className="my-4" />

                  {/* OBSERVAÇÕES */}
                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="bg-dark bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                      }}
                    >
                      <i className="bi bi-sticky text-dark"></i>
                    </div>

                    <div>
                      <h6 className="fw-bold mb-1">
                        Observações
                      </h6>

                      <small className="text-muted">
                        Registre informações internas sobre o imóvel.
                      </small>
                    </div>

                  </div>

                  <div className="row g-3">

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Observações internas
                      </label>

                      <textarea
                        className="form-control"
                        rows="4"
                        value={form.observacoes}
                        onChange={(e) =>
                          alterarCampo(
                            "observacoes",
                            e.target.value
                          )
                        }
                        placeholder="Digite observações internas, informações administrativas ou outras anotações..."
                      ></textarea>

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
                    <i className="bi bi-x-lg me-2"></i>
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
      <div className="text-center text-muted py-3">

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
      {/* RODAPÉ DA PÁGINA */}
      <div className="text-center text-muted py-3">

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