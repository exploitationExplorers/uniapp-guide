<template>
	<view class="main">
		<view class="statistics-header">
			<view class="header_flex">
				<text>退补金额：</text>
				<text>{{moneyList.refundSupplementAmount || 0 }}</text>
			</view>
			<view class="header-txt">
				<text>注：</text>
				<text>退补金额=导游个人收入+导游现付+导游交团+导游还回</text>
			</view>
		</view>
		<view class="details">
			<view class="lists">
				<view v-for="(item,index) in dataList" :key="index">
					<view class="lists_header" @click="toggleList(item)">
						<text class="tit">{{item.title}}</text>
						<text class="num">0</text>
					</view>
					<view :class="{'shows': true}" v-show="item.toggleShow">
						<view :class="{'list': true}" v-for="(v,i) in item.array" :key="i" @click="navLink(v.amount)">
							<text class="txt">{{v.name}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getStatistics
	} from '@/request/api/index.js'

	export default {
		data() {
			return {
				moneyList: {},
				dataList: []
			}
		},
		methods: {
			toggleList(item) {
				item.toggleShow = !item.toggleShow;
			},
			navLink(options) {
				uni.navigateTo({
					url: `/pages/myAccountBook/details?number=${encodeURIComponent(options)}`,
					animationType: 'slide-in-right',
					animationDuration: 300,
					success: () => {
						console.log('跳转成功')
					}
				})
			},
			buildDataList(m) {
				return [{
						title: "导游个人收入",
						toggleShow: true,
						array: [{
								name: "导服费",
								amount: m.refundSupplementAmount || 0
							},
							{
								name: "导游结算款",
								amount: m.guideServiceFee || 0
							},
							{
								name: "自费返佣",
								amount: m.guideSettlementAmount || 0
							},
							{
								name: "景区返佣",
								amount: m.selfPaidRebate || 0
							}
						]
					},
					{
						title: "导游现付",
						toggleShow: true,
						array: [{
								name: "旅游车现付",
								amount: m.touristVehicleCashPayment || 0
							},
							{
								name: "酒店现付",
								amount: m.hotelCashPayment || 0
							},
							{
								name: "房间现付",
								amount: m.roomCashPayment || 0
							},
							{
								name: "保险现付",
								amount: m.insuranceCashPayment || 0
							},
							{
								name: "其他现付",
								amount: m.otherCashPayment || 0
							},
							{
								name: "外转现付",
								amount: m.externalTransferCashPayment || 0
							},
							{
								name: "餐饮现付",
								amount: m.diningCashPayment || 0
							},
							{
								name: "景区现付",
								amount: m.scenicSpotCashPayment || 0
							},
							{
								name: "门票现付",
								amount: m.ticketCashPayment || 0
							},
							{
								name: "自费现付",
								amount: m.optionalExpenseCashPayment || 0
							},
							{
								name: "自费项现付",
								amount: m.optionalItemCashPayment || 0
							},
							{
								name: "交通现付",
								amount: m.transportationCashPayment || 0
							},
							{
								name: "签证现付",
								amount: m.visaCashPayment || 0
							}
						]
					},
					{
						title: "导游交回",
						toggleShow: true,
						array: [{
							name: "导游交款",
							amount: m.guidePayment || 0
						}]
					},
					{
						title: "导游还回",
						toggleShow: true,
						array: [{
								name: "导游借款",
								amount: m.guideLoan || 0
							},
							{
								name: "带有代收",
								amount: m.withCollection || 0
							},
							{
								name: "导游管理费",
								amount: m.guideManagementFee || 0
							},
							{
								name: "自费现收",
								amount: m.optionalExpenseReceived || 0
							},
							{
								name: "景区现收",
								amount: m.scenicSpotReceived || 0
							},
							{
								name: "导游结算款代收",
								amount: m.guideSettlementCollection || 0
							},
							{
								name: "其他收入",
								amount: m.otherIncome || 0
							}
						]
					}
				];
			}
		},
		async onLoad(options) {
			const res = await getStatistics({
				id: options.id
			});
			this.moneyList = res;
			this.dataList = this.buildDataList(res);
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