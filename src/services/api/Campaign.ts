import { TypeConnectionWA } from "../../pages/connectionswa";
import { api } from "./index";

export type TypeStatusCampaign =
  | "processing"
  | "paused"
  | "running"
  | "finished"
  | "stopped";

export async function createCampaign(body: {
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
}): Promise<{
  id: number;
  status: TypeStatusCampaign;
  createAt: Date;
  totalFlows: number;
  businesses: { id: number; name: string }[];
}> {
  const { data } = await api.post("/private/campaigns", body);
  return data.campaign;
}

export async function updateCampaign(
  id: number,
  body: {
    name?: string;
    description?: string | null;
  }
): Promise<void> {
  await api.put(`/private/campaigns/${id}`, body);
}

export async function getCampaignDetails(id: number): Promise<{
  id: number;
  name: string;
  createAt: Date;
  updateAt: Date;
  description: string | null;
  status: TypeStatusCampaign;
  connections: {
    number: string | null;
    name: string;
    id: number;
    type: TypeConnectionWA;
    countShots: number;
  }[];
  businesses: { id: number; name: string }[];
}> {
  const { data } = await api.get(`/private/campaigns/${id}/details`);
  return data.campaign;
}

export async function getCampaign(id: number): Promise<{
  name: string;
  flowId: string;
  tagsIds: number[];
  businesses: number[];
  connections: number[];
  shootingSpeedId: number;
  description: string | null;
  timeItWillStart: string | null;
  operatingDays: {
    dayOfWeek: number;
    workingTimes: { start: string; end: string }[];
  }[];
}> {
  const { data } = await api.get(`/private/campaigns/${id}`);
  return data.campaign;
}

export async function getCampaigns(_params?: {
  name?: string;
  page?: number;
}): Promise<
  {
    businesses: { id: number; name: string }[];
    finishCount: number;
    sentCount: number;
    totalFlows: number;
    name: string;
    id: number;
    status: TypeStatusCampaign;
    createAt: Date;
  }[]
> {
  const { data } = await api.get("/private/campaigns");
  return data.campaigns;
}

export async function getOptionsCampaigns({
  filterIds,
  ...params
}: {
  name?: string;
  filterIds?: number[];
}): Promise<{ name: string; id: number }[]> {
  const { data } = await api.get("/private/campaigns/options", {
    params: { ...params, filterIds: filterIds?.join("-") },
  });
  return data.campaigns;
}

export async function deleteCampaign(id: number): Promise<void> {
  await api.delete(`/private/campaigns/${id}`);
}
