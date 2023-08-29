export const setStorage = (key, value, days) => {
  const Days = days || 1; // 默认保留1天
  const exp = new Date();
  const data = {
    value,
    expiryTime: exp.getTime() + Days * 24 * 60 * 60 * 1000,
  };
  localStorage[key] = JSON.stringify(data);
};

export const getStorage = (key) => {
  const data = localStorage[key];
  if (!data || data === 'null') {
    return null;
  }
  const now = Date.parse(new Date());
  let obj;
  try {
    obj = JSON.parse(data);
  } catch (e) {
    return null;
  }
  if (obj.expiryTime === 0 || obj.expiryTime > now) {
    return obj.value;
  }
  return null;
};

export const removeStorage = (key) => {
  localStorage.removeItem(key);
};

export const clearStorage = () => {
  localStorage.clear();
};

export const getSession = (key) => {
  const data = sessionStorage[key];
  if (!data || data === 'null') {
    return null;
  }
  return JSON.parse(data).value;
};

export const setSession = (key, value) => {
  const data = {
    value,
  };
  sessionStorage[key] = JSON.stringify(data);
};

export const removeSession = (key) => {
  sessionStorage.removeItem(key);
};
