// src/hooks/useAdmin.js
import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let forced = false;

    return onIdTokenChanged(auth, async (u) => {
      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Force-refresh ONCE in this session to pull new claims after you edited them.
      if (!forced) {
        forced = true;
        try {
          await u.getIdToken(true);
        } catch {}
      }

      const res = await u.getIdTokenResult(); // fresh if above succeeded
      setIsAdmin(!!res.claims.admin);
      setLoading(false);
    });
  }, []);

  return { isAdmin, loading };
}
