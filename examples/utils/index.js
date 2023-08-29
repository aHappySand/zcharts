
export function parseQueryString(url) {
	if (!url) {
		return {};
	}
	const regPara = /([^&=\?]+)=([\w\W]*?)(&|$|#)/g;

	const ret = {};
	let result = null;
	// eslint-disable-next-line
	while ((result = regPara.exec(url)) != null) {
		// eslint-disable-next-line
		ret[result[1]] = result[2];
	}
	return ret;
}


export function removeUrlAnchor(url) {
	const index = url.indexOf('#');
	return index === -1 ? url : url.substring(0, index);
}
