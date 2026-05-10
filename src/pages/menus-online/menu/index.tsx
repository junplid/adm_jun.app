import { JSX } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import {
  TabsList,
  TabsRoot,
  TabsTrigger,
  TabsContent,
} from "@components/ui/tabs";
import { TabProducts } from "./tabs/items";
import { useParams } from "react-router-dom";
import { useGetMenuOnline } from "../../../hooks/menu-online";
import { TabConfig } from "./tabs/config";
import { FiExternalLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";

export type TypeVariable = "dynamics" | "constant" | "system";

export interface VariableRow {
  business: { name: string; id: number }[];
  type: TypeVariable;
  name: string;
  id: number;
  value: string | null;
}

export const MenuOnlinePage: React.FC = (): JSX.Element => {
  const params = useParams<{ uuid: string }>();
  const bgTabsList = useColorModeValue("#ffffff", "#1c1c1c");
  const colorTextActive = useColorModeValue("#1d1c1c", "#ededed");
  const colorTextOff = useColorModeValue("#b6b6b6", "#ededed");

  const { data, isError, isFetching } = useGetMenuOnline({
    uuid: params.uuid!,
  });

  if (isFetching) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center w-full flex-col gap-y-0.5 mt-14">
        <div className="text-lg font-bold dark:text-neutral-200 text-neutral-600">
          Cardápio digital não encontrado
        </div>
        <div className="text-sm dark:text-neutral-400 text-neutral-800">
          O cardápio que você está tentando acessar não existe ou foi excluído.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex items-center gap-x-3">
            <a
              className="text-lg flex items-center gap-x-1 font-semibold dark:text-blue-300 text-blue-600 underline"
              href={`https://menu.junplid.com.br/${data.identifier}`}
              target="_blank"
            >
              <FiExternalLink />
              {data.identifier}
            </a>
            {data.statusMenu ? (
              <>
                {data.statusNow ? (
                  <span className="text-green-400 font-extrabold flex items-center text-sm sm:text-lg">
                    Aberto
                  </span>
                ) : (
                  <div className="flex gap-x-1 items-center">
                    <span className="text-red-400 font-extrabold flex text-sm sm:text-base">
                      Fechado
                    </span>
                    {data.helperTextOpening && (
                      <span className="text-neutral-300 flex text-sm">
                        {data.helperTextOpening}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-x-1 items-center">
                <span className="dark:text-red-400 text-red-600 font-extrabold flex text-sm sm:text-base">
                  Desativado
                </span>
                <span className="dark:text-neutral-300 text-neutral-600 flex text-sm">
                  pelo ADM.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <TabsRoot
        lazyMount
        unmountOnExit
        variant={"enclosed"}
        defaultValue={"items"}
        className="w-full h-full pb-7"
      >
        <Center mb={2}>
          <TabsList
            bg={bgTabsList}
            className="w-full justify-start sm:justify-center"
            rounded="l3"
            p="1.5"
            mx={2}
          >
            <TabsTrigger
              _selected={{ bg: "bg.subtle", color: colorTextActive }}
              color={colorTextOff}
              value="items"
            >
              Items
            </TabsTrigger>
            <TabsTrigger
              _selected={{ bg: "bg.subtle", color: colorTextActive }}
              color={colorTextOff}
              value="config"
            >
              Configurações
            </TabsTrigger>
          </TabsList>
        </Center>
        <TabsContent value="items" className="flex-1 pt-0! grid h-full">
          <TabProducts uuid={params.uuid!} />
        </TabsContent>
        <TabsContent value="config">
          <TabConfig uuid={params.uuid!} />
        </TabsContent>
      </TabsRoot>
    </div>
  );
};
