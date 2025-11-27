<template>
	<view class="container">
		<camera
			:device-position="devicePosition"
			flash="auto"
			@error="onCameraError"
			style="width: 100%; height: 70vh;"
		></camera>
		<button
			class="capture-btn"
			:disabled="isCapturing"
			@click="takePhoto"
		>
			{{ isCapturing ? '处理中...' : '拍照' }}
		</button>
		<canvas
			canvas-id="watermarkCanvas"
			:style="{
				width: canvasWidth + 'px',
				height: canvasHeight + 'px',
				position: 'fixed',
				top: '-10000px',
				left: '-10000px'
			}"
		></canvas>
	</view>
</template>

<script>
export default {
	data() {
		return {
			devicePosition: 'back',
			location: null,
			canvasWidth: 300,
			canvasHeight: 400,
			isCapturing: false,
			deviceName: '',
			cameraParams: ''
		};
	},

	async onReady() {
		// 初始化设备信息（非必须，但提升体验）
		try {
			const sysInfo = uni.getSystemInfoSync();
			this.deviceName = sysInfo.model || '未知设备';
			// 相机参数无法精确获取，可保留固定值或省略
			this.cameraParams = '主摄 f/1.6'; // 或根据需求动态判断
		} catch (e) {
			this.deviceName = '未知设备';
			this.cameraParams = '未知参数';
		}
	},

	async onLoad() {
		await this.getLocation();
	},

	methods: {
		onCameraError(err) {
			console.error('相机错误:', err);
			uni.showToast({ title: '相机启动失败', icon: 'none' });
		},

		async getLocation() {
			try {
				const res = await uni.getLocation({ type: 'gcj02' });
				this.location = {
					latitude: parseFloat(res.latitude.toFixed(6)),
					longitude: parseFloat(res.longitude.toFixed(6))
				};
			} catch (err) {
				console.warn('位置获取失败:', err);
				// 不阻断流程，允许无位置水印
			}
		},

		// 权限检查（带缓存，避免频繁请求）
		async checkAlbumAuth() {
			return new Promise((resolve, reject) => {
				uni.getSetting({
					success: (res) => {
						if (res.authSetting['scope.writePhotosAlbum']) {
							resolve();
						} else {
							uni.authorize({
								scope: 'scope.writePhotosAlbum',
								success: resolve,
								fail: () => {
									this.showAuthGuide();
									reject(new Error('auth denied'));
								}
							});
						}
					},
					fail: reject
				});
			});
		},

		showAuthGuide() {
			uni.showModal({
				title: '需要相册权限',
				content: '保存照片需要相册写入权限，请前往设置开启',
				confirmText: '去设置',
				success: (res) => {
					if (res.confirm) {
						uni.openSetting({
							success: (settingRes) => {
								if (settingRes.authSetting?.['scope.writePhotosAlbum']) {
									uni.showToast({ title: '授权成功', icon: 'success' });
								}
							}
						});
					}
				}
			});
		},

		async takePhoto() {
			if (this.isCapturing) return;
			this.isCapturing = true;

			try {
				await this.checkAlbumAuth();

				const ctx = uni.createCameraContext(this);
				ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						this.addWatermark(res.tempImagePath);
					},
					fail: (err) => {
						console.error('拍照失败:', err);
						uni.showToast({ title: '拍照失败', icon: 'none' });
						this.isCapturing = false;
					}
				});
			} catch (err) {
				this.isCapturing = false;
			}
		},

		toDMS(coord, isLat) {
			const abs = Math.abs(coord);
			const deg = Math.floor(abs);
			const min = Math.floor((abs - deg) * 60);
			const sec = ((abs - deg - min / 60) * 3600).toFixed(2);
			const dir = isLat
				? coord >= 0 ? 'N' : 'S'
				: coord >= 0 ? 'E' : 'W';
			return `${deg}°${min}'${sec}"${dir}`;
		},

		async addWatermark(imagePath) {
			try {
				uni.showLoading({ title: '添加水印...', mask: true });

				const now = new Date();
				const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

				let coordText = '位置未获取';
				if (this.location) {
					const latDMS = this.toDMS(this.location.latitude, true);
					const lngDMS = this.toDMS(this.location.longitude, false);
					coordText = `${latDMS} ${lngDMS}`;
				}

				// 获取图片尺寸
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

				// 确保 Canvas 尺寸更新后再绘制（微延迟）
				await new Promise((r) => setTimeout(r, 50));

				const ctx = uni.createCanvasContext('watermarkCanvas', this);

				// 绘制原图
				ctx.drawImage(imagePath, 0, 0, width, height);

				// 水印区域
				const topMargin = 15;
				const leftMargin = 50;
				const rightMargin = width - 50;
				const startY = height + topMargin;
				const fontSize = 22;
				const lineHeight = 32;
				const firstLineY = startY + 12;
				const secondLineY = firstLineY + lineHeight;

				// 背景
				ctx.setFillStyle('rgba(255, 255, 255, 0.95)');
				ctx.fillRect(0, startY, width, watermarkHeight);

				// 文字样式
				ctx.setFontSize(fontSize);
				ctx.setFillStyle('#333333');
				ctx.setTextBaseline('top');

				// 左侧
				ctx.setTextAlign('left');
				ctx.fillText(this.deviceName, leftMargin, firstLineY);
				ctx.fillText(timeStr, leftMargin, secondLineY);

				// 右侧
				ctx.setTextAlign('right');
				ctx.fillText(this.cameraParams, rightMargin, firstLineY);
				ctx.fillText(coordText, rightMargin, secondLineY);

				// Logo（可选，确保路径存在）
				const logoUrl = '/static/about.png';
				uni.getImageInfo({
					src: logoUrl,
					success: () => {
						const logoSize = 40;
						const logoX = width / 2 - logoSize / 2;
						const logoY = startY + 15;
						ctx.drawImage(logoUrl, logoX, logoY, logoSize, logoSize);
						this.finalDraw(ctx, width, height + watermarkHeight);
					},
					fail: () => {
						// Logo 加载失败，直接绘制
						this.finalDraw(ctx, width, height + watermarkHeight);
					}
				});
			} catch (err) {
				uni.hideLoading();
				this.isCapturing = false;
				if (err.errMsg?.includes('auth deny')) {
					this.showAuthGuide();
				} else {
					uni.showToast({ title: '水印处理失败', icon: 'none' });
					console.error('水印错误:', err);
				}
			}
		},

		finalDraw(ctx, w, h) {
			ctx.draw(false, async () => {
				try {
					const canvasRes = await new Promise((resolve, reject) => {
						uni.canvasToTempFilePath({
							canvasId: 'watermarkCanvas',
							width: w,
							height: h,
							destWidth: w,
							destHeight: h,
							fileType: 'jpg',
							quality: 1,
							success: resolve,
							fail: reject,
							// ⚠️ 关键：指定组件实例作用域
							componentInstance: this
						});
					});

					await uni.saveImageToPhotosAlbum({
						filePath: canvasRes.tempFilePath
					});

					uni.showToast({ title: '已保存至相册', icon: 'success' });
				} catch (err) {
					if (err.errMsg?.includes('auth deny')) {
						this.showAuthGuide();
					} else {
						uni.showToast({ title: '保存失败', icon: 'none' });
					}
				} finally {
					uni.hideLoading();
					this.isCapturing = false;
				}
			});
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
	background: #000;
}

.capture-btn {
	margin-top: 20rpx;
	width: 200rpx;
	height: 80rpx;
	line-height: 80rpx;
	background: #007aff;
	color: white;
	border-radius: 8rpx;
	font-size: 28rpx;
}
</style>