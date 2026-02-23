import { api } from "./index";

export async function getAgentTemplates(params: { limit?: number }): Promise<
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
  const { data } = await api.get("/private/template-agents", { params });
  return data.templates;
}

export async function getAgentTemplate(
  id: number,
  fields?: string,
): Promise<any> {
  const { data } = await api.get(`/private/template-agents/${id}`, {
    params: { fields },
  });
  return data.template;
}

export async function testAgentTemplate(body: {
  content: string; // mensagem
  providerCredentialId?: number;
  apiKey?: string;
  token_modal_template: string;
  templatedId: number;
  fields: Record<string, Record<string, number | string | number[] | string[]>>;
}): Promise<any> {
  await api.post(`/private/agent-template/test`, body);
}
