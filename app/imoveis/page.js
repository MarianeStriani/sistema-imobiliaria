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

  function abrirNovoImovel() {
    limparMensagens()

    setEditando(null)
    setForm(formularioInicial())
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

  function formatarMoeda(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "R$ 0,00"
    }

    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  function obterStatusLabel(status) {
    const statusMap = {
      disponivel: "Disponível",
      alugado: "Alugado",
      vendido: "Vendido",
      manutencao: "Manutenção",
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
      manutencao:
        "bg-warning text-dark",
      manutenção:
        "bg-warning text-dark",
      reservado:
        "bg-info text-dark",
      indisponivel: "bg-danger",
    }

    return (
      classes[status] ||
      "bg-secondary"
    )
  }
  const imoveisFiltrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase()

    if (
      !termo &&
      filtroStatus === "todos"
    ) {
      return imoveis
    }

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

  const resumo = useMemo(() => {
    const total = imoveis.length

    const disponiveis =
      imoveis.filter(
        (imovel) =>
          imovel.status === "disponivel"
      ).length

    const alugados =
      imoveis.filter(
        (imovel) =>
          imovel.status === "alugado"
      ).length

    const manutencao =
      imoveis.filter(
        (imovel) =>
          imovel.status ===
            "manutencao" ||
          imovel.status ===
            "manutenção"
      ).length

    return {
      total,
      disponiveis,
      alugados,
      manutencao,
    }
  }, [imoveis])

  return (
    <div className="container-fluid py-4">

      {/* CABEÇALHO */}

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
            <i className="bi bi-house-add me-2"></i>
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
          <i className="bi bi-exclamation-triangle me-2"></i>

          {erro}

          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
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
            aria-label="Fechar"
            onClick={() => setSucesso("")}
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
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/")
                }
              >
                <i className="bi bi-speedometer2 d-block fs-5 mb-1"></i>
                Dashboard
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/clientes")
                }
              >
                <i className="bi bi-people d-block fs-5 mb-1"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/imoveis")
                }
              >
                <i className="bi bi-house-door d-block fs-5 mb-1"></i>
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/contratos")
                }
              >
                <i className="bi bi-file-earmark-text d-block fs-5 mb-1"></i>
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/recebimentos")
                }
              >
                <i className="bi bi-cash-coin d-block fs-5 mb-1"></i>
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/despesas")
                }
              >
                <i className="bi bi-wallet2 d-block fs-5 mb-1"></i>
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/financeiro")
                }
              >
                <i className="bi bi-bar-chart-line d-block fs-5 mb-1"></i>
                Financeiro
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/manutencoes")
                }
              >
                <i className="bi bi-tools d-block fs-5 mb-1"></i>
                Manutenções
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/visitas")
                }
              >
                <i className="bi bi-calendar-check d-block fs-5 mb-1"></i>
                Visitas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/comunicacao")
                }
              >
                <i className="bi bi-whatsapp d-block fs-5 mb-1"></i>
                Comunicação
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/relatorios")
                }
              >
                <i className="bi bi-file-earmark-bar-graph d-block fs-5 mb-1"></i>
                Relatórios
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/configuracoes")
                }
              >
                <i className="bi bi-gear d-block fs-5 mb-1"></i>
                Configurações
              </button>
            </div>

          </div>

        </div>

      </div>
 
      {/* =====================================
          LISTA DE IMÓVEIS
      ===================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <small className="text-muted">
                Consulte, pesquise, edite ou exclua imóveis
              </small>

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


          {/* FILTROS */}

          <div className="row g-3 mb-4">

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

              </div>

            </div>


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
                  Todos
                </option>

                <option value="disponivel">
                  Disponíveis
                </option>

                <option value="alugado">
                  Alugados
                </option>

                <option value="manutencao">
                  Manutenção
                </option>

              </select>

            </div>

          </div>


          {/* RESULTADO */}

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <small className="text-muted">

              <i className="bi bi-house me-1"></i>

              {imoveisFiltrados.length} imóvel(is) encontrado(s)

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

                <i className="bi bi-x-circle me-1"></i>

                Limpar filtros

              </button>

            )}

          </div>
          {/* TABELA */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Imóvel</th>
                  <th>Tipo</th>
                  <th>Finalidade</th>
                  <th>Localização</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Carregando...
                        </span>
                      </div>

                      <div className="text-muted mt-2">
                        Carregando imóveis...
                      </div>
                    </td>
                  </tr>
                ) : imoveisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <i className="bi bi-house-x fs-1 text-muted"></i>

                      <div className="fw-semibold mt-2">
                        Nenhum imóvel encontrado
                      </div>

                      <small className="text-muted">
                        {busca || filtroStatus !== "todos"
                          ? "Tente alterar os filtros utilizados."
                          : "Cadastre o primeiro imóvel para começar."}
                      </small>
                    </td>
                  </tr>
                ) : (
                  imoveisFiltrados.map((imovel) => (
                    <tr key={imovel.id}>
                      {/* IMÓVEL */}
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

                      {/* TIPO */}
                      <td>
                        <span className="text-muted">
                          {imovel.tipo || "-"}
                        </span>
                      </td>

                      {/* FINALIDADE */}
                      <td>
                        <span className="text-muted">
                          {imovel.finalidade || "-"}
                        </span>
                      </td>

                      {/* LOCALIZAÇÃO */}
                      <td>
                        <div>
                          {imovel.bairro || "-"}
                        </div>

                        <small className="text-muted">
                          {imovel.cidade || ""}
                          {imovel.estado
                            ? ` - ${imovel.estado}`
                            : ""}
                        </small>
                      </td>

                      {/* VALOR */}
                      <td>
                        <span className="fw-semibold">
                          {formatarMoeda(imovel.valor)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`badge ${obterStatusClass(
                            imovel.status
                          )}`}
                        >
                          {obterStatusLabel(imovel.status)}
                        </span>
                      </td>

                      {/* AÇÕES */}
                      <td className="text-end">
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
                              excluirImovel(imovel)
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
        </div>
      </div>
      {/* =====================================
          MODAL - NOVO / EDITAR IMÓVEL
      ===================================== */}

      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO */}
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    <i className="bi bi-house me-2"></i>
                    {editando
                      ? "Editar imóvel"
                      : "Novo imóvel"}
                  </h5>

                  <small className="text-muted">
                    {editando
                      ? "Atualize os dados do imóvel cadastrado"
                      : "Cadastre um novo imóvel no sistema"}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>
              </div>

              {/* CORPO */}
              <form onSubmit={salvarImovel}>
                <div className="modal-body">

                  {/* DADOS PRINCIPAIS */}
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
                          <i className="bi bi-house text-primary"></i>
                        </div>

                        <div>
                          <h6 className="fw-bold mb-0">
                            Dados principais
                          </h6>

                          <small className="text-muted">
                            Informações básicas do imóvel
                          </small>
                        </div>
                      </div>

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
                            placeholder="Ex.: Casa com 3 quartos"
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

                            <option value="Comercial">
                              Comercial
                            </option>

                            <option value="Chácara">
                              Chácara
                            </option>

                            <option value="Sítio">
                              Sítio
                            </option>

                            <option value="Sala">
                              Sala comercial
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
                              Aluguel e venda
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

                            <option value="reservado">
                              Reservado
                            </option>

                            <option value="vendido">
                              Vendido
                            </option>

                            <option value="indisponivel">
                              Indisponível
                            </option>
                          </select>
                        </div>

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
                        <div className="col-12 col-md-4">
                          <label className="form-label fw-semibold">
                            Quartos
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="Ex.: 3"
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
                            min="0"
                            className="form-control"
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
                            Vagas
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="Ex.: 2"
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
                            Área (m²)
                          </label>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            placeholder="Ex.: 120"
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
                            placeholder="Rua, avenida ou logradouro"
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
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            Complemento
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Apartamento, bloco, casa dos fundos..."
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
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            Bairro
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nome do bairro"
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
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            Cidade
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nome da cidade"
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
                        <div className="col-12 col-md-3">
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

                            <option value="AC">AC</option>
                            <option value="AL">AL</option>
                            <option value="AP">AP</option>
                            <option value="AM">AM</option>
                            <option value="BA">BA</option>
                            <option value="CE">CE</option>
                            <option value="DF">DF</option>
                            <option value="ES">ES</option>
                            <option value="GO">GO</option>
                            <option value="MA">MA</option>
                            <option value="MT">MT</option>
                            <option value="MS">MS</option>
                            <option value="MG">MG</option>
                            <option value="PA">PA</option>
                            <option value="PB">PB</option>
                            <option value="PR">PR</option>
                            <option value="PE">PE</option>
                            <option value="PI">PI</option>
                            <option value="RJ">RJ</option>
                            <option value="RN">RN</option>
                            <option value="RS">RS</option>
                            <option value="RO">RO</option>
                            <option value="RR">RR</option>
                            <option value="SC">SC</option>
                            <option value="SP">SP</option>
                            <option value="SE">SE</option>
                            <option value="TO">TO</option>
                          </select>
                        </div>

                        {/* CEP */}
                        <div className="col-12 col-md-3">
                          <label className="form-label fw-semibold">
                            CEP
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="00000-000"
                            maxLength="9"
                            value={form.cep}
                            onChange={(e) =>
                              alterarCampo(
                                "cep",
                                e.target.value
                              )
                            }
                          />
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* DESCRIÇÃO E OBSERVAÇÕES */}
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
                            Detalhes adicionais sobre o imóvel
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
                            placeholder="Descreva as características, ambientes, localização e demais informações do imóvel..."
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
                  {/* RODAPÉ DO MODAL */}
                </div>

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
                          ? "Salvar alterações"
                          : "Salvar imóvel"}
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