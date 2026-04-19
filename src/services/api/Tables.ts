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

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";

export async function getTables(params?: {
  limit?: number;
  status?: TableStatus[];
  name?: string;
}): Promise<{
  menuUuid: string;
  tables: {
    order: {
      items: {
        price: number | undefined;
        title: string;
        obs: string | null;
        side_dishes: string | null;
        ItemOfOrderId: number;
      }[];
      adjustments: {
        amount: number;
        type: "in" | "out";
        label: string;
      }[];
    } | null;
    name: string;
    id: number;
    status: TableStatus;
    createAt: Date;
  }[];
}> {
  const { data } = await api.get("/private/tables", { params });
  return data.data;
}

export async function createTable(
  name: string,
): Promise<{ createAt: Date; id: number }> {
  const { data } = await api.post(`/private/tables`, { name });
  return data.table;
}

export async function createTableItems(
  tableId: number,
  items: {
    qnt: number;
    obs?: string;
    uuid: string;
    sections?: Record<string, Record<string, number>>;
  }[],
): Promise<{
  items: {
    title: string;
    obs: string | undefined;
    price: number;
    side_dishes: string;
    ItemOfOrderId: number;
  }[];
  adjustments: {
    amount: number;
    label: string;
    type: "in" | "out";
  }[];
  id: number;
}> {
  const { data } = await api.post(`/private/tables/${tableId}/item`, { items });
  return data.table;
}

export async function deleteTableItem(
  tableId: number,
  ItemOfOrderId: number,
): Promise<void> {
  await api.delete(`/private/tables/${tableId}/item/${ItemOfOrderId}`);
}

export async function updateOrder(
  id: number,
  body: {
    name?: string;
    description?: string | null;
  },
): Promise<{}> {
  const { data } = await api.put(`/private/orders/${id}`, undefined, {
    params: body,
  });
  return { orders: data.orders, meta: data.meta };
}

export async function printTableOrder(tableId: number): Promise<void> {
  await api.post(`/private/tables/${tableId}/print-order`);
}

export async function runActionOrder(
  id: number,
  action: string,
): Promise<void> {
  await api.post(`/private/orders/action/${id}/${action}`);
}

export async function getRouterOrders(
  code: string,
  params: { nlid: string },
): Promise<{
  router_link?: string;
  status: "open" | "awaiting_assignment" | "in_progress" | "finished";
  menu: {
    logoImg: string;
    titlePage: string | null;
    MenuInfo: {
      lat: number | null;
      lng: number | null;
    } | null;
  };
  orders: {
    router_link: string | undefined;
    completedAt: Date | null;
    contact:
      | {
          name: string | null;
          number: string | null;
        }
      | undefined;
    status:
      | "draft"
      | "pending"
      | "processing"
      | "confirmed"
      | "completed"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "returned"
      | "refunded"
      | "failed"
      | "on_way"
      | "ready";
    name: string | null;
    n_order: string;
    delivery_lat: number | null;
    delivery_lng: number | null;
    delivery_address: string | null;
    delivery_complement: string | null;
    delivery_reference_point: string | null;
    delivery_cep: string | null;
    delivery_number: string | null;
    data: string;
    total: number | undefined;
    payment_change_to: number | null;
    payment_method: string | null;
    charge_status:
      | (
          | "pending"
          | "cancelled"
          | "refunded"
          | "created"
          | "approved"
          | "authorized"
          | "in_process"
          | "in_mediation"
          | "rejected"
          | "charged_back"
          | "refused"
        )
      | undefined;
  }[];
}> {
  const { data } = await api.get(`/public/router-orders/${code}`, { params });
  return data.router;
}

export async function joinRouterOrders(
  code: string,
  params: { nlid: string; fsid: number },
): Promise<{
  router_link: string;
  status: "open" | "awaiting_assignment" | "in_progress" | "finished";
}> {
  const { data } = await api.post(
    `/public/router-orders/${code}/join`,
    undefined,
    { params },
  );
  return data.router;
}

export async function collectRouteOrder(
  code: string,
  n_order: string,
  params: { nlid: string },
): Promise<{
  status: TypeStatusOrder;
}> {
  const { data } = await api.post(
    `/public/router-orders/${code}/collect/${n_order}`,
    undefined,
    { params },
  );
  return data.router;
}

export async function deliveryCodeRouteOrder(
  code: string,
  delivery_code: string,
  params: { nlid: string },
): Promise<{
  status: TypeStatusOrder;
  n_order: string;
}> {
  const { data } = await api.post(
    `/public/router-orders/${code}/delivery-code/${delivery_code}`,
    undefined,
    { params },
  );
  return data.order;
}

export async function completeRouter(
  code: string,
  params: { nlid: string },
): Promise<{
  status: "open" | "awaiting_assignment" | "in_progress" | "finished";
}> {
  const { data } = await api.post(
    `/public/router-orders/${code}/complete`,
    undefined,
    { params },
  );
  return data.router;
}
