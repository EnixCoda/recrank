import * as React from "react";
import { asRecrankFC, RecrankFC } from ".";

type AsyncContext<P> = {};

export const onResolvePropKey = "$$onResolve"; // TODO: try symbol
export const snapshotPropKey = "$$snapshot"; // TODO: try symbol
type PropsWithResolve<P> = P & {
  [onResolvePropKey]?(element: React.ReactElement | null): void;
  [snapshotPropKey]?: React.ReactElement;
};

export type AsyncComponent<P> = (
  this: AsyncContext<P>,
  props: PropsWithResolve<P>
) => Promise<React.ReactElement>;

export function async<P>(
  component: AsyncComponent<P>
): RecrankFC<PropsWithResolve<P>> {
  return asRecrankFC(
    React.memo(function (props) {
      const [context] = React.useState<AsyncContext<P>>(() => ({}));
      const raceGuard = React.useRef(0);
      React.useEffect(() => {
        const race = ++raceGuard.current;
        component.call(context, props).then((content) => {
          if (race === raceGuard.current) {
            setContent(content);
            props.$$onResolve?.(content);
          }
        });
      }, [context, props]);
      const [content, setContent] = React.useState<React.ReactNode>(
        () => props[snapshotPropKey] || null
      );

      return <>{content}</>;
    }),
    "async",
    component.name
  );
}
