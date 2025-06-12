import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as AgentAIService from "../services/api/AgentAI";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { UseFormSetError } from "react-hook-form";

export function useGetAgentsAI(params?: {}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["agents-ai", params],
    queryFn: async () => {
      try {
        return await AgentAIService.getAgentsAI(params || {});
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
//         return await AgentAIService.getChatbotDetails({ id });
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

export function useGetAgentAI(id: number) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["agent-ai", id],
    queryFn: async () => {
      try {
        return await AgentAIService.getAgentAI(id);
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

export function useGetAgentsAIWAOptions(params?: {
  name?: string;
  businessIds?: number[];
}) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["agents-ai-options", params],
    queryFn: async () => {
      try {
        return await AgentAIService.getOptionsAgentAI(params || {});
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

export function useCreateAgentAI(props?: {
  setError?: UseFormSetError<{
    providerCredentialId?: number;
    apiKey?: string;
    nameProvider?: string;
    businessIds: number[];
    name: string;
    emojiLevel?: "none" | "low" | "medium" | "high";
    language?: string;
    personality?: string;
    model: string;
    temperature?: number;
    knowledgeBase?: string;
    files?: number[];
    instructions?: string;
    timeout?: number;
    debounce?: number;
  }>;
  onSuccess?: (id: number) => Promise<void>;
}) {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      providerCredentialId?: number;
      apiKey?: string;
      nameProvider?: string;
      businessIds: number[];
      name: string;
      emojiLevel?: "none" | "low" | "medium" | "high";
      language?: string;
      personality?: string;
      model: string;
      temperature?: number;
      knowledgeBase?: string;
      files?: number[];
      instructions?: string;
      timeout?: number;
      debounce?: number;
    }) => AgentAIService.createAgentAI(body),
    async onSuccess(data, body) {
      if (props?.onSuccess) await props.onSuccess(data.id);
      if (queryClient.getQueryData<any>(["agents-ai", null])) {
        queryClient.setQueryData(["agents-ai", null], (old: any) => {
          if (!old) return old;
          return [{ ...data, name: body.name }, ...old];
        });
      }

      if (queryClient.getQueryData<any>(["agents-ai-options", null])) {
        queryClient.setQueryData(["agents-ai-options", null], (old: any) => [
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

function pickExistNode(text: string) {
  const math = text.match(/\/\[sair_node,\s(.+)\]/g);
  if (!math) return [];
  return math.map((s) => s.replace(/\/\[sair_node,\s(.+)\]/, "$1"));
}

export function useUpdateAgentAI(props?: {
  setError?: UseFormSetError<{
    providerCredentialId?: number;
    apiKey?: string;
    nameProvider?: string;
    businessIds: number[];
    name: string;
    emojiLevel?: "none" | "low" | "medium" | "high";
    language?: string;
    personality?: string;
    model: string;
    temperature?: number;
    knowledgeBase?: string;
    files?: {
      id: number;
      originalName: string;
      fileName?: string | null | undefined;
      mimetype?: string | null | undefined;
    }[];
    instructions?: string;
    timeout?: number;
    debounce?: number;
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
        providerCredentialId?: number;
        apiKey?: string;
        nameProvider?: string;
        businessIds?: number[];
        emojiLevel?: "none" | "low" | "medium" | "high";
        language?: string;
        personality?: string;
        model?: string;
        temperature?: number;
        knowledgeBase?: string;
        files?: {
          id: number;
          originalName: string;
          fileName?: string | null | undefined;
          mimetype?: string | null | undefined;
        }[];
        instructions?: string;
        timeout?: number;
        debounce?: number;
      };
    }) =>
      AgentAIService.updateAgentAI(id, {
        ...body,
        files: body.files?.map((f) => f.id),
      }),
    async onSuccess(data, { id, body }) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.setQueryData(["agent-ai", id], (old: any) => ({
        ...old,
        ...body,
      }));

      if (queryClient.getQueryData<any>(["agents-ai", null])) {
        queryClient.setQueryData(["agents-ai", null], (old: any) =>
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
      if (queryClient.getQueryData<any>(["agents-ai-options", null])) {
        const exitNodes = pickExistNode(body.instructions || "");
        queryClient.setQueryData(["agents-ai-options", null], (old: any) =>
          old?.map((b: any) => {
            if (b.id === id) b = { ...b, name: body.name || b.name, exitNodes };
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

export function useDeleteAgentAI(props?: { onSuccess?: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: (id: number) => AgentAIService.deleteAgentAI(id),
    async onSuccess(_, id) {
      if (props?.onSuccess) await props.onSuccess();
      queryClient.removeQueries({ queryKey: ["agent-ai-details", id] });
      queryClient.removeQueries({ queryKey: ["agent-ai", id] });
      queryClient.setQueryData(["agents-ai", null], (old: any) =>
        old?.filter((b: any) => b.id !== id)
      );
      queryClient.setQueryData(["agents-ai-options", null], (old: any) =>
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
