import {
  Application,
  Container,
  FederatedPointerEvent,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";
import styles from "../../../../designSystem/mixins.module.scss";
import { isPositionInsideNode } from "next/dist/server/typescript/utils";
import { useEffect } from "react";
import { useStore } from "@/app/store/store";
import dynamic from "next/dynamic";
import { Simulate } from "react-dom/test-utils";
import mouseMove = Simulate.mouseMove;
import { rotate } from "next/dist/server/lib/squoosh/impl";
class PreviewRenderer {
  app: Application;
  latestTransforms = {
    position: { x: 0, y: 0 },
    angle: 0,
    skew: { x: 0, y: 0 },
    height: 0,
    width: 0,
  };
  private dimensions: { width: number; height: number };
  domContainer: HTMLDivElement;
  contents: {
    background: Graphics;
    video: Sprite | undefined;
    video2: Sprite | undefined;
    controls: Container | undefined;
  };

  constructor(domContainer: HTMLDivElement) {
    this.dimensions = {
      width: domContainer.clientWidth,
      height: domContainer.clientHeight,
    };
    this.contents = {
      background: this.createPreviewBackground(),
      video: undefined,
      video2: undefined,
      controls: undefined,
    };
    this.app = new Application({
      antialias: true,
      resolution: window.devicePixelRatio,
      powerPreference: "high-performance",
      resizeTo: domContainer,
      background: styles.colourDarkGrey,
      autoDensity: true,
    });
    this.domContainer = domContainer;
    this.createVideoElement();
    this.contents.video = this.createVideo(this.createVideoElement());
    this.contents.video2 = this.createVideo(this.createVideoElement());
    this.app.ticker.add(this.update);
    domContainer.appendChild(this.app.view as any);
    this.app.stage.addChild(this.contents.background);
    this.contents.controls = this.createControlsPOC();
    this.app.stage.addChild(
      this.contents.video2,
      this.contents.video,
      this.createPreviewBorder(),
      this.contents.controls,
    );
  }

  createPreviewBackground() {
    const SCALAR = 50;
    const width = 16 * SCALAR;
    const height = 9 * SCALAR;
    const background = new Graphics();
    background.beginFill(0x00);
    background.drawRect(0, 0, width, height);
    background.endFill();
    background.position = this.centerObjectInPreview(width, height);
    background.eventMode = "dynamic";

    const url =
      "https://transform-demo-videos.s3.eu-west-2.amazonaws.com/Jack+Russell.mp4";
    const url2 =
      "https://transform-demo-videos.s3.eu-west-2.amazonaws.com/close-up-slow-motion-shot-of-sea-waves-breaking-on-sandy-coastline-boracay-philippines_rkfwanbmw_1080__D.mp4";

    return background;
  }

  private centerObjectInPreview(width: number, height: number) {
    const x = (this.dimensions.width - width) / 2;
    const y = (this.dimensions.height - height) / 2;
    return { x, y };
  }

  update = () => {
    this.updateLatestTransforms();
    this.updateVideoTransforms();
    this.updateContainerPOC();
  };

  updateLatestTransforms() {
    const transforms = useStore.getState().transforms;
    const x =
      this.contents.background.x + this.scaleAboutZero(transforms["x"]) * 300;
    const y =
      this.contents.background.y + this.scaleAboutZero(transforms["y"]) * 300;

    this.latestTransforms = {
      position: { x, y },
      angle: this.scaleAboutZero(transforms["angle"]) * 90,
      skew: {
        x: this.scaleAboutZero(transforms["skewX"]) / 2,
        y: this.scaleAboutZero(transforms["skewY"]) / 2,
      },
      height: (this.contents.background.height * transforms["scaleY"]) / 50,
      width: (this.contents.background.width * transforms["scaleX"]) / 50,
    };
  }

  private updateVideoTransforms() {
    if (this.contents.video) {
      const transforms = useStore.getState().transforms;

      this.contents.video.position = this.latestTransforms.position;

      this.contents.video.height = this.latestTransforms.height;
      this.contents.video.width = this.latestTransforms.width;

      this.contents.video.skew = this.latestTransforms.skew;

      this.contents.video.angle = this.latestTransforms.angle;
    }
  }

  scaleAboutZero(value: number) {
    return value / 50 - 1;
  }

  createVideo(element: HTMLVideoElement): Sprite {
    const texture = Texture.from(element);
    const videoSprite = new Sprite(texture);
    videoSprite.width = this.contents.background.width;
    videoSprite.height = this.contents.background.height;
    videoSprite.position = this.centerObjectInPreview(
      videoSprite.width,
      videoSprite.height,
    );

    return videoSprite;
  }

  createControlsPOC() {
    const container = new Container();
    container.position = this.contents.background.position;
    const line = new Graphics();
    line.lineStyle(2, styles.colourLightestGrey, 1);
    line.lineTo(this.contents.background.width, 0);
    line.lineTo(
      this.contents.background.width,
      this.contents.background.height,
    );
    container.addChild(line);
    return container;
  }

  updateContainerPOC() {
    if (!this.contents.controls) return;
    this.contents.controls.position = this.latestTransforms.position;
    this.contents.controls.angle = this.latestTransforms.angle;
    this.contents.controls.skew = this.latestTransforms.skew;
    this.contents.controls.height = this.latestTransforms.height;
    this.contents.controls.width = this.latestTransforms.width;
  }

  createPreviewBorder() {
    const rectAndHole = new Graphics();
    rectAndHole.beginFill(styles.colourDarkGrey);
    rectAndHole.drawRect(
      0,
      0,
      this.domContainer.clientWidth,
      this.domContainer.clientHeight,
    );
    rectAndHole.beginHole();
    rectAndHole.drawRect(
      this.contents.background.x,
      this.contents.background.y,
      this.contents.background.width,
      this.contents.background.height,
    );
    rectAndHole.endHole();
    rectAndHole.endFill();
    rectAndHole.zIndex = 100;
    return rectAndHole;
  }

  createVideoElement() {
    // Assuming you have an existing PixiJS application and stage setup
    const videoElement = document.createElement("video");

    const url =
      "https://transform-demo-videos.s3.eu-west-2.amazonaws.com/Jack+Russell.mp4";
    videoElement.src = "/dog.mp4";
    videoElement.loop = true;
    videoElement.autoplay = true;
    videoElement.muted = true; // Ensure video is muted to avoid potential browser restrictions on autoplay with sound
    videoElement.style.display = "none"; // Hide the video element from the user's view
    this.domContainer.appendChild(videoElement); // Append the video element to the DOM to load the video source
    return videoElement;
  }

  dispose() {
    this.app.destroy(true);
  }
}
export default PreviewRenderer;
