import dynamic from "next/dynamic";
import type { LampSceneProps } from "./scene";

export const LampSceneDynamic = dynamic<LampSceneProps>(
  () => import("./scene").then((mod) => mod.LampScene),
  { ssr: false }
);
