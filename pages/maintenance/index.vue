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
          <image
            class="photo-img"
            :src="img"
            mode="aspectFill"
            @click="previewImage(i)"
            @longpress.stop="onPhotoLongPress(i)"
          ></image>
          <view class="photo-del" @click.stop="removePhoto(i)">×</view>
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

    <canvas canvas-id="watermarkCanvas" :style="{
      width: canvasWidth + 'px',
      height: canvasHeight + 'px',
      position: 'fixed',
      top: '-10000px',
      left: '-10000px'
    }"></canvas>

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
            <text class="wm-line">施工内容：{{ formData.content || deviceCode }}</text>
            <text class="wm-line">备注：{{ formData.remark || '无' }}</text>
            <text class="wm-line">拍摄时间：{{ currentTime }}</text>
            <text class="wm-line">地点：{{ deviceAddr }}</text>
            <text class="wm-line">经度：{{ formatLng(watermarkLng) }}</text>
            <text class="wm-line">纬度：{{ formatLat(watermarkLat) }}</text>
            <text class="wm-line">方位角：西{{ bearing }}°</text>
          </view>
          <!-- 右上角地图区域 + 二维码 -->
          <view class="wm-top-right">
            <image class="wm-qrcode" :src="qrcodeUrl" mode="aspectFit" @longpress="onQrcodeLongPress"></image>
            <view class="wm-map-box">
              <map class="wm-map" :longitude="watermarkLng" :latitude="watermarkLat" :scale="15"
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
      /** 拍照水印/二维码使用的实时经纬度（uni.getLocation） */
      watermarkLat: 0,
      watermarkLng: 0,
      formData: {
        content: '',
        maintainType: '',
        remark: ''
      },
      maintainTypes: ['日常巡检', '故障维修', '保养维护', '改造升级'],
      typeIndex: 0,
      photoList: [],
      /** 与 photoList 一一对应：该张照片合成水印时锁定的经纬度（长按缩略图导航用） */
      photoMetaList: [],
      showCamera: false,
      submitting: false,
      currentTime: '',
      bearing: '271',
      qrcodeUrl: '',
      mapMarkers: [],
      cameraCtx: null,
      canvasWidth: 1080,
      canvasHeight: 1920
    }
  },
  onLoad(options) {
    this.deviceName = decodeURIComponent(options.name || '');
    this.deviceCode = decodeURIComponent(options.code || '');
    this.deviceAddr = decodeURIComponent(options.addr || '');
    this.deviceLat = Number(options.lat) || 0;
    this.deviceLng = Number(options.lng) || 0;
    this.watermarkLat = this.deviceLat;
    this.watermarkLng = this.deviceLng;
    this.formData.maintainType = this.maintainTypes[0];
    this.syncMapMarkers();
    this.generateQrcode();
  },
  onReady() {
    this.cameraCtx = uni.createCameraContext();
  },
  methods: {
    formatLat(lat) {
      const n = Number(lat);
      return Number.isFinite(n) ? `${n.toFixed(6)}°N` : '--';
    },
    formatLng(lng) {
      const n = Number(lng);
      return Number.isFinite(n) ? `${n.toFixed(6)}°E` : '--';
    },
    syncMapMarkers() {
      this.mapMarkers = [{
        id: 1,
        latitude: this.watermarkLat,
        longitude: this.watermarkLng,
        width: 30,
        height: 30
      }];
    },
    /** 实时获取当前位置，用于水印与二维码（失败则回退为设备登记坐标） */
    refreshLocation() {
      return new Promise((resolve) => {
        uni.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          success: (res) => {
            this.watermarkLat = res.latitude;
            this.watermarkLng = res.longitude;
            this.syncMapMarkers();
            this.generateQrcode();
            resolve(true);
          },
          fail: () => {
            if (this.deviceLat && this.deviceLng) {
              this.watermarkLat = this.deviceLat;
              this.watermarkLng = this.deviceLng;
              this.syncMapMarkers();
              this.generateQrcode();
              uni.showToast({ title: '定位失败，已用设备登记坐标', icon: 'none' });
            } else {
              uni.showToast({ title: '无法获取位置，请开启定位权限', icon: 'none' });
            }
            resolve(false);
          }
        });
      });
    },
    onTypeChange(e) {
      this.typeIndex = e.detail.value;
      this.formData.maintainType = this.maintainTypes[this.typeIndex];
    },
    generateQrcode() {
      const lat = this.watermarkLat;
      const lng = this.watermarkLng;
      const navUrl = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(this.deviceName)}&coordinate=gaode&callnative=1`;
      this.qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(navUrl)}`;
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
    async takeWatermarkPhoto() {
      if (!this.formData.content && !this.deviceCode) {
        return uni.showToast({ title: '请先填写施工内容', icon: 'none' });
      }
      uni.showLoading({ title: '正在定位...', mask: true });
      await this.refreshLocation();
      this.updateTime();
      uni.hideLoading();
      this.showCamera = true;
    },
    closeCamera() {
      this.showCamera = false;
    },
    onCameraError() {
      // 相机不可用时，改用相册/系统相机选图
      this.fallbackChooseImage();
    },
    async fallbackChooseImage() {
      this.showCamera = false;
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: async (res) => {
          uni.showLoading({ title: '处理中...', mask: true });
          await this.refreshLocation();
          this.updateTime();
          this.generateQrcode();
          await this.addWatermark(res.tempFilePaths[0]);
        }
      });
    },
    async capturePhoto() {
      if (!this.cameraCtx) {
        await this.fallbackChooseImage();
        return;
      }
      uni.showLoading({ title: '正在定位...', mask: true });
      await this.refreshLocation();
      this.updateTime();
      this.generateQrcode();
      uni.showLoading({ title: '处理中...', mask: true });
      this.cameraCtx.takePhoto({
        quality: 'high',
        success: (res) => {
          this.addWatermark(res.tempImagePath);
        },
        fail: () => {
          uni.hideLoading();
          this.fallbackChooseImage();
        }
      });
    },
    async addWatermark(imagePath) {
      // 锁定本次水印使用的经纬度（与二维码一致）
      const snapLat = this.watermarkLat;
      const snapLng = this.watermarkLng;
      try {
        const imgInfo = await new Promise((resolve, reject) => {
          uni.getImageInfo({ src: imagePath, success: resolve, fail: reject });
        });

        const { width, height } = imgInfo;
        this.canvasWidth = width;
        this.canvasHeight = height;
        await this.$nextTick();
        await new Promise((r) => setTimeout(r, 100));

        let localQrcode = '';
        try {
          const qrInfo = await new Promise((resolve, reject) => {
            uni.getImageInfo({ src: this.qrcodeUrl, success: resolve, fail: reject });
          });
          localQrcode = qrInfo.path;
        } catch (e) {
          void e;
        }

        const lngStr = Number(snapLng).toFixed(6);
        const latStr = Number(snapLat).toFixed(6);

        await new Promise((resolveDraw) => {
          const ctx = uni.createCanvasContext('watermarkCanvas', this);
          ctx.drawImage(imagePath, 0, 0, width, height);

          const scale = width / 1080;
          const padding = 40 * scale;

          const texts = [
            `施工内容：${this.formData.content || this.deviceCode}`,
            `备注：${this.formData.remark || '无'}`,
            `拍摄时间：${this.currentTime}`,
            `地点：${this.deviceAddr}`,
            `经度：${lngStr}°E`,
            `纬度：${latStr}°N`,
            `方位角：西${this.bearing}°`
          ];

          const lineHeight = 45 * scale;
          const fontSize = 32 * scale;
          const boxWidth = 600 * scale;
          const headerHeight = 60 * scale;
          const contentHeight = texts.length * lineHeight + 40 * scale;
          const totalHeight = headerHeight + contentHeight;

          const boxLeft = padding;
          const boxBottom = height - padding;
          const boxTop = boxBottom - totalHeight;

          // ---- 左下角信息区 ----
          ctx.setFillStyle('#4a90e2');
          ctx.fillRect(boxLeft, boxTop, boxWidth, headerHeight);

          ctx.setFillStyle('rgba(0, 0, 0, 0.45)');
          ctx.fillRect(boxLeft, boxTop + headerHeight, boxWidth, contentHeight);

          ctx.setFillStyle('#f5a623');
          ctx.beginPath();
          ctx.arc(boxLeft + 30 * scale, boxTop + headerHeight / 2, 12 * scale, 0, 2 * Math.PI);
          ctx.fill();

          ctx.setFillStyle('#ffffff');
          ctx.setFontSize(36 * scale);
          ctx.setTextBaseline('middle');
          ctx.fillText(this.formData.maintainType || '设备维护', boxLeft + 60 * scale, boxTop + headerHeight / 2);

          ctx.setFontSize(fontSize);
          ctx.setTextBaseline('top');
          texts.forEach((text, i) => {
            ctx.fillText(text, boxLeft + 20 * scale, boxTop + headerHeight + 20 * scale + i * lineHeight);
          });

          // ---- 右上角：二维码 + 地图截图区 ----
          const qrSize = 180 * scale;
          const mapW = 260 * scale;
          const mapH = 200 * scale;
          const blockRight = width - padding;
          const blockTop = padding;

          // 二维码白底 + 图片
          const qrLeft = blockRight - qrSize;
          ctx.setFillStyle('#ffffff');
          ctx.fillRect(qrLeft - 10 * scale, blockTop - 10 * scale, qrSize + 20 * scale, qrSize + 20 * scale);
          if (localQrcode) {
            ctx.drawImage(localQrcode, qrLeft, blockTop, qrSize, qrSize);
          }

          // 地图区域（灰底模拟，因 canvas 无法截取 map 组件）
          const mapTop = blockTop + qrSize + 30 * scale;
          const mapLeft = blockRight - mapW;
          ctx.setFillStyle('#e8edf3');
          ctx.fillRect(mapLeft, mapTop, mapW, mapH);
          ctx.setStrokeStyle('rgba(255,255,255,0.6)');
          ctx.setLineWidth(2 * scale);
          ctx.strokeRect(mapLeft, mapTop, mapW, mapH);

          // 地图上标注点
          const pinX = mapLeft + mapW / 2;
          const pinY = mapTop + mapH / 2 - 15 * scale;
          ctx.setFillStyle('#e74c3c');
          ctx.beginPath();
          ctx.arc(pinX, pinY, 12 * scale, 0, 2 * Math.PI);
          ctx.fill();
          ctx.setFillStyle('#ffffff');
          ctx.beginPath();
          ctx.arc(pinX, pinY, 5 * scale, 0, 2 * Math.PI);
          ctx.fill();

          // "验真/导航" 文字
          ctx.setFillStyle('#ffffff');
          ctx.setFontSize(26 * scale);
          ctx.setTextAlign('center');
          ctx.setTextBaseline('top');
          ctx.setShadow(1 * scale, 1 * scale, 4 * scale, 'rgba(0,0,0,0.6)');
          ctx.fillText('验真/导航', mapLeft + mapW / 2, mapTop + mapH + 16 * scale);
          ctx.setShadow(0, 0, 0, 'transparent');
          ctx.setTextAlign('left');
          ctx.setTextBaseline('top');

          ctx.draw(false, () => {
            setTimeout(() => {
              uni.canvasToTempFilePath({
                canvasId: 'watermarkCanvas',
                width,
                height,
                destWidth: width,
                destHeight: height,
                fileType: 'jpg',
                quality: 0.92,
                success: (res) => {
                  this.photoList.push(res.tempFilePath);
                  this.photoMetaList.push({ lat: snapLat, lng: snapLng });
                  this.showCamera = false;
                  uni.hideLoading();
                  uni.showToast({ title: '拍照成功', icon: 'success' });
                  resolveDraw();
                },
                fail: () => {
                  uni.hideLoading();
                  uni.showToast({ title: '保存图片失败', icon: 'none' });
                  resolveDraw();
                }
              }, this);
            }, 320);
          });
        });
      } catch (e) {
        void e;
        uni.hideLoading();
        uni.showToast({ title: '水印处理失败', icon: 'none' });
        this.photoList.push(imagePath);
        this.photoMetaList.push({ lat: snapLat, lng: snapLng });
        this.showCamera = false;
      }
    },
    removePhoto(index) {
      this.photoList.splice(index, 1);
      this.photoMetaList.splice(index, 1);
    },
    previewImage(index) {
      const urls = this.photoList;
      if (!urls.length) return;
      uni.previewImage({
        current: urls[index],
        urls,
        showmenu: true
      });
    },
    goToVerifyPage(lat, lng, photoSrc) {
      const la = Number.isFinite(Number(lat)) ? Number(lat) : this.watermarkLat;
      const ln = Number.isFinite(Number(lng)) ? Number(lng) : this.watermarkLng;
      const params = [
        `lat=${la}`,
        `lng=${ln}`,
        `addr=${encodeURIComponent(this.deviceAddr)}`,
        `time=${encodeURIComponent(this.currentTime)}`,
        `code=${encodeURIComponent(this.formData.content || this.deviceCode)}`,
        `name=${encodeURIComponent(this.deviceName)}`,
        `type=${encodeURIComponent(this.formData.maintainType || '设备维护')}`,
        `bearing=${this.bearing}`,
        `remark=${encodeURIComponent(this.formData.remark || '')}`,
        `photo=${encodeURIComponent(photoSrc || '')}`
      ].join('&');
      uni.navigateTo({ url: `/pages/qrVerify/index?${params}` });
    },
    onQrcodeLongPress() {
      this.goToVerifyPage();
    },
    onPhotoLongPress(index) {
      const meta = this.photoMetaList[index];
      const photo = this.photoList[index] || '';
      if (meta && Number.isFinite(meta.lat) && Number.isFinite(meta.lng)) {
        this.goToVerifyPage(meta.lat, meta.lng, photo);
      } else {
        this.goToVerifyPage(null, null, photo);
      }
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
