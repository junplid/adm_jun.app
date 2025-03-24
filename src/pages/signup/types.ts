export type TypeAccount = "professional" | "personal";

export interface PropsMemoryAccount_I {
  planId?: number;
  periodId?: number;
  price?: string;
  coupon?: string;
  contact_account?: {
    phone_number?: string;
    mobile_number?: string;
    postal_code?: string;
    address?: string;
    number?: string;
  };
  payment_info?: {
    name_card?: string;
    number_card?: string;
    code_of_security?: number;
    cpf_cnpj?: string;
    view_expiry?: string;
    expiry?: {
      month?: string;
      year?: string;
    };
  };
}

export type TypePayment_T = "card" | "pix" | "ticket";
