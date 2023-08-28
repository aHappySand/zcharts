// eslint-disable-next-line import/extensions
import { Pool, WorkerTask as _WorkerTask } from './WorkPool.js';

const num = (navigator.hardwareConcurrency
  && navigator.hardwareConcurrency > 2
  && (navigator.hardwareConcurrency - 2)) || 2;

const pool = new Pool(num);

export const createWorkerTask = function (worker, callback, msg, transfer) {
  const task = new _WorkerTask({
    script: worker,
    callback,
    msg,
    transfer
  });
  pool.addWorkerTask(task);
  return task;
};

export const getWorkerPool = pool;
