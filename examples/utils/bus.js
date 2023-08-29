import { Vue } from 'examples/config';

function VueBus() {
  const bus = new Vue();

  Object.defineProperties(bus, {
    on: {
      get() {
        return this.$on.bind(this);
      },
    },
    once: {
      get() {
        return this.$once.bind(this);
      },
    },
    off: {
      get() {
        return this.$off.bind(this);
      },
    },
    emit: {
      get() {
        return this.$emit.bind(this);
      },
    },
  });

  return bus;
}

export default VueBus;
