import type { ContractData } from "@/lib/types";

interface SignatureInfo {
  name: string | null;
  date: string | null;
}

interface ContractDocumentProps {
  data: ContractData;
  onChange: (data: ContractData) => void;
  studioName: string;
  clientName: string;
  businessName: string;
  currency: string;
  accent: string;
  fontSize?: number;
  designerSignature?: SignatureInfo;
  clientSignature?: SignatureInfo;
}

function EditableText({
  value,
  onChange,
  tag: Tag = "p",
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: "p" | "span" | "td" | "li" | "strong";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const text = (e.target as HTMLElement).innerText.trim();
        if (text !== value) onChange(text);
      }}
      className={className}
      style={{
        outline: "none",
        borderRadius: 4,
        transition: "background 0.15s",
        cursor: "text",
        ...style,
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.background = "rgba(99,102,241,0.10)";
      }}
      onMouseOver={(e) => {
        if (document.activeElement !== e.target)
          (e.target as HTMLElement).style.background = "rgba(99,102,241,0.05)";
      }}
      onMouseOut={(e) => {
        if (document.activeElement !== e.target)
          (e.target as HTMLElement).style.background = "transparent";
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({ onBlurCapture: (e: any) => { (e.target as HTMLElement).style.background = "transparent"; } } as any)}
    >
      {value}
    </Tag>
  );
}

