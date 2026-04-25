<template>
  <view class="page">
    <!-- 设备信息 -->
    <view class="section device-card">
      <view class="section-title">设备信息</view>
      <view class="info-row"><text class="label">设备名称：</text><text class="info-value">{{ displayText(deviceName) }}</text></view>
      <view class="info-row"><text class="label">设备编号：</text><text class="info-value">{{ displayText(deviceCode) }}</text></view>
      <view class="info-row"><text class="label">设备地址：</text><text class="info-value">{{ displayText(deviceAddr) }}</text></view>
      <view class="info-row"><text class="label">扫码时间：</text><text class="info-value">{{ displayText(scanTime) }}</text></view>
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
            <text class="wm-line">地点：{{ displayText(deviceAddr) }}</text>
            <text class="wm-line">经度：{{ formatLng(watermarkLng) }}</text>
            <text class="wm-line">纬度：{{ formatLat(watermarkLat) }}</text>
            <text class="wm-line">方位角：西{{ bearing }}°</text>
          </view>
          <!-- 右上角：仅地图（二维码只在拍完合成后的照片里出现，此处不展示） -->
          <view class="wm-top-right">
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

    <!-- 拍完照后点击缩略图：全屏黑底预览（类似系统相册）；长按右上角透明区 → qrVerify -->
    <view
      v-if="showPhotoPreview"
      class="photo-viewer-mask"
      @touchmove.stop.prevent
    >
      <view class="photo-viewer-stage" @click.stop>
        <view class="photo-viewer-bar">
          <text class="photo-viewer-done" @click="closePhotoPreview">完成</text>
        </view>
        <view class="photo-viewer-center">
          <view class="photo-viewer-img-wrap">
            <image
              class="photo-viewer-img"
              :src="photoList[previewIndex]"
              mode="aspectFit"
            />
            <view
              class="photo-viewer-qr-zone"
              @longpress.stop="onViewerQrLongPress"
              @click.stop
            />
          </view>
        </view>
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
      scanTime: '',
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
      canvasHeight: 1920,
      showPhotoPreview: false,
      previewIndex: 0
    }
  },
  onLoad(options) {
    this.deviceName = decodeURIComponent(options.name || '');
    this.deviceCode = decodeURIComponent(options.code || '');
    this.deviceAddr = decodeURIComponent(options.addr || '');
    this.scanTime = this.normalizeScanTime(decodeURIComponent(options.scanTime || ''));
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
    displayText(value) {
      const text = String(value || '').trim();
      return text || '--';
    },
    normalizeScanTime(value) {
      const text = String(value || '').trim();
      if (!text) return '';
      if (/^\d{13}$/.test(text)) {
        return this.formatFullTime(new Date(Number(text)));
      }
      if (/^\d{10}$/.test(text)) {
        return this.formatFullTime(new Date(Number(text) * 1000));
      }
      return text.replace(/T/g, ' ').replace(/\//g, '.');
    },
    formatFullTime(date = new Date()) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const mi = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}.${m}.${d} ${h}:${mi}:${s}`;
    },
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
      const deviceTitle = this.deviceName || this.deviceCode || '设备维保';
      const codeParam = (this.deviceCode || '').trim();
      // 与扫码页 normalizeScanCode 一致：query 中携带 hydrantCode，现场扫印刷/电子合成图可解析出消火栓编号
      const navUrl = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(deviceTitle)}&coordinate=gaode&callnative=1${codeParam ? `&hydrantCode=${encodeURIComponent(codeParam)}` : ''}`;
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
          const url = this.qrcodeUrl;
          if (url && /^https?:\/\//i.test(url)) {
            const dl = await new Promise((resolve) => {
              uni.downloadFile({ url, success: resolve, fail: () => resolve({ statusCode: 0 }) });
            });
            if (dl.statusCode === 200 && dl.tempFilePath) {
              const qrInfo = await new Promise((resolve, reject) => {
                uni.getImageInfo({ src: dl.tempFilePath, success: resolve, fail: reject });
              });
              localQrcode = qrInfo.path;
            }
          } else if (url) {
            const qrInfo = await new Promise((resolve, reject) => {
              uni.getImageInfo({ src: url, success: resolve, fail: reject });
            });
            localQrcode = qrInfo.path;
          }
        } catch (e) {
          void e;
        }

        const lngStr = Number(snapLng).toFixed(6);
        const latStr = Number(snapLat).toFixed(6);

        const fillRoundRect = (ctx2, x, y, w, h, r, color) => {
          const rr = Math.min(r, w / 2, h / 2);
          ctx2.setFillStyle(color);
          ctx2.beginPath();
          ctx2.moveTo(x + rr, y);
          ctx2.lineTo(x + w - rr, y);
          ctx2.quadraticCurveTo(x + w, y, x + w, y + rr);
          ctx2.lineTo(x + w, y + h - rr);
          ctx2.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
          ctx2.lineTo(x + rr, y + h);
          ctx2.quadraticCurveTo(x, y + h, x, y + h - rr);
          ctx2.lineTo(x, y + rr);
          ctx2.quadraticCurveTo(x, y, x + rr, y);
          ctx2.closePath();
          ctx2.fill();
        };
        /** 网络二维码失败时画占位（请在微信小程序后台配置 downloadFile 域名：api.qrserver.com） */
        const drawPlaceholderQr = (ctx2, x, y, size) => {
          ctx2.setFillStyle('#ffffff');
          ctx2.fillRect(x, y, size, size);
          ctx2.setStrokeStyle('#cccccc');
          ctx2.setLineWidth(Math.max(1, size / 80));
          ctx2.strokeRect(x, y, size, size);
          ctx2.setFillStyle('#999999');
          ctx2.setFontSize(Math.max(12, size * 0.14));
          ctx2.setTextAlign('center');
          ctx2.setTextBaseline('middle');
          ctx2.fillText('二维码', x + size / 2, y + size / 2);
          ctx2.setTextAlign('left');
        };

        await new Promise((resolveDraw) => {
          const ctx = uni.createCanvasContext('watermarkCanvas', this);
          ctx.drawImage(imagePath, 0, 0, width, height);

          // 与页面水印层一致：按设计稿 750rpx 宽度换算到当前照片像素
          const rpx = width / 750;

          const texts = [
            `施工内容：${this.formData.content || this.deviceCode}`,
            `备注：${this.formData.remark || '无'}`,
            `拍摄时间：${this.currentTime}`,
            `地点：${this.displayText(this.deviceAddr)}`,
            `经度：${lngStr}°E`,
            `纬度：${latStr}°N`,
            `方位角：西${this.bearing}°`
          ];

          const padX = 24 * rpx;
          const padY = 20 * rpx;
          const edge = 20 * rpx;
          const tagFont = 28 * rpx;
          const lineFont = 22 * rpx;
          const lineSpacing = lineFont * 1.8;
          const tagGap = 12 * rpx;
          const dotR = 8 * rpx;
          const tagTitle = this.formData.maintainType || '设备维护';

          const tagRowH = tagFont;
          const boxW = Math.min(width * 0.7, 520 * rpx);
          const boxH = padY + tagRowH + tagGap + texts.length * lineSpacing + padY;
          const boxLeft = edge;
          const boxTop = height - edge - boxH;
          const radius = 12 * rpx;

          // ---- 左下角：与 .wm-bottom-left 一致（半透明黑底 + 黄点标题 + 白字）----
          fillRoundRect(ctx, boxLeft, boxTop, boxW, boxH, radius, 'rgba(0,0,0,0.45)');

          const tx = boxLeft + padX;
          const ty = boxTop + padY;
          ctx.setFillStyle('#faad14');
          ctx.beginPath();
          ctx.arc(tx + dotR, ty + dotR, dotR, 0, 2 * Math.PI);
          ctx.fill();

          ctx.setFillStyle('#faad14');
          ctx.setFontSize(tagFont);
          ctx.setTextBaseline('middle');
          ctx.fillText(tagTitle, tx + dotR * 2 + 12 * rpx, ty + dotR);

          ctx.setFillStyle('#ffffff');
          ctx.setFontSize(lineFont);
          ctx.setTextBaseline('top');
          let lineY = ty + tagRowH + tagGap;
          texts.forEach((line) => {
            ctx.fillText(line, tx, lineY);
            lineY += lineSpacing;
          });

          // ---- 右上角：与 .wm-top-right 一致（二维码+下方消火栓编号、地图、底部验真/导航）----
          const qrSize = 120 * rpx;
          const mapW = 200 * rpx;
          const mapH = 160 * rpx;
          const gapQrMap = 12 * rpx;
          const gapMapHint = 8 * rpx;
          const qrIdGap = 10 * rpx;
          const qrIdLineH = 26 * rpx;
          const qrIdFont = 20 * rpx;
          const qrCardPad = 4 * rpx;
          const hydrantIdText = (this.deviceCode || '').trim() || '--';

          const mapLeft = width - edge - mapW;
          const qrLeft = mapLeft + (mapW - qrSize) / 2;
          const qrTop = edge;
          const qrCardTop = qrTop - qrCardPad;
          const qrCardH = 2 * qrCardPad + qrSize + qrIdGap + qrIdLineH;
          const mapTop = qrCardTop + qrCardH + gapQrMap;

          ctx.setFillStyle('#ffffff');
          fillRoundRect(ctx, qrLeft - qrCardPad, qrCardTop, qrSize + 2 * qrCardPad, qrCardH, 8 * rpx, '#ffffff');
          if (localQrcode) {
            ctx.drawImage(localQrcode, qrLeft, qrTop, qrSize, qrSize);
          } else {
            drawPlaceholderQr(ctx, qrLeft, qrTop, qrSize);
          }
          ctx.setFillStyle('#1a1a1a');
          ctx.setFontSize(qrIdFont);
          ctx.setTextAlign('center');
          ctx.setTextBaseline('middle');
          ctx.fillText(hydrantIdText, qrLeft + qrSize / 2, qrTop + qrSize + qrIdGap + qrIdLineH / 2);
          ctx.setTextAlign('left');

          const brandH = 28 * rpx;
          const mapTileH = mapH - brandH;

          ctx.setFillStyle('#e8edf3');
          fillRoundRect(ctx, mapLeft, mapTop, mapW, mapH, 8 * rpx, '#e8edf3');
          ctx.setStrokeStyle('rgba(255,255,255,0.5)');
          ctx.setLineWidth(Math.max(1, 2 * rpx));
          ctx.strokeRect(mapLeft, mapTop, mapW, mapH);

          const pinX = mapLeft + mapW / 2;
          const pinY = mapTop + mapTileH / 2;
          ctx.setFillStyle('#e64340');
          ctx.beginPath();
          ctx.arc(pinX, pinY, 10 * rpx, 0, 2 * Math.PI);
          ctx.fill();
          ctx.setFillStyle('#ffffff');
          ctx.beginPath();
          ctx.arc(pinX, pinY, 4 * rpx, 0, 2 * Math.PI);
          ctx.fill();

          ctx.setFillStyle('rgba(255,255,255,0.92)');
          ctx.fillRect(mapLeft, mapTop + mapH - brandH, mapW, brandH);
          ctx.setFillStyle('#576b95');
          ctx.setFontSize(18 * rpx);
          ctx.setTextAlign('center');
          ctx.setTextBaseline('middle');
          ctx.fillText('腾讯地图', mapLeft + mapW / 2, mapTop + mapH - brandH / 2);

          ctx.setFillStyle('rgba(255,255,255,0.85)');
          ctx.setFontSize(20 * rpx);
          ctx.setTextAlign('center');
          ctx.setTextBaseline('top');
          ctx.setShadow(0, 1 * rpx, 3 * rpx, 'rgba(0,0,0,0.45)');
          ctx.fillText('验真/导航', mapLeft + mapW / 2, mapTop + mapH + gapMapHint);
          ctx.setShadow(0, 0, 0, 'transparent');
          ctx.setTextAlign('left');

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
                  this.photoMetaList.push({ lat: snapLat, lng: snapLng, time: this.currentTime });
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
        this.photoMetaList.push({ lat: snapLat, lng: snapLng, time: this.currentTime });
        this.showCamera = false;
      }
    },
    removePhoto(index) {
      this.photoList.splice(index, 1);
      this.photoMetaList.splice(index, 1);
    },
    /** 点击缩略图：自定义预览，便于长按右上角二维码区域跳转验真（系统 previewImage 无法拦截长按） */
    previewImage(index) {
      if (!this.photoList.length) return;
      this.previewIndex = index;
      this.showPhotoPreview = true;
    },
    closePhotoPreview() {
      this.showPhotoPreview = false;
    },
    /** 大图预览里长按二维码区域 */
    onViewerQrLongPress() {
      const i = this.previewIndex;
      const meta = this.photoMetaList[i];
      const photo = this.photoList[i] || '';
      const t = meta && meta.time ? meta.time : this.currentTime;
      if (meta && Number.isFinite(meta.lat) && Number.isFinite(meta.lng)) {
        this.goToVerifyPage(meta.lat, meta.lng, photo, t);
      } else {
        this.goToVerifyPage(null, null, photo, t);
      }
      this.closePhotoPreview();
    },
    goToVerifyPage(lat, lng, photoSrc, timeOverride) {
      const la = Number.isFinite(Number(lat)) ? Number(lat) : this.watermarkLat;
      const ln = Number.isFinite(Number(lng)) ? Number(lng) : this.watermarkLng;
      const timeStr = timeOverride || this.currentTime;
      if (photoSrc) {
        try {
          uni.setStorageSync('qr_verify_photo', photoSrc);
        } catch (e) {
          void e;
        }
      }
      const params = [
        `lat=${la}`,
        `lng=${ln}`,
        `addr=${encodeURIComponent(this.deviceAddr)}`,
        `time=${encodeURIComponent(timeStr)}`,
        `code=${encodeURIComponent(this.formData.content || this.deviceCode)}`,
        `name=${encodeURIComponent(this.deviceName)}`,
        `type=${encodeURIComponent(this.formData.maintainType || '设备维护')}`,
        `bearing=${this.bearing}`,
        `remark=${encodeURIComponent(this.formData.remark || '')}`,
        photoSrc ? 'photoCached=1' : 'photoCached=0'
      ].join('&');
      uni.navigateTo({ url: `/subpkg/qrVerify/index?${params}` });
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
        const submitDeviceCode = this.deviceCode || this.formData.content || '--';
        uni.showModal({
          title: '提交成功',
          content: `设备 ${submitDeviceCode} 维保记录已上传`,
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
  align-items: flex-start;
}

.label {
  color: #888;
  width: 170rpx;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  word-break: break-all;
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

/* 全屏大图预览（与系统相册类似：黑底 + 图片居中铺满可视区） */
.photo-viewer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: #000;
}

.photo-viewer-stage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.photo-viewer-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: calc(16rpx + env(safe-area-inset-top)) 32rpx 80rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
}

.photo-viewer-done {
  pointer-events: auto;
  color: #fff;
  font-size: 34rpx;
  padding: 12rpx 8rpx;
}

.photo-viewer-center {
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.photo-viewer-img-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.photo-viewer-img {
  width: 100%;
  height: 100%;
  display: block;
}

.photo-viewer-qr-zone {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 200rpx;
  height: 200rpx;
  z-index: 10;
}
</style>
