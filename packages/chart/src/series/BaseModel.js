// eslint-disable-next-line import/extensions
import { coverOption } from '../../../../src/utils/index.js';

export function SeriesBaseModel(option) {
  const defaultOption = {
    type: '',
    id: '',
    name: '',
    colorBy: 'series',
    xAxisIndex: 0,
    yAxisIndex: 0,
    symbol: 'emptyCircle',
    symbolSize: 4,
    showSymbol: true,
    stack: '',
    data: [],
  };

  coverOption(option, defaultOption);
  this.option = defaultOption;
}

export function SeriesDataModel(option) {
  const defaultOption = {
    name: '',
    value: '',
    groupId: '',
    symbol: 'circle', // 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
    symbolSize: 4,
  };

  this.option = Object.assign({}, defaultOption, option);
}
