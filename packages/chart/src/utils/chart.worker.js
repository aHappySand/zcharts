import handler from './chart.manage.js';

self.addEventListener('message', async (e) => {
  const { type } = e.data;
  const handle = handler[type];
  if (handle) {
    handle.call(handler, e);
  }
});
