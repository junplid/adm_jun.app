import { Button, Input, NumberInput } from "@chakra-ui/react";
import { useDBNodes, useVariables } from "../../../../db/index";
import { Handle, Node, Position } from "@xyflow/react";
import { IoIosCloseCircle } from "react-icons/io";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX } from "react";
import { nanoid } from "nanoid";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Field } from "@components/ui/field";

type DataNode = {
  groupName: string;
  messages?: {
    text: string;
    interval?: number;
    key: string;
  }[];
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const variables = useVariables();
  const updateNode = useStore((s) => s.updateNode);
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;

  if (!node) {
    return <span>Não encontrado</span>;
  }

  const { data } = node;

  return (
    <div className="flex flex-col gap-y-5 -mt-3">
      <Field
        label="Nome do grupo"
        helperText={
          "Este node será skipado caso a conexão WA não seja membro do grupo"
        }
      >
        <Input
          name="groupName"
          defaultValue={data.groupName || ""}
          onBlur={({ target }) => {
            updateNode(id, {
              data: { ...data, groupName: target.value },
            });
          }}
          size={"xs"}
        />
      </Field>
      {!!data.messages?.length &&
        data.messages!.map((msg) => (
          <div
            key={msg.key}
            className="relative group gap-y-2 flex flex-col dark:bg-zinc-600/10 py-2.5 rounded-sm p-2"
          >
            {data.messages!.length > 1 && (
              <a
                className="absolute -top-2 -left-2"
                onClick={() => {
                  updateNode(id, {
                    data: {
                      ...data,
                      messages: data.messages!.filter((s) => s.key !== msg.key),
                    },
                  });
                }}
              >
                <IoIosCloseCircle
                  size={22}
                  className="text-red-500/40 hover:text-red-500/80 duration-200 cursor-pointer"
                />
              </a>
            )}
            <NumberInput.Root
              min={0}
              max={60}
              size={"md"}
              defaultValue={msg.interval ? String(msg.interval) : "0"}
              onBlur={(e) => {
                const nextMessages = data.messages!.map((m) => {
                  if (m.key === msg.key) {
                    // @ts-expect-error
                    m.interval = Number(e.target.value);
                  }
                  return m;
                });
                updateNode(id, { data: { ...data, messages: nextMessages } });
              }}
            >
              <div className="flex w-full justify-between px-2">
                <div className="flex flex-col">
                  <NumberInput.Label fontWeight={"medium"}>
                    Segundos digitando...
                  </NumberInput.Label>
                  <span className="dark:text-white/70 text-black/50 font-light">
                    Para enviar o prox balão
                  </span>
                </div>
                <NumberInput.Input maxW={"43px"} />
              </div>
            </NumberInput.Root>

            <AutocompleteTextField
              // @ts-expect-error
              trigger={["{{"]}
              options={{ "{{": variables.map((s) => s.name) }}
              spacer={"}} "}
              type="textarea"
              placeholder="Digite sua mensagem aqui"
              defaultValue={msg.text}
              // @ts-expect-error
              onBlur={({ target }) => {
                const nextMessages = data.messages!.map((m) => {
                  if (m.key === msg.key) m.text = target.value;
                  return m;
                });
                updateNode(id, { data: { ...data, messages: nextMessages } });
              }}
            />
          </div>
        ))}

      <Button
        onClick={() => {
          updateNode(id, {
            data: {
              ...data,
              messages: [...(data.messages || []), { key: nanoid(), text: "" }],
            },
          });
        }}
        size={"sm"}
        colorPalette={"green"}
      >
        Adicionar balão
      </Button>
    </div>
  );
}

export const NodeSendTextGroup: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node Mensagem para grupo"
        description="Envia vários balões de texto para um grupo"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <HiOutlineUserGroup
                className="dark:text-teal-600 text-teal-800"
                size={31}
              />
            </div>
          ),
          name: "Grupo",
          description: "Envia texto",
        }}
      >
        <BodyNode id={id} />
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

// deu esse error quando enviou mensag no grupo
// NodeSendTextGroup
// Closing stale open session for new outgoing prekey bundle
// Closing session: SessionEntry {
//   _chains: {
//     'BXbvrqrn2aCWaRUMw5uvNHd15jF1IYmE+LMHAnmXJfhL': { chainKey: [Object], chainType: 2, messageKeys: {} },
//     'BTPsQg8zNazNdeMyN/quaN4g8gAy8QX+Xyd8/D1a0U4c': { chainKey: [Object], chainType: 2, messageKeys: {} },
//     'BbBWd2CwEKPsNkPTE9bC+6YFd5aYdD/l4WUdLrkNRv0t': { chainKey: [Object], chainType: 2, messageKeys: {} },
//     'BUKawdL/hZDDsGkUfGN4QfxAs9pw3Z953+/1dSk2oNs4': { chainKey: [Object], chainType: 1, messageKeys: {} }
//   },
//   registrationId: 1866186404,
//   currentRatchet: {
//     ephemeralKeyPair: {
//       pubKey: <Buffer 05 42 9a c1 d2 ff 85 90 c3 b0 69 14 7c 63 78 41 fc 40 b3 da 70 dd 9f 79 df ef f5 75 29 36 a0 db 38>,
//       privKey: <Buffer 08 46 bc a5 6b 12 61 eb b3 67 3b f0 1c 3b 95 5f 71 a8 65 f2 29 02 ae 2c 73 5f 05 cd f1 46 6b 55>
//     },
//     lastRemoteEphemeralKey: <Buffer 05 b0 56 77 60 b0 10 a3 ec 36 43 d3 13 d6 c2 fb a6 05 77 96 98 74 3f e5 e1 65 1d 2e b9 0d 46 fd 2d>,
//     previousCounter: 22,
//     rootKey: <Buffer b5 7e 58 03 c7 25 29 38 d4 ea c4 57 9e 3a c1 11 d5 e1 1c 5a 35 d1 f4 c8 95 7f d7 18 3e 6b d1 5f>
//   },
//   indexInfo: {
//     baseKey: <Buffer 05 db 2b b4 b5 20 d1 fe f9 de be df f1 9d 96 80 82 5a 04 ea b2 f7 80 6d e9 98 d2 b9 5f 7f 47 6f 04>,
//     baseKeyType: 1,
//     closed: -1,
//     used: 1751599625482,
//     created: 1751040412143,
//     remoteIdentityKey: <Buffer 05 75 ee 77 ad 26 cd 94 03 b9 4f f4 e5 02 79 52 5d 6d 46 52 24 db 4e a0 c5 ee d8 41 e7 11 f2 4e 32>
//   }
// }
// undefined
