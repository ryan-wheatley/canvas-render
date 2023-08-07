import React from "react";

import style from "./previewPanel.module.scss";
import PreviewControlsPanel from "@/app/components/PreviewPanel/PreviewControlsPanel/PreviewControlsPanel";
import PreviewWindow from "@/app/components/PreviewPanel/PreviewWindow/PreviewWindow";

type Preview = {};

const PreviewPanel: React.FC<Preview> = ({}) => {
  return (
    <div className={style.component}>
      <PreviewWindow />
      <PreviewControlsPanel />
    </div>
  );
};

export default PreviewPanel;
