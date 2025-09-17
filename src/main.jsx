import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Root from "./Root.jsx";
import "firebaseui/dist/firebaseui.css";
import { getMessaging, onMessage } from "firebase/messaging";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);
