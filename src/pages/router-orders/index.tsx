"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  HStack,
  PinInput,
  Spinner,
  Stack,
  Text,
  Timeline,
  VStack,
} from "@chakra-ui/react";
import { FaCheck, FaWhatsapp } from "react-icons/fa";
import { useParams, useSearchParams } from "react-router-dom";
import {
  collectRouteOrder,
  completeRouter,
  deliveryCodeRouteOrder,
  getRouterOrders,
  joinRouterOrders,
} from "../../services/api/Orders";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { format } from "@flasd/whatsapp-formatting";
import parse from "html-react-parser";
import { IoWarningSharp } from "react-icons/io5";
import clsx from "clsx";
import { formatToBRL } from "brazilian-values";

type OrderStatus =
  | "draft"
  | "pending"
  | "processing"
  | "confirmed"
  | "completed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded"
  | "failed"
  | "on_way"
  | "ready";

type OrderItem = {
  id: string;
  title: string;
  status: OrderStatus;
  note?: string;
};

type RouterOrdersPageProps = {
  authorized?: boolean;
  routeInProgress?: boolean;
  googleMapsUrl?: string;
  initialOrders?: OrderItem[];
};

type PendingBatch = {
  ids: string[];
  labels: string[];
};

function normalizeQrValue(raw: string) {
  const value = raw.trim();

  try {
    const parsed = JSON.parse(value);
    if (parsed?.orderId) return String(parsed.orderId).trim();
    if (parsed?.id) return String(parsed.id).trim();
  } catch {
    // fallback: texto puro
  }

  return value;
}

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "completed":
      return "Entregue";
    case "on_way":
      return "Coletado";
    case "cancelled":
      return "Cacelado";
    case "confirmed":
      return "Em espera";
    case "processing":
      return "Preparando";
    case "ready":
      return "A entregar";
    case "delivered":
      return "Entregue";
    case "draft":
      return "Rascunho";
    case "failed":
      return "Falhou";
    case "pending":
      return "Pendente";
    case "refunded":
      return "Reembolsado";
    case "returned":
      return "Retornado / devolvido";
    case "shipped":
      return "Enviado";
    default:
      return "A entregar";
  }
}

function statusAccent(status: OrderStatus) {
  switch (status) {
    case "completed":
      return { bg: "#13301c", border: "#2f7d46", label: "#a7f3c1" };
    case "delivered":
      return { bg: "#13301c", border: "#2f7d46", label: "#a7f3c1" };
    case "on_way":
      return { bg: "#1a2340", border: "#4566d4", label: "#c4d4ff" };
    default:
      return { bg: "#262626", border: "#4b4b4b", label: "#e5e5e5" };
  }
}

interface DataRouter {
  router_link?: string;
  status: "open" | "awaiting_assignment" | "in_progress" | "finished";
  menu: {
    logoImg: string;
    titlePage: string | null;
    MenuInfo: {
      lat: number | null;
      lng: number | null;
    } | null;
  };
  orders: {
    router_link: string | undefined;
    completedAt: Date | null;
    contact:
      | {
          name: string | null;
          number: string | null;
        }
      | undefined;
    status:
      | "draft"
      | "pending"
      | "processing"
      | "confirmed"
      | "completed"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "returned"
      | "refunded"
      | "failed"
      | "on_way"
      | "ready";
    name: string | null;
    n_order: string;
    delivery_lat: number | null;
    delivery_lng: number | null;
    data: string;
    delivery_address: string | null;
    delivery_complement: string | null;
    delivery_reference_point: string | null;
    delivery_cep: string | null;
    delivery_number: string | null;
    total: number | undefined;
    payment_change_to: number | null;
    payment_method: string | null;
    charge_status:
      | (
          | "pending"
          | "cancelled"
          | "refunded"
          | "created"
          | "approved"
          | "authorized"
          | "in_process"
          | "in_mediation"
          | "rejected"
          | "charged_back"
          | "refused"
        )
      | undefined;
  }[];
}

