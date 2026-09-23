"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client"; 

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

   setErro("");
setCarregando(true);

const supabase = createClient();

const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

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
                    SI
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
                      htmlFor="email"
                      className="form-label fw-semibold"
                    >
                      E-mail
                    </label>

                    <input
                      id="email"
                      type="email"
                      className="form-control form-control-lg"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Digite seu e-mail"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Senha
                    </label>

                    <input
                      id="password"
                      type="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
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