"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const formularioInicial = {
  codigo: "",
  tipo: "",
  finalidade: "",
  cidade: "",
  bairro: "",
  endereco: "",
  quartos: "",
  banheiros: "",
  vagas: "",
  valor: "",
  status: "Disponível",
  descricao: ""
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState([])
  const [form, setForm] = useState(formularioInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [visualizando, setVisualizando] = useState(null)

  useEffect(() => {
    carregarImoveis()
  }, [])

  async function carregarImoveis() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      alert("Erro ao carregar imóveis: " + error.message)
    } else {
      setImoveis(data || [])
    }

    setCarregando(false)
  }

  function alterarCampo(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  function prepararEdicao(imovel) {
    setEditandoId(imovel.id)

    setForm({
      codigo: imovel.codigo || "",
      tipo: imovel.tipo || "",
      finalidade: imovel.finalidade || "",
      cidade: imovel.cidade || "",
      bairro: imovel.bairro || "",
      endereco: imovel.endereco || "",
      quartos: imovel.quartos ?? "",
      banheiros: imovel.banheiros ?? "",
      vagas: imovel.vagas ?? "",
      valor: imovel.valor ?? "",
      status: imovel.status || "Disponível",
      descricao: imovel.descricao || ""
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

  async function salvarImovel(e) {
    e.preventDefault()

    if (
      !form.codigo ||
      !form.tipo ||
      !form.finalidade ||
      !form.cidade ||
      !form.valor
    ) {
      alert("Preencha os campos obrigatórios.")
      return
    }

    setSalvando(true)

    const dados = {
      codigo: form.codigo,
      tipo: form.tipo,
      finalidade: form.finalidade,
      cidade: form.cidade,
      bairro: form.bairro || null,
      endereco: form.endereco || null,
      quartos: form.quartos !== "" ? Number(form.quartos) : null,
      banheiros: form.banheiros !== "" ? Number(form.banheiros) : null,
      vagas: form.vagas !== "" ? Number(form.vagas) : null,
      valor: Number(form.valor),
      status: form.status,
      descricao: form.descricao || null
    }

    if (editandoId) {
      const { data, error } = await supabase
        .from("imoveis")
        .update(dados)
        .eq("id", editandoId)
        .select()

      if (error) {
        console.error(error)
        alert("Erro ao editar imóvel: " + error.message)
      } else {
        setImoveis(
          imoveis.map((imovel) =>
            imovel.id === editandoId ? data[0] : imovel
          )
        )

        alert("Imóvel atualizado com sucesso!")
        cancelarEdicao()
      }
    } else {
      const { data, error } = await supabase
        .from("imoveis")
        .insert([dados])
        .select()

      if (error) {
        console.error(error)
        alert("Erro ao cadastrar imóvel: " + error.message)
      } else {
        setImoveis([data[0], ...imoveis])
        setForm(formularioInicial)
        alert("Imóvel cadastrado com sucesso!")
      }
    }

    setSalvando(false)
  }

  async function excluirImovel(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este imóvel?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("imoveis")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      alert("Erro ao excluir imóvel: " + error.message)
      return
    }

    setImoveis(imoveis.filter((imovel) => imovel.id !== id))

    if (visualizando?.id === id) {
      setVisualizando(null)
    }

    alert("Imóvel excluído com sucesso!")
  }

  function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "-"
    }

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  return (
    <main className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Imóveis</h1>
          <p className="text-muted mb-0">
            Administração de imóveis
          </p>
        </div>

        <a href="/" className="btn btn-outline-secondary">
          Voltar
        </a>
      </div>

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h5 className="mb-0">
            {editandoId
              ? "Editar imóvel"
              : "Cadastrar imóvel"}
          </h5>
        </div>

        <div className="card-body">

          <form onSubmit={salvarImovel}>

            <div className="row g-3">

              <div className="col-md-3">
                <label className="form-label">
                  Código *
                </label>

                <input
                  type="text"
                  name="codigo"
                  className="form-control"
                  value={form.codigo}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Tipo *
                </label>

                <select
                  name="tipo"
                  className="form-select"
                  value={form.tipo}
                  onChange={alterarCampo}
                >
                  <option value="">Selecione</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Chácara">Chácara</option>
                  <option value="Sítio">Sítio</option>
                  <option value="Galpão">Galpão</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Finalidade *
                </label>

                <select
                  name="finalidade"
                  className="form-select"
                  value={form.finalidade}
                  onChange={alterarCampo}
                >
                  <option value="">Selecione</option>
                  <option value="Venda">Venda</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Venda e Aluguel">
                    Venda e Aluguel
                  </option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Cidade *
                </label>

                <input
                  type="text"
                  name="cidade"
                  className="form-control"
                  value={form.cidade}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Bairro
                </label>

                <input
                  type="text"
                  name="bairro"
                  className="form-control"
                  value={form.bairro}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">
                  Endereço
                </label>

                <input
                  type="text"
                  name="endereco"
                  className="form-control"
                  value={form.endereco}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Quartos
                </label>

                <input
                  type="number"
                  name="quartos"
                  className="form-control"
                  min="0"
                  value={form.quartos}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Banheiros
                </label>

                <input
                  type="number"
                  name="banheiros"
                  className="form-control"
                  min="0"
                  value={form.banheiros}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Vagas
                </label>

                <input
                  type="number"
                  name="vagas"
                  className="form-control"
                  min="0"
                  value={form.vagas}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Valor *
                </label>

                <input
                  type="number"
                  name="valor"
                  className="form-control"
                  min="0"
                  step="0.01"
                  value={form.valor}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={alterarCampo}
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Alugado">Alugado</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">
                  Descrição
                </label>

                <textarea
                  name="descricao"
                  className="form-control"
                  rows="3"
                  value={form.descricao}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-12 d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : editandoId
                      ? "Salvar alterações"
                      : "Cadastrar imóvel"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelarEdicao}
                  >
                    Cancelar edição
                  </button>
                )}

              </div>

            </div>

          </form>

        </div>
      </div>

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">
            Imóveis cadastrados
          </h5>

          <span className="badge bg-primary">
            {imoveis.length}
          </span>

        </div>

        <div className="card-body">

          {carregando ? (

            <p>Carregando imóveis...</p>

          ) : imoveis.length === 0 ? (

            <div className="alert alert-info mb-0">
              Nenhum imóvel cadastrado.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Finalidade</th>
                    <th>Cidade</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {imoveis.map((imovel) => (

                    <tr key={imovel.id}>

                      <td>
                        <strong>
                          {imovel.codigo}
                        </strong>
                      </td>

                      <td>
                        {imovel.tipo}
                      </td>

                      <td>
                        {imovel.finalidade}
                      </td>

                      <td>
                        {imovel.cidade}
                      </td>

                      <td>
                        {formatarValor(imovel.valor)}
                      </td>

                      <td>
                        <span className="badge bg-success">
                          {imovel.status}
                        </span>
                      </td>

                      <td>

                        <div className="d-flex gap-1">

                          <button
                            className="btn btn-sm btn-info text-white"
                            onClick={() =>
                              setVisualizando(imovel)
                            }
                          >
                            Visualizar
                          </button>

                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              prepararEdicao(imovel)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              excluirImovel(imovel.id)
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
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Detalhes do imóvel
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setVisualizando(null)}
                />

              </div>

              <div className="modal-body">

                <div className="row g-3">

                  <div className="col-md-4">
                    <strong>Código</strong>
                    <div>{visualizando.codigo}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Tipo</strong>
                    <div>{visualizando.tipo}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Finalidade</strong>
                    <div>{visualizando.finalidade}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Cidade</strong>
                    <div>{visualizando.cidade}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Bairro</strong>
                    <div>{visualizando.bairro || "-"}</div>
                  </div>

                  <div className="col-12">
                    <strong>Endereço</strong>
                    <div>{visualizando.endereco || "-"}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Quartos</strong>
                    <div>{visualizando.quartos ?? "-"}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Banheiros</strong>
                    <div>{visualizando.banheiros ?? "-"}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Vagas</strong>
                    <div>{visualizando.vagas ?? "-"}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Valor</strong>
                    <div>
                      {formatarValor(visualizando.valor)}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Status</strong>
                    <div>{visualizando.status}</div>
                  </div>

                  <div className="col-12">
                    <strong>Descrição</strong>
                    <div>
                      {visualizando.descricao || "-"}
                    </div>
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setVisualizando(null)}
                >
                  Fechar
                </button>

                <button
                  className="btn btn-warning"
                  onClick={() => {
                    prepararEdicao(visualizando)
                    setVisualizando(null)
                  }}
                >
                  Editar imóvel
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  )
                    
    setSalvando(false)
  }

  async function excluirImovel(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este imóvel?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("imoveis")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      alert("Erro ao excluir imóvel: " + error.message)
      return
    }

    setImoveis(imoveis.filter((imovel) => imovel.id !== id))
  }

  function formatarValor(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  return (
    <main className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Imóveis</h1>
          <p className="text-muted mb-0">
            Cadastro e administração de imóveis
          </p>
        </div>

        <a href="/" className="btn btn-outline-secondary">
          Voltar
        </a>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Cadastrar imóvel</h5>
        </div>

        <div className="card-body">
          <form onSubmit={adicionarImovel}>

            <div className="row g-3">

              <div className="col-md-3">
                <label className="form-label">
                  Código *
                </label>

                <input
                  type="text"
                  name="codigo"
                  className="form-control"
                  value={form.codigo}
                  onChange={alterarCampo}
                  placeholder="Ex.: IM001"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Tipo *
                </label>

                <select
                  name="tipo"
                  className="form-select"
                  value={form.tipo}
                  onChange={alterarCampo}
                >
                  <option value="">Selecione</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Chácara">Chácara</option>
                  <option value="Sítio">Sítio</option>
                  <option value="Galpão">Galpão</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Finalidade *
                </label>

                <select
                  name="finalidade"
                  className="form-select"
                  value={form.finalidade}
                  onChange={alterarCampo}
                >
                  <option value="">Selecione</option>
                  <option value="Venda">Venda</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Venda e Aluguel">
                    Venda e Aluguel
                  </option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Cidade *
                </label>

                <input
                  type="text"
                  name="cidade"
                  className="form-control"
                  value={form.cidade}
                  onChange={alterarCampo}
                  placeholder="Cidade"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Bairro
                </label>

                <input
                  type="text"
                  name="bairro"
                  className="form-control"
                  value={form.bairro}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">
                  Endereço
                </label>

                <input
                  type="text"
                  name="endereco"
                  className="form-control"
                  value={form.endereco}
                  onChange={alterarCampo}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Quartos
                </label>

                <input
                  type="number"
                  name="quartos"
                  className="form-control"
                  value={form.quartos}
                  onChange={alterarCampo}
                  min="0"
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Banheiros
                </label>

                <input
                  type="number"
                  name="banheiros"
                  className="form-control"
                  value={form.banheiros}
                  onChange={alterarCampo}
                  min="0"
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Vagas
                </label>

                <input
                  type="number"
                  name="vagas"
                  className="form-control"
                  value={form.vagas}
                  onChange={alterarCampo}
                  min="0"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Valor *
                </label>

                <input
                  type="number"
                  name="valor"
                  className="form-control"
                  value={form.valor}
                  onChange={alterarCampo}
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={alterarCampo}
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Alugado">Alugado</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">
                  Descrição
                </label>

                <textarea
                  name="descricao"
                  className="form-control"
                  rows="3"
                  value={form.descricao}
                  onChange={alterarCampo}
                  placeholder="Descrição do imóvel"
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Cadastrar imóvel"}
                </button>
              </div>

            </div>

          </form>
        </div>
      </div>

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">
            Imóveis cadastrados
          </h5>

          <span className="badge bg-primary">
            {imoveis.length}
          </span>
        </div>

        <div className="card-body">

          {carregando ? (
            <p>Carregando imóveis...</p>
          ) : imoveis.length === 0 ? (
            <div className="alert alert-info mb-0">
              Nenhum imóvel cadastrado.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Finalidade</th>
                    <th>Cidade</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {imoveis.map((imovel) => (

                    <tr key={imovel.id}>

                      <td>
                        <strong>{imovel.codigo}</strong>
                      </td>

                      <td>
                        {imovel.tipo}
                      </td>

                      <td>
                        {imovel.finalidade}
                      </td>

                      <td>
                        {imovel.cidade}
                      </td>

                      <td>
                        {formatarValor(imovel.valor)}
                      </td>

                      <td>
                        <span className="badge bg-success">
                          {imovel.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => excluirImovel(imovel.id)}
                        >
                          Excluir
                        </button>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </main>
  )
                    }
