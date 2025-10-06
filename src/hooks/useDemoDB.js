import { useState, useEffect, useCallback } from "react";
import seed from "../mockSeed.json";

const STORAGE_KEY = "ibexDemoDB";

export function useDemoDB() {
  const [db, setDb] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return structuredClone(seed);
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return structuredClone(seed);
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const resetDB = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    setDb(structuredClone(seed));
  }, []);

  return { db, setDb, resetDB };
}
