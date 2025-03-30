import { api } from "./index";

export interface Variable {
  id: number;
  name: string;
  business: { name: string; id: number }[];
  value: string | null;
  type: "dynamics" | "constant" | "system";
}

export async function getVariables(params: {
  type?: "dynamics" | "constant" | "system";
  name?: string;
  businessIds?: number[];
}): Promise<Variable[]> {
  const { data } = await api.get("/private/variable", {
    params: {
      ...params,
      ...(params.businessIds?.length && {
        businessIds: params.businessIds.join("-"),
      }),
    },
  });
  return data.variables;
}

export async function createVariable(body: {
  name: string;
  value?: string;
  targetId?: number;
  businessIds: number[];
  type: "dynamics" | "constant";
}): Promise<{
  id: number;
  business: string;
  value: string | null;
  targetId: number | undefined;
}> {
  const { data } = await api.post("/private/variable", body);
  return data.variables;
}
