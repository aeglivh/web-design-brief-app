import { useState } from "react";
import { authFetch, API_BASE } from "@/lib/api";
import type { ContractData } from "@/lib/types";

interface ContractResult {
  id: string;
  contract_data: ContractData;
  status: string;
  created_at: string;
}

export function useContractGeneration() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [contract, setContract] = useState<ContractResult | null>(null);

  const generate = async (briefId: string) => {
    setGenerating(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/contract`, {
        method: "POST",
        body: JSON.stringify({ briefId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || "Failed to generate contract");
      }
      const data = await res.json();
      setContract(data.contract);
      return data.contract;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generate, generating, error, contract, setContract };
}
