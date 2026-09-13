"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";

export default function Home() {
return (
<main className="container py-5">
<div className="d-flex justify-content-between align-items-center mb-5">
<div>
<h1 className="fw-bold">Sistema de Administração de Imóveis</h1>
<p className="text-muted mb-0">
Painel de controle da imobiliária
</p>
</div>

    <span className="badge bg-primary fs-6">
      Administração
    </span>
  </div>

  <div className="row g-4">

    {/* IMÓVEIS */}
    <div className="col-md-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body p-4">
          <h3 className="card-title">🏠 Imóveis</h3>

          <p className="card-text text-muted">
            Cadastre, consulte e gerencie os imóveis da imobiliária.
          </p>

          <Link
            href="/imoveis"
            className="btn btn-primary"
          >
            Acessar imóveis
          </Link>
        </div>
      </div>
    </div>

    {/* CLIENTES */}
    <div className="col-md-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body p-4">
          <h3 className="card-title">👥 Clientes</h3>

          <p className="card-text text-muted">
            Gerencie proprietários, compradores e inquilinos.
          </p>

          <Link
            href="/clientes"
            className="btn btn-success"
          >
            Acessar clientes
          </Link>
        </div>
      </div>
    </div>

    {/* CONTRATOS */}
    <div className="col-md-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body p-4">
          <h3 className="card-title">📄 Contratos</h3>

          <p className="card-text text-muted">
            Controle contratos de compra, venda e locação.
          </p>

          <Link
            href="/contratos"
            className="btn btn-dark"
          >
            Acessar contratos
          </Link>
        </div>
      </div>
    </div>

  </div>

  {/* RESUMO */}
  <div className="mt-5">
    <h2 className="mb-4">Resumo</h2>

    <div className="row g-3">

      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h6 className="text-muted">Imóveis</h6>
            <h2>0</h2>
          </div>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h6 className="text-muted">Disponíveis</h6>
            <h2>0</h2>
          </div>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h6 className="text-muted">Clientes</h6>
            <h2>0</h2>
          </div>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h6 className="text-muted">Contratos</h6>
            <h2>0</h2>
          </div>
        </div>
      </div>

    </div>
  </div>
</main>

);
}
