<template>
  <view class="container">
    <view class="header">
      <text class="header-title">设备维保管理系统</text>
      <text class="header-sub">专业 · 高效 · 智能</text>
    </view>

    <view class="feature-list">
      <view class="feature-item" v-for="(item, index) in features" :key="index">
        <view class="icon-box">
          <text class="feature-emoji">{{ item.icon }}</text>
        </view>
        <view class="content-box">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <view class="scope-section">
      <view class="scope-box">
        <view class="scope-title-bar">
          <view class="vertical-line"></view>
          <text class="scope-title">使用说明</text>
        </view>
        <view class="scope-content">
          <text>本小程序为公司设备维保管理工具，维保人员可通过定位或手动输入设备编号快速找到待维保设备。</text>
          <text class="yellow-text">支持水印拍照功能，自动将维保内容、时间、经纬度、地图和导航二维码嵌入照片中，确保维保记录真实可信。</text>
          <text class="highlight">请使用管理员分配的账号登录后使用！</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <button class="start-btn" @click="handleStart">开始使用</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      features: [
        { title: '附近设备查找', desc: '基于手机GPS定位，自动按距离远近列出附近待维保设备', icon: '📍' },
        { title: '设备编号查询', desc: '手动输入设备编号，快速定位到指定设备进行维保', icon: '🔍' },
        { title: '水印拍照记录', desc: '拍照自动添加维保内容、时间、经纬度、地图和导航二维码', icon: '📷' },
        { title: '维保信息上传', desc: '填写维保内容，拍摄现场照片，一键提交维保记录', icon: '📤' }
      ]
    }
  },
  methods: {
    handleStart() {
      uni.navigateTo({ url: '/pages/login/index' });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0050b3 0%, #1890ff 100%);
  padding: 40rpx 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  margin-bottom: 40rpx;
  margin-top: 40rpx;
  text-align: center;

  .header-title {
    font-size: 44rpx;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 4rpx;
    display: block;
    margin-bottom: 12rpx;
  }

  .header-sub {
    font-size: 26rpx;
    color: rgba(255,255,255,0.7);
    letter-spacing: 2rpx;
  }
}

.feature-list {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 10rpx 0;
  margin-bottom: 30rpx;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  .icon-box {
    margin-right: 24rpx;
    display: flex;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    width: 72rpx;
    height: 72rpx;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;

    .feature-emoji {
      font-size: 36rpx;
    }
  }

  .content-box {
    flex: 1;

    .item-title {
      font-size: 32rpx;
      color: #ffffff;
      font-weight: 500;
      margin-bottom: 12rpx;
      display: block;
    }

    .item-desc {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
      display: block;
    }
  }
}

.scope-section {
  width: 100%;
  margin-bottom: 40rpx;
}

.scope-box {
  border-left: 4rpx solid #faad14;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 30rpx;

  .scope-title-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .vertical-line {
      width: 6rpx;
      height: 30rpx;
      background-color: #faad14;
      margin-right: 16rpx;
      border-radius: 4rpx;
    }

    .scope-title {
      font-size: 30rpx;
      color: #faad14;
      font-weight: bold;
    }
  }

  .scope-content {
    text {
      display: block;
      font-size: 26rpx;
      color: #ffffff;
      line-height: 1.6;
      margin-bottom: 16rpx;
      text-align: justify;

      &:last-child {
        margin-bottom: 0;
      }

      &.yellow-text {
        color: #faad14;
      }

      &.highlight {
        color: #faad14;
        font-weight: bold;
        text-align: center;
      }
    }
  }
}

.footer {
  width: 100%;
  padding-bottom: 40rpx;

  .start-btn {
    background: linear-gradient(90deg, #36cfc9 0%, #1890ff 100%);
    color: #ffffff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 45rpx;
    height: 90rpx;
    line-height: 90rpx;
    border: none;
    box-shadow: 0 8rpx 16rpx rgba(24,144,255,0.3);

    &:active {
      opacity: 0.9;
    }
  }
}
</style>
