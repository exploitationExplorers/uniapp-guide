<template>
	<view class="content">
		<image class="index-background" src="/static/pic_01.webp"></image>
		<view class="total-data">
			<view class="lefts">
				<view class="items">
					<text>总团量</text>
					<text>{{dataObj.team_size}}</text>
				</view>
				<view class="items">
					<text>总收入</text>
					<text>{{dataObj.income}}</text>
				</view>
			</view>
			<view class="right">
				<view class="items">
					<text>今年收入</text>
					<text>{{dataObj.revenue}}</text>
				</view>
				<view class="items">
					<text>本月收入</text>
					<text>{{dataObj.month_income}}</text>
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
				dataObj: {}
			}
		},
		onLoad() {
			uni.request({
				url: 'https://m1.apifoxmock.com/m1/5178036-4843222-default/api/total',
				method: 'POST',
				data: {},
				success: (res) => {
					this.dataObj = res.data
				}
			});
		},
		methods: {

		}
	}
</script>

<style scoped lang="scss">
	.content {
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
			
			text{
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