import {
  Application,
  Assets,
  Container,
  Sprite,
  Text,
  Spritesheet,
  AnimatedSprite,
  BindableTexture,
} from "pixi.js";

import { Map } from "./map";

(async () => {
  const app = new Application();
  await app.init({
    backgroundColor: "brown",
    width: 1200,
    height: 900,
  });
  document.body.appendChild(app.canvas);

  // Fondo
  const bgTexture = await Assets.load("/assets/Maps/Metamine/Background.png");

  const world = new Container({ isRenderGroup: true });
  world.addChild(new Sprite({ texture: bgTexture }));
  const worldWidth = bgTexture.width;
  const worldHeight = bgTexture.height;
  app.stage.addChild(world);

  // Cargar base texture para animación
  const baseTex = await Assets.load(
    "/assets/Maps/Metamine/BackgroundAnimation1.png",
  );

  console.log(Map.create(0));

  // Definir atlasData manualmente
  const atlasData = {
    frames: {
      frame0: {
        frame: { x: 0, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame1: {
        frame: { x: 52, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame2: {
        frame: { x: 104, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame3: {
        frame: { x: 156, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame4: {
        frame: { x: 208, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame5: {
        frame: { x: 260, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame6: {
        frame: { x: 312, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame7: {
        frame: { x: 364, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame8: {
        frame: { x: 416, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame9: {
        frame: { x: 468, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame10: {
        frame: { x: 520, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame11: {
        frame: { x: 572, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame12: {
        frame: { x: 624, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame13: {
        frame: { x: 676, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
      frame14: {
        frame: { x: 728, y: 0, w: 52, h: 111 },
        sourceSize: { w: 52, h: 111 },
        spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
      },
    },
    meta: {
      image: "/assets/Maps/Metamine/Background.png",
      format: "RGBA8888",
      size: { w: baseTex.width, h: baseTex.height },
      scale: 1,
    },
    animations: {
      anim: Object.keys(Array.from({ length: 15 })).map((_, i) => `frame${i}`),
    },
  };

  // Crear Spritesheet
  const spritesheet = new Spritesheet(baseTex as BindableTexture, atlasData);
  await spritesheet.parse();

  // Crear AnimatedSprite
  const animSprite = new AnimatedSprite(spritesheet.animations.anim);
  animSprite.x = 638;
  animSprite.y = 302;
  animSprite.anchor.set(0.5);
  animSprite.animationSpeed = 0.2;
  animSprite.play();

  world.addChild(animSprite);

  // Texto posición
  const positionText = new Text("", { fill: "#fff", fontSize: 20 });
  positionText.x = 10;
  positionText.y = 10;
  app.stage.addChild(positionText);

  // Controles drag cámara y anim
  let isDraggingCamera = false;
  let isDraggingAnim = false;
  let dragTarget: AnimatedSprite | null = null;
  let lastX = 0;
  let lastY = 0;

  app.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  app.canvas.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      isDraggingCamera = true;
      lastX = e.clientX;
      lastY = e.clientY;
    } else if (e.button === 0) {
      const worldPos = { x: e.clientX - world.x, y: e.clientY - world.y };
      if (
        worldPos.x >= animSprite.x - animSprite.width / 2 &&
        worldPos.x <= animSprite.x + animSprite.width / 2 &&
        worldPos.y >= animSprite.y - animSprite.height / 2 &&
        worldPos.y <= animSprite.y + animSprite.height / 2
      ) {
        isDraggingAnim = true;
        dragTarget = animSprite;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (isDraggingCamera) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      world.x += dx;
      world.y += dy;
      lastX = e.clientX;
      lastY = e.clientY;
      clampCamera();
    } else if (isDraggingAnim && dragTarget) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      dragTarget.x += dx;
      dragTarget.y += dy;
      lastX = e.clientX;
      lastY = e.clientY;
      positionText.text = `Anim pos: (${Math.round(dragTarget.x)}, ${Math.round(dragTarget.y)})`;
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 2) isDraggingCamera = false;
    if (e.button === 0) {
      isDraggingAnim = false;
      dragTarget = null;
    }
  });

  function clampCamera() {
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;
    const minX = Math.min(0, screenW - worldWidth);
    const maxX = 0;
    const minY = Math.min(0, screenH - worldHeight);
    const maxY = 0;
    if (world.x < minX) world.x = minX;
    if (world.x > maxX) world.x = maxX;
    if (world.y < minY) world.y = minY;
    if (world.y > maxY) world.y = maxY;
  }

  clampCamera();
})();
