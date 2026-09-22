"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FinanceiroPage() {
  const [recebimentos, setRecebimentos] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const hoje = new Date();

  const [mes, setMes] = useState(String(hoje.getMonth() + 1));
  const [ano, setAno] = useState(String(hoje.getFullYear()));

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    setErro("");

    try {
      const [
        { data: recebimentosData, error: recebimentosError },
        { data: despesasData, error: despesasError },
      ] = await Promise.all([
        supabase.from("recebimentos").select("*"),
        supabase.from("despesas").select("*"),
      ]);

      if (recebimentosError) {
        throw new Error(recebimentosError.message);
      }

      if (despesasError) {
        throw new Error(despesasError.message);
      }

      setRecebimentos(recebimentosData || []);
      setDespesas(despesasData || []);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os dados financeiros.");
    } finally {
      setLoading(false);
    }
  }

  function pago(status) {
    const valor = String(status || "")
      .trim()
      .toLowerCase();

    return [
      "pago",
      "recebido",
      "confirmado",
      "realizado",
    ].includes(valor);
  }

  function dataValida(valor) {
    if (!valor) return false;

    const dataConvertida = new Date(valor);

    return !Number.isNaN(dataConvertida.getTime());
  }

  function dataBR(valor) {
    if (!dataValida(valor)) {
      return "-";
    }

    return new Date(valor).toLocaleDateString("pt-BR");
  }

  function moeda(valor) {
    const numero = Number(valor || 0);

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const movimentos = useMemo(() => {
    const entradas = (recebimentos || [])
      .filter((item) => pago(item.status))
      .filter((item) => dataValida(item.data_recebimento))
      .map((item) => ({
        id: `recebimento-${item.id}`,
        tipo: "entrada",
        origem: "Recebimento",
        descricao:
          item.descricao ||
          item.tipo_recebimento ||
          "Recebimento",
        valor: Number(item.valor || 0),
        data: item.data_recebimento,
        formaPagamento: item.forma_pagamento || "-",
      }));

    const saidas = (despesas || [])
      .filter((item) => pago(item.status))
      .filter((item) => dataValida(item.data_despesa))
      .map((item) => ({
        id: `despesa-${item.id}`,
        tipo: "saida",
        origem: "Despesa",
        descricao:
          item.descricao ||
          item.categoria ||
          "Despesa",
        valor: Number(item.valor || 0),
        data: item.data_despesa,
        formaPagamento: item.forma_pagamento || "-",
      }));

    return [...entradas, ...saidas].sort(
      (a, b) => new Date(b.data) - new Date(a.data)
    );
  }, [recebimentos, despesas]);

  const saldoAtual = useMemo(() => {
    return movimentos.reduce((saldo, movimento) => {
      if (movimento.tipo === "entrada") {
        return saldo + movimento.valor;
      }

      return saldo - movimento.valor;
    }, 0);
  }, [movimentos]);

  const periodo = useMemo(() => {
    const mesNumero = Number(mes);
    const anoNumero = Number(ano);

    return movimentos.filter((movimento) => {
      const data = new Date(movimento.data);

      return (
        data.getMonth() + 1 === mesNumero &&
        data.getFullYear() === anoNumero
      );
    });
  }, [movimentos, mes, ano]);

  const saldoAnterior = useMemo(() => {
    const mesNumero = Number(mes);
    const anoNumero = Number(ano);

    const primeiroDia = new Date(
      anoNumero,
      mesNumero - 1,
      1
    );

    return movimentos.reduce((saldo, movimento) => {
      const data = new Date(movimento.data);

      if (data >= primeiroDia) {
        return saldo;
      }

      if (movimento.tipo === "entrada") {
        return saldo + movimento.valor;
      }

      return saldo - movimento.valor;
    }, 0);
  }, [movimentos, mes, ano]);

  const extrato = useMemo(() => {
    return periodo;
  }, [periodo]);

  const entradas = useMemo(() => {
    return periodo
      .filter((movimento) => movimento.tipo === "entrada")
      .reduce((total, movimento) => total + movimento.valor, 0);
  }, [periodo]);

  const saidas = useMemo(() => {
    return periodo
      .filter((movimento) => movimento.tipo === "saida")
      .reduce((total, movimento) => total + movimento.valor, 0);
  }, [periodo]);

  const saldoPeriodo = saldoAnterior + entradas - saidas;

  function acessarPagina(pagina) {
    window.location.href = pagina;
  }

  const meses = [
    { valor: "1", nome: "Janeiro" },
    { valor: "2", nome: "Fevereiro" },
    { valor: "3", nome: "Março" },
    { valor: "4", nome: "Abril" },
    { valor: "5", nome: "Maio" },
    { valor: "6", nome: "Junho" },
    { valor: "7", nome: "Julho" },
    { valor: "8", nome: "Agosto" },
    { valor: "9", nome: "Setembro" },
    { valor: "10", nome: "Outubro" },
    { valor: "11", nome: "Novembro" },
    { valor: "12", nome: "Dezembro" },
  ];

  return (
    <main className="container-fluid py-4">
      <section className="container-fluid">

        {/* ACESSO RÁPIDO */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h5 className="mb-1 fw-bold">
                  <i className="bi bi-grid me-2"></i>
                  Acesso rápido
                </h5>

                <small className="text-muted">
                  Navegue pelas principais áreas do sistema
                </small>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => acessarPagina("/")}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => acessarPagina("/clientes")}
              >
                <i className="bi bi-people me-2"></i>
                Clientes
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => acessarPagina("/imoveis")}
              >
                <i className="bi bi-house me-2"></i>
                Imóveis
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => acessarPagina("/contratos")}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Contratos
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => acessarPagina("/recebimentos")}
              >
                <i className="bi bi-cash-stack me-2"></i>
                Recebimentos
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => acessarPagina("/despesas")}
              >
                <i className="bi bi-wallet2 me-2"></i>
                Despesas
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => acessarPagina("/financeiro")}
              >
                <i className="bi bi-graph-up-arrow me-2"></i>
                Financeiro
              </button>
            </div>
          </div>
        </div>

        {/* CABEÇALHO */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="mb-1 fw-bold">
              <i className="bi bi-cash-coin me-2"></i>
              ImobGest - Financeiro
            </h2>

            <p className="text-muted mb-0">
              Acompanhe entradas, saídas e saldo financeiro.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={carregarDados}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        {/* ALERTAS */}
        {erro && (
          <div
            className="alert alert-danger d-flex align-items-center"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{erro}</div>
          </div>
        )}

        {sucesso && (
          <div
            className="alert alert-success d-flex align-items-center"
            role="alert"
          >
            <i className="bi bi-check-circle-fill me-2"></i>
            <div>{sucesso}</div>
          </div>
        )}

        {/* CARDS RESUMO */}
        <div className="row g-4 mb-4">

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">
                      Saldo atual
                    </p>

                    <h3 className="fw-bold mb-0">
                      {moeda(saldoAtual)}
                    </h3>
                  </div>

                  <div className="fs-1 text-primary">
                    <i className="bi bi-wallet2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">
                      Entradas
                    </p>

                    <h3 className="fw-bold mb-0">
                      {moeda(entradas)}
                    </h3>
                  </div>

                  <div className="fs-1 text-success">
                    <i className="bi bi-arrow-down-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">
                      Saídas
                    </p>

                    <h3 className="fw-bold mb-0">
                      {moeda(saidas)}
                    </h3>
                  </div>

                  <div className="fs-1 text-danger">
                    <i className="bi bi-arrow-up-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">
                      Saldo do período
                    </p>

                    <h3 className="fw-bold mb-0">
                      {moeda(entradas - saidas)}
                    </h3>
                  </div>

                  <div className="fs-1 text-info">
                    <i className="bi bi-bar-chart-line"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FILTROS */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-funnel me-2"></i>
              Filtros
            </h5>

            <div className="row g-3">

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Mês
                </label>

                <select
                  className="form-select"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                >
                  {meses.map((item) => (
                    <option
                      key={item.valor}
                      value={item.valor}
                    >
                      {item.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Ano
                </label>

                <input
                  type="number"
                  className="form-control"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  min="2000"
                  max="2100"
                />
              </div>

            </div>
          </div>
        </div>

        {/* RESUMO FINANCEIRO */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-bar-chart me-2"></i>
                  Resumo financeiro
                </h5>

                <small className="text-muted">
                  Período selecionado
                </small>
              </div>
            </div>

            <div className="row g-3">

              <div className="col-12 col-md-4">
                <div className="border rounded p-3 h-100">
                  <small className="text-muted">
                    Saldo anterior
                  </small>

                  <h5 className="fw-bold mt-2 mb-0">
                    {moeda(saldoAnterior)}
                  </h5>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="border rounded p-3 h-100">
                  <small className="text-muted">
                    Entradas
                  </small>

                  <h5 className="fw-bold text-success mt-2 mb-0">
                    {moeda(entradas)}
                  </h5>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="border rounded p-3 h-100">
                  <small className="text-muted">
                    Saídas
                  </small>

                  <h5 className="fw-bold text-danger mt-2 mb-0">
                    {moeda(saidas)}
                  </h5>
                </div>
              </div>

            </div>

            <div className="border rounded p-3 mt-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span className="fw-semibold">
                  Resultado do período
                </span>

                <strong
                  className={
                    entradas - saidas >= 0
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {moeda(entradas - saidas)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* EXTRATO */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-list-columns-reverse me-2"></i>
                  Extrato financeiro
                </h5>

                <small className="text-muted">
                  Movimentações do período selecionado
                </small>
              </div>

              <span className="badge text-bg-light border">
                {extrato.length} movimentação
                {extrato.length !== 1 ? "s" : ""}
              </span>
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
                  Carregando informações financeiras...
                </p>
              </div>
            ) : extrato.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>

                <h6 className="fw-bold mt-3">
                  Nenhuma movimentação encontrada
                </h6>

                <p className="text-muted mb-0">
                  Não existem entradas ou saídas para o período selecionado.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Origem</th>
                      <th>Forma de pagamento</th>
                      <th className="text-end">
                        Valor
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {extrato.map((movimento) => (
                      <tr key={movimento.id}>

                        <td>
                          {dataBR(movimento.data)}
                        </td>

                        <td>
                          {movimento.tipo === "entrada" ? (
                            <span className="badge text-bg-success">
                              <i className="bi bi-arrow-down me-1"></i>
                              Entrada
                            </span>
                          ) : (
                            <span className="badge text-bg-danger">
                              <i className="bi bi-arrow-up me-1"></i>
                              Saída
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {movimento.descricao}
                          </span>
                        </td>

                        <td>
                          {movimento.origem}
                        </td>

                        <td>
                          {movimento.formaPagamento}
                        </td>

                        <td className="text-end">
                          <span
                            className={
                              movimento.tipo === "entrada"
                                ? "fw-bold text-success"
                                : "fw-bold text-danger"
                            }
                          >
                            {movimento.tipo === "entrada"
                              ? "+"
                              : "-"}
                            {moeda(movimento.valor)}
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* ENTRADAS E SAÍDAS */}
        <div className="row g-4 mb-4">

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  <i className="bi bi-arrow-down-circle text-success me-2"></i>
                  Entradas
                </h5>

                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-muted">
                    Total recebido
                  </span>

                  <strong className="text-success">
                    {moeda(entradas)}
                  </strong>
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  <i className="bi bi-arrow-up-circle text-danger me-2"></i>
                  Saídas
                </h5>

                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-muted">
                    Total gasto
                  </span>

                  <strong className="text-danger">
                    {moeda(saidas)}
                  </strong>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* SALDO FINAL */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

              <div>
                <h5 className="fw-bold mb-1">
                  Saldo final do período
                </h5>

                <p className="text-muted mb-0">
                  Saldo anterior + entradas - saídas
                </p>
              </div>

              <h3
                className={
                  saldoPeriodo >= 0
                    ? "fw-bold text-success mb-0"
                    : "fw-bold text-danger mb-0"
                }
              >
                {moeda(saldoPeriodo)}
              </h3>

            </div>

          </div>
        </div>

        {/* RODAPÉ */}
        <footer className="text-center text-muted py-4">
          <div className="fw-semibold">
            ImobGest
          </div>

          <small>
            Dashboard atualizado em{" "}
            {hoje.toLocaleDateString("pt-BR")}
          </small>
        </footer>

      </section>
    </main>
  );
}
