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

// export function useGetChatbotWADetails(id: number) {
//   const { logout } = useContext(AuthContext);
//   return useQuery({
//     queryKey: ["chatbot-details", id],
//     queryFn: async () => {
//       try {
//         return await ChatbotService.getChatbotDetails(id);
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

// export function useGetChatbotWA(id: number) {
//   const { logout } = useContext(AuthContext);
//   return useQuery({
//     queryKey: ["chatbot", id],
//     queryFn: async () => {
//       try {
//         return await ChatbotService.getChatbot(id);
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

// export function useCreateChatbotWA(props?: {
//   setError?: UseFormSetError<{
//     name: string;
//     description?: string;
//     businessId: number;
//     profileName?: string;
//     profileStatus?: string;
//     lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//     onlinePrivacy?: "all" | "match_last_seen";
//     imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//     statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//     groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
//     readReceiptsPrivacy?: "all" | "none";
//     fileImage?: File;
//   }>;
//   onSuccess?: (id: number) => Promise<void>;
// }) {
//   const { logout } = useContext(AuthContext);
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (body: {
//       name: string;
//       description?: string;
//       businessId: number;
//       profileName?: string;
//       profileStatus?: string;
//       lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//       onlinePrivacy?: "all" | "match_last_seen";
//       imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//       statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//       groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
//       readReceiptsPrivacy?: "all" | "none";
//       fileImage?: File;
//     }) => ChatbotService.createChatbot(body),
//     async onSuccess(data, body) {
//       if (props?.onSuccess) await props.onSuccess(data.id);
//       if (queryClient.getQueryData<any>(["chatbots", null])) {
//         queryClient.setQueryData(["chatbots", null], (old: any) => {
//           if (!old) return old;
//           return [
//             { ...data, name: body.name, type: body.type, status: "close" },
//             ...old,
//           ];
//         });
//       }

//       if (queryClient.getQueryData<any>(["chatbots-options", null])) {
//         queryClient.setQueryData(
//           ["chatbots-options", null],
//           (old: any) => [...(old || []), { id: data.id, name: body.name }]
//         );
//       }
//     },
//     onError(error: unknown) {
//       if (error instanceof AxiosError) {
//         if (error.response?.status === 401) logout();
//         if (error.response?.status === 400) {
//           const dataError = error.response?.data as ErrorResponse_I;
//           if (dataError.toast.length) dataError.toast.forEach(toaster.create);
//           if (dataError.input.length) {
//             dataError.input.forEach(({ text, path }) =>
//               // @ts-expect-error
//               props?.setError?.(path, { message: text })
//             );
//           }
//         }
//       }
//     },
//   });
// }

// export function useUpdateChatbotWA(props?: {
//   setError?: UseFormSetError<{
//     name?: string;
//     description?: string | null;
//     businessId?: number;
//     profileName?: string | null;
//     profileStatus?: string | null;
//     lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//     onlinePrivacy?: "all" | "match_last_seen";
//     imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//     statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
//     groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
//     readReceiptsPrivacy?: "all" | "none";
//     fileImage?: string | null;
//   }>;
//   onSuccess?: () => Promise<void>;
// }) {
//   const { logout } = useContext(AuthContext);
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       id,
//       body,
//     }: {
//       id: number;
//       body: {
//         name?: string;
//         description?: string | null;
//         businessId?: number;
//         profileName?: string | null;
//         profileStatus?: string | null;
//         lastSeenPrivacy?:
//           | "all"
//           | "contacts"
//           | "contact_blacklist"
//           | "none"
//           | null;
//         onlinePrivacy?: "all" | "match_last_seen" | null;
//         imgPerfilPrivacy?:
//           | "all"
//           | "contacts"
//           | "contact_blacklist"
//           | "none"
//           | null;
//         statusPrivacy?:
//           | "all"
//           | "contacts"
//           | "contact_blacklist"
//           | "none"
//           | null;
//         groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist" | null;
//         readReceiptsPrivacy?: "all" | "none" | null;
//         fileImage?: File | null;
//       };
//     }) => ChatbotService.updateChatbot(id, body),
//     async onSuccess(data, { id, body }) {
//       const { businessId, fileImage, ...bodyData } = body;
//       if (props?.onSuccess) await props.onSuccess();
//       queryClient.setQueryData(["chatbot", id], (old: any) => ({
//         ...old,
//         ...body,
//         fileImage: data.fileImage || old.fileImage,
//       }));

//       if (queryClient.getQueryData<any>(["chatbots", null])) {
//         queryClient.setQueryData(["chatbots", null], (old: any) =>
//           old?.map((b: any) => {
//             if (b.id === id)
//               b = {
//                 ...b,
//                 name: bodyData.name || b.name,
//                 type: bodyData.type || b.type,
//                 business: data.business,
//               };
//             return b;
//           })
//         );
//       }
//       if (queryClient.getQueryData<any>(["chatbots-options", null])) {
//         queryClient.setQueryData(["chatbots-options", null], (old: any) =>
//           old?.map((b: any) => {
//             if (b.id === id) b = { ...b, name: body.name || b.name };
//             return b;
//           })
//         );
//       }
//     },
//     onError(error: unknown) {
//       if (error instanceof AxiosError) {
//         if (error.response?.status === 401) logout();
//         if (error.response?.status === 400) {
//           const dataError = error.response?.data as ErrorResponse_I;
//           if (dataError.toast.length) dataError.toast.forEach(toaster.create);
//           if (dataError.input.length) {
//             dataError.input.forEach(({ text, path }) =>
//               // @ts-expect-error
//               props?.setError?.(path, { message: text })
//             );
//           }
//         }
//       }
//     },
//   });
// }

export function useDeleteChatbotWA(props?: {
  onSuccess?: () => Promise<void>;
}) {
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
