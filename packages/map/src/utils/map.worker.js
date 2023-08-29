// eslint-disable-next-line import/extensions
import mapMange from './map.manage.js';

const handler = mapMange();

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', async (e) => {
  const { type } = e.data;
  const handle = handler[type];
  if (handle) {
    handle.call(handler, e);
  }
});
