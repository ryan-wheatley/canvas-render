import React from "react";
import * as Slider from "@radix-ui/react-slider";
import style from "./TransformSlider.module.scss";
import { useStore } from "@/app/store/store";

type TransformSlider = {
  transformId: string;
};

const TransformSlider: React.FC<TransformSlider> = ({ transformId }) => {
  const transforms = useStore((state) => state.transforms);
  const updateTransform = useStore((state) => state.updateTransform);

  const onSliderChange = (value: number[]) => {
    updateTransform(transformId, value[0]);
  };

  return (
    <div className={style.component}>
      <div className={style.label}>
        <div>{transformId}</div>
      </div>
      <form>
        <Slider.Root
          className={style.sliderRoot}
          defaultValue={[50]}
          max={100}
          step={0.1}
          value={[transforms[transformId]]}
          onValueChange={onSliderChange}
        >
          <Slider.Track className={style.sliderTrack}>
            <Slider.Range className={style.sliderRange} />
          </Slider.Track>
          <Slider.Thumb className={style.sliderThumb} aria-label="Volume" />
        </Slider.Root>
      </form>
    </div>
  );
};

export default TransformSlider;
