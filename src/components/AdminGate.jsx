import { Outlet, Navigate, useLocation } from "react-router-dom";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useRef, useState } from "react";

export default function AdminGate() {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const forcedRef = useRef(false);
  const mounted = useRef(false);
  const loc = useLocation();

  useEffect(() => {
    mounted.current = true;

    const unsub = onIdTokenChanged(auth, async (u) => {
      if (!mounted.current) return;

      if (!u) {
        setOk(false);
        setLoading(false);
        return;
      }

      // Force one token refresh per mount so new custom claims appear
      if (!forcedRef.current) {
        forcedRef.current = true;
        try {
          await u.getIdToken(true);
        } catch {
          /* ignore */
        }
      }

      try {
        const res = await u.getIdTokenResult();
        if (!mounted.current) return;
        setOk(!!res.claims?.admin);
      } catch {
        if (!mounted.current) return;
        setOk(false);
      } finally {
        if (mounted.current) setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      unsub();
    };
  }, []);

  if (loading) return null; // don’t render children until ready
  if (!ok) return <Navigate to="/" replace state={{ from: loc }} />;

  return <Outlet />; // ✅ only admins see children
}
