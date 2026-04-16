import { Dispatch, JSX, SetStateAction, useContext, useState } from "react";
import { Button } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
} from "@components/ui/dialog";
import { AuthContext } from "@contexts/auth.context";
import { BiMapAlt } from "react-icons/bi";
import { DeliveryPoint, RouteMapComponent } from "../map";
import { Order } from "..";

interface IProps {
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
  points: DeliveryPoint[];
  setOrders: Dispatch<
    SetStateAction<{
      [x: string]: Order[];
    }>
  >;
}

export function ModalMapOrders({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const { clientMeta } = useContext(AuthContext);
  const storeLocation = { lat: -12.866794, lng: -38.433892 };
  const [open, setOpen] = useState(false);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
      size={"xl"}
      preventScroll={false}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent backdrop mx={2}>
        <DialogHeader flexDirection={"column"} pt={3} pl={4} gap={0}>
          <DialogTitle className="flex items-center gap-x-1">
            <BiMapAlt size={20} /> <span>Mapa de pedidos</span>
          </DialogTitle>
        </DialogHeader>
        <DialogBody
          mx={0}
          mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
          px={clientMeta.isMobileLike ? 5 : undefined}
        >
          <div className="flex gap-4 h-[calc(100vh-300px)] flex-1">
            {/* <div className="max-w-xs w-full">
              <Text fontSize="xl" fontWeight="bold" mb={1}>
                Gerenciamento de Rotas
              </Text>

              {routes.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  Nenhuma rota criada. Clique em um pino cinza no mapa para
                  iniciar uma rota.
                </Text>
              ) : (
                <VStack align="stretch" gap={3} mt={3}>
                  {routes.map((route) => (
                    <HStack
                      key={route.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="white"
                      justify="space-between"
                      shadow="sm"
                    >
                      <HStack gap={3}> 
                        <div
                          style={{ backgroundColor: route.color }}
                          className="w-4 h-4 rounded-full"
                        />
                        <Text fontWeight="semibold">{route.name}</Text>
 
                        <Text fontSize="sm" color="gray.500">
                          {
                            props.points.filter((p) => p.n_order === route.id)
                              .length
                          }
                        </Text>
                      </HStack>
                      <Badge
                        colorScheme={
                          route.status === "Concluída" ? "green" : "orange"
                        }
                      >
                        {route.status}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              )}
            </div> */}

            {/* COMPONENTE DO MAPA */}
            <RouteMapComponent
              storeLocation={storeLocation}
              points={props.points}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
