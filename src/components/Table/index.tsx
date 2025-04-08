import { useMemo, JSX } from "react";
import { ViewBottomTableComponent } from "./ViewBottom";
import "./styles.css";
import { nanoid } from "nanoid";
import { Spinner } from "@chakra-ui/react";

export interface Column {
  name: string;
  key: string | number;
  styles?: { width?: number };
  render?: (row: Rows) => JSX.Element | string;
}

type Rows = { [x: string]: string | number | any };

interface Props {
  columns: Column[];
  rows: Rows[];
  textEmpity?: string;
  load: boolean;
}

interface RowColumnOrdened {
  id: number;
  columns: ({
    key: string;
    value: string | JSX.Element;
  } | null)[];
}

export const TableComponent = (props: Props): JSX.Element => {
  const rows: RowColumnOrdened[] = useMemo(() => {
    return props.rows.map((row) => {
      const columns = props.columns.map((column) => {
        let objRow: {
          key: string;
          value: JSX.Element | string;
        } | null = null;

        for (const rowObj of Object.entries(row)) {
          const [key, value] = rowObj;
          if (column.render) {
            return (objRow = {
              key: nanoid(),
              value: column.render(row),
            });
          }
          if (key === column.key) return (objRow = { key, value });
        }
        return objRow;
      });
      return { id: row.id, columns: columns.filter((s) => s) };
    });
  }, [props.columns, props.rows]);

  return (
    <div className="scroll-custom-table overflow-hidden overflow-y-scroll">
      <table className="min-w-full table-auto">
        <thead
          style={{ height: 50 }}
          className="head-table bg-[#f5f5f5] dark:bg-[#141314] sticky top-0"
        >
          <tr>
            {props.columns.map((column) => (
              <th
                key={column.key}
                align="left"
                className="select-none font-semibold px-4 py-2 text-sm"
                style={{ width: column.styles?.width }}
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!!rows.length &&
            rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  style={{ height: 45 }}
                  className="dark:odd:bg-[#55555507] dark:even:bg-[#6b6b6b0a] dark:hover:bg-[#9292920a] odd:bg-[#f5f5f569] even:bg-[#e0e0e04d] hover:bg-[#ffffff]"
                >
                  {row.columns.map((column) => {
                    if (column !== null) {
                      return (
                        <td
                          key={row.id + column.key}
                          aria-details=""
                          className="cursor-default px-4 py-2"
                          style={{ fontSize: 13 }}
                        >
                          {column.value === typeof "string" ? (
                            <span className="line-clamp-1">{column.value}</span>
                          ) : (
                            column.value
                          )}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          {!!rows.length && <ViewBottomTableComponent />}
          {!rows.length && props.textEmpity && !props.load && (
            <tr>
              <td
                colSpan={props.columns.length}
                align="center"
                className="cursor-default px-4 py-2 text-sm dark:text-white/30 text-black/50"
              >
                {props.textEmpity}
              </td>
            </tr>
          )}
          {props.load && (
            <tr>
              <td
                colSpan={props.columns.length}
                align="center"
                className="cursor-default px-4 pt-20 py-2 text-sm dark:text-white/30 text-black/50"
              >
                <Spinner size={"md"} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
