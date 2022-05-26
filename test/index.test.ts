import PromiseQueue, { Queue } from '../src';

describe('PromiseQueue', () => {
  it('should be defined', () => {
    expect(PromiseQueue).toBeDefined();
  });

  const queue = new PromiseQueue({ concurrent: 6, withMillis: true });
  const data: Queue[] = [];
  queue.onQueueSettled((q) => {
    console.log(q);
    data.push(q);
  });
  for (let i = 0; i < 15; i++) {
    queue.add(async() => new Promise((resolve, reject) => {
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
    expect(queue.getListedQueue().length).toEqual(3)
    expect(queue.getListedDequeue().length).toEqual(0);
    expect(queue.getProcess(1).status).toEqual('pending');
    expect(queue.getProcess(2).status).toEqual('pending');
    expect(queue.getProcess(2).ms).toBeUndefined();
    expect(queue.getProcess(2).response).toBeUndefined();
  });

  it('After run queue', async() => {
    await queue.run();
    expect(data.length).toBe(3);
    expect(queue.getListedQueue().length).toEqual(0);
    expect(queue.getListedDequeue().length).toEqual(3);
    expect(queue.getProcess(1).status).toEqual('rejected');
    expect(queue.getProcess(2).status).toEqual('fulfilled');
    expect(queue.getProcess(2).ms).toBeDefined();
    expect(queue.getProcess(2).response).toBeDefined();
  });
});
