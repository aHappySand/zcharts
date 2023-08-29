<template>
  <ZMap :source-data="sourceMap"></ZMap>
</template>

<script>
  import sourceMapData from './sourceMapData';

  export default {
    name: 'ZMap1',
    data() {
      this.sourceMap = sourceMapData;
      return {

      };
    },
  };
</script>

<style scoped>

</style>
