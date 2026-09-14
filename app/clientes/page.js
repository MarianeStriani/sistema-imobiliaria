"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const formularioInicial = {
nome: "",
tipo: "Pessoa Física",
documento: "",
telefone: "",
email: "",
endereco: "",
cidade: ""
}

export default function ClientesPage() {
const [clientes, setClientes] = useState([])
const [form, setForm] = useState(formularioInicial)
const [editandoId, setEditandoId] = useState(null)
const [carregando, setCarregando] = useState(true)
const [salvando, setSalvando] = useState(false)
const [visualizando, setVisualizando] = useState(null)

useEffect(() => {
carregarClientes()
}, [])

async function carregarClientes() {
setCarregando(true)

const { data, error } = await supabase
  .from("clientes")
  .select("*")
  .order("id", { ascending: false })

if (error) {
  console.error(error)
  alert("Erro ao carregar clientes.")
} else {
  setClientes(data || [])
}

setCarregando(false)

}

function alterarCampo(e) {
const { name, value } = e.target

setForm((anterior) => ({
  ...anterior,
  [name]: value
}))

}

function prepararEdicao(cliente) {
setEditandoId(cliente.id)

setForm({
  nome: cliente.nome || "",
  tipo: cliente.tipo || "Pessoa Física",
  documento: cliente.documento || "",
  telefone: cliente.telefone || "",
  email: cliente.email || "",
  endereco: cliente.endereco || "",
  cidade: cliente.cidade || ""
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

async function salvarCliente(e) {
e.preventDefault()

if (!form.nome || !form.telefone) {
  alert("Preencha nome e telefone.")
  return
}

setSalvando(true)

const dados = {
  nome: form.nome,
  tipo: form.tipo,
  documento: form.documento,
  telefone: form.telefone,
  email: form.email,
  endereco: form.endereco,
  cidade: form.cidade
}

if (editandoId) {
  const { data, error } = await supabase
    .from("clientes")
    .update(dados)
    .eq("id", editandoId)
    .select()

  if (error) {
    console.error(error)
    alert("Erro ao atualizar cliente.")
  } else {
    setClientes((anterior) =>
      anterior.map((item) =>
        item.id === editandoId ? data[0] : item
      )
    )

    alert("Cliente atualizado com sucesso!")
    cancelarEdicao()
  }
} else {
  const { data, error } = await supabase
    .from("clientes")
    .insert([dados])
    .select()

  if (error) {
    console.error(error)
    alert("Erro ao cadastrar cliente.")
  } else {
    setClientes((anterior) => [data[0], ...anterior])
    setForm(formularioInicial)

    alert("Cliente cadastrado com sucesso!")
  }
}

setSalvando(false)

}

async function excluirCliente(id) {
const confirmar = window.confirm(
"Tem certeza que deseja excluir este cliente?"
)

if (!confirmar) return

const { error } = await supabase
  .from("clientes")
  .delete()
  .eq("id", id)

if (error) {
  console.error(error)
  alert("Erro ao excluir cliente.")
  return
}

setClientes((anterior) =>
  anterior.filter((item) => item.id !== id)
)

if (visualizando?.id === id) {
  setVisualizando(null)
}

alert("Cliente excluído com sucesso!")

}

return (
<main className="container py-4">

  {/* TÍTULO */}

  <div className="d-flex justify-content-between align-items-center mb-3">

    <div>
      <h1 className="fw-bold mb-1">
        Clientes
      </h1>

      <p className="text-muted mb-0">
        Administração de clientes
      </p>
    </div>

    <button
      type="button"
      className="btn btn-outline-primary"
      onClick={carregarClientes}
      disabled={carregando}
    >
      {carregando
        ? "Atualizando..."
        : "🔄 Atualizar"}
    </button>

  </div>

  {/* ACESSO RÁPIDO */}

  <div className="card shadow-sm mb-4">

    <div className="card-body">

      <h5 className="fw-bold mb-3">
        ⚡ Acesso rápido
      </h5>

      <div className="d-flex gap-2 flex-wrap">

        <a
          href="/"
          className="btn btn-primary"
        >
          🏠 Início
        </a>

        <a
          href="/clientes"
          className="btn btn-light border"
        >
          👥 Clientes
        </a>

        <a
          href="/imoveis"
          className="btn btn-light border"
        >
          🏢 Imóveis
        </a>

        <a
          href="/contratos"
          className="btn btn-light border"
        >
          📄 Contratos
        </a>

        <a
          href="/recebimentos"
          className="btn btn-light border"
        >
          💰 Recebimentos
        </a>

        <a
          href="/despesas"
          className="btn btn-light border"
        >
          💸 Despesas
        </a>

        <a
          href="/financeiro"
          className="btn btn-light border"
        >
          📊 Financeiro
        </a>

      </div>

    </div>

  </div>

  <div className="card shadow-sm mb-4">
    <div className="card-body">

      <h4 className="mb-4">
        {editandoId ? "Editar cliente" : "Cadastrar cliente"}
      </h4>

      <form onSubmit={salvarCliente}>

        <div className="row g-3">

          <div className="col-md-6">
            <label className="form-label">
              Nome *
            </label>

            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={alterarCampo}
              className="form-control"
              placeholder="Nome completo"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Tipo *
            </label>

            <select
              name="tipo"
              value={form.tipo}
              onChange={alterarCampo}
              className="form-select"
            >
              <option>Pessoa Física</option>
              <option>Pessoa Jurídica</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              CPF / CNPJ
            </label>

            <input
              type="text"
              name="documento"
              value={form.documento}
              onChange={alterarCampo}
              className="form-control"
              placeholder="CPF ou CNPJ"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Telefone *
            </label>

            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={alterarCampo}
              className="form-control"
              placeholder="(13) 99999-9999"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              E-mail
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={alterarCampo}
              className="form-control"
              placeholder="cliente@email.com"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Cidade
            </label>

            <input
              type="text"
              name="cidade"
              value={form.cidade}
              onChange={alterarCampo}
              className="form-control"
              placeholder="Cidade"
            />
          </div>

          <div className="col-12">
            <label className="form-label">
              Endereço
            </label>

            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={alterarCampo}
              className="form-control"
              placeholder="Rua, número, bairro..."
            />
          </div>

        </div>

        <div className="mt-4 d-flex gap-2">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : editandoId
                ? "Salvar alterações"
                : "Cadastrar cliente"}
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

      <div className="d-flex justify-content-between align-items-center mb-3">

        <h4 className="mb-0">
          Clientes cadastrados
        </h4>

        <span className="badge bg-primary">
          {clientes.length}
        </span>

      </div>

      {carregando ? (
        <div className="text-center py-4">
          Carregando clientes...
        </div>
      ) : clientes.length === 0 ? (
        <div className="alert alert-info">
          Nenhum cliente cadastrado.
        </div>
      ) : (

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Cidade</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>

              {clientes.map((cliente) => (

                <tr key={cliente.id}>

                  <td>
                    <strong>{cliente.nome}</strong>
                  </td>

                  <td>
                    {cliente.tipo}
                  </td>

                  <td>
                    {cliente.documento || "-"}
                  </td>

                  <td>
                    {cliente.telefone}
                  </td>

                  <td>
                    {cliente.email || "-"}
                  </td>

                  <td>
                    {cliente.cidade || "-"}
                  </td>

                  <td>

                    <div className="d-flex gap-2 flex-wrap">

                      <button
                        type="button"
                        className="btn btn-sm btn-info text-white"
                        onClick={() =>
                          setVisualizando(cliente)
                        }
                      >
                        Visualizar
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-warning"
                        onClick={() =>
                          prepararEdicao(cliente)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          excluirCliente(cliente.id)
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
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)"
      }}
    >

      <div className="modal-dialog modal-lg modal-dialog-centered">

        <div className="modal-content">

          <div className="modal-header">

            <h5 className="modal-title">
              Dados do cliente
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
                <strong>Nome:</strong>
                <div>
                  {visualizando.nome}
                </div>
              </div>

              <div className="col-md-6">
                <strong>Tipo:</strong>
                <div>
                  {visualizando.tipo}
                </div>
              </div>

              <div className="col-md-6">
                <strong>CPF / CNPJ:</strong>
                <div>
                  {visualizando.documento || "-"}
                </div>
              </div>

              <div className="col-md-6">
                <strong>Telefone:</strong>
                <div>
                  {visualizando.telefone}
                </div>
              </div>

              <div className="col-md-6">
                <strong>E-mail:</strong>
                <div>
                  {visualizando.email || "-"}
                </div>
              </div>

              <div className="col-md-6">
                <strong>Cidade:</strong>
                <div>
                  {visualizando.cidade || "-"}
                </div>
              </div>

              <div className="col-12">
                <strong>Endereço:</strong>
                <div>
                  {visualizando.endereco || "-"}
                </div>
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
                prepararEdicao(visualizando)
                setVisualizando(null)
              }}
            >
              Editar cliente
            </button>

          </div>

        </div>

      </div>

    </div>

  )}

</main>

)
}