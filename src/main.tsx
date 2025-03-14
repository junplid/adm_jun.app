import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@components/ui/provider.tsx";
import "./index.css";
import App from "./App.tsx";
import { FlowProvider } from "@contexts/flow.context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <FlowProvider>
        <App />
      </FlowProvider>
    </Provider>
  </StrictMode>
);
