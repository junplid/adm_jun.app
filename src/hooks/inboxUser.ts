import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as InboxUserService from "../services/api/InboxUser";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetInboxUsers(params?: {}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["inbox-users", params],
    queryFn: async () => {
      try {
        return await InboxUserService.getInboxUsers(params || {});
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
//         return await InboxUserService.getChatbotDetails({ id });
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

export function useGetInboxUser(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["inbox-user", id],
    queryFn: async () => {
      try {
        return await InboxUserService.getInboxUser(id);
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

export function useGetInboxUsersOptions(params?: {
  name?: string;
  businessIds?: number[];
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["inbox-users-options", params],
    queryFn: async () => {
      try {
        return await InboxUserService.getOptionsInboxUsers(params || {});
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

export function useCreateInboxUser(props?: {
  setError?: UseFormSetError<{
    name: string;
    email: string;
    password: string;
    inboxDepartmentId?: number;
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      email: string;
      password: string;
      inboxDepartmentId?: number;
    }) => InboxUserService.createInboxUser(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["inbox-users", null])) {
        queryClient.setQueryData(["inbox-users", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name: body.name }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["inbox-users-options", null])) {
        queryClient.setQueryData(["inbox-users-options", null], (old: any) => [
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

export function useUpdateInboxUser(props?: {
  setError?: UseFormSetError<{
    name: string;
    email: string;
    password: string;
    inboxDepartmentId?: number | null;
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
        email?: string;
        password?: string;
        inboxDepartmentId?: number | null;
      };
    }) => InboxUserService.updateInboxUser(id, body),
    async onSuccess(data, { id, body }) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["inbox-user", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["inbox-users", null])) {
        queryClient.setQueryData(["inbox-users", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id)
              b = {
                ...b,
                name: body.name || b.name,
                ...data,
              };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["inbox-users-options", null])) {
        queryClient.setQueryData(["inbox-users-options", null], (old: any) =>
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

export function useDeleteInboxUser(props?: {
  onSuccess?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);
  return useMutation({
    mutationFn: (id: number) => InboxUserService.deleteInboxUser(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["inbox-user-details", id] });
      queryClient.removeQueries({ queryKey: ["inbox-user", id] });
      queryClient.setQueryData(["inbox-users", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["inbox-users-options", null], (old: any) =>
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
