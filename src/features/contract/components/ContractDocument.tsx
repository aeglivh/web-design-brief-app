import type { ContractData } from "@/lib/types";

interface ContractDocumentProps {
  data: ContractData;
  studioName: string;
  clientName: string;
  businessName: string;
  currency: string;
  accent: string;
}

export function ContractDocument({
  data,
  studioName,
  clientName,
  businessName,
  currency,
  accent,
}: ContractDocumentProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en", { style: "decimal", minimumFractionDigits: 2 }).format(n);

  return (
    <div className="max-w-3xl mx-auto bg-white text-slate-800 text-sm leading-relaxed print:text-[11pt] print:leading-normal print:max-w-none">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="text-center mb-10 print:mb-8">
        <div
          className="inline-block w-10 h-1 rounded-full mb-4 print:hidden"
          style={{ backgroundColor: accent }}
        />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 print:text-xl">
          Scope of Work &amp; Project Agreement
        </h1>
        <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest">
          {studioName} &mdash; {today}
        </p>
      </div>

      {/* ── Parties ────────────────────────────────────────────── */}
      <p className="mb-8 text-slate-600 print:mb-6">
        This agreement is entered into between{" "}
        <strong className="text-slate-900">{studioName}</strong> (the
        &ldquo;Designer&rdquo;) and{" "}
        <strong className="text-slate-900">
          {clientName}
          {businessName ? ` / ${businessName}` : ""}
        </strong>{" "}
        (the &ldquo;Client&rdquo;).
      </p>

      {/* ── 1. Scope of Work ───────────────────────────────────── */}
      <Section n={1} title="Scope of Work" accent={accent}>
        <p className="whitespace-pre-line">{data.scopeOfWork}</p>
      </Section>

      {/* ── 2. Deliverables ────────────────────────────────────── */}
      <Section n={2} title="Deliverables" accent={accent}>
        <ol className="list-decimal list-inside space-y-2">
          {data.deliverables.map((d, i) => (
            <li key={i}>
              <strong>{d.item}</strong>
              {d.description && (
                <span className="text-slate-600"> &mdash; {d.description}</span>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* ── 3. Exclusions ──────────────────────────────────────── */}
      <Section n={3} title="Exclusions" accent={accent}>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          {data.exclusions.map((ex, i) => (
            <li key={i}>{ex}</li>
          ))}
        </ul>
      </Section>

      {/* ── 4. Revision Policy ─────────────────────────────────── */}
      <Section n={4} title="Revision Policy" accent={accent}>
        <p>
          Design revisions: <strong>{data.revisionPolicy.designRevisions} rounds</strong>.
          Development revisions:{" "}
          <strong>{data.revisionPolicy.developmentRevisions} rounds</strong>.
          Additional revisions are billed at{" "}
          <strong>
            {currency} {fmt(data.revisionPolicy.additionalRate)}/hr
          </strong>
          .
        </p>
        {data.revisionPolicy.description && (
          <p className="mt-2 text-slate-600 whitespace-pre-line">
            {data.revisionPolicy.description}
          </p>
        )}
      </Section>

      {/* ── 5. Project Timeline ────────────────────────────────── */}
      <Section n={5} title="Project Timeline" accent={accent}>
        <p className="mb-3 text-slate-600">
          Estimated total duration:{" "}
          <strong className="text-slate-900">{data.timeline.totalWeeks} weeks</strong>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-2 pr-4 font-semibold text-slate-900">Phase</th>
                <th className="py-2 pr-4 font-semibold text-slate-900">Duration</th>
                <th className="py-2 font-semibold text-slate-900">Deliverable</th>
              </tr>
            </thead>
            <tbody>
              {data.timeline.milestones.map((m, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{m.phase}</td>
                  <td className="py-2 pr-4 text-slate-600">{m.weeks}</td>
                  <td className="py-2 text-slate-600">{m.deliverable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 6. Payment Schedule ────────────────────────────────── */}
      <Section n={6} title="Payment Schedule" accent={accent}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-2 pr-4 font-semibold text-slate-900">Milestone</th>
                <th className="py-2 pr-4 font-semibold text-slate-900 text-right">%</th>
                <th className="py-2 font-semibold text-slate-900 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.paymentSchedule.map((p, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{p.milestone}</td>
                  <td className="py-2 pr-4 text-right text-slate-600">{p.percentage}%</td>
                  <td className="py-2 text-right font-medium">
                    {currency} {fmt(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 7. Change Requests ─────────────────────────────────── */}
      <Section n={7} title="Change Requests" accent={accent}>
        <p className="whitespace-pre-line">{data.changeRequestProcess}</p>
      </Section>

      {/* ── 8. Intellectual Property ───────────────────────────── */}
      <Section n={8} title="Intellectual Property" accent={accent}>
        <p className="whitespace-pre-line">{data.ipTransfer}</p>
      </Section>

      {/* ── 9. Cancellation ────────────────────────────────────── */}
      <Section n={9} title="Cancellation" accent={accent}>
        <p className="whitespace-pre-line">{data.cancellationTerms}</p>
      </Section>

      {/* ── 10. Warranty ───────────────────────────────────────── */}
      <Section n={10} title="Warranty" accent={accent}>
        <p className="whitespace-pre-line">{data.warranty}</p>
      </Section>

      {/* ── 11. Signatures ─────────────────────────────────────── */}
      <div className="mt-12 pt-8 border-t border-slate-200 print:mt-10 print:pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
          Signatures
        </h3>
        <div className="grid grid-cols-2 gap-12">
          <SignatureBlock label="Designer" name={studioName} />
          <SignatureBlock
            label="Client"
            name={clientName}
            business={businessName}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Section helper ──────────────────────────────────────────── */

function Section({
  n,
  title,
  accent,
  children,
}: {
  n: number;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 print:mb-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-3">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white print:border print:border-slate-400 print:text-slate-700 print:bg-transparent"
          style={{ backgroundColor: accent }}
        >
          {n}
        </span>
        {title}
      </h2>
      <div className="pl-8">{children}</div>
    </section>
  );
}

/* ── Signature block ─────────────────────────────────────────── */

function SignatureBlock({
  label,
  name,
  business,
}: {
  label: string;
  name: string;
  business?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-6">{label}</p>
      <div className="border-b border-slate-300 mb-2 h-10" />
      <p className="text-sm font-medium text-slate-900">{name}</p>
      {business && <p className="text-xs text-slate-500">{business}</p>}
      <div className="border-b border-slate-300 mb-2 mt-6 h-8" />
      <p className="text-xs text-slate-400">Date</p>
    </div>
  );
}
