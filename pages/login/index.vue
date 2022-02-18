<template>
	<view class="login common-page">
		<uni-forms class="form" ref="form" :modelValue="formData" :rules="rules">
			<uni-forms-item label="用户名" name="username">
				<uni-easyinput v-model="formData.username" type="text" placeholder="请输入用户名" />
			</uni-forms-item>
			<uni-forms-item label="密码" name="password">
				<uni-easyinput v-model="formData.password" type="password" placeholder="请输入密码" />
			</uni-forms-item>
		</uni-forms>
		<button class="btn" type="primary" :loading="loginLoading" @click="login">登录/注册</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loginLoading: false, // 登录loading
				// 表单数据
				formData: {
					username: '',
					password: ''
				},
				rules: {
					username: {
						rules: [{
							required: true,
							errorMessage: '请输入用户名',
						}]
					},
					password: {
						rules: [{
							required: true,
							errorMessage: '请输入密码',
						}]
					}
				}
			}
		},
		methods: {
			login() {
				if (this.loginLoading) return;
				this.$refs.form.validate().then(({
					username,
					password
				}) => {
					this.loginLoading = true;
					this.$http('login', {
							username,
							password
						}, false)
						.then(res => {
							uni.setStorageSync('userinfo', res);
							uni.reLaunch({
								url: '/pages/menu/index'
							})
						}).finally(() => {
							this.loginLoading = false;
						});
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login {
		padding: 50rpx;

		.form {
			margin-bottom: 100rpx;
		}

		.btn {
			width: 100%;
		}
	}
</style>
