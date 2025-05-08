import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ChatbotService from "../services/api/Chatbot";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetChatbots(params?: { name?: string; page?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["chatbots", params],
    queryFn: async () => {
      try {
        return await ChatbotService.getChatbots(params || {});
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

export function useGetChatbotDetails(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["chatbot-details", id],
    queryFn: async () => {
      try {
        return await ChatbotService.getChatbotDetails({ id });
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

export function useGetChatbot(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["chatbot", id],
    queryFn: async () => {
      try {
        return await ChatbotService.getChatbot(id);
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

// export function useGetChatbotsWAOptions(params?: {
//   name?: string;
//   businessIds?: number[];
// }) {
//   const { logout } = useContext(AuthContext);
//   return useQuery({
//     queryKey: ["chatbots-options", params],
//     queryFn: async () => {
//       try {
//         return await ChatbotService.getOptionsChatbots(params || {});
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

export function useCreateChatbot(props?: {
  setError?: UseFormSetError<{
    name: string;
    businessId: number;
    flowId: number;
    connectionWAId?: number;
    status?: boolean;
    description?: string;
    addLeadToAudiencesIds?: number[];
    addToLeadTagsIds?: number[];
    timeToRestart?: {
      value: number;
      type: "seconds" | "minutes" | "hours" | "days";
    };
    operatingDays?: {
      dayOfWeek: number;
      workingTimes?: { start: string; end: string }[];
    }[];
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      businessId: number;
      flowId: number;
      connectionWAId?: number;
      status?: boolean;
      description?: string;
      addLeadToAudiencesIds?: number[];
      addToLeadTagsIds?: number[];
      timeToRestart?: {
        value: number;
        type: "seconds" | "minutes" | "hours" | "days";
      };
      operatingDays?: {
        dayOfWeek: number;
        workingTimes?: { start: string; end: string }[];
      }[];
    }) => ChatbotService.createChatbot(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["chatbots", null])) {
        queryClient.setQueryData(["chatbots", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name: body.name }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["chatbots-options", null])) {
        queryClient.setQueryData(["chatbots-options", null], (old: any) => [
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

export function useUpdateChatbot(props?: {
  setError?: UseFormSetError<{
    name?: string;
    businessId?: number;
    flowId?: number;
    connectionWAId?: number;
    status?: boolean;
    description?: string;
    addLeadToAudiencesIds?: number[];
    addToLeadTagsIds?: number[];
    timeToRestart?: {
      value: number;
      type: "seconds" | "minutes" | "hours" | "days";
    };
    operatingDays?: {
      dayOfWeek: number;
      workingTimes?: { start: string; end: string }[];
    }[];
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
        flowId?: number;
        connectionWAId?: number;
        status?: boolean;
        description?: string;
        addLeadToAudiencesIds?: number[];
        addToLeadTagsIds?: number[];
        timeToRestart?: {
          value?: number;
          type?: "seconds" | "minutes" | "hours" | "days";
        };
        operatingDays?: {
          dayOfWeek: number;
          workingTimes?: { start: string; end: string }[];
        }[];
      };
    }) => ChatbotService.updateChatbot(id, body),
    async onSuccess(data, { id, body }) {
      const { businessId, ...bodyData } = body;
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["chatbot", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["chatbots", null])) {
        queryClient.setQueryData(["chatbots", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id)
              b = {
                ...b,
                name: bodyData.name || b.name,
                ...data,
              };
            return b;
          })
        );
      }
      if (queryClient.getQueryData<any>(["chatbots-options", null])) {
        queryClient.setQueryData(["chatbots-options", null], (old: any) =>
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

export function useDeleteChatbot(props?: { onSuccess?: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: number) => ChatbotService.deleteChatbot(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["chatbot-details", id] });
      queryClient.removeQueries({ queryKey: ["chatbot", id] });
      queryClient.setQueryData(["chatbots", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["chatbots-options", null], (old: any) =>
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
