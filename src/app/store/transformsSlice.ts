import { StateCreator } from "zustand";
import { StoreState } from "./store";

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
    x: 60,
    y: 50,
    skewX: 50,
    skewY: 50,
    scaleX: 25,
    scaleY: 25,
    angle: 60,
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
