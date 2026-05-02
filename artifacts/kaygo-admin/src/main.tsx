import { createRoot } from "react-dom/client";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";
import { getAuthToken } from "./lib/session";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (rawApiBaseUrl) {
  setBaseUrl(rawApiBaseUrl.replace(/\/+$/, ""));
}

setAuthTokenGetter(() => getAuthToken());

createRoot(document.getElementById("root")!).render(<App />);
