# recrank

This project demonstrates a way to use [crank](https://crank.js.org)-like patterns in react. It is naively designed and not well tested, do NOT take it too seriously :P

## It does work

[Code sandbox demo](https://codesandbox.io/s/github/EnixCoda/recrank)

> Note: support for async component has not been fully implemented yet

## More than crank

I designed a new kind of component, named `extendedStatefulComponent`, which should be able to take the place of async components. Its example usage is revealed below. I found it more handy in some use cases than async generator component, especially for handling async data.

Please read [crank's async generator component usage](https://crank.js.org/guides/async-components#async-generator-components) before going on and compare usages.

```jsx
async function* RandomDogLoader({ throttle }) {
  for await ({ throttle } of this) {
    // emit async operations before yielding to not block rendering
    const res = this.emitAsync(fetch('https://dog.ceo/api/breeds/image/random'))
    yield <LoadingIndicator /> // render loading indicator while retrieving async data
    const data = await (await res).json() // thanks to `emitAsync`, render will continue from here when above fetch is done
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
```
