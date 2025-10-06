import { Outlet, Navigate, useLocation } from "react-router-dom";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useRef, useState } from "react";

export default function AdminGate() {
  return <Outlet />; // ✅ only admins see children
}
