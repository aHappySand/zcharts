import handler from './chart.manage.js';

const manager = handler();
self.addEventListener('message', async (e) => {
  const { type } = e.data;
  const handle = manager[type];
  if (handle) {
    handle.call(manager, e);
  }
});
