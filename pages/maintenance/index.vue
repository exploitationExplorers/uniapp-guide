<template>
  <view class="page">
    <!-- 设备信息 -->
    <view class="section device-card">
      <view class="section-title">设备信息</view>
      <view class="info-row"><text class="label">设备名称：</text><text>{{ deviceName }}</text></view>
      <view class="info-row"><text class="label">设备编号：</text><text>{{ deviceCode }}</text></view>
      <view class="info-row"><text class="label">设备地址：</text><text>{{ deviceAddr }}</text></view>
    </view>

    <!-- 维保内容 -->
    <view class="section">
      <view class="section-title">维保内容</view>
      <view class="form-item">
        <text class="form-label">施工内容</text>
        <input class="form-input" v-model="formData.content" placeholder="请输入施工内容" />
      </view>
      <view class="form-item">
        <text class="form-label">维保类型</text>
        <picker :range="maintainTypes" @change="onTypeChange" :value="typeIndex">
          <view class="form-input picker-val">{{ maintainTypes[typeIndex] || '请选择维保类型' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea class="form-textarea" v-model="formData.remark" placeholder="请输入备注信息" />
      </view>
    </view>

    <!-- 拍照区域 -->
    <view class="section">
      <view class="section-title">维保拍照</view>
      <view class="photo-list">
        <view class="photo-item" v-for="(img, i) in photoList" :key="i">
          <image class="photo-img" :src="img" mode="aspectFill" @click="previewImage(i)"></image>
          <view class="photo-del" @click="removePhoto(i)">×</view>
        </view>
        <view class="photo-add" @click="takeWatermarkPhoto" v-if="photoList.length < 4">
          <text class="add-icon">📷</text>
          <text class="add-text">水印拍照</text>
        </view>
      </view>
    </view>

    <!-- 提交 -->
    <button class="submit-btn" @click="submitMaintenance" :disabled="submitting">
      {{ submitting ? '提交中...' : '提交维保记录' }}
    </button>

    <!-- 水印拍照预览弹窗 -->
    <view class="watermark-mask" v-if="showCamera" @touchmove.prevent>
      <camera class="camera-view" device-position="back" flash="auto" @error="onCameraError">
        <!-- 水印层 -->
        <view class="watermark-overlay">
          <!-- 左下角信息 -->
          <view class="wm-bottom-left">
            <view class="wm-tag">
              <view class="wm-dot"></view>
              <text class="wm-tag-text">{{ formData.maintainType || '设备维护' }}</text>
            </view>
            <text class="wm-line">施工内容：{{ deviceCode }}</text>
            <text class="wm-line">备　　注：{{ formData.remark || '无' }}</text>
            <text class="wm-line">拍摄时间：{{ currentTime }}</text>
            <text class="wm-line">地　　点：{{ deviceAddr }}</text>
            <text class="wm-line">经　　度：{{ deviceLng }}°E</text>
            <text class="wm-line">纬　　度：{{ deviceLat }}°N</text>
            <text class="wm-line">方 位 角：西{{ bearing }}°</text>
          </view>
          <!-- 右上角地图区域 + 二维码 -->
          <view class="wm-top-right">
            <image class="wm-qrcode" :src="qrcodeUrl" mode="aspectFit" @longpress="onQrcodeLongPress"></image>
            <view class="wm-map-box">
              <map class="wm-map" :longitude="deviceLng" :latitude="deviceLat" :scale="15"
                :markers="mapMarkers" :show-location="false"></map>
            </view>
            <text class="wm-hint">验真/导航</text>
          </view>
        </view>
      </camera>

      <!-- 底部操作 -->
      <view class="camera-btns">
        <view class="cam-btn cancel-btn" @click="closeCamera">取消</view>
        <view class="cam-btn shoot-btn" @click="capturePhoto">📷</view>
        <view class="cam-btn" style="opacity:0;">占位</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      deviceName: '',
      deviceCode: '',
      deviceAddr: '',
      deviceLat: 0,
      deviceLng: 0,
      formData: {
        content: '',
        maintainType: '',
        remark: ''
      },
      maintainTypes: ['日常巡检', '故障维修', '保养维护', '改造升级'],
      typeIndex: 0,
      photoList: [],
      showCamera: false,
      submitting: false,
      currentTime: '',
      bearing: '271',
      qrcodeUrl: '',
      mapMarkers: [],
      cameraCtx: null
    }
  },
  onLoad(options) {
    this.deviceName = decodeURIComponent(options.name || '');
    this.deviceCode = decodeURIComponent(options.code || '');
    this.deviceAddr = decodeURIComponent(options.addr || '');
    this.deviceLat = Number(options.lat) || 0;
    this.deviceLng = Number(options.lng) || 0;
    this.formData.maintainType = this.maintainTypes[0];
    this.mapMarkers = [{
      id: 1,
      latitude: this.deviceLat,
      longitude: this.deviceLng,
      width: 30,
      height: 30
    }];
    this.generateQrcode();
  },
  onReady() {
    this.cameraCtx = uni.createCameraContext();
  },
  methods: {
    onTypeChange(e) {
      this.typeIndex = e.detail.value;
      this.formData.maintainType = this.maintainTypes[this.typeIndex];
    },
    generateQrcode() {
      // 生成一个包含经纬度的导航链接的二维码图片
      // 使用腾讯地图URI scheme，长按可调起导航
      const navUrl = `https://uri.amap.com/marker?position=${this.deviceLng},${this.deviceLat}&name=${encodeURIComponent(this.deviceName)}&coordinate=gaode&callnative=1`;
      // 用在线二维码API生成
      this.qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(navUrl)}`;
    },
    updateTime() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const h = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      this.currentTime = `${y}.${m}.${d} ${h}:${mi}`;
    },
    takeWatermarkPhoto() {
      if (!this.formData.content && !this.deviceCode) {
        return uni.showToast({ title: '请先填写施工内容', icon: 'none' });
      }
      this.updateTime();
      this.showCamera = true;
    },
    closeCamera() {
      this.showCamera = false;
    },
    onCameraError(e) {
      console.error('相机错误:', e);
      // 相机不可用时，改用chooseImage
      this.fallbackChooseImage();
    },
    fallbackChooseImage() {
      this.showCamera = false;
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          this.photoList.push(res.tempFilePaths[0]);
        }
      });
    },
    capturePhoto() {
      if (!this.cameraCtx) {
        this.fallbackChooseImage();
        return;
      }
      this.cameraCtx.takePhoto({
        quality: 'high',
        success: (res) => {
          this.photoList.push(res.tempImagePath);
          this.showCamera = false;
          uni.showToast({ title: '拍照成功', icon: 'success' });
        },
        fail: () => {
          this.fallbackChooseImage();
        }
      });
    },
    removePhoto(index) {
      this.photoList.splice(index, 1);
    },
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: this.photoList
      });
    },
    onQrcodeLongPress() {
      const navUrl = `https://uri.amap.com/marker?position=${this.deviceLng},${this.deviceLat}&name=${encodeURIComponent(this.deviceName)}&coordinate=gaode&callnative=1`;
      uni.setClipboardData({
        data: navUrl,
        success: () => {
          uni.showModal({
            title: '导航信息',
            content: `设备"${this.deviceName}"位于${this.deviceAddr}\n经度: ${this.deviceLng}\n纬度: ${this.deviceLat}\n\n导航链接已复制到剪贴板，可粘贴到浏览器打开导航`,
            showCancel: true,
            cancelText: '取消',
            confirmText: '打开导航',
            success: (res) => {
              if (res.confirm) {
                uni.openLocation({
                  latitude: this.deviceLat,
                  longitude: this.deviceLng,
                  name: this.deviceName,
                  address: this.deviceAddr,
                  scale: 18
                });
              }
            }
          });
        }
      });
    },
    submitMaintenance() {
      if (!this.formData.content) {
        return uni.showToast({ title: '请输入施工内容', icon: 'none' });
      }
      if (this.photoList.length === 0) {
        return uni.showToast({ title: '请至少拍摄一张照片', icon: 'none' });
      }

      this.submitting = true;
      // 模拟提交
      setTimeout(() => {
        this.submitting = false;
        uni.showModal({
          title: '提交成功',
          content: `设备 ${this.deviceCode} 维保记录已上传`,
          showCancel: false,
          success: () => {
            uni.navigateBack();
          }
        });
      }, 1500);
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f4f6f8;
  padding: 20rpx 30rpx;
  padding-bottom: 140rpx;
}

