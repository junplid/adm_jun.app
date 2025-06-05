import { api } from "./index";

export async function createStorageFile(body: {
  file: File;
  businessIds?: number[] | undefined;
}): Promise<{
  id: string;
  originalName: string;
  size: string | null;
  mimetype: string | null;
  createAt: Date;
  businesses: { name: string; id: number }[];
  createdAt: Date;
  fileName: string;
}> {
  const formData = new FormData();
  formData.append("file", body.file);
  if (body.businessIds) {
    formData.append("businessIds", JSON.stringify(body.businessIds));
  }

  const { data } = await api.post("/private/storage-files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.file;
}

export async function updateStorageFile(
  id: number,
  params: { originalName?: string; businessIds?: number[] }
): Promise<{
  businesses: { id: number; name: string }[];
}> {
  const { data } = await api.put(`/private/storage-files/${id}`, undefined, {
    params,
  });
  return data.file;
}

export async function getStorageFile(id: number): Promise<{
  businessIds: number[];
  originalName: string;
}> {
  const { data } = await api.get(`/private/storage-files/${id}`);
  return data.file;
}

export async function getStorageFiles(params?: {
  name?: string;
  page?: number;
}): Promise<
  {
    businesses: { id: number; name: string }[];
    size: string | null;
    id: number;
    name: string | null;
    originalName: string;
    mimetype: string | null;
  }[]
> {
  const { data } = await api.get("/private/storage-files", { params });
  return data.files;
}

export async function getOptionsStorageFiles(params?: {
  name?: string;
  businessIds?: number[];
  mimetype?: string;
}): Promise<
  {
    id: number;
    businessIds: number[];
    originalName: string;
    mimetype: string | null;
  }[]
> {
  const { data } = await api.get("/private/storage-files/options", { params });
  return data.files;
}

export async function deleteStorageFile(id: string): Promise<void> {
  await api.delete(`/private/storage-files/${id}`);
}
