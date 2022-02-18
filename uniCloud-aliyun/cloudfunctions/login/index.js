'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	const {
		username,
		password
	} = event;

	// 参数校验
	if (!username || !password) {
		return {
			code: 501,
			message: '请检查传参是否填写正确'
		}
	}

	// 引用用户账号表
	const user_account = db.collection('user_account');
	// 引用用户信息表
	const user_info = db.collection('user_info');
	// 查询该用户是否注册
	const user_account_data = await user_account.where({
		username
	}).get();

	if (user_account_data.data.length > 0) {
		// 已注册

		// 判断密码是否正确
		const user = user_account_data.data.find(item => item.password === password);
		if (user) {
			// 密码正确

			// 查询该用户在用户信息表的数据
			const user_info_data = await user_info.where({
				_id: user.user_id
			}).get({
				getOne: true
			});

			return user_info_data.data;
		} else {
			// 密码错误
			return {
				code: 402,
				message: '密码错误'
			}
		}
	} else {
		// 未注册

		// 在用户信息表新增该用户数据
		const user_info_add = await user_info.add({
			username,
			create_time: new Date().getTime()
		});

		if (user_info_add.id) {
			// 用户信息表新增成功

			// 在用户账户表新增数据
			await user_account.add({
				user_id: user_info_add.id,
				username,
				password
			});
			return {
				_id: user_info_add.id,
				username,
			};
		} else {
			// 用户信息表新增失败
			return {
				code: 500,
				message: '用户信息新增失败'
			}
		}
	}
};
