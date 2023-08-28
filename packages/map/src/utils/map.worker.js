import mapMange from './map.manage.js';

const handler = mapMange();

self.addEventListener('message', async (e) => {
  const { type } = e.data;
  const handle = handler[type];
  if (handle) {
    handle.call(handler, e);
  }
});
