"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const formularioInicial = {
  codigo: "",
  tipo: "Casa",
  finalidade: "Venda",
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
      alert("Erro ao carregar imóveis.")
    } else {
      setImoveis(data || [])
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

  function prepararEdicao(imovel) {
    setEditandoId(imovel.id)

    setForm({
      codigo: imovel.codigo || "",
      tipo: imovel.tipo || "Casa",
      finalidade: imovel.finalidade || "Venda",
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

    if (!form.codigo || !form.cidade || !form.valor) {
      alert("Preencha código, cidade e valor.")
      return
    }

    setSalvando(true)

    const dados = {
      codigo: form.codigo,
      tipo: form.tipo,
      finalidade: form.finalidade,
      cidade: form.cidade,
      bairro: form.bairro,
      endereco: form.endereco,
      quartos: form.quartos === "" ? null : Number(form.quartos),
      banheiros: form.banheiros === "" ? null : Number(form.banheiros),
      vagas: form.vagas === "" ? null : Number(form.vagas),
      valor: Number(form.valor),
      status: form.status,
      descricao: form.descricao
    }

    if (editandoId) {
      const { data, error } = await supabase
        .from("imoveis")
        .update(dados)
        .eq("id", editandoId)
        .select()

      if (error) {
        console.error(error)
        alert("Erro ao atualizar imóvel.")
      } else {
        setImoveis((anterior) =>
          anterior.map((item) =>
            item.id === editandoId ? data[0] : item
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
        alert("Erro ao cadastrar imóvel.")
      } else {
        setImoveis((anterior) => [data[0], ...anterior])
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
      alert("Erro ao excluir imóvel.")
      return
    }

    setImoveis((anterior) =>
      anterior.filter((item) => item.id !== id)
    )

    if (visualizando?.id === id) {
      setVisualizando(null)
    }

    alert("Imóvel excluído com sucesso!")
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  return (
    <main className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Imóveis</h1>
          <p className="text-muted mb-0">
            Administração de imóveis
          </p>
        </div>

        <a href="/" className="btn btn-outline-secondary">
          Voltar
        </a>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h4 className="mb-4">
            {editandoId ? "Editar imóvel" : "Cadastrar imóvel"}
          </h4>

          <form onSubmit={salvarImovel}>

            <div className="row g-3">

              <div className="col-md-3">
                <label className="form-label">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={form.codigo}
                  onChange={alterarCampo}
                  className="form-control"
                  placeholder="IMV001"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={alterarCampo}
                  className="form-select"
                >
                  <option>Casa</option>
                  <option>Apartamento</option>
                  <option>Terreno</option>
                  <option>Comercial</option>
                  <option>Chácara</option>
                  <option>Sítio</option>
                  <option>Galpão</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Finalidade</label>
                <select
                  name="finalidade"
                  value={form.finalidade}
                  onChange={alterarCampo}
                  className="form-select"
                >
                  <option>Venda</option>
                  <option>Aluguel</option>
                  <option>Venda e Aluguel</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={alterarCampo}
                  className="form-select"
                >
                  <option>Disponível</option>
                  <option>Reservado</option>
                  <option>Vendido</option>
                  <option>Alugado</option>
                  <option>Inativo</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={form.cidade}
                  onChange={alterarCampo}
                  className="form-control"
                  placeholder="Cidade"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={form.bairro}
                  onChange={alterarCampo}
                  className="form-control"
                  placeholder="Bairro"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={form.endereco}
                  onChange={alterarCampo}
                  className="form-control"
                  placeholder="Rua, número..."
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Quartos</label>
                <input
                  type="number"
                  name="quartos"
                  value={form.quartos}
                  onChange={alterarCampo}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Banheiros</label>
                <input
                  type="number"
                  name="banheiros"
                  value={form.banheiros}
                  onChange={alterarCampo}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Vagas</label>
                <input
                  type="number"
                  name="vagas"
                  value={form.vagas}
                  onChange={alterarCampo}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Valor</label>
                <input
                  type="number"
                  name="valor"
                  value={form.valor}
                  onChange={alterarCampo}
                  className="form-control"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Descrição</label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={alterarCampo}
                  className="form-control"
                  rows="3"
                  placeholder="Descrição do imóvel..."
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
                    : "Cadastrar imóvel"}
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
            <h4 className="mb-0">Imóveis cadastrados</h4>

            <span className="badge bg-primary">
              {imoveis.length}
            </span>
          </div>

          {carregando ? (
            <div className="text-center py-4">
              Carregando imóveis...
            </div>
          ) : imoveis.length === 0 ? (
            <div className="alert alert-info">
              Nenhum imóvel cadastrado.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Cidade</th>
                    <th>Finalidade</th>
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

                      <td>{imovel.tipo}</td>

                      <td>
                        {imovel.cidade}
                        {imovel.bairro && (
                          <small className="d-block text-muted">
                            {imovel.bairro}
                          </small>
                        )}
                      </td>

                      <td>{imovel.finalidade}</td>

                      <td>
                        <strong>
                          {formatarValor(imovel.valor)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            imovel.status === "Disponível"
                              ? "bg-success"
                              : imovel.status === "Vendido"
                                ? "bg-danger"
                                : imovel.status === "Alugado"
                                  ? "bg-warning text-dark"
                                  : "bg-secondary"
                          }`}
                        >
                          {imovel.status}
                        </span>
                      </td>

                      <td>

                        <div className="d-flex gap-2 flex-wrap">

                          <button
                            type="button"
                            className="btn btn-sm btn-info text-white"
                            onClick={() => setVisualizando(imovel)}
                          >
                            Visualizar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            onClick={() => prepararEdicao(imovel)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => excluirImovel(imovel.id)}
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
                  Imóvel {visualizando.codigo}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setVisualizando(null)}
                />

              </div>

              <div className="modal-body">

                <div className="row g-3">

                  <div className="col-md-6">
                    <strong>Tipo:</strong>
                    <div>{visualizando.tipo}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Finalidade:</strong>
                    <div>{visualizando.finalidade}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Cidade:</strong>
                    <div>{visualizando.cidade}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Bairro:</strong>
                    <div>{visualizando.bairro || "-"}</div>
                  </div>

                  <div className="col-12">
                    <strong>Endereço:</strong>
                    <div>{visualizando.endereco || "-"}</div>
                  </div>

                  <div className="col-md-3">
                    <strong>Quartos:</strong>
                    <div>{visualizando.quartos ?? "-"}</div>
                  </div>

                  <div className="col-md-3">
                    <strong>Banheiros:</strong>
                    <div>{visualizando.banheiros ?? "-"}</div>
                  </div>

                  <div className="col-md-3">
                    <strong>Vagas:</strong>
                    <div>{visualizando.vagas ?? "-"}</div>
                  </div>

                  <div className="col-md-3">
                    <strong>Valor:</strong>
                    <div>{formatarValor(visualizando.valor)}</div>
                  </div>

                  <div className="col-12">
                    <strong>Status:</strong>
                    <div>{visualizando.status}</div>
                  </div>

                  <div className="col-12">
                    <strong>Descrição:</strong>
                    <div>
                      {visualizando.descricao || "Sem descrição."}
                    </div>
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setVisualizando(null)}
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
                  Editar imóvel
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  )
                    }
