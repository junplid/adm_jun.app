import { useQuery } from "@tanstack/react-query";
import * as AgentAIService from "../services/api/AgentTemplate";
import { toaster } from "@components/ui/toaster";
import { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";

export function useGetAgentTemplates(params: { limit?: number }) {
  const { logout } = useContext(AuthContext);
  return useQuery({
    queryKey: ["agent-templates"],
    queryFn: async () => {
      try {
        return await AgentAIService.getAgentTemplates(params);
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
