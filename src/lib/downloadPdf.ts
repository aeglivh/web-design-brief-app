// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — html2pdf.js has no types
import html2pdf from "html2pdf.js";

/**
 * Download an HTML string as a PDF file.
 * html2pdf handles DOM mounting/rendering/cleanup internally.
 */
export async function downloadPdf(htmlString: string, filename: string) {
  const opt = {
    margin: [12, 10, 12, 10] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const },
    pagebreak: { mode: ["css"] as string[] },
  };
  await html2pdf().set(opt).from(htmlString).save();
}

/**
 * Build clean contract HTML string for PDF export.
 */
export function buildContractHtml(opts: {
  studioName: string;
  clientName: string;
  businessName?: string;
  currency?: string;
  accent: string;
  data: Record<string, unknown>;
  designerSignature?: { name: string | null; date: string | null };
  clientSignature?: { name: string | null; date: string | null };
}): string {
  const {
    studioName,
    clientName,
    businessName,
    currency = "CHF",
    accent,
    data,
    designerSignature,
    clientSignature,
  } = opts;

  const d = data as {
    scopeOfWork?: string;
    deliverables?: { item: string; description?: string }[];
    exclusions?: string[];
    revisionPolicy?: {
      designRevisions?: number;
      developmentRevisions?: number;
      additionalRate?: number;
      description?: string;
    };
    timeline?: {
      totalWeeks?: number;
      milestones?: { phase: string; weeks: string; deliverable: string }[];
    };
    paymentSchedule?: { milestone: string; percentage: number; amount: number }[];
    changeRequestProcess?: string;
    ipTransfer?: string;
    cancellationTerms?: string;
    warranty?: string;
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const sigBlock = (
    label: string,
    name: string,
    business: string | undefined,
    sig?: { name: string | null; date: string | null },
  ) => {
    const signed = sig?.name && sig?.date;
    return `
      <div style="flex:1">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 20px">${label}</p>
        ${
          signed
            ? `<p style="font-size:16px;font-family:Georgia,serif;font-style:italic;color:#0f172a;margin:0 0 4px">${sig.name}</p>
               <div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>`
            : `<div style="border-bottom:1px solid #cbd5e1;height:32px;margin-bottom:6px"></div>`
        }
        <p style="font-size:12px;font-weight:500;color:#0f172a;margin:0">${name}</p>
        ${business ? `<p style="font-size:11px;color:#94a3b8;margin:2px 0 0">${business}</p>` : ""}
        ${
          signed
            ? `<p style="font-size:12px;color:#334155;margin:16px 0 0">${formatDate(sig.date!)}</p>
               <div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>`
            : `<div style="border-bottom:1px solid #cbd5e1;height:24px;margin-top:16px;margin-bottom:6px"></div>`
        }
        <p style="font-size:10px;color:#94a3b8;margin:0">Date</p>
      </div>
    `;
  };

  // Build sections
  const sections: string[] = [];
  let n = 0;

  const sectionHtml = (title: string, content: string) => {
    n++;
    return `
      <section style="margin-bottom:20px">
        <h2 style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#0f172a;margin:0 0 8px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;font-size:10px;font-weight:700;color:#fff;background:${accent};flex-shrink:0">${n}</span>
          ${title}
        </h2>
        <div style="padding-left:30px">${content}</div>
      </section>
    `;
  };

  if (d.scopeOfWork) {
    sections.push(
      sectionHtml(
        "Scope of Work",
        `<p style="color:#334155;white-space:pre-line;margin:0;line-height:1.6">${d.scopeOfWork}</p>`,
      ),
    );
  }

  if (d.deliverables?.length) {
    const items = d.deliverables
      .map(
        (del, i) => `
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <span style="color:#94a3b8;font-weight:600;min-width:18px">${i + 1}.</span>
          <div>
            <strong style="color:#0f172a">${del.item}</strong>${del.description ? `<span style="color:#94a3b8"> — </span><span style="color:#64748b">${del.description}</span>` : ""}
          </div>
        </div>`,
      )
      .join("");
    sections.push(sectionHtml("Deliverables", items));
  }

  if (d.exclusions?.length) {
    const items = d.exclusions
      .map(
        (ex) => `
        <div style="display:flex;gap:6px;align-items:baseline;margin-bottom:4px">
          <span style="color:#94a3b8">•</span>
          <span style="color:#64748b">${ex}</span>
        </div>`,
      )
      .join("");
    sections.push(sectionHtml("Exclusions", items));
  }

  if (d.revisionPolicy) {
    const rp = d.revisionPolicy;
    let content = `<p style="color:#334155;margin:0 0 4px;line-height:1.6">`;
    content += `Design revisions: <strong style="color:#0f172a">${rp.designRevisions ?? "—"} rounds</strong>. `;
    content += `Development revisions: <strong style="color:#0f172a">${rp.developmentRevisions ?? "—"} rounds</strong>. `;
    if (rp.additionalRate != null) {
      content += `Additional revisions billed at <strong style="color:#0f172a">${currency} ${fmt(rp.additionalRate)}/hr</strong>.`;
    }
    content += `</p>`;
    if (rp.description) {
      content += `<p style="color:#64748b;white-space:pre-line;margin:0;line-height:1.6">${rp.description}</p>`;
    }
    sections.push(sectionHtml("Revision Policy", content));
  }

  if (d.timeline?.milestones?.length) {
    let content = `<p style="color:#64748b;margin:0 0 8px;line-height:1.6">Estimated total duration: <strong style="color:#0f172a">${d.timeline.totalWeeks ?? "—"} weeks</strong></p>`;
    content += `<table style="width:100%;border-collapse:collapse">`;
    content += `<thead><tr style="border-bottom:2px solid #e2e8f0">
      <th style="padding:6px 12px 6px 0;text-align:left;font-weight:600;color:#0f172a;font-size:11px">Phase</th>
      <th style="padding:6px 12px 6px 0;text-align:left;font-weight:600;color:#0f172a;font-size:11px">Duration</th>
      <th style="padding:6px 0;text-align:left;font-weight:600;color:#0f172a;font-size:11px">Deliverable</th>
    </tr></thead><tbody>`;
    for (const m of d.timeline.milestones) {
      content += `<tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:8px 12px 8px 0;color:#334155">${m.phase}</td>
        <td style="padding:8px 12px 8px 0;color:#64748b">${m.weeks}</td>
        <td style="padding:8px 0;color:#64748b">${m.deliverable}</td>
      </tr>`;
    }
    content += `</tbody></table>`;
    sections.push(sectionHtml("Project Timeline", content));
  }

  if (d.paymentSchedule?.length) {
    let content = `<table style="width:100%;border-collapse:collapse">`;
    content += `<thead><tr style="border-bottom:2px solid #e2e8f0">
      <th style="padding:6px 12px 6px 0;text-align:left;font-weight:600;color:#0f172a;font-size:11px">Milestone</th>
      <th style="padding:6px 12px 6px 0;text-align:right;font-weight:600;color:#0f172a;font-size:11px">%</th>
      <th style="padding:6px 0;text-align:right;font-weight:600;color:#0f172a;font-size:11px">Amount</th>
    </tr></thead><tbody>`;
    for (const p of d.paymentSchedule) {
      content += `<tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:8px 12px 8px 0;color:#334155">${p.milestone}</td>
        <td style="padding:8px 12px 8px 0;text-align:right;color:#64748b">${p.percentage}%</td>
        <td style="padding:8px 0;text-align:right;font-weight:500;color:#0f172a">${currency} ${fmt(p.amount)}</td>
      </tr>`;
    }
    content += `</tbody></table>`;
    sections.push(sectionHtml("Payment Schedule", content));
  }

  const textSections = [
    { key: "changeRequestProcess", title: "Change Requests" },
    { key: "ipTransfer", title: "Intellectual Property" },
    { key: "cancellationTerms", title: "Cancellation" },
    { key: "warranty", title: "Warranty" },
  ] as const;

  for (const { key, title } of textSections) {
    const val = d[key];
    if (val) {
      sections.push(
        sectionHtml(
          title,
          `<p style="color:#334155;white-space:pre-line;margin:0;line-height:1.6">${val}</p>`,
        ),
      );
    }
  }

  return `
    <div style="font-family:Inter,system-ui,sans-serif;color:#1e293b;font-size:12px;line-height:1.6;max-width:700px;margin:0 auto;padding:32px 28px;background:#fff">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;width:32px;height:3px;border-radius:3px;background:${accent};margin-bottom:12px"></div>
        <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px">Scope of Work &amp; Project Agreement</h1>
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin:0">${studioName} — ${today}</p>
      </div>

      <p style="margin:0 0 20px;color:#475569;line-height:1.6">
        This agreement is entered into between <strong style="color:#0f172a">${studioName}</strong> (the "Designer") and
        <strong style="color:#0f172a">${clientName}${businessName ? ` / ${businessName}` : ""}</strong> (the "Client").
      </p>

      ${sections.join("")}

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;page-break-inside:avoid">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;color:#94a3b8;margin:0 0 20px">Signatures</p>
        <div style="display:flex;gap:40px">
          ${sigBlock("Designer", studioName, undefined, designerSignature)}
          ${sigBlock("Client", clientName, businessName, clientSignature)}
        </div>
      </div>
    </div>
  `;
}
