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
				<text :class="{active: actives}">{{startTit}}</text>
			</view>
			<view class="pick" @click="togglePickerData">
				<text>旅行社</text>
			</view>
			<view class="time" @click="togglePickerTime">
				<text :class="{active: actives2}">{{selectedDate}}</text>
			</view>
			<view class="picker-container" v-show="visible">
				<picker-view :indicator-style="indicatorStyle" :value="value" @change="bindChange" class="picker-view">
					<picker-view-column>
						<view class="item" style="line-height: 100rpx;font-size: 24rpx;" v-for="(item,index) in years"
							:key="index">{{item}}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" style="line-height: 100rpx;font-size: 24rpx;" v-for="(item,index) in months"
							:key="index">{{item}}月</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" style="line-height: 100rpx;font-size: 24rpx;" v-for="(item,index) in days"
							:key="index">{{item}}日</view>
					</picker-view-column>
				</picker-view>
				<view class="picker-actions">
					<button class="btn-confirm" @click="confirmPicker">确定</button>
				</view>
			</view>
			<view class="picker-list" v-show="showL">
				<text v-for="(item,index) in dataObj" :key="index" @click="toggleData(item.name)">{{item.name}}</text>
			</view>
			<view class="sta-list" v-show="showData">
				<text v-for="(item,index) in start_array" :key="index"
					@click="toggleStart(item.name)">{{item.name}}</text>
			</view>
		</view>

		<view class="data_list">
			<view class="dataRow">
				<text>总收入：<text>￥0.00</text></text>
				<text>总团量：0个</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getTravelAgencies
	} from '../../request/api/index.js'
	export default {
		data() {
			const searchKeyword = ""
			const date = new Date()
			const showData = false
			const years = []
			const year = date.getFullYear()
			const months = []
			const startTit = "状态"
			const dataObj = []
			const showL = false
			const actives2 = false
			const actives = false
			const showActive = false
			const month = date.getMonth() + 1
			const days = []
			const value = ""
			const selectedDate = "时间"
			const global_name = ""
			const start_array = [{
					name: "全部",
					code: 0
				},
				{
					name: "待接单",
					code: 1,
				}, {
					name: "待报帐",
					code: 2
				},
				{
					name: "待审核",
					code: 3
				}, {
					name: "计调已审",
					code: 4
				},
				{
					name: "财务已审",
					code: 5
				}
			]
			const particular = {}
			const dataLists = []
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
				searchKeyword,
				days,
				year,
				dataLists,
				startTit,
				start_array,
				month,
				particular,
				showData,
				day,
				actives2,
				actives,
				global_name,
				dataObj,
				showL,
				showActive,
				value: [years.length - 1, month - 1, day - 1],
				visible: false,
				indicatorStyle: `height: 50px;transform: translateY(-50%);`,
				selectedDate
			}
		},
		methods: {
			bindChange(e) {
				const val = e.detail.value
				this.year = this.years[val[0]]
				this.month = this.months[val[1]]
				this.day = this.days[val[2]]
			},
			cancels() {
				console.log(this.year, 'op')
				this.searchKeyword = ""
			},
			togglePickerTime() {
				console.log('Toggling picker visibility:', !this.visible); // 添加这行
				this.visible = !this.visible
				this.showData = false
				this.showL = false
			},
			toggleStatus() {
				this.showData = !this.showData
				this.showL = false
			},
			toggleStart(val) {
				this.startTit = val
				this.showData = false
				this.actives = true
				// this.showL =false
			},
			toggleData(val) {
				this.showData = false
				this.showL = false
				this.visible = false
			},
			headRequest() {

			},
			togglePickerData() {
				this.showL = !this.showL
				this.showData = false
				this.visible = false
			},
			confirmPicker() {
				this.actives2 = true
				const y = this.year;
				const m = this.month.toString().padStart(2, '0');
				const d = this.day.toString().padStart(2, '0');
				this.selectedDate = `${y}-${m}-${d}`;
				this.visible = false;
			}
		},
		async onLoad() {
			const res = await getTravelAgencies();
			this.dataObj = res;
		},
	}
</script>

<style scoped lang="scss">
	.data_list {
		.dataRow {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background-color: #F6F6F6;
			padding: 20rpx;

			text {
				font-size: 24rpx;
				color: #111;

				text {
					color: #E99E5A;
				}
			}

			text:nth-child(2) {
				color: #E99E5A;
			}
		}
	}

	.btn-confirm {
		margin: 0 10rpx;
		padding: 10rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
	}

	uni-button:after {
		display: none;
	}

	uni-button {
		background-color: #fff;
	}

	.btn-confirm {
		color: #111;
	}

	.sta-list,
	.picker-list,
	.picker-container {
		position: absolute;
		background-color: #fff;
		top: 101%;
		left: 0;
		width: 100%;
		z-index: 999;
		border-radius: 0rpx 0rpx 16rpx 16rpx;
		border-top: 1rpx solid #eee;
		box-shadow: 0rpx 10rpx 10rpx rgba(0, 0, 0, 0.1);

		>text {
			display: block;
			padding: 20rpx 30rpx;
			border-bottom: 2rpx #eee solid;
			font-size: 24rpx;
		}
	}

	.picker-view {
		height: 300rpx;
		width: 100%;
		background-color: #fff;
	}

	.picker-view-column {
		line-height: 100rpx;
		width: 100%;

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

		.picker-container {
			text-align: center;
			width: 100vw;
			max-width: 100%;
		}

		>.sta,
		.pick,
		.time {
			width: 33.3%;
			text-align: center;
			border-right: 2rpx solid #eee;
			line-height: 60rpx;

			>text {
				font-size: 24rpx;
				position: relative;
				display: inline-block;
			}

			>text::after {
				content: "";
				position: absolute;
				top: 50%;
				right: 0%;
				-webkit-transform: translateY(-50%) rotate(90deg);
				transform: translateY(-50%) rotate(90deg);
				width: 17px;
				height: 17px;
				background-image: url(/static/pic_09.png);
				background-size: contain;
				background-repeat: no-repeat;
			}
		}
		.time text.active,
		.sta text.active{
			color: #7DACFA;
		}

		.sta>text::after {
			right: -60%;
		}

		.pick>text::after {
			right: -50%;
		}

		.time>text::after {
			right: -72%;
		}
	}

	.group_search {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 0px 20rpx;

		.uni-form-item {
			width: 80%;
			display: flex;
			border: 2rpx solid #eee;
			border-radius: 20rpx;
			overflow: hidden;
			justify-content: flex-start;
			align-items: center;
			padding: 15rpx;

			.uni-input {
				flex: 1;
				display: inline-block;
			}

			.default {
				width: auto;
				border: none !important;
				background-color: transparent !important;
				cursor: pointer;
				padding: 0 0;
				line-height: 1;

				.btn {
					width: 48rpx;
					height: 48rpx;
				}
			}
		}

		.cancel {
			display: block;
			margin-left: 20rpx;
		}
	}
</style>