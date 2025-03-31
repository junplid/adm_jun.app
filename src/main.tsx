import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@components/ui/provider.tsx";
import App from "./App.tsx";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "@components/ui/toaster.tsx";

createRoot(document.getElementById("root")!).render(
  <CookiesProvider>
    <Provider>
      <App />
      <Toaster />
    </Provider>
  </CookiesProvider>
);
