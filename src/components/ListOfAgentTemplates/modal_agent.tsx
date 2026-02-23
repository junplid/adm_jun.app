import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@components/ui/dialog";
import { useCallback, JSX, useContext, useState, useEffect, FC } from "react";
import { Button } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import { AuthContext } from "@contexts/auth.context";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { getAgentTemplate } from "../../services/api/AgentTemplate";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import moment from "moment";
import { useDialogModal } from "../../hooks/dialog.modal";
import { FormSectionsComponent } from "./form_sections";
import { DigitizingChatComponent } from "@components/DigitizingChat";
import { DemoChatComponent } from "@components/DemoChat";
import clsx from "clsx";

interface PropsModalDelete {
  id: number;
  title: string;
}

interface Template {
  title: string;
  markdown_desc: string;
  created_by: string;
  updateAt: Date;
  createAt: Date;
  chat_demo: (
    | {
        type: "lead" | "ia";
        value: string;
      }
    | {
        type: "sleep";
        sleep: number;
      }
  )[];
}

export interface Section {
  id: number;
  name: string;
  title: string;
  collapsible: boolean;
  desc?: string;
  inputs: {
    id: number;
    name: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    helperText?: string;
    required?: boolean;
    type?: string;
  }[];
}

export const ModalAgentTemplate: FC<PropsModalDelete> = ({
  id,
  title,
}): JSX.Element => {
  const { clientMeta, logout } = useContext(AuthContext);
  const [execNow, setExecNow] = useState<boolean>(false);
  const [template, setTemplate] = useState<null | Template>(null);
  const [load, setLoad] = useState<boolean>(false);
  const [loadSections, setLoadSections] = useState<boolean>(false);
  const { dialog: DialogModal, onOpen } = useDialogModal({});

  const [sections, setSections] = useState<null | Section[]>(null);

  const handleVisibilityChange = useCallback((inView: boolean) => {
    setExecNow(inView);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAgentTemplate(
          id,
          "title,markdown_desc,created_by,updateAt,createAt,chat_demo",
        );
        setTemplate(data);
        setLoad(true);
      } catch (error) {
        setLoad(true);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      }
    })();
  }, [id]);

  const getSections = useCallback(async () => {
    try {
      setLoadSections(true);
      const data = await getAgentTemplate(
        id,
        "Sections{id,name,title,collapsible,desc,inputs}",
      );
      setSections(data?.Sections);
      setLoadSections(false);
    } catch (error) {
      setLoadSections(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
    }
  }, [id]);

  return (
    <DialogContent autoFocus={false} w={"1860px"} mx={2} backdrop>
      <DialogHeader flexDirection={"column"} gap={0} pb={0}>
        <DialogTitle>
          <span className="text-lg font-light">Template</span>
        </DialogTitle>
      </DialogHeader>
      <DialogBody
        mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
        px={clientMeta.isMobileLike ? 2 : undefined}
        w={"full"}
      >
        {!load && <span>Carregando...</span>}
        {load && !template && (
          <span className="text-red-400">Template não encontrado.</span>
        )}
        {load && template && (
          <div className="">
            <div className="flex flex-col">
              <h1 className="font-bold text-xl">{title}</h1>
              <span className="text-sm mt-1 font-medium">
                Criado por: {template.created_by}
              </span>
              <span className="text-neutral-500 font-light">
                {moment(template.createAt).format("DD/MM/YYYY")}
              </span>
            </div>
            <div className="h-0.5 w-full bg-neutral-800 my-5"></div>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {template.markdown_desc}
            </ReactMarkdown>

            <div className="flex flex-col w-full my-10">
              <div
                className={clsx(
                  execNow && "border border-neutral-600 overflow-hidden",
                  "rounded-4xl mx-auto max-w-sm w-full bg-neutral-400/10",
                )}
              >
                <DemoChatComponent
                  active={execNow}
                  ismodal
                  onVisibilityChange={(inView) =>
                    handleVisibilityChange(inView)
                  }
                  list={template.chat_demo}
                />
              </div>
              <span className="mt-1 block text-center text-neutral-400">
                Demostração*
              </span>
            </div>

            {!!sections?.length && (
              <FormSectionsComponent id={id} sections={sections} />
            )}

            {!sections?.length && (
              <div className="flex justify-center mt-3">
                <Button
                  loading={loadSections}
                  onClick={() => {
                    getSections();
                  }}
                >
                  Usar este template
                </Button>
              </div>
            )}
            <p className="text-sm text-gray-500 text-center mt-5">
              Ao utilizar este template, o usuário declara estar ciente de que é
              o único e exclusivo responsável pelo conteúdo das mensagens
              enviadas e pelas decisões tomadas com base nas respostas geradas
              por Inteligência Artificial. A Junplid não se responsabiliza por
              danos, prejuízos, interpretações, omissões, uso indevido ou
              quaisquer consequências decorrentes da utilização do conteúdo
              gerado.
            </p>
          </div>
        )}
        {DialogModal}
      </DialogBody>
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
