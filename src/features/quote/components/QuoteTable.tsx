import type { Quote } from "@/lib/types";

interface QuoteTableProps {
  quote: Quote;
  accent?: string;
}

function fmt(n: number): string {
  if (typeof n !== "number") return "-";
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function QuoteTable({ quote, accent }: QuoteTableProps) {
  if (!quote?.lineItems) return null;
  const currency = quote.currency || "CHF";

  return (
    <div>
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr>
            <th className="p-2.5 px-3.5 text-[12px] font-medium text-th-muted text-left border-b-2 border-th-border">
              Item
            </th>
            <th className="p-2.5 px-3.5 text-[12px] font-medium text-th-muted text-center border-b-2 border-th-border w-[60px]">
              Qty
            </th>
            <th className="p-2.5 px-3.5 text-[12px] font-medium text-th-muted text-right border-b-2 border-th-border w-[110px]">
              Unit Price
            </th>
            <th className="p-2.5 px-3.5 text-[12px] font-medium text-th-muted text-right border-b-2 border-th-border w-[110px]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {quote.lineItems.map((item, i) => (
            <tr key={i}>
              <td className="p-2.5 px-3.5 text-sm text-th-secondary border-b border-th-border-light">
                {item.item}
              </td>
              <td className="p-2.5 px-3.5 text-sm text-th-secondary border-b border-th-border-light text-center">
                {item.quantity}
              </td>
              <td className="p-2.5 px-3.5 text-sm text-th-secondary border-b border-th-border-light text-right tabular-nums">
                {currency} {fmt(item.unitPrice)}
              </td>
              <td className="p-2.5 px-3.5 text-sm text-th-secondary border-b border-th-border-light text-right tabular-nums">
                {currency} {fmt(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={3}
              className="p-2.5 px-3.5 text-sm text-th-secondary font-medium text-right border-b border-th-border"
            >
              Subtotal
            </td>
            <td className="p-2.5 px-3.5 text-sm text-th-secondary font-medium text-right tabular-nums border-b border-th-border">
              {currency} {fmt(quote.subtotal)}
            </td>
          </tr>
          {quote.complexityMultiplier && quote.complexityMultiplier !== 1 && (
            <tr>
              <td
                colSpan={3}
                className="p-2.5 px-3.5 text-[13px] text-th-muted text-right"
              >
                Complexity: {quote.complexityLevel} ({quote.complexityMultiplier}
                x)
              </td>
              <td className="p-2.5 px-3.5 text-[13px] text-th-muted text-right">
                applied
              </td>
            </tr>
          )}
          <tr>
            <td
              colSpan={3}
              className="p-2.5 px-3.5 text-base font-bold text-th-text text-right border-t-2 border-th-border"
            >
              Total
            </td>
            <td className="p-2.5 px-3.5 text-base font-bold text-th-text text-right tabular-nums border-t-2 border-th-border">
              {currency} {fmt(quote.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="flex gap-6 mt-4">
        {quote.estimatedHours > 0 && (
          <div>
            <div className="text-[13px] font-medium text-th-text mb-1">
              Estimated Hours
            </div>
            <div className="text-lg font-semibold text-th-text">
              {quote.estimatedHours}h
            </div>
          </div>
        )}
      </div>

      {quote.notes && (
        <div className="mt-4 p-3.5 px-4 bg-th-surface rounded-[10px] border border-th-border">
          <div className="text-[13px] font-medium text-th-text mb-1">
            Notes
          </div>
          <p className="text-[13px] text-th-muted leading-relaxed m-0">
            {quote.notes}
          </p>
        </div>
      )}
    </div>
  );
}
