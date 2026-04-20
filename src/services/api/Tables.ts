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

export async function printTableOrder(tableId: number): Promise<void> {
  await api.post(`/private/tables/${tableId}/print-order`);
}

export async function closeTable(
  tableId: number,
  payment_method: string,
): Promise<void> {
  await api.post(`/private/tables/${tableId}/close/${payment_method}`);
}

export async function deleteTable(tableId: number): Promise<void> {
  await api.delete(`/private/tables/${tableId}`);
}
