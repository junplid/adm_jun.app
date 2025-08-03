import { api } from "./index";

export type TypeStatusOrder =
  | "draft"
  | "pending"
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded"
  | "failed"
  | "on_way"
  | "completed"
  | "ready";

export type TypePriorityOrder =
  | "low"
  | "medium"
  | "high"
  | "urgent"
  | "critical";

export async function updateOrder(
  id: number,
  body: {
    name?: string;
    description?: string | null;
  }
): Promise<{}> {
  const { data } = await api.put(`/private/orders/${id}`, undefined, {
    params: body,
  });
  return { orders: data.orders, meta: data.meta };
}

export async function runActionOrder(
  id: number,
  action: string
): Promise<void> {
  await api.post(`/private/orders/action/${id}/${action}`);
}

export async function getOrders(params?: {
  limit?: number;
  status?: TypeStatusOrder[];
  menu?: string;
}): Promise<{
  orders: {
    [x: string]: any;
  };
}> {
  const { data } = await api.get("/private/orders", { params });
  return { orders: data.orders };
}
