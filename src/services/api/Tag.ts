import { api } from "./index";

export type TagType = "contactwa" | "audience";

export async function getTags(params: {
  type?: TagType;
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    id: number;
    name: string;
    business: { name: string; id: number }[];
    type: TagType;
  }[]
> {
  const { data } = await api.get("/private/tags", { params });
  return data.tags;
}

export async function getOptionsTags(params: {
  type?: TagType[];
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    id: number;
    name: string;
    business: { name: string; id: number }[];
    type: TagType;
  }[]
> {
  const { data } = await api.get("/private/tags/options", { params });
  return data.tags;
}

export async function createTag(body: {
  name: string;
  type: TagType;
  targetId?: number;
  businessIds?: number[];
}): Promise<{
  id: number;
  targetId: number | undefined;
  businesses: { name: string; id: number }[];
}> {
  const { data } = await api.post("/private/tags", body);
  return data.tag;
}

export async function getTagDetails(id: number): Promise<{
  id: number;
  name: string;
  business: { name: string; id: number }[];
  type: TagType;
}> {
  const { data } = await api.get(`/private/tags/${id}/details`);
  return data.tag;
}

export async function getTag(id: number): Promise<{
  id: number;
  name: string;
  businessIds: number[];
  type: TagType;
}> {
  const { data } = await api.get(`/private/tags/${id}`);
  return data.tag;
}

export async function updateTag(
  id: number,
  params: {
    name?: string;
    businessIds?: number[];
    type?: TagType;
  }
): Promise<void> {
  const { data } = await api.put(`/private/tags/${id}`, undefined, {
    params,
  });
  return data.tag;
}

export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/private/tags/${id}`);
}
