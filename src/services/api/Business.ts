import { api } from "./index";

export async function createBusiness(body: {
  name: string;
  description?: string;
}): Promise<{
  id: number;
  createAt: Date;
  updateAt: Date;
}> {
  const { data } = await api.post("/private/businesses", body);
  return data.business;
}

export async function updateBusiness(
  id: number,
  body: {
    name?: string;
    description?: string | null;
  }
): Promise<{
  updateAt: Date;
}> {
  const { data } = await api.put(`/private/businesses/${id}`, undefined, {
    params: body,
  });
  return data.business;
}

export async function getBusinessDetails(id: number): Promise<{
  name: string;
  updateAt: Date;
  createAt: Date;
  id: number;
  description: string | null;
}> {
  const { data } = await api.get(`/private/businesses/${id}/details`);
  return data.business;
}

export async function getBusiness(id: number): Promise<{
  name: string;
  description: string | null;
}> {
  const { data } = await api.get(`/private/businesses/${id}`);
  return data.business;
}

export async function getBusinesses(params?: {
  name?: string;
  page?: number;
}): Promise<
  {
    name: string;
    id: number;
    createAt: Date;
    updateAt: Date;
  }[]
> {
  const { data } = await api.get("/private/businesses", { params });
  return data.businesses;
}

export async function getOptionsBusinesses({
  filterIds,
  ...params
}: {
  name?: string;
  filterIds?: number[];
}): Promise<{ name: string; id: number }[]> {
  const { data } = await api.get("/private/businesses/options", {
    params: { ...params, filterIds: filterIds?.join("-") },
  });
  return data.businesses;
}

export async function deleteBusiness(id: number): Promise<void> {
  await api.delete(`/private/business/${id}`);
}
