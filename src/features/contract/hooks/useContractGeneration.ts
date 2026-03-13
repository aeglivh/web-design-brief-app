import { useState, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [contract, setContract] = useState<ContractResult | null>(null);

  /** Load existing contract for a brief */
  const load = useCallback(async (briefId: string) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/contract?briefId=${briefId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.contract) {
          setContract(data.contract);
          return data.contract as ContractResult;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Generate a new contract */
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

  /** Save updated contract data */
  const save = useCallback(async (contractId: string, contractData: ContractData) => {
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/api/contract`, {
        method: "PATCH",
        body: JSON.stringify({ contractId, contract_data: contractData }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        throw new Error(err.error || "Failed to save contract");
      }
      const data = await res.json();
      setContract(data.contract);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { generate, generating, load, loading, save, saving, error, contract, setContract };
}
