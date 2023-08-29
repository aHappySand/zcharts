<template>
  <span v-if="false"></span>
</template>
<script>
import { registerPlugin } from '@/config';
import lodash from 'lodash-es';

registerPlugin({ name: 'lodash', instance: lodash });

export default {
  name: 'LodashPlugin',
  created() {
    this.$emit('loaded');
  },
};
</script>
