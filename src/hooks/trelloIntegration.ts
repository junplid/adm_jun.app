import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as TrelloIntegration from "../services/api/TrelloIntegration";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetTrelloIntegrations(params?: {}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["trello-integrations", params],
    queryFn: async () => {
      try {
        return await TrelloIntegration.getTrelloIntegrations(params || {});
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

export function useGetTrelloIntegration(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["trello-integration", id],
    queryFn: async () => {
      try {
        return await TrelloIntegration.getTrelloIntegration(id);
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

export function useGetTrelloIntegrationsOptions(params?: {}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["trello-integrations-options", params],
    queryFn: async () => {
      try {
        return await TrelloIntegration.getOptionsTrelloIntegrations(
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

export function useGetBoardsTrelloIntegrationOptions(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["boards-trello-integration-options", id],
    queryFn: async () => {
      try {
        return await TrelloIntegration.getBoardsTrelloIntegrationOptions(id);
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

export function useGetListsOnBoardTrelloIntegrationOptions(
  id: number,
  boardId: string
) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["lists-board-trello-integration-options", id],
    queryFn: async () => {
      try {
        return await TrelloIntegration.getListsOnBoardTrelloIntegrationOptions(
          id,
          boardId
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

export function useCreateTrelloIntegration(props?: {
  setError?: UseFormSetError<{
    name: string;
    status?: boolean;
    token: string;
    key: string;
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      status?: boolean;
      token: string;
      key: string;
    }) => TrelloIntegration.createTrelloIntegration(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["trello-integrations", null])) {
        queryClient.setQueryData(["trello-integrations", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name: body.name }, ...old];
        });
      }

      if (
        queryClient.getQueryData<any>(["trello-integrations-options", null])
      ) {
        queryClient.setQueryData(
          ["trello-integrations-options", null],
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

export function useUpdateTrelloIntegration(props?: {
  setError?: UseFormSetError<{
    name?: string;
    status?: boolean;
    token?: string;
    key?: string;
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
        status?: boolean;
        token?: string;
        key?: string;
      };
    }) => TrelloIntegration.updateTrelloIntegration(id, body),
    async onSuccess(_, { id, body }) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["trello-integration", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["trello-integrations", null])) {
        queryClient.setQueryData(["trello-integrations", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id)
              b = {
                ...b,
                name: body.name || b.name,
                status: body.status ?? b.status,
              };
            return b;
          })
        );
      }
      if (
        queryClient.getQueryData<any>(["trello-integrations-options", null])
      ) {
        queryClient.setQueryData(
          ["trello-integrations-options", null],
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

export function useDeleteTrelloIntegration(props?: {
  onSuccess?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);
  return useMutation({
    mutationFn: (id: number) => TrelloIntegration.deleteTrelloIntegration(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({
        queryKey: ["trello-integration-details", id],
      });
      queryClient.removeQueries({ queryKey: ["trello-integration", id] });
      queryClient.setQueryData(["trello-integrations", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(
        ["trello-integrations-options", null],
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
