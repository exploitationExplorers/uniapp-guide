<template>
  <view class="container white-bg">
    <view class="form-list">
      <!-- 手机号 -->
      <view class="form-item">
        <text class="label">手机号</text>
        <input
          class="input"
          type="number"
          placeholder="请输入手机号"
          v-model="form.phone" />
      </view>

      <!-- 验证码 -->
      <view class="form-item">
        <text class="label">验证码</text>
        <input
          class="input"
          type="number"
          placeholder="请输入验证码"
          v-model="form.code" />
        <view class="verify-btn" @click="getCode">获取验证码</view>
      </view>

      <!-- 登录密码 -->
      <view class="form-item">
        <text class="label">登录密码</text>
        <input
          class="input"
          type="password"
          placeholder=""
          v-model="form.password" />
      </view>

      <!-- 确认密码 -->
      <view class="form-item">
        <text class="label">确认密码</text>
        <input
          class="input"
          type="password"
          placeholder=""
          v-model="form.confirmPassword" />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="btn-area">
      <button class="btn-submit" @click="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        phone: "",
        code: "",
        password: "",
        confirmPassword: "",
      },
    };
  },
  methods: {
    getCode() {
      uni.showToast({ title: "验证码已发送", icon: "none" });
    },
    handleSubmit() {
      uni.showToast({ title: "密码重置提交", icon: "none" });
    },
  },
};
</script>

<style scoped>
/* 复用注册页面的样式 */
.white-bg {
  background-color: #fff;
  min-height: 100vh;
  padding: 20rpx 40rpx;
}

.form-list {
  margin-top: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;
}

.label {
  width: 160rpx;
  font-size: 30rpx;
  color: #666;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.verify-btn {
  background-color: #eee;
  color: #666;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 4rpx;
}

.btn-area {
  margin-top: 80rpx;
}

.btn-submit {
  background-color: #ff8800;
  color: #fff;
  border-radius: 8rpx;
  font-size: 34rpx;
  border: none;
}
.btn-submit::after {
  border: none;
}
</style>
