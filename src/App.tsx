import * as React from "react";
import { QuoteOfTheDay } from "./components/QuoteOfTheDay";
import { RandomDogApp } from "./components/RandomDogApp";
import * as fromCrank from "./recrank";
import { AsyncComponent } from "./recrank/async";
import { StatefulComponent } from "./recrank/stateful";
import "./styles.css";
import { sleep } from "./utils";

export default function App() {
  return (
    <div>
      <h2>StatefulComponent</h2>
      <h4>Timer</h4>
      <StatefulComponentTimer />
      <hr />
      <h2>AsyncComponent</h2>
      <h4>Timeout</h4>
      <AsyncComponentTimeout />
      <h4>QuoteOfTheDay</h4>
      <QuoteOfTheDay />
      <hr />
      <h2>AsyncGeneratorComponent</h2>
      <h4>RandomDogApp</h4>
      <RandomDogApp />
      <hr />
    </div>
  );
}

const Timer: StatefulComponent<{ count?: number }> = function* Timer({
  count = 0,
}) {
  let innerCount = count;
  const timer = setInterval(() => {
    innerCount++;
    this.refresh();
  }, 1000);
  try {
    while (true) {
      yield <span>{innerCount}</span>;
    }
  } finally {
    console.log(`Clearing timer`);
    clearInterval(timer);
  }
};

const StatefulComponentTimer = fromCrank.stateful(Timer);

const Timeout: AsyncComponent<{}> = async function Timeout(props) {
  await sleep(1000);
  return <span>+1s</span>;
};

const AsyncComponentTimeout = fromCrank.async(Timeout);
