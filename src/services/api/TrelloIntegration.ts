import { api } from "./index";

export async function getTrelloIntegrations(params: {}): Promise<
  {
    id: number;
    name: string;
    createAt: Date;
    updateAt: Date;
    status: boolean;
  }[]
> {
  const { data } = await api.get("/private/integration/trello", { params });
  return data.integrations;
}

export async function getBoardsTrelloIntegrationOptions(id: number): Promise<
  {
    id: string;
    name: string;
  }[]
> {
  const { data } = await api.get(
    `/private/integration/trello/${id}/boards/options`
  );
  return data.boards;
}

export async function getListsOnBoardTrelloIntegrationOptions(
  id: number,
  boardId: string
): Promise<
  {
    id: string;
    name: string;
  }[]
> {
  const { data } = await api.get(
    `/private/integration/trello/${id}/lists/${boardId}/options`
  );
  return data.lists;
}

export async function getOptionsTrelloIntegrations(params: {}): Promise<
  { name: string; status: boolean; id: number }[]
> {
  const { data } = await api.get("/private/integration/trello/options", {
    params,
  });
  return data.integrations;
}

export async function createTrelloIntegration(body: {
  name: string;
  status?: boolean;
  token: string;
  key: string;
}): Promise<{ id: number; createAt: Date }> {
  const { data } = await api.post("/private/integration/trello", body);
  return data.integration;
}

export async function getTrelloIntegration(id: number): Promise<{
  name: string;
  key: string;
  status: boolean;
}> {
  const { data } = await api.get(`/private/integration/trello/${id}`);
  return data.integration;
}

export async function updateTrelloIntegration(
  id: number,
  body: {
    name?: string;
    status?: boolean;
    token?: string;
    key?: string;
  }
): Promise<void> {
  await api.put(`/private/integration/trello/${id}`, body);
}

export async function deleteTrelloIntegration(id: number): Promise<void> {
  await api.delete(`/private/integration/trello/${id}`);
}