export function ContractDocument({
  data,
  onChange,
  studioName,
  clientName,
  businessName,
  currency,
  accent,
  fontSize = 14,
  designerSignature,
  clientSignature,
}: ContractDocumentProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en", { style: "decimal", minimumFractionDigits: 2 }).format(n);

  const updateField = <K extends keyof ContractData>(key: K, value: ContractData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div
      className="max-w-3xl mx-auto leading-[1.7] print:text-[11pt] print:leading-normal print:max-w-none"
      style={{ color: "#1e293b", fontFamily: "Inter, system-ui, sans-serif", fontSize }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="text-center" style={{ marginBottom: 40 }}>
        <div
          className="inline-block w-10 h-1 rounded-full print:hidden"
          style={{ backgroundColor: accent, marginBottom: 16 }}
        />
        <h1
          className="font-bold tracking-tight print:text-xl"
          style={{ fontSize: fontSize + 8, color: "#0f172a", marginBottom: 8 }}
        >
          Scope of Work &amp; Project Agreement
        </h1>
        <p
          className="uppercase tracking-widest"
          style={{ fontSize: 11, color: "#94a3b8" }}
        >
          {studioName} &mdash; {today}
        </p>
      </div>

      {/* ── Parties ────────────────────────────────────────────── */}
      <p style={{ marginBottom: 32, color: "#475569" }}>
        This agreement is entered into between{" "}
        <strong style={{ color: "#0f172a" }}>{studioName}</strong> (the
        &ldquo;Designer&rdquo;) and{" "}
        <strong style={{ color: "#0f172a" }}>
          {clientName}
          {businessName ? ` / ${businessName}` : ""}
        </strong>{" "}
        (the &ldquo;Client&rdquo;).
      </p>

      {/* ── 1. Scope of Work ───────────────────────────────────── */}
      <Section n={1} title="Scope of Work" accent={accent} fontSize={fontSize}>
        <EditableText
          value={data.scopeOfWork}
          onChange={(v) => updateField("scopeOfWork", v)}
          className="whitespace-pre-line"
          style={{ color: "#334155" }}
        />
      </Section>

      {/* ── 2. Deliverables ────────────────────────────────────── */}
      <Section n={2} title="Deliverables" accent={accent} fontSize={fontSize}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.deliverables.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#94a3b8", fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
              <div>
                <EditableText
                  tag="strong"
                  value={d.item}
                  onChange={(v) => {
                    const updated = [...data.deliverables];
                    updated[i] = { ...updated[i], item: v };
                    updateField("deliverables", updated);
                  }}
                  style={{ color: "#0f172a" }}
                />
                {d.description && (
                  <>
                    <span style={{ color: "#94a3b8" }}> — </span>
                    <EditableText
                      tag="span"
                      value={d.description}
                      onChange={(v) => {
                        const updated = [...data.deliverables];
                        updated[i] = { ...updated[i], description: v };
                        updateField("deliverables", updated);
                      }}
                      style={{ color: "#64748b" }}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. Exclusions ──────────────────────────────────────── */}
      <Section n={3} title="Exclusions" accent={accent} fontSize={fontSize}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.exclusions.map((ex, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ color: "#94a3b8" }}>•</span>
              <EditableText
                tag="span"
                value={ex}
                onChange={(v) => {
                  const updated = [...data.exclusions];
                  updated[i] = v;
                  updateField("exclusions", updated);
                }}
                style={{ color: "#64748b" }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. Revision Policy ─────────────────────────────────── */}
      <Section n={4} title="Revision Policy" accent={accent} fontSize={fontSize}>
        <p style={{ color: "#334155", marginBottom: 8 }}>
          Design revisions: <strong style={{ color: "#0f172a" }}>{data.revisionPolicy.designRevisions} rounds</strong>.
          Development revisions:{" "}
          <strong style={{ color: "#0f172a" }}>{data.revisionPolicy.developmentRevisions} rounds</strong>.
          Additional revisions are billed at{" "}
          <strong style={{ color: "#0f172a" }}>
            {currency} {fmt(data.revisionPolicy.additionalRate)}/hr
          </strong>.
        </p>
        {data.revisionPolicy.description && (
          <EditableText
            value={data.revisionPolicy.description}
            onChange={(v) =>
              updateField("revisionPolicy", { ...data.revisionPolicy, description: v })
            }
            className="whitespace-pre-line"
            style={{ color: "#64748b" }}
          />
        )}
      </Section>

      {/* ── 5. Project Timeline ────────────────────────────────── */}
      <Section n={5} title="Project Timeline" accent={accent} fontSize={fontSize}>
        <p style={{ color: "#64748b", marginBottom: 16 }}>
          Estimated total duration:{" "}
          <strong style={{ color: "#0f172a" }}>{data.timeline.totalWeeks} weeks</strong>
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "10px 16px 10px 0", textAlign: "left", fontWeight: 600, color: "#0f172a", fontSize: fontSize - 1 }}>Phase</th>
              <th style={{ padding: "10px 16px 10px 0", textAlign: "left", fontWeight: 600, color: "#0f172a", fontSize: fontSize - 1 }}>Duration</th>
              <th style={{ padding: "10px 0", textAlign: "left", fontWeight: 600, color: "#0f172a", fontSize: fontSize - 1 }}>Deliverable</th>
            </tr>
          </thead>
          <tbody>
            {data.timeline.milestones.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px 12px 0", color: "#334155" }}>
                  <EditableText
                    tag="span"
                    value={m.phase}
                    onChange={(v) => {
                      const updated = [...data.timeline.milestones];
                      updated[i] = { ...updated[i], phase: v };
                      updateField("timeline", { ...data.timeline, milestones: updated });
                    }}
                  />
                </td>
                <td style={{ padding: "12px 16px 12px 0", color: "#64748b" }}>
                  <EditableText
                    tag="span"
                    value={m.weeks}
                    onChange={(v) => {
                      const updated = [...data.timeline.milestones];
                      updated[i] = { ...updated[i], weeks: v };
                      updateField("timeline", { ...data.timeline, milestones: updated });
                    }}
                  />
                </td>
                <td style={{ padding: "12px 0", color: "#64748b" }}>
                  <EditableText
                    tag="span"
                    value={m.deliverable}
                    onChange={(v) => {
                      const updated = [...data.timeline.milestones];
                      updated[i] = { ...updated[i], deliverable: v };
                      updateField("timeline", { ...data.timeline, milestones: updated });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── 6. Payment Schedule ────────────────────────────────── */}
      <Section n={6} title="Payment Schedule" accent={accent} fontSize={fontSize}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "10px 16px 10px 0", textAlign: "left", fontWeight: 600, color: "#0f172a", fontSize: fontSize - 1 }}>Milestone</th>
              <th style={{ padding: "10px 16px 10px 0", textAlign: "right", fontWeight: 600, color: "#0f172a", fontSize: fontSize - 1 }}>%</th>
              <th style={{ padding: "10px 0", textAlign: "right", fontWeight: 600, color: "#0f172a", fontSize: fontSize - 1 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.paymentSchedule.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px 12px 0", color: "#334155" }}>
                  <EditableText
                    tag="span"
                    value={p.milestone}
                    onChange={(v) => {
                      const updated = [...data.paymentSchedule];
                      updated[i] = { ...updated[i], milestone: v };
                      updateField("paymentSchedule", updated);
                    }}
                  />
                </td>
                <td style={{ padding: "12px 16px 12px 0", textAlign: "right", color: "#64748b" }}>{p.percentage}%</td>
                <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 500, color: "#0f172a" }}>
                  {currency} {fmt(p.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── 7. Change Requests ─────────────────────────────────── */}
      <Section n={7} title="Change Requests" accent={accent} fontSize={fontSize}>
        <EditableText
          value={data.changeRequestProcess}
          onChange={(v) => updateField("changeRequestProcess", v)}
          className="whitespace-pre-line"
          style={{ color: "#334155" }}
        />
      </Section>

      {/* ── 8. Intellectual Property ───────────────────────────── */}
      <Section n={8} title="Intellectual Property" accent={accent} fontSize={fontSize}>
        <EditableText
          value={data.ipTransfer}
          onChange={(v) => updateField("ipTransfer", v)}
          className="whitespace-pre-line"
          style={{ color: "#334155" }}
        />
      </Section>

      {/* ── 9. Cancellation ────────────────────────────────────── */}
      <Section n={9} title="Cancellation" accent={accent} fontSize={fontSize}>
        <EditableText
          value={data.cancellationTerms}
          onChange={(v) => updateField("cancellationTerms", v)}
          className="whitespace-pre-line"
          style={{ color: "#334155" }}
        />
      </Section>

      {/* ── 10. Warranty ───────────────────────────────────────── */}
      <Section n={10} title="Warranty" accent={accent} fontSize={fontSize}>
        <EditableText
          value={data.warranty}
          onChange={(v) => updateField("warranty", v)}
          className="whitespace-pre-line"
          style={{ color: "#334155" }}
        />
      </Section>

      {/* ── Signatures ─────────────────────────────────────── */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #e2e8f0" }}>
        <p
          className="uppercase tracking-widest"
          style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 32 }}
        >
          Signatures
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <SignatureBlock label="Designer" name={studioName} signature={designerSignature} />
          <SignatureBlock label="Client" name={clientName} business={businessName} signature={clientSignature} />
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
  fontSize,
  children,
}: {
  n: number;
  title: string;
  accent: string;
  fontSize?: number;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: (fontSize || 14) + 1,
          fontWeight: 600,
          color: "#0f172a",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: "50%",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            backgroundColor: accent,
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        {title}
      </h2>
      <div style={{ paddingLeft: 36 }}>{children}</div>
    </section>
  );
}

