import { createContext, Dispatch, SetStateAction } from "react";

export interface IClienteMeta {
  platform: "android" | "ios" | "desktop";
  isMobile: boolean;
  isPWA: boolean;
  isTouch: boolean;
  isSmallScreen: boolean;
  isMobileLike: boolean;
}

export interface Account {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  onboarded: boolean;
  isPremium: boolean;
  uuid: string;
  businessId: number;
}

export interface IFlowContextProps {
  account: Account;
  clientMeta: IClienteMeta;
  setAccount: Dispatch<SetStateAction<Account>>;
  logout(): void;
}

export const AuthContext = createContext({} as IFlowContextProps);
