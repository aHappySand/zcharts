import { Vue } from 'examples/config';

import {
  ZCheckbox,
  ZMap,
} from 'main/index';

const components = [
  ZCheckbox,
  ZMap,
];


components.forEach((component) => {
  Vue.use(component);
});
