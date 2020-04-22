import * as React from "react";
import * as fromCrank from "../recrank";
import { AsyncComponent } from "../recrank/async";
import { AsyncGeneratorComponent } from "../recrank/asyncGenerator";
import { sleep } from "../utils";

const LoadingIndicator = fromCrank.async(async function LoadingIndicator() {
  await sleep(1000);
  return <div>Fetching a good boy...</div>;
});

const $RandomDog: AsyncComponent<{
  throttle?: boolean;
}> = async function RandomDog({ throttle = false }) {
  const res = await fetch("https://dog.ceo/api/breeds/image/random");
  const data = await res.json();
  if (throttle) {
    await sleep(1000);
  }
  return (
    <a href={data.message}>
      <img src={data.message} alt="A Random Dog" width="300" />
    </a>
  );
};
const RandomDog = fromCrank.async($RandomDog);

const $RandomDogLoader: AsyncGeneratorComponent<{
  throttle?: boolean;
}> = async function* RandomDogLoader({ throttle }) {
  for await ({ throttle } of this) {
    yield <LoadingIndicator />;
    yield <RandomDog throttle={throttle} />;
  }
};
const RandomDogLoader = fromCrank.asyncGenerator($RandomDogLoader);

export const RandomDogApp = fromCrank.stateful(function* RandomDogApp() {
  let throttle = false;

  while (true) {
    yield (
      <React.Fragment>
        <div>
          <button
            onClick={() => {
              throttle = !throttle;
              this.refresh();
            }}
          >
            Show me another dog.
          </button>
        </div>
        <RandomDogLoader throttle={throttle} />
      </React.Fragment>
    );
  }
});
