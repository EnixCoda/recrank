import * as React from "react";

/**
 * returns a function which returns a promise that resolves on next render
 */

const MODE: "async" | "sync" = "async"; // TODO: make this work in 'async' mode

let count = 0;
function useNextTickAsync() {
  const promiseRef = React.useRef<Promise<void>>(Promise.resolve(undefined));
  // update as effects
  React.useEffect(() => {
    const id = ++count;
    console.log(`[useNextTick] creating promise`, id);
    let $resolve: () => void;
    promiseRef.current = new Promise((resolve) => {
      $resolve = resolve;
    });
    (promiseRef.current as any).id = id;
    return () => {
      console.log(`[useNextTick] resolving promise`, id);
      $resolve();
    };
  });

  return React.useCallback(
    function () {
      console.log(
        `[useNextTick] getting promise`,
        (promiseRef.current as any).id
      );
      return promiseRef.current;
    },
    [promiseRef]
  );
}

function useNextTickSync() {
  const promiseRef = React.useRef<Promise<void>>(Promise.resolve(undefined));
  // update immediately in render phase
  let $resolve: () => void;
  promiseRef.current = new Promise((resolve) => {
    $resolve = resolve;
  });
  React.useEffect(() => {
    return () => $resolve();
  });
  return React.useCallback(
    function () {
      console.log(
        `[useNextTick] getting promise`,
        (promiseRef.current as any).id
      );
      return promiseRef.current;
    },
    [promiseRef]
  );
}

// export const useNextTick = MODE === "sync" useNextTickSync : useNextTickAsync;
// export const useNextTick = useNextTickSync;
export const useNextTick = useNextTickAsync;
