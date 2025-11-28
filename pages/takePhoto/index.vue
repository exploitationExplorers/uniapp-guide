<template>
	<view class="container">
		<camera :device-position="devicePosition" flash="auto" @error="onCameraError"
			style="width: 100%; height: 80vh;"></camera>
		<button class="capture-btn" :disabled="isCapturing" @click="takePhoto">
			{{ isCapturing ? '处理中...' : '拍照' }}
		</button>
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
				location: null,
				canvasWidth: 300,
				canvasHeight: 400,
				isCapturing: false,
				deviceName: '',
				cameraParams: '',
				hasCameraAuth: true, // 新增：摄像头权限状态
			};
		},

		onShow() {
			// 页面显示时检查权限状态
			this.checkCameraAuthStatus();
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
			try {
				// 预请求相册权限
				await this.checkPhotoAlbumAuth();

				const res = await uni.getLocation({
					type: 'gcj02'
				});
				this.location = {
					latitude: parseFloat(res.latitude.toFixed(6)),
					longitude: parseFloat(res.longitude.toFixed(6))
				};
			} catch (err) {
				console.log('位置获取失败:', err.errMsg);
			}
		},

		methods: {
			// 检查摄像头权限状态
			async checkCameraAuthStatus() {
				try {
					// 尝试创建摄像头上下文，如果失败说明权限有问题
					const ctx = uni.createCameraContext(this);
					// 这里可以添加其他检查逻辑
					this.hasCameraAuth = true;
				} catch (e) {
					this.hasCameraAuth = false;
					await this.requestCameraAuth();
				}
			},

			// 请求摄像头权限
			async requestCameraAuth() {
				return new Promise((resolve, reject) => {
					uni.authorize({
						scope: 'scope.camera',
						success: () => {
							this.hasCameraAuth = true;
							// 重新初始化摄像头
							this.reinitCamera();
							resolve();
						},
						fail: (err) => {
							this.hasCameraAuth = false;
							if (err.errMsg.includes('auth deny')) {
								this.showCameraAuthGuide();
							}
							reject(err);
						}
					});
				});
			},

			// 显示摄像头权限引导
			showCameraAuthGuide() {
				uni.showModal({
					title: '需要摄像头权限',
					content: '拍照需要摄像头权限，请前往设置开启',
					confirmText: '去设置',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting({
								success: (settingRes) => {
									if (settingRes.authSetting['scope.camera']) {
										this.hasCameraAuth = true;
										this.reinitCamera();
										uni.showToast({
											title: '授权成功',
											icon: 'success'
										});
									}
								}
							});
						}
					}
				});
			},

			// 重新初始化摄像头
			reinitCamera() {
				// 通过改变key来强制重新渲染camera组件
				this.devicePosition = 'back';
				// 可以添加其他重新初始化的逻辑
			},

			async takePhoto() {
				// 先检查摄像头权限
				if (!this.hasCameraAuth) {
					await this.requestCameraAuth();
					return;
				}

				// 再检查相册权限
				try {
					await this.checkPhotoAlbumAuth();
				} catch (authError) {
					console.log('相册权限检查失败，停止拍照流程');
					return;
				}

				this.isCapturing = true;
				const ctx = uni.createCameraContext(this);
				ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						this.addWatermark(res.tempImagePath);
					},
					fail: (err) => {
						console.error('拍照失败:', err);
						this.isCapturing = false;
						// 如果是权限问题，更新状态
						if (err.errMsg.includes('permission') || err.errMsg.includes('auth')) {
							this.hasCameraAuth = false;
							this.showCameraAuthGuide();
						} else {
							uni.showToast({
								title: '拍照失败',
								icon: 'none'
							});
						}
					}
				});
			},

			// 修改原有的checkPhotoAlbumAuth方法
			async checkPhotoAlbumAuth() {
				return new Promise((resolve, reject) => {
					uni.authorize({
						scope: 'scope.writePhotosAlbum',
						success: resolve,
						fail: (err) => {
							if (err.errMsg.includes('auth deny')) {
								this.showPhotoAlbumAuthGuide(); // 重命名方法避免冲突
								reject(err);
							} else {
								reject(err);
							}
						}
					});
				});
			},

			// 重命名相册权限引导方法
			showPhotoAlbumAuthGuide() {
				uni.showModal({
					title: '需要相册权限',
					content: '保存照片需要相册写入权限，请前往设置开启',
					confirmText: '去设置',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting();
						}
					}
				});
			},

			// 相机错误处理
			onCameraError(error) {
				console.error('摄像头错误:', error);
				if (error.detail.includes('permission') || error.detail.includes('auth')) {
					this.hasCameraAuth = false;
					this.showCameraAuthGuide();
				}
			},

			// ========== 水印相关方法 ==========
			async addWatermark(imagePath) {
				try {
					uni.showLoading({
						title: '处理中...',
						mask: true
					});

					const now = new Date();
					const timeStr =
						`${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

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

					const {
						width,
						height
					} = imgInfo;
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
							success: resolve,
							fail: reject
						}, this);
					});

					// 保存到相册
					await uni.saveImageToPhotosAlbum({
						filePath: canvasRes.tempFilePath
					});

					uni.hideLoading();
					this.isCapturing = false;
					uni.showToast({
						title: '已保存至相册',
						icon: 'success',
						duration: 2000
					});

				} catch (err) {
					uni.hideLoading();
					this.isCapturing = false;
					if (err.errMsg && err.errMsg.includes('auth deny')) {
						this.showPhotoAlbumAuthGuide();
					} else {
						uni.showToast({
							title: '处理失败，请重试',
							icon: 'none'
						});
						console.error('水印处理错误:', err);
					}
				}
			},

			// 经纬度转换方法
			toDMS(coord, isLatitude) {
				const direction = isLatitude ?
					(coord >= 0 ? 'N' : 'S') :
					(coord >= 0 ? 'E' : 'W');
				const absCoord = Math.abs(coord);
				const degrees = Math.floor(absCoord);
				const minutes = Math.floor((absCoord - degrees) * 60);
				const seconds = ((absCoord - degrees - minutes / 60) * 3600).toFixed(1);

				return `${degrees}°${minutes}'${seconds}"${direction}`;
			}
		}
	}
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
		background: #fff;
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

	.capture-btn:disabled {
		background: #cccccc;
		color: #666666;
	}
</style>