"use client";

import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  return (
    <main className="container py-5">
      <h1 className="mb-4">Sistema de Administração de Imóveis</h1>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card p-4 shadow-sm">
            <h3>Imóveis</h3>
            <p>Cadastre e gerencie os imóveis.</p>
            <button className="btn btn-primary">
              Acessar imóveis
            </button>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-4 shadow-sm">
            <h3>Clientes</h3>
            <p>Gerencie proprietários e inquilinos.</p>
            <button className="btn btn-success">
              Acessar clientes
            </button>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-4 shadow-sm">
            <h3>Contratos</h3>
            <p>Controle os contratos de locação.</p>
            <button className="btn btn-dark">
              Acessar contratos
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