/* ── Signature block ─────────────────────────────────────────── */

function SignatureBlock({
  label,
  name,
  business,
  signature,
}: {
  label: string;
  name: string;
  business?: string;
  signature?: { name: string | null; date: string | null };
}) {
  const isSigned = signature?.name && signature?.date;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <p
        className="uppercase tracking-widest"
        style={{ fontSize: 11, color: "#94a3b8", marginBottom: 28 }}
      >
        {label}
      </p>
      {isSigned ? (
        <>
          <p style={{ fontSize: 18, fontFamily: "'Georgia', serif", fontStyle: "italic", color: "#0f172a", marginBottom: 4 }}>
            {signature.name}
          </p>
          <div style={{ borderBottom: "1px solid #cbd5e1", marginBottom: 8 }} />
        </>
      ) : (
        <div style={{ borderBottom: "1px solid #cbd5e1", height: 40, marginBottom: 8 }} />
      )}
      <p style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{name}</p>
      {business && <p style={{ fontSize: 12, color: "#94a3b8" }}>{business}</p>}
      {isSigned ? (
        <>
          <p style={{ fontSize: 14, color: "#334155", marginTop: 24 }}>
            {formatDate(signature.date!)}
          </p>
          <div style={{ borderBottom: "1px solid #cbd5e1", marginBottom: 8 }} />
        </>
      ) : (
        <div style={{ borderBottom: "1px solid #cbd5e1", height: 32, marginTop: 24, marginBottom: 8 }} />
      )}
      <p style={{ fontSize: 12, color: "#94a3b8" }}>Date</p>
    </div>
  );
}
