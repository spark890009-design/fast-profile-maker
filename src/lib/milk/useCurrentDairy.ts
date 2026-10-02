import { useEffect, useState } from "react";
import { getSelectedDairy, setSelectedDairy, useDairies } from "./data";

export function useCurrentDairy() {
  const q = useDairies();
  const [sel, setSel] = useState(getSelectedDairy());
  useEffect(() => {
    const f = () => setSel(getSelectedDairy());
    window.addEventListener("milk-dairy", f);
    return () => window.removeEventListener("milk-dairy", f);
  }, []);
  const dairies = q.data ?? [];
  const current = dairies.find((d) => d.id === sel) ?? dairies[0] ?? null;
  return { dairies, current, loading: q.isLoading, select: setSelectedDairy };
}
