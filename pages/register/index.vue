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
    getCode() {
      if (this.isCounting) return;

      if (!this.form.phone) {
        return uni.showToast({ title: "请输入手机号", icon: "none" });
      }

      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(this.form.phone)) {
        return uni.showToast({ title: "手机号格式不正确", icon: "none" });
      }

      uni.request({
        url: getApp().globalData.baseUrl + "/api/getCode",
        data: { phone: this.form.phone },
        method: "GET",
        success: (res) => {
          if (res.data && res.data.success) {
            this.form.code = res.data.message;
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
        },
        fail: () => {
          uni.showToast({ title: "网络请求失败", icon: "none" });
        },
      });
    },
    checkboxChange(e) {
      this.agreed = e.detail.value.includes("agreed");
    },
    handleRegister() {
      // 1. 协议校验
      if (!this.agreed) {
        return uni.showToast({ title: "请先同意使用条款", icon: "none" });
      }

      const { phone, code, password, confirmPassword, name } = this.form;

      // 2. 必填项校验
      if (!phone) return uni.showToast({ title: "请输入手机号", icon: "none" });
      if (!code) return uni.showToast({ title: "请输入验证码", icon: "none" });
      if (!password)
        return uni.showToast({ title: "请输入登录密码", icon: "none" });
      if (!confirmPassword)
        return uni.showToast({ title: "请输入确认密码", icon: "none" });
      if (!name) return uni.showToast({ title: "请输入姓名", icon: "none" });

      // 3. 格式与逻辑校验
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(phone)) {
        return uni.showToast({ title: "手机号格式不正确", icon: "none" });
      }

      if (password !== confirmPassword) {
        return uni.showToast({ title: "两次输入的密码不一致", icon: "none" });
      }

      // 4. 发起请求
      uni.showLoading({ title: "注册中..." });

      uni.request({
        url: getApp().globalData.baseUrl + "/api/register",
        method: "POST",
        data: {
          phone,
          code,
          password,
          name,
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data && res.data.success) {
            uni.showToast({ title: "注册成功", icon: "success" });
            // 延迟跳转回登录页
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || "注册失败",
              icon: "none",
            });
          }
        },
        fail: (error) => {
          uni.hideLoading();
          uni.showToast({ title: "网络请求失败", icon: "none" });
        },
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
  min-width: 140rpx; /* 固定最小宽度防止文字跳动 */
  text-align: center;
}

/* 禁用状态样式 */
.verify-btn.disabled {
  background-color: #f5f5f5;
  color: #999;
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
