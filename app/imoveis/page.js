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

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  async function buscarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, "")

    if (cepLimpo.length !== 8) {
      return
    }

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      )

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível consultar o CEP."
        )
      }

      const dados = await resposta.json()

      if (dados.erro) {
        setErro("CEP não encontrado.")
        return
      }

      setErro("")

      setForm((anterior) => ({
        ...anterior,

        endereco:
          dados.logradouro ||
          anterior.endereco,

        bairro:
          dados.bairro ||
          anterior.bairro,

        cidade:
          dados.localidade ||
          anterior.cidade,

        estado:
          dados.uf ||
          anterior.estado,
      }))
    } catch (error) {
      console.error(
        "Erro ao consultar CEP:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível consultar o CEP."
      )
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
        imovel.valor ?? "",

      endereco:
        imovel.endereco || "",
      numero:
        imovel.numero || "",
      complemento:
        imovel.complemento || "",
      bairro:
        imovel.bairro || "",
      cidade:
        imovel.cidade || "",
      estado:
        imovel.estado || "",
      cep:
        imovel.cep || "",

      descricao:
        imovel.descricao || "",
      observacoes:
        imovel.observacoes || "",
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setEditando(null)
    setForm(formularioInicial())
    limparMensagens()
  }

  async function salvarImovel(e) {
    e.preventDefault()

    limparMensagens()
    setSalvando(true)

    try {
      const dados = {
        codigo:
          form.codigo?.trim() || null,

        titulo:
          form.titulo?.trim() || null,

        tipo:
          form.tipo || "Casa",

        finalidade:
          form.finalidade || "Aluguel",

        status:
          form.status || "disponivel",

        valor:
          form.valor === "" ||
          form.valor === null
            ? null
            : Number(form.valor),

        endereco:
          form.endereco?.trim() || null,

        numero:
          form.numero?.trim() || null,

        complemento:
          form.complemento?.trim() || null,

        bairro:
          form.bairro?.trim() || null,

        cidade:
          form.cidade?.trim() || null,

        estado:
          form.estado?.trim() || null,

        cep:
          form.cep?.trim() || null,

        descricao:
          form.descricao?.trim() || null,

        observacoes:
          form.observacoes?.trim() || null,
      }

      let resultado

      if (editando) {
        resultado = await supabase
          .from("imoveis")
          .update(dados)
          .eq("id", editando.id)
          .select()
          .single()
      } else {
        resultado = await supabase
          .from("imoveis")
          .insert([dados])
          .select()
          .single()
      }

      if (resultado.error) {
        throw resultado.error
      }

      if (editando) {
        setImoveis((anteriores) =>
          anteriores.map((imovel) =>
            imovel.id === editando.id
              ? resultado.data
              : imovel
          )
        )

        setSucesso(
          "Imóvel atualizado com sucesso!"
        )
      } else {
        setImoveis((anteriores) => [
          resultado.data,
          ...anteriores,
        ])

        setSucesso(
          "Imóvel cadastrado com sucesso!"
        )
      }

      setForm(formularioInicial())
      setEditando(null)
      setModalAberto(false)

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

    if (!confirmar) {
      return
    }

    limparMensagens()

    try {
      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      setImoveis((anteriores) =>
        anteriores.filter(
          (imovel) =>
            imovel.id !== id
        )
      )

      setSucesso(
        "Imóvel excluído com sucesso!"
      )

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
        String(imovel.endereco || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.bairro || "")
          .toLowerCase()
          .includes(texto) ||
        String(imovel.cidade || "")
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

  const totalImoveis = imoveis.length

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
      imovel.status === "manutencao"
  ).length

  return (
    <div className="container-fluid py-4">

      {/* ACESSO RÁPIDO */}
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

          </div>
        </div>
      </div>

      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Imóveis
          </h2>

          <p className="text-muted mb-0">
            Gerencie os imóveis cadastrados no sistema.
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

      {/* RESUMO DOS IMÓVEIS */}
      <div className="row g-3 mb-4">

        {/* TOTAL */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Total de imóveis
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalImoveis}
                  </h3>
                </div>

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-buildings text-primary fs-4"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* DISPONÍVEIS */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Disponíveis
                  </p>

                  <h3 className="fw-bold mb-0">
                    {disponiveis}
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

            </div>
          </div>
        </div>

        {/* ALUGADOS */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Alugados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {alugados}
                  </h3>
                </div>

                <div
                  className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-house-check text-info fs-4"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* MANUTENÇÃO */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <p className="text-muted mb-1">
                    Em manutenção
                  </p>

                  <h3 className="fw-bold mb-0">
                    {manutencao}
                  </h3>
                </div>

                <div
                  className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-tools text-warning fs-4"></i>
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
                Pesquise e filtre os imóveis cadastrados.
              </small>
            </div>
          </div>

          <div className="row g-3">

            <div className="col-12 col-md-7">
              <label className="form-label fw-semibold">
                Buscar imóvel
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Código, título, tipo, endereço, bairro ou cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-5">
              <label className="form-label fw-semibold">
                Status
              </label>

              <select
                className="form-select"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
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
                  Em manutenção
                </option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* LISTA DE IMÓVEIS */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <small className="text-muted">
                {imoveisFiltrados.length} imóvel(is) encontrado(s)
              </small>
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
                Carregando imóveis...
              </p>
            </div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="text-center py-5">

              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-house-x fs-3 text-muted"></i>
              </div>

              <h6 className="fw-bold">
                Nenhum imóvel encontrado
              </h6>

              <p className="text-muted mb-3">
                Não encontramos imóveis com os filtros informados.
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
                    <th>Código</th>
                    <th>Imóvel</th>
                    <th>Tipo</th>
                    <th>Finalidade</th>
                    <th>Localização</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th className="text-end">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {imoveisFiltrados.map((imovel) => (

                    <tr key={imovel.id}>

                      <td>
                        <span className="fw-semibold">
                          {imovel.codigo || "-"}
                        </span>
                      </td>

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
                            <i className="bi bi-house text-primary"></i>
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {imovel.titulo || "Sem título"}
                            </div>

                            <small className="text-muted">
                              {imovel.endereco || "Endereço não informado"}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        {imovel.tipo || "-"}
                      </td>

                      <td>
                        {imovel.finalidade || "-"}
                      </td>

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

                      <td>
                        <span className="fw-semibold">
                          {imovel.valor
                            ? Number(imovel.valor).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              )
                            : "R$ 0,00"}
                        </span>
                      </td>

                      <td>
                        {imovel.status === "disponivel" && (
                          <span className="badge bg-success-subtle text-success">
                            Disponível
                          </span>
                        )}

                        {imovel.status === "alugado" && (
                          <span className="badge bg-primary-subtle text-primary">
                            Alugado
                          </span>
                        )}

                        {imovel.status === "manutencao" && (
                          <span className="badge bg-warning-subtle text-warning-emphasis">
                            Em manutenção
                          </span>
                        )}

                        {![
                          "disponivel",
                          "alugado",
                          "manutencao",
                        ].includes(imovel.status) && (
                          <span className="badge bg-secondary-subtle text-secondary">
                            {imovel.status || "Não informado"}
                          </span>
                        )}
                      </td>

                      <td>
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
                              excluirImovel(imovel.id)
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
      {/* MODAL - NOVO / EDITAR IMÓVEL */}
      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">

              {/* CABEÇALHO DO MODAL */}
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {editando
                      ? "Editar imóvel"
                      : "Novo imóvel"}
                  </h5>

                  <small className="text-muted">
                    {editando
                      ? "Atualize os dados do imóvel."
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

              {/* CORPO DO MODAL */}
              <div className="modal-body">

                {/* DADOS PRINCIPAIS */}
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
                        <i className="bi bi-house text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Dados do imóvel
                        </h6>

                        <small className="text-muted">
                          Informações principais do imóvel.
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
                          value={form.codigo}
                          onChange={(e) =>
                            alterarCampo(
                              "codigo",
                              e.target.value
                            )
                          }
                          placeholder="Ex.: IM001"
                        />
                      </div>

                      {/* TÍTULO */}
                      <div className="col-12 col-md-8">
                        <label className="form-label fw-semibold">
                          Título
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
                          placeholder="Ex.: Casa residencial"
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

                          <option value="Terreno">
                            Terreno
                          </option>

                          <option value="Comercial">
                            Comercial
                          </option>

                          <option value="Sala comercial">
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

                          <option value="Aluguel e venda">
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
                  </div>
                </div>

                {/* ENDEREÇO */}
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
                        <i className="bi bi-geo-alt text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Endereço
                        </h6>

                        <small className="text-muted">
                          Informe o CEP para preencher automaticamente os dados.
                        </small>
                      </div>
                    </div>

                    <div className="row g-3">

                      {/* CEP */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          CEP
                        </label>

                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={form.cep}
                            onChange={(e) => {
                              const valor =
                                e.target.value.replace(
                                  /\D/g,
                                  ""
                                );

                              const cepFormatado =
                                valor.length > 5
                                  ? `${valor.slice(
                                      0,
                                      5
                                    )}-${valor.slice(5, 8)}`
                                  : valor;

                              alterarCampo(
                                "cep",
                                cepFormatado
                              );
                            }}
                            onBlur={() =>
                              buscarCEP(form.cep)
                            }
                            placeholder="00000-000"
                            maxLength={9}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() =>
                              buscarCEP(form.cep)
                            }
                          >
                            <i className="bi bi-search"></i>
                          </button>
                        </div>
                      </div>

                      {/* LOGRADOURO */}
                      <div className="col-12 col-md-8">
                        <label className="form-label fw-semibold">
                          Logradouro
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
                      <div className="col-12 col-md-3">
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
                          placeholder="Nº"
                        />
                      </div>

                      {/* COMPLEMENTO */}
                      <div className="col-12 col-md-5">
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
                          placeholder="Bairro"
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
                          placeholder="Cidade"
                        />
                      </div>

                      {/* UF */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">
                          UF
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={form.estado}
                          onChange={(e) =>
                            alterarCampo(
                              "estado",
                              e.target.value
                                .toUpperCase()
                                .slice(0, 2)
                            )
                          }
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>

                    </div>
                  </div>
                </div>

                {/* DESCRIÇÃO E OBSERVAÇÕES */}
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
                        <i className="bi bi-card-text text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          Informações adicionais
                        </h6>

                        <small className="text-muted">
                          Adicione detalhes complementares do imóvel.
                        </small>
                      </div>
                    </div>

                    <div className="row g-3">

                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Descrição
                        </label>

                        <textarea
                          className="form-control"
                          rows="4"
                          value={form.descricao}
                          onChange={(e) =>
                            alterarCampo(
                              "descricao",
                              e.target.value
                            )
                          }
                          placeholder="Descreva o imóvel..."
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Observações
                        </label>

                        <textarea
                          className="form-control"
                          rows="3"
                          value={form.observacoes}
                          onChange={(e) =>
                            alterarCampo(
                              "observacoes",
                              e.target.value
                            )
                          }
                          placeholder="Observações adicionais..."
                        ></textarea>
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
                  onClick={salvarImovel}
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
                        : "Cadastrar imóvel"}
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