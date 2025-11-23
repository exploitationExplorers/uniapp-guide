<template>
	<view>
		<view class="about-logo">
			<image class="logo_images" src="/static/pic_08.png" mode=""></image>
		</view>
		<view class="dataList">
			<view class="item">
				<text>当前版本</text>
				<text>{{Vnumber}}</text>
			</view>
			<view class="item" @click="clearCache">
				<text>清空缓存</text>
				<text>{{Cnumber}}</text>
			</view>
			<view class="item" @click="serviceClick">
				<text>当前服务节点</text>
				<text>{{Snode}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				Vnumber: "v4.1.1",
				Cnumber: "10.11KB",
				Snode: "默认服务器",
			}
		},
		methods: {
			clearCache() {
				uni.showModal({
					title: '',
					content: '确定清楚缓存？',
					success: (res) => {
						if (res.confirm) {
							console.log('用户点击确定')
						} else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				})
			},
			serviceClick() {
				uni.showModal({
					title: '需要切换服务器节点？',
					content: '当前连接服务器节点为：默认服务器节点切换服务器节点需要先,退出登录，然后在登录前选择服务器节点进行切换。',
					success: (res) => {
						if (res.confirm) {
							console.log('用户点击确定')
						} else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				})
			}
		}
	}
</script>

<style scoped scss>
	uni-modal .uni-modal {
		border-radius: 60rpx !important;
	}

	.about-logo {
		width: 100%;
		background-color: #F6F6F6;
		display: flex;
		padding: 50px 0;
		justify-content: center;
		align-items: center;

		.logo_images {
			width: 160rpx;
			height: 160rpx;
		}
	}

	.dataList {
		.item {
			padding: 30rpx 20rpx;
			border-bottom: 1px solid #eee;
			display: flex;
			justify-content: space-between;
			align-items: center;

			text:nth-child(1) {
				font-size: 30rpx;
				display: block;
				color: 111;
				width: auto;
				max-width: 50%;
			}

			text:nth-child(2) {
				color: #A5A9AB;
				display: block;
				font-size: 30rpx;
				flex: 1;
				text-align: right;
			}
		}
	}
</style>