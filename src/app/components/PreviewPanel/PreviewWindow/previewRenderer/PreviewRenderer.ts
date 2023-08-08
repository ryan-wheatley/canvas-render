import {
  Application,
  Container,
  FederatedPointerEvent,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";
import styles from "../../../../designSystem/mixins.module.scss";
import { useStore } from "../../../../store/store";

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
    scaleControls: {
      tl: Graphics;
      tr: Graphics;
      bl: Graphics;
      br: Graphics;
    };
  };
  initialPosition = {
    position: { x: 0, y: 0 },
    rotation: 0,
  };
  pointerOrigin = { x: 0, y: 0 };
  moving = false;
  scaling = false;

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
      scaleControls: {
        tl: this.createScaleControl(),
        tr: new Graphics(),
        bl: new Graphics(),
        br: new Graphics(),
      },
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
    this.contents.video2 = this.createVideo(this.createVideoElement());
    this.app.ticker.add(this.update);
    domContainer.appendChild(this.app.view as any);
    this.app.stage.addChild(this.contents.background);
    this.contents.controls = this.createControlsPOC();
    this.app.stage.eventMode = "dynamic";
    this.app.stage.on("globalpointermove", (e: FederatedPointerEvent) => {
      const deltaX = this.pointerOrigin.x - e.x;
      const deltaY = this.pointerOrigin.y - e.y;
      if (this.moving) {
        useStore
          .getState()
          .updateTransform(
            "x",
            this.initialPosition.position.x - (deltaX / 300) * 50,
          );

        useStore
          .getState()
          .updateTransform(
            "y",
            this.initialPosition.position.y - (deltaY / 300) * 50,
          );
      }

      if (this.scaling) {
        useStore
          .getState()
          .updateTransform(
            "scaleX",
            this.initialPosition.position.x + deltaX / 50,
          );
      }
    });

    this.app.stage.on("pointerup", (exports: FederatedPointerEvent) => {
      this.moving = false;
      this.scaling = false;
    });
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
    // so when I update the height, offset the position

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
      width: (50 * 16 * transforms["scaleX"]) / 50,
    };
  }

  private updateVideoTransforms() {
    if (this.contents.video) {
      this.contents.video.position = {
        x:
          this.latestTransforms.position.x +
          (this.domContainer.clientWidth - 16 * 50) / 2 +
          10,
        y:
          this.latestTransforms.position.y +
          (this.domContainer.clientHeight - 9 * 50) / 2 +
          10,
      };
      this.contents.video.height = this.latestTransforms.height;
      this.contents.video.width = this.latestTransforms.width;
      this.contents.video.skew = this.latestTransforms.skew;
      this.contents.video.angle = this.latestTransforms.angle;
      this.contents.video.zIndex = 0;
      this.app.stage.sortableChildren = true;
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

    videoSprite.eventMode = "dynamic";
    videoSprite.zIndex = 0;
    videoSprite.on("pointerdown", (e: FederatedPointerEvent) => {
      this.initialPosition.position = {
        x: useStore.getState().transforms["x"],
        y: useStore.getState().transforms["y"],
      };
      this.pointerOrigin = { x: e.x, y: e.y };
      this.moving = true;
    });

    return videoSprite;
  }

  createControlsPOC() {
    const container = new Container();
    container.position = this.contents.background.position;
    const line = new Graphics();
    line.lineStyle(2, styles.colourOffWhite, 1);
    line.lineTo(this.contents.background.width, 0);
    line.lineTo(
      this.contents.background.width,
      this.contents.background.height,
    );
    line.lineTo(0, this.contents.background.height);
    line.lineTo(0, 0);

    const shadowLine = new Graphics();
    shadowLine.lineStyle(10, styles.colourDarkGrey, 0.5);
    shadowLine.lineTo(this.contents.background.width, 0);
    shadowLine.lineTo(
      this.contents.background.width,
      this.contents.background.height,
    );
    shadowLine.lineTo(0, this.contents.background.height);
    shadowLine.lineTo(0, 0);

    container.addChild(this.createVideo(this.createVideoElement()));

    this.app.stage.addChild(container, this.createPreviewBorder());

    container.addChild(shadowLine, line);
    container.pivot.set(container.width / 2, container.height / 2);

    return container;
  }

  createScaleControl() {
    const square = new Graphics();
    square.beginFill(styles.colourOffWhite);
    square.drawRect(0, 0, 10, 10);
    square.endFill();
    square.eventMode = "dynamic";
    square.on("pointerdown", (e: FederatedPointerEvent) => {
      this.initialPosition.position = {
        x: useStore.getState().transforms["scaleX"],
        y: useStore.getState().transforms["scaleY"],
      };
      this.pointerOrigin = { x: e.x, y: e.y };
      this.scaling = true;
    });

    return square;
  }

  updateContainerPOC() {
    if (!this.contents.controls) return;
    this.contents.controls.position = {
      x: this.latestTransforms.position.x - 10,
      y: this.latestTransforms.position.y - 10,
    };
    this.contents.controls.position.x += (50 * 16 + 30) / 2;
    this.contents.controls.position.y += (50 * 9 + 30) / 2;
    this.contents.controls.angle = this.latestTransforms.angle;
    this.contents.controls.skew = this.latestTransforms.skew;
    this.contents.controls.height = this.latestTransforms.height + 30;
    this.contents.controls.width = this.latestTransforms.width + 30;
    this.contents.scaleControls.tl.scale.x =
      (50 * 16) / this.contents.controls.width;
    this.contents.scaleControls.tl.scale.y =
      (50 * 9) / this.contents.controls.height;
    this.contents.scaleControls.tl.x = -5;
    this.contents.scaleControls.tl.y = -5;
  }

  updateScaleControls() {}

  createPreviewBorder() {
    const rectAndHole = new Graphics();
    rectAndHole.beginFill(styles.colourDarkGrey, 0.8);
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

    this.app.stage.sortChildren();
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

// on mouse down, on corner piece (top right)
// so one handler for that RESIZING

// on mouse down, on video
// one handler for MOVING

// on mousedown, on rotation handle
// set original position, on move get the delta, set the state to original position plus delta
