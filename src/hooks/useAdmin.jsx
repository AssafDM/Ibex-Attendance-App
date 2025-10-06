// src/hooks/useAdmin.js
import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(false);

  return { isAdmin, loading };
}
