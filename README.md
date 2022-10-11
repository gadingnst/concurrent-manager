# Concurrent Manager

[![npm](https://img.shields.io/npm/v/concurrent-manager.svg)](https://www.npmjs.com/package/concurrent-manager)
[![npm](https://img.shields.io/npm/dt/concurrent-manager.svg)](https://npm-stat.com/charts.html?package=concurrent-manager)
[![GitHub issues](https://img.shields.io/github/issues/gadingnst/concurrent-manager.svg)](https://github.com/gadingnst/concurrent-manager/issues)

A simple and fast way to manage concurrent promise tasks with Queue Data Structure.

## Table of Contents
- [Concurrent Manager](#concurrent-manager)
  - [Table of Contents](#table-of-contents)
  - [Why should I use it?](#why-should-i-use-it)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Creating Instance](#creating-instance)
    - [Queueing Process](#queueing-process)
  - [Publishing](#publishing)
  - [License](#license)
  - [Feedbacks and Issues](#feedbacks-and-issues)

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

## Publishing
- Before pushing your changes to Github, make sure that `version` in `package.json` is changed to newest version. Then run `npm install` for synchronize it to `package-lock.json`
- After your changes have been merged on branch `main`, you can publish the packages by creating new Relase here: https://github.com/gadingnst/concurrent-manager/releases/new
- Create new `tag`, make sure the `tag` name is same as the `version` in `package.json`.
- You can write Release title and notes here. Or you can use auto-generated release title and notes.
- Click `Publish Release` button, then wait the package to be published.

## License
`concurrent-manager` is freely distributable under the terms of the [MIT license](https://github.com/gadingnst/concurrent-manager/blob/master/LICENSE).

## Feedbacks and Issues
Feel free to open issues if you found any feedback or issues on `concurrent-manager`. And feel free if you want to contribute too! 😄

---
Built with ❤️ by [Sutan Gading Fadhillah Nasution](https://github.com/gadingnst) on 2022
