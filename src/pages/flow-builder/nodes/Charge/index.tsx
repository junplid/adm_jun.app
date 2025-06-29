import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX } from "react";
import { useDBNodes, useVariables } from "../../../../db";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { MdPix } from "react-icons/md";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

type TypeMethodCharge = "pix";

type DataNode = {
  paymentIntegrationId: number;
  total: number;
  currency?: string;
  businessId: number;
  method_type: TypeMethodCharge;
  varId_email?: number;
  content?: string;
  varId_save_transactionId?: number;
  varId_save_qrCode?: number;
  varId_save_linkPayment?: number;
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;
  const updateNode = useStore((s) => s.updateNode);
  const variables = useVariables();

  if (!node) {
    return <span>Não encontrado</span>;
  }

  return (
    <div className="flex flex-col -mt-3 gap-y-2 min-h-60">
      <Field label="Integração de pagamento">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma integração"
          menuPlacement="bottom"
          isFlow
          // value={node.data.var1Id}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...node.data, var1Id: e.value },
            });
          }}
        />
      </Field>
      <Field
        label="Projeto"
        helperText={"Selecione um projeto cuja cobrança será anexada."}
      >
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma integração"
          menuPlacement="bottom"
          isFlow
          // value={node.data.var1Id}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...node.data, var1Id: e.value },
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
            options={{ "{{": variables.map((s) => s.name) }}
            spacer={"}}"}
            placeholder="10 ou {{valor}}"
            // defaultValue={node.data.value || ""}
            // @ts-expect-error
            onBlur={({ target }) => {
              updateNode(id, { data: { ...node.data, value: target.value } });
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
          value={node.data.varId_email}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...node.data, varId_email: e.value },
            });
          }}
        />
      </Field>
      <AutocompleteTextField
        // @ts-expect-error
        trigger={["{{"]}
        options={{ "{{": variables.map((s) => s.name) }}
        spacer={"}}"}
        type="textarea"
        minRows={3}
        placeholder="Descrição ou {{CONTEUDO}} da cobrança"
        // defaultValue={node.data.value || ""}
        // @ts-expect-error
        onBlur={({ target }) => {
          updateNode(id, { data: { ...node.data, value: target.value } });
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
            value={node.data.varId_save_transactionId}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...node.data, varId_save_transactionId: e.value },
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
            value={node.data.varId_save_qrCode}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...node.data, varId_save_qrCode: e.value },
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
            value={node.data.varId_save_linkPayment}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...node.data, varId_save_linkPayment: e.value },
              });
            }}
          />
        </Field>
      </div>
      <div className="flex flex-col gap-y-2 mt-2">
        <div className="flex flex-col items-center">
          <span className="text-center font-medium">
            Monitora o status do pagamento
          </span>
          <span className="text-center text-sm text-white/60">
            Cada mudança acionará uma das saídas de canal abaixo.
          </span>
        </div>
        <div className="flex flex-col gap-y-0.5">
          <div className="flex items-center justify-between gap-x-2 text-blue-500 bg-blue-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">CREATED</span>
              <p className="text-white/80 leading-3">Gerada com sucesso</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-blue-500/80" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-yellow-500 bg-yellow-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">PENDING</span>
              <p className="text-white/80 leading-3">Aguardando pagamento</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-green-500 bg-green-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">APPROVED</span>
              <p className="text-white/80 leading-3">Pagamento efetuado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-red-500 bg-red-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">REFUSED</span>
              <p className="text-white/80 leading-3">Pagamento recusado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-teal-500 bg-teal-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">REFUNDED</span>
              <p className="text-white/80 leading-3">Pagamento reembolsado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-teal-500/80" />
          </div>
          <div className="flex items-center justify-between gap-x-2 text-gray-500 bg-gray-500/5 p-2">
            <div className="flex flex-col">
              <span className="font-medium">CANCELLED</span>
              <p className="text-white/80 leading-3">Pagamento cancelado</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-gray-500/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const NodeCharge: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        size="300px"
        title="Gerar cobrança"
        description="Crie uma cobrança e fica escutando o status do pagamento."
        positioning={{ flip: ["left", "right"], placement: "left" }}
        node={{
          children: (
            <div className="p-1 relative h-[60px] flex items-center justify-center">
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
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <CustomHandle
        nodeId={id}
        handleId="#3f85a0 created"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 6 }}
        isConnectable={true}
        className="relative dark:text-blue-400 text-blue-500 dark:!border-blue-400/60 dark:!bg-blue-400/15 !border-blue-500/70 !bg-blue-500/15"
        title="Gerada com sucesso"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#999342 pending"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 18 }}
        isConnectable={true}
        className="relative dark:text-yellow-400 text-yellow-500 dark:!border-yellow-400/60 dark:!bg-yellow-400/15 !border-yellow-500/70 !bg-yellow-500/15"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#56a33b approved"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 30 }}
        isConnectable={true}
        className="relative dark:text-green-400 text-green-500 dark:!border-green-400/60 dark:!bg-green-400/15 !border-green-500/70 !bg-green-500/15"
        title="Pagamento efetuado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#B1474A refused"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 42 }}
        isConnectable={true}
        className="relative dark:text-red-400 text-red-500 dark:!border-red-400/60 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
        title="Pagamento recusado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#3c8b6d refunded"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 54 }}
        isConnectable={true}
        className="relative dark:text-teal-400 text-teal-500 dark:!border-teal-400/60 dark:!bg-teal-400/15 !border-teal-500/70 !bg-teal-500/15"
        title="Pagamento reembolsado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId="#757575 cancelled"
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 66 }}
        isConnectable={true}
        className="relative dark:text-gray-400 text-gray-500 dark:!border-gray-400/60 dark:!bg-gray-400/15 !border-gray-500/70 !bg-gray-500/15"
        title="Pagamento cancelado"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500 absolute -top-[0.5px] -left-[13px]" />
      </CustomHandle>
    </div>
  );
};
