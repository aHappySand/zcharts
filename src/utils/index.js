import { debounce as _debounce } from 'lodash-es';

export const debounce = _debounce;

export function coverOption(option, defaultOpt) {
  for (const field in defaultOpt) {
    // eslint-disable-next-line no-prototype-builtins
    if (option.hasOwnProperty(field)) {
      defaultOpt[field] = option[field];
    }
  }
}

export function fieldOption(option, fields) {
  // eslint-disable-next-line no-shadow
  const fieldOption = {};
  fields.forEach(field => {
    // eslint-disable-next-line no-prototype-builtins
    if (option.hasOwnProperty(field)) {
      fieldOption[field] = option[field];
    }
  });
  return fieldOption;
}

export function jsonToObject(_this, option) {
  for (const key in option) {
    _this[key] = option[key];
  }
}
