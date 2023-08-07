import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  createTransformsSlice,
  TransformsSlice,
} from "@/app/store/transformsSlice";

export type StoreState = TransformsSlice;
export const useStore = create<StoreState>()(
  devtools((...args) => ({
    ...createTransformsSlice(...args),
  })),
);
