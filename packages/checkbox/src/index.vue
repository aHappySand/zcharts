<template>
  <div class="checkbox-container">
    <el-checkbox
      :indeterminate="isIndeterminate"
      v-model="checkAll"
      @change="handleCheckAllChange">全选</el-checkbox>
    <el-checkbox-group v-model="currVal" @change="handleCheckedCitiesChange">
      <template v-for="(item, index) in items">
        <el-checkbox :label="item.value" :key="'cb'+item.value + index">
          <span v-html="item.label"></span>
        </el-checkbox>
        <slot name="after" :item="item"></slot>
      </template>
    </el-checkbox-group>
  </div>
</template>

<script>
  export default {
    name: 'ZCheckbox',
    props: {
      /**
       * 选项，2种类型
       * [val1, val2, ...]
       * 或
       * [{value: 12, label: 'xxx'}, ...]
       */
      options: {
        type: Array,
        default: () => [],
      },
      value: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        items: [],
        checkAll: false,
        isIndeterminate: false,
      };
    },
    computed: {
      currVal: {
        get() {
          return this.value;
        },
        set(newVal) {
          this.$emit('input', newVal);
        }
      },
    },
    watch: {
      options: {
        immediate: true,
        handler(newVal, oldVal) {
          this.setOptions(newVal);
        },
        deep: true,
      },

    },
    created() {
      this.setOptions(this.options);
    },
    methods: {
      setOptions(opt) {
        if (opt.length > 0) {
          if (typeof opt[0] === 'object') {
            // TODO::验证包含value,label
            this.items = opt;
          } else {
            this.items = opt.map((lab) => ({
                value: lab,
                label: lab,
              }));
          }
          if (this.items.length === this.currVal.length) {
            this.checkAll = true;
          } else if (this.currVal.length > 0) {
            this.isIndeterminate = true;
          }
        }
      },
      handleCheckAllChange(val) {
        this.currVal = val ? this.items.map((item) => item.currVal) : [];
        this.isIndeterminate = false;
      },
      handleCheckedCitiesChange(value) {
        const checkedCount = value.length;
        this.checkAll = checkedCount === this.items.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.items.length;
      },
    }
  };
</script>

<style scoped lang="less">
  .checkbox-container {
    /deep/ .el-checkbox-group {
      display: flex;
      flex-wrap: wrap;
    }

    /deep/ .el-checkbox:last-of-type {
      margin-right: 30px;
    }
  }
</style>
