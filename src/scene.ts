import { Map } from "./map";

export class Scene {
  map: Map;

  constructor(dto: Partial<Scene>) {
    Object.assign(this, dto);
  }
}
