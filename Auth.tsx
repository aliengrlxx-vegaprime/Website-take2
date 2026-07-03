import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AGXX Labs" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setInfo("Account created. You can now sign in.");
        setMode("signin");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas text-text-secondary">
      <section className="section-shell">
        <div className="mx-auto w-full max-w-[420px]">
          <Link
            to="/"
            className="mb-[34px] inline-flex font-mono-data text-[11px] uppercase tracking-[0.18em] text-accent-cyan hover:text-text-primary"
          >
            ← Return to AGXX
          </Link>
          <h1 className="font-display text-[28px] font-bold uppercase tracking-[0.06em] text-text-primary">
            {mode === "signin" ? "Admin sign in" : "Create admin account"}
          </h1>
          <p className="mt-[13px] text-[13px] text-text-muted">
            Restricted — for AGXX staff only.
          </p>

          <form onSubmit={submit} className="mt-[34px] flex flex-col gap-[16px]">
            <label className="flex flex-col gap-[6px]">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-text-muted">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-text-muted/30 bg-transparent px-[14px] py-[12px] text-text-primary focus:border-accent-cyan focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-text-muted">
                Password
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-text-muted/30 bg-transparent px-[14px] py-[12px] text-text-primary focus:border-accent-cyan focus:outline-none"
              />
            </label>

            {err && <p className="text-[13px] text-red-400">{err}</p>}
            {info && <p className="text-[13px] text-accent-cyan">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-[8px] bg-accent px-[24px] py-[14px] font-mono-data text-[12px] font-semibold uppercase tracking-[0.14em] text-canvas hover:bg-accent-cyan disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setErr(null);
                setInfo(null);
              }}
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-accent-cyan hover:text-text-primary"
            >
              {mode === "signin" ? "Need to create your account?" : "Have an account? Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
