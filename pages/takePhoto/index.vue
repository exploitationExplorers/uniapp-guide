<template>
	<view class="container">
		<camera :device-position="devicePosition" flash="auto" @error="onCameraError"
			style="width: 100%; height: 70vh;"></camera>
		<button class="capture-btn" @click="takePhoto">拍照</button>
		<!-- <image v-if="tempImagePath" :src="tempImagePath" style="width: 100%; height: 30vh; margin-top: 20rpx;"></image> -->
		<canvas canvas-id="watermarkCanvas" :style="{ 
			width: canvasWidth + 'px', 
			height: canvasHeight + 'px', 
			position: 'fixed', 
			top: '-10000px',
			left: '-10000px'
		}"></canvas>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				devicePosition: 'back',
				tempImagePath: '',
				location: null,
				canvasWidth: 300,
				canvasHeight: 400,
				deviceName: 'Xiaomi 14',
				cameraParams: '23mm f/1.6 ISO100',
				debugInfo: ''
			};
		},
		async onLoad() {
			try {
				const res = await uni.getLocation({
					type: 'gcj02'
				});
				this.location = {
					latitude: parseFloat(res.latitude.toFixed(6)),
					longitude: parseFloat(res.longitude.toFixed(6))
				};
				this.debugInfo += '位置获取成功\n';
			} catch (err) {
				this.debugInfo += '位置获取失败:' + err.errMsg + '\n';
			}
		},
		methods: {
			takePhoto() {
				const ctx = uni.createCameraContext(this);
				ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						this.tempImagePath = res.tempImagePath;
						this.addWatermark(res.tempImagePath);
					},
					fail: (err) => {
						console.error('拍照失败:', err);
					}
				});
			},

			toDMS(coord, isLatitude = true) {
				if (typeof coord !== 'number') return '未知';
				const abs = Math.abs(coord);
				const d = Math.floor(abs);
				const m = Math.floor((abs - d) * 60);
				const s = Math.round(((abs - d) * 60 - m) * 60);

				if (isLatitude) {
					const dir = coord >= 0 ? 'N' : 'S';
					return `${d}°${m}'${s}"${dir}`;
				} else {
					const dir = coord >= 0 ? 'E' : 'W';
					return `${d}°${m}'${s}"${dir}`;
				}
			},
			async addWatermark(imagePath) {
			  try {
			    const now = new Date();
			    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

			    let coordText = '位置未获取';
			    if (this.location) {
			      const latDMS = this.toDMS(this.location.latitude, true);
			      const lngDMS = this.toDMS(this.location.longitude, false);
			      coordText = `${latDMS} ${lngDMS}`;
			    }
			
			    const imgInfo = await new Promise((resolve, reject) => {
			      uni.getImageInfo({
			        src: imagePath,
			        success: resolve,
			        fail: reject
			      });
			    });
			    
			    const { width, height } = imgInfo;
			    const watermarkHeight = 80;
			    this.canvasWidth = width;
			    this.canvasHeight = height + watermarkHeight;
			    
			    await new Promise(resolve => setTimeout(resolve, 100));
			    
			    const ctx = uni.createCanvasContext('watermarkCanvas', this);
			    
			    ctx.drawImage(imagePath, 0, 0, width, height);
			    
			    // 定义参数
			    const topMargin = 15;
			    const leftMargin = 50;
			    const rightMargin = width - 50;
			    const watermarkStartY = height + topMargin;
			    const fontSize = 22; 
			    const lineHeight = 32; 
			    const firstLineY = watermarkStartY + 12; 
			    const secondLineY = firstLineY + lineHeight; 
			    // 绘制水印背景
			    ctx.setFillStyle('rgba(255, 255, 255, 0.95)');
			    ctx.fillRect(0, watermarkStartY, width, watermarkHeight);
			    // 设置文字样式
			    ctx.setFillStyle('#333333');
			    ctx.setFontSize(fontSize);
			    ctx.setTextBaseline('top');
			    // 左侧信息
			    ctx.setTextAlign('left');
			    ctx.fillText(this.deviceName, leftMargin, firstLineY);
			    ctx.fillText(timeStr, leftMargin, secondLineY);
			    // 中间Logo
			    ctx.setTextAlign('center');
			    const logoUrl = '/static/about.png';
			    const logoSize = 40; 
			    const logoX = width / 2 - logoSize / 2;
			    const logoY = watermarkStartY + 15; 
			    ctx.drawImage(logoUrl, logoX, logoY, logoSize, logoSize);
			    // 右侧信息
			    ctx.setTextAlign('right');
			    ctx.setFontSize(fontSize);
			    ctx.fillText(this.cameraParams, rightMargin, firstLineY);
			    ctx.fillText(coordText, rightMargin, secondLineY);
			    
			    // 绘制到Canvas
			    await new Promise((resolve) => {
			      ctx.draw(true, () => {
			        resolve();
			      });
			    });
			    
			    await new Promise(resolve => setTimeout(resolve, 300));
			    
			    // 导出图片
			    const canvasRes = await new Promise((resolve, reject) => {
			      uni.canvasToTempFilePath({
			        canvasId: 'watermarkCanvas',
			        width: this.canvasWidth,
			        height: this.canvasHeight,
			        destWidth: this.canvasWidth,
			        destHeight: this.canvasHeight,
			        fileType: 'jpg',
			        quality: 1,
			        success: (res) => {
			          resolve(res);
			        },
			        fail: (err) => {
			          reject(err);
			        }
			      }, this);
			    });
			    
			    this.tempImagePath = canvasRes.tempFilePath;
			    
			    await uni.saveImageToPhotosAlbum({
			      filePath: canvasRes.tempFilePath
			    });
			    
			    uni.showToast({
			      title: '已保存至相册',
			      icon: 'success'
			    });
			    
			  } catch (err) {
			    if (err.errMsg && err.errMsg.includes('auth deny')) {
			      uni.showToast({
			        title: '请授权相册权限',
			        icon: 'none'
			      });
			    } else {
			      uni.showToast({
			        title: '处理失败，请重试',
			        icon: 'none'
			      });
			    }
			  }
			},

			onCameraError(e) {
				console.error('相机错误:', e.detail);
			}
		}
	};
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
	}

	.capture-btn {
		margin-top: 20rpx;
		width: 200rpx;
		background: #007aff;
		color: white;
		border-radius: 8rpx;
	}
</style>