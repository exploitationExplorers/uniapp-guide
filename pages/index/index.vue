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

		<!-- 列表 -->
		<view class="list">
			<view class="listRow" v-for="(item,index) in arrayList" :key="index">
				<view :class="['left',item.code == 1 ? 'active' : 'notActive']">
					<text v-if="item.code == 1">已完团</text>
					<text v-else>未完团</text>
				</view>
				<view class="right">
					<view class="rightTitle">
						<text class="tit">{{item.projectname}}</text>
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
		</view>


	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				dataObj: {},
				arrayList: []
			}
		},
		async onLoad() {
			const app = getApp()
			// if (!app.globalData.token) {
			// 	uni.redirectTo({
			// 		url: '/pages/login/index'
			// 	});
			// }
			uni.request({
				url: 'https://m1.apifoxmock.com/m1/5178036-4843222-default/api/total',
				method: 'POST',
				data: {},
				success: (res) => {
					this.dataObj = res.data
				}
			});
			uni.request({
				url: 'https://m1.apifoxmock.com/m1/6729370-6440575-default/api/tasklist',
				method: 'POST',
				data: {
					usename: "chuxin",
					password: "12345678"
				},
				success: (res) => {
					this.arrayList = res.data
				}
			});
		},
		methods: {
              link(){
				  uni.navigateTo({
				  	url:"/pages/takePhoto/index"
				  })
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
	.list {
		padding: 0rpx 20rpx;
	}

	.listRow {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-radius: 16rpx;
		margin-top: 30rpx;
		box-shadow: 0rpx 0rpx 10rpx rgba(0, 0, 0, 0.1);
		padding: 10rpx;

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
					font-size: 36rpx;
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