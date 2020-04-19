import * as React from 'react'
import { sleep } from '../utils'

type AsyncGeneratorContext<P> = {
  refresh(): void
  [Symbol.iterator]: () => AsyncGenerator<P>
}

export type AsyncGeneratorComponent<P> = (
  this: AsyncGeneratorContext<P>,
  props: P,
) => AsyncGenerator<React.ReactElement, void, unknown>

export function asyncGenerator<P>(component: AsyncGeneratorComponent<P>): React.FC<P> {
  return function (props: P) {
    console.log(`rendering`)
    const propsRef = React.useRef(props)
    React.useEffect(() => {
      propsRef.current = props
    }, [props])

    const nextTick = useNextTick()
    const [context] = React.useState<AsyncGeneratorContext<P>>(() => ({
      refresh() {},
      [Symbol.iterator]: async function* () {
        let count = 0
        while (true) {
          if (count++ > 4) throw new Error(`Too many times rendered`)

          console.log(`yielding props`, propsRef.current)
          yield propsRef.current

          console.log(`waiting for next tick`)
          await nextTick()
          console.log(`new tick arrived`)
        }
      },
    }))
    const [generated] = React.useState(() => component.call(context, props))
    React.useEffect(() => {
      return () => {
        generated.return()
      }
    }, [generated])

    const [content, setContent] = React.useState<React.ReactNode>(() => null)

    React.useEffect(() => {
      async function render() {
        while (true) {
          await sleep(1000)
          const next = await generated.next()
          console.log(`new child generated`, next.value)
          const value = next.value // element of wrapped async component
          // TODO: wait for async element render
          if (value || value === null) setContent(value)
          if (next.done) break
        }
      }
      render()
    }, [])

    return <>{content}</>
  }
}

/**
 * returns a function which returns a promise that resolves on next render
 */
let count = 0
function useNextTick() {
  const promiseRef = React.useRef<Promise<void>>(Promise.resolve(undefined))
  // update as effects
  React.useEffect(() => {
    const id = ++count
    console.log(`creating new promise`, id)
    let $resolve: () => void
    promiseRef.current = new Promise((resolve) => {
      $resolve = resolve
    })
    ;(promiseRef.current as any).id = id
    return () => {
      console.log(`resolving last promise`, id)
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
      console.log(`getting promise ref`, (promiseRef.current as any).id)
      return promiseRef.current
    },
    [promiseRef],
  )
}
