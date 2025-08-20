import {
  Application,
  Assets,
  Container,
  Sprite,
  Text,
  Spritesheet,
  AnimatedSprite,
  BindableTexture,
  TilingSprite,
} from "pixi.js";

import { Map } from "./map";

(async () => {
  // Crear aplicación a pantalla completa (canvas ocupa toda la ventana)
  const app = new Application();
  await app.init({
    backgroundColor: "brown",
    resizeTo: window, // 👈 canvas siempre del tamaño de la ventana
  });
  document.body.style.margin = "0"; // quitar scroll del navegador
  document.body.appendChild(app.canvas);

  // Fondo
  const bgTexture = await Assets.load("/assets/Maps/Metamine/Background.png");

  const world = new Container({ isRenderGroup: true });

  // const tornadoTex = await Assets.load("/assets/Tornado.png");

  app.stage.addChild(world);

  // Sprite del fondo
  const bgSprite = new Sprite({ texture: bgTexture });
  world.addChild(bgSprite);

  // Ajustar fondo al tamaño de la pantalla
  function resizeBackground() {
    const scaleX = app.renderer.width / bgTexture.width;
    const scaleY = app.renderer.height / bgTexture.height;
    const scale = Math.max(scaleX, scaleY); // cubrir toda la pantalla
    bgSprite.scale.set(scale);
    clampCamera(); // 👈 volver a limitar cámara en cada resize
  }

  resizeBackground();
  window.addEventListener("resize", resizeBackground);

  // Cargar base texture para animación
  const baseTex = await Assets.load(
    "/assets/Maps/Metamine/BackgroundAnimation1.png"
  );

  console.log(Map.create(0));

  // Definir atlasData manualmente
  const atlasData = {
    frames: Object.fromEntries(
      Array.from({ length: 15 }, (_, i) => [
        `frame${i}`,
        {
          frame: { x: i * 52, y: 0, w: 52, h: 111 },
          sourceSize: { w: 52, h: 111 },
          spriteSourceSize: { x: 0, y: 0, w: 52, h: 111 },
        },
      ])
    ),
    meta: {
      image: "/assets/Maps/Metamine/Background.png",
      format: "RGBA8888",
      size: { w: baseTex.width, h: baseTex.height },
      scale: 1,
    },
    animations: {
      anim: Array.from({ length: 15 }, (_, i) => `frame${i}`),
    },
  };

  // Crear Spritesheet
  const spritesheet = new Spritesheet(baseTex as BindableTexture, atlasData);
  await spritesheet.parse();

  // Crear AnimatedSprite
  const animSprite = new AnimatedSprite(spritesheet.animations.anim);
  animSprite.x = app.renderer.width / 2;
  animSprite.y = app.renderer.height / 2;
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

  // 🚨 Límite de la cámara: no dejar ver más allá del fondo
  function clampCamera() {
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;

    const scaledW = bgTexture.width * bgSprite.scale.x;
    const scaledH = bgTexture.height * bgSprite.scale.y;

    const minX = Math.min(0, screenW - scaledW);
    const maxX = 0;
    const minY = Math.min(0, screenH - scaledH);
    const maxY = 0;

    if (world.x < minX) world.x = minX;
    if (world.x > maxX) world.x = maxX;
    if (world.y < minY) world.y = minY;
    if (world.y > maxY) world.y = maxY;
  }
  const addWeather = async (src: string, speed = 3) => {
    const weatherTex = await Assets.load(src);

    const weather = new TilingSprite({
      texture: weatherTex,
      width: weatherTex.width,
      height: app.renderer.height,
    });

    // Escala X aleatoria (mínimo = 1, máximo = llenar pantalla)
    const minScale = 1;
    const maxScale = 3;
    const randomScale = minScale + Math.random() * (maxScale - minScale);
    weather.scale.x = randomScale;

    // Posición X aleatoria dentro de los límites
    weather.x =
      Math.random() * (app.renderer.width - weather.width * weather.scale.x);

    app.stage.addChild(weather);

    window.addEventListener("resize", () => {
      weather.height = app.renderer.height;

      // Recalcular escala máxima según nuevo tamaño de ventana
      const newMaxScale = app.renderer.width / weatherTex.width;
      const newRandomScale =
        minScale + Math.random() * (newMaxScale - minScale);
      weather.scale.x = newRandomScale;

      // Ajustar X aleatoria
      weather.x =
        Math.random() * (app.renderer.width - weather.width * weather.scale.x);
    });

    app.ticker.add(() => {
      weather.tilePosition.y -= speed;
    });
  };

  addWeather("/assets/Random.png");
  addWeather("/assets/Tornado.png", 15);
  addWeather("/assets/Force.png", 2);
  addWeather("/assets/Electricity.png");
  addWeather("/assets/Weakness.png");
  addWeather("/assets/Mirror.png");

  clampCamera();
})();
