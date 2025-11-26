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
        <!-- 修改为动态文本和禁用样式 -->
        <view
          class="verify-btn"
          :class="{ disabled: isCounting }"
          @click="getCode">
          {{ verifyBtnText }}
        </view>
      </view>

      <!-- 登录密码 -->
      <view class="form-item">
        <text class="label">登录密码</text>
        <input
          class="input"
          type="password"
          password
          placeholder="请输入密码"
          v-model="form.password" />
      </view>

      <!-- 确认密码 -->
      <view class="form-item">
        <text class="label">确认密码</text>
        <input
          class="input"
          password
          type="password"
          placeholder="请确认密码"
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
import { getCode, resetPwd } from "@/request/api/index.js";
export default {
  data() {
    return {
      form: {
        phone: "",
        code: "",
        password: "",
        confirmPassword: "",
      },
      timer: null,
      countdown: 60,
      isCounting: false,
    };
  },
  computed: {
    verifyBtnText() {
      return this.isCounting ? `${this.countdown}s后重发` : "获取验证码";
    },
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    async getCode() {
      if (this.isCounting) return;

      if (!this.form.phone) {
        return uni.showToast({ title: "请输入手机号", icon: "none" });
      }

      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(this.form.phone)) {
        return uni.showToast({ title: "手机号格式不正确", icon: "none" });
      }
      await getCode({ phone: this.form.phone }).then((res) => {
        if (res.data && res.data.success) {
          if (res.data.message && res.data.message.length <= 6) {
            this.form.code = res.data.message;
          }
          uni.showToast({ title: "验证码已发送", icon: "none" });

          this.isCounting = true;
          this.countdown = 60;
          this.timer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
              clearInterval(this.timer);
              this.timer = null;
              this.isCounting = false;
              this.countdown = 60;
            }
          }, 1000);
        } else {
          uni.showToast({
            title: res.data.message || "获取验证码失败",
            icon: "none",
          });
        }
      });
    },
    async handleSubmit() {
      const { phone, code, password, confirmPassword } = this.form;

      if (!phone) return uni.showToast({ title: "请输入手机号", icon: "none" });
      if (!code) return uni.showToast({ title: "请输入验证码", icon: "none" });
      if (!password)
        return uni.showToast({ title: "请输入登录密码", icon: "none" });
      if (!confirmPassword)
        return uni.showToast({ title: "请输入确认密码", icon: "none" });

      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(phone)) {
        return uni.showToast({ title: "手机号格式不正确", icon: "none" });
      }

      if (password !== confirmPassword) {
        return uni.showToast({ title: "两次输入的密码不一致", icon: "none" });
      }

      uni.showLoading({ title: "提交中..." });
      await resetPwd({
        phone,
        code,
        password,
      }).then((res) => {
        uni.hideLoading();
        if (res.data && res.data.success) {
          uni.showToast({ title: "密码重置成功", icon: "success" });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.hideLoading();
          uni.showToast({
            title: res.data.message || "重置失败",
            icon: "none",
          });
        }
      });
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
  min-width: 140rpx;
  text-align: center;
}

.verify-btn.disabled {
  background-color: #f5f5f5;
  color: #999;
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
