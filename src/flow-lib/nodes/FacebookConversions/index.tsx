import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { LiaFacebookF } from "react-icons/lia";
import { CustomDataFbConversionComponent } from "./CustomData";
import { dataInputs } from "./datas";
import { api } from "../../../../services/api";
import { useCookies } from "react-cookie";
import { AxiosError } from "axios";
import { AuthorizationContext } from "../../../../contexts/authorization.context";

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
  | "ViewContent";

interface IPaternEvent<T = string> {
  varId: number;
  customValue: T;
}

interface Content {
  id?: IPaternEvent;
  quantity?: IPaternEvent<number>;
  itemPrice?: IPaternEvent<number>;
  deliveryCategory?: IPaternEvent<"HOME_DELIVERY" | "IN_STORE">;
  title?: IPaternEvent;
  description?: IPaternEvent;
  brand?: IPaternEvent;
  category?: IPaternEvent;
}

type CustomData<ContentList extends undefined | Content[] = Content[]> = {
  customValue?: IPaternEvent<number>;
  customCurrency?: IPaternEvent<"usd" | "brl" | "eur">;
  customStatus?: IPaternEvent<"completed" | "pending" | "canceled">;
  customMethod?: IPaternEvent<"boleto" | "credit_card" | "pix" | "paypal">;
  customContentName?: IPaternEvent;
  customContentType?: IPaternEvent;
  customNumItems?: IPaternEvent<number>;
  customContentCategory?: IPaternEvent;
  customContents?: ContentList;
};

interface UserData {
  userEmail?: IPaternEvent;
  userFirstName?: IPaternEvent;
  userLastName?: IPaternEvent;
  userDobd?: IPaternEvent;
  userDobm?: IPaternEvent;
  userDoby?: IPaternEvent;
  userDateOfBirth?: IPaternEvent;
  userCity?: IPaternEvent;
  userState?: IPaternEvent;
  userCountry?: IPaternEvent;
  userZip?: IPaternEvent;
  userGender?: IPaternEvent<"m" | "f">;
}

export type TKeyNames = keyof CustomData | keyof UserData;

export interface DataNode {
  fbIntegrationId: number;
  fbBusinessId: string;
  fbPixelId: string;
  event: {
    name: FbConversionEvents;
    userEmail?: IPaternEvent;
    userFirstName?: IPaternEvent;
    userLastName?: IPaternEvent;
    userDobd?: IPaternEvent;
    userDobm?: IPaternEvent;
    userDoby?: IPaternEvent;
    userDateOfBirth?: IPaternEvent;
    userCity?: IPaternEvent;
    userState?: IPaternEvent;
    userCountry?: IPaternEvent;
    userZip?: IPaternEvent;
    userGender?: IPaternEvent<"m" | "f">;
    customValue?: IPaternEvent<number>;
    customCurrency?: IPaternEvent<"usd" | "brl" | "eur">;
    customStatus?: IPaternEvent<"completed" | "pending" | "canceled">;
    customMethod?: IPaternEvent<"boleto" | "credit_card" | "pix" | "paypal">;
    customContentName?: IPaternEvent;
    customContentType?: IPaternEvent;
    customNumItems?: IPaternEvent<number>;
    customContentCategory?: IPaternEvent;
    customContents?: Content[];
  };
}

const optionsEvents: { key: FbConversionEvents; label: string }[] = [
  { key: "Contact", label: "Entrou em contato" },
  { key: "Lead", label: "Tornou-se um lead" },
  { key: "ViewContent", label: "Visualizou um conteúdo" },
  { key: "Subscribe", label: "Inscrever-se" },
  { key: "SubmitApplication", label: "Envia formulario" },
  { key: "StartTrial", label: "Inicia período de teste" },
  { key: "Search", label: "Realizou uma busca" },
  { key: "Schedule", label: "Agendou um compromisso" },
  { key: "InitiateCheckout", label: "Iniciou o processo de checkout" },
  { key: "FindLocation", label: "Procurou a localização" },
  { key: "Donate", label: "Fez uma doação" },
  { key: "CustomizeProduct", label: "Personalizou um produto" },
  { key: "CompleteRegistration", label: "Completou um formulário" },
  { key: "AddToWishlist", label: "Adicionou à lista de desejos" },
  { key: "AddToCart", label: "Adicionou item ao carrinho" },
  { key: "AddPaymentInfo", label: "Adicionou informações de pagamento" },
  { key: "Purchase", label: "Realizou uma compra" },
];

interface Option {
  name: string;
  id: string;
}

