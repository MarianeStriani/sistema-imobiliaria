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

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  const [form, setForm] = useState({
    cliente_id: "",
    imovel_id: "",
    tipo: "Aluguel",
    status: "ativo",
    data_inicio: "",
    data_fim: "",
    valor: "",
    dia_vencimento: "10",
    reajuste: "",
    observacoes: "",
  })

  // =========================================================
  // CARREGAR DADOS
  // =========================================================

  async function carregarDados() {
    setLoading(true)
    setErro("")

    try {
      const [
        contratosResult,
        clientesResult,
        imoveisResult,
      ] = await Promise.all([
        supabase
          .from("contratos")
          .select("*")
          .order("id", {
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

      if (contratosResult.error) {
        throw contratosResult.error
      }

      if (clientesResult.error) {
        throw clientesResult.error
      }

      if (imoveisResult.error) {
        throw imoveisResult.error
      }

      setContratos(contratosResult.data || [])
      setClientes(clientesResult.data || [])
      setImoveis(imoveisResult.data || [])
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

  // =========================================================
  // MENSAGENS
  // =========================================================

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  // =========================================================
  // NAVEGAÇÃO
  // =========================================================

  function acessarPagina(url) {
    window.location.href = url
  }

  // =========================================================
  // FORMULÁRIO
  // =========================================================

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function formularioInicial() {
    return {
      cliente_id: "",
      imovel_id: "",
      tipo: "Aluguel",
      status: "ativo",
      data_inicio: "",
      data_fim: "",
      valor: "",
      dia_vencimento: "10",
      reajuste: "",
      observacoes: "",
    }
  }

  function abrirNovoContrato() {
    limparMensagens()

    setEditando(null)
    setForm(formularioInicial())
    setModalAberto(true)
  }

  function abrirEditarContrato(contrato) {
    limparMensagens()

    setEditando(contrato)

    setForm({
      cliente_id:
        contrato.cliente_id
          ? String(contrato.cliente_id)
          : "",

      imovel_id:
        contrato.imovel_id
          ? String(contrato.imovel_id)
          : "",

      tipo:
        contrato.tipo ||
        "Aluguel",

      status:
        contrato.status ||
        "ativo",

      data_inicio:
        contrato.data_inicio ||
        "",

      data_fim:
        contrato.data_fim ||
        "",

      valor:
        contrato.valor !== null &&
        contrato.valor !== undefined
          ? String(contrato.valor)
          : "",

      dia_vencimento:
        contrato.dia_vencimento !== null &&
        contrato.dia_vencimento !== undefined
          ? String(contrato.dia_vencimento)
          : "10",

      reajuste:
        contrato.reajuste !== null &&
        contrato.reajuste !== undefined
          ? String(contrato.reajuste)
          : "",

      observacoes:
        contrato.observacoes ||
        "",
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }

  // =========================================================
  // FORMATAÇÕES
  // =========================================================

  function formatarData(data) {
    if (!data) return "-"

    const partes = String(data).split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function formatarMoeda(valor) {
    const numero = Number(valor || 0)

    return numero.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  // =========================================================
  // CLIENTE
  // =========================================================

  function obterCliente(contrato) {
    return clientes.find(
      (cliente) =>
        String(cliente.id) ===
        String(contrato.cliente_id)
    )
  }

  function obterNomeCliente(contrato) {
    const cliente =
      obterCliente(contrato)

    return (
      cliente?.nome ||
      "Cliente não informado"
    )
  }

  // =========================================================
  // IMÓVEL
  // =========================================================

  function obterImovel(contrato) {
    return imoveis.find(
      (imovel) =>
        String(imovel.id) ===
        String(contrato.imovel_id)
    )
  }

  function obterNomeImovel(contrato) {
    const imovel =
      obterImovel(contrato)

    if (!imovel) {
      return "Imóvel não informado"
    }

    return (
      imovel.titulo ||
      imovel.nome ||
      imovel.codigo ||
      imovel.endereco ||
      "Imóvel"
    )
  }

  // =========================================================
  // STATUS
  // =========================================================

  function obterStatusLabel(status) {
    const statusMap = {
      ativo: "Ativo",
      encerrado: "Encerrado",
      vencido: "Vencido",
      cancelado: "Cancelado",
      renovacao: "Em renovação",
    }

    return (
      statusMap[status] ||
      status ||
      "Não informado"
    )
  }

  function obterStatusClass(status) {
    const classMap = {
      ativo: "bg-success",
      encerrado: "bg-secondary",
      vencido: "bg-danger",
      cancelado: "bg-dark",
      renovacao:
        "bg-warning text-dark",
    }

    return (
      classMap[status] ||
      "bg-secondary"
    )
  }

  // =========================================================
  // FILTRO / PESQUISA
  // =========================================================

  const contratosFiltrados =
    useMemo(() => {
      const texto =
        busca
          .trim()
          .toLowerCase()

      return contratos.filter(
        (contrato) => {
          const cliente =
            obterNomeCliente(
              contrato
            ).toLowerCase()

          const imovel =
            obterNomeImovel(
              contrato
            ).toLowerCase()

          const tipo =
            String(
              contrato.tipo || ""
            ).toLowerCase()

          const status =
            String(
              obterStatusLabel(
                contrato.status
              )
            ).toLowerCase()

          return (
            !texto ||
            cliente.includes(texto) ||
            imovel.includes(texto) ||
            tipo.includes(texto) ||
            status.includes(texto)
          )
        }
      )
    }, [
      contratos,
      clientes,
      imoveis,
      busca,
    ])

  // =========================================================
  // RESUMO
  // =========================================================

  const resumo = useMemo(() => {
    const ativos =
      contratos.filter(
        (contrato) =>
          contrato.status ===
          "ativo"
      ).length

    const vencidos =
      contratos.filter(
        (contrato) =>
          contrato.status ===
          "vencido"
      ).length

    const encerrados =
      contratos.filter(
        (contrato) =>
          contrato.status ===
          "encerrado"
      ).length

    const valorAtivo =
      contratos
        .filter(
          (contrato) =>
            contrato.status ===
            "ativo"
        )
        .reduce(
          (total, contrato) =>
            total +
            Number(
              contrato.valor || 0
            ),
          0
        )

    return {
      total: contratos.length,
      ativos,
      vencidos,
      encerrados,
      valorAtivo,
    }
  }, [contratos])
  // =========================================================
  // SALVAR CONTRATO
  // =========================================================

  async function salvarContrato(e) {
    e.preventDefault()

    setSalvando(true)
    setErro("")
    setSucesso("")

    try {
      if (!form.cliente_id) {
        throw new Error(
          "Selecione um cliente."
        )
      }

      if (!form.imovel_id) {
        throw new Error(
          "Selecione um imóvel."
        )
      }

      if (!form.data_inicio) {
        throw new Error(
          "Informe a data de início."
        )
      }

      if (
        form.data_fim &&
        form.data_inicio >
          form.data_fim
      ) {
        throw new Error(
          "A data de término não pode ser anterior à data de início."
        )
      }

      const dadosContrato = {
        cliente_id:
          form.cliente_id
            ? Number(form.cliente_id)
            : null,

        imovel_id:
          form.imovel_id
            ? Number(form.imovel_id)
            : null,

        tipo:
          form.tipo || "Aluguel",

        status:
          form.status || "ativo",

        data_inicio:
          form.data_inicio || null,

        data_fim:
          form.data_fim || null,

        valor:
          form.valor !== ""
            ? Number(form.valor)
            : null,

        dia_vencimento:
          form.dia_vencimento !== ""
            ? Number(
                form.dia_vencimento
              )
            : null,

        reajuste:
          form.reajuste !== ""
            ? Number(form.reajuste)
            : null,

        observacoes:
          form.observacoes || null,
      }

      let resultado

      if (editando) {
        resultado =
          await supabase
            .from("contratos")
            .update(dadosContrato)
            .eq("id", editando.id)
            .select()
            .single()
      } else {
        resultado =
          await supabase
            .from("contratos")
            .insert([
              dadosContrato,
            ])
            .select()
            .single()
      }

      if (resultado.error) {
        throw resultado.error
      }

      setSucesso(
        editando
          ? "Contrato atualizado com sucesso!"
          : "Contrato cadastrado com sucesso!"
      )

      setModalAberto(false)
      setEditando(null)
      setForm(formularioInicial())

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

  // =========================================================
  // EXCLUIR CONTRATO
  // =========================================================

  async function excluirContrato(
    contrato
  ) {
    const nome =
      obterNomeCliente(
        contrato
      )

    const confirmar =
      window.confirm(
        `Deseja realmente excluir o contrato de ${nome}?`
      )

    if (!confirmar) {
      return
    }

    setErro("")
    setSucesso("")

    try {
      const { error } =
        await supabase
          .from("contratos")
          .delete()
          .eq("id", contrato.id)

      if (error) {
        throw error
      }

      setSucesso(
        "Contrato excluído com sucesso!"
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

  // =========================================================
  // INÍCIO DA PÁGINA
  // =========================================================

  return (
    <div className="container-fluid py-4">

      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Contratos
          </h2>

          <p className="text-muted mb-0">
            Gerencie os contratos dos clientes e imóveis.
          </p>

        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => {
              limparMensagens()
              carregarDados()
            }}
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

      {/* ALERTA DE ERRO */}
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

      {/* ALERTA DE SUCESSO */}
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

      {/* =====================================================
          ACESSO RÁPIDO
          ===================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: "48px",
                height: "48px",
              }}
            >

              <i className="bi bi-lightning-charge-fill text-primary fs-4"></i>

            </div>

            <div>

              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>

              <small className="text-muted">
                Acesse rapidamente os módulos do sistema.
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

                <i className="bi bi-speedometer2 me-1"></i>

                Dashboard

              </button>

            </div>

            {/* CLIENTES */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/clientes"
                  )
                }
              >

                <i className="bi bi-people me-1"></i>

                Clientes

              </button>

            </div>

            {/* IMÓVEIS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/imoveis"
                  )
                }
              >

                <i className="bi bi-house me-1"></i>

                Imóveis

              </button>

            </div>

            {/* CONTRATOS - ATIVO */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-primary w-100 py-2"
              >

                <i className="bi bi-file-earmark-text me-1"></i>

                Contratos

              </button>

            </div>

            {/* RECEBIMENTOS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/recebimentos"
                  )
                }
              >

                <i className="bi bi-cash-coin me-1"></i>

                Recebimentos

              </button>

            </div>

            {/* DESPESAS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/despesas"
                  )
                }
              >

                <i className="bi bi-receipt me-1"></i>

                Despesas

              </button>

            </div>

            {/* FINANCEIRO */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/financeiro"
                  )
                }
              >

                <i className="bi bi-wallet2 me-1"></i>

                Financeiro

              </button>

            </div>

            {/* MANUTENÇÕES */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/manutencoes"
                  )
                }
              >

                <i className="bi bi-tools me-1"></i>

                Manutenções

              </button>

            </div>

            {/* VISITAS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/visitas"
                  )
                }
              >

                <i className="bi bi-calendar-check me-1"></i>

                Visitas

              </button>

            </div>

            {/* COMUNICAÇÃO */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/comunicacao"
                  )
                }
              >

                <i className="bi bi-whatsapp me-1"></i>

                Comunicação

              </button>

            </div>

            {/* RELATÓRIOS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/relatorios"
                  )
                }
              >

                <i className="bi bi-bar-chart-line me-1"></i>

                Relatórios

              </button>

            </div>

            {/* CONFIGURAÇÕES */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                type="button"
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina(
                    "/configuracoes"
                  )
                }
              >

                <i className="bi bi-gear me-1"></i>

                Configurações

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          RESUMO
          ===================================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center">

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >

                  <i className="bi bi-file-earmark-text text-primary fs-4"></i>

                </div>

                <div>

                  <div className="text-muted small">
                    Total de contratos
                  </div>

                  <h4 className="fw-bold mb-0">
                    {resumo.total}
                  </h4>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ATIVOS */}
        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center">

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >

                  <i className="bi bi-check-circle text-success fs-4"></i>

                </div>

                <div>

                  <div className="text-muted small">
                    Contratos ativos
                  </div>

                  <h4 className="fw-bold mb-0">
                    {resumo.ativos}
                  </h4>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* VALOR ATIVO */}
        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex align-items-center">

                <div
                  className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >

                  <i className="bi bi-cash-stack text-warning fs-4"></i>

                </div>

                <div>

                  <div className="text-muted small">
                    Valor dos contratos ativos
                  </div>

                  <h4 className="fw-bold mb-0">
                    {formatarMoeda(
                      resumo.valorAtivo
                    )}
                  </h4>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
      {/* =====================================================
          CONTRATOS CADASTRADOS
          ===================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        {/* CABEÇALHO DO CARD */}
        <div className="card-body border-bottom">

          <div className="d-flex flex-wrap justify-content-between align-items-center">

            <div>

              <h5 className="fw-bold mb-1">
                Contratos cadastrados
              </h5>

              <p className="text-muted small mb-0">
                Consulte, edite ou exclua os contratos cadastrados.
              </p>

            </div>

            <button
              type="button"
              className="btn btn-primary mt-3 mt-md-0"
              onClick={abrirNovoContrato}
            >

              <i className="bi bi-plus-lg me-2"></i>

              Novo contrato

            </button>

          </div>

        </div>

        {/* PESQUISA */}
        <div className="card-body border-bottom">

          <div className="row g-2">

            <div className="col-12 col-md-9">

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por cliente, imóvel, tipo ou status..."
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

            <div className="col-12 col-md-3">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  limparMensagens()
                  carregarDados()
                }}
                disabled={loading}
              >

                <i className="bi bi-arrow-clockwise me-2"></i>

                Atualizar lista

              </button>

            </div>

          </div>

          {/* RESULTADO DA PESQUISA */}
          {busca && (
            <div className="mt-3">

              <small className="text-muted">

                <i className="bi bi-info-circle me-1"></i>

                {contratosFiltrados.length}{" "}
                {contratosFiltrados.length === 1
                  ? "contrato encontrado"
                  : "contratos encontrados"}

                {" "}para{" "}

                <strong>
                  "{busca}"
                </strong>

              </small>

            </div>
          )}

        </div>

        {/* CONTEÚDO */}
        <div className="card-body p-0">

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

              <div
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >

                <i className="bi bi-file-earmark-text text-primary fs-2"></i>

              </div>

              <h5 className="fw-bold">
                {busca
                  ? "Nenhum contrato encontrado"
                  : "Nenhum contrato cadastrado"}
              </h5>

              <p className="text-muted mb-3">

                {busca
                  ? "Tente utilizar outro termo de pesquisa."
                  : "Comece cadastrando o primeiro contrato."}

              </p>

              {!busca && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={abrirNovoContrato}
                >

                  <i className="bi bi-plus-lg me-2"></i>

                  Novo contrato

                </button>
              )}

              {busca && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() =>
                    setBusca("")
                  }
                >

                  <i className="bi bi-x-circle me-2"></i>

                  Limpar pesquisa

                </button>
              )}

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-3">
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
                      Vencimento
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
                    (contrato) => {

                      const cliente =
                        obterCliente(
                          contrato
                        )

                      const imovel =
                        obterImovel(
                          contrato
                        )

                      return (
                        <tr
                          key={contrato.id}
                        >

                          {/* CLIENTE */}
                          <td className="px-3">

                            <div className="d-flex align-items-center">

                              <div
                                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: "38px",
                                  height: "38px",
                                }}
                              >

                                <i className="bi bi-person text-primary"></i>

                              </div>

                              <div>

                                <div className="fw-semibold">

                                  {cliente?.nome ||
                                    "Cliente não informado"}

                                </div>

                                {cliente?.telefone && (
                                  <div className="small text-muted">

                                    <i className="bi bi-telephone me-1"></i>

                                    {cliente.telefone}

                                  </div>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* IMÓVEL */}
                          <td>

                            <div className="d-flex align-items-center">

                              <div
                                className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: "38px",
                                  height: "38px",
                                }}
                              >

                                <i className="bi bi-house text-success"></i>

                              </div>

                              <div>

                                <div className="fw-semibold">

                                  {obterNomeImovel(
                                    contrato
                                  )}

                                </div>

                                {imovel?.codigo && (
                                  <div className="small text-muted">

                                    Código:{" "}
                                    {imovel.codigo}

                                  </div>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* TIPO */}
                          <td>

                            <span className="badge bg-primary">

                              {contrato.tipo ||
                                "Não informado"}

                            </span>

                          </td>

                          {/* PERÍODO */}
                          <td>

                            <div className="small">

                              <div>

                                <span className="text-muted">
                                  Início:
                                </span>{" "}

                                <strong>
                                  {formatarData(
                                    contrato.data_inicio
                                  )}
                                </strong>

                              </div>

                              <div className="mt-1">

                                <span className="text-muted">
                                  Fim:
                                </span>{" "}

                                <strong>
                                  {formatarData(
                                    contrato.data_fim
                                  )}
                                </strong>

                              </div>

                            </div>

                          </td>

                          {/* VALOR */}
                          <td>

                            <div className="fw-semibold text-success">

                              {formatarMoeda(
                                contrato.valor
                              )}

                            </div>

                            {contrato.reajuste !== null &&
                              contrato.reajuste !== undefined &&
                              contrato.reajuste !== "" && (
                                <div className="small text-muted">

                                  Reajuste:{" "}
                                  {contrato.reajuste}%

                                </div>
                              )}

                          </td>

                          {/* VENCIMENTO */}
                          <td>

                            {contrato.dia_vencimento ? (
                              <span>

                                <i className="bi bi-calendar-event me-1 text-primary"></i>

                                Dia{" "}

                                <strong>
                                  {contrato.dia_vencimento}
                                </strong>

                              </span>
                            ) : (
                              <span className="text-muted">
                                -
                              </span>
                            )}

                          </td>

                          {/* STATUS */}
                          <td>

                            <span
                              className={`badge ${obterStatusClass(
                                contrato.status
                              )}`}
                            >

                              {obterStatusLabel(
                                contrato.status
                              )}

                            </span>

                          </td>

                          {/* AÇÕES */}
                          <td className="text-end px-3">

                            <div className="d-flex justify-content-end gap-1">

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
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
      {/* =====================================================
          MODAL - NOVO / EDITAR CONTRATO
          ===================================================== */}

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

          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            role="document"
          >

            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO */}
              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold mb-1">

                    <i className="bi bi-file-earmark-text me-2 text-primary"></i>

                    {editando
                      ? "Editar contrato"
                      : "Novo contrato"}

                  </h5>

                  <small className="text-muted">

                    {editando
                      ? "Atualize as informações do contrato."
                      : "Preencha os dados para cadastrar um novo contrato."}

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

              {/* FORMULÁRIO */}
              <form onSubmit={salvarContrato}>

                <div className="modal-body">

                  {/* =================================================
                      DADOS DO CONTRATO
                      ================================================= */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-file-earmark-text me-2 text-primary"></i>

                        Dados do contrato

                      </h6>

                      <div className="row g-3">

                        {/* CLIENTE */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Cliente *
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

                          <label className="form-label fw-semibold">
                            Imóvel *
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

                            {imoveis.map(
                              (imovel) => (
                                <option
                                  key={imovel.id}
                                  value={imovel.id}
                                >
                                  {imovel.codigo
                                    ? `${imovel.codigo} - `
                                    : ""}

                                  {imovel.titulo ||
                                    imovel.nome ||
                                    imovel.endereco ||
                                    "Imóvel"}
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        {/* TIPO */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Tipo de contrato
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

                            <option value="Temporada">
                              Temporada
                            </option>

                            <option value="Comercial">
                              Comercial
                            </option>

                            <option value="Residencial">
                              Residencial
                            </option>

                            <option value="Outro">
                              Outro
                            </option>

                          </select>

                        </div>

                        {/* STATUS */}
                        <div className="col-12 col-md-6">

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

                            <option value="vencido">
                              Vencido
                            </option>

                            <option value="cancelado">
                              Cancelado
                            </option>

                            <option value="renovacao">
                              Em renovação
                            </option>

                          </select>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      PERÍODO E VALORES
                      ================================================= */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-calendar3 me-2 text-primary"></i>

                        Período e valores

                      </h6>

                      <div className="row g-3">

                        {/* DATA INÍCIO */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Data de início *
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
                        <div className="col-12 col-md-6">

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

                        {/* VALOR */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Valor *
                          </label>

                          <div className="input-group">

                            <span className="input-group-text">
                              R$
                            </span>

                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              step="0.01"
                              placeholder="0,00"
                              value={form.valor}
                              onChange={(e) =>
                                alterarCampo(
                                  "valor",
                                  e.target.value
                                )
                              }
                              required
                            />

                          </div>

                        </div>

                        {/* DIA VENCIMENTO */}
                        <div className="col-12 col-md-3">

                          <label className="form-label fw-semibold">
                            Dia de vencimento
                          </label>

                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            max="31"
                            value={
                              form.dia_vencimento
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "dia_vencimento",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        {/* REAJUSTE */}
                        <div className="col-12 col-md-3">

                          <label className="form-label fw-semibold">
                            Reajuste
                          </label>

                          <div className="input-group">

                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={
                                form.reajuste
                              }
                              onChange={(e) =>
                                alterarCampo(
                                  "reajuste",
                                  e.target.value
                                )
                              }
                            />

                            <span className="input-group-text">
                              %
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      OBSERVAÇÕES
                      ================================================= */}

                  <div className="card border-0 bg-light">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-chat-left-text me-2 text-primary"></i>

                        Observações

                      </h6>

                      <textarea
                        className="form-control"
                        rows="5"
                        placeholder="Digite informações adicionais sobre o contrato..."
                        value={
                          form.observacoes
                        }
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

                {/* =================================================
                    RODAPÉ DO MODAL
                    ================================================= */}

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

    </div>
  )
}