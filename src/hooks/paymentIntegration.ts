import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as PaymentIntegration from "../services/api/PaymentIntegration";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetPaymentIntegrations(params?: {}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["payment-integrations", params],
    queryFn: async () => {
      try {
        return await PaymentIntegration.getPaymentIntegrations(params || {});
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
        throw error;
      }
    },
  });
}

// export function useGetChatbotDetails(id: number) {
//   const { logout } = useContext(AuthContext);
//   return useQuery({
//     queryKey: ["chatbot-details", id],
//     queryFn: async () => {
//       try {
//         return await PaymentIntegration.getChatbotDetails({ id });
//       } catch (error) {
//         if (error instanceof AxiosError) {
//           if (error.response?.status === 401) logout();
//           if (error.response?.status === 400) {
//             const dataError = error.response?.data as ErrorResponse_I;
//             if (dataError.toast.length) dataError.toast.forEach(toaster.create);
//           }
//         }
//         throw error;
//       }
//     },
//   });
// }

export function useGetPaymentIntegration(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["payment-integration", id],
    queryFn: async () => {
      try {
        return await PaymentIntegration.getPaymentIntegration(id);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
        throw error;
      }
    },
  });
}

export function useGetPaymentIntegrationsOptions(params?: {}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["payment-integrations-options", params],
    queryFn: async () => {
      try {
        return await PaymentIntegration.getOptionsPaymentIntegrations(
          params || {}
        );
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
        throw error;
      }
    },
  });
}

export function useCreatePaymentIntegration(props?: {
  setError?: UseFormSetError<{
    name: string;
    provider: PaymentIntegration.TypeProviderPayment;
    status?: boolean;
    access_token: string;
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      provider: PaymentIntegration.TypeProviderPayment;
      status?: boolean;
      access_token: string;
    }) => PaymentIntegration.createPaymentIntegration(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["payment-integrations", null])) {
        queryClient.setQueryData(["payment-integrations", null], (old: any) => {
          if (!old) return old;
          return [
            { ...data, name: body.name, provider: body.provider },
            ...old,
          ];
        });
      }

      if (
        queryClient.getQueryData<any>(["payment-integrations-options", null])
      ) {
        queryClient.setQueryData(
          ["payment-integrations-options", null],
          (old: any) => [...(old || []), { id: data.id, name: body.name }]
        );
      }
    },
    onError(error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              props?.setError?.(path, { message: text })
            );
          }
        }
      }
    },
  });
}

export function useUpdatePaymentIntegration(props?: {
  setError?: UseFormSetError<{
    name?: string;
    provider?: PaymentIntegration.TypeProviderPayment;
    status?: boolean;
    access_token?: string;
  }>;
  onSuccess?: () => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: {
        name?: string;
        provider?: PaymentIntegration.TypeProviderPayment;
        status?: boolean;
        access_token?: string;
      };
    }) => PaymentIntegration.updatePaymentIntegration(id, body),
    async onSuccess(_, { id, body }) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["payment-integration", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["payment-integrations", null])) {
        queryClient.setQueryData(["payment-integrations", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id)
              b = {
                ...b,
                name: body.name || b.name,
                provider: body.provider || b.provider,
                status: body.status ?? b.status,
              };
            return b;
          })
        );
      }
      if (
        queryClient.getQueryData<any>(["payment-integrations-options", null])
      ) {
        queryClient.setQueryData(
          ["payment-integrations-options", null],
          (old: any) =>
            old?.map((b: any) => {
              if (b.id === id) b = { ...b, name: body.name || b.name };
              return b;
            })
        );
      }
    },
    onError(error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast?.length) dataError.toast.forEach(toaster.create);
          if (dataError.input?.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              props?.setError?.(path, { message: text })
            );
          }
        }
      }
    },
  });
}

export function useDeletePaymentIntegration(props?: {
  onSuccess?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);
  return useMutation({
    mutationFn: (id: number) => PaymentIntegration.deletePaymentIntegration(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({
        queryKey: ["payment-integration-details", id],
      });
      queryClient.removeQueries({ queryKey: ["payment-integration", id] });
      queryClient.setQueryData(["payment-integrations", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(
        ["payment-integrations-options", null],
        (old: any) => old?.filter((b: any) => b.id !== id)
      );
    },
    onError(error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
    },
  });
}
