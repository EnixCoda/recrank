import * as React from "react";
import { asRecrankFC, RecrankFC } from ".";

type AsyncContext<P> = {};

export type AsyncComponent<P> = (
  this: AsyncContext<P>,
  props: P
) => Promise<React.ReactElement>;

export function async<P>(component: AsyncComponent<P>): RecrankFC<P> {
  return asRecrankFC(
    React.memo(function (props) {
      const [context] = React.useState<AsyncContext<P>>(() => ({}));
      const raceGuard = React.useRef(0);
      React.useEffect(() => {
        const race = ++raceGuard.current;
        component.call(context, props).then((content) => {
          if (race === raceGuard.current) setContent(content);
        });
      }, [context, props]);
      const [content, setContent] = React.useState<React.ReactNode>(() => null);

      return <>{content}</>;
    }),
    "async"
  );
}
