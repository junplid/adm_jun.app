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
    desc?: string;
    fileNameImage: string;
    qnt?: number;
    beforePrice?: number;
    afterPrice?: number;
    categoriesUuid?: string[];
    sections?: {
      title?: string;
      helpText?: string;
      required?: boolean;
      minOptions?: number;
      maxOptions?: number;
      subItems: {
        image55x55png?: string;
        name: string;
        desc?: string;
        before_additional_price?: number;
        after_additional_price?: number;
      }[];
    }[];
  },
): Promise<{
  id: number;
  uuid: string;
  view: boolean;
  stateWarn: string[];
  categories: {
    days_in_the_week_label: string;
    id: number;
    name: string;
    image45x45png: string;
  }[];
}> {
  const { data } = await api.post(
    `/private/menus-online/${menuUuid}/items`,
    body,
  );

  return data.item;
}

export async function updateMenuOnlineSubItemsStatus(
  menuUuid: string,
  body: {
    subItemsUuid: string[];
    action: "true" | "false";
  },
): Promise<void> {
  await api.put(`/private/menus-online/${menuUuid}/subItems/status`, body);
}

export async function createMenuOnlineReport(
  menuUuid: string,
  body: {
    start: Date | null;
    end: Date | null;
  },
): Promise<void> {
  const response = await api.post(
    `/private/menus-online/${menuUuid}/report`,
    body,
    {
      responseType: "blob",
    },
  );

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  // opcional: pegar nome do header
  const disposition = response.headers["content-disposition"];
  let filename = "relatorio.pdf";

  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, "");
    }
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function updateMenuOnlineItem(
  menuUuid: string,
  uuid: string,
  body: {
    name?: string;
    desc?: string;
    fileNameImage?: string;
    qnt?: number;
    beforePrice?: number;
    afterPrice?: number;
    categoriesUuid?: string[];
    sections?: {
      title?: string;
      helpText?: string;
      required?: boolean;
      minOptions?: number;
      maxOptions?: number;
      subItems: {
        image55x55png?: string;
        name: string;
        desc?: string;
        before_additional_price?: number;
        after_additional_price?: number;
      }[];
    }[];
  },
): Promise<{
  categories: {
    days_in_the_week_label: string;
    name: string;
    id: number;
    image45x45png: string;
  }[];
  view: boolean;
  stateWarn: string[];
  beforePrice: string | null;
  afterPrice: string | null;
  uuid: string;
  id: number;
}> {
  const { data } = await api.put(
    `/private/menus-online/${menuUuid}/items/${uuid}`,
    body,
  );

  return data.item;
}

