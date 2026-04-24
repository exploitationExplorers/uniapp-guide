<template>
  <view class="page">
    <view class="content">
      <!-- 表单结果 -->
      <view class="section-card">
        <view class="card-header">
          <view class="header-left">
            <view class="icon-block"></view>
            <text class="header-title">表单结果</text>
          </view>
        </view>
        <view class="card-body">
          <view class="form-row">
            <view class="label"><text class="req">*</text>结果</view>
            <picker class="picker-flex" :range="resultList" :value="form.result" @change="e => form.result = e.detail.value">
              <view class="picker-text green-text">
                {{ resultList[form.result] }} <text class="arrow">∨</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 维护项目 -->
      <view class="section-card">
        <view class="card-header">
          <view class="header-left">
            <view class="icon-block"></view>
            <text class="header-title">维护项目</text>
          </view>
          <view class="header-right">
            <text class="chevron-down">︾</text>
          </view>
        </view>
        <view class="card-body">
          
          <view class="form-col">
            <view class="label"><text class="req">*</text>检查井盖是否完好</view>
            <picker class="picker-box" :range="statusList" :value="form.status1" @change="e => form.status1 = e.detail.value">
              <view class="picker-box-text green-text">
                {{ statusList[form.status1] }} <text class="arrow">∨</text>
              </view>
            </picker>
          </view>

          <view class="form-col">
            <view class="label"><text class="req">*</text>检查井内是否有大块固体物</view>
            <picker class="picker-box" :range="statusList" :value="form.status2" @change="e => form.status2 = e.detail.value">
              <view class="picker-box-text green-text">
                {{ statusList[form.status2] }} <text class="arrow">∨</text>
              </view>
            </picker>
          </view>

          <view class="form-col">
            <view class="label"><text class="req">*</text>是否有积水</view>
            <picker class="picker-box" :range="statusList" :value="form.status3" @change="e => form.status3 = e.detail.value">
              <view class="picker-box-text green-text">
                {{ statusList[form.status3] }} <text class="arrow">∨</text>
              </view>
            </picker>
          </view>

          <view class="form-col">
            <view class="label"><text class="req">*</text>检查是否需要疏通</view>
            <picker class="picker-box" :range="statusList" :value="form.status4" @change="e => form.status4 = e.detail.value">
              <view class="picker-box-text green-text">
                {{ statusList[form.status4] }} <text class="arrow">∨</text>
              </view>
            </picker>
          </view>

          <view class="form-col">
            <view class="label"><text class="req">*</text>检查照片</view>
            <view class="upload-box" @click="chooseImage">
              <image v-if="form.photo" :src="form.photo" mode="aspectFill" class="uploaded-img"></image>
              <view v-else class="upload-placeholder">
                <text class="upload-icon">📷</text>
                <text class="upload-text">上传图片</text>
              </view>
            </view>
          </view>

          <view class="form-col">
            <view class="label">日期</view>
            <picker class="picker-box" mode="date" :value="form.date" @change="e => form.date = e.detail.value">
              <view class="picker-box-text black-text">
                {{ form.date }} <text class="arrow">∨</text>
              </view>
            </picker>
          </view>

          <view class="form-col">
            <view class="label">巡查人签名</view>
            <view class="sign-wrapper">
              <view class="sign-placeholder" v-if="!form.signImage">
                <button class="sign-btn" @click="openSignModal">手写签名</button>
              </view>
              <view class="sign-result" v-else @click="openSignModal">
                <image :src="form.signImage" mode="aspectFit" class="sign-img"></image>
              </view>
            </view>
          </view>

          <view class="form-col">
            <view class="label">备注</view>
            <view class="input-box">
              <input type="text" v-model="form.remark" placeholder="请输入内容" class="input-el" placeholder-style="color:#ccc;" />
            </view>
          </view>

          <view class="form-row-checkbox">
            <checkbox-group @change="onCcChange">
              <label class="cc-label">
                <checkbox value="1" color="#1890ff" style="transform:scale(0.8);" />
                <text>需要抄送</text>
              </label>
            </checkbox-group>
          </view>
          
        </view>
      </view>

      <view class="submit-wrap">
        <button class="submit-btn" @click="submitForm">提交</button>
      </view>
    </view>

    <!-- 手写签名弹窗 -->
    <view class="sign-modal" v-if="showSignModal" @touchmove.stop.prevent>
      <view class="sign-modal-mask" @click="closeSignModal"></view>
      <view class="sign-modal-content">
        <view class="sign-header">
          <text class="sign-title">请在下方手写签名</text>
          <text class="sign-close" @click="closeSignModal">×</text>
        </view>
        <view class="sign-body">
          <canvas class="sign-canvas" canvas-id="signCanvas" 
                  @touchstart="touchStart" 
                  @touchmove="touchMove" 
                  @touchend="touchEnd" 
                  disable-scroll="true"></canvas>
        </view>
        <view class="sign-footer">
          <button class="btn-clear" @click="clearSign">清除</button>
          <button class="btn-confirm" @click="confirmSign">确认</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      resultList: ['正常', '异常'],
      statusList: ['正常', '异常'],
      form: {
        result: 0,
        status1: 0,
        status2: 0,
        status3: 0,
        status4: 0,
        photo: '',
        date: '2026-04-24',
        signImage: '',
        remark: '',
        cc: false
      },
      
      showSignModal: false,
      ctx: null,
      isDrawing: false,
      hasSigned: false
    }
  },
  onLoad() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.form.date = `${y}-${m}-${d}`;
  },
  methods: {
    onCcChange(e) {
      this.form.cc = e.detail.value.length > 0;
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: (res) => {
          this.form.photo = res.tempFilePaths[0];
        }
      });
    },
    openSignModal() {
      this.showSignModal = true;
      this.hasSigned = false;
      setTimeout(() => {
        if(!this.ctx) {
          this.ctx = uni.createCanvasContext('signCanvas', this);
        }
        // 填充白色背景（避免导出图片背景透明变黑）
        this.ctx.setFillStyle('#ffffff');
        this.ctx.fillRect(0, 0, 2000, 2000);
        this.ctx.draw(false);
        
        this.ctx.setLineWidth(5);
        this.ctx.setStrokeStyle('#000000');
        this.ctx.setLineCap('round');
        this.ctx.setLineJoin('round');
      }, 150);
    },
    closeSignModal() {
      this.showSignModal = false;
    },
    touchStart(e) {
      this.isDrawing = true;
      this.hasSigned = true;
      const touch = e.touches[0];
      this.ctx.beginPath();
      this.ctx.moveTo(touch.x, touch.y);
    },
    touchMove(e) {
      if (this.isDrawing) {
        const touch = e.touches[0];
        this.ctx.lineTo(touch.x, touch.y);
        this.ctx.stroke();
        this.ctx.draw(true);
        this.ctx.moveTo(touch.x, touch.y);
      }
    },
    touchEnd() {
      this.isDrawing = false;
    },
    clearSign() {
      this.ctx.setFillStyle('#ffffff');
      this.ctx.fillRect(0, 0, 2000, 2000);
      this.ctx.draw(false);
      this.hasSigned = false;
    },
    confirmSign() {
      if (!this.hasSigned) {
        return uni.showToast({ title: '请先签名', icon: 'none' });
      }
      uni.canvasToTempFilePath({
        canvasId: 'signCanvas',
        fileType: 'png',
        success: (res) => {
          this.form.signImage = res.tempFilePath;
          this.showSignModal = false;
        },
        fail: () => {
          uni.showToast({ title: '生成签名失败', icon: 'none' });
        }
      }, this);
    },
    submitForm() {
      if (!this.form.photo) {
        return uni.showToast({ title: '请上传检查照片', icon: 'none' });
      }
      if (!this.form.signImage) {
        return uni.showToast({ title: '请完成手写签名', icon: 'none' });
      }
      uni.showLoading({ title: '提交中...' });
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: '提交成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 1000);
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f2f2f2;
  padding: 16rpx 20rpx 40rpx;
}

