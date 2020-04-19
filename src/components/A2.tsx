import * as React from 'react'
import * as fromCrank from '../recrank'
import { ExtendedAsyncStatefulComponent } from '../recrank/extendedStateful'

/**
 * I changed the way of pulling data in './A'
 */

function LoadingIndicator() {
  return <div>Fetching a good boy...</div>
}

let count = 0
const $RandomDogLoader: ExtendedAsyncStatefulComponent<any> = async function* RandomDogLoader() {
  if (count++ > 10) throw new Error(`Too many counts`)
  // emit async operations before yielding to not block rendering
  const res = this.emitAsync(fetch('https://dog.ceo/api/breeds/image/random'))
  yield <LoadingIndicator />
  const data = await (await res).json()
  return (
    <a href={data.message}>
      <img src={data.message} alt="A Random Dog" width="300" />
    </a>
  )
}
const RandomDogLoader = fromCrank.extendedAsyncStateful($RandomDogLoader)

export const RandomDogApp = fromCrank.stateful(function* RandomDogApp() {
  let throttle = false

  while (true) {
    yield (
      <React.Fragment>
        <div>
          <button
            onClick={() => {
              throttle = !throttle
              this.refresh()
            }}
          >
            Show me another dog.
          </button>
        </div>
        <RandomDogLoader key={`${throttle}`} throttle={throttle} />
      </React.Fragment>
    )
  }
})
