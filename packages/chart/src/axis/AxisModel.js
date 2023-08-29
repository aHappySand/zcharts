import { coverOption, fieldOption } from '../../../../src/utils/index.js';

function AxisModel(option = {}) {
  const defaultOptions = {
    axisType: 'x',
    show: true,
    gridIndex: 0,
    position: 'bottom', // 'top'
    offset: 0,
    type: 'category',
    min: 0,
    max: 100,
    splitNumber: 5,
    data: [],
  };

  coverOption(option, defaultOptions);
  this.option = defaultOptions;

  const axisNameField = ['name', 'nameLocation', 'nameTextStyle', 'nameGap'];
  const axisNameOpt = fieldOption(option, axisNameField);
  this.axisName = new AxisName(axisNameOpt);

  this.axisLine = new AxisLine(option.axisLine || {});

  this.axisTick = new AxisTick(option.axisTick || {});

  this.axisLabel = new AxisLabel(option.axisLabel || {});
}

function AxisName(option = {}) {
  const defaultOptions = {
    name: '',
    nameLocation: 'center',
    nameTextStyle: {
      color: '#5d5d5d',
      fontSize: 12,
    },
    nameGap: 15,
  };

  this.option = Object.assign({}, defaultOptions, option);
}

function AxisLine(option) {
  const defaultOptions = {
    show: true,
    symbol: 'none',
    lineStyle: {
      color: '#333',
      width: 1,
      type: 'solid',
    }
  };

  this.option = Object.assign({}, defaultOptions, option);
}

function AxisTick(option = {}) {
  const defaultOptions = {
    show: true,
    inside: false,
    length: 5,
    lineStyle: {
      color: '#fafafa',
      width: 1,
      type: 'solid',

    }
  };

  this.option = Object.assign({}, defaultOptions, option);
}

function AxisLabel(option) {
  const defaultOptions = {
    show: true,
    inside: false,
    length: 5,
    rotate: 0,
    margin: 8,
    formatter: '{value}',
    color: '#333',
    width: 'auto',
    height: 'auto',
    lineStyle: {
      color: '#fafafa',
      width: 1,
      type: 'solid',

    }
  };

  this.option = Object.assign({}, defaultOptions, option);
}