.section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.device-card {
  border-left: 8rpx solid #1890ff;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  padding: 10rpx 0;
  font-size: 28rpx;
  color: #333;
}

.label {
  color: #888;
  width: 170rpx;
  flex-shrink: 0;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  background-color: #f8f9fb;
  border: 1px solid #ebedf0;
  border-radius: 8rpx;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-val {
  display: flex;
  align-items: center;
}

.form-textarea {
  background-color: #f8f9fb;
  border: 1px solid #ebedf0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  min-height: 160rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 照片区 */
.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.photo-item {
  width: 200rpx;
  height: 200rpx;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-del {
  position: absolute;
  top: 0;
  right: 0;
  width: 44rpx;
  height: 44rpx;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 32rpx;
  text-align: center;
  line-height: 44rpx;
  border-bottom-left-radius: 12rpx;
}

.photo-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.add-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.add-text {
  font-size: 24rpx;
  color: #999;
}

/* 提交按钮 */
.submit-btn {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  background: linear-gradient(90deg, #1890ff 0%, #36cfc9 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 34rpx;
  height: 90rpx;
  line-height: 90rpx;
  border: none;
  box-shadow: 0 8rpx 16rpx rgba(24,144,255,0.3);
}

.submit-btn::after {
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.6;
}

/* 水印相机全屏弹窗 */
.watermark-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.camera-view {
  flex: 1;
  width: 100%;
  position: relative;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

/* 左下角水印 */
.wm-bottom-left {
  position: absolute;
  left: 20rpx;
  bottom: 20rpx;
  background-color: rgba(0,0,0,0.45);
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  max-width: 70%;
}

.wm-tag {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.wm-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #faad14;
  margin-right: 12rpx;
}

.wm-tag-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #faad14;
}

.wm-line {
  font-size: 22rpx;
  color: #fff;
  line-height: 1.8;
  display: block;
}

/* 右上角 */
.wm-top-right {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
}

.wm-qrcode {
  width: 120rpx;
  height: 120rpx;
  background-color: #fff;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.wm-map-box {
  width: 200rpx;
  height: 160rpx;
  border-radius: 8rpx;
  overflow: hidden;
  border: 2rpx solid rgba(255,255,255,0.5);
}

.wm-map {
  width: 100%;
  height: 100%;
}

.wm-hint {
  font-size: 20rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 8rpx;
}

/* 底部拍照按钮 */
.camera-btns {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 40rpx 60rpx;
  background-color: rgba(0,0,0,0.6);
}

.cam-btn {
  color: #fff;
  font-size: 32rpx;
  padding: 20rpx 40rpx;
}

.cancel-btn {
  font-size: 30rpx;
}

.shoot-btn {
  width: 120rpx;
  height: 120rpx;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  border: 6rpx solid rgba(255,255,255,0.5);
}
</style>
