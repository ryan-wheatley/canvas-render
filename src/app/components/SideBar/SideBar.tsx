"use client";

import React from "react";

import style from "./sideBar.module.scss";
import { useStore } from "@/app/store/store";
import TransformSlider from "@/app/components/SideBar/TransformSlider/TransformSlider";

type SideBar = {};

const SideBar: React.FC<SideBar> = ({}) => {
  const transforms = useStore((state) => state.transforms);
  return (
    <div className={style.component}>
      <div className={style.title}>
        <div>Transforms</div>
      </div>
      {Object.keys(transforms).map((key) => {
        return <TransformSlider key={key} transformId={key} />;
      })}
    </div>
  );
};

export default SideBar;
