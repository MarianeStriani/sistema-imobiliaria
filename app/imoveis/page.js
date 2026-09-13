"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Link from "next/link";

export default function Imoveis() {
const [imoveis, setImoveis] = useState([]);
const [form, setForm] = useState({
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
descricao: "",
});

function handleChange(e) {
setForm({
...form,
[e.target.name]: e.target.value,
});
}

function cadastrarImovel(e) {
e.preventDefault();

if (!form.codigo || !form.cidade || !form.valor) {
  alert("Preencha código, cidade e valor.");
  return;
}

setImoveis([...imoveis, form]);

setForm({
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
  descricao: "",
});

}

function excluirImovel(index) {
const novaLista = imoveis.filter((_, i) => i !== index);
setImoveis(novaLista);
}

return (
<main className="container py-4">

  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 className="fw-bold">Cadastro de Imóveis</h1>
      <p className="text-muted">
        Cadastre e gerencie os imóveis da imobiliária.
      </p>
    </div>

    <Link href="/" className="btn btn-outline-secondary">
      ← Dashboard
    </Link>
  </div>

  {/* FORMULÁRIO */}
  <div className="card shadow-sm border-0 mb-5">
    <div className="card-body p-4">

      <h3 className="mb-4">Novo imóvel</h3>

      <form onSubmit={cadastrarImovel}>

        <div className="row g-3">

          <div className="col-md-3">
            <label className="form-label">Código</label>
            <input
              type="text"
              name="codigo"
              className="form-control"
              value={form.codigo}
              onChange={handleChange}
              placeholder="Ex.: IM001"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Tipo</label>
            <select
              name="tipo"
              className="form-select"
              value={form.tipo}
              onChange={handleChange}
            >
              <option>Casa</option>
              <option>Apartamento</option>
              <option>Terreno</option>
              <option>Comercial</option>
              <option>Chácara</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Finalidade</label>
            <select
              name="finalidade"
              className="form-select"
              value={form.finalidade}
              onChange={handleChange}
            >
              <option>Venda</option>
              <option>Aluguel</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              <option>Disponível</option>
              <option>Reservado</option>
              <option>Alugado</option>
              <option>Vendido</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Cidade</label>
            <input
              type="text"
              name="cidade"
              className="form-control"
              value={form.cidade}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Bairro</label>
            <input
              type="text"
              name="bairro"
              className="form-control"
              value={form.bairro}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Endereço</label>
            <input
              type="text"
              name="endereco"
              className="form-control"
              value={form.endereco}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Quartos</label>
            <input
              type="number"
              name="quartos"
              className="form-control"
              value={form.quartos}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Banheiros</label>
            <input
              type="number"
              name="banheiros"
              className="form-control"
              value={form.banheiros}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Vagas</label>
            <input
              type="number"
              name="vagas"
              className="form-control"
              value={form.vagas}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Valor</label>
            <input
              type="number"
              name="valor"
              className="form-control"
              value={form.valor}
              onChange={handleChange}
              placeholder="R$"
            />
          </div>

          <div className="col-12">
            <label className="form-label">Descrição</label>
            <textarea
              name="descricao"
              className="form-control"
              rows="4"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Descrição do imóvel..."
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              + Cadastrar imóvel
            </button>
          </div>

        </div>

      </form>
    </div>
  </div>

  {/* LISTAGEM */}
  <div className="card shadow-sm border-0">
    <div className="card-body p-4">

      <h3 className="mb-4">
        Imóveis cadastrados ({imoveis.length})
      </h3>

      {imoveis.length === 0 ? (
        <div className="alert alert-info">
          Nenhum imóvel cadastrado ainda.
        </div>
      ) : (
        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Finalidade</th>
                <th>Localização</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {imoveis.map((imovel, index) => (
                <tr key={index}>

                  <td>
                    <strong>{imovel.codigo}</strong>
                  </td>

                  <td>{imovel.tipo}</td>

                  <td>{imovel.finalidade}</td>

                  <td>
                    {imovel.bairro}
                    <br />
                    <small className="text-muted">
                      {imovel.cidade}
                    </small>
                  </td>

                  <td>
                    R$ {Number(imovel.valor).toLocaleString("pt-BR")}
                  </td>

                  <td>
                    <span className="badge bg-success">
                      {imovel.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => excluirImovel(index)}
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

);
                }