.section-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #eaf3fd;
  padding: 16rpx 24rpx;
}

.header-left {
  display: flex;
  align-items: center;
}

.icon-block {
  width: 14rpx;
  height: 28rpx;
  background: #1890ff;
  border-radius: 4rpx;
  margin-right: 12rpx;
}

.header-title {
  font-size: 30rpx;
  color: #1890ff;
  font-weight: bold;
}

.header-right .chevron-down {
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
}

.card-body {
  padding: 0 24rpx 20rpx;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0 10rpx;
}

.form-col {
  display: flex;
  flex-direction: column;
  padding: 24rpx 0 0;
}

.label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.req {
  color: #f5222d;
  margin-right: 6rpx;
}

/* 结果栏右侧的 picker */
.picker-flex {
  flex: 1;
  text-align: right;
}

.picker-text {
  font-size: 28rpx;
}

.green-text {
  color: #52c41a;
}

.black-text {
  color: #333;
}

.arrow {
  color: #999;
  margin-left: 8rpx;
  font-size: 24rpx;
}

/* 维护项目下的输入框样式 */
.picker-box {
  border: 1px solid #ebebeb;
  border-radius: 6rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.picker-box-text {
  flex: 1;
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  align-items: center;
}

.upload-box {
  border: 1px solid #ebebeb;
  border-radius: 6rpx;
  height: 140rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20rpx;
  background: #fafafa;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 40rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.upload-text {
  font-size: 22rpx;
  color: #666;
}

.uploaded-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

.sign-wrapper {
  border: 1px solid #ebebeb;
  border-radius: 6rpx;
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
}

.sign-btn {
  background: #1890ff;
  color: #fff;
  font-size: 28rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 40rpx;
  border-radius: 6rpx;
}

.sign-btn::after {
  border: none;
}

.sign-result {
  width: 100%;
  height: 200rpx;
  display: flex;
  justify-content: center;
}

.sign-img {
  width: 100%;
  height: 100%;
}

.input-box {
  border: 1px solid #ebebeb;
  border-radius: 6rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.input-el {
  width: 100%;
  font-size: 28rpx;
  color: #333;
}

.form-row-checkbox {
  padding: 30rpx 0 10rpx;
}

.cc-label {
  font-size: 28rpx;
  color: #333;
  display: flex;
  align-items: center;
}

.submit-wrap {
  margin-top: 30rpx;
}

.submit-btn {
  background: #1890ff;
  color: #fff;
  font-size: 34rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 8rpx;
}
.submit-btn::after {
  border: none;
}

/* 签名弹窗 */
.sign-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sign-modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
}

.sign-modal-content {
  position: relative;
  width: 90%;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #eee;
}

.sign-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.sign-close {
  font-size: 44rpx;
  color: #999;
  line-height: 1;
}

.sign-body {
  width: 100%;
  height: 600rpx;
  background: #fafafa;
}

.sign-canvas {
  width: 100%;
  height: 100%;
}

.sign-footer {
  display: flex;
  border-top: 1px solid #eee;
}

.btn-clear, .btn-confirm {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  border-radius: 0;
  background: #fff;
}

.btn-clear::after, .btn-confirm::after {
  border: none;
}

.btn-clear {
  color: #666;
  border-right: 1px solid #eee;
}

.btn-confirm {
  color: #1890ff;
  font-weight: bold;
}
</style>