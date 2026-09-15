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
    tipo: "Aluguel",
    status: "ativo",
    data_inicio: "",
    data_fim: "",
    valor: "",
    dia_vencimento: "10",
    reajuste: "",
    observacoes: "",
  })
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
          .select(`
            *,
            clientes (
              id,
              nome
            ),
            imoveis (
              id,
              codigo,
              titulo,
              endereco
            )
          `)
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

    function limparMensagens() {
      setErro("")
      setSucesso("")
    }

    function acessarPagina(url) {
      window.location.href = url
    }

    function alterarCampo(campo, valor) {
      setForm((anterior) => ({
        ...anterior,
        [campo]: valor,
      }))
    }
function abrirNovoContrato() {
      limparMensagens()

      setEditando(null)

      setForm({
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

      setModalAberto(true)
    }

    function fecharModal() {
      if (salvando) return

      setModalAberto(false)
      setEditando(null)
    }
const dados = {
          cliente_id: Number(
            form.cliente_id
          ),

          imovel_id: Number(
            form.imovel_id
          ),

          tipo: form.tipo,

          status: form.status,

          data_inicio:
            form.data_inicio,

          data_fim:
            form.data_fim || null,

          valor: Number(
            form.valor
          ),

          dia_vencimento:
            Number(
              form.dia_vencimento || 10
            ),

          reajuste:
            form.reajuste === ""
              ? null
              : Number(form.reajuste),

          observacoes:
            form.observacoes.trim() ||
            null,
        }

        let resultado
if (editando) {
          resultado = await supabase
            .from("contratos")
            .update(dados)
            .eq("id", editando.id)
        } else {
          resultado = await supabase
            .from("contratos")
            .insert([dados])
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
async function excluirContrato(id) {
      const confirmar =
        window.confirm(
          "Tem certeza que deseja excluir este contrato?"
        )

      if (!confirmar) return

      limparMensagens()

      try {
        const { error } =
          await supabase
            .from("contratos")
            .delete()
            .eq("id", id)

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
function formatarData(data) {
      if (!data) return "-"

      const partes =
        String(data).split("-")

      if (partes.length !== 3) {
        return data
      }

      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }

    function formatarMoeda(valor) {
      const numero =
        Number(valor || 0)

      return numero.toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL",
        }
      )
    }
function obterNomeCliente(
      contrato
    ) {
      return (
        contrato.clientes?.nome ||
        clientes.find(
          (cliente) =>
            String(cliente.id) ===
            String(contrato.cliente_id)
        )?.nome ||
        "Cliente não informado"
      )
    }

    function obterNomeImovel(
      contrato
    ) {
      const imovel =
        contrato.imoveis ||
        imoveis.find(
          (item) =>
            String(item.id) ===
            String(contrato.imovel_id)
        )

      if (!imovel) {
        return "Imóvel não informado"
      }

      return (
        imovel.titulo ||
        imovel.codigo ||
        imovel.endereco ||
        "Imóvel"
      )
    }
function obterStatusLabel(
      status
    ) {
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

    function obterStatusClass(
      status
    ) {
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
const contratosFiltrados =
      useMemo(() => {
        const texto =
          busca.trim().toLowerCase()

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

            const correspondeBusca =
              !texto ||
              cliente.includes(texto) ||
              imovel.includes(texto) ||
              tipo.includes(texto)

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
        clientes,
        imoveis,
        busca,
        filtroStatus,
      ])
const resumo =
      useMemo(() => {
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
          total:
            contratos.length,

          ativos,

          vencidos,

          encerrados,

          valorAtivo,
        }
      }, [contratos])
return (
      <div className="container-fluid py-4">

        {/* CABEÇALHO */}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

          <div>
            <h2 className="fw-bold mb-1">
              Contratos
            </h2>

            <p className="text-muted mb-0">
              Gerencie os contratos de locação dos imóveis
            </p>
          </div>

          <div className="d-flex gap-2 mt-3 mt-md-0">

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={carregarDados}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>

              Atualizar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={
                abrirNovoContrato
              }
            >
              <i className="bi bi-plus-lg me-2"></i>

              Novo contrato
            </button>

          </div>

        </div>
        </div>

        {/* MENSAGENS */}

        {erro && (
          <div
            className="alert alert-danger alert-dismissible fade show shadow-sm"
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

        {sucesso && (
          <div
            className="alert alert-success alert-dismissible fade show shadow-sm"
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
        </div>

        {/* RESUMO */}

        <div className="row g-3 mb-4">

          {/* TOTAL */}

          <div className="col-12 col-md-6 col-xl-3">
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
                    <small className="text-muted">
                      Total de contratos
                    </small>

                    <h4 className="fw-bold mb-0">
                      {resumo.total}
                    </h4>
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* ATIVOS */}

          <div className="col-12 col-md-6 col-xl-3">
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
                    <small className="text-muted">
                      Contratos ativos
                    </small>

                    <h4 className="fw-bold mb-0">
                      {resumo.ativos}
                    </h4>
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* VENCIDOS */}

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <div className="d-flex align-items-center">

                  <div
                    className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <i className="bi bi-exclamation-circle text-danger fs-4"></i>
                  </div>

                  <div>
                    <small className="text-muted">
                      Contratos vencidos
                    </small>

                    <h4 className="fw-bold mb-0">
                      {resumo.vencidos}
                    </h4>
                  </div>

                </div>

              </div>
            </div>
          </div>
          {/* VALOR ATIVO */}

          <div className="col-12 col-md-6 col-xl-3">
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
                    <i className="bi bi-cash-coin text-warning fs-4"></i>
                  </div>

                  <div>
                    <small className="text-muted">
                      Valor dos contratos ativos
                    </small>

                    <h5 className="fw-bold mb-0">
                      {formatarMoeda(
                        resumo.valorAtivo
                      )}
                    </h5>
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
                  Pesquise e filtre os contratos
                </small>
              </div>

            </div>

            <div className="row g-3">

              {/* BUSCA */}

              <div className="col-12 col-lg-8">

                <label className="form-label fw-semibold">
                  Pesquisar
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cliente, imóvel ou tipo de contrato..."
                    value={busca}
                    onChange={(e) =>
                      setBusca(e.target.value)
                    }
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="col-12 col-lg-4">

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
                    Todos os status
                  </option>

                  <option value="ativo">
                    Ativo
                  </option>

                  <option value="renovacao">
                    Em renovação
                  </option>

                  <option value="vencido">
                    Vencido
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
        <div className="card shadow-sm border-0">

          <div className="card-body">

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

              <div>
                <h5 className="fw-bold mb-1">
                  Contratos
                </h5>

                <small className="text-muted">
                  {contratosFiltrados.length} contrato(s) encontrado(s)
                </small>
              </div>

              <button
                type="button"
                className="btn btn-primary mt-2 mt-md-0"
                onClick={abrirNovoContrato}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Novo contrato
              </button>

            </div>

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
                  Carregando contratos...
                </p>

              </div>
            ) : contratosFiltrados.length === 0 ? (
              <div className="text-center py-5">

                <div
                  className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <i className="bi bi-file-earmark-x text-muted fs-2"></i>
                </div>

                <h5 className="fw-bold">
                  Nenhum contrato encontrado
                </h5>

                <p className="text-muted mb-3">
                  Não existem contratos para os filtros selecionados.
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
                            <div className="fw-semibold">
                              {obterNomeCliente(
                                contrato
                              )}
                            </div>
                          </td>

                          {/* IMÓVEL */}

                          <td>
                            <div className="fw-semibold">
                              {obterNomeImovel(
                                contrato
                              )}
                            </div>

                            {contrato.imoveis?.codigo && (
                              <small className="text-muted">
                                Código:{" "}
                                {contrato.imoveis.codigo}
                              </small>
                            )}
                          </td>

                          {/* TIPO */}

                          <td>
                            <span className="text-muted">
                              {contrato.tipo ||
                                "-"}
                            </span>
                          </td>

                          {/* PERÍODO */}

                          <td>
                            <div>
                              {formatarData(
                                contrato.data_inicio
                              )}
                            </div>

                            <small className="text-muted">
                              até{" "}
                              {formatarData(
                                contrato.data_fim
                              )}
                            </small>
                          </td>

                          {/* VALOR */}

                          <td>
                            <span className="fw-semibold">
                              {formatarMoeda(
                                contrato.valor
                              )}
                            </span>
                          </td>

                          {/* VENCIMENTO */}

                          <td>
                            <span className="text-muted">
                              Dia{" "}
                              {contrato.dia_vencimento ||
                                10}
                            </span>
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

                          <td className="text-end">

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
                                    contrato.id
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

        {/* MODAL DE CONTRATO */}

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
            <div
              className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
              role="document"
            >
              <div className="modal-content border-0 shadow">

                {/* CABEÇALHO DO MODAL */}

                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold mb-1">
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
                    aria-label="Fechar"
                    onClick={fecharModal}
                    disabled={salvando}
                  ></button>

                </div>

                {/* FORMULÁRIO */}

                <form onSubmit={salvarContrato}>

                  <div className="modal-body">

                    {/* DADOS PRINCIPAIS */}

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
                          Informe cliente, imóvel e tipo de contrato
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* CLIENTE */}

                      <div className="col-12 col-md-6">

                        <label className="form-label fw-semibold">
                          Cliente
                          <span className="text-danger">
                            {" "}*
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
                          Imóvel
                          <span className="text-danger">
                            {" "}*
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

                          <option value="renovacao">
                            Em renovação
                          </option>

                          <option value="vencido">
                            Vencido
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

                    {/* VALORES E DATAS */}

                    <hr className="my-4" />

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-calendar-check text-success"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Valores e período
                        </h6>

                        <small className="text-muted">
                          Defina o valor, período e vencimento
                        </small>
                      </div>

                    </div>

                    <div className="row g-3">

                      {/* VALOR */}

                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Valor do contrato
                          <span className="text-danger">
                            {" "}*
                          </span>
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

                      {/* DATA INÍCIO */}

                      <div className="col-12 col-md-4">

                        <label className="form-label fw-semibold">
                          Data de início
                          <span className="text-danger">
                            {" "}*
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

                      {/* DIA VENCIMENTO */}

                      <div className="col-12 col-md-6">

                        <label className="form-label fw-semibold">
                          Dia de vencimento
                        </label>

                        <select
                          className="form-select"
                          value={
                            form.dia_vencimento
                          }
                          onChange={(e) =>
                            alterarCampo(
                              "dia_vencimento",
                              e.target.value
                            )
                          }
                        >
                          {Array.from(
                            {
                              length: 31,
                            },
                            (_, index) =>
                              index + 1
                          ).map(
                            (dia) => (
                              <option
                                key={dia}
                                value={dia}
                              >
                                Dia {dia}
                              </option>
                            )
                          )}
                        </select>

                      </div>

                      {/* REAJUSTE */}

                      <div className="col-12 col-md-6">

                        <label className="form-label fw-semibold">
                          Reajuste anual
                        </label>

                        <div className="input-group">

                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            step="0.01"
                            placeholder="Ex.: 10"
                            value={form.reajuste}
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
                    {/* OBSERVAÇÕES */}

                    <hr className="my-4" />

                    <div className="d-flex align-items-center mb-3">

                      <div
                        className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "38px",
                          height: "38px",
                        }}
                      >
                        <i className="bi bi-chat-left-text text-secondary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Observações
                        </h6>

                        <small className="text-muted">
                          Informações adicionais sobre o contrato
                        </small>
                      </div>

                    </div>

                    <div className="mb-2">

                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Digite observações, condições ou informações adicionais..."
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

                  {/* RODAPÉ */}

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
