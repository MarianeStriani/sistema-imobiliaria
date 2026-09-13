"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Link from "next/link";

export default function Contratos() {
const [contratos, setContratos] = useState([]);

const [form, setForm] = useState({
numero: "",
imovel: "",
cliente: "",
tipo: "Locação",
inicio: "",
termino: "",
valor: "",
status: "Ativo",
observacoes: "",
});

function handleChange(e) {
setForm({
...form,
[e.target.name]: e.target.value,
});
}

function cadastrarContrato(e) {
e.preventDefault();

if (!form.numero || !form.imovel || !form.cliente || !form.valor) {
  alert("Preencha número, imóvel, cliente e valor.");
  return;
}

setContratos([...contratos, form]);

setForm({
  numero: "",
  imovel: "",
  cliente: "",
  tipo: "Locação",
  inicio: "",
  termino: "",
  valor: "",
  status: "Ativo",
  observacoes: "",
});

}

function excluirContrato(index) {
const novaLista = contratos.filter((_, i) => i !== index);
setContratos(novaLista);
}

return (
<main className="container py-4">

  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 className="fw-bold">Gestão de Contratos</h1>
      <p className="text-muted">
        Controle contratos de locação e venda.
      </p>
    </div>

    <Link href="/" className="btn btn-outline-secondary">
      ← Dashboard
    </Link>
  </div>

  {/* FORMULÁRIO */}
  <div className="card shadow-sm border-0 mb-5">
    <div className="card-body p-4">

      <h3 className="mb-4">Novo contrato</h3>

      <form onSubmit={cadastrarContrato}>

        <div className="row g-3">

          <div className="col-md-3">
            <label className="form-label">
              Nº do contrato
            </label>

            <input
              type="text"
              name="numero"
              className="form-control"
              value={form.numero}
              onChange={handleChange}
              placeholder="Ex.: CT001"
            />
          </div>

          <div className="col-md-5">
            <label className="form-label">
              Imóvel
            </label>

            <input
              type="text"
              name="imovel"
              className="form-control"
              value={form.imovel}
              onChange={handleChange}
              placeholder="Código ou endereço do imóvel"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Cliente
            </label>

            <input
              type="text"
              name="cliente"
              className="form-control"
              value={form.cliente}
              onChange={handleChange}
              placeholder="Nome do cliente"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Tipo
            </label>

            <select
              name="tipo"
              className="form-select"
              value={form.tipo}
              onChange={handleChange}
            >
              <option>Locação</option>
              <option>Venda</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Data de início
            </label>

            <input
              type="date"
              name="inicio"
              className="form-control"
              value={form.inicio}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Data de término
            </label>

            <input
              type="date"
              name="termino"
              className="form-control"
              value={form.termino}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Valor
            </label>

            <input
              type="number"
              name="valor"
              className="form-control"
              value={form.valor}
              onChange={handleChange}
              placeholder="R$"
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
              onChange={handleChange}
            >
              <option>Ativo</option>
              <option>Pendente</option>
              <option>Encerrado</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">
              Observações
            </label>

            <textarea
              name="observacoes"
              className="form-control"
              rows="4"
              value={form.observacoes}
              onChange={handleChange}
              placeholder="Observações sobre o contrato..."
            />
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-dark"
            >
              + Cadastrar contrato
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
        Contratos cadastrados ({contratos.length})
      </h3>

      {contratos.length === 0 ? (
        <div className="alert alert-info">
          Nenhum contrato cadastrado ainda.
        </div>
      ) : (

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead>
              <tr>
                <th>Nº</th>
                <th>Imóvel</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Período</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>

              {contratos.map((contrato, index) => (

                <tr key={index}>

                  <td>
                    <strong>{contrato.numero}</strong>
                  </td>

                  <td>{contrato.imovel}</td>

                  <td>{contrato.cliente}</td>

                  <td>{contrato.tipo}</td>

                  <td>
                    {contrato.inicio || "-"}
                    <br />
                    <small className="text-muted">
                      até {contrato.termino || "-"}
                    </small>
                  </td>

                  <td>
                    R$ {Number(contrato.valor).toLocaleString("pt-BR")}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        contrato.status === "Ativo"
                          ? "bg-success"
                          : contrato.status === "Pendente"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {contrato.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => excluirContrato(index)}
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
