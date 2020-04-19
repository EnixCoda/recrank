import * as React from 'react'
import { RandomDogApp } from './components/A'
import * as fromCrank from './recrank'
import { AsyncComponent } from './recrank/async'
import { StatefulComponent } from './recrank/stateful'
import './styles.css'
import { sleep } from './utils'

export default function App() {
  const [escape, setEscape] = React.useState(false)
  if (escape) return null
  return (
    <div style={{ display: 'grid' }}>
      {/* <Timer_StatefulComponentFromCrank />
      <Timeout_AsyncComponentFromCrank />
      <QuoteOfTheDay /> */}
      <RandomDogApp />
      <button onClick={() => setEscape(true)}>escape</button>
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

const Timer_StatefulComponentFromCrank = fromCrank.stateful(Timer)

const Timeout: AsyncComponent<{}> = async function Timeout(props) {
  await sleep(1000)
  return <span>+1s</span>
}

const Timeout_AsyncComponentFromCrank = fromCrank.async(Timeout)
