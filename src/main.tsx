import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";

// Explicitly define React for global use
window.React = React;

import App from "./App.tsx";
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.captureConsoleIntegration({ levels: ["error"] })],
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
