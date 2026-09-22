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
    numero: "",
    cliente_id: "",
    imovel_id: "",
    tipo: "Aluguel",
    status: "ativo",
    data_inicio: "",
    data_fim: "",
    valor: "",
  })

  // ==========================================
  // CARREGAR CONTRATOS
  // ==========================================

  async function carregarContratos() {
    try {
      setLoading(true)
      setErro("")

      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false })

      if (error) {
        throw error
      }

      setContratos(data || [])
    } catch (error) {
      console.error("Erro ao carregar contratos:", error)
      setErro(
        error?.message ||
          "Não foi possível carregar os contratos."
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // CARREGAR CLIENTES
  // ==========================================

  async function carregarClientes() {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true })

      if (error) {
        throw error
      }

      setClientes(data || [])
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
      setErro(
        error?.message ||
          "Não foi possível carregar os clientes."
      )
    }
  }

  // ==========================================
  // CARREGAR IMÓVEIS
  // ==========================================

  async function carregarImoveis() {
    try {
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
    }
  }

  // ==========================================
  // CARREGAMENTO INICIAL
  // ==========================================

  useEffect(() => {
    async function carregarDados() {
      await Promise.all([
        carregarContratos(),
        carregarClientes(),
        carregarImoveis(),
      ])
    }

    carregarDados()
  }, [])

  // ==========================================
  // LIMPAR MENSAGENS
  // ==========================================

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  // ==========================================
  // NAVEGAÇÃO
  // ==========================================

  function acessarPagina(pagina) {
    window.location.href = pagina
  }

  // ==========================================
  // FORMULÁRIO INICIAL
  // ==========================================

  function formularioInicial() {
    return {
      numero: "",
      cliente_id: "",
      imovel_id: "",
      tipo: "Aluguel",
      status: "ativo",
      data_inicio: "",
      data_fim: "",
      valor: "",
    }
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
  // ABRIR NOVO CONTRATO
  // ==========================================

  function abrirNovoContrato() {
    limparMensagens()
    setEditando(null)
    setForm(formularioInicial())
    setModalAberto(true)
  }

  // ==========================================
  // ABRIR EDIÇÃO
  // ==========================================

  function abrirEditarContrato(contrato) {
    limparMensagens()

    setEditando(contrato)

    setForm({
      numero: contrato.numero || "",
      cliente_id: contrato.cliente_id || "",
      imovel_id: contrato.imovel_id || "",
      tipo: contrato.tipo || "Aluguel",
      status: contrato.status || "ativo",
      data_inicio: contrato.data_inicio || "",
      data_fim: contrato.data_fim || "",
      valor: contrato.valor ?? "",
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
    setForm(formularioInicial())
  }
  // ==========================================
  // SALVAR CONTRATO
  // ==========================================

  async function salvarContrato() {
    try {
      setSalvando(true)
      limparMensagens()

      if (!form.numero.trim()) {
        setErro("Informe o número do contrato.")
        return
      }

      if (!form.cliente_id) {
        setErro("Selecione um cliente.")
        return
      }

      if (!form.imovel_id) {
        setErro("Selecione um imóvel.")
        return
      }

      if (!form.data_inicio) {
        setErro("Informe a data de início.")
        return
      }

      if (!form.valor) {
        setErro("Informe o valor do contrato.")
        return
      }

      const dados = {
        numero: form.numero.trim(),
        cliente_id: form.cliente_id,
        imovel_id: form.imovel_id,
        tipo: form.tipo,
        status: form.status,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        valor: Number(form.valor),
      }

      if (editando) {
        const { error } = await supabase
          .from("contratos")
          .update(dados)
          .eq("id", editando.id)

        if (error) {
          throw error
        }

        setSucesso("Contrato atualizado com sucesso.")
      } else {
        const { error } = await supabase
          .from("contratos")
          .insert([dados])

        if (error) {
          throw error
        }

        setSucesso("Contrato cadastrado com sucesso.")
      }

      setModalAberto(false)
      setEditando(null)
      setForm(formularioInicial())

      await carregarContratos()
    } catch (error) {
      console.error("Erro ao salvar contrato:", error)

      setErro(
        error?.message ||
          "Não foi possível salvar o contrato."
      )
    } finally {
      setSalvando(false)
    }
  }

  // ==========================================
  // EXCLUIR CONTRATO
  // ==========================================

  async function excluirContrato(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este contrato?"
    )

    if (!confirmar) return

    try {
      limparMensagens()

      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      setSucesso("Contrato excluído com sucesso.")

      await carregarContratos()
    } catch (error) {
      console.error("Erro ao excluir contrato:", error)

      setErro(
        error?.message ||
          "Não foi possível excluir o contrato."
      )
    }
  }

  // ==========================================
  // BUSCA POR NOME
  // ==========================================

  function obterNomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) => String(item.id) === String(clienteId)
    )

    return cliente?.nome || "Cliente não encontrado"
  }

  // ==========================================
  // IMÓVEL
  // ==========================================

  function obterNomeImovel(imovelId) {
    const imovel = imoveis.find(
      (item) => String(item.id) === String(imovelId)
    )

    if (!imovel) {
      return "Imóvel não encontrado"
    }

    return (
      imovel.titulo ||
      imovel.endereco ||
      `Imóvel #${imovel.id}`
    )
  }

  // ==========================================
  // FILTROS
  // ==========================================

  const contratosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return contratos.filter((contrato) => {
      const nomeCliente = obterNomeCliente(
        contrato.cliente_id
      )

      const nomeImovel = obterNomeImovel(
        contrato.imovel_id
      )

      const correspondeBusca =
        !termo ||
        String(contrato.numero || "")
          .toLowerCase()
          .includes(termo) ||
        String(nomeCliente)
          .toLowerCase()
          .includes(termo) ||
        String(nomeImovel)
          .toLowerCase()
          .includes(termo) ||
        String(contrato.tipo || "")
          .toLowerCase()
          .includes(termo)

      const correspondeStatus =
        filtroStatus === "todos" ||
        String(contrato.status || "").toLowerCase() ===
          filtroStatus.toLowerCase()

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

  // ==========================================
  // RESUMO
  // ==========================================

  const totalContratos = contratos.length

  const contratosAtivos = contratos.filter(
    (contrato) =>
      String(contrato.status || "").toLowerCase() ===
      "ativo"
  ).length

  const contratosEncerrados = contratos.filter(
    (contrato) =>
      String(contrato.status || "").toLowerCase() ===
      "encerrado"
  ).length

  const contratosCancelados = contratos.filter(
    (contrato) =>
      String(contrato.status || "").toLowerCase() ===
      "cancelado"
  ).length

  // ==========================================
  // DATA FORMATADA
  // ==========================================

  function formatarData(data) {
    if (!data) return "-"

    const partes = String(data).split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  // ==========================================
  // VALOR FORMATADO
  // ==========================================

  function formatarValor(valor) {
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

  return (
    <div className="container-fluid py-4">

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
            </div>
          </div>

          <div className="row g-2">

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/")}
              >
                <i className="bi bi-speedometer2 d-block fs-5 mb-1"></i>
                Dashboard
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/clientes")}
              >
                <i className="bi bi-people d-block fs-5 mb-1"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/imoveis")}
              >
                <i className="bi bi-house-door d-block fs-5 mb-1"></i>
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-primary w-100 py-2"
                onClick={() => acessarPagina("/contratos")}
              >
                <i className="bi bi-file-earmark-text d-block fs-5 mb-1"></i>
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/recebimentos")}
              >
                <i className="bi bi-cash-coin d-block fs-5 mb-1"></i>
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/despesas")}
              >
                <i className="bi bi-wallet2 d-block fs-5 mb-1"></i>
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() => acessarPagina("/financeiro")}
              >
                <i className="bi bi-bar-chart-line d-block fs-5 mb-1"></i>
                Financeiro
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Contratos
          </h2>

          <p className="text-muted mb-0">
            Gerencie os contratos cadastrados no sistema.
          </p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={carregarContratos}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirNovoContrato}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Novo contrato
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
            onClick={() => setSucesso("")}
          ></button>
        </div>
      )}

      {/* RESUMO DOS CONTRATOS */}
      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <small className="text-muted">
                    Total de contratos
                  </small>

                  <h3 className="fw-bold mb-0 mt-1">
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
                  <i className="bi bi-file-earmark-text fs-4 text-primary"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ATIVOS */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <small className="text-muted">
                    Contratos ativos
                  </small>

                  <h3 className="fw-bold text-success mb-0 mt-1">
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
                  <i className="bi bi-check-circle fs-4 text-success"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ENCERRADOS */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <small className="text-muted">
                    Encerrados
                  </small>

                  <h3 className="fw-bold mb-0 mt-1">
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
                  <i className="bi bi-file-earmark-check fs-4 text-secondary"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* CANCELADOS */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <small className="text-muted">
                    Cancelados
                  </small>

                  <h3 className="fw-bold text-danger mb-0 mt-1">
                    {contratosCancelados}
                  </h3>
                </div>

                <div
                  className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-x-circle fs-4 text-danger"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
      {/* FILTROS */}
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
                Pesquise e filtre os contratos cadastrados.
              </small>
            </div>
          </div>

          <div className="row g-3">

            {/* BUSCA */}
            <div className="col-12 col-md-7">
              <label className="form-label fw-semibold">
                Buscar contrato
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Número, cliente, imóvel ou tipo..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />
              </div>
            </div>

            {/* STATUS */}
            <div className="col-12 col-md-5">
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

                <option value="ativo">
                  Ativo
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
      </div>

      {/* LISTA DE CONTRATOS */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Contratos cadastrados
              </h5>

              <small className="text-muted">
                {contratosFiltrados.length} contrato(s)
                encontrado(s)
              </small>
            </div>

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

            /* NENHUM CONTRATO */
            <div className="text-center py-5">

              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-file-earmark-x fs-3 text-muted"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum contrato encontrado
              </h6>

              <p className="text-muted mb-3">
                Não encontramos contratos com os filtros informados.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={abrirNovoContrato}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Cadastrar contrato
              </button>

            </div>
          ) : (

            /* TABELA */
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>

                    <th>
                      Nº contrato
                    </th>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Imóvel
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Período
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

                  {contratosFiltrados.map((contrato) => (

                    <tr key={contrato.id}>

                      {/* NÚMERO */}
                      <td>
                        <div className="d-flex align-items-center">

                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              minWidth: "40px",
                            }}
                          >
                            <i className="bi bi-file-earmark-text text-primary"></i>
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {contrato.numero || "-"}
                            </div>

                            <small className="text-muted">
                              Contrato
                            </small>
                          </div>

                        </div>
                      </td>

                      {/* CLIENTE */}
                      <td>
                        <div className="fw-semibold">
                          {obterNomeCliente(
                            contrato.cliente_id
                          )}
                        </div>
                      </td>

                      {/* IMÓVEL */}
                      <td>
                        <div className="fw-semibold">
                          {obterNomeImovel(
                            contrato.imovel_id
                          )}
                        </div>
                      </td>

                      {/* TIPO */}
                      <td>
                        {contrato.tipo || "-"}
                      </td>

                      {/* PERÍODO */}
                      <td>

                        <div>
                          <small className="text-muted">
                            Início
                          </small>
                        </div>

                        <div className="fw-semibold">
                          {formatarData(
                            contrato.data_inicio
                          )}
                        </div>

                        {contrato.data_fim && (
                          <>
                            <div className="mt-1">
                              <small className="text-muted">
                                Fim
                              </small>
                            </div>

                            <div>
                              {formatarData(
                                contrato.data_fim
                              )}
                            </div>
                          </>
                        )}

                      </td>

                      {/* VALOR */}
                      <td>
                        <span className="fw-semibold">
                          {formatarValor(
                            contrato.valor
                          )}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>

                        {String(
                          contrato.status || ""
                        ).toLowerCase() === "ativo" && (
                          <span className="badge bg-success-subtle text-success">
                            Ativo
                          </span>
                        )}

                        {String(
                          contrato.status || ""
                        ).toLowerCase() === "encerrado" && (
                          <span className="badge bg-secondary-subtle text-secondary">
                            Encerrado
                          </span>
                        )}

                        {String(
                          contrato.status || ""
                        ).toLowerCase() === "cancelado" && (
                          <span className="badge bg-danger-subtle text-danger">
                            Cancelado
                          </span>
                        )}

                        {![
                          "ativo",
                          "encerrado",
                          "cancelado",
                        ].includes(
                          String(
                            contrato.status || ""
                          ).toLowerCase()
                        ) && (
                          <span className="badge bg-secondary-subtle text-secondary">
                            {contrato.status || "Não informado"}
                          </span>
                        )}

                      </td>

                      {/* AÇÕES */}
                      <td>

                        <div className="d-flex justify-content-end gap-2">

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
                                contrato.id
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
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">

              {/* CABEÇALHO */}
              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {editando
                      ? "Editar contrato"
                      : "Novo contrato"}
                  </h5>

                  <small className="text-muted">
                    {editando
                      ? "Atualize os dados do contrato."
                      : "Preencha os dados para cadastrar um novo contrato."}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>

              </div>

              {/* CORPO */}
              <div className="modal-body">

                {/* DADOS DO CONTRATO */}
                <div className="card border-0 bg-light mb-4">
                  <div className="card-body">

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
                          Informe as principais informações do contrato.
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* NÚMERO */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Número do contrato
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
                          placeholder="Ex.: 001/2026"
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
                          <option value="Aluguel">
                            Aluguel
                          </option>

                          <option value="Venda">
                            Venda
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
                          <option value="ativo">
                            Ativo
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
                </div>

                {/* CLIENTE E IMÓVEL */}
                <div className="card border-0 bg-light mb-4">
                  <div className="card-body">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-people text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Cliente e imóvel
                        </h6>

                        <small className="text-muted">
                          Selecione as partes relacionadas ao contrato.
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* CLIENTE */}
                      <div className="col-12">

                        <label className="form-label fw-semibold">
                          Cliente
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
                              {cliente.cpf
                                ? ` - ${cliente.cpf}`
                                : ""}
                            </option>
                          ))}
                        </select>

                      </div>

                      {/* IMÓVEL */}
                      <div className="col-12">

                        <label className="form-label fw-semibold">
                          Imóvel
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
                              {imovel.titulo ||
                                imovel.endereco ||
                                `Imóvel #${imovel.id}`}
                            </option>
                          ))}
                        </select>

                      </div>

                    </div>

                  </div>
                </div>

                {/* PERÍODO E VALOR */}
                <div className="card border-0 bg-light">
                  <div className="card-body">

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-calendar3 text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Período e valor
                        </h6>

                        <small className="text-muted">
                          Informe a vigência e o valor do contrato.
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* DATA INÍCIO */}
                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Data de início
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
                          Data de fim
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
                            required
                          />

                        </div>

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
                  <i className="bi bi-x-lg me-2"></i>
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={salvarContrato}
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

            </div>
          </div>
        </div>
      )}
      {/* RODAPÉ */}
      <div className="text-center text-muted py-3">
        <small>ImobGest</small>
        <br />
        <small>
          Dashboard atualizado em{" "}
          {new Date().toLocaleDateString("pt-BR")}
        </small>
      </div>

    </div>
  )
}