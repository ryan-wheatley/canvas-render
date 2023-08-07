"use client";

import React, { useEffect, useRef } from "react";

import style from "./PreviewWindow.module.scss";
import PreviewControlsPanel from "@/app/components/PreviewPanel/PreviewControlsPanel/PreviewControlsPanel";
import PreviewRenderer from "@/app/components/PreviewPanel/PreviewWindow/previewRenderer/PreviewRenderer";

type PreviewWindow = {};

const PreviewWindow: React.FC<PreviewWindow> = ({}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PreviewRenderer>();
  useEffect(() => {
    if (containerRef.current) {
      rendererRef.current = new PreviewRenderer(containerRef.current);
      return () => {
        rendererRef.current?.dispose();
      };
    }
  });
  return <div className={style.component} ref={containerRef}></div>;
};

export default PreviewWindow;
