<template>
  <view class="container login-page">
    <!-- 顶部导航栏占位 (根据需要调整) -->
    <view class="status-bar"></view>

    <!-- 页面内容 -->
    <view class="content">
      <!-- Logo 区域 -->
      <view class="logo-box">
        <view class="logo">
          <!-- 这里用CSS模拟图中的Logo形状，实际请替换为 image 标签 -->
          <image src="/static/logo.png" class="logo-face"></image>
          <!-- <view class="logo-face">
            <view class="eye left"></view>
            <view class="eye right"></view>
          </view> -->
        </view>
      </view>

      <!-- 表单区域 -->
      <view class="form-area">
        <!-- 账号输入 -->
        <view class="input-group">
          <image src="/static/user.png" class="icon user-icon"></image>
          <input
            class="input"
            type="number"
            placeholder="请输入手机号"
            placeholder-class="placeholder-text"
            v-model="phone" />
        </view>

        <!-- 密码输入 -->
        <view class="input-group">
          <image src="/static/password.png" class="icon lock-icon"></image>
          <input
            class="input"
            :type="text"
            :password="!showPassword"
            placeholder="请输入密码"
            placeholder-class="placeholder-text"
            v-model="password" />
          <!-- <view class="icon eye-icon" @click="togglePassword"></view> -->
          <image
            class="icon eye-icon"
            :src="showPassword ? '/static/eye.png' : '/static/eyes.png'"
            @click="togglePassword"></image>
        </view>

        <!-- 登录按钮 -->
        <button class="btn-login" @click="handleLogin">登录</button>
        <button
          class="btn-login"
          @getphonenumber="getPhone"
          open-type="getPhoneNumber">
          微信登录
        </button>

        <!-- 底部链接 -->
        <view class="footer-links">
          <text class="link-text" @click="goToRegister">注册</text>
          <text class="link-text center-text" @click="openPopup">
            {{ currentNodeName }}(点击切换)
          </text>
          <text class="link-text" @click="goToResetPwd">忘记密码</text>
        </view>
      </view>
    </view>

    <view
      class="popup-mask"
      v-if="showPopup"
      @click="closePopup"
      @touchmove.stop.prevent></view>

    <!-- 2. 弹框内容 -->
    <view class="popup-box" v-if="showPopup" @touchmove.stop.prevent>
      <view class="popup-title">选择服务器节点</view>

      <view class="node-list">
        <view
          class="node-item"
          v-for="(item, index) in nodeList"
          :key="index"
          @click="selectNode(index)">
          <text class="node-name">{{ item.name }}</text>

          <!-- 选中状态显示绿色背景打钩，未选中显示灰色圆圈 -->
          <view
            class="radio-circle"
            :class="{ checked: activeNodeIndex === index }">
            <text v-if="activeNodeIndex === index" class="check-mark">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from "@/request/api/index.js";
export default {
  data() {
    return {
      phone: "",
      password: "",
      showPassword: false,
      showPopup: false,
      activeNodeIndex: 0,
      nodeList: [
        {
          name: "默认服务器节点",
        },
        {
          name: "金天下节点",
        },
        {
          name: "行千里节点",
        },
      ],
    };
  },
  computed: {
    currentNodeName() {
      return this.nodeList[this.activeNodeIndex].name;
    },
  },
  onLoad() {
    console.log(getApp().globalData.baseUrl);
  },
  methods: {
    getPhone(e) {
      console.log(e);
    },
    // 打开弹框
    openPopup() {
      this.showPopup = true;
    },
    // 关闭弹框
    closePopup() {
      this.showPopup = false;
    },
    // 选择节点
    selectNode(index) {
      this.activeNodeIndex = index;
      console.log(this.activeNodeIndex);
      // 选中后延迟 200ms 自动关闭，体验更好
      setTimeout(() => {
        this.showPopup = false;
      }, 200);
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      // 手机号为空
      if (!this.phone) {
        return uni.showToast({
          title: "请输入手机号",
          icon: "none",
        });
      }

      // 校验手机号格式（非必填逻辑可选）
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(this.phone)) {
        return uni.showToast({
          title: "手机号格式不正确",
          icon: "none",
        });
      }

      // 密码为空
      if (!this.password) {
        return uni.showToast({
          title: "请输入密码",
          icon: "none",
        });
      }

      // 密码校验（可选，例如长度 > 6）
      if (this.password.length < 6) {
        return uni.showToast({
          title: "密码不能少于6位",
          icon: "none",
        });
      }

      if (this.phone && this.password) {
        let res = await login({
          phone: this.phone,
          password: this.password,
        });
        if (res.data.success) {
          getApp().globalData.userInfo = res.data.userInfo;
          getApp().globalData.token = res.data.token;
          uni.switchTab({
            url: "/pages/index/index",
          });
        }
      }
    },
    goToRegister() {
      uni.navigateTo({
        url: "/pages/register/index",
      });
    },
    goToResetPwd() {
      uni.navigateTo({
        url: "/pages/forgetPwd/index",
      });
    },
    // changeNode() {
    // 	uni.show;
    // },
  },
};
</script>

<style scoped>
/* 页面容器铺满全屏 */
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #6fafc9 0%, #87dcc6 100%);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 60rpx;
  padding-top: 150rpx;
}

/* Logo 样式模拟 */
.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50% 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 120rpx;
}

.logo-face {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 30rpx;
  /* transform: rotate(45deg); */
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 10rpx;
}

.eye {
  width: 12rpx;
  height: 12rpx;
  background-color: #333;
  border-radius: 50%;
}

/* 表单样式 */
.form-area {
  width: 100%;
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  padding: 20rpx 0;
  margin-bottom: 40rpx;
}

.input {
  flex: 1;
  font-size: 32rpx;
  color: #fff;
  padding: 0 20rpx;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.7);
}

/* 简单的CSS图标模拟 */
.icon {
  width: 40rpx;
  height: 40rpx;
  /* border: 2rpx solid #fff; */
  border-radius: 50%;
}

.user-icon {
  border-radius: 50%;
}

/* 实际请用 iconfont */
.lock-icon {
  border-radius: 4rpx;
}

.eye-icon {
  border-radius: 50%;
  width: 30rpx;
  height: 30rpx;
}

/* 按钮 */
.btn-login {
  background-color: #29b6f6;
  color: #fff;
  border-radius: 8rpx;
  font-size: 34rpx;
  margin-top: 30rpx;
  border: none;
}

.btn-login::after {
  border: none;
}

/* 底部链接 */
.footer-links {
  margin-top: 40rpx;
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #fff;
}

.center-text {
  margin: 0 20rpx;
  opacity: 0.8;
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  /* 半透明黑 */
  z-index: 998;
}

/* 2. 弹框本体 */
.popup-box {
  position: fixed;
  top: 45%;
  /* 稍微偏上一点，视觉更平衡 */
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  z-index: 999;
  padding: 50rpx 40rpx;
  box-sizing: border-box;
}

.popup-title {
  text-align: center;
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 50rpx;
}

.node-list {
  display: flex;
  flex-direction: column;
}

.node-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  /* 增加点击区域 */
}

.node-name {
  font-size: 30rpx;
  color: #333;
}

/* 选中圈圈样式 */
.radio-circle {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  /* 未选中灰色边框 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.2s;
}

/* 选中状态 */
.radio-circle.checked {
  background-color: #07c160;
  /* 微信绿 */
  border-color: #07c160;
}

.check-mark {
  color: #fff;
  font-size: 28rpx;
  line-height: 1;
}
</style>
