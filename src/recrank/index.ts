/**
 * There are 3 kinds of components in crank
 * - Stateful component
 * - Async component
 * - Stateful async component
 */

import { ComponentType, FC } from "react";

export { async } from "./async";
export { asyncGenerator } from "./asyncGenerator";
export { stateful } from "./stateful";

const recrankMark = Symbol.for("recrank");

type Types = "stateful" | "async" | "async generator";
export type RecrankFC<P> = React.FC<P> & {
  [recrankMark]?: Types;
};

export function asRecrankFC<P>(
  fc: FC<P>,
  type: Types,
  name: string
): RecrankFC<P> {
  Object.assign(fc, {
    [recrankMark]: type,
    displayName: name,
  });
  return fc;
}

export function getRecrankType<P>(
  component: ComponentType<P> | RecrankFC<P>
): Types | undefined {
  return (component as RecrankFC<P>)[recrankMark];
}
