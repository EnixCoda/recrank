import * as React from 'react'
import * as fromCrank from '../recrank'
import { ExtendedAsyncStatefulComponent } from '../recrank/extendedStateful'
import { sleep } from '../utils'

/**
 * The timeout in the crank async generator demo does not make sense to me
 */
function LoadingIndicator() {
  return <div>Fetching a good boy...</div>
}

const $RandomDogLoader: ExtendedAsyncStatefulComponent<{
  throttle?: boolean
}> = async function* RandomDogLoader({ throttle }) {
  for await ({ throttle } of this) {
    // emit async operations before yielding to not block rendering
    const res = this.emitAsync(fetch('https://dog.ceo/api/breeds/image/random'))
    yield <LoadingIndicator />
    const data = await (await res).json()
    if (throttle) {
      this.emitAsync(sleep(1000))
      yield <span>sleeping due to throttle</span>
    }
    yield (
      <div>
        <a href={data.message}>
          <img src={data.message} alt="A Random Dog" width="300" />
        </a>
      </div>
    )
  }
}
const RandomDogLoader = fromCrank.extendedAsyncStateful($RandomDogLoader)

export const RandomDogApp = fromCrank.stateful(function* RandomDogApp() {
  let throttle = false

  const onClickButton = () => {
    throttle = !throttle
    this.refresh()
  }
  while (true) {
    yield (
      <React.Fragment>
        <div>
          <button onClick={onClickButton}>Show me another dog.</button>
        </div>
        <RandomDogLoader key={`${throttle}`} throttle={throttle} />
      </React.Fragment>
    )
  }
})
