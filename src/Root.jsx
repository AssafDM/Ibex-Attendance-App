import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import App from "./App";
import AuthPage from "./AuthPage";
import AdminDash from "./components/adminDash";
import AdminGate from "./components/AdminGate";
import Dashboard from "./components/Dashboard";
import { updateUser } from "./api.fb";

export default function Root() {
  const [user, setUser] = useState(undefined);
  const location = useLocation();
  const [events, setEvents] = useState([]); //event data stored in root level, handled in app level

  //demand user sign in
  useEffect(() => {
    async function getUser() {
      const res = await fetch(`/api/users?uid=u1`);
      const u = await res.json();
      setUser(u); // ✅ move setUser inside the async function
    }
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    // wrap await in an async IIFE
    (async () => {
      try {
        await updateUser();
      } catch (e) {
        console.error("Failed to sync user:", e);
      }
    })();
  }, [user]);

  if (user === undefined) {
    return (
      <div className="bg-ibex-gold items-center">
        <div className="bg-[url(/ibexlogo.png)]"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/" //load dashboard only if logged in
        element={
          user ? (
            <Dashboard events={events} setEvents={setEvents} user={user} />
          ) : (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
          )
        }
      />
      <Route //load login only if not logged in
        path="/login"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Protect /admindash via AdminGate  */}
      <Route element={<AdminGate />}>
        <Route path="/admindash" element={<AdminDash user={user} />} />
      </Route>

      {/*  catch-all */}
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
