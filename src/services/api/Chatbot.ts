import { api } from "./index";

export async function createChatbot(body: {
  name: string;
  businessId: number;
  flowId: string;
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
}): Promise<{
  id: number;
  status: boolean;
  business: { name: string; id: number };
  createAt: Date;
  destLink?: string;
}> {
  const { data } = await api.post("/private/chatbots", body);
  return data.chatbot;
}

export async function getChatbots(params: {
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    status: string;
    id: number;
    name: string;
    createAt: Date;
    Business: { id: number; name: string };
  }[]
> {
  const { data } = await api.get("/private/chatbots", {
    params: {
      ...params,
      ...(params.businessIds?.length && {
        businessIds: params.businessIds.join("-"),
      }),
    },
  });
  return data.chatbots;
}

export async function getOptionsChatbots(params: {
  // type?: ChatbotType[];
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    id: number;
    name: string;
    business: { name: string; id: number }[];
    value: string | null;
    // type: ChatbotType;
  }[]
> {
  const { data } = await api.get("/private/chatbots/options", { params });
  return data.chatbots;
}

export async function getChatbotDetails({ id }: { id: number }): Promise<{
  id: number;
  name: string;
  createAt: Date;
  updateAt: Date;
  description: string | null;
  status: boolean;
  business: { id: number; name: string };
  connection: { name: string; id: number; number: string | null };
  target?: string;
  linkAds?: string;
}> {
  const { data } = await api.get(`/private/chatbots/${id}/details`);
  return data.chatbot;
}

export async function getChatbot(id: number): Promise<{
  id: number;
  name: string;
  businessId: number;
  flowId: string;
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
}> {
  const { data } = await api.get(`/private/chatbots/${id}`);
  return data.chatbot;
}

export async function updateChatbot(
  id: number,
  params: {
    name?: string;
    value?: string | null;
    businessIds?: number[];
    type?: "dynamics" | "constant";
  }
): Promise<{
  business: { id: number; name: string };
  status: boolean;
}> {
  const { data } = await api.put(`/private/chatbots/${id}`, undefined, {
    params,
  });
  return data.chatbot;
}

export async function deleteChatbot(id: number): Promise<void> {
  await api.delete(`/private/chatbots/${id}`);
}
