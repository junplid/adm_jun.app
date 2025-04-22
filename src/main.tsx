import "./index.css";

import { createRoot } from "react-dom/client";
import { Provider } from "@components/ui/provider.tsx";
import App from "./App.tsx";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "@components/ui/toaster.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
});

createRoot(document.getElementById("root")!).render(
  <CookiesProvider>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster />
    </Provider>
  </CookiesProvider>
);
