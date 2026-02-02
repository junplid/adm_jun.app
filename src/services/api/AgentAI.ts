import { api } from "./index";

export type TypeServiceTierAgentAI =
  | "default"
  | "flex"
  | "auto"
  | "scale"
  | "priority";

export async function getAgentsAI(params: {}): Promise<
  {
    businesses: { id: number; name: string }[];
    id: number;
    name: string;
    createAt: Date;
    connectionWAId: number | null;
    status: "open" | "close" | "sync";
  }[]
> {
  const { data } = await api.get("/private/agents-ai", { params });
  return data.agentsAI;
}

export async function getOptionsAgentAI(params: {
  name?: string;
  businessIds?: number[];
}): Promise<{ id: number; name: string; exitNodes: string[] }[]> {
  const { data } = await api.get("/private/agents-ai/options", { params });
  return data.agentsAI;
}

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
  instructions?: string;
  timeout?: number;
  debounce?: number;
  service_tier?: TypeServiceTierAgentAI;
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
  files?: {
    id: number;
    originalName: string;
    fileName: string;
    mimetype: string | null;
  }[];
  instructions?: string;
  timeout?: number;
  debounce?: number;
  connectionWAId?: number;
  chatbotId?: number;
}> {
  const { data } = await api.get(`/private/agents-ai/${id}`);
  return data.agentAI;
}

export async function updateAgentAI(
  id: number,
  body: {
    providerCredentialId?: number;
    apiKey?: string;
    nameProvider?: string;
    businessIds?: number[];
    name?: string;
    emojiLevel?: "none" | "low" | "medium" | "high";
    language?: string;
    personality?: string;
    model?: string;
    temperature?: number;
    knowledgeBase?: string;
    files?: number[];
    instructions?: string;
    timeout?: number;
    debounce?: number;
    service_tier?: TypeServiceTierAgentAI;
  },
): Promise<{ businesses: { id: number; name: string }[]; createAt: Date }> {
  const { data } = await api.put(`/private/agents-ai/${id}`, body);
  return data.agentAI;
}

export async function deleteAgentAI(id: number): Promise<void> {
  await api.delete(`/private/agents-ai/${id}`);
}
