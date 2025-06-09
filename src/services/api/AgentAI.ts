import { api } from "./index";

export async function getAgentsAI(params: {}): Promise<
  {
    businesses: { id: number; name: string }[];
    id: number;
    name: string;
    createAt: Date;
  }[]
> {
  const { data } = await api.get("/private/agents-ai", { params });
  return data.agentsAI;
}

// export async function getOptionsConnectionsWA(params: {
//   type?: ConnectionWAType[];
//   name?: string;
//   businessIds?: number[];
// }): Promise<{ id: number; name: string }[]> {
//   const { data } = await api.get("/private/connections-wa/options", { params });
//   return data.connectionsWA;
// }

export async function createAgentAI(body: {
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
  instructions?: {
    prompt?: string;
    promptAfterReply?: string;
    files?: number[];
  }[];
}): Promise<{
  businesses: { id: number; name: string }[];
  id: number;
  createAt: Date;
}> {
  const { data } = await api.post("/private/agents-ai", body);
  return data.agentAI;
}

// export async function getConnectionWADetails(id: number): Promise<{
//   id: number;
//   name: string;
//   business: { name: string; id: number }[];
//   value: string | null;
//   type: ConnectionWAType;
// }> {
//   const { data } = await api.get(`/private/connections-wa/${id}/details`);
//   return data.connectionWA;
// }

export async function getAgentAI(id: number): Promise<{
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
  instructions?: {
    prompt?: string;
    promptAfterReply?: string;
    files?: number[];
  }[];
}> {
  const { data } = await api.get(`/private/agents-ai/${id}`);
  return data.agentAI;
}

// export async function updateConnectionWA(
//   id: number,
//   body: {
//     name?: string;
//     description?: string | null;
//     type?: ConnectionWAType;
//     businessId?: number;
//     profileName?: string | null;
//     profileStatus?: string | null;
//     lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none" | null;
//     onlinePrivacy?: "all" | "match_last_seen" | null;
//     imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none" | null;
//     statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none" | null;
//     groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist" | null;
//     readReceiptsPrivacy?: "all" | "none" | null;
//     fileImage?: File | null;
//   }
// ): Promise<{ business: { id: number; name: string }; fileImage?: string }> {
//   const formData = new FormData();
//   const { fileImage, ...rest } = body;
//   Object.entries(rest).forEach(([key, value]) => {
//     if (value !== undefined) {
//       formData.append(key, String(value));
//     }
//   });
//   if (fileImage) {
//     formData.append("fileImage", fileImage);
//   }

//   const { data } = await api.put(`/private/connections-wa/${id}`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data.connectionWA;
// }

export async function deleteAgentAI(id: number): Promise<void> {
  await api.delete(`/private/agents-ai/${id}`);
}
