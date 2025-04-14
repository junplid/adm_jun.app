import { api } from "./index";

export type VariableType = "dynamics" | "constant" | "system";

export async function getVariables(params: {
  type?: VariableType;
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    id: number;
    name: string;
    business: { name: string; id: number }[];
    value: string | null;
    type: VariableType;
  }[]
> {
  const { data } = await api.get("/private/variables", {
    params: {
      ...params,
      ...(params.businessIds?.length && {
        businessIds: params.businessIds.join("-"),
      }),
    },
  });
  return data.variables;
}

export async function getOptionsVariables(params: {
  type?: VariableType[];
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    id: number;
    name: string;
    business: { name: string; id: number }[];
    value: string | null;
    type: VariableType;
  }[]
> {
  const { data } = await api.get("/private/variables/options", { params });
  return data.variables;
}

export async function createVariable(body: {
  name: string;
  value?: string;
  targetId?: number;
  businessIds?: number[];
  type: "dynamics" | "constant";
}): Promise<{
  id: number;
  targetId: number | undefined;
  business: { name: string; id: number }[];
  value: string | null;
}> {
  const { data } = await api.post("/private/variables", body);
  return data.variable;
}

export async function getVariableDetails(id: number): Promise<{
  id: number;
  name: string;
  business: { name: string; id: number }[];
  value: string | null;
  type: VariableType;
}> {
  const { data } = await api.get(`/private/variables/${id}/details`);
  return data.variable;
}

export async function getVariable(id: number): Promise<{
  id: number;
  name: string;
  businessIds: number[];
  value: string | null;
  type: "dynamics" | "constant";
}> {
  const { data } = await api.get(`/private/variables/${id}`);
  return data.variable;
}

export async function updateVariable(
  id: number,
  params: {
    name?: string;
    value?: string | null;
    businessIds?: number[];
    type?: "dynamics" | "constant";
  }
): Promise<void> {
  const { data } = await api.put(`/private/variables/${id}`, undefined, {
    params,
  });
  return data.variable;
}

export async function deleteVariable(id: number): Promise<void> {
  const { data } = await api.delete(`/private/variables/${id}`);
  return data.variable;
}
