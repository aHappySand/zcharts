import { Vue } from '@/config';
import SvgIcon from './SvgIcon.vue';

Vue.component('svg-icon', SvgIcon);

const req = require.context('../../assets/svg', false, /\.svg$/);
const requireAll = (requireContext) => requireContext.keys().map(requireContext);
requireAll(req);
