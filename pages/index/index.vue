<template>
	<view class="content">
		<view class="index_images">
			<image class="index-background" src="/static/pic_01.webp"></image>
			<view class="total-data">
				<view class="lefts">
					<view class="items">
						<text>总团量</text>
						<text>{{dataObj.team_size}}</text>
					</view>
					<view class="items">
						<text>总收入</text>
						<text>{{dataObj.income}}元</text>
					</view>
				</view>
				<view class="right">
					<view class="items">
						<text>今年收入</text>
						<text>{{dataObj.revenue}}元</text>
					</view>
					<view class="items">
						<text>本月收入</text>
						<text>{{dataObj.month_income}}元</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 列表区域 - 使用 scroll-view -->
		<scroll-view class="list-scroll" scroll-y :style="{ height: scrollHeight + 'px' }" @scrolltolower="loadMoreData"
			:refresher-enabled="false">
			<view class="list">
				<view class="listRow" v-for="(item,index) in displayList" :key="index">
					<view :class="['left',item.code == 1 ? 'active' : 'notActive']">
						<text v-if="item.code == 1">已完团</text>
						<text v-else>未完团</text>
					</view>
					<view class="right">
						<view class="rightTitle">
							<text class="tit">
								<{{item.projectname}}>
							</text>
							<text>{{item.premium_group}}</text>
						</view>
						<view class="flexs_row">
							<text>团号：{{item.teamn_umber}}</text>
							<text v-if="item.awaiting_filing == 0" class="active">待审核</text>
							<text v-else class="notActive">财务审核</text>
						</view>
						<view class="times">
							<text>出团时间：{{item.tart_time}}</text>
							<text>完团时间：{{item.end_time}}</text>
						</view>
						<view class="monet">收入：{{item.earnings | toFixed(1)}}元</view>
					</view>
				</view>

				<!-- 加载状态 -->
				<view class="load-more">
					<text v-if="loading">加载中...</text>
					<text v-else-if="!hasMore && displayList.length > 0">没有更多数据了</text>
					<text v-else-if="displayList.length === 0">暂无数据</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getIndex,
		getIndexList
	} from '@/request/api/index.js'
	export default {
		data() {
			return {
				dataObj: {},
				arrayList: [], // 完整数据
				displayList: [], // 显示的数据
				pageSize: 2, // 每次加载5条
				currentPage: 1,
				hasMore: true,
				loading: false, // 添加加载状态
				isLoading: false, // 防止重复加载
				scrollHeight: 400 // 滚动区域高度，会在onReady中动态计算
			}
		},
		async onLoad() {
			const app = getApp()
			const params1 = {}
			if(!app.globalData.token){
				uni.redirectTo({
					url:"/pages/featureIntro/index"
				})
			}
			const res = await getIndex(params1)
			if (res) {
				this.dataObj = res
			}
			uni.request({
				url: 'https://m1.apifoxmock.com/m1/6729370-6440575-default/api/tasklist',
				method: 'POST',
				data: {
					usename: "chuxin",
					password: "12345678"
				},
				success: (res) => {
					this.arrayList = res.data || [];
					this.loadMoreData();
				},
			});
		},
		onReady() {
			this.calculateScrollHeight();
		},
		methods: {
			calculateScrollHeight() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.content').boundingClientRect(data => {
					if (data) {
						uni.getSystemInfo({
							success: (res) => {
								const windowHeight = res.windowHeight;
								const imageHeight = 400;
								const imageHeightPx = imageHeight / 2;
								this.scrollHeight = windowHeight - imageHeightPx - 20;
								console.log('scrollHeight:', this.scrollHeight);
							}
						});
					}
				}).exec();
			},

			async loadMoreData() {
				if (this.isLoading || !this.hasMore) {
					return
				}

				this.loading = true
				this.isLoading = true

				const startIndex = (this.currentPage - 1) * this.pageSize
				const endIndex = startIndex + this.pageSize
				const newData = this.arrayList.slice(startIndex, endIndex)
				if (newData.length > 0) {
					this.displayList = [...this.displayList, ...newData];
					this.currentPage++
					if (endIndex >= this.arrayList.length) {
						this.hasMore = false
					}
				} else {
					this.hasMore = false
				}

				this.loading = false
				this.isLoading = false
			}
		},
		filters: {
			toFixed(value, digits) {
				if (value === null || value === undefined) return '0.0';
				return Number(value).toFixed(digits);
			}
		}
	}
</script>
<style scoped lang="scss">
	.list-scroll {

		::-webkit-scrollbar {
			display: none;
			width: 0;
			height: 0;
			color: transparent;
		}
	}

	.list {
		padding: 0rpx 20rpx;
	}

	::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
		color: transparent;
	}

	page {
		height: 100%;
		background-color: #f6f6f6;
		-ms-overflow-style: none;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
			width: 0;
			height: 0;
			background: transparent;
		}
	}

	.content {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.load-more {
		text-align: center;
		padding: 30rpx;
		color: #999;
		font-size: 28rpx;
		position: relative;
	}

	.listRow {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-radius: 16rpx;
		margin-top: 30rpx;
		box-shadow: 0rpx 0rpx 10rpx rgba(0, 0, 0, 0.1);
		padding: 10rpx;
		background-color: #fff;
		min-height: 200rpx;

		.left {
			background-color: #92B48D;
			width: auto;

			text {
				writing-mode: vertical-lr;
				display: inline-block;
			}
		}

		.left.active {
			background-color: #C8CAC7;
		}

		.right {
			flex: 1;
			padding-left: 20rpx;

			>view {
				margin-top: 6rpx;
			}

			.flexs_row {
				display: flex;
				justify-content: space-between;
				align-items: center;

				>text:nth-child(2) {
					display: inline-block;
					margin-right: 20rpx;
					padding: 6rpx 12rpx;
					border-radius: 8rpx;
				}

				.active {
					background-color: #92B48D;
				}

				.notActive {
					background-color: #DCDCDC;
				}
			}

			.monet {
				border-top: 1px solid #f6f6f6;
				margin-top: 20rpx;
				padding: 20rpx 0;
			}

			.rightTitle {
				display: flex;
				justify-content: flex-start;
				align-items: center;

				.tit {
					font-size: 32rpx;
					color: #111;
				}
			}

			.times {
				text {
					display: block;
				}

				>text:nth-child(2) {
					margin-top: 10rpx;
				}
			}
		}
	}

	.index_images {
		position: relative;
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;

		.index-background {
			width: 100%;
			height: 400rpx;
			filter: blur(3px);
		}

		.text-area {
			width: 100%;
		}

		.total-data {
			position: absolute;
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: wrap;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 85%;
			height: 100%;

			text {
				color: #fff;
				display: block;
			}

			.lefts {
				width: 77%;

				.items:nth-child(n+2) {
					margin-top: 60rpx;
				}
			}

			.right {
				flex: 1;

				.items:nth-child(n+2) {
					margin-top: 60rpx;
				}

				text {
					display: inline-block;
				}
			}
		}
	}
</style>