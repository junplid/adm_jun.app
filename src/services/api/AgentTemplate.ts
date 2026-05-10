import { api } from "./index";

export async function getTemplates(params: { limit?: number }): Promise<
  {
    id: number;
    title: string;
    card_desc: string;
    chat_demo: (
      | { type: "lead" | "ia"; value: string }
      | { type: "sleep"; sleep: number }
    )[];
    created_by: string;
  }[]
> {
  const { data } = await api.get("/private/templates", { params });
  return data.templates;
}

export async function getTemplate(id: number, fields?: string): Promise<any> {
  const { data } = await api.get(`/private/templates/${id}`, {
    params: { fields },
  });
  return data.template;
}

export async function testTemplate(body: {
  content: string; // mensagem
  providerCredentialId?: number;
  apiKey?: string;
  token_modal_chat_template: string;
  templatedId: number;
  fields: Record<string, Record<string, number | string | number[] | string[]>>;
}): Promise<any> {
  await api.post(`/private/templates/test`, body);
}

export async function createTemplate(body: {
  providerCredentialId?: number;
  apiKey?: string;
  nameProvider?: string;
  modalHash: string;
  templatedId: number;
  fields: Record<string, Record<string, number | string | number[] | string[]>>;
}): Promise<any> {
  await api.post(`/private/templates`, body);
}
