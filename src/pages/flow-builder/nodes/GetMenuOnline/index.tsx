import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX } from "react";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectComponent from "@components/Select";
import SelectVariables from "@components/SelectVariables";
import { TiFlash } from "react-icons/ti";
import { CgWebsite } from "react-icons/cg";

const optionsFields: {
  label: string;
  value:
    | "identifier"
    | "desc"
    | "deviceId_app_agent"
    | "device_online"
    | "titlePage"
    | "link"
    | "address"
    | "lat"
    | "lng"
    | "state_uf"
    | "city"
    | "phone_contact"
    | "whatsapp_contact"
    | "delivery_fee"
    | "city";
}[] = [
  { label: "Endereço", value: "address" },
  { label: "Cidade", value: "city" },
  { label: "Estado (UF)", value: "state_uf" },
  { label: "Latitude", value: "lat" },
  { label: "Longitude", value: "lng" },
  { label: "Taxa de entrega", value: "delivery_fee" },
  { label: "Descrição", value: "desc" },
  { label: "ID do dispositivo", value: "deviceId_app_agent" },
  { label: "Identificação", value: "identifier" },
  { label: "Link pro cardapio", value: "link" },
  { label: "Titulo", value: "titlePage" },
  { label: "Número WhatsApp", value: "whatsapp_contact" },
  { label: "Status do dispositivo", value: "device_online" },
  { label: "Número para contato", value: "phone_contact" },
];

type DataNode = {
  nMenuOnline: string;
  fields?: (
    | "identifier"
    | "desc"
    | "deviceId_app_agent"
    | "device_online"
    | "titlePage"
    | "link"
    | "address"
    | "lat"
    | "lng"
    | "state_uf"
    | "city"
    | "phone_contact"
    | "whatsapp_contact"
    | "delivery_fee"
  )[];

  varId_save_identifier?: number;
  varId_save_desc?: number;
  varId_save_deviceId_app_agent?: number;
  varId_save_titlePage?: number;
  varId_save_link?: number;
  varId_save_address?: number;
  varId_save_lat?: number;
  varId_save_lng?: number;
  varId_save_state_uf?: number;
  varId_save_city?: number;
  varId_save_phone_contact?: number;
  varId_save_whatsapp_contact?: number;
  varId_save_delivery_fee?: number;
  varId_save_device_online?: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);

  return (
    <div className="flex flex-col gap-y-3 -mt-3">
      {/* <Field
        label="Código"
        helperText={"Código do pedido ou Código de entrega"}
      >
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}}"}
          placeholder="Digite o código"
          defaultValue={data.nOrder_deliveryCode || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, nOrder_deliveryCode: value })
          }
        />
      </Field> */}

      {data.fields?.includes("address") && (
        <Field label="Salvar o endereço">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_address: tag.id },
              });
            }}
            value={data.varId_save_address}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_address: e.value },
              });
            }}
          />
        </Field>
      )}
      {data.fields?.includes("state_uf") && (
        <Field label="Salvar estado (UF)">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_state_uf: tag.id },
              });
            }}
            value={data.varId_save_state_uf}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_state_uf: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("city") && (
        <Field label="Salvar a cidade">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_city: tag.id },
              });
            }}
            value={data.varId_save_city}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_city: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("lat") && (
        <Field label="Salvar latitude">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_lat: tag.id },
              });
            }}
            value={data.varId_save_lat}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_lat: e.value },
              });
            }}
          />
        </Field>
      )}
      {data.fields?.includes("lng") && (
        <Field label="Salvar longitude">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_lng: tag.id },
              });
            }}
            value={data.varId_save_lng}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_lng: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("delivery_fee") && (
        <Field label="Salvar a taxa de entrega">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_delivery_fee: tag.id },
              });
            }}
            value={data.varId_save_delivery_fee}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_delivery_fee: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("desc") && (
        <Field label="Salvar a descrição">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_desc: tag.id },
              });
            }}
            value={data.varId_save_desc}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_desc: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("deviceId_app_agent") && (
        <Field label="Salvar ID do dispositivo">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_deviceId_app_agent: tag.id },
              });
            }}
            value={data.varId_save_deviceId_app_agent}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_deviceId_app_agent: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("device_online") && (
        <Field label="Salvar status do dispositivo" helperText="'ON' ou 'OFF'">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_device_online: tag.id },
              });
            }}
            value={data.varId_save_device_online}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_device_online: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("identifier") && (
        <Field label="Salvar identificação">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_identifier: tag.id },
              });
            }}
            value={data.varId_save_identifier}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_identifier: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("link") && (
        <Field label="Salvar link do cardápio">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_link: tag.id },
              });
            }}
            value={data.varId_save_link}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_link: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("phone_contact") && (
        <Field label="Salvar telefone de contato">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_phone_contact: tag.id },
              });
            }}
            value={data.varId_save_phone_contact}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_phone_contact: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("titlePage") && (
        <Field label="Salvar titulo do cardapio">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_titlePage: tag.id },
              });
            }}
            value={data.varId_save_titlePage}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_titlePage: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("whatsapp_contact") && (
        <Field label="Salvar número WhatsApp">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_whatsapp_contact: tag.id },
              });
            }}
            value={data.varId_save_whatsapp_contact}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_whatsapp_contact: e.value },
              });
            }}
          />
        </Field>
      )}

      <Field label={"Selecione os campos"}>
        <SelectComponent
          options={optionsFields}
          placeholder="Selecione os campos para recuperar"
          isMulti
          isFlow
          value={(data.fields || [])?.map((s) => ({
            label: optionsFields.find((o) => o.value === s)?.label || "",
            value: s,
          }))}
          onChange={(vl: any) => {
            updateNode(id, {
              data: { ...data, fields: vl.map((s: any) => s.value) },
            });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeGetMenuOnline: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de buscar cardápio"
        description="Busca um cardápio existente"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <CgWebsite className="text-gray-400" size={31} />
            </div>
          ),
          name: "Pedido",
          description: "Buscar",
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
        style={{ right: -9, top: 11 }}
        isConnectable={true}
      />
      <span className="absolute -right-3.75 top-6 text-yellow-400">
        <TiFlash size={13} />
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`#b99909 not_found`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 30 }}
        isConnectable={true}
        className="border-yellow-400/60! bg-yellow-400/15!"
      />
    </div>
  );
};
