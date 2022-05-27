import PromiseManager, { Queue } from '../src';

describe('PromiseManager Testing', () => {
  it('should be defined', () => {
    expect(PromiseManager).toBeDefined();
  });

  const data: Queue[] = [];
  const concurrent = new PromiseManager({
    concurrent: 6,
    withMillis: true
  });

  concurrent.onQueueSettled((q) => {
    data.push(q);
  });

  for (let i = 0; i < 15; i++) {
    concurrent.queue(async() => new Promise((resolve, reject) => {
      setTimeout(() => {
        if (i % 3 === 0) {
          return reject(new Error('rejected'));
        } else {
          return resolve('gading.dev/' + i);
        }
      }, i * 25);
    }));
  }

  it('Before run queue', () => {
    expect(data.length).toBe(0);
    expect(concurrent.getListedQueue().length).toEqual(3);
    expect(concurrent.getListedDequeue().length).toEqual(0);
    expect(concurrent.getProcess(1).status).toEqual('pending');
    expect(concurrent.getProcess(2).status).toEqual('pending');
    expect(concurrent.getProcess(2).ms).toBeUndefined();
    expect(concurrent.getProcess(2).response).toBeUndefined();
  });

  it('After run queue', async() => {
    await concurrent.run();
    expect(data.length).toBe(3);
    expect(concurrent.getListedQueue().length).toEqual(0);
    expect(concurrent.getListedDequeue().length).toEqual(3);
    expect(concurrent.getProcess(1).status).toEqual('rejected');
    expect(concurrent.getProcess(2).status).toEqual('fulfilled');
    expect(concurrent.getProcess(2).ms).toBeDefined();
    expect(concurrent.getProcess(2).response).toBeDefined();
  });
});