export async function createMenuOnlineCategory(
  menuUuid: string,
  body: {
    name: string;
    fileImage: File;
    startAt?: string;
    endAt?: string;
    days_in_the_week?: number[];
  },
): Promise<{
  image45x45png: string;
  id: number;
  uuid: string;
  days_in_the_week_label: string;
}> {
  const formData = new FormData();
  const { fileImage, ...rest } = body;
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  formData.append("fileImage", fileImage);

  const { data } = await api.post(
    `/private/menus-online/${menuUuid}/categories`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data.category;
}

export async function updateMenuOnlineCategory(
  menuUuid: string,
  catUuid: string,
  body: {
    name?: string;
    fileImage?: File;
    startAt?: string;
    endAt?: string;
    days_in_the_week?: number[];
  },
): Promise<{ image45x45png?: string; days_in_the_week_label: string }> {
  const formData = new FormData();
  const { fileImage, days_in_the_week, ...rest } = body;
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  if (days_in_the_week) {
    formData.append("days_in_the_week", JSON.stringify(days_in_the_week));
  }
  if (fileImage) {
    formData.append("fileImage", fileImage);
  }

  const { data } = await api.put(
    `/private/menus-online/${menuUuid}/categories/${catUuid}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data.category;
}

export async function updateMenuOnlineCategorySequence(
  menuUuid: string,
  body: {
    items: string[];
  },
): Promise<void> {
  await api.put(`/private/menus-online/${menuUuid}/categories/sequence`, body);
}

export async function updateMenuOnline(
  id: number,
  body: {
    identifier: string;
    titlePage: string | null;
    desc: string | null;
    bg_primary: string | null;
    bg_secondary: string | null;
    bg_tertiary: string | null;
    bg_capa: string | null;
    connectionWAId: number;
    img?: File | undefined;
  },
): Promise<{
  logoImg?: string;
  uuid: string;
}> {
  const formData = new FormData();
  const { img, ...rest } = body;
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  if (img) formData.append("fileImage", img);

  const { data } = await api.put(`/private/menus-online/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.menu;
}

export async function updateMenuOnlineInfo(
  uuid: string,
  body: {
    payment_methods: (
      | "Dinheiro"
      | "Pix"
      | "Cartao_Credito"
      | "Cartao_Debito"
    )[];
    delivery_fee?: number | null | undefined;
    address?: string | null | undefined;
    state_uf?: string | null | undefined;
    city?: string | null | undefined;
    lat?: number | null | undefined;
    lng?: number | null | undefined;
    phone_contact?: string | null | undefined;
    whatsapp_contact?: string | null | undefined;
  },
): Promise<void> {
  await api.put(`/private/menus-online/${uuid}/info`, body);
}

export async function pairMenuOnlineCodeDevice(
  uuid: string,
  body: {
    code: string;
  },
): Promise<void> {
  await api.post(`/private/menus-online/${uuid}/pair-code-device`, undefined, {
    params: body,
  });
}

export async function unpairMenuOnlineCodeDevice(uuid: string): Promise<void> {
  await api.post(`/private/menus-online/${uuid}/unpair-code-device`);
}

export async function updateMenuOnlineOperatingDays(
  uuid: string,
  body: {
    days: {
      dayOfWeek: number;
      startHourAt: string;
      endHourAt: string;
    }[];
  },
): Promise<void> {
  await api.put(`/private/menus-online/${uuid}/operating-days`, body);
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
  logoImg: string;
  desc?: string;
  bg_primary?: string;
  bg_secondary?: string;
  bg_tertiary?: string;
  label1?: string;
  label?: string;
  titlePage?: string;
  bg_capa: string | null;
  connectionWAId: number;
  statusMenu: boolean;
  statusNow: boolean;
  helperTextOpening: string;
  status_device: boolean;
  operatingDays: {
    dayOfWeek: number;
    startHourAt: string;
    endHourAt: string;
  }[];
  info: {
    address: string | null;
    state_uf: string | null;
    city: string | null;
    phone_contact: string | null;
    whatsapp_contact: string | null;
    delivery_fee?: number | null;
    payment_methods: (
      | "Dinheiro"
      | "Pix"
      | "Cartao_Credito"
      | "Cartao_Debito"
    )[];
  } | null;
}> {
  const { data } = await api.get(`/private/menus-online/${params.uuid}`);
  return data.menu;
}

export async function updateMenuOnlineStatus(
  uuid: string,
  body: {
    status: boolean;
  },
): Promise<void> {
  await api.put(`/private/menus-online/${uuid}/status`, body);
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

export async function getMenuOnlineItem(params: {
  uuid: string;
  itemUuid: string;
}): Promise<{
  categoriesUuid: string[];
  sections: {
    subItems: {
      uuid: string;
      name: string;
      desc: string | null;
      previewImage: string | null;
      before_additional_price: string | null;
      after_additional_price: string | null;
      status: boolean | null;
    }[];
    uuid: string;
    title: string;
    helpText: string | null;
    required: boolean;
    minOptions: number;
    maxOptions: number | null;
  }[];
  name: string;
  desc: string | null;
  qnt: number;
  beforePrice: string | null;
  afterPrice: string | null;
  fileNameImage: string;
  date_validity: Date | null;
  send_to_category_uuid: string | null;
} | null> {
  const { data } = await api.get(
    `/private/menus-online/${params.uuid}/items/${params.itemUuid}`,
  );
  return data.item;
}

export async function getMenuOnlineSectionsOfItem(params: {
  uuid: string;
  itemUuid: string;
}): Promise<
  {
    uuid: string;
    title?: string;
    helpText?: string;
    required: boolean;
    minOptions: number;
    maxOptions?: number;
    subItems: {
      uuid: string;
      name: string;
      desc: string | null;
      previewImage: string | null;
      maxLength: number;
      before_additional_price: string | null;
      after_additional_price: string | null;
    }[];
  }[]
> {
  const { data } = await api.get(
    `/private/menus-online/${params.uuid}/sections-of/${params.itemUuid}`,
  );
  return data.sections;
}

export async function getMenuOnlineItems(params: { uuid: string }): Promise<
  {
    categories: {
      days_in_the_week_label: string;
      id: number;
      name: string;
      image45x45png: string;
    }[];
    uuid: string;
    id: number;
    name: string;
    desc: string | null;
    img: string;
    view: boolean;
    stateWarn: string[];
    qnt: number;
    beforePrice: string | null;
    afterPrice: string | null;
  }[]
> {
  const { data } = await api.get(`/private/menus-online/${params.uuid}/items`);
  return data.items;
}

export async function getMenuOnlineCategories(params: {
  uuid: string;
}): Promise<
  {
    id: number;
    uuid: string;
    name: string;
    image45x45png: string;
    items: number;
    days_in_the_week_label: string;
  }[]
> {
  const { data } = await api.get(
    `/private/menus-online/${params.uuid}/categories`,
  );
  return data.categories;
}

export async function getOptionsMenuOnlineCategories(params: {
  uuid: string;
}): Promise<
  {
    days_in_the_week_label: string;
    id: number;
    uuid: string;
    name: string;
    image45x45png: string;
  }[]
> {
  const { data } = await api.get(
    `/private/menus-online/${params.uuid}/categories/options`,
  );
  return data.categories;
}

export async function getOptionsMenuOnlineSubItems(params: {
  uuid: string;
}): Promise<
  {
    name: string;
    uuids: string[];
  }[]
> {
  const { data } = await api.get(
    `/private/menus-online/${params.uuid}/subitems/options`,
  );
  return data.subitems;
}

export async function getOptionsMenuOnlineItems(params: {
  uuid: string;
}): Promise<
  {
    uuid: string;
    id: number;
    name: string;
    img: string;
  }[]
> {
  const { data } = await api.get(
    `/private/menus-online/${params.uuid}/items/options`,
  );
  return data.items;
}

export async function getMenuOnlineCategory(params: {
  uuid: string;
  catUuid: string;
}): Promise<{
  name: string;
  image45x45png: string;
  startAt: Date | null;
  endAt: Date | null;
  days_in_the_week: number[];
}> {
  const { data } = await api.get(
    `/private/menus-online/${params.uuid}/categories/${params.catUuid}`,
  );
  return data.category;
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

export async function deleteMenuOnlineCategory(params: {
  uuid: string;
  catUuid: string;
}): Promise<void> {
  await api.delete(
    `/private/menus-online/${params.uuid}/categories/${params.catUuid}`,
  );
}

export async function deleteMenuOnlineItem(params: {
  uuid: string;
}): Promise<void> {
  await api.delete(`/private/menus-online/item/${params.uuid}`);
}
