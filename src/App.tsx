import * as React from 'react'
import { RandomDogApp as RandomDogAppExtended } from './components/A2'
import { QuoteOfTheDay } from './components/QuoteOfTheDay'
import * as fromCrank from './recrank'
import { AsyncComponent } from './recrank/async'
import { StatefulComponent } from './recrank/stateful'
import './styles.css'
import { sleep } from './utils'

export default function App() {
  return (
    <div style={{ display: 'grid' }}>
      <TimerStatefulComponentFromCrank />
      <TimeoutAsyncComponentFromCrank />
      <QuoteOfTheDay />
      {/* <RandomDogApp /> */}
      <RandomDogAppExtended />
    </div>
  )
}

const Timer: StatefulComponent<{ count?: number }> = function* Timer(
  this: { refresh(): void },
  { count = 0 },
) {
  let innerCount = count
  const timer = setInterval(() => {
    innerCount++
    this.refresh()
  }, 1000)
  try {
    while (true) {
      yield <span>{innerCount}</span>
    }
  } finally {
    console.log(`Clearing timer`)
    clearInterval(timer)
  }
}

const TimerStatefulComponentFromCrank = fromCrank.stateful(Timer)

const Timeout: AsyncComponent<{}> = async function Timeout(props) {
  await sleep(1000)
  return <span>+1s</span>
}

const TimeoutAsyncComponentFromCrank = fromCrank.async(Timeout)
