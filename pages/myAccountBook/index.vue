<template>
	<view>
		<view class="flex-row">
			<view class="travel-agency" @click="togglePickerData">
				<text>旅行社</text>
			</view>
			<view class="time" @click="togglePickerTime">
				<text>时间</text>
			</view>
			<view class="picker-container" v-if="visible">
				<picker-view :indicator-style="indicatorStyle" :value="value" @change="bindChange" class="picker-view">
					<picker-view-column>
						<view class="item" v-for="(item,index) in years" :key="index">{{item}}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" v-for="(item,index) in months" :key="index">{{item}}月</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" v-for="(item,index) in days" :key="index">{{item}}日</view>
					</picker-view-column>
				</picker-view>
				<view class="picker-actions">
					<button class="btn-confirm" @click="confirmPicker">确定</button>
				</view>
			</view>
			<view class="picker-list" v-if="showData">
				<text v-for="(item,index) in dataObj" :key="index" @click="toggleData(item.name)">{{item.name}}</text>
			</view>
		</view>



		<view class="content">
			<!-- 内容区域 -->
			<view class="content-flex">
				<view class="datas">
					<text>现付总额</text>
					<text>0</text>
				</view>
				<view class="datas">
					<text>收入总额</text>
					<text>0</text>
				</view>
				<view class="datas">
					<text>交回总额</text>
					<text>0</text>
				</view>
			</view>
			<view class="settlement-amount">
				<text>结账总额</text>
				<text>0</text>
			</view>
			<view class="paid">
				<view class="lists">
					<text>已结账</text>
					<text>0</text>
				</view>
				<view class="lists">
					<text>未结账</text>
					<text>0</text>
				</view>
			</view>
		</view>


		<view class="data_lists">
			<view class="list" v-for="(item,index) in dataLists" :key="index" @click="linkUrl(item.id)">
				<view class="title">{{item.tourist_destination}}</view>
				<view>
					<text>团号：</text>
					<text>{{item.team_number}}</text>
				</view>
				<view>
					<text>团期：</text>
					<text>{{item.time_start}} - {{item.time_end}}</text>
				</view>
				<view>
					<text>来源：</text>
					<text>{{item.source}}</text>
				</view>
				<view class="num">
					<text>导游现收：</text>
					<text class="money">{{ formatMoney(item.received_cash) }}</text>
				</view>
				<view class="num">
					<text>个人收入：</text>
					<text class="money">{{ formatMoney(item.received_cash) }}</text>
				</view>
				<view class="num">
					<text>导游交回：</text>
					<text class="money">{{ formatMoney(item.return_amount) }}</text>
				</view>
				<view class="num">
					<text>导游现收：</text>
					<text class="money">{{ formatMoney(item.received_amount) }}</text>
				</view>
				<view class="num">
					<text>结账金额：</text>
					<text class="money active">{{ formatMoney(item.settlement_amount) }}</text>
				</view>
				<view class="num">
					<text>已结金额：</text>
					<text class="money">{{ formatMoney(item.settled_amount) }}</text>
				</view>
				<view class="num">
					<text>未结金额：</text>
					<text class="money">{{ formatMoney(item.outstanding_amount) }}</text>
				</view>
			</view>
		</view>


	</view>
</template>

<script>
	export default {
		data() {
			const date = new Date()
			const showData = false
			const years = []
			const year = date.getFullYear()
			const months = []
			const dataObj = []
			const month = date.getMonth() + 1
			const days = []
			const dataLists = [{
					tourist_destination: "四川九寨沟",
					team_number: "001-20181231-T-006",
					time_start: "2018-12-30",
					time_end: "2018-12-31",
					source: "火柴头客户测试用版1",
					received_cash: "9527.98",
					personal_income: "157",
					return_amount: "5639",
					received_amount: "4827",
					settlement_amount: "135",
					settled_amount: "4828",
					outstanding_amount: "9978",
					id: 1,
				},
				{
					tourist_destination: "四川理小路",
					team_number: "001-20181231-T-006",
					time_start: "2018-12-30",
					time_end: "2018-12-31",
					source: "火柴头客户测试用版1",
					received_cash: "9527.98",
					personal_income: "157",
					return_amount: "5639",
					received_amount: "4827",
					settlement_amount: "135",
					settled_amount: "4828",
					outstanding_amount: "9978",
					id: 2,
				}
			]
			const day = date.getDate()
			for (let i = 1990; i <= date.getFullYear(); i++) {
				years.push(i)
			}
			for (let i = 1; i <= 12; i++) {
				months.push(i)
			}
			for (let i = 1; i <= 31; i++) {
				days.push(i)
			}
			return {
				years,
				months,
				days,
				year,
				dataLists,
				month,
				showData,
				day,
				dataObj,
				value: [years.length - 1, month - 1, day - 1],
				visible: false,
				indicatorStyle: `height: 50px;`,
				selectedDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
			}
		},
		methods: {
			bindChange(e) {
				const val = e.detail.value
				this.year = this.years[val[0]]
				this.month = this.months[val[1]]
				this.day = this.days[val[2]]
			},
			formatMoney(value) {
				if (value === null || value === undefined) return '0.00'
				const num = parseFloat(value)
				if (isNaN(num)) return '0.00'
				return num.toFixed(2)
			},
			togglePickerData() {
				this.showData = !this.showData
				this.visible = false
			},

			togglePickerTime() {
				this.visible = !this.visible
				this.showData = false
			},
			toggleData(val) {
				this.showData = false
			},

			confirmPicker() {
				this.visible = false
				this.updateSelectedDate()
			},
			linkUrl(value) {
				uni.navigateTo({
					url: '/pages/myAccountBook/revenue_details',
					animationType: 'slide-in-right',
					animationDuration: 300,
					success: () => {
						console.log('跳转成功')
					}
				})
			}

		},
		onLoad() {
			uni.request({
				url: 'https://m1.apifoxmock.com/m1/5178036-4843222-default/api/data',
				method: 'POST',
				data: {},
				success: (res) => {
					this.dataObj = res.data
				}
			});
		},
	}
