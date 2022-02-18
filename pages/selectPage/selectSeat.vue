<template>
	<view class="selectSeat common-page">
		<view class="container">
			<view class="tips">
				<view class="tip selected">
					当前已选:
					<uni-icons class="seat selected" color="green" custom-prefix="iconfont" type="icon-seat" size="30">
					</uni-icons>
				</view>
				<view class="tip selected">
					不可选择:
					<uni-icons class="seat selected" color="red" custom-prefix="iconfont" type="icon-seat" size="30">
					</uni-icons>
				</view>
				<view class="tip unSelected">
					未选:
					<uni-icons class="seat" color="white" custom-prefix="iconfont" type="icon-seat" size="30">
					</uni-icons>
				</view>
			</view>
			<uni-title type="h3" title="黑板" align="center"></uni-title>
			<view class="seats">
				<view v-for="(item, index) in seats" :key="item.name" class="seat textCenter"
					:style="{ width: `${100/col}%` }" @click="selectSeat(item.name)">
					<uni-icons :color="seatColor(item.name)" custom-prefix="iconfont" type="icon-seat" size="30">
					</uni-icons>
				</view>
			</view>
		</view>
		<view class="confirmBox">
			<view class="selected" v-if="seatSelectedOfMy.length">
				<view class="title">
					已选择（点击标签取消选择的座位）：
				</view>
				<view class="tags">
					<uni-tag class="tag" type="primary" v-for="(item, index) in seatSelectedOfMy" :key="item"
						:text="item" @click="del(item)">
					</uni-tag>
				</view>
			</view>
			<button class="btn" type="primary" @click="confirm">确定</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				seats: [], // 所有座位
				seatSelectedOfMy: [], // 我已选座位
				seatSelectedOfOther: [], // 他人已选择的座位
				col: null, // 当前教室有多少列
				user_id: uni.getStorageSync('userinfo')._id, // 用户id
				classroom_id: null, // 教室id
			}
		},
		methods: {
			del(name) {
				uni.showModal({
					title: '操作',
					content: `是否取消选择${name}`,
					success: res => {
						if (res.confirm) {
							this.seatSelectedOfMy.splice(this.seatSelectedOfMy.findIndex(item => item ===
								name), 1);
							this.setOrderSeatsCacheApi(name, false);
						}
					}
				})
			},
			// 确定选择
			confirm() {
				if (!this.seatSelectedOfMy.length) {
					uni.showModal({
						title: '提示',
						content: '请选择座位',
						showCancel: false,
					})
				} else {
					uni.$emit('seatSelected', this.seatSelectedOfMy);
					uni.navigateBack({
						delta: 1
					})
				}
			},
			// 选择或取消锁定座位接口
			setOrderSeatsCacheApi(name, select) {
				this.$http('setOrderSeatsCache', {
						user_id: this.user_id,
						classroom_id: this.classroom_id,
						seat: name,
						select
					})
					.then(res => {
						// 设置定时器调用接口，防止上个接口loading关闭，这个接口页面不触发loading
						const timer = setTimeout(() => {
							clearTimeout(timer);
							this.initSelectedOfOther();
						})
					});
			},
			// 选择座位
			selectSeat(name) {
				if (this.isSelectedOfOther(name)) return;

				let select = false;
				if (!this.isSelectedOfMy(name)) {
					select = true;
				}
				this.setOrderSeatsCacheApi(name, select);
			},
			// 初始化他人选择座位
			initSelectedOfOther() {
				this.$http('getOrderSeatsCache', {
						classroom_id: this.classroom_id,
					})
					.then(res => {
						if (res?.length) {
							const seatSelectedOfMy = [];
							const seatSelectedOfOther = [];
							for (let item of res) {
								if (item.cache && item.user_id === this.user_id) {
									seatSelectedOfMy.push(item.seat);
								} else {
									seatSelectedOfOther.push(item.seat);
								}
							}
							this.seatSelectedOfMy = seatSelectedOfMy;
							this.seatSelectedOfOther = seatSelectedOfOther;
						} else {
							this.seatSelectedOfOther = [];
						}
					});
			},
			// 初始化座位配置
			initSeats(id) {
				this.$http('getClassroom', {
						id
					})
					.then(res => {
						if (res[0]) {
							// 设置定时器调用接口，防止上个接口loading关闭，这个接口页面不触发loading
							const timer = setTimeout(() => {
								clearTimeout(timer);
								this.initSelectedOfOther();
							})
							const {
								row,
								col,
								_id
							} = res[0];
							this.classroom_id = _id;
							this.col = col;
							const TOTAL = row * col; // 座位总数
							for (let i = 0; i < TOTAL; i++) {
								const ROW = Math.ceil((i + 1) / col);
								const COL = (i === 0 || this.seats[i - 1].col === col) ? 1 : this.seats[i - 1].col + 1;
								this.seats.push({
									row: ROW,
									col: COL,
									name: `${ROW}-${COL}`,
									selected: false,
								})
							}
						} else {
							uni.showModal({
								title: '提示',
								content: '未找到教室',
								showCancel: false,
								success: res => {
									if (res.confirm) {
										uni.navigateBack({
											delta: 1
										})
									}
								}
							})
						}
					});
			}
		},
		computed: {
			// 自己是否已选择该座位
			isSelectedOfMy() {
				return function(name) {
					return this.seatSelectedOfMy.includes(name);
				}
			},
			// 他人是否已选择该座位
			isSelectedOfOther() {
				return function(name) {
					return this.seatSelectedOfOther.includes(name);
				}
			},
			// 座位颜色
			seatColor() {
				return function(name) {
					if (this.isSelectedOfOther(name)) {
						return 'red';
					} else if (this.isSelectedOfMy(name)) {
						return 'green';
					} else {
						return 'white';
					}
				}
			}
		},
		onLoad(options) {
			// 设置小程序导航标题
			uni.setNavigationBarTitle({
				title: options.name
			});

			this.initSeats(options.classroom);
		}
	}
</script>

<style lang="scss" scoped>
	.selectSeat {
		background-color: #c5c5c5;
		overflow-y: hidden;

		.container {
			flex: 1;
			overflow-y: auto;

			.tips {
				padding: 20rpx 0;
				display: flex;
				justify-content: center;

				.tip {
					display: flex;
					align-items: center;

					&:not(:last-child) {
						margin-right: 20rpx;
					}
				}
			}

			.seats {
				padding: 20rpx;
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;

				.seat {
					box-sizing: border-box;
					padding: 10rpx;
					line-height: 100rpx;
				}
			}
		}

		.confirmBox {
			overflow-y: auto;
			box-sizing: border-box;
			max-height: 400rpx;
			padding: 50rpx;
			background-color: #fff;
			border-radius: 10rpx 10rpx 0 0;

			.tags {
				display: flex;
				flex-wrap: wrap;
				padding: 20rpx 0;

				.tag {
					margin-right: 20rpx;
					margin-bottom: 30rpx;
				}
			}
		}
	}
</style>
