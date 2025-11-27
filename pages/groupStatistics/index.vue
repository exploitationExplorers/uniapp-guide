<template>
	<view>
		<view class="group_search">
			<view class="uni-form-item uni-column">
				<input class="uni-input" v-model="searchKeyword" maxlength="10" placeholder="线路名、团号" />
				<view class="default" @click="headRequest">
					<image class="btn" src="/static/pic_10.png"></image>
				</view>
			</view>
			<text class="cancel" @click="cancels">取消</text>
		</view>

		<view class="flex-row">
			<view class="sta" @click="toggleStatus">
				<text :class="{ active: isStatusActive }">{{ startTit }}</text>
			</view>
			<view class="pick" @click="togglePickerData">
				<text :class="{ active: isAgencyActive }">{{ showName }}</text>
			</view>
			<view class="time" @click="togglePickerTime">
				<text :class="{ active: isTimeActive }">{{ selectedDate }}</text>
			</view>

			<view class="picker-container" v-show="visible">
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

			<view class="picker-list" v-show="showAgencyList">
				<text v-for="(item, index) in agencies" :key="index" @click="selectAgency(item.name)">{{ item.name }}</text>
			</view>

			<view class="sta-list" v-show="showStatusList">
				<text v-for="(item, index) in statusOptions" :key="index" @click="selectStatus(item.name)">{{ item.name }}</text>
			</view>
		</view>

		<view class="data_list">
			<view class="dataRow">
				<text>总收入：<text>￥{{money}}</text></text>
				<text>总团量：{{cont}}个</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getTravelAgencies } from '@/request/api/index.js'

export default {
	data() {
		const now = new Date()
		const year = now.getFullYear()
		const month = now.getMonth() + 1
		const day = now.getDate()
        const cont = 0
		const money = 0
		const years = Array.from({ length: year - 1989 }, (_, i) => 1990 + i)
		const months = Array.from({ length: 12 }, (_, i) => i + 1)
		const days = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1)

		return {
			searchKeyword: '',
			startTit: '状态',
			showName: '旅行社',
			selectedDate: '时间',

			isStatusActive: false,
			isAgencyActive: false,
			isTimeActive: false,

			showStatusList: false,
			showAgencyList: false,
			visible: false,

			agencies: [],
			cont,
			money,
			statusOptions: [
				{ name: '全部', code: 0 },
				{ name: '待接单', code: 1 },
				{ name: '待报帐', code: 2 },
				{ name: '待审核', code: 3 },
				{ name: '计调已审', code: 4 },
				{ name: '财务已审', code: 5 }
			],
			years,
			months,
			days,
			year,
			month,
			day,
			value: [years.length - 1, month - 1, day - 1],
			indicatorStyle: 'height: 50px; transform: translateY(-30%);'
		}
	},

	methods: {
		updateDays(y, m) {
			const maxDay = new Date(y, m, 0).getDate()
			this.days = Array.from({ length: maxDay }, (_, i) => i + 1)
		},

		bindChange(e) {
			const [yIdx, mIdx, dIdx] = e.detail.value
			const newYear = this.years[yIdx]
			const newMonth = this.months[mIdx]

			if (newYear !== this.year || newMonth !== this.month) {
				this.updateDays(newYear, newMonth)
				const safeDayIdx = Math.min(dIdx, this.days.length - 1)
				this.value = [yIdx, mIdx, safeDayIdx]
				this.day = this.days[safeDayIdx]
			} else {
				this.day = this.days[dIdx] || 1
			}

			this.year = newYear
			this.month = newMonth
		},

		cancels() {
			this.searchKeyword = ''
		},

		headRequest() {
			// 可后续补充搜索逻辑
		},

		toggleStatus() {
			this.showStatusList = !this.showStatusList
			this.showAgencyList = false
			this.visible = false
		},
		selectStatus(name) {
			this.startTit = name
			this.isStatusActive = true
			this.showStatusList = false
		},

		togglePickerData() {
			this.showAgencyList = !this.showAgencyList
			this.showStatusList = false
			this.visible = false
		},
		selectAgency(name) {
			this.showName = name
			this.isAgencyActive = true
			this.showAgencyList = false
		},

		togglePickerTime() {
			this.visible = !this.visible
			this.showAgencyList = false
			this.showStatusList = false
		},
		confirmPicker() {
			this.selectedDate = `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`
			this.isTimeActive = true
			this.visible = false
		}
	},

	async onLoad() {
		try {
			const res = await getTravelAgencies()
			this.agencies = res || []
		} catch (err) {
			console.error('获取旅行社失败:', err)
			this.agencies = []
		}
	}
}
</script>

<style scoped lang="scss">
.data_list .dataRow {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #f6f6f6;
	padding: 20rpx;
	font-size: 24rpx;
	color: #111;

	text text { color: #e99e5a; }
	text:nth-child(2) { color: #e99e5a; }
}

.btn-confirm {
	margin: 0 10rpx;
	padding: 10rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #111;
	background-color: #fff;
}

uni-button:after { display: none; }

.sta-list,
.picker-list,
.picker-container {
	position: absolute;
	background-color: #fff;
	top: 101%;
	left: 0;
	width: 100%;
	z-index: 999;
	border-top: 1rpx solid #eee;
	box-shadow: 0 10rpx 10rpx rgba(0, 0, 0, 0.1);
    .item{
		text-align: center;
	}
	> text {
		display: block;
		padding: 20rpx 30rpx;
		border-bottom: 2rpx solid #eee;
		font-size: 24rpx;
	}
}

.picker-view {
	height: 300rpx;
	width: 100%;
	background-color: #fff;
}

.flex-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-top: 1px solid #eee;
	position: relative;
	z-index: 99;
	width: 100%;
	margin-top: 10rpx;

	>.sta, .pick, .time {
		width: 33.3%;
		text-align: center;
		border-right: 2rpx solid #eee;
		line-height: 48rpx;

		> text {
			font-size: 24rpx;
			position: relative;
			display: inline-block;
		}

		> text::after {
			content: "";
			position: absolute;
			top: 50%;
			transform: translateY(-50%) rotate(90deg);
			width: 17px;
			height: 17px;
			background-image: url(/static/pic_09.png);
			background-size: contain;
			background-repeat: no-repeat;
		}
	}

	.sta > text::after { right: -60%; }
	.pick > text::after { right: -50%; }
	.time > text::after { right: -72%; }

	.text.active,
	.sta text.active,
	.pick text.active,
	.time text.active {
		color: #7dacfa;
	}
}

.group_search {
	display: flex;
	align-items: center;
	padding: 0 20rpx;
	margin: 20rpx 0;

	.uni-form-item {
		width: 80%;
		display: flex;
		border: 2rpx solid #eee;
		border-radius: 20rpx;
		overflow: hidden;
		padding: 15rpx;

		.uni-input { flex: 1; }

		.default {
			padding: 0;
			background: transparent;
			border: none;
			cursor: pointer;

			.btn { width: 48rpx; height: 48rpx; }
		}
	}

	.cancel {
		margin-left: 20rpx;
	}
}
</style>