/* eslint-disable no-console */

import ConcurrentManager from '../dist';

async function main() {
  const concurrent = new ConcurrentManager({
    concurrent: 10, // max concurrent process to be run
    withMillis: true // add millisecond tracing to process
  });

  concurrent.onQueueSettled((q) => {
    console.log('Queue settled', q);
  });

  for (let i = 0; i < 15; i++) {
    concurrent.queue(async() => new Promise((resolve, reject) => {
      setTimeout(() => {
        if (i % 3 === 0) {
          return reject(new Error('rejected'));
        } else {
          return resolve('gading.dev/' + i);
        }
      }, i * 250);
    }));
  }

  await concurrent.run();

  // See all process
  console.log('All Process ==>', concurrent.getListedProcess());

  // See all process with fulfilled status
  console.log('Fulfilled Process ==>', concurrent.getListedProcess('fulfilled'));

  // See all process with rejected status
  console.log('Rejected Process ==>', concurrent.getListedProcess('rejected'));
}

main();
