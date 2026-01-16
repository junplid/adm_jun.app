import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as InboxDepartmentService from "../services/api/InboxDepartment";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetInboxDepartments(params?: {}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["inbox-departments", params],
    queryFn: async () => {
      try {
        return await InboxDepartmentService.getInboxDepartments(params || {});
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
//         return await InboxDepartmentService.getChatbotDetails({ id });
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

export function useGetInboxDepartment(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["inbox-department", id],
    queryFn: async () => {
      try {
        return await InboxDepartmentService.getInboxDepartment(id);
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

export function useGetInboxDepartmentsOptions(params?: {
  name?: string;
  businessIds?: number[];
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["inbox-departments-options", params],
    queryFn: async () => {
      try {
        return await InboxDepartmentService.getOptionsInboxDepartments(
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

export function useCreateInboxDepartment(props?: {
  setError?: UseFormSetError<{
    name: string;
    // businessId: number;
    signBusiness?: boolean;
    signDepartment?: boolean;
    signUser?: boolean;
    previewNumber?: boolean;
    previewPhoto?: boolean;
    inboxUserIds?: number[];
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const {
    logout,
    account: { businessId },
  } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      // businessId: number;
      signBusiness?: boolean;
      signDepartment?: boolean;
      signUser?: boolean;
      previewNumber?: boolean;
      previewPhoto?: boolean;
      inboxUserIds?: number[];
    }) => InboxDepartmentService.createInboxDepartment({ ...body, businessId }),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["inbox-departments", null])) {
        queryClient.setQueryData(["inbox-departments", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name: body.name }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["inbox-departments-options", null])) {
        queryClient.setQueryData(
          ["inbox-departments-options", null],
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

export function useUpdateInboxDepartment(props?: {
  setError?: UseFormSetError<{
    name: string;
    businessId: number;
    signBusiness?: boolean;
    signDepartment?: boolean;
    signUser?: boolean;
    previewNumber?: boolean;
    previewPhoto?: boolean;
    inboxUserIds?: number[];
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
        businessId?: number;
        signBusiness?: boolean;
        signDepartment?: boolean;
        signUser?: boolean;
        previewNumber?: boolean;
        previewPhoto?: boolean;
        inboxUserIds?: number[];
      };
    }) => InboxDepartmentService.updateInboxDepartment(id, body),
    async onSuccess(data, { id, body }) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["inbox-department", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["inbox-departments", null])) {
        queryClient.setQueryData(["inbox-departments", null], (old: any) =>
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
      if (queryClient.getQueryData<any>(["inbox-departments-options", null])) {
        queryClient.setQueryData(
          ["inbox-departments-options", null],
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

export function useDeleteInboxDepartment(props?: {
  onSuccess?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);
  return useMutation({
    mutationFn: (id: number) =>
      InboxDepartmentService.deleteInboxDepartment(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["inbox-department-details", id] });
      queryClient.removeQueries({ queryKey: ["inbox-department", id] });
      queryClient.setQueryData(["inbox-departments", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(
        ["inbox-departments-options", null],
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
