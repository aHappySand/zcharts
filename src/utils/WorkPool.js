let taskId = 1;
// simple implementation of a thread pool
function Pool(size) {
  // 等待的队列
  this.taskQueue = [];
  // 可以创建worker的队列
  this.workerQueue = [];
  this.poolSize = size;

  this.init();
}


// runner work tasks in the pool
function WorkerThread(parentPool) {
  // eslint-disable-next-line no-underscore-dangle
  const _this = this;

  this.parentPool = parentPool;
  this.workerTask = {};

  // for now assume we only get a single callback from a worker
  // which also indicates the end of this worker.
  function dummyCallback(event) {
    // pass to original callback
    _this.workerTask.callback({ event, wt: _this });
  }

  this.run = function run(workerTask) {
    this.workerTask = workerTask;
    // create a new web worker
    if (this.workerTask.script != null) {
      const Worker = this.workerTask.script;
      // eslint-disable-next-line no-underscore-dangle
      const _worker = new Worker();
      this.worker = _worker;
      _worker.addEventListener('message', dummyCallback, false);
      _worker.postMessage(workerTask.startMessage, workerTask.transfer);
    }
  };


  this.free = function free() {
    if (this.worker) {
      this.worker.terminate();
      this.parentPool.freeWorkerThread(this);
      this.worker = null;
    }
  };

  this.postMessage = function postMessage(msg, transfer) {
    if (this.worker) {
      this.worker.postMessage(msg, transfer);
    }
  };
}


Pool.prototype = {
  addWorkerTask(workerTask) {
    if (this.workerQueue.length > 0) {
      // get the worker from the front of the queue
      const workerThread = this.workerQueue.shift();
      workerThread.run(workerTask);
    } else {
      // no free workers,
      this.taskQueue.push(workerTask);
    }
  },

  init() {
    // create 'size' number of worker threads
    for (let i = 0; i < this.poolSize; i++) {
      this.workerQueue.push(new WorkerThread(this));
    }
  },

  freeWorkerThread(workerThread) {
    if (this.taskQueue.length > 0) {
      // don't put back in queue, but execute next task
      const workerTask = this.taskQueue.shift();
      workerThread.run(workerTask);
    } else {
      this.workerQueue.push(workerThread);
    }
  },

  stopTask(workerTask) {
    const index = this.taskQueue.findIndex(task => task.id === workerTask.id);
    if (index !== -1) {
      this.taskQueue.splice(index, 1);
      return true;
    }
    return false;
  }
};

// task to run
function WorkerTask({
 script, callback, msg, transfer
}) {
  this.id = taskId++;
  this.script = script;
  this.callback = callback;
  this.startMessage = msg;
  this.transfer = transfer;
}

export {
  Pool,
  WorkerTask,
};
