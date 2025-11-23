<template>
	<view style="width: 100%;">
		<view class="user-avatar">
			<view class="avatar_background">
				<image class="imgs" src="/static/pic_01.webp"></image>
			</view>
			<view class="avatar">
				<view class="use_images">
					<image src="" mode=""></image>
				</view>
				<text class="useName">{{useId}}</text>
			</view>
		</view>
		<view class="personalCenterLink">
			<view class="linkList" v-for="(item,index) in addres" :key="index" @click="linkRedirection(item.url)">
				<image class="images" :src="item.icon" mode=""></image>
				<text>{{item.key}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				useId: "初心哥万岁",
				addres: [{
						icon: "/static/pic_02.png",
						key: '个人资料',
						url: "/pages/personalProfile/index"
					},
					{
						icon: "/static/pic_03.png",
						key: '我的账本',
						url: "/pages/myAccountBook/index"
					},
					{
						icon: "/static/pic_04.png",
						key: '带团统计',
						url: "/pages/groupStatistics/index"
					},
					{
						icon: "/static/pic_05.png",
						key: '关于火柴头',
						url: "/pages/aboutUs/index"
					},
					{
						icon: "/static/pic_06.png",
						key: '退出登录',
						url: ""
					}
				]
			}
		},
		methods: {
			linkRedirection(val) {
				if (!val) return;
				uni.navigateTo({
					url: val,
					fail: (err) => {
						console.log('跳转失败:', err)
						uni.navigateTo({
							url: '/pages/404/404'
						})
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.linkList::before {
		content: "";
		display: block;
		width: 60rpx;
		height: 60rpx;
		position: absolute;
		top: 50%;
		right: 9%;
		transform: translate(-50%, -50%);
		background-image: url(/static/pic_07.png);
	}

	.linkList {
		cursor: pointer;
		border-bottom: 1rpx solid #eee;
		display: flex;
		justify-content: flex-start;
		width: 100%;
		align-items: center;
		padding: 36rpx 40rpx;
		position: relative;

		text {
			display: block;
			margin-left: 48rpx;
			flex: 1;
		}

		.images {
			display: block;
			width: 30rpx;
			height: 30rpx;
		}
	}

	.user-avatar {
		position: relative;
	}

	.avatar {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: auto;
		text-align: center;
	}

	.avatar_background {
		.imgs {
			width: 100%;
			filter: blur(3px);
		}
	}

	.use_images {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		background-color: #eee;
		margin: 0 auto;
	}

	.useName {
		color: #fff;
		margin-top: 10rpx;
		display: inline-block;
	}
</style>