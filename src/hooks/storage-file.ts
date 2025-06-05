import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as StorageFileService from "../services/api/StorageFile";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetStorageFile(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["storage-file", id],
    queryFn: async () => {
      try {
        return await StorageFileService.getStorageFile(id);
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

export function useGetStorageFiles(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["storage-files", params],
    queryFn: async () => {
      try {
        return await StorageFileService.getStorageFiles(params || {});
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

export function useGetStorageFilesOptions(params?: {
  name?: string;
  businessIds?: number[];
  type?: string;
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["flows-options", params],
    queryFn: async () => {
      try {
        return await StorageFileService.getOptionsStorageFiles(params || {});
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

export function useCreateStorageFile(props?: {
  setError?: UseFormSetError<{
    file: File;
    businessIds?: number[] | undefined;
  }>;
  onSuccess?: (id: string) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { file: File; businessIds?: number[] | undefined }) =>
      StorageFileService.createStorageFile(body),
    async onSuccess(data) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      await queryClient.setQueryData(["storage-file", data.id], () => {
        return {
          originalName: data.originalName,
          businessIds: data.businesses.map((b) => b.id),
        };
      });

      if (queryClient.getQueryData<any>(["storage-files", null])) {
        queryClient.setQueryData(["storage-files", null], (old: any) => {
          if (!old) return old;
          return [
            {
              id: data.id,
              businesses: data.businesses,
              size: data.size,
              originalName: data.originalName,
              mimetype: data.mimetype,
              createdAt: data.createdAt,
              fileName: data.fileName,
            },
            ...old,
          ];
        });
      }

      if (queryClient.getQueryData<any>(["storage-files-options", null])) {
        queryClient.setQueryData(
          ["storage-files-options", null],
          (old: any) => [
            ...(old || []),
            {
              businessIds: data.businesses.map((b) => b.id),
              mimetype: data.mimetype,
              originalName: data.originalName,
              id: data.id,
            },
          ]
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

export function useUpdateStorageFile(props?: {
  setError?: UseFormSetError<{
    originalName?: string;
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
        originalName?: string;
        businessIds?: number[];
      };
    }) => StorageFileService.updateStorageFile(id, body),
    async onSuccess({ businesses }, { id, body }) {
      const { businessIds, ...bodyData } = body;
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["storage-file", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["storage-files", null])) {
        queryClient.setQueryData(["storage-files", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id) b = { ...b, ...bodyData, businesses };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["storage-files-options", null])) {
        queryClient.setQueryData(["storage-files-options", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id)
              b = { ...b, originalName: body.originalName || b.name };
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

export function useDeleteStorageFile(props?: {
  onSuccess?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: string) => StorageFileService.deleteStorageFile(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["storage-file", id] });
      queryClient.setQueryData(["storage-files", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["storage-files-options", null], (old: any) =>
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
