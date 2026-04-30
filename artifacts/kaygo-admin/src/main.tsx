import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (rawApiBaseUrl) {
  setBaseUrl(rawApiBaseUrl.replace(/\/+$/, ""));
}

createRoot(document.getElementById("root")!).render(<App />);
