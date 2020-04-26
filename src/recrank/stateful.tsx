import * as React from "react";
import { asRecrankFC, RecrankFC } from ".";

type StatefulContext<P> = {
  refresh(): void;
};

export type StatefulComponent<P> = (
  this: StatefulContext<P>,
  props: P
) => Generator<React.ReactElement, void, unknown>;

const RESET_ON_PROPS_UPDATE = false;

export function stateful<P>(component: StatefulComponent<P>): RecrankFC<P> {
  return asRecrankFC(
    React.memo(function (props) {
      const [context] = React.useState<StatefulContext<P>>(() => ({
        refresh() {
          const next = generated.next();
          setContent(() => next.value);
        },
      }));
      const [generated, setGenerated] = React.useState(() =>
        component.call(context, props)
      );
      React.useEffect(() => {
        if (RESET_ON_PROPS_UPDATE) {
          setGenerated(component.call(context, props));
        }
      }, [context, props]);
      const [content, setContent] = React.useState<React.ReactNode>(() => null);
      React.useEffect(() => {
        context.refresh();
      }, [context]);

      React.useEffect(
        () => () => {
          generated.return();
        },
        [generated]
      );
      return <>{content}</>;
    }),
    "stateful"
  );
}
