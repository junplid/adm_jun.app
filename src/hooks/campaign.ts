import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as CampaignService from "../services/api/Campaign";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetCampaignDetails(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["campaign-details", id],
    queryFn: async () => {
      try {
        return await CampaignService.getCampaignDetails(id);
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

export function useGetCampaign(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      try {
        return await CampaignService.getCampaign(id);
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

export function useGetCampaigns(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: async () => {
      try {
        return await CampaignService.getCampaigns(params || {});
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

export function useGetCampaignsOptions(params?: {
  name?: string;
  filterIds?: number[];
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["campaigns-options", params],
    queryFn: async () => {
      try {
        return await CampaignService.getOptionsCampaigns(params || {});
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

export function useCreateCampaign(props?: {
  setError?: UseFormSetError<{ name: string; description?: string }>;
  onSuccess?: () => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      flowId: string;
      tagsIds?: number[];
      description?: string;
      businessIds?: number[];
      shootingSpeedId: number;
      connectionIds: number[];
      timeItWillStart?: string;
      operatingDays?: {
        dayOfWeek: number;
        workingTimes?: { start: string; end: string }[];
      }[];
      contacts?: {
        name?: string;
        number: string;
      }[];
    }) => CampaignService.createCampaign(body),
    async onSuccess(data, { name, description }) {
      if (props?.onSuccess) await props.onSuccess();
      await queryClient.setQueryData(["campaign", data.id], () => ({
        name,
        description,
      }));

      if (queryClient.getQueryData<any>(["campaigns", null])) {
        queryClient.setQueryData(["campaigns", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["campaigns-options", null])) {
        queryClient.setQueryData(["campaigns-options", null], (old: any) => [
          ...(old || []),
          { id: data.id, name },
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

export function useUpdateCampaign(props?: {
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
    }) => CampaignService.updateCampaign(id, body),
    async onSuccess(_, { id, body }) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["campaign-details", id], (old: any) => {
        if (!old) return old;
        return { ...old, ...body };
      });
      queryClient.setQueryData(["campaign", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["campaigns", null])) {
        queryClient.setQueryData(["campaigns", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id) b = { ...b, ...body };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["campaigns-options", null])) {
        queryClient.setQueryData(["campaigns-options", null], (old: any) =>
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

export function useDeleteCampaign(props?: { onSuccess?: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: number) => CampaignService.deleteCampaign(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["campaign-details", id] });
      queryClient.removeQueries({ queryKey: ["campaign", id] });
      queryClient.setQueryData(["campaigns", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["campaigns-options", null], (old: any) =>
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
