<template>
  <view class="container white-bg">
    <!-- 表单列表 -->
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

      <!-- 姓名 -->
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" type="text" placeholder="" v-model="form.name" />
      </view>
    </view>

    <!-- 协议勾选 -->
    <view class="agreement-box">
      <checkbox-group @change="checkboxChange">
        <label class="checkbox-label">
          <checkbox
            value="agreed"
            :checked="agreed"
            style="transform: scale(0.7)"
            color="#FF8800" />
          <text class="text">
            我已阅读并同意
            <text class="link">使用条款</text>
          </text>
        </label>
      </checkbox-group>
    </view>

    <!-- 提交按钮 -->
    <view class="btn-area">
      <button class="btn-submit" @click="handleRegister">注册</button>
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
        name: "",
      },
      agreed: false,
    };
  },
  methods: {
    getCode() {
      uni.showToast({ title: "验证码已发送", icon: "none" });
    },
    checkboxChange(e) {
      this.agreed = e.detail.value.includes("agreed");
    },
    handleRegister() {
      if (!this.agreed) {
        return uni.showToast({ title: "请先同意使用条款", icon: "none" });
      }
      uni.showToast({ title: "注册提交", icon: "none" });
    },
  },
};
</script>

<style scoped>
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

.agreement-box {
  margin-top: 40rpx;
  font-size: 26rpx;
  color: #666;
}

.checkbox-label {
  display: flex;
  align-items: center;
}

.link {
  color: #29b6f6;
}

.btn-area {
  margin-top: 60rpx;
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
