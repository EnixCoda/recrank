import * as React from 'react'
import * as fromCrank from '../recrank'
import { AsyncComponent } from '../recrank/async'
import { AsyncGeneratorComponent } from '../recrank/asyncGenerator'
import { sleep } from '../utils'

const LoadingIndicator = fromCrank.async(async function LoadingIndicator() {
  console.log(`loading indicator`)
  await sleep(1000)
  return <div>Fetching a good boy...</div>
})

let count = 0
const $RandomDog: AsyncComponent<{ throttle?: boolean | undefined }> = async function RandomDog({
  throttle = false,
}): Promise<JSX.Element> {
  if (count++ > 10) throw new Error(`Random dog over render limitation`)

  const res = await fetch('https://dog.ceo/api/breeds/image/random')
  const data = await res.json()
  if (throttle) {
    await sleep(1000)
  }
  return (
    <a href={data.message}>
      <img src={data.message} alt="A Random Dog" width="300" />
    </a>
  )
}
const RandomDog = fromCrank.async($RandomDog)

const $RandomDogLoader: AsyncGeneratorComponent<{
  throttle?: boolean
}> = async function* RandomDogLoader({ throttle }) {
  for await ({ throttle } of this) {
    yield <LoadingIndicator />
    yield <RandomDog throttle={throttle} />
  }
}
const RandomDogLoader = fromCrank.asyncGenerator($RandomDogLoader)

export const RandomDogApp = fromCrank.stateful(function* RandomDogApp() {
  let throttle = false

  while (true) {
    if (count++ > 10) throw new Error(`Random dog app over render limitation`)
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
        <RandomDogLoader throttle={throttle} />
      </React.Fragment>
    )
  }
})
