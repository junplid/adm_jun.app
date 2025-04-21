import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ConnectionWAService from "../services/api/ConnectionWA";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

// export function useGetVariableDetails(id: number) {
//   const { logout } = useContext(AuthContext);
//   return useQuery({
//     queryKey: ["variable-details", id],
//     queryFn: async () => {
//       try {
//         return await VariableService.getVariableDetails(id);
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

export function useGetConnectionWA(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["connection-wa", id],
    queryFn: async () => {
      try {
        return await ConnectionWAService.getConnectionWA(id);
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

export function useGetConnectionsWA(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["connections-wa", params],
    queryFn: async () => {
      try {
        return await ConnectionWAService.getConnectionsWA(params || {});
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

// export function useGetVariablesOptions(params?: {
//   name?: string;
//   businessIds?: number[];
//   type?: VariableService.VariableType[];
// }) {
//   const { logout } = useContext(AuthContext);
//   return useQuery({
//     queryKey: ["variables-options", params],
//     queryFn: async () => {
//       try {
//         return await VariableService.getOptionsVariables(params || {});
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

export function useCreateConnectionWA(props?: {
  setError?: UseFormSetError<{
    name: string;
    description?: string;
    businessId: number;
    type: ConnectionWAService.ConnectionWAType;
    profileName?: string;
    profileStatus?: string;
    lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
    onlinePrivacy?: "all" | "match_last_seen";
    imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
    statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
    groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
    readReceiptsPrivacy?: "all" | "none";
    fileImage?: File;
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string;
      businessId: number;
      type: ConnectionWAService.ConnectionWAType;
      profileName?: string;
      profileStatus?: string;
      lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
      onlinePrivacy?: "all" | "match_last_seen";
      imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
      statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
      groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
      readReceiptsPrivacy?: "all" | "none";
      fileImage?: File;
    }) => ConnectionWAService.createConnectionWA(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["connections-wa", null])) {
        queryClient.setQueryData(["connections-wa", null], (old: any) => {
          if (!old) return old;
          return [
            { ...data, name: body.name, type: body.type, status: "close" },
            ...old,
          ];
        });
      }

      if (queryClient.getQueryData<any>(["connections-wa-options", null])) {
        queryClient.setQueryData(
          ["connections-wa-options", null],
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

export function useUpdateConnectionWA(props?: {
  setError?: UseFormSetError<{
    name?: string;
    description?: string | null;
    type?: ConnectionWAService.ConnectionWAType;
    businessId?: number;
    profileName?: string | null;
    profileStatus?: string | null;
    lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
    onlinePrivacy?: "all" | "match_last_seen";
    imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
    statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
    groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
    readReceiptsPrivacy?: "all" | "none";
    fileImage?: string | null;
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
        description?: string | null;
        type?: ConnectionWAService.ConnectionWAType;
        businessId?: number;
        profileName?: string | null;
        profileStatus?: string | null;
        lastSeenPrivacy?:
          | "all"
          | "contacts"
          | "contact_blacklist"
          | "none"
          | null;
        onlinePrivacy?: "all" | "match_last_seen" | null;
        imgPerfilPrivacy?:
          | "all"
          | "contacts"
          | "contact_blacklist"
          | "none"
          | null;
        statusPrivacy?:
          | "all"
          | "contacts"
          | "contact_blacklist"
          | "none"
          | null;
        groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist" | null;
        readReceiptsPrivacy?: "all" | "none" | null;
        fileImage?: File | null;
      };
    }) => ConnectionWAService.updateConnectionWA(id, body),
    async onSuccess(data, { id, body }) {
      const { businessId, fileImage, ...bodyData } = body;
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["connection-wa", id], (old: any) => ({
        ...old,
        ...body,
        fileImage: data.fileImage || old.fileImage,
      }));

      if (queryClient.getQueryData<any>(["connections-wa", null])) {
        queryClient.setQueryData(["connections-wa", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id)
              b = {
                ...b,
                name: bodyData.name || b.name,
                type: bodyData.type || b.type,
                business: data.business,
              };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["connections-wa-options", null])) {
        queryClient.setQueryData(["connections-wa-options", null], (old: any) =>
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

// export function useDeleteVariable(props?: { onSuccess?: () => Promise<void> }) {
//   const queryClient = useQueryClient();
//   const { logout } = useContext(AuthContext);

//   return useMutation({
//     mutationFn: (id: number) => VariableService.deleteVariable(id),
//     async onSuccess(_, id) {
//       if (props?.onSuccess) await props.onSuccess();
//       queryClient.removeQueries({ queryKey: ["variable-details", id] });
//       queryClient.removeQueries({ queryKey: ["variable", id] });
//       queryClient.setQueryData(["variables", null], (old: any) =>
//         old?.filter((b: any) => b.id !== id)
//       );
//       queryClient.setQueryData(["variables-options", null], (old: any) =>
//         old?.filter((b: any) => b.id !== id)
//       );
//     },
//     onError(error: unknown) {
//       if (error instanceof AxiosError) {
//         if (error.response?.status === 401) logout();
//         if (error.response?.status === 400) {
//           const dataError = error.response?.data as ErrorResponse_I;
//           if (dataError.toast.length) dataError.toast.forEach(toaster.create);
//         }
//       }
//     },
//   });
// }
