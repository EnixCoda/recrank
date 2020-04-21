import * as React from 'react'
import { useNextTick } from './useNextTick'

type ExtendedStatefulContext<P> = {
  refresh(): void
  emitAsync<T>(p: Promise<T>): Promise<T>
  [Symbol.asyncIterator](): AsyncGenerator<P>
}

export type ExtendedAsyncStatefulComponent<P> = (
  this: ExtendedStatefulContext<P>,
  props: P,
) => AsyncGenerator<React.ReactElement, React.ReactElement | void, unknown>

export function extendedAsyncStateful<P>(
  component: ExtendedAsyncStatefulComponent<P>,
): React.FC<P> {
  return function (props: P) {
    const propsRef = React.useRef(props)
    React.useEffect(() => {
      propsRef.current = props
    }, [props])

    const nextTick = useNextTick()
    const [context] = React.useState<ExtendedStatefulContext<P>>(() => {
      async function refresh() {
        const next = await generated.next()
        setContent(() => next.value)
      }
      return {
        refresh,
        emitAsync(p) {
          p.then(refresh)
          return p
        },
        [Symbol.asyncIterator]: async function* () {
          while (true) {
            yield propsRef.current
            await nextTick()
          }
        },
      }
    })
    const [generated] = React.useState(() => component.call(context, props))
    const [content, setContent] = React.useState<React.ReactNode>(() => null)
    React.useEffect(() => {
      context.refresh()
      return () => {
        generated.return()
      }
    }, [context, generated])
    return <>{content}</>
  }
}
