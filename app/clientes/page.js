"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Link from "next/link";

export default function Clientes() {
const [clientes, setClientes] = useState([]);

const [form, setForm] = useState({
nome: "",
tipo: "Proprietário",
documento: "",
telefone: "",
email: "",
endereco: "",
cidade: "",
});

function handleChange(e) {
setForm({
...form,
[e.target.name]: e.target.value,
});
}

function cadastrarCliente(e) {
e.preventDefault();

if (!form.nome || !form.telefone) {
  alert("Preencha pelo menos o nome e o telefone.");
  return;
}

setClientes([...clientes, form]);

setForm({
  nome: "",
  tipo: "Proprietário",
  documento: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
});

}

function excluirCliente(index) {
const novaLista = clientes.filter((_, i) => i !== index);
setClientes(novaLista);
}

return (
<main className="container py-4">

  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 className="fw-bold">Cadastro de Clientes</h1>
      <p className="text-muted">
        Gerencie proprietários, compradores e inquilinos.
      </p>
    </div>

    <Link href="/" className="btn btn-outline-secondary">
      ← Dashboard
    </Link>
  </div>

  {/* FORMULÁRIO */}
  <div className="card shadow-sm border-0 mb-5">
    <div className="card-body p-4">

      <h3 className="mb-4">Novo cliente</h3>

      <form onSubmit={cadastrarCliente}>

        <div className="row g-3">

          <div className="col-md-6">
            <label className="form-label">
              Nome completo
            </label>

            <input
              type="text"
              name="nome"
              className="form-control"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite o nome"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Tipo de cliente
            </label>

            <select
              name="tipo"
              className="form-select"
              value={form.tipo}
              onChange={handleChange}
            >
              <option>Proprietário</option>
              <option>Comprador</option>
              <option>Inquilino</option>
              <option>Fiador</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              CPF/CNPJ
            </label>

            <input
              type="text"
              name="documento"
              className="form-control"
              value={form.documento}
              onChange={handleChange}
              placeholder="CPF ou CNPJ"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Telefone
            </label>

            <input
              type="tel"
              name="telefone"
              className="form-control"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              E-mail
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
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
              className="form-control"
              value={form.cidade}
              onChange={handleChange}
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
              className="form-control"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Endereço completo"
            />
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-success"
            >
              + Cadastrar cliente
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
        Clientes cadastrados ({clientes.length})
      </h3>

      {clientes.length === 0 ? (
        <div className="alert alert-info">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>CPF/CNPJ</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Cidade</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>

              {clientes.map((cliente, index) => (

                <tr key={index}>

                  <td>
                    <strong>{cliente.nome}</strong>
                  </td>

                  <td>
                    <span className="badge bg-primary">
                      {cliente.tipo}
                    </span>
                  </td>

                  <td>{cliente.documento}</td>

                  <td>{cliente.telefone}</td>

                  <td>{cliente.email}</td>

                  <td>{cliente.cidade}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => excluirCliente(index)}
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
