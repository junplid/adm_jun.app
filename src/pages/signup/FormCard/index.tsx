import { Input } from "@chakra-ui/react";
import { CreditCard } from "../../../services/api/models/CreditCard";
import { CreditCardHolderInfo } from "../../../services/api/models/CreditCardHolderInfo";
import { cardMask } from "../../../utils/mask-card";
import { cardExpiryMask } from "../../../utils/mask-card-expiry";
import { cepMask } from "../../../utils/mask-cep";
import { cpfCnpjMask } from "../../../utils/mask-cpf-cnpj";

interface PropsFildsCreditCard {
  creditCardHolderInfo: CreditCardHolderInfo;
  creditCard: CreditCard & {
    previewExpiry?: string;
  };
}

interface PropsComponentFormCard_I {
  setMemoryCardInfo(e: PropsFildsCreditCard): void;
  memoryCardInfo: PropsFildsCreditCard;
  memoryAccount: any;
}

export default function ComponentFormCard({
  memoryCardInfo,
  setMemoryCardInfo,
  memoryAccount,
}: PropsComponentFormCard_I): JSX.Element {
  return (
    <div className="grid gap-4">
      <h2 className="py-2 pt-4 text-center text-lg">
        Informações do titular do cartão
      </h2>
      <label className="grid gap-y-1.5">
        <span>Nome completo</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          autoComplete="off"
          value={
            memoryCardInfo.creditCardHolderInfo?.name ?? memoryAccount.name
          }
          name="name"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCardHolderInfo: {
                ...memoryCardInfo.creditCardHolderInfo,
                [target.name]: target.value
                  .replace(/\d/g, "")
                  .replace(/\s+/g, " "),
              },
            })
          }
          type="text"
          placeholder="Seu nome completo"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>E-mail</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={
            memoryCardInfo.creditCardHolderInfo?.email ?? memoryAccount.email
          }
          name="email"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCardHolderInfo: {
                ...memoryCardInfo.creditCardHolderInfo,
                [target.name]: target.value.replace(/\s/g, ""),
              },
            })
          }
          type="text"
          placeholder="E-mail do titular"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>CPF ou CNPJ</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={
            memoryCardInfo.creditCardHolderInfo?.cpfCnpj ??
            memoryAccount.cnpj ??
            memoryAccount.cpf
          }
          name="cpfCnpj"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCardHolderInfo: {
                ...memoryCardInfo.creditCardHolderInfo,
                [target.name]: cpfCnpjMask(target.value),
              },
            })
          }
          type="text"
          maxLength={18}
          placeholder="CPF ou CNPJ"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>CEP</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={memoryCardInfo.creditCardHolderInfo?.postalCode ?? ""}
          name="postalCode"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCardHolderInfo: {
                ...memoryCardInfo.creditCardHolderInfo,
                [target.name]: cepMask(target.value),
              },
            })
          }
          type="text"
          placeholder="CEP"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>Telefone fixo</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={
            memoryCardInfo.creditCardHolderInfo?.phone ?? memoryAccount.phone
          }
          name="phone"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCardHolderInfo: {
                ...memoryCardInfo.creditCardHolderInfo,
                [target.name]: target.value.replace(/\D/, ""),
              },
            })
          }
          type="text"
          placeholder="Número com DDD"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>Número do residência</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={memoryCardInfo.creditCardHolderInfo?.addressNumber}
          name="addressNumber"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCardHolderInfo: {
                ...memoryCardInfo.creditCardHolderInfo,
                [target.name]: target.value.replace(/\D/, ""),
              },
            })
          }
          type="text"
          placeholder="Número da residência"
        />
      </label>
      <h2 className="py-2 text-center text-lg">Informações do cartão</h2>
      <label className="grid gap-y-1.5">
        <span>Nome do cartão</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={memoryCardInfo.creditCard?.holderName ?? ""}
          name="holderName"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCard: {
                ...memoryCardInfo.creditCard,
                [target.name]: target.value.replace(/\d/, "").toUpperCase(),
              },
            })
          }
          type="text"
          placeholder="Seu do cartão"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>Número do cartão</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={memoryCardInfo.creditCard?.number ?? ""}
          name="number"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCard: {
                ...memoryCardInfo.creditCard,
                [target.name]: cardMask(target.value),
              },
            })
          }
          type="text"
          placeholder="0000 0000 0000 0000"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>Data de expiração do cartão</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={memoryCardInfo.creditCard?.previewExpiry ?? ""}
          name="previewExpiry"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCard: {
                ...memoryCardInfo.creditCard,
                [target.name]: cardExpiryMask(target.value),
              },
            })
          }
          type="text"
          placeholder="MM / AA"
        />
      </label>
      <label className="grid gap-y-1.5">
        <span>Código CVC</span>
        <Input
          focusBorderColor="#f6bb0b"
          borderColor={"#3c3747"}
          value={memoryCardInfo.creditCard?.ccv ?? ""}
          name="ccv"
          onChange={({ target }) =>
            setMemoryCardInfo({
              ...memoryCardInfo,
              creditCard: {
                ...memoryCardInfo.creditCard,
                [target.name]: target.value.replace(/\D/, ""),
              },
            })
          }
          maxLength={3}
          type="text"
          placeholder="CVC"
        />
      </label>
    </div>
  );
}
