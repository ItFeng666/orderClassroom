function responseError(reject, err) {
	uni.showModal({
		title: '提示',
		content: err.message || '系统错误',
		showCancel: false,
	})
	reject(err);
}

export default function(name, data, isLoading = true) {
	return new Promise((resolve, reject) => {
		if (isLoading) {
			uni.showLoading({
				mask: true,
				title: '正在加载'
			});
		}
		uniCloud.callFunction({
				name,
				data
			})
			.then(res => {
				let { result } = res;
				if (result.code === undefined || (result.code !== undefined && result.code === 200)) {
					resolve(result);
				} else {
					responseError(reject, result);
				}
			}).catch(err => {
				responseError(reject, err);
			}).finally(() => {
				uni.hideLoading();
			});
	})
}
