<template>
	<view class="list-card borderRadius boxShadow">
		<view class="status borderRadius-topRight borderRadius-bottomLeft" v-if="options.status || data.status">
			{{ (options.status || data.status) | fields }}
		</view>
		<view class="body">
			<view class="title">
				<image src="../../static/images/tabBar/project/leftLine.png" class="leftLine"></image>
				{{ (options.title || data.title) | fields }}
			</view>
			<view class="line" v-for="(item, index) in options.content" :key="index">
				<image class="icon" v-if="item.leftIcon" :src="item.leftIcon" mode="widthFix"></image>
				<view class="left">
					{{ item.left | fields }}
				</view>
				<template v-if="item.right">
					<view v-if="item.price" class="right price">
						{{ item.right | fields }}
					</view>
					<view v-else class="right">
						{{ item.right | fields }}
					</view>
				</template>
			</view>
		</view>
		<view class="operation border-top" v-if="btns && btns.length">
			<view class="view btn" hover-class="click" v-for="(item, index) in btns" :key="index"
				@click="handlerClick(item.type)">
				{{ item.name }}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "ListCard",
		methods: {
			handlerClick(type) {
				this.$emit('btn', type, this.data)
			}
		},
		computed: {
			btns() {
				return this.options?.btns?.filter(item => item.show === undefined || item.show(this.data)) ?? false;
			}
		},
		filters: {
			fields(val) {
				return val == null ? '' : val;
			}
		},
		props: {
			data: Object,
			options: {
				type: Object,
				default: () => {
					return {
						content: [],
						btns: []
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.list-card {
		background-color: #fff;
		margin: 30rpx;
		position: relative;

		.status {
			position: absolute;
			top: 0;
			right: 0;
			font-size: 24rpx;
			color: #fff;
			background-color: #CDAD93;
			padding: 0 15rpx;
		}

		.body {
			padding: 30rpx 30rpx 0 35rpx;

			.title {
				position: relative;
				font-weight: bold;
				font-size: 28rpx;
				margin-bottom: 30rpx;

				.leftLine {
					width: 6rpx;
					height: 32rpx;
					position: absolute;
					left: -35rpx;
					top: 0;
				}
			}

			.line {
				display: flex;
				align-items: center;
				margin-bottom: 30rpx;
				font-size: 26rpx;
				color: #666;

				.icon {
					width: 26rpx;
					margin-right: 15rpx;
				}

				.left {
					flex: 1;
					margin-right: 15rpx;
				}

				.right {
					flex: 1;
					text-align: right;

					&.price {
						color: $primaryColor;
					}
				}
			}

			.tips {
				margin-bottom: 30rpx;
				color: #E61515;
				font-size: 24rpx;
			}
		}

		.operation {
			color: #CDAD93;
			font-size: 26rpx;
			display: flex;

			.btn {
				padding: 30rpx 0;
				flex: 1;
				text-align: center;
				position: relative;

				&:not(:last-child)::after {
					content: '';
					width: 2rpx;
					height: 26rpx;
					background-color: rgba(51, 51, 51, .1);
					position: absolute;
					top: 50%;
					right: 0;
					margin-top: -13rpx;
				}
			}
		}
	}
</style>
