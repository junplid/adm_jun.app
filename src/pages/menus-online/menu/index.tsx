import { JSX, useContext } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { LayoutWorkbenchPageContext } from "../contexts";
import {
  TabsList,
  TabsRoot,
  TabsTrigger,
  TabsContent,
} from "@components/ui/tabs";
import { TabProducts } from "./tabs/items";
import { useParams } from "react-router-dom";
import { useGetMenuOnline } from "../../../hooks/menu-online";

export type TypeVariable = "dynamics" | "constant" | "system";

export interface VariableRow {
  business: { name: string; id: number }[];
  type: TypeVariable;
  name: string;
  id: number;
  value: string | null;
}

export const MenuOnlinePage: React.FC = (): JSX.Element => {
  const { ToggleMenu } = useContext(LayoutWorkbenchPageContext);
  const params = useParams<{ uuid: string }>();

  const { data, isError, isFetching } = useGetMenuOnline({
    uuid: params.uuid!,
  });

  if (isFetching) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center w-full flex-col gap-y-0.5 mt-14">
        <div className="text-lg font-bold text-gray-500 dark:text-gray-200">
          Cardápio on-line não encontrado
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-400">
          O cardápio que você está tentando acessar não existe ou foi excluído.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex items-center gap-x-2">
            {ToggleMenu}
            <h1 className="text-lg font-semibold">{data.identifier}</h1>
            <p className="text-white/60 font-light">{data.desc}</p>
          </div>
        </div>
      </div>
      <TabsRoot
        lazyMount
        unmountOnExit
        variant={"enclosed"}
        defaultValue={"metrics"}
        className="w-full h-full pb-7"
      >
        <Center mb={2}>
          <TabsList
            bg="#1c1c1c"
            className="w-full justify-center"
            rounded="l3"
            p="1.5"
          >
            <TabsTrigger
              _selected={{ bg: "bg.subtle", color: "#fff" }}
              color={"#757575"}
              value="metrics"
            >
              Métricas
            </TabsTrigger>
            <TabsTrigger
              _selected={{ bg: "bg.subtle", color: "#fff" }}
              color={"#757575"}
              value="items"
            >
              Items
            </TabsTrigger>
            <TabsTrigger
              _selected={{ bg: "bg.subtle", color: "#fff" }}
              color={"#757575"}
              value="orders"
            >
              Pedidos
            </TabsTrigger>
            <TabsTrigger
              _selected={{ bg: "bg.subtle", color: "#fff" }}
              color={"#757575"}
              value="config"
            >
              Configurações
            </TabsTrigger>
          </TabsList>
        </Center>
        <TabsContent value="metrics">
          <div className="mt-20 flex flex-col text-sm text-center text-white/70">
            <span>Estamos construindo algo melhor.</span>
            <span className="text-white text-base">
              Em breve, métricas profundas e mais inteligentes.
            </span>
          </div>
        </TabsContent>
        <TabsContent value="items" className="flex-1 !pt-0 grid h-full">
          <TabProducts />
        </TabsContent>
        <TabsContent value="config">aba de configurações</TabsContent>
      </TabsRoot>
    </div>
  );
};
