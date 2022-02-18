<template>
	<view class="menu common-page">
		<uni-list>
			<uni-list-item title="预约教室" link to="/pages/order/index"></uni-list-item>
			<uni-list-item title="我的预约" link to="/pages/order/list?title=我的预约"></uni-list-item>
			<uni-list-item title="预约管理" link to="/pages/order/list?title=预约管理&isAdmin=1" v-if="isAdmin"></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isAdmin: uni.getStorageSync('userinfo').username === 'admin', // 是否是管理员账户
			}
		},
		methods: {

		},
	}
</script>

<style lang="scss" scoped>
	.menu {}
</style>
