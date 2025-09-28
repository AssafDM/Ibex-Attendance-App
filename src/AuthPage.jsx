// src/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import {
  loginEmailPassword,
  signupEmailPassword,
  requestPasswordReset,
} from "./authapi";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) navigate("/", { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await loginEmailPassword(email.trim(), password);
      navigate("/", { replace: true });
    } catch (e) {
      setErr(parseFirebaseError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signupEmailPassword(email.trim(), password, displayName.trim());

      navigate("/", { replace: true });
    } catch (e) {
      setErr(parseFirebaseError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setMode("login");
      alert("Reset link sent (check your inbox).");
    } catch (e) {
      setErr(parseFirebaseError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Ibex Attendance</h1>
          <p className="text-gray-500 text-sm">
            {mode === "login" && "Log in to your account"}
            {mode === "signup" && "Create a new account"}
            {mode === "reset" && "Reset your password"}
          </p>
        </div>

        {/* Tabs */}
        {mode !== "reset" && (
          <div className="flex mb-5 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold ${
                mode === "login" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold ${
                mode === "signup" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Sign up
            </button>
          </div>
        )}

        {/* Error */}
        {err ? (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
            {err}
          </div>
        ) : null}

        {/* Forms */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              show={showPw}
              setShow={setShowPw}
              required
            />
            <button
              disabled={busy}
              className="w-full py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-sm text-purple-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Display name"
              value={displayName}
              onChange={setDisplayName}
              placeholder="Antoine Dupont"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              show={showPw}
              setShow={setShowPw}
              required
            />
            <p className="text-xs text-gray-500 -mt-2">
              Minimum 6 characters (Firebase rule).
            </p>
            <button
              disabled={busy}
              className="w-full py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <button
              disabled={busy}
              className="w-full py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full py-2 rounded-lg bg-gray-100 font-semibold hover:bg-gray-200"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ——— UI bits ——— */
function Input({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
        {...props}
      />
    </label>
  );
}

function PasswordInput({ label, value, onChange, show, setShow, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-l-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="px-3 rounded-r-lg border border-l-0 bg-gray-50 text-sm"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

/* ——— Error prettifier ——— */
function parseFirebaseError(e) {
  const code = e?.code || "";
  if (code.includes("user-not-found")) return "No account with that email.";
  if (code.includes("wrong-password")) return "Wrong password.";
  if (code.includes("email-already-in-use")) return "Email already in use.";
  if (code.includes("weak-password")) return "Password too weak (min 6 chars).";
  if (code.includes("invalid-email")) return "Invalid email address.";
  return e?.message || "Something went wrong.";
}
