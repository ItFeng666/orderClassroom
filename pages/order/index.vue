<template>
	<view class="order common-page">
		<uni-forms class="form" border ref="form" :modelValue="formData" :rules="rules">
			<uni-forms-item label="预约人" required name="username">
				<view class="content">
					{{ formData.username }}
				</view>
			</uni-forms-item>
			<uni-forms-item label="教室大小" required name="classroom_size">
				<uni-data-checkbox v-model="formData.classroom_size" :localdata="classroom_size"
					@change="classroomSizeChange">
				</uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item label="教室" required name="classroom">
				<view class="content" hover-class="click" @click="selectClassroom">
					<text>{{ classroom_name }}</text>
					<image class="link" src="../../static/images/rightBtn.png" mode="widthFix"></image>
				</view>
			</uni-forms-item>
			<uni-forms-item label="座位" required name="seat">
				<view class="content" hover-class="click" @click="selectSeat">
					<view class="tags">
						<uni-tag class="tag" type="primary" v-for="(item, index) in formData.seat" :key="index"
							:text="item">
						</uni-tag>
					</view>
					<image class="link" src="../../static/images/rightBtn.png" mode="widthFix"></image>
				</view>
			</uni-forms-item>
			<uni-forms-item label="联系电话" required name="phone">
				<uni-easyinput v-model="formData.phone" type="number" />
			</uni-forms-item>
			<!-- <uni-forms-item label="预约时间" required name="order_time">
				<uni-datetime-picker v-model="formData.order_time" type="datetimerange" :start="now" rangeSeparator="至"
					return-type="timestamp" />
			</uni-forms-item> -->
		</uni-forms>
		<button class="btn" type="primary" @click="order">预约</button>

		<w-picker timeout default-type="value" :visible.sync="select_classroom_picker" mode="selector"
			:options="classroom" @confirm="selectClassroomConfirm"></w-picker>
	</view>
</template>

<script>
	import {
		CLASSROOMSIZE
	} from '../../service/const.js';
	export default {
		data() {
			return {
				// 控制选择教室
				select_classroom_picker: false,
				// 教室大小列表
				classroom_size: CLASSROOMSIZE.map(item => ({
					text: item.label,
					value: item.value
				})),
				// 教室列表
				classroom: [],
				// 表单数据
				formData: {
					username: uni.getStorageSync('userinfo').username,
					classroom_size: CLASSROOMSIZE[0].value,
					classroom: '',
					seat: [],
					phone: '',
					// order_time: '',
				},
				// 表单规则
				rules: {
					classroom_size: {
						rules: [{
							required: true,
							errorMessage: '请选择教室大小',
						}]
					},
					classroom: {
						rules: [{
							required: true,
							errorMessage: '请选择教室',
						}]
					},
					seat: {
						rules: [{
							required: true,
							errorMessage: '请选择座位',
						}]
					},
					phone: {
						rules: [{
							required: true,
							errorMessage: '请输入联系电话',
						}, {
							pattern: '^1[3|4|5|8][0-9]\\d{4,8}$',
							errorMessage: '联系电话格式错误',
						}]
					},
					// order_time: {
					// 	rules: [{
					// 		required: true,
					// 		errorMessage: '请选择预约时间',
					// 	}]
					// },
				}
			}
		},
		computed: {
			classroom_name() {
				return this.classroom.find(item => item.value === this.formData.classroom)?.label ?? '';
			},
			now() {
				return (new Date()).getTime();
			}
		},
		methods: {
			// 预约
			order() {
				console.log(this.formData);
				// 校验表单
				this.$refs.form.validate().then(formData => {
					let data = {
						...formData
					};
					// 格式化预约时间
					// delete data.order_time;
					// data.order_start_time = formData.order_time[0];
					// data.order_endtime = formData.order_time[1];
					console.log(data);
					uni.showModal({
						title: '操作',
						content: '是否提交预约',
						success: res => {
							if (res.confirm) {
								const userinfo = uni.getStorageSync('userinfo');
								// 提交预约
								this.$http('setOrder', {
										user_id: userinfo._id,
										username: userinfo.username,
										classroom_size: data.classroom_size,
										classroom_id: data.classroom,
										seats: data.seat,
										phone: data.phone,
									})
									.then(res => {
										uni.showModal({
											title: '提示',
											content: '预约成功',
											showCancel: false,
											success: res => {
												if (res.confirm) {
													uni.navigateBack({
														delta: 1
													})
												}
											}
										})
									});
							}
						}
					})
				});
			},
			// 切换教室大小
			classroomSizeChange() {
				// 初始化教室、座位
				this.$refs.form.setValue('classroom', '');
				this.$refs.form.setValue('seat', []);
				this.formData.classroom = '';
				this.formData.seat = [];
			},
			// 点击选择座位
			selectSeat() {
				if (!this.formData.classroom) {
					uni.showModal({
						title: '提示',
						content: '请先选择教室',
						showCancel: false
					})
					return;
				}
				// 清空订阅选择座位，防止用户直接退出选择座位页面，未触发发送选择座位事件
				uni.$off('seatSelected');
				// 订阅选择座位事件
				uni.$once('seatSelected', this.seatSelected);
				uni.navigateTo({
					url: `/pages/selectPage/selectSeat?classroom=${this.formData.classroom}&name=${this.classroom_name}`
				})
			},
			// 接收选择座位事件数据
			seatSelected(e) {
				this.formData.seat = e;
			},
			// 点击选择教室
			selectClassroom() {
				this.$http('getClassroom', {
						size: this.formData.classroom_size
					})
					.then(res => {
						// 获取对应教室大小下的教室
						this.classroom = res.map(item => ({
							label: item.name,
							value: item._id
						}));
						// 弹出选择教室弹框
						this.select_classroom_picker = true;
					});
			},
			// 确认选择教室
			selectClassroomConfirm(e) {
				this.formData.classroom = e.obj.value;
				// 初始化座位
				this.$refs.form.setValue('seat', []);
				this.formData.seat = [];
			},
		},
	}
</script>

<style lang="scss" scoped>
	.order {
		padding: 50rpx;

		.form {
			margin-bottom: 100rpx;

			.content {
				border-radius: 10rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 100%;

				.link {
					margin-left: 10rpx;
					width: 18rpx;
				}

				.tags {
					flex: 1;
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

		.btn {
			width: 100%;
		}
	}
</style>
