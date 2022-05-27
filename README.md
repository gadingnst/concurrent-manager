# Concurrent Manager

## Why should I use it?
Sometimes you have to do any large concurrent processing using a `Promise` list and you don't want to `Promise.all` then because it will load all the promises into memory and will stop when any error occur. This package can help you with that! You can run concurrent promise by queuing it and set if it can continue processing even if any error occur. It has zero external dependencies.

## Installation
```bash
npm i concurrent-manager
```

## Usage

### Creating Instance
```javascript
import ConcurrentManager from 'concurrent-manager';

const concurrent = new ConcurrentManager({
  concurrent: 10, // max concurrent process to be run
  withMillis: true // add millisecond tracing to process
});
```

### Queueing Process
```javascript
concurrent.queue(() => {
  return doSomethingPromiseRequest();
});

// or
concurrent.queue(async() => {
  const response = await doSomethingPromiseRequest();
  return response;
});

// Run all queued process
console.log(concurrent.getListedProcess());
concurrent.run()
  .then(() => {
    // You can access that fulfilled & rejected are here
    console.log(concurrent.getListedProcess());
  });
```

But, you can run it independently too!
```javascript
const processId = concurrent.queue(() => {
  return doSomethingPromiseRequest();
});

concurrent.getProcess(processId)
  .run()
  .then((response) => {
    console.log('Response ==>', response);
  });
```

You can alse re-trying run promise if that has rejected.
```javascript
async function main() {
  concurrent.queue(() => {
    return doSomethingPromiseRequest();
  });

  // or
  concurrent.queue(async() => {
    const response = await doSomethingPromiseRequest();
    return response;
  });

  // Run all queued promises
  await concurrent.run()

  const rejected = concurrent.getProcess('rejected');

  concurrent.getListedProcess('rejected')
    .forEach((process) => process.run());
}
```

## License
`concurrent-manager` is freely distributable under the terms of the [MIT license](https://github.com/gadingnst/concurrent-manager/blob/master/LICENSE).

---
Built with ❤️ by [Sutan Gading Fadhillah Nasution](https://github.com/gadingnst) on 2022
