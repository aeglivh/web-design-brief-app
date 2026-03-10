import { useRef, useEffect } from "react";

export function QuoteTable({ quote, accent }) {
  if (!quote || !quote.lineItems) return null;
  const acc = accent || "#3b82f6";
  const currency = quote.currency || "CHF";

  const fmt = (n) => {
    if (typeof n !== "number") return "-";
    return n.toLocaleString("de-CH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const thStyle = { padding: "10px 14px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, textAlign: "left", borderBottom: "2px solid #e2e8f0" };
  const tdStyle = { padding: "10px 14px", fontSize: 14, color: "#334155", borderBottom: "1px solid #f1f5f9" };
  const tdRight = { ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" };

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={thStyle}>Item</th>
            <th style={{ ...thStyle, textAlign: "center", width: 60 }}>Qty</th>
            <th style={{ ...thStyle, textAlign: "right", width: 110 }}>Unit Price</th>
            <th style={{ ...thStyle, textAlign: "right", width: 110 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {quote.lineItems.map((item, i) => (
            <tr key={i}>
              <td style={tdStyle}>{item.item}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.quantity}</td>
              <td style={tdRight}>{currency} {fmt(item.unitPrice)}</td>
              <td style={tdRight}>{currency} {fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" style={{ ...tdStyle, textAlign: "right", fontWeight: 500, borderBottom: "1px solid #e2e8f0" }}>Subtotal</td>
            <td style={{ ...tdRight, fontWeight: 500, borderBottom: "1px solid #e2e8f0" }}>{currency} {fmt(quote.subtotal)}</td>
          </tr>
          {quote.complexityMultiplier && quote.complexityMultiplier !== 1 && (
            <tr>
              <td colSpan="3" style={{ ...tdStyle, textAlign: "right", fontSize: 13, color: "#64748b" }}>
                Complexity: {quote.complexityLevel} ({quote.complexityMultiplier}x)
              </td>
              <td style={{ ...tdRight, fontSize: 13, color: "#64748b" }}>applied</td>
            </tr>
          )}
          <tr>
            <td colSpan="3" style={{ ...tdStyle, textAlign: "right", fontWeight: 700, fontSize: 16, color: "#0f172a", borderTop: "2px solid #e2e8f0", borderBottom: "none" }}>Total</td>
            <td style={{ ...tdRight, fontWeight: 700, fontSize: 16, color: "#0f172a", borderTop: "2px solid #e2e8f0", borderBottom: "none" }}>{currency} {fmt(quote.total)}</td>
          </tr>
        </tfoot>
      </table>

      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        {quote.estimatedHours > 0 && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>Estimated Hours</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{quote.estimatedHours}h</div>
          </div>
        )}
      </div>

      {quote.notes && (
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>Notes</div>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{quote.notes}</p>
        </div>
      )}
    </div>
  );
}

export function QuoteModal({ quote, businessName, accent, onClose }) {
  const acc = accent || "#3b82f6";
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div ref={overlayRef} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 8, width: "100%", maxWidth: 700, maxHeight: "90vh", overflowY: "auto", padding: "40px 44px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#0f172a" }}>Project Quote</div>
            {businessName && <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{businessName}</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()}
              style={{ background: acc, color: "#fff", border: "none", borderRadius: 4, padding: "8px 18px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
              Print
            </button>
            <button onClick={onClose}
              style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 4, padding: "8px 14px", color: "#64748b", fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Close
            </button>
          </div>
        </div>
        <QuoteTable quote={quote} accent={acc} />
      </div>
    </div>
  );
}
