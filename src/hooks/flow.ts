import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as FlowService from "../services/api/Flow";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetFlowData(id: string) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["flow-data", id],
    queryFn: async () => {
      try {
        return await FlowService.getFlowData(id);
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

export function useGetFlowDetails(id: string) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["flow-details", id],
    queryFn: async () => {
      try {
        return await FlowService.getFlowDetails(id);
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

export function useGetFlow(id: string) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["flow", id],
    queryFn: async () => {
      try {
        return await FlowService.getFlow(id);
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

export function useGetFlows(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["flows", params],
    queryFn: async () => {
      try {
        return await FlowService.getFlows(params || {});
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

export function useGetFlowsOptions(params?: {
  name?: string;
  businessIds?: number[];
  type?: ("marketing" | "chatbot" | "universal")[];
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["flows-options", params],
    queryFn: async () => {
      try {
        return await FlowService.getOptionsFlows(params || {});
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

export function useCreateFlow(props?: {
  setError?: UseFormSetError<{
    name: string;
    type: FlowService.FlowType;
    businessIds?: number[];
  }>;
  onSuccess?: (id: string) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      type: FlowService.FlowType;
      businessIds?: number[];
    }) => FlowService.createFlow(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      await queryClient.setQueryData(["flow", data.id], () => body);

      if (queryClient.getQueryData<any>(["flows", null])) {
        queryClient.setQueryData(["flows", null], (old: any) => {
          if (!old) return old;
          return [...old, { ...data, name: body.name, type: body.type }];
        });
      }

      if (queryClient.getQueryData<any>(["flows-options", null])) {
        queryClient.setQueryData(["flows-options", null], (old: any) => [
          ...(old || []),
          { id: data.id, name: body.name },
        ]);
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

export function useUpdateFlow(props?: {
  setError?: UseFormSetError<{
    name?: string;
    type?: FlowService.FlowType;
    businessIds?: number[];
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
      id: string;
      body: {
        name?: string;
        type?: FlowService.FlowType;
        businessIds?: number[];
      };
    }) => FlowService.updateFlow(id, body),
    async onSuccess({ updateAt, businesses }, { id, body }) {
      const { businessIds, ...bodyData } = body;
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["flow-details", id], (old: any) => {
        if (!old) return old;
        return { ...old, ...body, updateAt, businesses };
      });

      queryClient.setQueryData(["flow", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["flows", null])) {
        queryClient.setQueryData(["flows", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id) b = { ...b, ...bodyData, businesses, updateAt };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["flows-options", null])) {
        queryClient.setQueryData(["flows-options", null], (old: any) =>
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

export function useUpdateFlowData(props?: {
  setError?: UseFormSetError<{
    nodes?: any[];
    edges?: any[];
  }>;
  onSuccess?: () => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        nodes?: { type: "upset" | "delete"; node: any }[];
        edges?: { type: "upset" | "delete"; edge: any }[];
      };
    }) => FlowService.updateFlowData(id, body),
    async onSuccess() {
      if (props?.onSuccess) await props.onSuccess();
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

export function useDeleteFlow(props?: { onSuccess?: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: string) => FlowService.deleteFlow(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["flow-details", id] });
      queryClient.removeQueries({ queryKey: ["flow", id] });
      queryClient.setQueryData(["flows", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["flows-options", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
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
