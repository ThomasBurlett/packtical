import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import App from "@/app/App";
import "../assets/styles.css";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("App root element was not found.");
}

document.documentElement.lang = "en";

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>,
);