</script>

<style scoped lang="scss">
	.data_lists::before {
		content: "";
		display: block;
		width: 100%;
		height: 30rpx;
		background-color: #f6f6f6;
		position: absolute;
		bottom: 0;
		left: 0;
	}

	.data_lists {
		margin-top: 26rpx;
		padding: 0rpx 40rpx 30rpx;
		border-top: 2rpx solid #eee;
		position: relative;

		.money.active {
			color: #E99E5A;
		}

		.list {
			border-left: 2rpx solid #eee;
			padding: 30rpx 0rpx;

			>view:nth-child(n+2) {
				margin-top: 20rpx;
			}

			.num {
				margin-top: 10rpx !important;
				display: flex;
				justify-content: space-between;
				align-items: center;

				text {
					display: block;
					width: 50%;
					text-align: left;
					font-size: 28rpx;
				}

				>text:nth-child(2) {
					text-align: right;
				}
			}

			>view {
				padding-left: 40rpx;
			}

			>view:nth-child(4) {
				margin-bottom: 40rpx;
			}

			.title {
				position: relative;
				/* padding-left: 30rpx; */
			}

			.title::after {
				content: "";
				display: block;
				width: 20rpx;
				height: 20rpx;
				border-radius: 50%;
				background-color: #129271;
				position: absolute;
				top: 50%;
				left: 0%;
				transform: translate(-50%, -50%);
			}
		}
	}

	.content-flex {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 25rpx;

		.datas {
			width: calc(100% /3);
			text-align: center;
		}

		text {
			color: #fff;
			display: block;
			font-size: 24rpx;
		}
	}

	.paid {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 30rpx;
		width: 100%;
		border-top: rgba(0, 0, 0, .1) 2rpx solid;

		.lists {
			display: flex;
			justify-content: space-between;
			width: 50%;
			align-items: center;
			color: #fff;
			padding: 30rpx 25rpx;
		}

		.lists:nth-child(1) {
			border-right: rgba(0, 0, 0, .1) 2rpx solid;
		}
	}

	.settlement-amount {
		text-align: center;
		display: block;
		margin-top: 26rpx;

		text {
			color: #fff;
			display: block;
		}
	}

	.flex-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		background: #fff;
		position: relative;
		border-bottom: 1rpx solid #eee;
	}

	.travel-agency,
	.time {
		flex: 1;
		text-align: center;
		padding: 10rpx 0;
		position: relative;
	}

	.travel-agency {
		border-right: 4rpx solid #eee;
	}

	.time text {
		display: inline-block;
		padding-right: 40rpx;
		position: relative;
	}

	.time text::after {
		content: "";
		position: absolute;
		top: 50%;
		right: 0%;
		transform: translateY(-50%) rotate(90deg);
		width: 32rpx;
		height: 32rpx;
		background-image: url('/static/pic_09.png');
		background-size: contain;
		background-repeat: no-repeat;
	}

	.travel-agency::after {
		content: "";
		position: absolute;
		top: 50%;
		right: 27%;
		transform: translateY(-50%) rotate(90deg);
		width: 32rpx;
		height: 32rpx;
		background-image: url('/static/pic_09.png');
		background-size: contain;
		background-repeat: no-repeat;
	}

	.picker-container {
		background: #fff;
		border-top: 1rpx solid #eee;
		position: absolute;
		top: 101%;
		left: 0;
		width: 100%;
		border-top: 2rpx solid #129271;
		box-shadow: 0rpx 0rpx 10rpx rgba(0, 0, 0, .1);
	}

	.picker-list {
		background: #fff;
		border-top: 1rpx solid #eee;
		position: absolute;
		top: 101%;
		left: 0;
		width: 100%;
		border-top: 2rpx solid #129271;
		box-shadow: 0rpx 0rpx 10rpx rgba(0, 0, 0, .1);
		padding: 10rpx;

		text {
			display: inline-block;
			width: 100%;
			border-bottom: 1px solid #eee;
			padding: 20rpx 10rpx;
		}
	}

	.picker-view {
		height: 300rpx;
		width: 100%;
	}

	.item {
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
	}

	.picker-actions {
		display: flex;
		justify-content: space-between;
		padding: 20rpx;
	}

	uni-button:after {
		display: none;
	}

	uni-button {
		background-color: #fff;
	}

	.btn-confirm {
		flex: 1;
		margin: 0 10rpx;
		padding: 10rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
	}

	.btn-confirm {
		color: #111;
	}

	.content {
		width: 100%;
		background-color: #129271;
	}
</style>