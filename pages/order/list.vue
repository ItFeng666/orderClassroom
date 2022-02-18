<template>
	<view class="order-list common-page">
		<view class="container">
			<scroll-view scroll-y :style="{ height: listHeight + 'px' }" refresher-enabled @scrolltolower="getMore"
				@refresherrefresh="reload" :refresher-triggered="refresh">
				<list-card :data="item" :options="cardOptions(item)" v-for="(item, index) of list" :key="index"
					@btn="cardBtn"></list-card>
				<uni-load-more v-if="!noData && list.length > 0" :status="loadmoreStatus">
				</uni-load-more>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				listHeight: 0, // 列表高度
				isAdmin: false, // 是否是管理员
				list: [], // 列表数据
				pageNum: 1, // 当前页码
				pageSize: 10, // 每页多少条数据
				noData: false, // 是否有数据
				loadmoreStatus: 'more', // 加载更多状态 more（loading前）、loading（loading中）、noMore（没有更多了）
				refresh: false, // 控制下拉刷新显示
			}
		},
		methods: {
			cardBtn(type, data) {
				if (type === 'select') {
					uni.$emit('docSelected', data);
					uni.navigateBack({
						delta: 1
					})
				}
			},
			cardOptions(item) {
				return {
					content: this.modal.columns.map(item1 => {
						let data = JSON.parse(JSON.stringify(item));
						item1.field.split('.').reduce((prev, cur) => data = prev[cur], data);
						return {
							left: item1.title,
							right: data
						}
					}),
					btns: [{
						name: '选择',
						type: 'select',
					}]
				}
			},
			// 获取列表数据
			load(refresh, more) {
				this.$http('getOrder').then(res => {
					// if (!res.list || (this.pageNum == 1 && !res.list.length)) {
					// 	// 如果页码是第一页，并且没有数据
					// 	this.noData = true;
					// 	this.list = [];
					// } else {
					// 	this.noData = false;
					// 	if (res.list.length < this.pageSize) {
					// 		// 加载数据数量小于一页总条数
					// 		this.loadmoreStatus = 'noMore';
					// 	} else {
					// 		// 如果加载的条数大于等于每页条数，则清除无数据状态
					// 		this.loadmoreStatus = 'more';
					// 	}
					// 	let arr = [];
					// 	for (let item of res.list) {
					// 		arr.push(item);
					// 	}
					// 	console.log(arr);
					// 	this.nkAggs = res.aggs;
					// 	this.list = more ? this.list.concat(arr) : arr;
					// }
					// if (refresh) {
					// 	this.refresh = false;
					// }
				})
			},
			// 上拉加载更多
			getMore() {
				if (this.loadmoreStatus === 'more') {
					this.pageNum++;
					this.loadmoreStatus = 'loading';
					this.load(false, true);
				}
			},
			// 下拉刷新
			reload() {
				if (!this.refresh) {
					this.refresh = true;
					this.pageNum = 1;
					this.load(true);
				}
			},
		},
		onLoad(options) {
			// 设置小程序导航标题
			uni.setNavigationBarTitle({
				title: options.title
			});
			if (options.isAdmin == 1) {
				this.isAdmin = true;
			}

			this.load(true);
		},
		onReady() {
			const timer = setTimeout(() => {
				clearTimeout(timer);
				const query = uni.createSelectorQuery().in(this);
				query.select('.order-list .container').boundingClientRect(data => {
					this.listHeight = data.height;
				}).exec();
			}, 1000);
		}
	}
</script>

<style lang="scss" scoped>
	.order-list {
		overflow-y: hidden !important;

		.container {
			flex: 1;
			overflow-y: hidden;
			background-color: #F2F2F2;
		}
	}
</style>
