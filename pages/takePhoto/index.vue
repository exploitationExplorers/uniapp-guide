<template>
	<view class="container">
		<camera :device-position="devicePosition" flash="auto" binderror="onCameraError"
			style="width: 100%; height: 70vh;"></camera>

		<button class="capture-btn" @click="takePhoto">拍照</button>

		<image v-if="tempImagePath" :src="tempImagePath" style="width: 100%; height: 30vh; margin-top: 20rpx;"></image>

		<canvas canvas-id="watermarkCanvas"
			:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', position: 'absolute', left: '-9999px' }"></canvas>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				devicePosition: 'back',
				tempImagePath: '',
				location: null,
				canvasWidth: 0,
				canvasHeight: 0,
			};
		},
		async onLoad() {
			try {
				const res = await uni.getLocation({
					type: 'gcj02'
				});
				this.location = {
					latitude: res.latitude.toFixed(6),
					longitude: res.longitude.toFixed(6)
				};
			} catch (err) {
				uni.showToast({
					title: '请开启位置权限',
					icon: 'none'
				});
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
			addWatermark(imagePath) {
				const {
					location
				} = this;
				const now = new Date();
				const timeStr =
					`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
				const locationStr = location ?
					`纬度: ${location.latitude}, 经度: ${location.longitude}` :
					'位置未获取';
				success: (imgInfo) => {
					const {
						width,
						height
					} = imgInfo;
					if (!width || !height) {
						console.error('图片尺寸无效');
						return;
					}

					this.canvasWidth = width;
					this.canvasHeight = height;

					const ctx = uni.createCanvasContext('watermarkCanvas', this); // ✅ 加 this

					ctx.drawImage(imagePath, 0, 0, width, height);
					ctx.setFillStyle('rgba(255, 255, 255, 0.8)');
					ctx.setFontSize(24);
					ctx.setTextAlign('left');

					ctx.fillText(`拍摄时间: ${timeStr}`, 20, height - 80);
					ctx.fillText(`位置: ${locationStr}`, 20, height - 40);

					setTimeout(() => {
						ctx.draw(false, () => {
							uni.canvasToTempFilePath({
								canvasId: 'watermarkCanvas',
								width: width,
								height: height,
								success: (res) => {
									const watermarkedPath = res.tempFilePath;
									if (!watermarkedPath) {
										console.error('导出图片路径为空！');
										return;
									}
									uni.saveImageToPhotosAlbum({
										filePath: watermarkedPath,
										success: () => {
											uni.showToast({
												title: '照片已保存',
												icon: 'success'
											});
										},
										fail: (err) => {
											if (err.errMsg.includes(
													'auth deny')) {
												uni.showToast({
													title: '请授权相册权限',
													icon: 'none'
												});
											}
										}
									});
								},
								fail: (err) => {
									console.error('canvas 导出失败:', err);
								}
							}, this);
						});
					}, 100);
				}
			},

			onCameraError(e) {
				console.error('相机错误:', e.detail);
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
	}

	.capture-btn {
		margin-top: 20rpx;
		width: 200rpx;
		background: #007aff;
		color: white;
		border-radius: 8rpx;
	}
</style>