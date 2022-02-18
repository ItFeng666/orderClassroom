'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	const {
		user_id
	} = event;

	// if (!phone) {
	// 	return {
	// 		code: 501,
	// 		message: '请检查传参是否填写正确'
	// 	}
	// }
	
	// 引用预定信息表
	// const order_classroom_info = db.collection('order_classroom_info');
	const order_classroom_info_data = db.collection('order_classroom_info').field({
		_id: true
	}).getTemp();
	const res = await db.collection(order_classroom_info_data, 'order_seats_info').get();
	
	return res
};