export const NodeFacebookConversions: React.FC<Node> = ({
  id,
}): JSX.Element => {
  const [{ auth }] = useCookies(["auth"]);
  const {
    options,
    actions,
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);
  const { handleLogout } = useContext(AuthorizationContext);
  const { setNodes } = useReactFlow();

  const store = useStoreApi();

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!isFirst) return;
    if (!options.fbIntegrations.length) {
      actions.getFbIntegrations();
      actions.getVariables();
      setIsFirst(true);
    }
  }, [options.fbIntegrations.length, isFirst]);

  const [fbBusinesses, setFbBusinesses] = useState<Option[]>([]);
  const [fbPixels, setFbPixels] = useState<Option[]>([]);
  const [loadPixels, setLoadPixels] = useState(false);
  const [loadBusinesses, setLoadBusinesses] = useState(false);

  useEffect(() => {
    if (data.fbIntegrationId) {
      (async () => {
        try {
          setLoadBusinesses(true);
          const { data: aa } = await api.get(
            `/private/facebook-integration/${data.fbIntegrationId}/business-options`,
            { headers: { authorization: auth } }
          );
          setFbBusinesses(aa.fbBusinesses);
          setLoadBusinesses(false);
        } catch (error) {
          setLoadBusinesses(false);
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              return handleLogout();
            }
          }
        }
      })();
    }
  }, [data.fbIntegrationId]);

  useEffect(() => {
    if (data.fbBusinessId) {
      (async () => {
        try {
          setLoadPixels(true);
          const { data: aa } = await api.get(
            `/private/facebook-integration/${data.fbIntegrationId}/pixels-options/${data.fbBusinessId}`,
            { headers: { authorization: auth } }
          );
          setFbPixels(aa.fbPixels);
          setLoadPixels(false);
        } catch (error) {
          setLoadPixels(false);
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              return handleLogout();
            }
          }
        }
      })();
    }
  }, [data.fbBusinessId]);

  const isConnectable = useMemo(() => {
    if (startConnection) {
      if (startConnection.id === id) {
        return false;
      } else {
        if (
          !listIdNodesLineDependent.includes(id) &&
          !listLinesIdNodesInterruoption.includes(id)
        ) {
          return true;
        }

        if (listLinesIdNodesInterruoption.includes(startConnection.id)) {
          if (listIdNodesLineDependent.includes(id)) return false;
          return true;
        }
        if (listIdNodesLineDependent.includes(startConnection.id)) {
          if (listLinesIdNodesInterruoption.includes(id)) return false;
          return true;
        }
      }
    } else {
      return true;
    }
  }, [startConnection?.hash]);

  return (
    <PatternNode.PatternContainer
      size="228px"
      style={{ bgColor: "#131821", color: "#ffffff" }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: LiaFacebookF,
        label: "Conversões com facebook",
        style: { bgColor: "#8f123a", color: "#ffffff" },
      }}
    >
      <div className="flex flex-col gap-y-2 px-1 py-2 pb-1">
        <label className="nodrag flex flex-col">
          <span className="font-semibold text-white/80">
            Selecione a integração
          </span>
          <SelectComponent
            styles={{
              valueContainer: { paddingLeft: 9 },
              control: { minHeight: 20 },
              indicatorsContainer: { padding: 5 },
              dropdownIndicator: { padding: 3 },
            }}
            onChange={(propsV) =>
              setNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === id) {
                    node.data = {
                      ...node.data,
                      fbIntegrationId: Number(propsV.value),
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={options.fbIntegrations.map((v) => ({
              label: v.name,
              value: v.id,
            }))}
            isMulti={false}
            noOptionsMessage="Nenhuma integração encontrada"
            placeholder="Selecione a integração"
            value={
              data.fbIntegrationId
                ? {
                    label:
                      options.fbIntegrations.find(
                        (v) => v.id === data.fbIntegrationId
                      )?.name ?? "",
                    value: Number(data.fbIntegrationId),
                  }
                : undefined
            }
          />
        </label>
        {data.fbIntegrationId && (
          <label className="nodrag flex flex-col">
            <span className="font-semibold text-white/80">
              Selecione o negócio na Meta/Facebook
            </span>
            <SelectComponent
              styles={{
                valueContainer: { paddingLeft: 9 },
                control: { minHeight: 20 },
                indicatorsContainer: { padding: 5 },
                dropdownIndicator: { padding: 3 },
              }}
              onChange={(propsV) =>
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = {
                        ...node.data,
                        fbBusinessId: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              options={fbBusinesses.map((v) => ({
                label: v.name,
                value: v.id,
              }))}
              isMulti={false}
              isLoading={loadBusinesses}
              noOptionsMessage="Nenhum negócio encontrado"
              placeholder="Selecione o negócio na Meta/Facebook"
              value={
                data.fbBusinessId
                  ? {
                      label:
                        fbBusinesses.find((v) => v.id === data.fbBusinessId)
                          ?.name ?? "",
                      value: data.fbBusinessId,
                    }
                  : undefined
              }
            />
          </label>
        )}
        {data.fbBusinessId && (
          <label className="nodrag flex flex-col">
            <span className="font-semibold text-white/80">
              Selecione o pixel
            </span>
            <SelectComponent
              styles={{
                valueContainer: { paddingLeft: 9 },
                control: { minHeight: 20 },
                indicatorsContainer: { padding: 5 },
                dropdownIndicator: { padding: 3 },
              }}
              onChange={(propsV) =>
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = {
                        ...node.data,
                        fbPixelId: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              options={fbPixels.map((v) => ({
                label: v.name,
                value: v.id,
              }))}
              isLoading={loadPixels}
              isMulti={false}
              noOptionsMessage="Nenhum pixel encontrado"
              placeholder="Selecione o pixel"
              value={
                data.fbPixelId
                  ? {
                      label:
                        fbPixels.find((v) => v.id === data.fbPixelId)?.name ??
                        "",
                      value: Number(data.fbPixelId),
                    }
                  : undefined
              }
            />
          </label>
        )}
        <label className="nodrag nopan flex flex-col">
          <span className="font-semibold text-white/80">
            Selecione o evento
          </span>
          <SelectComponent
            styles={{
              valueContainer: { paddingLeft: 9 },
              control: { minHeight: 20 },
              indicatorsContainer: { padding: 5 },
              dropdownIndicator: { padding: 3 },
            }}
            onChange={(propsV) =>
              setNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === id) {
                    node.data = {
                      ...node.data,
                      event: { name: String(propsV.value), customContents: [] },
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={optionsEvents.map((v) => ({
              label: v.label,
              value: v.key,
            }))}
            isMulti={false}
            noOptionsMessage="Nenhum evento encontrado"
            placeholder="Selecione o evento"
            value={
              data.event?.name
                ? {
                    label:
                      optionsEvents.find((v) => v.key === data.event.name)
                        ?.label ?? "",
                    value: data.event.name,
                  }
                : undefined
            }
          />
        </label>

        <div className="flex flex-col gap-y-2">
          {/* inputs para para a data do usuário */}
          <CustomDataFbConversionComponent
            inputs={dataInputs
              .filter((s) => s.keyName.includes("user"))
              .map((d) => d.keyName)}
            nodeId={id}
            title="Dados do usuário/lead"
            event={data.event}
          />
          {data.event?.name === "ViewContent" && (
            <CustomDataFbConversionComponent
              inputs={["customContentCategory", "customContentName"]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {data.event?.name === "Lead" && (
            <CustomDataFbConversionComponent
              inputs={["customContentCategory", "customContentName"]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {data.event?.name === "Subscribe" && (
            <CustomDataFbConversionComponent
              inputs={[
                "customContentCategory",
                "customContentName",
                "customCurrency",
                "customStatus",
                "customValue",
              ]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {(data.event?.name === "SubmitApplication" ||
            data.event?.name === "Search" ||
            data.event?.name === "Schedule" ||
            data.event?.name === "FindLocation" ||
            data.event?.name === "CompleteRegistration" ||
            data.event?.name === "StartTrial") && (
            <CustomDataFbConversionComponent
              inputs={["customContentCategory", "customContentName"]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {data.event?.name === "InitiateCheckout" && (
            <CustomDataFbConversionComponent
              inputs={[
                "customContentCategory",
                "customContentName",
                "customCurrency",
                "customNumItems",
                "customValue",
              ]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {(data.event?.name === "FindLocation" ||
            data.event?.name === "Contact") && (
            <CustomDataFbConversionComponent
              inputs={[
                "customContentCategory",
                "customContentName",
                "customValue",
              ]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {data.event?.name === "AddPaymentInfo" && (
            <CustomDataFbConversionComponent
              inputs={[
                "customContentCategory",
                "customContentName",
                "customValue",
                "customCurrency",
                "customMethod",
              ]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {data.event?.name === "Donate" && (
            <CustomDataFbConversionComponent
              inputs={[
                "customContentCategory",
                "customContentName",
                "customValue",
                "customCurrency",
                "customMethod",
                "customStatus",
              ]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
          {(data.event?.name === "Purchase" ||
            data.event?.name === "AddToCart" ||
            data.event?.name === "CustomizeProduct" ||
            data.event?.name === "AddToWishlist") && (
            <CustomDataFbConversionComponent
              inputs={[
                "customContentCategory",
                "customContentName",
                "customValue",
                "customCurrency",
                "customMethod",
                "customStatus",
                "customContents",
              ]}
              nodeId={id}
              title="Dados adicionais"
              event={data.event}
            />
          )}
        </div>

        <Handle
          type="target"
          position={Position.Left}
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          style={{ top: "30%", left: -15 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ top: "30%", right: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
