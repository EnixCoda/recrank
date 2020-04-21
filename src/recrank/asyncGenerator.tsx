import * as React from 'react'
import { useNextTick } from './useNextTick'

type AsyncGeneratorContext<P> = {
  [Symbol.asyncIterator](): AsyncGenerator<P>
}

export type AsyncGeneratorComponent<P> = (
  this: AsyncGeneratorContext<P>,
  props: P,
) => AsyncGenerator<React.ReactElement, React.ReactElement | void, unknown>

export function asyncGenerator<P>(component: AsyncGeneratorComponent<P>): React.FC<P> {
  return function (props: P) {
    console.log(`rendering async generator component`)
    const propsRef = React.useRef(props)
    React.useEffect(() => {
      propsRef.current = props
    }, [props])

    const nextTick = useNextTick()
    const [context] = React.useState<AsyncGeneratorContext<P>>(() => ({
      [Symbol.asyncIterator]: async function* () {
        while (true) {
          console.log(`[props iterator] yielding props`, propsRef.current)
          yield propsRef.current

          console.log(`[props iterator] waiting for tick`)
          await nextTick()
          console.log(`[props iterator] new tick arrived`)
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
      let run = true
      async function render() {
        while (run) {
          const next = await generated.next()
          console.log(`[render effect] new child generated`)
          const value = next.value // element of wrapped async component
          // TODO: wait for async element render
          if (value || value === null) setContent(value)
          if (next.done) break
        }
      }
      render()
      return () => {
        run = false
      }
    }, [generated])

    return <>{content}</>
  }
}
