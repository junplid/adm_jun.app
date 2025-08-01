import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as MenuOnlineService from "../services/api/MenuOnline";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetMenuOnlineDetails(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["menu-online-details", id],
    queryFn: async () => {
      try {
        return await MenuOnlineService.getMenuOnlineDetails(id);
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

export function useGetMenuOnline(params: { uuid: string }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["menu-online", params.uuid],
    queryFn: async () => {
      try {
        return await MenuOnlineService.getMenuOnline(params);
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

export function useGetMenusOnline(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["menus-online", params],
    queryFn: async () => {
      try {
        return await MenuOnlineService.getMenusOnline(params || {});
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

export function useGetMenuOnlineItems(params: { uuid: string }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["menus-online-items", params],
    queryFn: async () => {
      try {
        return await MenuOnlineService.getMenuOnlineItems(params);
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

export function useGetMenusOnlineOptions(params?: {
  name?: string;
  filterIds?: number[];
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["menus-online-options", params],
    queryFn: async () => {
      try {
        return await MenuOnlineService.getOptionsMenusOnline(params || {});
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

export function useCreateMenuOnline(props?: {
  setError?: UseFormSetError<{ identifier: string; desc?: string; img: File }>;
  onSuccess?: () => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { identifier: string; desc?: string; img: File }) =>
      MenuOnlineService.createMenuOnline(body),
    async onSuccess(data, { identifier }) {
      if (props?.onSuccess) await props.onSuccess();
      // await queryClient.setQueryData(["menu-online", data.id], () => ({
      //   name,
      //   description,
      // }));

      if (queryClient.getQueryData<any>(["menus-online", null])) {
        queryClient.setQueryData(["menus-online", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, identifier }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["menus-online-options", null])) {
        queryClient.setQueryData(["menus-online-options", null], (old: any) => [
          ...(old || []),
          { id: data.id, identifier },
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

export function useCreateMenuOnlineItem(props?: {
  setError?: UseFormSetError<{
    name: string;
    category: "pizzas" | "drinks";
    desc?: string;
    beforePrice?: number;
    afterPrice?: number;
    img: File;
    qnt?: number;
  }>;
  onSuccess?: () => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      menuUuid,
      ...body
    }: {
      menuUuid: string;
      name: string;
      category: "pizzas" | "drinks";
      desc?: string;
      beforePrice?: number;
      afterPrice?: number;
      img: File;
      qnt?: number;
    }) => MenuOnlineService.createMenuOnlineItem(menuUuid, body),
    async onSuccess(data, { name }) {
      if (props?.onSuccess) await props.onSuccess();
      // await queryClient.setQueryData(["menu-online", data.id], () => ({
      //   name,
      //   description,
      // }));

      if (queryClient.getQueryData<any>(["menus-online-items", null])) {
        queryClient.setQueryData(["menus-online-items", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["menus-online-items-options", null])) {
        queryClient.setQueryData(
          ["menus-online-items-options", null],
          (old: any) => [...(old || []), { id: data.id, name }]
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

export function useCreateMenuOnlineSizePizza(props?: {
  setError?: UseFormSetError<{
    name: string;
    price: number;
    flavors: number;
    slices?: number;
  }>;
  onSuccess?: () => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      menuUuid,
      ...body
    }: {
      menuUuid: string;
      name: string;
      price: number;
      flavors: number;
      slices?: number;
    }) => MenuOnlineService.createMenuOnlineSizePizza(menuUuid, body),
    async onSuccess(data, { name }) {
      if (props?.onSuccess) await props.onSuccess();
      // await queryClient.setQueryData(["menu-online", data.id], () => ({
      //   name,
      //   description,
      // }));

      if (queryClient.getQueryData<any>(["menus-online-sizes-pizza", null])) {
        queryClient.setQueryData(
          ["menus-online-sizes-pizza", null],
          (old: any) => {
            if (!old) return old;
            return [{ ...data, name }, ...old];
          }
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

export function useUpdateMenuOnline(props?: {
  setError?: UseFormSetError<{ name?: string; description?: string }>;
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
      body: { name?: string; description?: string | null };
    }) => MenuOnlineService.updateMenuOnline(id, body),
    async onSuccess({ updateAt }, { id, body }) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["menu-online-details", id], (old: any) => {
        if (!old) return old;
        return { ...old, ...body, updateAt };
      });
      queryClient.setQueryData(["menu-online", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["menus-online", null])) {
        queryClient.setQueryData(["menus-online", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id) b = { ...b, ...body };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["menus-online-options", null])) {
        queryClient.setQueryData(["menus-online-options", null], (old: any) =>
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

export function useDeleteMenuOnline(props?: {
  onSuccess?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (params: { uuid: string }) =>
      MenuOnlineService.deleteMenuOnline(params),
    async onSuccess(_, params) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({
        queryKey: ["menu-online-details", params.uuid],
      });
      queryClient.removeQueries({ queryKey: ["menu-online", params.uuid] });
      queryClient.setQueryData(["menus-online", null], (old: any) =>
        old?.filter((b: any) => b.uuid !== params.uuid)
      );
      queryClient.setQueryData(["menus-online-options", null], (old: any) =>
        old?.filter((b: any) => b.uuid !== params.uuid)
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

export function useDeleteMenuOnlineItem(props?: {
  onSuccess?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (params: { uuid: string }) =>
      MenuOnlineService.deleteMenuOnlineItem(params),
    async onSuccess(_, params) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({
        queryKey: ["menu-online-item-details", params.uuid],
      });
      queryClient.removeQueries({
        queryKey: ["menu-online-item", params.uuid],
      });
      queryClient.setQueryData(["menus-online-items", null], (old: any) =>
        old?.filter((b: any) => b.uuid !== params.uuid)
      );
      queryClient.setQueryData(
        ["menus-online-items-options", null],
        (old: any) => old?.filter((b: any) => b.uuid !== params.uuid)
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
