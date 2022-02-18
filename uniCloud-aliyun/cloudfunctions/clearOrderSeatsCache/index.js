'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	// 引用预定座位缓存表
	const order_seats_cache = db.collection('order_seats_cache');
	// 清空预定座位缓存信息
	await order_seats_cache.remove();

	return {
		message: '清除成功'
	};
};
