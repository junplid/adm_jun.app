import { api } from "./index";

export async function getFbPixels(): Promise<
  {
    id: number;
    name: string;
    pixel_id: string;
    business: { id: number; name: string } | null;
  }[]
> {
  const { data } = await api.get("/private/fb-pixels");
  return data.fbPixels;
}

export async function getOptionsFbPixels(params: {
  businessId?: number;
}): Promise<{ id: number; name: string }[]> {
  const { data } = await api.get("/private/fb-pixels/options", { params });
  return data.fbPixels;
}

export async function createFbPixel(body: {
  name: string;
  pixel_id: string;
  access_token: string;
  status?: boolean;
  businessId?: number;
}): Promise<{
  id: number;
  createAt: Date;
  business: { id: number; name: string } | null;
}> {
  const { data } = await api.post("/private/fb-pixels", body);
  return data.fbPixel;
}

export async function testFbPixel(body: {
  pixel_id: string;
  access_token: string;
  test_event_code: string;
}): Promise<void> {
  await api.post("/private/fb-pixels/test", body);
}

export async function getFbPixel(id: number): Promise<{
  name: string;
  status: boolean;
  pixel_id: string;
  access_token: string;
  businessId: number | null;
}> {
  const { data } = await api.get(`/private/fb-pixels/${id}`);
  return data.fbPixel;
}

export async function updateFbPixel(
  id: number,
  params: {
    name?: string;
    pixel_id?: string;
    access_token?: string;
    status?: boolean;
    businessId?: number | null;
  }
): Promise<{
  business: { name: string; id: number } | null;
}> {
  const { data } = await api.put(`/private/fb-pixels/${id}`, undefined, {
    params,
  });
  return data.fbPixel;
}

export async function deleteFbPixel(id: number): Promise<void> {
  await api.delete(`/private/fb-pixels/${id}`);
}
