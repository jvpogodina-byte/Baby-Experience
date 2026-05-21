"use client";

import Link from "next/link";
import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

type AuthMode = "login" | "register";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleEnabled, setIsGoogleEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const effectiveCallbackUrl = MVP_USER_FEATURES.publicUserLogin ? callbackUrl : "/admin";

  useEffect(() => {
    if (!MVP_USER_FEATURES.socialLogin) {
      setIsGoogleEnabled(false);
      return;
    }

    getProviders()
      .then((providers) => {
        setIsGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        setIsGoogleEnabled(false);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "register" && MVP_USER_FEATURES.publicRegistration) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { message?: string } | null;
          setMessage(data?.message ?? "Не удалось создать аккаунт.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: effectiveCallbackUrl
      });

      if (!result?.ok) {
        setMessage("Проверьте email и пароль администратора.");
        return;
      }

      router.push(result.url ?? effectiveCallbackUrl);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="detail-hero">
      <div className="container" style={{ maxWidth: "760px" }}>
        <section className="auth-card">
          <span className="eyebrow">{MVP_USER_FEATURES.publicRegistration && mode === "register" ? "Регистрация" : "Админский вход"}</span>
          <h1 className="section-title">Вход в админку Baby Experience</h1>
          <p>
            Войдите под аккаунтом администратора, чтобы управлять каталогом, публикацией и модерацией.
          </p>
          <div className="split" style={{ marginTop: "1rem" }}>
            <form className="form" onSubmit={handleSubmit}>
              {MVP_USER_FEATURES.publicRegistration ? (
                <div className="auth-tabs" aria-label="Выбор режима авторизации">
                  <button
                    className={mode === "login" ? "auth-tab active" : "auth-tab"}
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setMessage("");
                    }}
                  >
                    Вход
                  </button>
                  <button
                    className={mode === "register" ? "auth-tab active" : "auth-tab"}
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setMessage("");
                    }}
                  >
                    Регистрация
                  </button>
                </div>
              ) : null}
              {mode === "register" ? (
                <div className="field">
                  <label htmlFor="name">Имя</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Как к вам обращаться"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={80}
                  />
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">Пароль</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
                {mode === "register" ? <span className="help">Минимум 8 символов.</span> : null}
              </div>
              {message ? <div className="form-message error">{message}</div> : null}
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Проверяем..." : mode === "login" ? "Войти в админку" : "Создать аккаунт"}
              </button>
            </form>

            <div className="stack">
              {isGoogleEnabled ? (
                <button className="button secondary" type="button" onClick={() => signIn("google", { callbackUrl: effectiveCallbackUrl })}>
                  Войти через Google
                </button>
              ) : null}
              <div className="callout">
                <strong>Доступ только для админа</strong>
                <p>
                  Публичная регистрация и личные кабинеты пользователей скрыты в MVP. Роль ADMIN задаётся
                  через seed или прямое изменение в базе.
                </p>
              </div>
              <Link className="button secondary" href="/">
                Вернуться на главную
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
