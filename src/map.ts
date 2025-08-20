interface MapAnimation {
  source: string;
  x: number;
  y: number;
  rows: number;
  frames: number;
}

import { AnimatedSprite, Assets, Spritesheet, SpritesheetData } from "pixi.js";
import MapData from "./maps.json";

export class Map {
  id: number;
  name: string;
  color: string;
  w: number;
  h: number;
  bg: string;
  animations: MapAnimation[];

  constructor(dto: Partial<Map>) {
    Object.assign(this, dto);
  }

  static create(id: number): Map {
    const mapData = MapData.find((map) => map.id === id);
    if (!mapData) throw new Error(`Map with id ${id} not found`);

    return new Map(mapData);
  }

  async getAnimatedSprites(): Promise<AnimatedSprite[]> {
    const texture = await Assets.load(this.bg);

    const spritessheets: Spritesheet[] = [];

    for (const animation of this.animations) {
      const data: SpritesheetData = {
        frames: {},
        meta: {
          image: this.bg,
          format: "RGBA8888",
          size: {
            w: this.w,
            h: this.h,
          },
          scale: 1,
        },
        animations: {
          anim: Array.from({ length: animation.frames }, (_, i) => `frame${i}`),
        },
      };

      for (let i = 0; i < animation.frames; i++) {
        const frameX = (i % animation.rows) * this.w;
        const frameY = Math.floor(i / animation.rows) * this.h;

        data.frames[`frame${i}`] = {
          frame: { x: frameX, y: frameY, w: this.w, h: this.h },
          sourceSize: { w: this.w, h: this.h },
          spriteSourceSize: { x: 0, y: 0, w: this.w, h: this.h },
        };
      }

      const spritesheet = new Spritesheet(texture, data);
      await spritesheet.parse();
      spritessheets.push(spritesheet);
    }

    const animatedSprites: AnimatedSprite[] = [];

    for (let i = 0; i < spritessheets.length; i++) {
      const spritesheet = spritessheets[i];
      const animation = this.animations[i];

      const animatedSprite = new AnimatedSprite(spritesheet.animations.anim);
      animatedSprite.x = animation.x;
      animatedSprite.y = animation.y;
      animatedSprite.anchor.set(0.5);
      animatedSprite.animationSpeed = 0.2;
      animatedSprite.play();
      animatedSprites.push(animatedSprite);
    }

    return animatedSprites;
  }
}
