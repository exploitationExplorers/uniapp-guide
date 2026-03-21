<template>
  <view class="page">
    <!-- 顶部用户卡片 -->
    <view class="user-card">
      <view class="user-info">
        <view class="avatar-box">
          <text class="avatar-text">{{ nameInitial }}</text>
        </view>
        <view class="user-detail">
          <text class="user-name">{{ userName }}，{{ timePeriod }}好</text>
          <text class="user-role">设备维保人员</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-section">
      <view class="menu-item" v-for="(item, index) in menuList" :key="index" @click="handleMenu(item)">
        <text class="menu-icon">{{ item.icon }}</text>
        <text class="menu-text">{{ item.name }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <view class="menu-item logout-item" @click="handleLogout">
        <text class="menu-icon">🚪</text>
        <text class="menu-text" style="color: #ff4d4f;">退出登录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userName: '',
      timePeriod: '',
      menuList: [
        { icon: '👤', name: '个人资料', url: '/pages/personalProfile/index' },
        { icon: '📋', name: '维保记录', url: '' },
        { icon: '🔧', name: '修改密码', url: '/pages/changePassword/index' },
        { icon: 'ℹ️', name: '关于系统', url: '/pages/aboutUs/index' }
      ]
    }
  },
  computed: {
    nameInitial() {
      return this.userName ? this.userName.charAt(0) : '用';
    }
  },
  onShow() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.userName = app.globalData.userInfo.name || app.globalData.userInfo.usename || '用户';
    } else {
      this.userName = '用户';
    }
    this.setTimePeriod();
  },
  methods: {
    setTimePeriod() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        this.timePeriod = '上午';
      } else if (hour >= 12 && hour < 18) {
        this.timePeriod = '下午';
      } else {
        this.timePeriod = '晚上';
      }
    },
    handleMenu(item) {
      if (!item.url) {
        return uni.showToast({ title: '功能开发中', icon: 'none' });
      }
      uni.navigateTo({
        url: item.url,
        fail: () => {
          uni.navigateTo({ url: '/pages/404/404' });
        }
      });
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定退出当前登录账号吗？',
        success: (res) => {
          if (res.confirm) {
            const app = getApp();
            app.globalData.userInfo = null;
            app.globalData.token = '';
            uni.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f4f6f8;
}

.user-card {
  background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%);
  padding: 60rpx 40rpx 80rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-box {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255,255,255,0.4);
}

.avatar-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 34rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.user-role {
  font-size: 24rpx;
  color: rgba(255,255,255,0.75);
}

.menu-section {
  background-color: #fff;
  margin: -30rpx 30rpx 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.logout-section {
  background-color: #fff;
  margin: 0 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style>
