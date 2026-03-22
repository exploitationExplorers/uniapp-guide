<template>
  <view class="page">
    <!-- 信息卡片 -->
    <view class="card info-card">
      <view class="info-container">
        <view class="label-wrapper">
          <text class="label">拍摄时间：</text>
        </view>
        <text class="content bold">{{ time }}</text>

        <view class="label-wrapper">
          <text class="label">拍摄地点：</text>
        </view>
        <text class="content bold">{{ addr }}</text>

        <view class="label-wrapper">
          <text class="label">经 纬 度：</text>
        </view>
        <text class="content bold">{{ lat }}°N, {{ lng }}°E</text>
      </view>

      <view class="nav-btn" @click="navigateToHere">
        <view class="nav-arrow">
          <text class="arrow-icon">&#x279C;</text>
        </view>
        <text class="nav-text">导航到这里</text>
      </view>
    </view>

    <!-- 原始照片卡片 -->
    <view class="card photo-card">
      <view class="title-container">
        <text class="title">二维码绑定的原始照片</text>
      </view>
      <view class="photo-container" v-if="photoSrc">
        <image class="photo" :src="photoSrc" mode="widthFix" @click="previewPhoto"></image>
      </view>
      <view class="photo-container empty" v-else>
        <text class="empty-text">暂无绑定照片</text>
      </view>

      <view class="verify-row">
        <text class="verify-tip">如果需要验证图片是否修改过，可点击下方验真</text>
        <view class="verify-btn" @click="onVerify">
          <text class="plus-icon">+</text>
          <text>上传图片验真</text>
        </view>
      </view>

      <!-- 水印信息 -->
      <view class="info-container wm-info">
        <view class="label-wrapper">
          <text class="label">水印</text>
        </view>
        <view class="content wm-content">
          <text class="wm-row">{{ maintainType }}</text>
          <text class="wm-row">施工内容：{{ code }}</text>
          <text class="wm-row">拍摄时间：{{ time }}</text>
          <text class="wm-row">地点：{{ addr }}</text>
          <text class="wm-row">方位角：西{{ bearing }}°</text>
          <text class="wm-row">经纬度：{{ lat }}°N, {{ lng }}°E</text>
          <text class="wm-row" v-if="remark">备注：{{ remark }}</text>
        </view>

        <view class="label-wrapper">
          <text class="label">拍摄人</text>
        </view>
        <text class="content">{{ userName || '维保人员' }}</text>
      </view>

      <text class="tip">* 如对照片水印时间等信息有疑义，以验真结果为准。</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      lat: '',
      lng: '',
      addr: '',
      time: '',
      code: '',
      name: '',
      maintainType: '',
      bearing: '271',
      remark: '',
      photoSrc: '',
      userName: ''
    };
  },
  onLoad(options) {
    this.lat = options.lat || '';
    this.lng = options.lng || '';
    this.addr = decodeURIComponent(options.addr || '');
    this.time = decodeURIComponent(options.time || '');
    this.code = decodeURIComponent(options.code || '');
    this.name = decodeURIComponent(options.name || '');
    this.maintainType = decodeURIComponent(options.type || '设备维护');
    this.bearing = options.bearing || '271';
    this.remark = decodeURIComponent(options.remark || '');
    this.photoSrc = decodeURIComponent(options.photo || '');
    const app = getApp();
    if (app.globalData && app.globalData.userInfo) {
      this.userName = app.globalData.userInfo.realName || app.globalData.userInfo.nickname || '';
    }
  },
  methods: {
    navigateToHere() {
      const la = Number(this.lat);
      const ln = Number(this.lng);
      if (!Number.isFinite(la) || !Number.isFinite(ln)) {
        return uni.showToast({ title: '经纬度无效', icon: 'none' });
      }
      uni.openLocation({
        latitude: la,
        longitude: ln,
        name: this.name || '维保位置',
        address: this.addr,
        scale: 18
      });
    },
    previewPhoto() {
      if (!this.photoSrc) return;
      uni.previewImage({
        current: this.photoSrc,
        urls: [this.photoSrc]
      });
    },
    onVerify() {
      uni.showToast({ title: '验真功能开发中', icon: 'none' });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 24rpx;
  padding-bottom: 60rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.info-card {
  padding: 40rpx 36rpx 0;
}

.info-container {
  padding-bottom: 30rpx;
}

.label-wrapper {
  margin-top: 28rpx;
}

.label-wrapper:first-child {
  margin-top: 0;
}

.label {
  font-size: 28rpx;
  color: #999;
}

.content {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-top: 8rpx;
  word-break: break-all;
}

.content.bold {
  font-weight: bold;
  font-size: 32rpx;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  border-top: 1px solid #f0f0f0;
  margin: 0 -36rpx;
  padding: 0 36rpx;
}

.nav-arrow {
  width: 48rpx;
  height: 48rpx;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.arrow-icon {
  color: #fff;
  font-size: 28rpx;
  transform: rotate(-45deg);
}

.nav-text {
  font-size: 34rpx;
  color: #1890ff;
  font-weight: bold;
}

.photo-card {
  padding: 0;
}

.title-container {
  padding: 30rpx 36rpx 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.photo-container {
  padding: 0 36rpx;
  display: flex;
  justify-content: center;
  background: #f8f8f8;
  margin: 0 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.photo-container.empty {
  height: 300rpx;
  align-items: center;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

.photo {
  width: 100%;
  border-radius: 12rpx;
}

.verify-row {
  padding: 30rpx 36rpx;
}

.verify-tip {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 20rpx;
}

.verify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border: 2rpx dashed #0070f0;
  border-radius: 12rpx;
  color: #0070f0;
  font-size: 30rpx;
}

.plus-icon {
  font-size: 36rpx;
  margin-right: 8rpx;
  font-weight: bold;
}

.wm-info {
  padding: 0 36rpx 20rpx;
  border-top: 1px solid #f0f0f0;
}

.wm-content {
  display: flex;
  flex-direction: column;
}

.wm-row {
  font-size: 26rpx;
  color: #555;
  line-height: 1.9;
}

.tip {
  display: block;
  padding: 20rpx 36rpx 30rpx;
  font-size: 24rpx;
  color: #bbb;
  border-top: 1px solid #f5f5f5;
}
</style>
