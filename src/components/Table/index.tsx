import { useMemo, JSX } from "react";
import "./styles.css";
import { nanoid } from "nanoid";
import { TableVirtuoso, Virtuoso } from "react-virtuoso";
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
          value: JSX.Element | string | number;
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
      return {
        id: row.id,
        columns: columns.filter((s) => s !== null || s !== undefined),
      };
    });
  }, [props.columns, props.rows]);

  return (
    <div className="relative w-full">
      <TableVirtuoso
        className="scroll-custom-table container__virtuoso"
        style={{ height: "100%", width: "100%" }}
        data={rows}
        fixedHeaderContent={() => (
          <tr>
            {props.columns.map((column) => (
              <th
                key={column.key}
                align="left"
                className="select-none font-semibold md:px-4 px-1 py-2 text-sm"
                style={{ width: column.styles?.width }}
              >
                {column.name}
              </th>
            ))}
          </tr>
        )}
        itemContent={(_index, row) =>
          row.columns.map((column) => {
            if (column !== null) {
              return (
                <td
                  key={row.id + column.key}
                  className="cursor-default md:px-4 px-1 py-2"
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
          })
        }
      />
      {!rows.length && props.textEmpity && !props.load && (
        <div className="cursor-default mt-10 w-full text-center px-4 py-2 text-sm text-white/30">
          <span>{props.textEmpity}</span>
        </div>
      )}
      {props.load && (
        <div className="cursor-default absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-2 text-sm text-white/30">
          <Spinner size={"md"} />
        </div>
      )}
    </div>
  );
};

interface PropsMobile {
  totalCount: number;
  renderItem: (index: number) => JSX.Element;
  textEmpity?: string;
  load: boolean;
}

export const TableMobileComponent = (props: PropsMobile): JSX.Element => {
  return (
    <div className="relative w-full">
      <Virtuoso
        className="scroll-custom-table container__virtuoso"
        style={{ height: "100%", width: "100%" }}
        totalCount={props.totalCount}
        itemContent={props.renderItem}
      />
      {!props.totalCount && props.textEmpity && !props.load && (
        <div className="cursor-default  w-full absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-1 py-2 text-sm text-white/30">
          {props.textEmpity}
        </div>
      )}
      {props.load && (
        <div className="cursor-default absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-2 text-sm text-white/30">
          <Spinner size={"md"} />
        </div>
      )}
    </div>
  );
};
