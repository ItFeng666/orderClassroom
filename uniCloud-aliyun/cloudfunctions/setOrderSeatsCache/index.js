'use strict';
const db = uniCloud.database();
const {
	SEATSELECTEDCACHE
} = require('../../../service/uniCloud_const.json');
exports.main = async (event, context) => {
	const {
		user_id,
		classroom_id,
		seat,
		select
	} = event;

	if (!classroom_id || !user_id || !seat || select == null) {
		return {
			code: 501,
			message: '请检查传参是否填写正确'
		}
	}

	const dbCmd = db.command // 取指令
	// 引用预定座位缓存表
	const order_seats_cache = db.collection('order_seats_cache');
	if (select) {
		// 选择该座位
		// 查询预定座位缓存信息
		const order_seats_cache_count = await order_seats_cache.where({
			classroom_id,
			user_id,
			seat,
			create_time: dbCmd.gte(new Date().getTime() - SEATSELECTEDCACHE)
		}).count();

		if (order_seats_cache_count.total === 0) {
			await order_seats_cache.add({
				user_id,
				classroom_id,
				seat,
				create_time: new Date().getTime()
			});
		}
	} else {
		// 取消选择
		await order_seats_cache.where({
			classroom_id,
			user_id,
			seat
		}).remove();
	}

	return {
		message: '操作成功'
	};
};
