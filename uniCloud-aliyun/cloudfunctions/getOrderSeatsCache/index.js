'use strict';
const db = uniCloud.database();
const {
	SEATSELECTEDCACHE
} = require('../../../service/uniCloud_const.json');
// 获取当天的时间戳的方法
function getTodayTimestamp() {
	const date = new Date();
	const today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
	return new Date(today).getTime();
}
exports.main = async (event, context) => {
	const {
		classroom_id
	} = event;

	if (!classroom_id) {
		return {
			code: 501,
			message: '请检查传参是否填写正确'
		}
	}
	const where = {
		classroom_id
	};

	const dbCmd = db.command // 取指令
	const field = {
		_id: false,
		user_id: true,
		seat: true,
		classroom_id: true
	}

	// 引用预定座位缓存表
	const order_seats_cache = db.collection('order_seats_cache');
	// 引用预定座位表
	const order_seats_info = db.collection('order_seats_info');
	// 查询预定座位缓存信息-在锁定时间以内的
	const order_seats_cache_data = await order_seats_cache.where({
		...where,
		create_time: dbCmd.gte(new Date().getTime() - SEATSELECTEDCACHE)
	}).field(field).get();
	// 查询预定座位信息-当天的
	const order_seats_info_data = await db.collection('order_seats_info').where({
		...where,
		create_time: dbCmd.gte(getTodayTimestamp())
	}).field(field).get();

	// 去重
	const data = [];
	for (let item of order_seats_info_data.data) {
		data.push(item);
	}
	for (let item of order_seats_cache_data.data) {
		if (data.every(item1 => item1.seat !== item.seat)) {
			// 缓存数据添加标识
			item.cache = true;
			data.push(item);
		}
	}

	return data;
};
