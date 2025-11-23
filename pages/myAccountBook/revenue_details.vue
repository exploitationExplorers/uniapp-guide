<template>
	<view class="main">
		<view class="statistics-header">
			<view class="header_flex">
				<text>退补金额：</text>
				<text>0</text>
			</view>
			<view class="header-txt">
				<text>注：</text>
				<text>退补金额=导游个人收入+导游现付+导游交团+导游还回</text>
			</view>
		</view>
		<view class="details">
			<view class="lists">
				<view v-for="(item,index) in dataList" :key="index" @click="navLink()">
					<view class="lists_header">
						<text class="tit">{{item.title}}</text>
						<text class="num">0</text>
					</view>
					<view class="list" v-for="(v,i) in item.array" :key="i">
						<text class="txt">{{v.name}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				dataList: [{
						title: "导游个人收入",
						array: [{
								name: "导服费",
							},
							{
								name: "导游结算款",
							},
							{
								name: "自费返佣",
							},
							{
								name: "景区返佣"
							}
						]
					}, {
						title: "导游现付",
						array: [{
								name: "旅游车现付",
							},
							{
								name: "酒店现付",
							},
							{
								name: "房间现付",
							},
							{
								name: "保险现付",
							},
							{
								name: "其他现付",
							},
							{
								name: "外转现付",
							},
							{
								name: "餐饮现付",
							},
							{
								name: "景区现付",
							},

							{
								name: "门票现付",
							},
							{
								name: "自费现付",
							},
							{
								name: "自费项现付",
							},
							{
								name: "交通现付",
							},
							{
								name: "签证现付"
							}
						]
					},
					{
						title: "导游交回",
						array: [{
							name: "导游交款"
						}, ]
					},
					{
						title: "导游还回",
						array: [{
								name: "导游借款",
							},
							{
								name: "带有代收",
							},
							{
								name: "导游管理费",
							},
							{
								name: "导游借款",
							},
							{
								name: "自费现收",
							},
							{
								name: "景区现收",
							},
							{
								name: "导游结算款代收",
							},
							{
								name: "其他收入"
							}
						]
					}
				]
			}
		},
		methods: {
			navLink() {
				uni.navigateTo({
					url: '/pages/myAccountBook/details',
					animationType: 'slide-in-right',
					animationDuration: 300,
					success: () => {
						console.log('跳转成功')
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.statistics-header {
		background-color: #F6F6F6;
		padding: 20rpx 0;

		.header_flex {
			display: flex;
			padding: 0rpx 20rpx;
			justify-content: flex-start;
			align-items: center;

			text {
				color: #909297;
			}
		}

		.header-txt {
			display: flex;
			padding: 0rpx 20rpx;
			justify-content: flex-start;
			margin-top: 20rpx;
			align-items: center;

			text:nth-child(2) {
				color: #909297;
				font-size: 24rpx;
			}

			text:nth-child(1) {
				color: #D84E4E;
				font-size: 24rpx;
			}
		}
	}

	.details {
		background-color: #FFFDF6;

		.lists {
			padding: 40rpx 20rpx;

			>view:nth-child(n+2) {
				margin-top: 40rpx;
			}

			.list {
				background-color: #fff;
				padding: 10rpx 10rpx;
				margin-top: 8rpx;
				font-size: 24rpx;
				border: 2rpx solid #eee;
				position: relative;
			}

			.list::after {
				content: "";
				display: block;
				width: 40rpx;
				height: 40rpx;
				position: absolute;
				top: 50%;
				right: 0%;
				transform: translate(-50%, -50%);
				background-image: url(/static/pic_09.png);
			}
		}

		.lists_header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32rpx;

			.tit {
				color: #495248;
				font-size: 30rpx;
			}

			.num {
				color: #E09B6C;
				font-size: 36rpx;
				display: inline-block;
				margin-right: 33rpx;
			}
		}

	}
</style>