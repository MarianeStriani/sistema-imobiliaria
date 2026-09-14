"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const formularioInicial = {
  numero: "",
  imovel: "",
  cliente: "",
  tipo: "Locação",
  inicio: "",
  termino: "",
  valor: "",
  status: "Ativo",
  observacoes: ""
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState([])
  const [form, setForm] = useState(formularioInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [visualizando, setVisualizando] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarContratos()
  }, [])

  async function carregarContratos() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      alert("Erro ao carregar contratos.")
    } else {
      setContratos(data || [])
    }

    setCarregando(false)
  }

  function alterarCampo(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  function editarContrato(contrato) {
    setEditandoId(contrato.id)

    setForm({
      numero: contrato.numero || "",
      imovel: contrato.imovel || "",
      cliente: contrato.cliente || "",
      tipo: contrato.tipo || "Locação",
      inicio: contrato.inicio || "",
      termino: contrato.termino || "",
      valor: contrato.valor || "",
      status: contrato.status || "Ativo",
      observacoes: contrato.observacoes || ""
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(formularioInicial)
  }

  async function salvarContrato(e) {
    e.preventDefault()

    if (!form.numero || !form.imovel || !form.cliente || !form.valor) {
      alert("Preencha número, imóvel, cliente e valor.")
      return
    }

    setSalvando(true)

    const dados = {
      numero: form.numero,
      imovel: form.imovel,
      cliente: form.cliente,
      tipo: form.tipo,
      inicio: form.inicio || null,
      termino: form.termino || null,
      valor: Number(form.valor),
      status: form.status,
      observacoes: form.observacoes
    }

    if (editandoId) {
      const { data, error } = await supabase
        .from("contratos")
        .update(dados)
        .eq("id", editandoId)
        .select()

      if (error) {
        console.error(error)
        alert("Erro ao atualizar contrato.")
      } else {
        setContratos(
          contratos.map((contrato) =>
            contrato.id === editandoId
              ? data[0]
              : contrato
          )
        )

        alert("Contrato atualizado!")
        cancelarEdicao()
      }
    } else {
      const { data, error } = await supabase
        .from("contratos")
        .insert([dados])
        .select()

      if (error) {
        console.error(error)
        alert("Erro ao cadastrar contrato.")
      } else {
        setContratos([
          data[0],
          ...contratos
        ])

        setForm(formularioInicial)

        alert("Contrato cadastrado!")
      }
    }

    setSalvando(false)
  }

  async function excluirContrato(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este contrato?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("contratos")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      alert("Erro ao excluir contrato.")
      return
    }

    setContratos(
      contratos.filter((contrato) => contrato.id !== id)
    )

    setVisualizando(null)

    alert("Contrato excluído!")
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  function formatarData(data) {
    if (!data) return "-"

    const partes = data.split("-")

    if (partes.length !== 3) return data

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <main className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">
            Contratos
          </h1>

          <p className="text-muted">
            Administração de contratos
          </p>
        </div>

        <a
          href="/"
          className="btn btn-outline-secondary"
        >
          Voltar
        </a>
      </div>

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h4 className="mb-4">
            {editandoId
              ? "Editar contrato"
              : "Novo contrato"}
          </h4>

          <form onSubmit={salvarContrato}>

            <div className="row g-3">

              <div className="col-md-3">
                <label className="form-label">
                  Número *
                </label>

                <input
                  className="form-control"
                  name="numero"
                  value={form.numero}
                  onChange={alterarCampo}
                  placeholder="CTR001"
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">
                  Imóvel *
                </label>

                <input
                  className="form-control"
                  name="imovel"
                  value={form.imovel}
                  onChange={alterarCampo}
                  placeholder="IMV001"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Cliente *
                </label>

                <input
                  className="form-control"
                  name="cliente"
                  value={form.cliente}
                  onChange={alterarCampo}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Tipo
                </label>

                <select
                  className="form-select"
                  name="tipo"
                  value={form.tipo}
                  onChange={alterarCampo}
                >
                  <option>Locação</option>
                  <option>Compra e Venda</option>
                  <option>Administração</option>
                  <option>Temporada</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Início
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="inicio"
                  value={form.inicio}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Término
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="termino"
                  value={form.termino}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Valor *
                </label>

                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="valor"
                  value={form.valor}
                  onChange={alterarCampo}
                  placeholder="0.00"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={alterarCampo}
                >
                  <option>Ativo</option>
                  <option>Encerrado</option>
                  <option>Cancelado</option>
                  <option>Pendente</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">
                  Observações
                </label>

                <textarea
                  className="form-control"
                  name="observacoes"
                  value={form.observacoes}
                  onChange={alterarCampo}
                  rows="3"
                />
              </div>

            </div>

            <div className="mt-4">

              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alterações"
                    : "Cadastrar contrato"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>

        </div>
      </div>

      <div className="card shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between mb-3">

            <h4>
              Contratos cadastrados
            </h4>

            <span className="badge bg-primary">
              {contratos.length}
            </span>

          </div>

          {carregando ? (

            <div className="text-center p-4">
              Carregando...
            </div>

          ) : contratos.length === 0 ? (

            <div className="alert alert-info">
              Nenhum contrato cadastrado.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Imóvel</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {contratos.map((contrato) => (

                    <tr key={contrato.id}>

                      <td>
                        <strong>
                          {contrato.numero}
                        </strong>
                      </td>

                      <td>
                        {contrato.imovel}
                      </td>

                      <td>
                        {contrato.cliente}
                      </td>

                      <td>
                        {contrato.tipo}
                      </td>

                      <td>
                        {formatarValor(contrato.valor)}
                      </td>

                      <td>
                        <span className="badge bg-success">
                          {contrato.status}
                        </span>
                      </td>

                      <td>

                        <div className="d-flex gap-1">

                          <button
                            type="button"
                            className="btn btn-sm btn-info text-white"
                            onClick={() =>
                              setVisualizando(contrato)
                            }
                          >
                            Visualizar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              editarContrato(contrato)
                            }
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              excluirContrato(contrato.id)
                            }
                          >
                            Excluir
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

      {visualizando && (

        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)"
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Contrato {visualizando.numero}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setVisualizando(null)
                  }
                />

              </div>

              <div className="modal-body">

                <div className="row g-3">

                  <div className="col-md-6">
                    <strong>Número:</strong>
                    <p>{visualizando.numero}</p>
                  </div>

                  <div className="col-md-6">
                    <strong>Tipo:</strong>
                    <p>{visualizando.tipo}</p>
                  </div>

                  <div className="col-md-6">
                    <strong>Imóvel:</strong>
                    <p>{visualizando.imovel}</p>
                  </div>

                  <div className="col-md-6">
                    <strong>Cliente:</strong>
                    <p>{visualizando.cliente}</p>
                  </div>

                  <div className="col-md-4">
                    <strong>Início:</strong>
                    <p>
                      {formatarData(visualizando.inicio)}
                    </p>
                  </div>

                  <div className="col-md-4">
                    <strong>Término:</strong>
                    <p>
                      {formatarData(visualizando.termino)}
                    </p>
                  </div>

                  <div className="col-md-4">
                    <strong>Valor:</strong>
                    <p>
                      {formatarValor(visualizando.valor)}
                    </p>
                  </div>

                  <div className="col-md-4">
                    <strong>Status:</strong>
                    <p>{visualizando.status}</p>
                  </div>

                  <div className="col-12">
                    <strong>Observações:</strong>
                    <p>
                      {visualizando.observacoes || "-"}
                    </p>
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setVisualizando(null)
                  }
                >
                  Fechar
                </button>

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => {
                    editarContrato(visualizando)
                    setVisualizando(null)
                  }}
                >
                  Editar contrato
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  )
                    }
