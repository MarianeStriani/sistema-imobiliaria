"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function HomePage() {
  const [supabase] = useState(() => createClient());

  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    verificarUsuario();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      setVerificando(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function verificarUsuario() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUsuario(session?.user ?? null);
    setVerificando(false);
  }

  async function handleLogin(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErro("Nome ou senha inválidos.");
        setCarregando(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: resultado.email,
        password: senha,
      });

      if (error) {
        setErro("Nome ou senha inválidos.");
        setCarregando(false);
        return;
      }

      setUsuario(data.user);
      setNome("");
      setSenha("");
      setCarregando(false);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível realizar o login.");
      setCarregando(false);
    }
  }

  async function sair() {
    await supabase.auth.signOut();

    setUsuario(null);
    setNome("");
    setSenha("");
  }

  function acessarPagina(pagina) {
    window.location.href = pagina;
  }

  if (verificando) {
    return (
      <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          />
          <div className="text-muted">
            Carregando...
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     LOGIN
  ===================================================== */

  if (!usuario) {
    return (
      <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4 p-md-5">

                  <div className="text-center mb-4">

                    <div
                      className="bg-primary text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "64px",
                        height: "64px",
                        fontSize: "28px",
                        fontWeight: "700",
                      }}
                    >
                      IG
                    </div>

                    <h1 className="h4 fw-bold mb-1">
                      ImobGest
                    </h1>

                    <p className="text-muted mb-0">
                      Acesso administrativo
                    </p>

                  </div>

                  {erro && (
                    <div
                      className="alert alert-danger"
                      role="alert"
                    >
                      {erro}
                    </div>
                  )}

                  <form onSubmit={handleLogin}>

                    <div className="mb-3">

                      <label
                        htmlFor="nome"
                        className="form-label fw-semibold"
                      >
                        Nome do administrador
                      </label>

                      <input
                        id="nome"
                        type="text"
                        className="form-control form-control-lg"
                        value={nome}
                        onChange={(event) =>
                          setNome(event.target.value)
                        }
                        placeholder="Digite seu nome"
                        autoComplete="username"
                        required
                      />

                    </div>

                    <div className="mb-4">

                      <label
                        htmlFor="senha"
                        className="form-label fw-semibold"
                      >
                        Senha
                      </label>

                      <input
                        id="senha"
                        type="password"
                        className="form-control form-control-lg"
                        value={senha}
                        onChange={(event) =>
                          setSenha(event.target.value)
                        }
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        required
                      />

                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={carregando}
                    >
                      {carregando ? "Entrando..." : "Entrar"}
                    </button>

                  </form>

                  <div className="text-center mt-4">

                    <small className="text-muted">
                      Acesso exclusivo para administradores
                    </small>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <main className="container-fluid py-4">

      {/* CABEÇALHO */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h1 className="h3 fw-bold mb-1">
            Dashboard
          </h1>

          <p className="text-muted mb-0">
            Visão geral do ImobGest
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger btn-sm px-3 py-2"
          onClick={sair}
        >
          Sair
        </button>

      </div>

      {/* ACESSO RÁPIDO */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">

        <div className="card-body">

          <h2 className="h6 fw-bold mb-3">
            Acesso rápido
          </h2>

          <div className="row g-2">

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={() => acessarPagina("/")}
              >
                Dashboard
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/imoveis")}
              >
                Imóveis
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/clientes")}
              >
                Clientes
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/contratos")}
              >
                Contratos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/recebimentos")}
              >
                Recebimentos
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/despesas")}
              >
                Despesas
              </button>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => acessarPagina("/financeiro")}
              >
                Financeiro
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* RESUMO */}

      <div className="row g-4 mb-4">

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Clientes
              </div>
              <div className="fs-3 fw-bold">
                1
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Contratos ativos
              </div>
              <div className="fs-3 fw-bold">
                0
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Recebimentos do mês
              </div>
              <div className="fs-3 fw-bold">
                R$ 650,00
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Despesas
              </div>
              <div className="fs-3 fw-bold">
                R$ 0,00
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FINANCEIRO */}

      <div className="row g-4 mb-4">

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Receitas
              </div>
              <div className="fs-3 fw-bold text-success">
                R$ 650,00
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Saídas
              </div>
              <div className="fs-3 fw-bold text-danger">
                R$ 0,00
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Saldo
              </div>
              <div className="fs-3 fw-bold text-primary">
                R$ 650,00
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* IMÓVEIS */}

      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-body">

          <h2 className="h5 fw-bold mb-4">
            Imóveis
          </h2>

          <div className="row g-4">

            <div className="col-12 col-md-4">

              <div className="border rounded-4 p-4 h-100">

                <div className="text-muted small mb-2">
                  Disponíveis
                </div>

                <div className="fs-3 fw-bold">
                  1
                </div>

                <div className="text-muted small">
                  100%
                </div>

              </div>

            </div>

            <div className="col-12 col-md-4">

              <div className="border rounded-4 p-4 h-100">

                <div className="text-muted small mb-2">
                  Alugados
                </div>

                <div className="fs-3 fw-bold">
                  0
                </div>

              </div>

            </div>

            <div className="col-12 col-md-4">

              <div className="border rounded-4 p-4 h-100">

                <div className="text-muted small mb-2">
                  Manutenção
                </div>

                <div className="fs-3 fw-bold">
                  0
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}