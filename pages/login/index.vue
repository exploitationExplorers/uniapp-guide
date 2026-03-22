<template>
  <view class="login-container">
    <view class="header-bg">
      <view class="header-content">
        <view class="logo">
          <text class="logo-icon">🔧</text>
        </view>
        <text class="title">设备维保管理系统</text>
        <text class="subtitle">专业 · 高效 · 智能</text>
      </view>
    </view>

    <view class="form-card">
      <view class="form-title">欢迎登录</view>
      
      <view class="input-group">
        <text class="icon">👤</text>
        <input
          class="input"
          type="text"
          placeholder="请输入账号 (admin)"
          placeholder-class="placeholder"
          v-model="form.phone"
        />
      </view>

      <view class="input-group">
        <text class="icon">🔒</text>
        <input
          class="input"
          :password="!showPassword"
          placeholder="请输入密码 (123456)"
          placeholder-class="placeholder"
          v-model="form.password"
        />
        <text class="icon-right" @click="togglePassword">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
      </view>

      <button class="login-btn" @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登 录' }}
      </button>

      <view class="form-footer">
        <text class="link-text" @click="goToForgetPwd">忘记密码？</text>
      </view>
    </view>

    <view class="footer-info">
      <text>技术支持：设备维保科技有限公司</text>
      <text>v1.0.0</text>
    </view>
  </view>
</template>

<script>
import { login } from "@/request/api/index.js";

export default {
  data() {
    return {
      form: {
        phone: "",
        password: "",
      },
      showPassword: false,
      loading: false
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      if (!this.form.phone) {
        return uni.showToast({ title: "请输入账号", icon: "none" });
      }
      if (!this.form.password) {
        return uni.showToast({ title: "请输入密码", icon: "none" });
      }

      this.loading = true;
      try {
        let res = await login({
          phone: this.form.phone,
          password: this.form.password,
        });
        
        if (res.success) {
          getApp().globalData.userInfo = res.userInfo;
          getApp().globalData.token = res.token;
          uni.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/index/index",
            });
          }, 1000);
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    goToForgetPwd() {
      uni.showToast({ title: "请联系管理员重置密码", icon: "none" });
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #f4f6f8;
  display: flex;
  flex-direction: column;
  position: relative;
}

.header-bg {
  height: 450rpx;
  background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 80, 179, 0.3);
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -40rpx;
}

.logo {
  width: 140rpx;
  height: 140rpx;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.logo-icon {
  font-size: 72rpx;
}

.title {
  font-size: 44rpx;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 4rpx;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2rpx;
}

.form-card {
  margin: -100rpx 40rpx 0;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.form-title {
  font-size: 36rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 50rpx;
  text-align: center;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f8f9fb;
  border-radius: 12rpx;
  padding: 0 30rpx;
  height: 90rpx;
  margin-bottom: 40rpx;
  border: 1px solid #ebedf0;
  transition: all 0.3s;
}

.input-group:focus-within {
  border-color: #1890ff;
  background-color: #ffffff;
}

.icon {
  font-size: 36rpx;
  color: #999;
  margin-right: 20rpx;
}

.icon-right {
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.placeholder {
  color: #bfbfbf;
}

.login-btn {
  background: linear-gradient(90deg, #1890ff 0%, #36cfc9 100%);
  color: #ffffff;
  font-size: 34rpx;
  border-radius: 45rpx;
  height: 90rpx;
  line-height: 90rpx;
  margin-top: 60rpx;
  border: none;
  box-shadow: 0 8rpx 16rpx rgba(24, 144, 255, 0.3);
}

.login-btn::after {
  border: none;
}

.login-btn[disabled] {
  opacity: 0.7;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 30rpx;
}

.link-text {
  font-size: 26rpx;
  color: #666;
}

.footer-info {
  margin-top: auto;
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 22rpx;
  color: #b0b0b0;
}

.footer-info text {
  margin-top: 10rpx;
}
</style>
