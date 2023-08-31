import { Vue } from 'examples/config';

import {
  ZCheckbox,
  ZMap,
  ZScatter
} from 'main/index';

const components = [
  ZCheckbox,
  ZMap,
  ZScatter
];


components.forEach((component) => {
  Vue.use(component);
});
