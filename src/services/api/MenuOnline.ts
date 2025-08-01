import { api } from "./index";

export async function createMenuOnline(body: {
  identifier: string;
  desc?: string;
  img: File;
}): Promise<{
  id: number;
  createAt: Date;
  uuid: string;
}> {
  const formData = new FormData();
  const { img, ...rest } = body;
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  formData.append("fileImage", img);

  const { data } = await api.post("/private/menus-online", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.menu;
}

export async function createMenuOnlineItem(
  menuUuid: string,
  body: {
    name: string;
    category: "pizzas" | "drinks";
    desc?: string;
    beforePrice?: number;
    afterPrice?: number;
    img: File;
    qnt?: number;
  }
): Promise<{
  id: number;
  createAt: Date;
  uuid: string;
}> {
  const formData = new FormData();
  const { img, ...rest } = body;
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  formData.append("fileImage", img);

  const { data } = await api.post(
    `/private/menus-online/${menuUuid}/items`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data.item;
}

export async function createMenuOnlineSizePizza(
  menuUuid: string,
  body: { name: string; price: number; flavors: number; slices?: number }
): Promise<{ id: number; createAt: Date }> {
  const { data } = await api.post(
    `/private/menus-online/${menuUuid}/sizes-pizza`,
    body
  );

  return data.size;
}

export async function updateMenuOnline(
  id: number,
  body: {
    name?: string;
    description?: string | null;
  }
): Promise<{
  updateAt: Date;
}> {
  const { data } = await api.put(`/private/menus-online/${id}`, undefined, {
    params: body,
  });
  return data.menu;
}

export async function getMenuOnlineDetails(id: number): Promise<{
  name: string;
  updateAt: Date;
  createAt: Date;
  id: number;
  description: string | null;
}> {
  const { data } = await api.get(`/private/menus-online/${id}/details`);
  return data.menu;
}

export async function getMenuOnline(params: { uuid: string }): Promise<{
  id: number;
  uuid: string;
  identifier: string;
  desc: string | null;
}> {
  const { data } = await api.get(`/private/menus-online/${params.uuid}`);
  return data.menu;
}

export async function getMenusOnline(params?: {
  name?: string;
  page?: number;
}): Promise<
  {
    id: number;
    uuid: string;
    identifier: string;
  }[]
> {
  const { data } = await api.get("/private/menus-online", { params });
  return data.menus;
}

export async function getMenuOnlineItems(params: { uuid: string }): Promise<
  {
    uuid: string;
    id: number;
    name: string;
    desc: string | null;
    category: "pizzas" | "drinks";
    qnt: number;
    beforePrice: number | null;
    afterPrice: number;
  }[]
> {
  const { data } = await api.get(`/private/menus-online/${params.uuid}/items`);
  return data.items;
}

export async function getOptionsMenusOnline({
  filterIds,
  ...params
}: {
  name?: string;
  filterIds?: number[];
}): Promise<{ name: string; id: number }[]> {
  const { data } = await api.get("/private/menus-online/options", {
    params: { ...params, filterIds: filterIds?.join("-") },
  });
  return data.menus;
}

export async function deleteMenuOnline(params: {
  uuid: string;
}): Promise<void> {
  await api.delete(`/private/menus-online/${params.uuid}`);
}

export async function deleteMenuOnlineItem(params: {
  uuid: string;
}): Promise<void> {
  await api.delete(`/private/menus-online/item/${params.uuid}`);
}
