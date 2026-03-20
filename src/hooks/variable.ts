import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as VariableService from "../services/api/Variable";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetVariableDetails(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["variable-details", id],
    queryFn: async () => {
      try {
        return await VariableService.getVariableDetails(id);
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

export function useGetVariable(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["variable", id],
    queryFn: async () => {
      try {
        return await VariableService.getVariable(id);
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

export function useGetVariables(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["variables", params],
    queryFn: async () => {
      try {
        return await VariableService.getVariables(params || {});
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

export function useGetVariablesOptions(params?: {
  name?: string;
  businessIds?: number[];
  type?: VariableService.VariableType[];
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["variables-options", params],
    queryFn: async () => {
      try {
        return await VariableService.getOptionsVariables(params || {});
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

export function useCreateVariable(props?: {
  setError?: UseFormSetError<{
    name: string;
    type: "dynamics" | "constant";
    value?: string;
    businessIds?: number[];
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      value?: string;
      targetId?: number;
      businessIds?: number[];
      type: "dynamics" | "constant";
    }) => VariableService.createVariable(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["variables", null])) {
        queryClient.setQueryData(["variables", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name: body.name, type: body.type }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["variables-options", null])) {
        queryClient.setQueryData(["variables-options", null], (old: any) => [
          ...(old || []),
          { id: data.id, name: body.name, type: body.type },
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

export function useUpdateVariable(props?: {
  setError?: UseFormSetError<{
    name?: string;
    type?: "dynamics" | "constant";
    value?: string | null;
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
      id: number;
      body: {
        name?: string;
        value?: string | null;
        type?: "dynamics" | "constant";
        businessIds?: number[];
      };
    }) => VariableService.updateVariable(id, body),
    async onSuccess(_, { id, body }) {
      const { businessIds, ...bodyData } = body;
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["variable", id], (old: any) => ({
        ...old,
        ...body,
        ...(body.type === "dynamics" && { value: null }),
      }));

      if (queryClient.getQueryData<any>(["variables", null])) {
        queryClient.setQueryData(["variables", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id)
              b = {
                ...b,
                ...bodyData,
                ...(bodyData.type === "dynamics" && { value: null }),
              };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["variables-options", null])) {
        queryClient.setQueryData(["variables-options", null], (old: any) =>
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

export function useDeleteVariable(props?: { onSuccess?: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: number) => VariableService.deleteVariable(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["variable-details", id] });
      queryClient.removeQueries({ queryKey: ["variable", id] });
      queryClient.setQueryData(["variables", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["variables-options", null], (old: any) =>
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
