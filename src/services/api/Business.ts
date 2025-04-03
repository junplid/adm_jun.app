import { api } from "./index";

export async function createBusiness(body: {
  name: string;
  accountId: number;
  description?: string;
}): Promise<{
  id: number;
  createAt: Date;
  updateAt: Date;
}> {
  const { data } = await api.post("/private/businesses", body);
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

export async function deleteBusiness(id: number): Promise<void> {
  await api.delete(`/private/business/${id}`);
}
