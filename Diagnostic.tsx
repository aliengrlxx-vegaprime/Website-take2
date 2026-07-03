import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useId } from "react";
import { Footer } from "@/components/Footer";
import { SectionMark } from "@/components/SectionMark";
import logoAsset from "@/assets/umbra-logo.svg.asset.json";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Diagnostic Intake — AGXX Labs" },
      {
        name: "description",
        content:
          "Submit your business data to receive your AGXX projection, ROI report, and prioritized roadmap.",
      },
      { property: "og:title", content: "Diagnostic Intake — AGXX Labs" },
      {
        property: "og:description",
        content:
          "Start your Predictive CRO diagnostic. Get projected ROI, the 3 highest-impact fixes, and a prioritized roadmap.",
      },
      { property: "og:url", content: "https://agxxlabs.com/diagnostic" },
      { name: "twitter:title", content: "Diagnostic Intake — AGXX Labs" },
      {
        name: "twitter:description",
        content:
          "Start your Predictive CRO diagnostic. Get projected ROI, the 3 highest-impact fixes, and a prioritized roadmap.",
      },
    ],
    links: [{ rel: "canonical", href: "https://agxxlabs.com/diagnostic" }],
  }),
  component: Diagnostic,
});

type FormState = {
  email: string;
  website: string;
  socials: string;
  traffic: string;
  aov: string;
  cr: string;
  revenue: string;
  goals: string;
};

const initial: FormState = {
  email: "",
  website: "",
  socials: "",
  traffic: "",
  aov: "",
  cr: "",
  revenue: "",
  goals: "",
};

function Diagnostic() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: insertError } = await supabase.from("submissions").insert({
      email: form.email,
      website: form.website,
      socials: form.socials || null,
      traffic: form.traffic,
      aov: form.aov || null,
      cr: form.cr || null,
      revenue: form.revenue,
      goals: form.goals || null,
    });
    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSubmitted(true);
    setForm(initial);
  };


  return (
    <main className="relative min-h-screen bg-canvas text-text-secondary">
      <section className="section-shell relative">
        <div className="grid-overlay" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col">
          <Link
            to="/"
            className="mb-[34px] inline-flex w-fit items-center font-mono-data text-[11px] uppercase tracking-[0.18em] text-accent-cyan transition-colors hover:text-text-primary"
          >
            ← Return to AGXX
          </Link>

          <img src={logoAsset.url} alt="AGXX Labs logo" className="mb-[34px] h-[72px] w-auto" />

          <p className="label-mono mb-[21px] text-accent-cyan">Diagnostic Intake</p>

          <h1 className="font-display text-[28px] font-bold uppercase leading-[1.15] tracking-[0.06em] text-text-primary sm:text-[38px]">
            Submit your data. Receive your projection.
          </h1>

          <p className="mt-[21px] max-w-xl text-[15px] leading-[1.7] text-text-secondary">
            Fill out the intake below. You'll receive a written report with your projected ROI, the
            three highest-impact fixes, a prioritized roadmap, plus a discovery call and a 90-minute
            strategy walkthrough — all inside 24–48 hours.
          </p>

          <div className="mt-[21px] flex items-start gap-[10px] rounded-[6px] border border-accent-cyan/30 bg-accent-cyan/[0.05] px-[14px] py-[12px]">
            <span aria-hidden className="mt-[1px] text-[14px]">⚠️</span>
            <p className="text-[12.5px] leading-[1.55] text-text-secondary">
              The full diagnostic ranges from <span className="text-text-primary">$333–$999</span>. You'll receive your quote by email directly after your intake form is processed. We look forward to working with you.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-[55px] flex flex-col gap-[21px] pb-[89px]">
            <Field label="Email" required value={form.email} onChange={set("email")} type="email" />
            <Field
              label="Website"
              required
              value={form.website}
              onChange={set("website")}
              placeholder="yourdomain.com"
            />
            <Field
              label="Business social accounts"
              value={form.socials}
              onChange={set("socials")}
              placeholder="Instagram, TikTok, X, LinkedIn…"
            />
            <Field
              label="Estimated monthly traffic"
              required
              value={form.traffic}
              onChange={set("traffic")}
              placeholder="e.g. 45,000 sessions / mo"
            />
            <div className="grid grid-cols-1 gap-[21px] sm:grid-cols-2">
              <Field
                label="Avg order value (optional)"
                value={form.aov}
                onChange={set("aov")}
                placeholder="$"
              />
              <Field
                label="Conversion rate (optional)"
                value={form.cr}
                onChange={set("cr")}
                placeholder="%"
              />
            </div>
            <Field
              label="Total monthly / yearly revenue"
              required
              value={form.revenue}
              onChange={set("revenue")}
              placeholder="$ / month or year"
            />
            <TextArea
              label="Any specific goals you want to address"
              value={form.goals}
              onChange={set("goals")}
              placeholder="Where do you want to be in 90 days?"
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-[21px] inline-flex items-center justify-center bg-accent px-[34px] py-[16px] font-mono-data text-[12px] font-semibold uppercase tracking-[0.14em] text-canvas transition-colors hover:bg-accent-cyan disabled:opacity-50 sm:text-[13px]"
            >
              {busy ? "Sending…" : "Submit diagnostic"}
            </button>

            {error && (
              <div className="border border-red-400/40 bg-red-500/[0.05] p-[16px] text-[13px] text-red-300">
                Couldn't send your submission: {error}
              </div>
            )}

            {submitted && !error && (
              <div className="border border-accent-cyan p-[21px]">
                <p className="font-mono-data text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
                  Submission received
                </p>
                <p className="mt-[13px] text-[15px] leading-[1.7] text-text-primary">
                  Thanks — your intake has been logged and the AGXX team will follow up
                  by email within 24–48 hours.
                </p>
              </div>
            )}
          </form>
        </div>

        <SectionMark />
      </section>

      <Footer />
    </main>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-text-muted">
        {label} {required && <span className="text-accent-cyan">*</span>}
      </label>
      <input
        id={id}
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-text-muted/30 bg-transparent px-[16px] py-[13px] text-[15px] text-text-primary placeholder:text-text-muted/50 focus:border-accent-cyan focus:outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-text-muted">
        {label}
      </label>
      <textarea
        id={id}
        rows={5}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-text-muted/30 bg-transparent px-[16px] py-[13px] text-[15px] leading-[1.6] text-text-primary placeholder:text-text-muted/50 focus:border-accent-cyan focus:outline-none"
      />
    </div>
  );
}
