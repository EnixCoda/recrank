import * as React from "react";
import { asRecrankFC, getRecrankType, RecrankFC } from ".";
import { onResolvePropKey, snapshotPropKey } from "./async";
import { useNextTick } from "./useNextTick";

type AsyncGeneratorContext<P> = {
  [Symbol.asyncIterator](): AsyncGenerator<P>;
};

export type AsyncGeneratorComponent<P> = (
  this: AsyncGeneratorContext<P>,
  props: P
) => AsyncGenerator<React.ReactElement, React.ReactElement | void, unknown>;

export function asyncGenerator<P>(
  component: AsyncGeneratorComponent<P>
): RecrankFC<P> {
  return asRecrankFC(
    React.memo(function (props) {
      console.log(`rendering async generator component`);
      const propsRef = React.useRef(props);
      React.useEffect(() => {
        propsRef.current = props;
      }, [props]);

      const nextTick = useNextTick();
      const [context] = React.useState<AsyncGeneratorContext<P>>(() => ({
        [Symbol.asyncIterator]: async function* () {
          while (true) {
            console.log(`[props iterator] yielding props`, propsRef.current);
            yield propsRef.current;

            console.log(`[props iterator] waiting for tick`);
            await nextTick();
            console.log(`[props iterator] new tick arrived`);
          }
        },
      }));
      const [generated] = React.useState(() => component.call(context, props));
      React.useEffect(() => {
        return () => {
          generated.return();
        };
      }, [generated]);

      const [content, setContent] = React.useState<React.ReactNode>(() => null);

      React.useEffect(() => {
        let run = true;
        async function render() {
          let resolve: Function | undefined;
          let latestContent: React.ReactElement | null | undefined;
          while (run) {
            const next = await generated.next();
            console.log(`[render effect] new child generated`);
            const value = next.value; // element of wrapped async component
            // TODO: wait for async element render
            if (value) {
              if (
                typeof value.type !== "string" &&
                getRecrankType(value.type) === "async"
              ) {
                const content = React.cloneElement(value, {
                  [onResolvePropKey](element: React.ReactElement | null) {
                    latestContent = element;
                    resolve?.();
                  },
                  [snapshotPropKey]: latestContent,
                });

                setContent(content);

                await new Promise(($resolve) => {
                  resolve = $resolve;
                });
              } else {
                latestContent = value;
                setContent(value);
              }
            }
            if (next.done) break;
          }
        }
        render();
        return () => {
          run = false;
        };
      }, [generated]);

      return <>{content}</>;
    }),
    "async generator",
    component.name
  );
}
