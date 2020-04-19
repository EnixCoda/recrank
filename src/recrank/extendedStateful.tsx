import * as React from 'react'

type ExtendedStatefulContext<P> = {
  refresh(): void
  [Symbol.iterator](): AsyncGenerator<P>
  emitAsync<T>(p: Promise<T>): Promise<T>
}

export type ExtendedAsyncStatefulComponent<P> = (
  this: ExtendedStatefulContext<P>,
  props: P,
) => AsyncGenerator<React.ReactElement | Promise<React.ReactElement>, void, unknown>

export function extendedAsyncStateful<P>(
  component: ExtendedAsyncStatefulComponent<P>,
): React.FC<P> {
  return function (props: P) {
    const propsRef = React.useRef(props)
    React.useEffect(() => {
      propsRef.current = props
    }, [props])

    async function refresh() {
      const next = await generated.next()
      setContent(() => next.value)
    }

    const context: ExtendedStatefulContext<P> = {
      refresh,
      emitAsync(p) {
        p.then(() => refresh())
        return p
      },
      [Symbol.iterator]: async function* () {
        yield propsRef.current
      },
    }
    const [generated] = React.useState(() => component.call(context, props))
    const [content, setContent] = React.useState<React.ReactNode>(() => null)
    React.useEffect(() => {
      refresh()
      return () => {
        generated.return()
      }
    }, [generated])
    return <>{content}</>
  }
}
