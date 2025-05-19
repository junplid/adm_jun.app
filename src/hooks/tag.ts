import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as TagService from "../services/api/Tag";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetTagDetails(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["tag-details", id],
    queryFn: async () => {
      try {
        return await TagService.getTagDetails(id);
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

export function useGetTag(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["tag", id],
    queryFn: async () => {
      try {
        return await TagService.getTag(id);
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

export function useGetTags(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["tags", params],
    queryFn: async () => {
      try {
        return await TagService.getTags(params || {});
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

export function useGetTagsOptions(params?: {
  name?: string;
  businessIds?: number[];
  type?: TagService.TagType;
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["tags-options", params],
    queryFn: async () => {
      try {
        return await TagService.getOptionsTags(params || {});
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

export function useCreateTag(props?: {
  setError?: UseFormSetError<{
    name: string;
    type: TagService.TagType;
    businessIds?: number[];
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      targetId?: number;
      businessIds?: number[];
      type: TagService.TagType;
    }) => TagService.createTag(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["tags", null])) {
        queryClient.setQueryData(["tags", null], (old: any) => {
          if (!old) return old;
          return [
            { ...data, name: body.name, type: body.type, records: 0 },
            ...old,
          ];
        });
      }

      if (queryClient.getQueryData<any>(["tags-options", null])) {
        queryClient.setQueryData(["tags-options", null], (old: any) => [
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

export function useUpdateTag(props?: {
  setError?: UseFormSetError<{
    name?: string;
    type?: TagService.TagType;
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
        type?: TagService.TagType;
        businessIds?: number[];
      };
    }) => TagService.updateTag(id, body),
    async onSuccess(_, { id, body }) {
      const { businessIds, ...bodyData } = body;
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["tag", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["tags", null])) {
        queryClient.setQueryData(["tags", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id) b = { ...b, ...bodyData };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["tags-options", null])) {
        queryClient.setQueryData(["tags-options", null], (old: any) =>
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

export function useDeleteTag(props?: { onSuccess?: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: number) => TagService.deleteTag(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["tag-details", id] });
      queryClient.removeQueries({ queryKey: ["tag", id] });
      queryClient.setQueryData(["tags", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["tags-options", null], (old: any) =>
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
