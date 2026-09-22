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
        cep: cepLimpo.replace(
          /^(\d{5})(\d{3})$/,
          "$1-$2"
        ),
        endereco: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        estado: dados.uf || "",
      }))
    } catch (error) {
      console.error(
        "Erro ao consultar CEP:",
        error
      )

      setErro(
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
        imovel.valor !== null &&
        imovel.valor !== undefined
          ? imovel.valor
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
          (imovel) => imovel.id !== id
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
  }, [imoveis, busca, filtroStatus])

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

  const percentualDisponiveis =
    totalImoveis > 0
      ? Math.round(
          (disponiveis / totalImoveis) * 100
        )
      : 0

  const percentualAlugados =
    totalImoveis > 0
      ? Math.round(
          (alugados / totalImoveis) * 100
        )
      : 0

  const percentualManutencao =
    totalImoveis > 0
      ? Math.round(
          (manutencao / totalImoveis) * 100
        )
      : 0
return (
    <div className="container-fluid py-4">

      {/* ========================================
          CABEÇALHO
      ======================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Imóveis
          </h2>

          <p className="text-muted mb-0">
            Gerencie os imóveis cadastrados
            no sistema.
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


      {/* ========================================
          ALERTAS
      ======================================== */}

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
            aria-label="Fechar"
          ></button>
        </div>
      )}

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
            aria-label="Fechar"
          ></button>
        </div>
      )}


      {/* ========================================
          ACESSO RÁPIDO
      ======================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            <i className="bi bi-lightning-charge-fill text-primary me-2"></i>
            Acesso rápido
          </h5>

          <div className="row g-3">

            <div className="col-12 col-md-4">

              <button
                type="button"
                className="btn btn-light border w-100 text-start p-3"
                onClick={abrirNovoImovel}
              >

                <div className="d-flex align-items-center">

                  <div className="fs-4 text-primary me-3">
                    <i className="bi bi-house-add"></i>
                  </div>

                  <div>
                    <div className="fw-semibold">
                      Novo imóvel
                    </div>

                    <small className="text-muted">
                      Cadastrar um imóvel
                    </small>
                  </div>

                </div>

              </button>

            </div>


            <div className="col-12 col-md-4">

              <button
                type="button"
                className="btn btn-light border w-100 text-start p-3"
                onClick={() =>
                  acessarPagina("/clientes")
                }
              >

                <div className="d-flex align-items-center">

                  <div className="fs-4 text-primary me-3">
                    <i className="bi bi-people"></i>
                  </div>

                  <div>
                    <div className="fw-semibold">
                      Clientes
                    </div>

                    <small className="text-muted">
                      Gerenciar clientes
                    </small>
                  </div>

                </div>

              </button>

            </div>


            <div className="col-12 col-md-4">

              <button
                type="button"
                className="btn btn-light border w-100 text-start p-3"
                onClick={() =>
                  acessarPagina("/contratos")
                }
              >

                <div className="d-flex align-items-center">

                  <div className="fs-4 text-primary me-3">
                    <i className="bi bi-file-earmark-text"></i>
                  </div>

                  <div>
                    <div className="fw-semibold">
                      Contratos
                    </div>

                    <small className="text-muted">
                      Gerenciar contratos
                    </small>
                  </div>

                </div>

              </button>

            </div>

          </div>

        </div>

      </div>
{/* ========================================
          RESUMO DOS IMÓVEIS
      ======================================== */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Total de imóveis
                  </p>

                  <h3 className="fw-bold mb-0">
                    {totalImoveis}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-buildings"></i>
                </div>

              </div>

            </div>
          </div>
        </div>


        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Disponíveis
                  </p>

                  <h3 className="fw-bold mb-0">
                    {disponiveis}
                  </h3>

                  <small className="text-muted">
                    {percentualDisponiveis}% do total
                  </small>
                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-house-check"></i>
                </div>

              </div>

            </div>
          </div>
        </div>


        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Alugados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {alugados}
                  </h3>

                  <small className="text-muted">
                    {percentualAlugados}% do total
                  </small>
                </div>

                <div className="fs-2 text-warning">
                  <i className="bi bi-house-door"></i>
                </div>

              </div>

            </div>
          </div>
        </div>


        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Em manutenção
                  </p>

                  <h3 className="fw-bold mb-0">
                    {manutencao}
                  </h3>

                  <small className="text-muted">
                    {percentualManutencao}% do total
                  </small>
                </div>

                <div className="fs-2 text-danger">
                  <i className="bi bi-tools"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>


      {/* ========================================
          FILTROS
      ======================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

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
                  placeholder="Código, título, endereço, bairro ou cidade..."
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
{/* ========================================
          TABELA DE IMÓVEIS
      ======================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <p className="text-muted mb-0">
                {imoveisFiltrados.length} imóvel(is)
                encontrado(s).
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

              <i className="bi bi-house-x fs-1 text-muted"></i>

              <h5 className="mt-3">
                Nenhum imóvel encontrado
              </h5>

              <p className="text-muted mb-3">
                Não há imóveis que correspondam
                aos filtros selecionados.
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

                <thead>

                  <tr>

                    <th>
                      Código
                    </th>

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

                  {imoveisFiltrados.map(
                    (imovel) => {

                      const status =
                        String(
                          imovel.status || ""
                        ).toLowerCase()

                      let classeStatus =
                        "bg-secondary"

                      let textoStatus =
                        imovel.status ||
                        "Não informado"

                      if (
                        status ===
                        "disponivel"
                      ) {
                        classeStatus =
                          "bg-success"

                        textoStatus =
                          "Disponível"
                      }

                      if (
                        status ===
                        "alugado"
                      ) {
                        classeStatus =
                          "bg-warning text-dark"

                        textoStatus =
                          "Alugado"
                      }

                      if (
                        status ===
                        "manutencao"
                      ) {
                        classeStatus =
                          "bg-danger"

                        textoStatus =
                          "Em manutenção"
                      }

                      return (
                        <tr
                          key={imovel.id}
                        >

                          <td>
                            <span className="fw-semibold">
                              {imovel.codigo ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            <div className="fw-semibold">
                              {imovel.titulo ||
                                "Sem título"}
                            </div>

                            {imovel.descricao && (
                              <small className="text-muted">
                                {imovel.descricao}
                              </small>
                            )}
                          </td>

                          <td>
                            {imovel.tipo ||
                              "—"}
                          </td>

                          <td>
                            {imovel.finalidade ||
                              "—"}
                          </td>

                          <td>

                            <div>
                              {imovel.endereco ||
                                "—"}
                              {imovel.numero
                                ? `, ${imovel.numero}`
                                : ""}
                            </div>

                            <small className="text-muted">
                              {[
                                imovel.bairro,
                                imovel.cidade,
                                imovel.estado,
                              ]
                                .filter(Boolean)
                                .join(" - ") ||
                                "Localização não informada"}
                            </small>

                          </td>

                          <td>
                            {imovel.valor !==
                              null &&
                            imovel.valor !==
                              undefined &&
                            imovel.valor !==
                              ""
                              ? Number(
                                  imovel.valor
                                ).toLocaleString(
                                  "pt-BR",
                                  {
                                    style:
                                      "currency",
                                    currency:
                                      "BRL",
                                  }
                                )
                              : "—"}
                          </td>

                          <td>

                            <span
                              className={`badge ${classeStatus}`}
                            >
                              {textoStatus}
                            </span>

                          </td>

                          <td>

                            <div className="d-flex justify-content-end gap-1">

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
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
{/* ========================================
          MODAL — NOVO / EDITAR IMÓVEL
      ======================================== */}

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

          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO */}

              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {editando
                      ? "Editar imóvel"
                      : "Novo imóvel"}
                  </h5>

                  <small className="text-muted">
                    Preencha os dados do imóvel.
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                  aria-label="Fechar"
                ></button>

              </div>


              {/* FORMULÁRIO */}

              <form onSubmit={salvarImovel}>

                <div className="modal-body">

                  {/* ========================================
                      DADOS PRINCIPAIS
                  ======================================== */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        <i className="bi bi-house me-2 text-primary"></i>
                        Dados principais
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

                            <option value="Sala">
                              Sala
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

                      </div>

                    </div>

                  </div>


                  {/* ========================================
                      ENDEREÇO
                  ======================================== */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                        Endereço
                      </h6>

                      <div className="row g-3">

                        {/* CEP */}

                        <div className="col-12 col-md-4">

                          <label className="form-label fw-semibold">
                            CEP
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="00000-000"
                            maxLength={9}
                            value={form.cep}
                            onChange={(e) => {

                              const valor =
                                e.target.value

                              alterarCampo(
                                "cep",
                                valor
                              )

                              const cepLimpo =
                                valor.replace(
                                  /\D/g,
                                  ""
                                )

                              if (
                                cepLimpo.length ===
                                8
                              ) {
                                buscarCEP(
                                  cepLimpo
                                )
                              }

                            }}
                          />

                          <small className="text-muted">
                            Digite o CEP para
                            preencher o endereço
                            automaticamente.
                          </small>

                        </div>


                        {/* ENDEREÇO */}

                        <div className="col-12 col-md-8">

                          <label className="form-label fw-semibold">
                            Endereço
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Rua, avenida..."
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

                        <div className="col-12 col-md-3">

                          <label className="form-label fw-semibold">
                            Número
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ex.: 100"
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

                        <div className="col-12 col-md-5">

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

                        <div className="col-12 col-md-8">

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
                            placeholder="UF"
                            maxLength={2}
                            value={form.estado}
                            onChange={(e) =>
                              alterarCampo(
                                "estado",
                                e.target.value
                                  .toUpperCase()
                              )
                            }
                          />

                        </div>

                      </div>

                    </div>

                  </div>
{/* ========================================
                      DESCRIÇÃO E OBSERVAÇÕES
                  ======================================== */}

                  <div className="card border-0 bg-light mb-3">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        <i className="bi bi-card-text me-2 text-primary"></i>
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
                            placeholder="Descreva o imóvel..."
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
                            rows="4"
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


                {/* ========================================
                    RODAPÉ DO MODAL
                ======================================== */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
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

    </div>
  )
}