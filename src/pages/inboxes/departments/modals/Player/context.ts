import { Dispatch, SetStateAction, createContext } from "react";
import { PropsDataList, Ticket, TypeFilter } from "./provider.context";

interface PropsPlayerContext_I {
  filter: TypeFilter;
  setFilter: (value: TypeFilter) => void;
  setCountNew: Dispatch<SetStateAction<number>>;
  countNew: number;
  list: PropsDataList[];
  pick: (id: number) => Promise<void>;
  setCurrentTicket: Dispatch<SetStateAction<number | null>>;
  currentTicket: number | null;
  setDataTicket: Dispatch<SetStateAction<Ticket | null>>;
  dataTicket: Ticket | null;
  loadReturn: number | null;
  setLoadReturn: Dispatch<SetStateAction<number | null>>;
  setLoadData: Dispatch<SetStateAction<boolean>>;
  loadData: boolean;
  loadResolved: number | null;
  setLoadResolved: Dispatch<SetStateAction<number | null>>;
}

export const PlayerContext = createContext({} as PropsPlayerContext_I);
