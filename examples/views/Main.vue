<template>
  <component :is="component" @loaded="handleLoaded"></component>
</template>

<script>

export default {
  name: 'Main',
  data() {
    return {
      component: null,
      count: 1,
    };
  },
  mounted() {
    this.getCurrComponent();
  },
  methods: {
    getCurrComponent: async function getCurrComponent() {
      const name = this.$route?.query?.name;
      const args = name.split(/\/|%2F/);
      let pageFolder = 'demo';
      let pageName = name;
      if (args.length > 1) {
        pageName = args.pop();
        pageFolder = args.join('/');
      }
      const type = '.vue';

      this.component = name
        ? resolve => require([`examples/views/${pageFolder}/${pageName}${type}`], resolve)// () => import(`@/views/${pageFolder}/${pageName}`)
        : resolve => require(['examples/views/error/404.vue'], resolve);// () => import(`@/views/error/404.vue`)
    },
    handleLoaded() {
      this.$nextTick(() => {
        this.highlightCode();
      });
    },
    highlightCode() {
      // const blocks = document.querySelectorAll('pre:not(.hljs) code');
      // Array.prototype.forEach.call(blocks, hljs.highlightBlock);
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
