import { JSX, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { MdInsights } from "react-icons/md";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectFbPixels from "@components/SelectFbPixels";
import SelectComponent from "@components/Select";
import AutocompleteTextField from "@components/Autocomplete";
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type FbConversionEvents =
  | "AddPaymentInfo"
  | "AddToCart"
  | "AddToWishlist"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "InitiateCheckout"
  | "Lead"
  | "Purchase"
  | "Schedule"
  | "Search"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | "PageView"
  | "ViewContent";

// interface Content {
//   id?: IPaternEvent;
//   quantity?: IPaternEvent<number>;
//   itemPrice?: IPaternEvent<number>;
//   deliveryCategory?: IPaternEvent<"HOME_DELIVERY" | "IN_STORE">;
//   title?: IPaternEvent;
//   description?: IPaternEvent;
//   brand?: IPaternEvent;
//   category?: IPaternEvent;
// }

// type CustomData<ContentList extends undefined | Content[] = Content[]> = {
//   customValue?: IPaternEvent<number>;
//   customCurrency?: IPaternEvent<"usd" | "brl" | "eur">;
//   customStatus?: IPaternEvent<"completed" | "pending" | "canceled">;
//   customMethod?: IPaternEvent<"boleto" | "credit_card" | "pix" | "paypal">;
//   customContentName?: IPaternEvent;
//   customContentType?: IPaternEvent;
//   customNumItems?: IPaternEvent<number>;
//   customContentCategory?: IPaternEvent;
//   customContents?: ContentList;
// };

export type DataNode = {
  fbPixelId: number;
  viewFieldsUser?: boolean;
  viewFieldsOthers?: boolean;
  event: {
    name: FbConversionEvents;
    userEmail?: string;
    userFirstName?: string;
    userLastName?: string;
    userDobd?: string;
    userDobm?: string;
    userDoby?: string;
    userDateOfBirth?: string;
    userCity?: string;
    userState?: string;
    userCountry?: string;
    userZip?: string;
    userGender?: string;
    customValue?: string;
    customCurrency?: string;
    customStatus?: string;
    customMethod?: string;
    customContentName?: string;
    customContentType?: string;
    customNumItems?: string;
    customContentCategory?: string;
    // customContents?: Content[];
  };
};

const optionsEvents: { name: FbConversionEvents; label: string }[] = [
  { name: "PageView", label: "Visualizou uma página" },
  { name: "ViewContent", label: "Visualizou um conteúdo" },
  { name: "Search", label: "Realizou uma busca" },
  { name: "AddToCart", label: "Adicionou item ao carrinho" },
  { name: "AddToWishlist", label: "Adicionou à lista de desejos" },
  { name: "InitiateCheckout", label: "Iniciou o processo de checkout" },
  { name: "AddPaymentInfo", label: "Adicionou informações de pagamento" },
  { name: "Purchase", label: "Realizou uma compra" },
  { name: "Lead", label: "Tornou-se um lead" },
  { name: "CompleteRegistration", label: "Completou um formulário" },
  { name: "Contact", label: "Entrou em contato" },
  { name: "FindLocation", label: "Procurou a localização" },
  { name: "Schedule", label: "Agendou um compromisso" },
  { name: "StartTrial", label: "Inicia período de teste" },
  { name: "SubmitApplication", label: "Envia formulario" },
  { name: "Subscribe", label: "Inscrever-se" },
  { name: "Donate", label: "Fez uma doação" },
  { name: "CustomizeProduct", label: "Personalizou um produto" },
];

const fbFieldsUser = [
  { name: "userFirstName", label: "Nome" },
  { name: "userLastName", label: "Sobrenome" },
  { name: "userGender", label: "Gênero" },
  { name: "userEmail", label: "E-mail" },
  { name: "userCity", label: "Cidade" },
  { name: "userState", label: "Estado" },
  { name: "userCountry", label: "País" },
  { name: "userDateOfBirth", label: "Data de nascimento" },
  { name: "userDobd", label: "Dia de nascimento" },
  { name: "userDobm", label: "Mês de nascimento" },
  { name: "userDoby", label: "Ano de nascimento" },
  { name: "userZip", label: "CEP/Código postal" },
];

const fbFieldsOthers = [
  { name: "customValue", label: "Preço/Total" },
  {
    name: "customCurrency",
    label: "Moeda",
    placeholder: "Ex: USD, BRL, EUR ...",
  },
  {
    name: "customStatus",
    label: "Status",
    placeholder: "Ex: RECEBIDO, pending ou o que fizer sentido",
  },
  {
    name: "customMethod",
    label: "Método",
    placeholder: "Ex: boleto, PIX ou o que fizer sentido",
  },
  { name: "customContentName", label: "Nome do conteúdo" },
  { name: "customContentType", label: "Tipo do conteúdo" },
  { name: "customNumItems", label: "Qnt de items" },
  { name: "customContentCategory", label: "Categoria do conteúdo" },
  // falta o customContents: item[]
];

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);
  const { data: variables } = useGetVariablesOptions();

  const [dataMok, setDataMok] = useState(data as DataNode);
  const [init, setInit] = useState(false);
  useEffect(() => {
    if (!init) {
      setInit(true);
      return;
    }
    return () => {
      setInit(false);
    };
  }, [init]);

  useEffect(() => {
    if (!init) return;
    const debounce = setTimeout(() => updateNode(id, { data: dataMok }), 200);
    return () => {
      clearTimeout(debounce);
    };
  }, [dataMok]);

  const isFieldUser = useMemo(() => {
    if (data.viewFieldsUser) return true;
    // @ts-ignore
    return fbFieldsUser.some((field) => data.event?.[field.name]);
  }, [data.viewFieldsUser, data.event]);

  const isFieldOthers = useMemo(() => {
    if (data.viewFieldsOthers) return true;
    // @ts-ignore
    return fbFieldsOthers.some((field) => data.event?.[field.name]);
  }, [data.viewFieldsOthers, data.event]);

  return (
    <div className="flex flex-col gap-y-3 -mt-3">
      <Field label="Selecione o pixel">
        <SelectFbPixels
          isMulti={false}
          menuPlacement="bottom"
          isFlow
          onChange={(e: any) => setDataMok({ ...data, fbPixelId: e.value })}
          isClearable={false}
          value={data.fbPixelId}
        />
      </Field>
      <Field label="Selecione o evento">
        <SelectComponent
          isMulti={false}
          onChange={(e: any) => {
            if (e?.name) {
              setDataMok({
                ...data,
                event: { ...data.event, name: e.name },
              });
            }
          }}
          isFlow
          isClearable={false}
          menuPlacement="bottom"
          options={optionsEvents}
          value={
            data?.event?.name
              ? {
                  label:
                    optionsEvents.find((item) => item.name === data.event.name)
                      ?.label || "",
                  value: data.event.name,
                }
              : null
          }
          placeholder="Selecione um evento"
        />
      </Field>
      <div className="flex flex-col gap-y-1 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Parâmetros do lead</h3>
          <button
            className="cursor-pointer flex items-center gap-x-1"
            onClick={() =>
              setDataMok({
                ...data,
                viewFieldsUser: !data.viewFieldsUser,
              })
            }
          >
            <span className="text-xs text-white/70">
              {data.viewFieldsUser
                ? "Ocultar não preenchidos"
                : "Exibir todos os campos"}
            </span>
            {data.viewFieldsUser ? (
              <RiEye2Line size={18} />
            ) : (
              <RiEyeCloseLine size={18} />
            )}
          </button>
        </div>
        <div className="w-full p-1 flex gap-y-0.5 flex-col">
          {fbFieldsUser.map((field) => {
            // @ts-expect-error
            if (!data.viewFieldsUser && !data.event?.[field.name]) {
              return null;
            }
            return (
              <label
                key={field.name}
                className="flex w-full items-start gap-x-1"
              >
                <span className="text-nowrap text-xs mt-1.5 text-white/70">
                  "{field.label}":
                </span>
                <div className="flex items-center w-full">
                  <AutocompleteTextField
                    // @ts-expect-error
                    trigger={["{{"]}
                    options={{ "{{": variables?.map((s) => s.name) || [] }}
                    spacer={"}} "}
                    placeholder="Digite o valor ou a {{variável}}"
                    className="px-1.5! py-0.5 w-full resize-none! border-none text-[12px]! focus:bg-white/10! bg-white/5! rounded-none! outline-none!"
                    // @ts-expect-error
                    defaultValue={data.event?.[field.name] || ""}
                    minRows={1}
                    type="textarea"
                    matchAny
                    onChange={async (target: string) => {
                      setDataMok({
                        ...data,
                        event: {
                          ...data.event,
                          [field.name]: target,
                        },
                      });
                    }}
                  />
                </div>
              </label>
            );
          })}
          {!data.viewFieldsUser && !isFieldUser && (
            <div className="flex items-center justify-center text-white/70">
              Nenhum parâmetro preenchido
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Outros parâmetros</h3>
          <button
            className="cursor-pointer flex items-center gap-x-1"
            onClick={() =>
              setDataMok({
                ...data,
                viewFieldsOthers: !data.viewFieldsOthers,
              })
            }
          >
            <span className="text-xs text-white/70">
              {data.viewFieldsOthers
                ? "Ocultar não preenchidos"
                : "Exibir todos os campos"}
            </span>
            {data.viewFieldsOthers ? (
              <RiEye2Line size={18} />
            ) : (
              <RiEyeCloseLine size={18} />
            )}
          </button>
        </div>
        <div className="w-full p-1 flex gap-y-0.5 flex-col">
          {fbFieldsOthers.map((field) => {
            if (
              !data.viewFieldsOthers &&
              // @ts-expect-error
              !data.event?.[field.name]
            ) {
              return null;
            }
            return (
              <label
                key={field.name}
                className="flex w-full items-start gap-x-1"
              >
                <span className="text-nowrap text-xs mt-1.5 text-white/70">
                  "{field.label}":
                </span>
                <div className="flex items-center w-full">
                  <AutocompleteTextField
                    // @ts-expect-error
                    trigger={["{{"]}
                    options={{ "{{": variables?.map((s) => s.name) || [] }}
                    spacer={"}} "}
                    placeholder={
                      field.placeholder || "Digite o valor ou a {{variável}}"
                    }
                    className="px-1.5! py-0.5 w-full resize-none! border-none text-[12px]! focus:bg-white/10! bg-white/5! rounded-none! outline-none!"
                    // @ts-expect-error
                    defaultValue={data.event?.[field.name] || ""}
                    minRows={1}
                    type="textarea"
                    matchAny
                    onChange={async (target: string) => {
                      setDataMok({
                        ...data,
                        event: {
                          ...data.event,
                          [field.name]: target,
                        },
                      });
                    }}
                  />
                </div>
              </label>
            );
          })}
          {!data.viewFieldsOthers && !isFieldOthers && (
            <div className="flex items-center justify-center text-white/70">
              Nenhum parâmetro preenchido
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const NodeFbPixel: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Rastrear pixel"
        description="Rastreia evento do Facebook Pixel"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="370px"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <MdInsights className="text-blue-600" size={26.8} />
            </div>
          ),
          description: "Rastrear",
          name: "Pixel",
        }}
      >
        <BodyNode data={data} id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <CustomHandle
        nodeId={id}
        handleId="main"
        position={Position.Right}
        type="source"
        style={{ right: -8 }}
        isConnectable={true}
      />
    </div>
  );
};
