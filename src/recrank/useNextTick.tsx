import * as React from 'react'

/**
 * returns a function which returns a promise that resolves on next render
 */
let count = 0
export function useNextTick() {
  const promiseRef = React.useRef<Promise<void>>(Promise.resolve(undefined))
  // update as effects
  React.useEffect(() => {
    const id = ++count
    console.log(`[useNextTick] creating promise`, id)
    let $resolve: () => void
    promiseRef.current = new Promise((resolve) => {
      $resolve = resolve
    })
    ;(promiseRef.current as any).id = id
    return () => {
      console.log(`[useNextTick] resolving promise`, id)
      $resolve()
    }
  })
  // update immediately in render phase
  // let $resolve: () => void
  // promiseRef.current = new Promise((resolve) => {
  //   $resolve = resolve
  // })
  // React.useEffect(() => {
  //   return () => $resolve()
  // })
  return React.useCallback(
    function () {
      console.log(`[useNextTick] getting promise`, (promiseRef.current as any).id)
      return promiseRef.current
    },
    [promiseRef],
  )
}
