'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	const {
		user_id,
		username,
		classroom_size,
		classroom_id,
		seats,
		phone,
		// order_start_time,
		// order_end_time
	} = event;

	if (!user_id || !username || classroom_size == null || !classroom_id || !seats || !phone
	 // || !order_start_time || !order_end_time
	 ) {
		return {
			code: 501,
			message: '请检查传参是否填写正确'
		}
	}

	// 引用预定信息表
	const order_info = db.collection('order_info');
	const order_info_add = await order_info.add({
		user_id,
		username,
		classroom_size,
		classroom_id,
		phone,
		create_time: new Date().getTime()
	});
	
	if (order_info_add.id) {
		// 新增成功
		
		// 引用预定信息座位表
		const order_seats_info = db.collection('order_seats_info');
		const order_seats_info_add = await order_seats_info.add(seats.map(item => ({
			user_id,
			order_classroom_id: order_info_add.id, 
			classroom_id,
			seat: item,
			is_delete: false,
			create_time: new Date().getTime()
		})));
		if (order_seats_info_add.ids.length) {
			// 引用预定座位缓存表
			const order_seats_cache = db.collection('order_seats_cache');
			// 清空该教室对应学生锁定座位缓存
			await order_seats_cache.where({
				classroom_id,
				user_id
			}).remove();
			return {
				message: '预定成功'
			}
		} else {
			return {
				code: 500,
				message: '预定信息座位新增失败'
			}
		}
	} else {
		return {
			code: 500,
			message: '预定信息新增失败'
		}
	}
};
