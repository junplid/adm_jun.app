import { TKeyNames } from ".";

interface UserDataInputs {
  keyName: TKeyNames;
  labelName: string;
  description?: string;
}

export const dataInputs: UserDataInputs[] = [
  { keyName: "userFirstName", labelName: "Nome do usuário" },
  { keyName: "userLastName", labelName: "Sobrenome do usuário" },
  { keyName: "userEmail", labelName: "E-mail" },
  { keyName: "userCity", labelName: "Cidade" },
  { keyName: "userState", labelName: "Estado" },
  { keyName: "userCountry", labelName: "País" },
  { keyName: "userDateOfBirth", labelName: "Data de nascimento" },
  { keyName: "userGender", labelName: "Gênero" },
  { keyName: "userDobd", labelName: "Dia de nascimento" },
  { keyName: "userDobm", labelName: "Mês de nascimento" },
  { keyName: "userDoby", labelName: "Ano de nascimento" },
  { keyName: "userZip", labelName: "CEP" },
  { keyName: "customContentCategory", labelName: "Categoria do conteúdo" },
  { keyName: "customContentName", labelName: "Nome do conteúdo" },
  { keyName: "customContentType", labelName: "Tipo do conteúdo" },
  { keyName: "customCurrency", labelName: "Tipo de moeda" },
  { keyName: "customMethod", labelName: "Tipo do método" },
  { keyName: "customStatus", labelName: "Status do pagamento" },
  { keyName: "customValue", labelName: "Valor / Preço / Total" },
];
