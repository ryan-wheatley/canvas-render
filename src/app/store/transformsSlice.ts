import { StateCreator } from "zustand";
import { StoreState } from "@/app/store/store";

export type TransformRecord = Record<string, number>;

export type TransformSliceData = {
  transforms: TransformRecord;
};

export type TransformSliceOperations = {
  updateTransform: (id: string, value: number) => void;
  getTransformValue: (id: string) => number;
};

export type TransformsSlice = TransformSliceData & TransformSliceOperations;

export const createTransformsSlice: StateCreator<
  StoreState,
  [],
  [],
  TransformsSlice
> = (set, get) => ({
  transforms: {
    x: 50,
    y: 50,
    skewX: 50,
    skewY: 50,
    scaleX: 50,
    scaleY: 50,
    angle: 50,
  },
  getTransformValue: (id: string) => {
    return get().transforms[id];
  },
  updateTransform: (id, value) => {
    const data = get();
    let state: TransformSliceData = {
      transforms: { ...data.transforms, [id]: value },
    };
    set(state);
  },
});
