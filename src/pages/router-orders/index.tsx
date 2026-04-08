"use client";

import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
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
import { FaCheck } from "react-icons/fa";

type OrderStatus = "DELIVERED" | "TO_DELIVER" | "COLLECTED" | "IN_ROUTE";

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

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: "123456",
    title: "2x X-Burger",
    status: "TO_DELIVER",
    note: "Aguardando coleta",
  },
  {
    id: "234567",
    title: "1x Pizza Calabresa",
    status: "COLLECTED",
    note: "Já lido no QR",
  },
  {
    id: "345678",
    title: "1x Açaí 500ml",
    status: "DELIVERED",
    note: "Entregue",
  },
];

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
    case "DELIVERED":
      return "Entregue";
    case "COLLECTED":
      return "Coletado";
    case "IN_ROUTE":
      return "Em rota";
    case "TO_DELIVER":
    default:
      return "A entregar";
  }
}

function statusAccent(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return { bg: "#13301c", border: "#2f7d46", label: "#a7f3c1" };
    case "COLLECTED":
      return { bg: "#1a2340", border: "#4566d4", label: "#c4d4ff" };
    case "IN_ROUTE":
      return { bg: "#2f1d09", border: "#c7791f", label: "#ffd59a" };
    case "TO_DELIVER":
    default:
      return { bg: "#262626", border: "#4b4b4b", label: "#e5e5e5" };
  }
}

