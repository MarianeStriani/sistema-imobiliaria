"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Contratos() {
  const [contratos, setContratos] = useState([])
  const [clientes, setClientes] = useState([])
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
    cliente_id: "",
    imovel_id: "",
    data_inicio: "",
    data_fim: "",
    valor_aluguel: "",
    dia_vencimento: "",
    valor_caucao: "",
    status: "ativo",
    observacoes: "",
  })

  async function carregarDados() {
    setLoading(true)
    setErro("")

    try {
      const [
        contratosResponse,
        clientesResponse,
        imoveisResponse,
      ] = await Promise.all([
        supabase
          .from("contratos")
          .select("*")
          .order("data_inicio", {
            ascending: false,
          }),

        supabase
          .from("clientes")
          .select("*")
          .order("nome", {
            ascending: true,
          }),

        supabase
          .from("imoveis")
          .select("*")
          .order("id", {
            ascending: false,
          }),
      ])

      if (contratosResponse.error) {
        throw contratosResponse.error
      }

      if (clientesResponse.error) {
        throw clientesResponse.error
      }

      if (imoveisResponse.error) {
        throw imoveisResponse.error
      }

      setContratos(contratosResponse.data || [])
      setClientes(clientesResponse.data || [])
      setImoveis(imoveisResponse.data || [])
    } catch (error) {
      console.error(
        "Erro ao carregar contratos:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar os contratos."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  function acessarPagina(url) {
    window.location.href = url
  }

  function abrirNovoContrato() {
    limparMensagens()

    setEditando(null)

    setForm({
      cliente_id: "",
      imovel_id: "",
      data_inicio: "",
      data_fim: "",
      valor_aluguel: "",
      dia_vencimento: "",
      valor_caucao: "",
      status: "ativo",
      observacoes: "",
    })

    setModalAberto(true)
  }

  function abrirEditarContrato(contrato) {
    limparMensagens()

    setEditando(contrato)

    setForm({
      cliente_id: contrato.cliente_id || "",
      imovel_id: contrato.imovel_id || "",
      data_inicio: contrato.data_inicio || "",
      data_fim: contrato.data_fim || "",
      valor_aluguel:
        contrato.valor_aluguel ?? "",
      dia_vencimento:
        contrato.dia_vencimento ?? "",
      valor_caucao:
        contrato.valor_caucao ?? "",
      status: contrato.status || "ativo",
      observacoes:
        contrato.observacoes || "",
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

  const contratosFiltrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase()

    return contratos.filter((contrato) => {
      const cliente = clientes.find(
        (item) =>
          String(item.id) ===
          String(contrato.cliente_id)
      )

      const imovel = imoveis.find(
        (item) =>
          String(item.id) ===
          String(contrato.imovel_id)
      )

      const nomeCliente = String(
        cliente?.nome || ""
      ).toLowerCase()

      const identificacaoImovel =
        String(
          imovel?.nome ||
            imovel?.titulo ||
            imovel?.endereco ||
            imovel?.codigo ||
            ""
        ).toLowerCase()

      const status = String(
        contrato.status || ""
      ).toLowerCase()

      const correspondeBusca =
        !termo ||
        nomeCliente.includes(termo) ||
        identificacaoImovel.includes(termo) ||
        status.includes(termo)

      const correspondeStatus =
        filtroStatus === "todos" ||
        status === filtroStatus

      return (
        correspondeBusca &&
        correspondeStatus
      )
    })
  }, [
    contratos,
    clientes,
    imoveis,
    busca,
    filtroStatus,
  ])
  async function salvarContrato(e) {
    e.preventDefault()

    limparMensagens()

    if (!form.cliente_id) {
      setErro("Selecione o cliente.")
      return
    }

    if (!form.imovel_id) {
      setErro("Selecione o imóvel.")
      return
    }

    if (!form.data_inicio) {
      setErro("Informe a data de início do contrato.")
      return
    }

    if (!form.valor_aluguel) {
      setErro("Informe o valor do aluguel.")
      return
    }

    setSalvando(true)

    try {
      const dados = {
        cliente_id: form.cliente_id,
        imovel_id: form.imovel_id,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        valor_aluguel:
          form.valor_aluguel === ""
            ? null
            : Number(form.valor_aluguel),
        dia_vencimento:
          form.dia_vencimento === ""
            ? null
            : Number(form.dia_vencimento),
        valor_caucao:
          form.valor_caucao === ""
            ? null
            : Number(form.valor_caucao),
        status: form.status,
        observacoes:
          form.observacoes.trim(),
      }

      if (editando?.id) {
        const { error } = await supabase
          .from("contratos")
          .update(dados)
          .eq("id", editando.id)

        if (error) {
          throw error
        }

        setSucesso(
          "Contrato atualizado com sucesso."
        )
      } else {
        const { error } = await supabase
          .from("contratos")
          .insert([dados])

        if (error) {
          throw error
        }

        setSucesso(
          "Contrato cadastrado com sucesso."
        )
      }

      await carregarDados()

      setModalAberto(false)
      setEditando(null)

      setForm({
        cliente_id: "",
        imovel_id: "",
        data_inicio: "",
        data_fim: "",
        valor_aluguel: "",
        dia_vencimento: "",
        valor_caucao: "",
        status: "ativo",
        observacoes: "",
      })
    } catch (error) {
      console.error(
        "Erro ao salvar contrato:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível salvar o contrato."
      )
    } finally {
      setSalvando(false)
    }
  }

  async function excluirContrato(contrato) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este contrato?"
    )

    if (!confirmar) {
      return
    }

    limparMensagens()

    try {
      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", contrato.id)

      if (error) {
        throw error
      }

      setSucesso(
        "Contrato excluído com sucesso."
      )

      await carregarDados()
    } catch (error) {
      console.error(
        "Erro ao excluir contrato:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível excluir o contrato."
      )
    }
  }

  function formatarData(data) {
    if (!data) {
      return "-"
    }

    const partes = String(data).split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function formatarMoeda(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "-"
    }

    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  function obterCliente(id) {
    return clientes.find(
      (cliente) =>
        String(cliente.id) === String(id)
    )
  }

  function obterImovel(id) {
    return imoveis.find(
      (imovel) =>
        String(imovel.id) === String(id)
    )
  }

  function nomeCliente(id) {
    const cliente = obterCliente(id)

    return cliente?.nome || "Cliente não encontrado"
  }

  function nomeImovel(id) {
    const imovel = obterImovel(id)

    if (!imovel) {
      return "Imóvel não encontrado"
    }

    return (
      imovel.nome ||
      imovel.titulo ||
      imovel.codigo ||
      imovel.endereco ||
      `Imóvel #${imovel.id}`
    )
  }

  function classeStatus(status) {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "ativo":
        return "bg-success"

      case "encerrado":
        return "bg-secondary"

      case "vencendo":
        return "bg-warning text-dark"

      case "cancelado":
        return "bg-danger"

      default:
        return "bg-secondary"
    }
  }

  function textoStatus(status) {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "ativo":
        return "Ativo"

      case "encerrado":
        return "Encerrado"

      case "vencendo":
        return "Vencendo"

      case "cancelado":
        return "Cancelado"

      default:
        return status || "-"
    }
  }

  const totalContratos = contratos.length

  const contratosAtivos = contratos.filter(
    (contrato) =>
      String(contrato.status).toLowerCase() ===
      "ativo"
  ).length

  const contratosVencendo = contratos.filter(
    (contrato) =>
      String(contrato.status).toLowerCase() ===
      "vencendo"
  ).length

  const contratosEncerrados = contratos.filter(
    (contrato) =>
      String(contrato.status).toLowerCase() ===
      "encerrado"
  ).length

  return (
    <div className="container-fluid py-4">

      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Contratos
          </h2>

          <p className="text-muted mb-0">
            Gerencie os contratos de locação da imobiliária
          </p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">

          <button
            className="btn btn-outline-primary"
            onClick={carregarDados}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>

          <button
            className="btn btn-primary"
            onClick={abrirNovoContrato}
          >
            <i className="bi bi-file-earmark-plus me-2"></i>
            Novo contrato
          </button>

        </div>

      </div>

      {/* ERRO */}
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

      {/* SUCESSO */}
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
                className="btn btn-outline-primary w-100 py-2"
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
                className="btn btn-primary w-100 py-2"
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
      {/* RESUMO DOS CONTRATOS */}
      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Total de contratos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalContratos}
                  </h3>
                </div>

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-file-earmark-text text-primary fs-4"></i>
                </div>

              </div>

              <small className="text-muted d-block mt-3">
                Contratos cadastrados
              </small>

            </div>
          </div>
        </div>

        {/* ATIVOS */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Contratos ativos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosAtivos}
                  </h3>
                </div>

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>

              </div>

              <small className="text-muted d-block mt-3">
                Contratos em andamento
              </small>

            </div>
          </div>
        </div>

        {/* VENCENDO */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Vencendo
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosVencendo}
                  </h3>
                </div>

                <div
                  className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-exclamation-circle text-warning fs-4"></i>
                </div>

              </div>

              <small className="text-muted d-block mt-3">
                Contratos próximos do vencimento
              </small>

            </div>
          </div>
        </div>

        {/* ENCERRADOS */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Encerrados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosEncerrados}
                  </h3>
                </div>

                <div
                  className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-file-earmark-x text-secondary fs-4"></i>
                </div>

              </div>

              <small className="text-muted d-block mt-3">
                Contratos finalizados
              </small>

            </div>
          </div>
        </div>

      </div>

      {/* LISTA DE CONTRATOS */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          {/* CABEÇALHO */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                Contratos cadastrados
              </h5>

              <small className="text-muted">
                Consulte, edite ou exclua contratos
              </small>
            </div>

            <button
              className="btn btn-primary mt-3 mt-md-0"
              onClick={abrirNovoContrato}
            >
              <i className="bi bi-file-earmark-plus me-2"></i>
              Novo contrato
            </button>

          </div>

          {/* BUSCA E FILTROS */}
          <div className="row g-2 mb-4">

            <div className="col-12 col-lg-7">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por cliente, imóvel ou status..."
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

            <div className="col-12 col-md-6 col-lg-3">

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

                <option value="ativo">
                  Ativos
                </option>

                <option value="vencendo">
                  Vencendo
                </option>

                <option value="encerrado">
                  Encerrados
                </option>

                <option value="cancelado">
                  Cancelados
                </option>
              </select>

            </div>

            <div className="col-12 col-md-6 col-lg-2">

              <button
                className="btn btn-outline-primary w-100"
                onClick={carregarDados}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar
              </button>

            </div>

          </div>

          {/* RESULTADOS */}
          <div className="d-flex justify-content-between align-items-center mb-3">

            <small className="text-muted">
              Exibindo{" "}
              <strong>
                {contratosFiltrados.length}
              </strong>{" "}
              de{" "}
              <strong>
                {contratos.length}
              </strong>{" "}
              contratos
            </small>

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
                Carregando contratos...
              </p>

            </div>

          ) : contratosFiltrados.length === 0 ? (

            /* SEM RESULTADOS */
            <div className="text-center py-5">

              <div
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto"
                style={{
                  width: "70px",
                  height: "70px",
                }}
              >
                <i className="bi bi-file-earmark-text text-primary fs-2"></i>
              </div>

              <h5 className="fw-bold mt-3">
                Nenhum contrato encontrado
              </h5>

              <p className="text-muted mb-3">
                {busca || filtroStatus !== "todos"
                  ? "Tente alterar os filtros utilizados."
                  : "Comece cadastrando o primeiro contrato."}
              </p>

              {!busca &&
                filtroStatus === "todos" && (
                  <button
                    className="btn btn-primary"
                    onClick={abrirNovoContrato}
                  >
                    <i className="bi bi-file-earmark-plus me-2"></i>
                    Cadastrar contrato
                  </button>
                )}

            </div>

          ) : (

            /* TABELA */
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Imóvel
                    </th>

                    <th>
                      Período
                    </th>

                    <th>
                      Aluguel
                    </th>

                    <th>
                      Vencimento
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

                  {contratosFiltrados.map(
                    (contrato) => (
                      <tr key={contrato.id}>

                        {/* CLIENTE */}
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
                                {nomeCliente(
                                  contrato.cliente_id
                                )}
                              </div>

                              {obterCliente(
                                contrato.cliente_id
                              )?.telefone && (
                                <small className="text-muted">
                                  {
                                    obterCliente(
                                      contrato.cliente_id
                                    )?.telefone
                                  }
                                </small>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* IMÓVEL */}
                        <td>

                          <div className="d-flex align-items-center">

                            <i className="bi bi-house-door text-primary me-2"></i>

                            <span>
                              {nomeImovel(
                                contrato.imovel_id
                              )}
                            </span>

                          </div>

                        </td>

                        {/* PERÍODO */}
                        <td>

                          <div>
                            <small className="text-muted">
                              Início
                            </small>

                            <div className="fw-semibold">
                              {formatarData(
                                contrato.data_inicio
                              )}
                            </div>
                          </div>

                          {contrato.data_fim && (
                            <div className="mt-1">

                              <small className="text-muted">
                                Fim
                              </small>

                              <div>
                                {formatarData(
                                  contrato.data_fim
                                )}
                              </div>

                            </div>
                          )}

                        </td>

                        {/* ALUGUEL */}
                        <td>

                          <span className="fw-semibold">
                            {formatarMoeda(
                              contrato.valor_aluguel
                            )}
                          </span>

                        </td>

                        {/* VENCIMENTO */}
                        <td>

                          {contrato.dia_vencimento ? (
                            <span>
                              Dia{" "}
                              <strong>
                                {contrato.dia_vencimento}
                              </strong>
                            </span>
                          ) : (
                            "-"
                          )}

                        </td>

                        {/* STATUS */}
                        <td>

                          <span
                            className={`badge ${classeStatus(
                              contrato.status
                            )}`}
                          >
                            {textoStatus(
                              contrato.status
                            )}
                          </span>

                        </td>

                        {/* AÇÕES */}
                        <td className="text-end">

                          <div className="btn-group">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Editar contrato"
                              onClick={() =>
                                abrirEditarContrato(
                                  contrato
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir contrato"
                              onClick={() =>
                                excluirContrato(
                                  contrato
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
      {/* MODAL - NOVO / EDITAR CONTRATO */}
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

              {/* CABEÇALHO */}
              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold">
                    {editando
                      ? "Editar contrato"
                      : "Novo contrato"}
                  </h5>

                  <small className="text-muted">
                    {editando
                      ? "Atualize os dados do contrato"
                      : "Cadastre um novo contrato de locação"}
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
              <form onSubmit={salvarContrato}>

                <div className="modal-body">

                  {/* CLIENTE E IMÓVEL */}
                  <div className="mb-4">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-file-earmark-text text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Dados do contrato
                        </h6>

                        <small className="text-muted">
                          Cliente e imóvel relacionados ao contrato
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* CLIENTE */}
                      <div className="col-12 col-md-6">

                        <label className="form-label fw-semibold">
                          Cliente
                          <span className="text-danger ms-1">
                            *
                          </span>
                        </label>

                        <select
                          className="form-select"
                          value={form.cliente_id}
                          onChange={(e) =>
                            alterarCampo(
                              "cliente_id",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Selecione o cliente
                          </option>

                          {clientes.map((cliente) => (
                            <option
                              key={cliente.id}
                              value={cliente.id}
                            >
                              {cliente.nome}
                            </option>
                          ))}
                        </select>

                      </div>

                      {/* IMÓVEL */}
                      <div className="col-12 col-md-6">

                        <label className="form-label fw-semibold">
                          Imóvel
                          <span className="text-danger ms-1">
                            *
                          </span>
                        </label>

                        <select
                          className="form-select"
                          value={form.imovel_id}
                          onChange={(e) =>
                            alterarCampo(
                              "imovel_id",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Selecione o imóvel
                          </option>

                          {imoveis.map((imovel) => (
                            <option
                              key={imovel.id}
                              value={imovel.id}
                            >
                              {imovel.nome ||
                                imovel.titulo ||
                                imovel.codigo ||
                                imovel.endereco ||
                                `Imóvel #${imovel.id}`}
                            </option>
                          ))}
                        </select>

                      </div>

                    </div>

                  </div>

                  <hr className="my-4" />

                  {/* PERÍODO */}
                  <div className="mb-4">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-calendar-range text-info"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Período do contrato
                        </h6>

                        <small className="text-muted">
                          Defina as datas de início e término
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* DATA INÍCIO */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Data de início
                          <span className="text-danger ms-1">
                            *
                          </span>
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={form.data_inicio}
                          onChange={(e) =>
                            alterarCampo(
                              "data_inicio",
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>

                      {/* DATA FIM */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Data de término
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={form.data_fim}
                          onChange={(e) =>
                            alterarCampo(
                              "data_fim",
                              e.target.value
                            )
                          }
                        />

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
                          <option value="ativo">
                            Ativo
                          </option>

                          <option value="vencendo">
                            Vencendo
                          </option>

                          <option value="encerrado">
                            Encerrado
                          </option>

                          <option value="cancelado">
                            Cancelado
                          </option>
                        </select>

                      </div>

                    </div>

                  </div>

                  <hr className="my-4" />

                  {/* VALORES */}
                  <div className="mb-4">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-cash-coin text-success"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Valores financeiros
                        </h6>

                        <small className="text-muted">
                          Informações financeiras da locação
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* ALUGUEL */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Valor do aluguel
                          <span className="text-danger ms-1">
                            *
                          </span>
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
                            value={form.valor_aluguel}
                            onChange={(e) =>
                              alterarCampo(
                                "valor_aluguel",
                                e.target.value
                              )
                            }
                            required
                          />

                        </div>

                      </div>

                      {/* VENCIMENTO */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Dia de vencimento
                        </label>

                        <select
                          className="form-select"
                          value={form.dia_vencimento}
                          onChange={(e) =>
                            alterarCampo(
                              "dia_vencimento",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Selecione
                          </option>

                          {Array.from(
                            { length: 31 },
                            (_, index) =>
                              index + 1
                          ).map((dia) => (
                            <option
                              key={dia}
                              value={dia}
                            >
                              Dia {dia}
                            </option>
                          ))}
                        </select>

                      </div>

                      {/* CAUÇÃO */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Valor da caução
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
                            value={form.valor_caucao}
                            onChange={(e) =>
                              alterarCampo(
                                "valor_caucao",
                                e.target.value
                              )
                            }
                          />

                        </div>

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
                          Informações adicionais do contrato
                        </small>
                      </div>

                    </div>

                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Digite observações ou informações adicionais..."
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
                          : "Cadastrar contrato"}
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
            Gestão de contratos e locações
          </small>
        </div>

      </div>

    </div>
  )
}