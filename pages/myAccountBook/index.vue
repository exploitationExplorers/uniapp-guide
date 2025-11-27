<template>
	<view>
		<view class="flex-row">
			<view :class="{ 'time': true, 'active': showNames }" @click="togglePickerData">
				<text v-if="showNames">{{ global_name }}</text>
				<text v-else>旅行社</text>
			</view>
			<view :class="{ 'time': true, 'active': actives }" @click="togglePickerTime">
				<text v-if="showActive">{{ selectedDate }}</text>
				<text v-else>时间</text>
			</view>

			<view class="picker-container" v-if="visible">
				<picker-view :indicator-style="indicatorStyle" :value="value" @change="bindChange" class="picker-view">
					<picker-view-column>
						<view class="item" v-for="(item, index) in years" :key="index">{{ item }}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" v-for="(item, index) in months" :key="index">{{ item }}月</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" v-for="(item, index) in days" :key="index">{{ item }}日</view>
					</picker-view-column>
				</picker-view>
				<view class="picker-actions">
					<button class="btn-confirm" @click="confirmPicker">确定</button>
				</view>
			</view>

			<view class="picker-list" v-if="showData">
				<text v-for="(item, index) in dataObj" :key="index" @click="toggleData(item.name)">{{ item.name }}</text>
			</view>
		</view>
<view class="content">
	<view class="content-flex">
		<view class="datas">
			<text>现付总额</text>
			<text>{{ particular.cashPaymentTotal != null ? particular.cashPaymentTotal : 0 }}元</text>
		</view>
		<view class="datas">
			<text>收入总额</text>
			<text>{{ particular.incomeTotal != null ? particular.incomeTotal : 0 }}元</text>
		</view>
		<view class="datas">
			<text>交回总额</text>
			<text>{{ particular.returnTotal != null ? particular.returnTotal : 0 }}元</text>
		</view>
	</view>
	<view class="settlement-amount">
		<text>结账总额</text>
		<text>{{ particular.settlementTotal != null ? particular.settlementTotal : 0 }}元</text>
	</view>
	<view class="paid">
		<view class="lists">
			<text>已结账</text>
			<text>{{ particular.settledAmount != null ? particular.settledAmount : 0 }}元</text>
		</view>
		<view class="lists">
			<text>未结账</text>
			<text>{{ particular.outstandingAmount != null ? particular.outstandingAmount : 0 }}元</text>
		</view>
	</view>
</view>
		<view class="data_lists">
			<view class="list" v-for="(item, index) in dataLists" :key="index" @click="linkUrl(item.id)">
				<view class="title">{{ item.tourist_destination }}</view>
				<view><text>团号：</text><text>{{ item.team_number }}</text></view>
				<view><text>团期：</text><text>{{ item.time_start }} - {{ item.time_end }}</text></view>
				<view><text>来源：</text><text>{{ item.source }}</text></view>
				<view class="num"><text>导游现收：</text><text class="money">{{ formatMoney(item.received_cash) }}</text></view>
				<view class="num"><text>个人收入：</text><text class="money">{{ formatMoney(item.received_cash) }}</text></view>
				<view class="num"><text>导游交回：</text><text class="money">{{ formatMoney(item.return_amount) }}</text></view>
				<view class="num"><text>导游现收：</text><text class="money">{{ formatMoney(item.received_amount) }}</text></view>
				<view class="num"><text>结账金额：</text><text class="money active">{{ formatMoney(item.settlement_amount) }}</text></view>
				<view class="num"><text>已结金额：</text><text class="money">{{ formatMoney(item.settled_amount) }}</text></view>
				<view class="num"><text>未结金额：</text><text class="money">{{ formatMoney(item.outstanding_amount) }}</text></view>
			</view>
		</view>
	</view>
</template>

<script>
import { getTravelAgencies, getLedgerList, getLedgerDetails } from '@/request/api/index.js'

