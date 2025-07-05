import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { MdErrorOutline, MdPix, MdCheckCircleOutline } from "react-icons/md";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import SelectPaymentIntegrations from "@components/SelectPaymentIntegrations";
import SelectBusinesses from "@components/SelectBusinesses";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type TypeMethodCharge = "pix";

type DataNode = {
  paymentIntegrationId: number;
  total: string;
  currency?: string;
  businessId: number;
  method_type: TypeMethodCharge;
  varId_email?: number;
  content?: string;
  varId_save_transactionId?: number;
  varId_save_qrCode?: number;
  varId_save_linkPayment?: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { updateNode, businessIds } = useStore((s) => ({
    updateNode: s.updateNode,
    businessIds: s.businessIds,
  }));
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

  return (
    <div className="flex flex-col -mt-3 gap-y-2 min-h-60">
      <Field label="Integração de pagamento">
        <SelectPaymentIntegrations
          isMulti={false}
          isClearable={false}
          menuPlacement="bottom"
          isFlow
          value={data.paymentIntegrationId}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, paymentIntegrationId: e.value },
            });
          }}
        />
      </Field>
      <Field
        label="Projeto"
        helperText={
          "Caso não selecione, será anexada a todos os projetos existentes e aos futuros."
        }
      >
        <SelectBusinesses
          isMulti={false}
          isClearable={false}
          menuPlacement="bottom"
          filter={
            businessIds.length
              ? (opt) => opt.filter((s) => businessIds.includes(s.id))
              : undefined
          }
          value={data.businessId}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, businessId: e.value },
            });
          }}
        />
      </Field>

      <div className="my-2 grid grid-cols-2 gap-x-2">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center justify-center">
            <span className="text-center text-white/60">Método da</span>
            <span className="text-center font-semibold leading-3">
              Cobrança
            </span>
          </div>

          <div className="flex text-[#13b491] items-center gap-x-1 mt-2">
            <MdPix size={25} />
            <span className="text-lg font-bold">PIX</span>
          </div>
        </div>

        <div className="flex flex-col items-center w-full gap-y-1.5">
          <div className="flex flex-col items-center justify-center">
            <span className="text-center text-white/60">Valor da</span>
            <span className="text-center font-semibold leading-3">
              Cobrança
            </span>
          </div>

          <AutocompleteTextField
            // @ts-expect-error
            trigger={["{{"]}
            size={"xs"}
            options={{ "{{": variables?.map((s) => s.name) || [] }}
            spacer={"}}"}
            placeholder="10 ou {{valor}}"
            defaultValue={data.total || ""}
            onChange={(target: string) => {
              setDataMok({ ...data, total: target });
            }}
          />
        </div>
      </div>

      <Field
        label="E-mail do contato (opcional)"
        helperText={"Selecione uma variável que contém o e-mail do contato."}
      >
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_email}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_email: e.value },
            });
          }}
        />
      </Field>
      <AutocompleteTextField
        // @ts-expect-error
        trigger={["{{"]}
        options={{ "{{": variables?.map((s) => s.name) || [] }}
        spacer={"}}"}
        type="textarea"
        minRows={3}
        placeholder="Descrição ou {{CONTEUDO}} da cobrança"
        defaultValue={data.content || ""}
        onChange={(target: string) => {
          setDataMok({ ...data, content: target });
        }}
        style={{ marginTop: "10px" }}
      />
      <div className="flex flex-col gap-y-2 mt-2">
        <span className="text-center font-medium">
          Salvar o resultado em variável
        </span>
        <Field label="ID da transação">
          <SelectVariables
            isMulti={false}
            isClearable
            placeholder="Selecione uma variável"
            menuPlacement="bottom"
            isFlow
            value={data.varId_save_transactionId}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_transactionId: e.value },
              });
            }}
          />
        </Field>
        <Field label="QR Code de pagamento">
          <SelectVariables
            isMulti={false}
            isClearable
            placeholder="Selecione uma variável"
            menuPlacement="bottom"
            isFlow
            value={data.varId_save_qrCode}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_qrCode: e.value },
              });
            }}
          />
        </Field>
        <Field label="Link para o pagamento">
          <SelectVariables
            isMulti={false}
            isClearable
            placeholder="Selecione uma variável"
            menuPlacement="bottom"
            isFlow
            value={data.varId_save_linkPayment}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_linkPayment: e.value },
              });
            }}
          />
        </Field>
      </div>
      <div className="flex flex-col gap-y-2 mt-2">
        <div className="flex flex-col items-center">
          <span className="text-center font-medium">Canais de saída</span>
          <span className="text-center text-sm text-white/60">
            Continue a conversa pelos canais abaixo.
          </span>
        </div>
        <div className="flex flex-col gap-y-0.5">
          <div className="flex items-center justify-between gap-x-2 text-green-500 bg-green-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">CRIADA</span>
              <p className="text-white/80 leading-3">
                Cobrança gerada com sucesso
              </p>
            </div>
            <MdCheckCircleOutline size={24} />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-red-500 bg-red-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">ERROR</span>
              <p className="text-white/80 leading-3">
                Não conseguiu gerar a cobrança
              </p>
            </div>
            <MdErrorOutline size={24} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 mt-2">
        <div className="flex flex-col items-center">
          <span className="text-center font-medium">
            Notifica o status da cobrança
          </span>
          <span className="text-center text-sm text-white/60">
            Não continue a conversa pelos canais abaixo.
          </span>
        </div>
        <div className="flex flex-col gap-y-0.5">
          <div className="flex items-center justify-between gap-x-2 text-green-500/70 bg-green-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">APPROVED</span>
              <p className="text-white/80 leading-3">Pagamento efetuado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-green-500/40" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-red-500/70 bg-red-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">REFUSED</span>
              <p className="text-white/80 leading-3">Pagamento recusado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-red-500/40" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-teal-500/70 bg-teal-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">REFUNDED</span>
              <p className="text-white/80 leading-3">Pagamento reembolsado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-teal-500/40" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-gray-500/70 bg-gray-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">CANCELLED</span>
              <p className="text-white/80 leading-3">Pagamento cancelado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-gray-500/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const NodeCharge: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        size="320px"
        title="Gerar cobrança"
        description="Crie uma cobrança e fica escutando o status do pagamento."
        positioning={{ flip: ["left", "right"], placement: "left" }}
        node={{
          children: (
            <div className="p-1 relative h-[65px] flex items-center justify-center">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <RiMoneyDollarCircleLine
                className="dark:text-white/70"
                size={27}
              />
            </div>
          ),
          name: "Cobrança",
          description: "Gerar",
        }}
      >
        <BodyNode data={data} id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      <CustomHandle
        nodeId={id}
        handleId="#0ebd17 success"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 5 }}
        isConnectable={true}
        className="relative dark:!border-green-600 dark:!bg-green-600/30 !border-green-600 !bg-green-600/30"
        title="Error ao tentar criar cobrança"
      >
        <span className="text-green-600 absolute -top-[1.5px] -left-[14px]">
          <MdCheckCircleOutline size={12} />
        </span>
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#e60000 error"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 17 }}
        isConnectable={true}
        className="relative dark:!border-red-600 dark:!bg-red-600/30 !border-red-600 !bg-red-600/30"
        title="Error ao tentar criar cobrança"
      >
        <span className="text-red-600 absolute -top-[1.5px] -left-[14px]">
          <MdErrorOutline size={12} />
        </span>
      </CustomHandle>

      <CustomHandle
        nodeId={id}
        handleId="#18ad52 approved animated"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 36 }}
        isConnectable={true}
        className="relative dark:!border-green-400/40 dark:!bg-green-400/15 !border-green-500/40 !bg-green-500/15"
        title="Pagamento efetuado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/40 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#eb0e15 refused animated"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 48 }}
        isConnectable={true}
        className="relative dark:!border-red-500/40 dark:!bg-red-500/15 !border-red-500/40 !bg-red-500/15"
        title="Pagamento recusado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#2d5a49 refunded animated"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 60 }}
        isConnectable={true}
        className="relative dark:!border-teal-400/40 dark:!bg-teal-400/15 !border-teal-500/40 !bg-teal-500/15"
        title="Pagamento reembolsado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-teal-500/40 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#4b4a4a cancelled animated"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 72 }}
        isConnectable={true}
        className="relative dark:!border-gray-400/40 dark:!bg-gray-400/15 !border-gray-500/40 !bg-gray-500/15"
        title="Pagamento cancelado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500/40 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
    </div>
  );
};
