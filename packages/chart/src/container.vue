<template>
  <div class="fill"></div>
</template>

<script>
  export default {
    name: 'container',
    mounted() {

    },
    methods: {
      getContainerPosition() {
        const { $el } = this;
        const {
          width,
          height,
          top,
          right,
          bottom,
          left
        } = $el.getBoundingClientRect();

        return {
          width,
          height,
          top,
          right,
          bottom,
          left,
          offsetLeft: $el.offsetLeft,
          offsetTop: $el.offsetTop,
          target: $el,
        };
      },
    }
  };
</script>

<style scoped>

</style>
