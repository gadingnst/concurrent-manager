export type ProcessStatus = 'pending'|'fulfilled'|'rejected';

export interface Process<T = unknown> {
  id: number;
  status: ProcessStatus;
  run: () => Promise<Process<T>>;
  response?: T;
  ms?: number;
}

export interface Queue<T = unknown> {
  id: number;
  processList: Process<T>[];
  ms?: number;
}

export interface QueueOptions {
  concurrent?: number;
  withMillis?: boolean;
}

/**
 * Author: Gading Nasution <contact@gading.dev>
 * @see: https://github.com/gadingnst/gading.dev/blob/main/scripts/cloudinary:sync.ts
 */
class ConcurrentManager<T = unknown> {
  private concurrent = 1;
  private counter = 0;
  private withMillis = false;
  private process: Process<T>[] = [];
  private queueList: Queue<T>[] = [];
  private dequeueList: Queue<T>[] = [];

  private queueSettledEvent: (data: Queue<T>) =>
    void = () => void 0;

  private processSettledEvent: (data: Process<T>)
    => void = () => void 0;

  constructor(initialOpts?: QueueOptions) {
    this.setup(initialOpts);
  }

  /**
   * Setup instance of ConcurrentManager
   * @param opts - options to setup
   * @returns {this} - instance of ConcurrentManager
   */
  public setup(opts?: QueueOptions): this {
    this.concurrent = opts?.concurrent ?? 0;
    this.withMillis = opts?.withMillis ?? false;
    return this;
  }

  /**
   * Enqueue process in queue list
   * @param idProcess - process to be run
   * @returns {void} - queue of process
   */
  private enqueueProcess(idProcess: number): void {
    const divided = idProcess / this.concurrent;
    const id = Math.ceil(isFinite(divided) ? divided : 1);
    if (this.concurrent > 0) {
      if (idProcess % this.concurrent === 1) {
        this.queueList[id - 1] = {
          id,
          processList: [this.process[idProcess - 1]]
        };
      }
      this.queueList[id - 1].processList.push(this.process[idProcess - 1]);
    }
  }

  /**
   * Dequeue process in queue list
   * @returns {void} - queue of process
   */
  private dequeueProcess(data: Queue<T>): void {
    this.queueList.pop();
    const id = data?.id ?? 0;
    if (data && id > 0) {
      this.dequeueList[id - 1] = data;
      this.queueSettledEvent(data);
    }
  }

  /**
   * @param callback - callback to be run when one queue has been settled
   * @returns {this} - instance of ConcurrentManager
   */
  public onQueueSettled(callback: (data: Queue<T>) => void): this {
    this.queueSettledEvent = callback;
    return this;
  }

  /**
   *
   * @param callback - callback to be run when one process has been settled
   * @returns {this} - instance of ConcurrentManager
   */
  public onProcessSettled(callback: (data: Process<T>) => void): this {
    this.processSettledEvent = callback;
    return this;
  }

  /**
   * Add async process to queue
   * @param process - async process to be added
   * @returns {number} - id of added process
   */
  public queue(process: (id: number) => Promise<T>): number {
    const idProcess = ++this.counter;
    const onSettled = (status: ProcessStatus) => (response?: T) => {
      const data = {
        ...this.getProcess(idProcess),
        response,
        status
      };
      this.process[idProcess - 1] = data;
      return data;
    };
    this.process.push({
      id: idProcess,
      status: 'pending',
      run: () => {
        const startPing = new Date().getTime();
        return process(idProcess)
          .then(onSettled('fulfilled'))
          .catch(onSettled('rejected'))
          .then((data) => {
            if (this.withMillis) {
              data.ms = this.getMillis(startPing);
            }
            this.processSettledEvent(data);
            return data;
          });
      }
    });
    this.enqueueProcess(idProcess);
    return idProcess;
  }

  /**
   * Get listed queue
   * @returns {Queue<T>[]} - multidimensional array of process
   */
  public getListedQueue(): Queue<T>[] {
    return this.queueList;
  }

  /**
   * Get listed dequeue
   * @returns {Queue<T>[]} - multidimensional array of process
   */
  public getListedDequeue(): Queue<T>[] {
    return this.dequeueList;
  }

  /**
   * Get process by id
   * @param id - id of process to be get
   * @returns {Process<T>} - process with id
   */
  public getProcess(id: number): Process<T> {
    return this.process[id - 1] || null;
  }

  /**
   * Get all process in instance
   * @param status - filter status of process to be get
   * @returns {Process<T>[]} - process with status
   */
  public getListedProcess(status?: ProcessStatus): Process<T>[] {
    return status
      ? this.process.filter(data => data.status === status)
      : this.process;
  }

  /**
   * Get time taken to run process or queue
   * @param startPing - start ping
   * @returns {number} - time in ms
   */
  private getMillis(startPing: number): number {
    const endPing = new Date().getTime();
    return Math.abs(endPing - startPing);
  }

  /**
   * Run all queued process with amount of concurrent by Promise
   * @returns {Promise<T[]>} - array of response
   */
  public async run(): Promise<Process<T>[]> {
    const { concurrent, process } = this;
    const queue = concurrent > 0 ? Math.ceil(process.length / concurrent) : 1;
    for (let i = 1; i <= queue; i++) {
      const offset = ((i - 1) * concurrent) + 1;
      const limit = i * concurrent;
      const queueProcess = limit > 0 ? process.slice(offset - 1, limit) : process;
      const startPing = new Date().getTime();
      await Promise.all(queueProcess.map(item => {
        if (item.status === 'pending') {
          return item.run();
        }
        return Promise.resolve(item);
      }));
      const data: Queue<T> = {
        id: i,
        processList: limit > 0 ? this.process.slice(offset - 1, limit) : this.process
      };
      if (this.withMillis) {
        data.ms = this.getMillis(startPing);
      }
      this.dequeueProcess(data);
    }
    return this.process;
  }
}

export default ConcurrentManager;
