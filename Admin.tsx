import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Submissions — AGXX Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

type Submission = {
  id: string;
  email: string;
  website: string;
  socials: string | null;
  traffic: string;
  aov: string | null;
  cr: string | null;
  revenue: string;
  goals: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userRes.user.id);
      const admin = !!roleRows?.some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) return;

      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setErr(error.message);
      else setRows(data as Submission[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.email, r.website, r.socials, r.revenue, r.goals, r.status, r.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    if (error) return alert(error.message);
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
    if (error) return alert(error.message);
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? null);
  };

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-canvas text-text-secondary">
        <section className="section-shell">
          <div className="mx-auto max-w-[560px]">
            <h1 className="font-display text-[24px] font-bold uppercase text-text-primary">
              Access denied
            </h1>
            <p className="mt-[13px] text-[14px] text-text-muted">
              Your account isn't authorized for the admin dashboard.
            </p>
            <button
              onClick={signOut}
              className="mt-[21px] font-mono-data text-[11px] uppercase tracking-[0.18em] text-accent-cyan hover:text-text-primary"
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-text-secondary">
      <section className="section-shell">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="flex items-center justify-between gap-[16px]">
            <div>
              <p className="label-mono text-accent-cyan">Admin</p>
              <h1 className="mt-[8px] font-display text-[28px] font-bold uppercase tracking-[0.06em] text-text-primary">
                Diagnostic Submissions
              </h1>
              <p className="mt-[8px] text-[13px] text-text-muted">
                {rows ? `${rows.length} total` : "Loading…"}
              </p>
            </div>
            <button
              onClick={signOut}
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-accent-cyan hover:text-text-primary"
            >
              Sign out
            </button>
          </div>

          <input
            type="search"
            placeholder="Search email, website, goals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-[21px] w-full border border-text-muted/30 bg-transparent px-[14px] py-[12px] text-text-primary placeholder:text-text-muted/50 focus:border-accent-cyan focus:outline-none"
          />

          {err && <p className="mt-[16px] text-red-400">{err}</p>}

          <div className="mt-[21px] overflow-x-auto border border-text-muted/20">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-white/[0.02] font-mono-data text-[10px] uppercase tracking-[0.14em] text-text-muted">
                <tr>
                  <th className="px-[12px] py-[10px]">Date</th>
                  <th className="px-[12px] py-[10px]">Email</th>
                  <th className="px-[12px] py-[10px]">Website</th>
                  <th className="px-[12px] py-[10px]">Revenue</th>
                  <th className="px-[12px] py-[10px]">Status</th>
                  <th className="px-[12px] py-[10px]" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <Fragment key={r.id}>
                    <tr key={r.id} className="border-t border-text-muted/10">
                      <td className="px-[12px] py-[10px] text-text-muted">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-[12px] py-[10px] text-text-primary">{r.email}</td>
                      <td className="px-[12px] py-[10px]">{r.website}</td>
                      <td className="px-[12px] py-[10px]">{r.revenue}</td>
                      <td className="px-[12px] py-[10px]">
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                          className="border border-text-muted/30 bg-transparent px-[6px] py-[4px] text-[12px]"
                        >
                          <option value="new">new</option>
                          <option value="contacted">contacted</option>
                          <option value="qualified">qualified</option>
                          <option value="closed">closed</option>
                          <option value="archived">archived</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-[12px] py-[10px] text-right">
                        <button
                          onClick={() => setOpenId(openId === r.id ? null : r.id)}
                          className="mr-[10px] font-mono-data text-[11px] uppercase tracking-[0.14em] text-accent-cyan hover:text-text-primary"
                        >
                          {openId === r.id ? "Hide" : "View"}
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          className="font-mono-data text-[11px] uppercase tracking-[0.14em] text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {openId === r.id && (
                      <tr key={`${r.id}-detail`} className="border-t border-text-muted/10 bg-white/[0.02]">
                        <td colSpan={6} className="px-[12px] py-[16px]">
                          <dl className="grid grid-cols-1 gap-[10px] text-[13px] sm:grid-cols-2">
                            <Field label="Socials" value={r.socials} />
                            <Field label="Traffic" value={r.traffic} />
                            <Field label="AOV" value={r.aov} />
                            <Field label="CR" value={r.cr} />
                            <Field label="Revenue" value={r.revenue} />
                            <Field label="Goals" value={r.goals} full />
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {rows && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-[12px] py-[24px] text-center text-text-muted">
                      No submissions{query ? " match your search" : " yet"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, full }: { label: string; value: string | null; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-text-muted">
        {label}
      </dt>
      <dd className="mt-[4px] whitespace-pre-wrap text-text-primary">{value || "—"}</dd>
    </div>
  );
}
