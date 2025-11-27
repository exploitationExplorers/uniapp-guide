<template>
  <view class="container">

    <!-- Logo -->
    <view class="logo-box">
      <image class="logo-img" src="/static/about.png"></image>
    </view>

    <!-- 内容列表 -->
    <view class="list-box">

      <!-- 当前版本 -->
      <view class="list-item">
        <text class="item-title">当前版本</text>
        <text class="item-value">{{ currentVersion }}</text>
      </view>

      <!-- 清空缓存 -->
      <view class="list-item" @click="clearCache">
        <text class="item-title">清空缓存</text>
        <text class="item-value">{{ cacheSize }}</text>
      </view>

      <!-- 当前服务器节点 -->
      <view class="list-item" @click="changeNodeServer">
        <text class="item-title">当前服务器节点</text>
        <text class="item-value">{{ nodeServer }}</text>
      </view>

    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      cacheSize: '10.11KB',
			currentVersion: 'v4.1.1',
			nodeServer: '默认服务器节点'
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    clearCache() {
			uni.showModal({
				title: '温馨提示',
				content: '您确定要执行此操作吗？数据删除后将无法恢复。',
				showCancel: true,
				cancelText: '取消',
				confirmText: '确定',
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '操作成功',
							icon: 'success',
						})
						this.cacheSize = '0KB'
					}
				}
			});
    },
    changeNodeServer() {
			uni.showModal({
				title: '需要切换服务器节点？',
				content: '当前连接服务器节点为：默认服务器节点 切换服务器节点需要先退出登录，然后在登录前选择服务器节点进行切换。',
				showCancel: true,
				cancelText: '取消',
				confirmText: '确定',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/login/index'
						})
					}
				}
			});
		}
  }
}
</script>

<style>
.container {
  background: #ffffff;
  min-height: 100vh;
}

.logo-box {
  display: flex;
  justify-content: center;
  background-color: #f6f6f6;
}

.logo-img {
  width: 300rpx;
  height: 300rpx;
}

.list-item {
  height: 100rpx;
  padding: 0 30rpx;
  border-bottom: 1px solid #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-title {
  color: #000;
  font-size: 30rpx;
}

.item-value {
  color: #999;
  font-size: 28rpx;
}
</style>
