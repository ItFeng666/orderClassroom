'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	const {
		size,
		name,
		id
	} = event;

	const where = {};
	if (size != null) {
		where.size = size;
	}
	if (name) {
		where.name = name;
	}
	if (id) {
		where._id = id;
	}
	
	// 引用教室表
	const classroom = db.collection('classroom');
	// 查询教室信息
	const classroom_data = await classroom.where(where).get();
	
	return classroom_data.data;
};
