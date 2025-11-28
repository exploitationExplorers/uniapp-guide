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

				const ctx = uni.createCameraContext(this);
				ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						this.addWatermark(res.tempImagePath);
					},
					fail: (err) => {
						console.error('拍照失败:', err);
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
</style>