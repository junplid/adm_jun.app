import { create } from "zustand";

type StatusSync = "load" | "save" | "error" | "hidden";

type syncState = {
  load: StatusSync;
  setLoad: (vl: StatusSync) => void;
};

const useSyncLoadStore = create<syncState>((set, _get) => ({
  setLoad: (vl) => {
    if (vl !== "save") return set({ load: vl });
    set({ load: vl });
    setTimeout(() => {
      set({ load: "hidden" });
    }, 1000 * 1.3);
  },
  load: "hidden",
}));

export default useSyncLoadStore;
