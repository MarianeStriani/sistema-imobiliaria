"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"
import LogoutButton from "../components/LogoutButton"

export default function Contratos() {
  // ========================================
  // DADOS
  // ========================================

  const [contratos, setContratos] = useState([])
  const [clientes, setClientes] = useState([])
  const [imoveis, setImoveis] = useState([])

  // ========================================
  // CONTROLE
  // ========================================

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  // ========================================
  // BUSCA E FILTROS
  // ========================================

  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  // ========================================
  // MODAL
  // ========================================

  const [modalAberto, setModalAberto] = useState(false)

  const [modoEdicao, setModoEdicao] = useState(false)

  const [contratoSelecionado, setContratoSelecionado] =
    useState(null)

  // ========================================
  // FORMULÁRIO
  // ========================================

  const formularioInicial = {
    numero: "",
    cliente: "",
    imovel: "",
    tipo: "Aluguel",
    status: "ativo",
    data_inicio: "",
    data_fim: "",
    valor: "",
  }

  const [formulario, setFormulario] =
    useState(formularioInicial)

  // ========================================
  // CARREGAR DADOS
  // ========================================

  async function carregarDados() {
    try {
      setLoading(true)
      setErro("")

      const [
        contratosResult,
        clientesResult,
        imoveisResult,
      ] = await Promise.all([
        supabase
          .from("contratos")
          .select("*")
          .order("created_at", {
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
          .order("created_at", {
            ascending: false,
          }),
      ])

      if (contratosResult.error) {
        throw contratosResult.error
      }

      if (clientesResult.error) {
        throw clientesResult.error
      }

      if (imoveisResult.error) {
        throw imoveisResult.error
      }

      setContratos(
        contratosResult.data || []
      )

      setClientes(
        clientesResult.data || []
      )

      setImoveis(
        imoveisResult.data || []
      )
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

  // ========================================
  // MENSAGENS
  // ========================================

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  function acessarPagina(url) {
    window.location.href = url
  }

  // ========================================
  // FORMATAÇÃO
  // ========================================

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

  function formatarData(data) {
    if (!data) {
      return "-"
    }

    const partes = String(data).split("-")

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }

    return data
  }

  // ========================================
  // NOMES RELACIONADOS
  // ========================================

  function obterNomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) =>
        String(item.id) === String(clienteId)
    )

    return (
      cliente?.nome ||
      "Cliente não encontrado"
    )
  }

  function obterNomeImovel(imovelId) {
    const imovel = imoveis.find(
      (item) =>
        String(item.id) === String(imovelId)
    )

    return (
      imovel?.titulo ||
      imovel?.nome ||
      "Imóvel não encontrado"
    )
  }

  // ========================================
  // ALTERAR FORMULÁRIO
  // ========================================

  function alterarFormulario(
    campo,
    valor
  ) {
    setFormulario(
      (anterior) => ({
        ...anterior,
        [campo]: valor,
      })
    )
  }

  // ========================================
  // ABRIR NOVO CONTRATO
  // ========================================

  function abrirNovoContrato() {
    limparMensagens()

    setModoEdicao(false)

    setContratoSelecionado(null)

    setFormulario(
      formularioInicial
    )

    setModalAberto(true)
  }

  // ========================================
  // ABRIR EDIÇÃO
  // ========================================

  function abrirEdicao(contrato) {
    limparMensagens()

    setModoEdicao(true)

    setContratoSelecionado(
      contrato
    )

    setFormulario({
      numero:
        contrato.numero || "",

      cliente:
        contrato.cliente || "",

      imovel:
        contrato.imovel || "",

      tipo:
        contrato.tipo || "Aluguel",

      status:
        contrato.status || "ativo",

      data_inicio:
        contrato.data_inicio || "",

      data_fim:
        contrato.data_fim || "",

      valor:
        contrato.valor ?? "",
    })

    setModalAberto(true)
  }

  // ========================================
  // FECHAR MODAL
  // ========================================

  function fecharModal() {
    if (salvando) {
      return
    }

    setModalAberto(false)

    setModoEdicao(false)

    setContratoSelecionado(null)

    setFormulario(
      formularioInicial
    )
  }

  // ========================================
  // SALVAR CONTRATO
  // ========================================

  async function salvarContrato() {
    try {
      setSalvando(true)
      limparMensagens()

      if (!formulario.numero) {
        setErro(
          "Informe o número do contrato."
        )
        return
      }

      if (!formulario.cliente) {
        setErro(
          "Selecione um cliente."
        )
        return
      }

      if (!formulario.imovel) {
        setErro(
          "Selecione um imóvel."
        )
        return
      }

      if (!formulario.data_inicio) {
        setErro(
          "Informe a data de início."
        )
        return
      }

      if (!formulario.valor) {
        setErro(
          "Informe o valor do contrato."
        )
        return
      }

      const dados = {
        numero: formulario.numero,
        cliente: formulario.cliente,
        imovel: formulario.imovel,
        tipo: formulario.tipo,
        status: formulario.status,
        data_inicio:
          formulario.data_inicio,
        data_fim:
          formulario.data_fim || null,
        valor:
          Number(formulario.valor),
      }

      let resultado

      if (
        modoEdicao &&
        contratoSelecionado
      ) {
        resultado = await supabase
          .from("contratos")
          .update(dados)
          .eq(
            "id",
            contratoSelecionado.id
          )
      } else {
        resultado = await supabase
          .from("contratos")
          .insert([dados])
      }

      if (resultado.error) {
        throw resultado.error
      }

      setSucesso(
        modoEdicao
          ? "Contrato atualizado com sucesso."
          : "Contrato cadastrado com sucesso."
      )

      fecharModal()

      await carregarDados()
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
  // ========================================
  // EXCLUIR CONTRATO
  // ========================================

  async function excluirContrato(contrato) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o contrato ${contrato.numero || ""}?`
    )

    if (!confirmar) {
      return
    }

    try {
      limparMensagens()

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

  // ========================================
  // STATUS
  // ========================================

  function obterTextoStatus(status) {
    switch (status) {
      case "ativo":
        return "Ativo"

      case "encerrado":
        return "Encerrado"

      case "vencido":
        return "Vencido"

      case "cancelado":
        return "Cancelado"

      default:
        return status || "-"
    }
  }

  function obterClasseStatus(status) {
    switch (status) {
      case "ativo":
        return "bg-success"

      case "encerrado":
        return "bg-secondary"

      case "vencido":
        return "bg-warning text-dark"

      case "cancelado":
        return "bg-danger"

      default:
        return "bg-secondary"
    }
  }

  // ========================================
  // VERIFICAR VENCIMENTO
  // ========================================

  function contratoEstaVencendo(contrato) {
    if (!contrato.data_fim) {
      return false
    }

    if (
      contrato.status !== "ativo"
    ) {
      return false
    }

    const hoje = new Date()

    hoje.setHours(
      0,
      0,
      0,
      0
    )

    const fim = new Date(
      `${contrato.data_fim}T00:00:00`
    )

    const diferenca =
      fim.getTime() -
      hoje.getTime()

    const dias =
      diferenca /
      (1000 * 60 * 60 * 24)

    return (
      dias >= 0 &&
      dias <= 30
    )
  }

  // ========================================
  // INDICADORES
  // ========================================

  const totalContratos =
    contratos.length

  const contratosAtivos =
    contratos.filter(
      (contrato) =>
        contrato.status === "ativo"
    ).length

  const contratosEncerrados =
    contratos.filter(
      (contrato) =>
        contrato.status === "encerrado"
    ).length

  const contratosVencendo =
    contratos.filter(
      (contrato) =>
        contratoEstaVencendo(
          contrato
        )
    ).length

  // ========================================
  // FILTRAGEM
  // ========================================

  const contratosFiltrados =
    useMemo(() => {
      const texto =
        busca
          .trim()
          .toLowerCase()

      return contratos.filter(
        (contrato) => {
          const nomeCliente =
            obterNomeCliente(
              contrato.cliente
            )

          const nomeImovel =
            obterNomeImovel(
              contrato.imovel
            )

          const correspondeBusca =
            !texto ||
            String(
              contrato.numero || ""
            )
              .toLowerCase()
              .includes(texto) ||
            String(
              nomeCliente || ""
            )
              .toLowerCase()
              .includes(texto) ||
            String(
              nomeImovel || ""
            )
              .toLowerCase()
              .includes(texto)

          const correspondeStatus =
            filtroStatus === "todos" ||
            contrato.status ===
              filtroStatus

          return (
            correspondeBusca &&
            correspondeStatus
          )
        }
      )
    }, [
      contratos,
      busca,
      filtroStatus,
      clientes,
      imoveis,
    ])

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

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
            <LogoutButton/>
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
                className="btn btn-primary w-100 py-2"
                onClick={() => acessarPagina("/clientes")}
              >
                <i className="bi bi-people d-block fs-5 mb-1"></i>
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                className="btn btn-outline-primary w-100 py-2"
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

          </div>
        </div>
      </div>
      {/* ==================================
          CABEÇALHO
      ================================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">
            Contratos
          </h1>

          <p className="text-muted mb-0">
            Gerencie os contratos da imobiliária
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={carregarDados}
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

      {/* ==================================
          ALERTA DE ERRO
      ================================== */}

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
            aria-label="Fechar"
          ></button>
        </div>
      )}

      {/* ==================================
          ALERTA DE SUCESSO
      ================================== */}

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
            aria-label="Fechar"
          ></button>
        </div>
      )}

      
      {/* ==================================
          CARDS DE RESUMO
      ================================== */}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">
                    Total
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalContratos}
                  </h3>
                </div>

                <div className="text-primary fs-3">
                  <i className="bi bi-file-earmark-text"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">
                    Ativos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {contratosAtivos}
                  </h3>
                </div>

                <div className="text-success fs-3">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
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

                <div className="text-secondary fs-3">
                  <i className="bi bi-archive"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
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

                <div className="text-warning fs-3">
                  <i className="bi bi-calendar-event"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ==================================
          FILTROS
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-funnel me-2"></i>
              Filtros
            </h5>

            {(busca || filtroStatus !== "todos") && (
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

          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <label
                htmlFor="buscaContrato"
                className="form-label fw-semibold"
              >
                Buscar
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  id="buscaContrato"
                  type="text"
                  className="form-control"
                  placeholder="Número, cliente ou imóvel..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <label
                htmlFor="filtroStatus"
                className="form-label fw-semibold"
              >
                Status
              </label>

              <select
                id="filtroStatus"
                className="form-select"
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value)
                }
              >
                <option value="todos">
                  Todos
                </option>

                <option value="ativo">
                  Ativos
                </option>

                <option value="encerrado">
                  Encerrados
                </option>

                <option value="vencido">
                  Vencidos
                </option>

                <option value="cancelado">
                  Cancelados
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================
          TABELA
      ================================== */}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="fw-bold mb-1">
                  Contratos cadastrados
                </h5>

                <p className="text-muted mb-0 small">
                  {contratosFiltrados.length}{" "}
                  contrato
                  {contratosFiltrados.length !== 1
                    ? "s"
                    : ""}{" "}
                  encontrado
                  {contratosFiltrados.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

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
            <div className="text-center py-5 px-3">
              <div className="fs-1 text-muted mb-3">
                <i className="bi bi-file-earmark-x"></i>
              </div>

              <h5 className="fw-bold">
                Nenhum contrato encontrado
              </h5>

              <p className="text-muted mb-3">
                {busca || filtroStatus !== "todos"
                  ? "Tente alterar os filtros utilizados."
                  : "Cadastre o primeiro contrato para começar."}
              </p>

              {!busca &&
                filtroStatus === "todos" && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={abrirNovoContrato}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Novo contrato
                  </button>
                )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3">
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

                    <th className="text-end px-3">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {contratosFiltrados.map(
                    (contrato) => (
                      <tr key={contrato.id}>
                        <td className="px-3">
                          <span className="fw-semibold">
                            {contrato.numero || "-"}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                              style={{
                                width: "36px",
                                height: "36px",
                                minWidth: "36px",
                              }}
                            >
                              <i className="bi bi-person"></i>
                            </div>

                            <span>
                              {obterNomeCliente(
                                contrato.cliente
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-house text-primary"></i>

                            <span>
                              {obterNomeImovel(
                                contrato.imovel
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          {contrato.tipo || "-"}
                        </td>

                        <td>
                          <div className="small">
                            <div>
                              <span className="text-muted">
                                Início:
                              </span>{" "}
                              {formatarData(
                                contrato.data_inicio
                              )}
                            </div>

                            <div>
                              <span className="text-muted">
                                Fim:
                              </span>{" "}
                              {formatarData(
                                contrato.data_fim
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {formatarMoeda(
                              contrato.valor
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${obterClasseStatus(
                              contrato.status
                            )}`}
                          >
                            {obterTextoStatus(
                              contrato.status
                            )}
                          </span>

                          {contratoEstaVencendo(
                            contrato
                          ) && (
                            <div className="small text-warning mt-1">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              Vence em breve
                            </div>
                          )}
                        </td>

                        <td className="text-end px-3">
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Editar contrato"
                              onClick={() =>
                                abrirEdicao(
                                  contrato
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                                Editar
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
                                Excluir
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

      {/* ==================================
          MODAL DE CONTRATO
      ================================== */}

      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-file-earmark-text me-2"></i>

                  {modoEdicao
                    ? "Editar contrato"
                    : "Novo contrato"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                  aria-label="Fechar"
                ></button>
              </div>

              <div className="modal-body">
                {erro && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {erro}
                  </div>
                )}

                <div className="row g-3">
                  {/* NÚMERO */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="numero"
                      className="form-label fw-semibold"
                    >
                      Nº do contrato
                    </label>

                    <input
                      id="numero"
                      type="text"
                      className="form-control"
                      value={formulario.numero}
                      onChange={(e) =>
                        alterarFormulario(
                          "numero",
                          e.target.value
                        )
                      }
                      placeholder="Ex.: CT-001"
                      disabled={salvando}
                    />
                  </div>

                  {/* TIPO */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="tipo"
                      className="form-label fw-semibold"
                    >
                      Tipo
                    </label>

                    <select
                      id="tipo"
                      className="form-select"
                      value={formulario.tipo}
                      onChange={(e) =>
                        alterarFormulario(
                          "tipo",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    >
                      <option value="Aluguel">
                        Aluguel
                      </option>

                      <option value="Venda">
                        Venda
                      </option>

                      <option value="Temporada">
                        Temporada
                      </option>
                    </select>
                  </div>

                  {/* CLIENTE */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="cliente"
                      className="form-label fw-semibold"
                    >
                      Cliente
                    </label>

                    <select
                      id="cliente"
                      className="form-select"
                      value={formulario.cliente}
                      onChange={(e) =>
                        alterarFormulario(
                          "cliente",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    >
                      <option value="">
                        Selecione o cliente
                      </option>

                      {clientes.map(
                        (cliente) => (
                          <option
                            key={cliente.id}
                            value={cliente.id}
                          >
                            {cliente.nome}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* IMÓVEL */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="imovel"
                      className="form-label fw-semibold"
                    >
                      Imóvel
                    </label>

                    <select
                      id="imovel"
                      className="form-select"
                      value={formulario.imovel}
                      onChange={(e) =>
                        alterarFormulario(
                          "imovel",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    >
                      <option value="">
                        Selecione o imóvel
                      </option>

                      {imoveis.map(
                        (imovel) => (
                          <option
                            key={imovel.id}
                            value={imovel.id}
                          >
                            {imovel.titulo ||
                              imovel.nome ||
                              `Imóvel ${imovel.id}`}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  {/* STATUS */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="status"
                      className="form-label fw-semibold"
                    >
                      Status
                    </label>

                    <select
                      id="status"
                      className="form-select"
                      value={formulario.status}
                      onChange={(e) =>
                        alterarFormulario(
                          "status",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    >
                      <option value="ativo">
                        Ativo
                      </option>

                      <option value="encerrado">
                        Encerrado
                      </option>

                      <option value="vencido">
                        Vencido
                      </option>

                      <option value="cancelado">
                        Cancelado
                      </option>
                    </select>
                  </div>

                  {/* DATA DE INÍCIO */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="data_inicio"
                      className="form-label fw-semibold"
                    >
                      Data de início
                    </label>

                    <input
                      id="data_inicio"
                      type="date"
                      className="form-control"
                      value={
                        formulario.data_inicio
                      }
                      onChange={(e) =>
                        alterarFormulario(
                          "data_inicio",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    />
                  </div>

                  {/* DATA DE FIM */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="data_fim"
                      className="form-label fw-semibold"
                    >
                      Data de fim
                    </label>

                    <input
                      id="data_fim"
                      type="date"
                      className="form-control"
                      value={
                        formulario.data_fim
                      }
                      onChange={(e) =>
                        alterarFormulario(
                          "data_fim",
                          e.target.value
                        )
                      }
                      disabled={salvando}
                    />

                    <div className="form-text">
                      Deixe em branco caso não tenha
                      data de encerramento definida.
                    </div>
                  </div>

                  {/* VALOR */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="valor"
                      className="form-label fw-semibold"
                    >
                      Valor
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        R$
                      </span>

                      <input
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={
                          formulario.valor
                        }
                        onChange={(e) =>
                          alterarFormulario(
                            "valor",
                            e.target.value
                          )
                        }
                        placeholder="0,00"
                        disabled={salvando}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================
                  RODAPÉ DO MODAL
              ================================== */}

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
                        aria-hidden="true"
                      ></span>

                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>

                      {modoEdicao
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
    </div>
  )
}