export default {
	data() {
		const now = new Date()
		const year = now.getFullYear()
		const month = now.getMonth() + 1
		const day = now.getDate()

		const years = Array.from({ length: year - 1989 }, (_, i) => 1990 + i)
		const months = Array.from({ length: 12 }, (_, i) => i + 1)

		const daysInMonth = new Date(year, month, 0).getDate()
		const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

		return {
			years,
			months,
			days,
			year,
			month,
			day,
			value: [years.length - 1, month - 1, day - 1],
			selectedDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,

			global_name: '',
			showNames: false,
			actives: false,
			showActive: false,
			visible: false,
			showData: false,

			dataObj: [],
			dataLists: [],
			particular: {},

			indicatorStyle: 'height: 50px;'
		}
	},

	methods: {
		updateDays(year, month) {
			const daysInMonth = new Date(year, month, 0).getDate()
			this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
		},

		bindChange(e) {
			const [yIdx, mIdx, dIdx] = e.detail.value
			const newYear = this.years[yIdx]
			const newMonth = this.months[mIdx]

			if (newYear !== this.year || newMonth !== this.month) {
				this.updateDays(newYear, newMonth)
				const maxDay = this.days.length
				const newDayIdx = Math.min(dIdx, maxDay - 1)
				this.value = [yIdx, mIdx, newDayIdx]
				this.day = this.days[newDayIdx]
			} else {
				this.day = this.days[dIdx] || 1
			}

			this.year = newYear
			this.month = newMonth
		},

		formatMoney(value) {
			if (value == null) return '0.00'
			const num = parseFloat(value)
			return isNaN(num) ? '0.00' : num.toFixed(2)
		},

		togglePickerData() {
			this.showData = !this.showData
			this.visible = false
		},

		togglePickerTime() {
			this.visible = !this.visible
			this.showData = false
			this.actives = true
		},

		async fetchData(name, time) {
			const params = { name, timeStart: time }
			try {
				const list = await getLedgerList(params)
				const details = await getLedgerDetails(params)
				this.dataLists = list || []
				this.particular = details || {}
			} catch (err) {
				console.error('获取数据失败:', err)
				this.dataLists = []
				this.particular = {}
			}
		},

		async toggleData(val) {
			this.showData = false
			this.global_name = val
			this.showNames = true
			const time = `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`
			await this.fetchData(val, time)
		},

		async confirmPicker() {
			this.visible = false
			const time = `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`
			this.selectedDate = time
			this.showActive = true
			await this.fetchData(this.global_name, time)
		},

		linkUrl(id) {
			uni.navigateTo({
				url: `/pages/myAccountBook/revenue_details?id=${id}`,
				animationType: 'slide-in-right',
				animationDuration: 300
			})
		},

		trimKeys(obj) {
			const result = {}
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					result[key.trim()] = obj[key]
				}
			}
			return result
		}
	},

	async onLoad() {
		try {
			const agencies = await getTravelAgencies()
			this.dataObj = agencies || []

			const params = { name: '', timeStart: '' }
			const list = await getLedgerList(params)
			const details = await getLedgerDetails(this.trimKeys(params))
			this.dataLists = list || []
			this.particular = details || {}
		} catch (err) {
			console.error('onLoad error:', err)
			this.dataObj = []
			this.dataLists = []
			this.particular = {}
		}
	}
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
		width: calc(100% / 3);
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
	border-top: 1px solid #eee;
	z-index: 99;
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

.time.active {
	color: #E99E5A;
}

.time text::after,
.travel-agency::after {
	content: "";
	position: absolute;
	top: 50%;
	right: 0;
	transform: translateY(-50%) rotate(90deg);
	width: 32rpx;
	height: 32rpx;
	background-image: url('/static/pic_09.png');
	background-size: contain;
	background-repeat: no-repeat;
}

.travel-agency::after {
	right: 27%;
}

.picker-container,
.picker-list {
	background: #fff;
	position: absolute;
	top: 101%;
	left: 0;
	width: 100%;
	border-top: 2rpx solid #129271;
	box-shadow: 0 0 10rpx rgba(0, 0, 0, .1);
}

.picker-list {
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
	justify-content: center;
	padding: 20rpx;
}

uni-button:after {
	display: none;
}

.btn-confirm {
	flex: 1;
	margin: 0 10rpx;
	padding: 10rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #111;
	background-color: #fff;
}

.content {
	width: 100%;
	background-color: #129271;
}
</style>