export const RouterOrdersPage: React.FC<RouterOrdersPageProps> = ({
  authorized = true,
  routeInProgress = false,
}): JSX.Element => {
  const [deliveryCode, setDeliveryCode] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(true);
  const [pendingBatch, setPendingBatch] = useState<PendingBatch>({
    ids: [],
    labels: [],
  });
  const [sendingBatch, setSendingBatch] = useState(false);
  const [loadDeliveryCode, setLoadDeliveryCode] = useState(false);
  const [loadJoin, setLoadJoin] = useState(false);
  const [localRouteInProgress, setLocalRouteInProgress] =
    useState(routeInProgress);

  const [errorContainer, setErrorContainer] = useState("");
  const params = useParams<{ n_router: string; fsid: string }>();
  const [searchParams] = useSearchParams();
  const [router, setRouter] = useState<DataRouter | null>(null);
  const [manualCode, setManualCode] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const scanLockRef = useRef(false);

  const pendingCount = pendingBatch.ids.length;

  const stopCamera = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    (async () => {
      const nlid = searchParams.get("nlid");
      if (params.n_router && nlid) {
        try {
          const data_router = await getRouterOrders(params.n_router!, { nlid });
          setRouter(data_router);
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
              const dataError = error.response?.data as ErrorResponse_I;
              if (dataError.toast.length)
                dataError.toast.forEach(toaster.create);
              if (dataError.container) setErrorContainer(dataError.container);
            }
          }
        }
      }
    })();

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    setLocalRouteInProgress(routeInProgress);
  }, [routeInProgress]);

  const mockSendCollectedOrders = async (batch: PendingBatch) => {
    setSendingBatch(true);
    for await (const n_order of batch.ids) {
      await handleCollectRouteOrder(n_order);
    }
    setPendingBatch({ ids: [], labels: [] });
    setSendingBatch(false);
    closeScanner();
  };

  const scheduleDebounceSend = (nextBatch: PendingBatch) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      if (!nextBatch.ids.length) return;
      await mockSendCollectedOrders(nextBatch);
    }, 5000);
  };

  const queueQrOrder = (rawValue: string) => {
    const orderId = normalizeQrValue(rawValue);
    if (!orderId) return;

    const currentLabel =
      router?.orders.find((order) => order.n_order === orderId)?.name ??
      `Pedido #${orderId}`;

    setPendingBatch((prev) => {
      if (prev.ids.includes(orderId)) return prev;

      const next = {
        ids: [...prev.ids, orderId],
        labels: [...prev.labels, currentLabel],
      };

      scheduleDebounceSend(next);
      return next;
    });
  };

  const startScanner = async () => {
    try {
      setCameraOpen(true);

      if (!("BarcodeDetector" in window)) {
        setScannerSupported(false);
        return;
      }

      setScannerSupported(true);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      const detector = new (
        window as typeof window & {
          BarcodeDetector: new (options: { formats: string[] }) => {
            detect: (
              source: HTMLVideoElement,
            ) => Promise<Array<{ rawValue: string }>>;
          };
        }
      ).BarcodeDetector({ formats: ["qr_code"] });

      const tick = async () => {
        if (!videoRef.current || scanLockRef.current) {
          rafRef.current = window.requestAnimationFrame(tick);
          return;
        }

        try {
          const barcodes = await detector.detect(videoRef.current);
          const rawValue = barcodes?.[0]?.rawValue;

          if (rawValue) {
            scanLockRef.current = true;
            queueQrOrder(rawValue);

            if (navigator.vibrate) navigator.vibrate(60);

            window.setTimeout(() => {
              scanLockRef.current = false;
            }, 1800);
          }
        } catch {
          // deixa silencioso para não travar a câmera
        }

        rafRef.current = window.requestAnimationFrame(tick);
      };

      rafRef.current = window.requestAnimationFrame(tick);
    } catch {
      setCameraOpen(false);
      stopCamera();
    }
  };

  const closeScanner = () => {
    setCameraOpen(false);
    stopCamera();
  };

  const handleManualCodeComplete = (value: string[]) => {
    const code = value.join("").trim();

    if (code.length !== 6) return;

    queueQrOrder(code);

    setManualCode([]); // limpa corretamente
  };

  const handleJoinRoute = async () => {
    // setLocalRouteInProgress(true);
    try {
      setLoadJoin(true);
      const nlid = searchParams.get("nlid");
      if (params.n_router && params.fsid && nlid) {
        const response = await joinRouterOrders(params.n_router, {
          nlid,
          fsid: Number(params.fsid),
        });
        setRouter((s) =>
          s
            ? {
                ...s,
                router_link: response.router_link,
                status: response.status,
              }
            : null,
        );
        toaster.create({
          title: "Sucesso",
          type: "success",
          description: "Rota atribuída 🚀",
        });
      }
      setLoadJoin(false);
    } catch (error) {
      setLoadJoin(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.container) setErrorContainer(dataError.container);
        }
      }
    }
  };

  const handleCollectRouteOrder = async (n_order: string) => {
    try {
      // setLoadJoin(true);
      const nlid = searchParams.get("nlid");
      if (params.n_router && params.fsid && nlid) {
        const response = await collectRouteOrder(params.n_router, n_order, {
          nlid,
        });
        setRouter((s) =>
          s
            ? {
                ...s,
                orders: s.orders.map((d) => {
                  if (d.n_order === n_order) d.status = response.status;
                  return d;
                }),
              }
            : null,
        );
      }
      // setLoadJoin(false);
    } catch (error) {
      // setLoadJoin(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.container) setErrorContainer(dataError.container);
        }
      }
    }
  };

  const handleDeliveryCodeRouteOrder = async (delivery_code: string) => {
    try {
      setLoadDeliveryCode(true);
      const nlid = searchParams.get("nlid");
      if (params.n_router && params.fsid && nlid) {
        const response = await deliveryCodeRouteOrder(
          params.n_router,
          delivery_code,
          { nlid },
        );
        setRouter((s) => {
          if (!s) return null;
          const nextOrders = s.orders.map((d) => {
            if (d.n_order === response.n_order) d.status = response.status;
            return d;
          });
          if (
            nextOrders.every(
              (d) => d.status === "completed" || d.status === "delivered",
            )
          ) {
            handleCompleteRouter();
          }
          s.orders = nextOrders;
          return s;
        });
        setDeliveryCode([]);
      }
      setLoadDeliveryCode(false);
    } catch (error) {
      setLoadDeliveryCode(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.container) setErrorContainer(dataError.container);
        }
      }
    }
  };

  const handleCompleteRouter = async () => {
    try {
      const nlid = searchParams.get("nlid");
      if (params.n_router && nlid) {
        const response = await completeRouter(params.n_router, { nlid });
        setRouter((s) => (s ? { ...s, status: response.status } : null));
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.container) setErrorContainer(dataError.container);
        }
      }
    }
  };

  return (
    <div className="bg-[#111111] text-[#F5F5F5]">
      <Box
        minH="100svh"
        w="100%"
        maxW="500px"
        mx="auto"
        px={4}
        py={4}
        pb={28}
        position="relative"
      >
        <VStack gap={3} align="stretch">
          {errorContainer && (
            <Box
              border="1px solid #7f1d1d"
              bg="#2a1111"
              borderRadius="20px"
              px={4}
              py={4}
            >
              <Text fontSize="sm" fontWeight="700" color="#fecaca">
                Error interno.
              </Text>
              <Text fontSize="sm" color="#fca5a5" mt={1}>
                {errorContainer}
              </Text>
            </Box>
          )}
          {!authorized ? (
            <Box
              border="1px solid #7f1d1d"
              bg="#2a1111"
              borderRadius="20px"
              px={4}
              py={4}
            >
              <Text fontSize="sm" fontWeight="700" color="#fecaca">
                Não autorizado
              </Text>
              <Text fontSize="sm" color="#fca5a5" mt={1}>
                Você não tem permissão para acessar esta rota.
              </Text>
            </Box>
          ) : (
            <>
              {localRouteInProgress && (
                <Box
                  border="1px solid #854d0e"
                  bg="#2a1a0b"
                  borderRadius="20px"
                  px={4}
                  py={4}
                >
                  <Text fontSize="sm" fontWeight="700" color="#fde68a">
                    Você já tem uma rota em andamento
                  </Text>
                  <Text fontSize="sm" color="#fbbf24" mt={1}>
                    Continue a rota atual ou finalize antes de iniciar outra.
                  </Text>
                </Box>
              )}

              <Box
                border="1px solid #2c2c2c"
                bg="#171717"
                borderRadius="24px"
                px={4}
                py={4}
                boxShadow="0 8px 24px rgba(0,0,0,0.25)"
              >
                <HStack justify="space-between" align="start" mb={3}>
                  <Box>
                    <Text fontSize="lg" fontWeight="800">
                      Pedidos da rota ({params.n_router || ""})
                    </Text>
                    {router?.menu.titlePage && (
                      <Text fontSize="sm" color="#A3A3A3">
                        {router.menu.titlePage}
                      </Text>
                    )}
                  </Box>

                  <Badge
                    borderRadius="999px"
                    px={3}
                    py={1}
                    bg={pendingCount > 0 ? "#1f2937" : "#262626"}
                    color="#E5E7EB"
                  >
                    {pendingCount > 0
                      ? `${pendingCount} pendente(s)`
                      : "0 pendências"}
                  </Badge>
                </HStack>

                <Stack gap={3}>
                  {!(
                    router?.status === "finished" ||
                    router?.orders.every(
                      (o) =>
                        o.status === "delivered" || o.status === "completed",
                    )
                  ) && (
                    <Button
                      onClick={cameraOpen ? closeScanner : startScanner}
                      bg="#ffffff"
                      color="#111111"
                      _hover={{ bg: "#f4f4f5" }}
                      borderRadius="16px"
                      h="48px"
                      fontWeight="700"
                      disabled={!router || router.status !== "in_progress"}
                    >
                      {cameraOpen ? "Fechar câmera" : "Coletar pedido"}
                    </Button>
                  )}

                  <Button
                    onClick={handleJoinRoute}
                    disabled={!router}
                    bg={"#356923"}
                    color="#fff"
                    _hover={{ bg: "#43812e" }}
                    borderRadius="16px"
                    h="48px"
                    fontWeight="700"
                    hidden={router?.status !== "awaiting_assignment"}
                    loading={loadJoin}
                  >
                    Aceitar rota
                  </Button>

                  {!(
                    router?.status === "finished" ||
                    router?.orders.every(
                      (o) =>
                        o.status === "delivered" || o.status === "completed",
                    )
                  ) && (
                    <Button
                      as="a"
                      // @ts-expect-error
                      href={router?.router_link}
                      target="_blank"
                      rel="noreferrer"
                      bg="#18181b"
                      color="#fff"
                      _hover={{ bg: "#27272a" }}
                      border="1px solid #2f2f2f"
                      borderRadius="16px"
                      h="48px"
                      fontWeight="700"
                      disabled={!router}
                    >
                      Acessar rota atualizada
                    </Button>
                  )}

                  {router?.status === "finished" ||
                  router?.orders.every(
                    (o) => o.status === "delivered" || o.status === "completed",
                  ) ? (
                    <Box
                      bg="#bbdbac"
                      border="1px solid #abdea7"
                      borderRadius="18px"
                      px={4}
                      py={4}
                      className="flex flex-col justify-center"
                    >
                      <Text
                        fontSize="sm"
                        className="text-center"
                        fontWeight="700"
                        opacity={!router ? 0.4 : 1}
                        color={"#142f05"}
                      >
                        ROTA CONCLUÍDA 🎉
                      </Text>
                    </Box>
                  ) : (
                    <Box
                      bg="#141414"
                      border="1px solid #262626"
                      borderRadius="18px"
                      px={4}
                      py={4}
                      className="flex flex-col justify-center"
                    >
                      <Text
                        fontSize="sm"
                        className="text-center"
                        fontWeight="700"
                        mb={2}
                        opacity={
                          !router || router.status === "awaiting_assignment"
                            ? 0.4
                            : 1
                        }
                      >
                        Código de entrega
                      </Text>

                      <Center>
                        {!loadDeliveryCode ? (
                          <PinInput.Root
                            otp
                            type="numeric"
                            count={4}
                            value={deliveryCode}
                            onValueChange={(details) =>
                              setDeliveryCode(details.value)
                            }
                            onValueComplete={(details) => {
                              setDeliveryCode(details.value);
                              handleDeliveryCodeRouteOrder(
                                details.value.join(""),
                              );
                            }}
                            disabled={
                              !router || router.status === "awaiting_assignment"
                            }
                          >
                            <PinInput.HiddenInput />
                            <PinInput.Control>
                              <Group
                                attached
                                justifyContent="space-between"
                                gap={2}
                              >
                                {Array.from({ length: 4 }).map((_, index) => (
                                  <PinInput.Input
                                    key={index}
                                    index={index}
                                    style={{
                                      width: "40px",
                                      height: "48px",
                                      borderRadius: "14px",
                                      background: "#0f0f0f",
                                      border: "1px solid #2f2f2f",
                                      color: "#fff",
                                      fontSize: "18px",
                                      fontWeight: 700,
                                    }}
                                  />
                                ))}
                              </Group>
                            </PinInput.Control>
                          </PinInput.Root>
                        ) : (
                          <Spinner />
                        )}
                      </Center>
                    </Box>
                  )}

                  <Box
                    bg="#141414"
                    border="1px solid #262626"
                    borderRadius="18px"
                    px={4}
                    py={4}
                  >
                    {router?.orders.length ? (
                      <>
                        {router.status === "in_progress" &&
                          !router.orders.every(
                            (o) =>
                              o.status === "on_way" || o.status === "completed",
                          ) && (
                            <Box
                              border="1px solid #854d0e"
                              bg="#2a1a0b"
                              borderRadius="20px"
                              px={4}
                              py={4}
                              mb={3}
                            >
                              <div className="flex items-center gap-x-1.5">
                                <IoWarningSharp color="#fde68a" size={20} />
                                <Text
                                  fontSize="sm"
                                  fontWeight="700"
                                  color="#fde68a"
                                >
                                  Atenção
                                </Text>
                              </div>
                              <Text fontSize="sm" color="#fbbf24" mt={1}>
                                Colete todos os pedidos para iniciar sua rota
                              </Text>
                            </Box>
                          )}

                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="700">Pedidos</Text>
                          <Text color="#A3A3A3">
                            {router?.orders.length} total
                          </Text>
                        </HStack>

                        <Timeline.Root>
                          {router.orders.map((order) => {
                            const accent = statusAccent(order.status);

                            return (
                              <Timeline.Item key={order.n_order}>
                                <Timeline.Connector>
                                  <Timeline.Separator />
                                  <Timeline.Indicator
                                    style={{
                                      background: accent.border,
                                      borderColor: accent.border,
                                    }}
                                  >
                                    {(order.status === "completed" ||
                                      order.status === "delivered") && (
                                      <FaCheck />
                                    )}
                                  </Timeline.Indicator>
                                </Timeline.Connector>

                                <Timeline.Content>
                                  <BoxItemOrder
                                    finish={
                                      router.status === "finished" ||
                                      router?.orders.every(
                                        (o) =>
                                          o.status === "delivered" ||
                                          o.status === "completed",
                                      )
                                    }
                                    accent={accent}
                                    {...order}
                                  />
                                </Timeline.Content>
                              </Timeline.Item>
                            );
                          })}
                        </Timeline.Root>
                      </>
                    ) : (
                      <HStack justify="center" my={3}>
                        <Text>Pedidos não encontrados!</Text>
                      </HStack>
                    )}
                  </Box>

                  {pendingCount > 0 && (
                    <Box
                      bg="#101828"
                      border="1px solid #334155"
                      borderRadius="18px"
                      px={4}
                      py={3}
                    >
                      <HStack justify="space-between">
                        <Box>
                          <Text fontSize="sm" fontWeight="700">
                            QR lido, aguardando debounce
                          </Text>
                          <Text fontSize="xs" color="#cbd5e1">
                            Esses pedidos serão enviados em 5 segundos sem novas
                            leituras.
                          </Text>
                        </Box>
                        {sendingBatch ? (
                          <Spinner size="sm" />
                        ) : (
                          <Badge>pendente</Badge>
                        )}
                      </HStack>

                      <Stack gap={1} mt={3}>
                        {pendingBatch.labels.map((label, index) => (
                          <Text
                            key={`${label}-${index}`}
                            fontSize="xs"
                            color="#e2e8f0"
                          >
                            • {label}
                          </Text>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </VStack>
        {cameraOpen && (
          <Box
            position="fixed"
            inset={0}
            bg="rgba(0,0,0,0.92)"
            zIndex={50}
            px={4}
            py={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              w="100%"
              maxW="420px"
              borderRadius="24px"
              bg="#121212"
              border="1px solid #2d2d2d"
              overflow="hidden"
              boxShadow="0 16px 40px rgba(0,0,0,0.45)"
            >
              <Box px={4} py={3} borderBottom="1px solid #242424">
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="800">
                      Câmera do QR
                    </Text>
                    <Text fontSize="xs" color="#a3a3a3">
                      Aponte para o QR da nota ou digite o Código do pedido
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    onClick={closeScanner}
                    bg="#262626"
                    color="#fff"
                    borderRadius="12px"
                  >
                    Fechar
                  </Button>
                </HStack>
              </Box>

              {!scannerSupported ? (
                <Box px={4} py={8} textAlign="center">
                  <Text fontSize="sm" color="#fca5a5" fontWeight="700">
                    Este navegador não expõe detector de QR nativo.
                  </Text>
                  <Text fontSize="xs" color="#A3A3A3" mt={2}>
                    Troque o scanner por uma biblioteca dedicada sem mexer no
                    restante da tela.
                  </Text>
                </Box>
              ) : (
                <Box p={3}>
                  <Box
                    borderRadius="20px"
                    overflow="hidden"
                    border="1px solid #2a2a2a"
                    bg="#000"
                    aspectRatio="3 / 4"
                  >
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>

                  <Text fontSize="xs" color="#A3A3A3" mt={3} textAlign="center">
                    Quando o QR for detectado, ele entra em debounce de 5
                    segundos antes de enviar.
                  </Text>
                </Box>
              )}

              <Box
                mt={4}
                bg="#151515"
                borderTop="1px solid #262626"
                borderRadius="18px"
                px={4}
                py={4}
              >
                <Text
                  fontSize="sm"
                  className="text-center"
                  fontWeight="700"
                  mb={2}
                  opacity={
                    !router || router.status === "awaiting_assignment" ? 0.4 : 1
                  }
                >
                  Ou digite o código do pedido
                </Text>

                <Center>
                  <PinInput.Root
                    otp
                    type="numeric"
                    count={6}
                    value={manualCode}
                    onValueChange={(details) => setManualCode(details.value)}
                    onValueComplete={(details) =>
                      handleManualCodeComplete(details.value)
                    }
                    disabled={
                      !router || router.status === "awaiting_assignment"
                    }
                  >
                    <PinInput.HiddenInput />
                    <PinInput.Control>
                      <Group attached justifyContent="space-between" gap={2}>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <PinInput.Input
                            key={index}
                            index={index}
                            style={{
                              width: "40px",
                              height: "48px",
                              borderRadius: "14px",
                              background: "#0f0f0f",
                              border: "1px solid #2f2f2f",
                              color: "#fff",
                              fontSize: "18px",
                              fontWeight: 700,
                            }}
                          />
                        ))}
                      </Group>
                    </PinInput.Control>
                  </PinInput.Root>
                </Center>

                <Text fontSize="xs" color="#A3A3A3" mt={3} textAlign="center">
                  Ao completar os 6 dígitos, o pedido entra na fila
                  automaticamente.
                </Text>
              </Box>
            </Box>
          </Box>
        )}
        {pendingCount > 0 && (
          <Box
            position="fixed"
            left="50%"
            bottom="22px"
            transform="translateX(-50%)"
            zIndex={60}
            pointerEvents="none"
          >
            <HStack
              gap={3}
              px={4}
              py={3}
              borderRadius="999px"
              bg="rgba(17,17,17,0.95)"
              border="1px solid #334155"
              boxShadow="0 10px 30px rgba(0,0,0,0.45)"
            >
              <Spinner size="sm" />
              <Text fontSize="sm" fontWeight="700">
                {pendingCount}{" "}
                {pendingCount === 1
                  ? "execução pendente"
                  : "execuções pendentes"}
              </Text>
            </HStack>
          </Box>
        )}
      </Box>
    </div>
  );
};

function BoxItemOrder({
  accent,
  finish,
  ...order
}: {
  finish: boolean;
  accent: {
    bg: string;
    border: string;
    label: string;
  };
} & DataRouter["orders"][0]) {
  return (
    <Box
      bg={accent.bg}
      border={`1px solid ${accent.border}`}
      borderRadius="16px"
      px={3}
      py={3}
      mb={3}
    >
      <HStack justify="space-between" align="center" gap={3}>
        <div className="flex flex-col gap-y-0.5">
          <Timeline.Title fontSize={"medium"}>
            <Text fontWeight="800" className="tracking-wider">
              #{order.n_order}
            </Text>
          </Timeline.Title>

          <Timeline.Description fontSize={"medium"}>
            <a
              href={finish ? undefined : ``}
              target={finish ? undefined : "_blank"}
              className={clsx(
                "flex items-center gap-x-1",
                !finish && "text-green-400! underline",
              )}
            >
              {!finish && <FaWhatsapp size={16} />}
              <Text>{order.name}</Text>
            </a>
          </Timeline.Description>
        </div>

        <Badge
          borderRadius="8px"
          px={3}
          py={2}
          bg="#111111"
          color={accent.label}
          border={`1px solid ${accent.border}`}
          whiteSpace="nowrap"
        >
          {statusLabel(order.status)}
        </Badge>
      </HStack>

      {order.data && (
        <p className="leading-4 pt-3 text-[#A3A3A3]">
          {parse(format(order.data))}
        </p>
      )}

      <div className="flex flex-col gap-y-0.5 mt-3 items-start">
        {order.delivery_cep && (
          <div className="text-sm flex items-center space-x-0.5">
            <span className=" text-neutral-400">Cep</span>
            <span className="w-full leading-3.5">{order.delivery_cep}</span>
          </div>
        )}
        {order.delivery_address && (
          <div className="text-sm flex gap-x-2">
            <span className=" text-neutral-400">Endereço</span>
            <span className="w-full">{order.delivery_address}</span>
          </div>
        )}
        {order.delivery_address && (
          <div className="text-sm flex gap-x-1.5">
            <span className=" text-neutral-400">Número</span>
            <span className="w-full">{order.delivery_number}</span>
          </div>
        )}

        {order.delivery_reference_point && (
          <span className=" bg-amber-300/30 mt-1 px-0.5">
            "{order.delivery_reference_point}"
          </span>
        )}
        {order.delivery_complement && (
          <div className="text-sm flex flex-col -space-y-0.5">
            <span className="text-xs text-neutral-400">Complemento</span>
            <span className="w-full leading-3.5">
              {order.delivery_complement}
            </span>
          </div>
        )}
      </div>

      <div className="w-full mt-4 text-sm">
        {/* Pagamento */}
        <div className="space-y-1">
          <div className="flex justify-between text-gray-400">
            <span>Forma de pagamento</span>
            <span className="text-white font-medium">
              {order.payment_method}
            </span>
          </div>

          {order.payment_change_to && (
            <div className="flex justify-between text-gray-400">
              <span>Troco para</span>
              <span className="text-white font-medium">
                {formatToBRL(order.payment_change_to)}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        {order.total && (
          <>
            <div className="my-2 border-t border-gray-700" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 font-semibold">Total</span>
              <span className="text-green-400 text-xl font-bold">
                {formatToBRL(order.total)}{" "}
                {order.charge_status === "approved" ||
                  (order.charge_status === "authorized" && (
                    <span className="text-sm text-green-600">
                      (JÁ ESTÁ PAGO)
                    </span>
                  ))}
              </span>
            </div>
          </>
        )}

        {/* Troco */}
        {order.payment_change_to && order.total && (
          <div className="flex justify-between text-gray-400">
            <span>Troco</span>
            <span className="text-white font-medium">
              {formatToBRL(order.payment_change_to - order.total)}
            </span>
          </div>
        )}
      </div>
    </Box>
  );
}
