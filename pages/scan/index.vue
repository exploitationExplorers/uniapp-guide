<template>
  <view class="page">
    <view class="card">
      <image class="card-icon" src="/static/tab-scan-active.png" mode="aspectFit" />
      <text class="card-title">扫描设备二维码</text>
      <text class="card-desc">对准消火栓或设备上的二维码，识别成功将打开维保记录页。</text>
      <button class="scan-btn" type="primary" @click="onTapScan">开始扫码</button>
    </view>
  </view>
</template>

<script>
import { scanToMaintenance } from '../../utils/scanMaintenance.js';

export default {
  onLoad() {
    const app = getApp();
    if (!app.globalData.token) {
      uni.reLaunch({ url: '/pages/login/index' });
    }
  },
  methods: {
    onTapScan() {
      scanToMaintenance();
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 40rpx 32rpx;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 56rpx 40rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(24, 144, 255, 0.12);
}

.card-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 28rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.55;
  text-align: center;
  margin-bottom: 48rpx;
}

.scan-btn {
  width: 100%;
  max-width: 480rpx;
  background: #1890ff;
  border-radius: 12rpx;
  font-size: 32rpx;
}
</style>