export const RouterOrdersPage: React.FC<RouterOrdersPageProps> = ({
  authorized = true,
  routeInProgress = false,
  googleMapsUrl = "https://www.google.com/maps",
  initialOrders = DEFAULT_ORDERS,
}): JSX.Element => {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [deliveryCode, setDeliveryCode] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(true);
  const [pendingBatch, setPendingBatch] = useState<PendingBatch>({
    ids: [],
    labels: [],
  });
  const [sendingBatch, setSendingBatch] = useState(false);
  const [localRouteInProgress, setLocalRouteInProgress] =
    useState(routeInProgress);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const scanLockRef = useRef(false);

  const collectedCount = useMemo(
    () =>
      orders.filter((o) => o.status === "COLLECTED" || o.status === "IN_ROUTE")
        .length,
    [orders],
  );

  const pendingCount = pendingBatch.ids.length;

  const canStartRoute =
    deliveryCode.join("").length === 6 && collectedCount > 0;

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
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalRouteInProgress(routeInProgress);
  }, [routeInProgress]);

  const mockSendCollectedOrders = async (batch: PendingBatch) => {
    setSendingBatch(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setOrders((prev) =>
      prev.map((order) =>
        batch.ids.includes(order.id)
          ? {
              ...order,
              status: "COLLECTED",
              updatedAt: "Agora",
              note: "Lido no QR e enviado para a API",
            }
          : order,
      ),
    );

    setPendingBatch({ ids: [], labels: [] });
    setSendingBatch(false);
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

    setOrders((prev) => {
      const alreadyKnown = prev.some((order) => order.id === orderId);
      if (!alreadyKnown) {
        return [
          ...prev,
          {
            id: orderId,
            title: `Pedido #${orderId}`,
            status: "TO_DELIVER",
            updatedAt: "Agora",
            note: "Lido pelo QR",
          },
        ];
      }
      return prev;
    });

    const currentLabel =
      orders.find((order) => order.id === orderId)?.title ??
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

  const handleStartRoute = () => {
    if (!canStartRoute) return;

    setLocalRouteInProgress(true);
    setOrders((prev) =>
      prev.map((order) =>
        order.status === "COLLECTED"
          ? {
              ...order,
              status: "IN_ROUTE",
              updatedAt: "Agora",
              note: "Em deslocamento",
            }
          : order,
      ),
    );
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
                      Pedidos da rota
                    </Text>
                    <Text fontSize="sm" color="#A3A3A3">
                      Loja: Point do Sabor da Branca
                    </Text>
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
                  <Button
                    onClick={cameraOpen ? closeScanner : startScanner}
                    bg="#ffffff"
                    color="#111111"
                    _hover={{ bg: "#f4f4f5" }}
                    borderRadius="16px"
                    h="48px"
                    fontWeight="700"
                  >
                    {cameraOpen ? "Fechar câmera" : "Abrir câmera para ler QR"}
                  </Button>

                  <Button
                    onClick={handleStartRoute}
                    disabled={!canStartRoute}
                    bg={canStartRoute ? "#2563eb" : "#3f3f46"}
                    color="#fff"
                    _hover={{ bg: canStartRoute ? "#1d4ed8" : "#3f3f46" }}
                    borderRadius="16px"
                    h="48px"
                    fontWeight="700"
                  >
                    Iniciar rota
                  </Button>

                  <Button
                    as="a"
                    // @ts-expect-error
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    bg="#18181b"
                    color="#fff"
                    _hover={{ bg: "#27272a" }}
                    border="1px solid #2f2f2f"
                    borderRadius="16px"
                    h="48px"
                    fontWeight="700"
                  >
                    Acessar rota atualizada
                  </Button>

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
                    >
                      Código de entrega
                    </Text>

                    <Center>
                      <PinInput.Root
                        otp
                        type="numeric"
                        count={6}
                        value={deliveryCode}
                        onValueChange={(details) =>
                          setDeliveryCode(details.value)
                        }
                        onValueComplete={(details) =>
                          setDeliveryCode(details.value)
                        }
                      >
                        <PinInput.HiddenInput />
                        <PinInput.Control>
                          <Group
                            attached
                            justifyContent="space-between"
                            gap={2}
                          >
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
                  </Box>

                  <Box
                    bg="#141414"
                    border="1px solid #262626"
                    borderRadius="18px"
                    px={4}
                    py={4}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="700">
                        Pedidos
                      </Text>
                      <Text fontSize="xs" color="#A3A3A3">
                        {orders.length} total
                      </Text>
                    </HStack>

                    <Timeline.Root>
                      {orders.map((order) => {
                        const accent = statusAccent(order.status);

                        return (
                          <Timeline.Item key={order.id}>
                            <Timeline.Connector>
                              <Timeline.Separator />
                              <Timeline.Indicator
                                style={{
                                  background: accent.border,
                                  borderColor: accent.border,
                                }}
                              >
                                {order.status === "DELIVERED" && <FaCheck />}
                              </Timeline.Indicator>
                            </Timeline.Connector>

                            <Timeline.Content>
                              <Box
                                bg={accent.bg}
                                border={`1px solid ${accent.border}`}
                                borderRadius="16px"
                                px={3}
                                py={3}
                                mb={3}
                              >
                                <HStack
                                  justify="space-between"
                                  align="start"
                                  gap={3}
                                >
                                  <Box>
                                    <Timeline.Title>
                                      <Text fontSize="sm" fontWeight="800">
                                        Pedido #{order.id}
                                      </Text>
                                    </Timeline.Title>

                                    <Timeline.Description>
                                      <Text
                                        fontSize="sm"
                                        color="#D4D4D8"
                                        mt={1}
                                      >
                                        {order.title}
                                      </Text>
                                    </Timeline.Description>
                                  </Box>

                                  <Badge
                                    borderRadius="999px"
                                    px={2}
                                    py={1}
                                    bg="#111111"
                                    color={accent.label}
                                    border={`1px solid ${accent.border}`}
                                    whiteSpace="nowrap"
                                  >
                                    {statusLabel(order.status)}
                                  </Badge>
                                </HStack>

                                {order.note && (
                                  <Text fontSize="xs" color="#A3A3A3" mt={2}>
                                    {order.note}
                                  </Text>
                                )}
                              </Box>
                            </Timeline.Content>
                          </Timeline.Item>
                        );
                      })}
                    </Timeline.Root>
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
                      aponte para o QR da nota
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
