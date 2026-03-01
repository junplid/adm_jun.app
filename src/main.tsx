import "./index.css";
import moment from "moment";
import { createRoot } from "react-dom/client";
import { Provider } from "@components/ui/provider.tsx";
import App from "./App.tsx";
import { Toaster } from "@components/ui/toaster.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "sonner";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: false } },
});

moment.locale("pt-br");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(() => {
      console.log("Service Worker registrado");
    })
    .catch(console.error);
}

createRoot(document.getElementById("root")!).render(
  <Provider>
    <QueryClientProvider client={queryClient}>
      <App />
      <Sonner />
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
    <Toaster />
  </Provider>,
);
