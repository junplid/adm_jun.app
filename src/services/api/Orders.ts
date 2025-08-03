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
  | "on_way";

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
  page?: number;
  limit?: number;
  status?: TypeStatusOrder;
  priority?: TypePriorityOrder;
  menu?: string;
}): Promise<{
  orders: {
    status: TypeStatusOrder;
    priority: TypePriorityOrder | null;
    id: number;
    n_order: string;
    name: string | null;
    payment_method: string | null;
    delivery_address: string | null;
    data: string | null;
    total: string | null;
    createAt: Date;
    actionChannels: string[];
    contact: string | undefined;
  }[];
  meta: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
    nextPage: number | null;
  };
}> {
  const { data } = await api.get("/private/orders", { params });
  return { orders: data.orders, meta: data.meta };
}
