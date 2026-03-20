import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as FbPixelService from "../services/api/fbPixel";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetFbPixel(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["fb-pixel", id],
    queryFn: async () => {
      try {
        return await FbPixelService.getFbPixel(id);
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

export function useGetFbPixels(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["fb-pixels", params],
    queryFn: async () => {
      try {
        return await FbPixelService.getFbPixels();
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

export function useGetFbPixelsOptions(params?: { businessId?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["fb-pixels-options", params],
    queryFn: async () => {
      try {
        return await FbPixelService.getOptionsFbPixels(params || {});
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

export function useCreateFbPixel(props?: {
  setError?: UseFormSetError<{
    name: string;
    pixel_id: string;
    access_token: string;
    status?: boolean;
    businessId?: number;
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      pixel_id: string;
      access_token: string;
      status?: boolean;
      businessId?: number;
    }) => FbPixelService.createFbPixel(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["fb-pixels", null])) {
        queryClient.setQueryData(["fb-pixels", null], (old: any) => {
          if (!old) return old;
          return [
            { ...data, name: body.name, pixel_id: body.pixel_id },
            ...old,
          ];
        });
      }

      if (queryClient.getQueryData<any>(["fb-pixels-options", null])) {
        queryClient.setQueryData(["fb-pixels-options", null], (old: any) => [
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

export function useTestFbPixel() {
  const { logout } = useContext(AuthContext);
  return useMutation({
    mutationFn: (body: {
      pixel_id: string;
      access_token: string;
      test_event_code: string;
    }) => FbPixelService.testFbPixel(body),
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

export function useUpdateFbPixel(props?: {
  setError?: UseFormSetError<{
    name?: string;
    pixel_id?: string;
    access_token?: string;
    status?: boolean;
    businessId?: number | null;
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
        pixel_id?: string;
        access_token?: string;
        status?: boolean;
        businessId?: number | null;
      };
    }) => FbPixelService.updateFbPixel(id, body),
    async onSuccess(_, { id, body }) {
      const { businessId, access_token, ...bodyData } = body;
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["fb-pixel", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["fb-pixels", null])) {
        queryClient.setQueryData(["fb-pixels", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id) b = { ...b, ...bodyData };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["fb-pixels-options", null])) {
        queryClient.setQueryData(["fb-pixels-options", null], (old: any) =>
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

export function useDeleteFbPixel(props?: { onSuccess?: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: number) => FbPixelService.deleteFbPixel(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["fb-pixel-details", id] });
      queryClient.removeQueries({ queryKey: ["fb-pixel", id] });
      queryClient.setQueryData(["fb-pixels", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["fb-pixels-options", null], (old: any) =>
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
