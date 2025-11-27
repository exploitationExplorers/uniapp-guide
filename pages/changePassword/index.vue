<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<!--<view class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-left" @click="goBack">
					<text class="back-icon">‹</text>
				</view>
				<view class="navbar-title">修改密码</view>
				<view class="navbar-right">
					<text class="more-icon">⋯</text>
				</view>
			</view>
		</view>-->

		<!-- 内容区域 -->
		<view class="content">
			<!-- 手机号 -->
			<view class="form-item">
				<text class="form-label">手机号</text>
				<text 
					class="form-value" 
					v-if="!allowPhoneInput"
				>{{ phoneNumber }}</text>
				<input 
					v-else
					class="form-input" 
					v-model="phoneNumber" 
					placeholder="请输入手机号"
					type="number"
					maxlength="11"
				/>
			</view>

			<!-- 验证码 -->
			<view class="form-item">
				<text class="form-label">验证码</text>
				<view class="form-input-wrapper">
					<input 
						class="form-input" 
						v-model="verificationCode" 
						placeholder="请输入验证码"
						type="number"
						maxlength="6"
					/>
					<view class="get-code-btn" @click="getVerificationCode" :class="{ 'disabled': countdown > 0 }">
						<text class="code-btn-text">{{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}</text>
					</view>
				</view>
			</view>

			<!-- 旧密码 -->
			<view class="form-item">
				<text class="form-label">旧密码</text>
				<input 
					class="form-input" 
					v-model="oldPassword" 
					placeholder="请输入旧密码"
					password
				/>
			</view>

			<!-- 新密码 -->
			<view class="form-item">
				<text class="form-label">新密码</text>
				<input 
					class="form-input" 
					v-model="newPassword" 
					placeholder="请输入新密码"
					password
				/>
			</view>

			<!-- 确认密码 -->
			<view class="form-item">
				<text class="form-label">确认密码</text>
				<input 
					class="form-input" 
					v-model="confirmPassword" 
					placeholder="请确认密码"
					password
				/>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-btn" @click="submit">
				<text class="submit-text">提交</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phoneNumber: '', // 从用户信息获取
				allowPhoneInput: false,
				verificationCode: '',
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
				countdown: 0,
				timer: null
			}
		},
		onLoad(options) {
			// 可以从上一页传递手机号
			if (options.phone) {
				this.phoneNumber = options.phone || ''
			}

			// 如果仍然没有获取到手机号，允许手动输入
			if (!this.phoneNumber) {
				this.allowPhoneInput = true
			}
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.timer) {
				clearInterval(this.timer)
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			getVerificationCode() {
				if (this.countdown > 0) {
					return
				}

				if (!this.phoneNumber) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					})
					this.allowPhoneInput = true
					return
				}
				
				// 调用获取验证码API
				// uni.request({
				// 	url: 'your-api-url/get-verification-code',
				// 	method: 'POST',
				// 	data: {
				// 		phone: this.phoneNumber
				// 	},
				// 	success: (res) => {
				// 		if (res.data.code === 200) {
				// 			uni.showToast({
				// 				title: '验证码已发送',
				// 				icon: 'success'
				// 			})
				// 			this.startCountdown()
				// 		} else {
				// 			uni.showToast({
				// 				title: res.data.message || '获取验证码失败',
				// 				icon: 'none'
				// 			})
				// 		}
				// 	},
				// 	fail: () => {
				// 		uni.showToast({
				// 			title: '网络错误',
				// 			icon: 'none'
				// 		})
				// 	}
				// })
				
				// 模拟获取验证码
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				})
				this.startCountdown()
			},
			startCountdown() {
				this.countdown = 60
				this.timer = setInterval(() => {
					this.countdown--
					if (this.countdown <= 0) {
						clearInterval(this.timer)
						this.timer = null
					}
				}, 1000)
			},
			submit() {
				// 表单验证
				if (!this.phoneNumber) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					})
					this.allowPhoneInput = true
					return
				}

				if (!this.verificationCode) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					})
					return
				}
				
				if (!this.oldPassword) {
					uni.showToast({
						title: '请输入旧密码',
						icon: 'none'
					})
					return
				}
				
				if (!this.newPassword) {
					uni.showToast({
						title: '请输入新密码',
						icon: 'none'
					})
					return
				}
				
				if (this.newPassword.length < 6) {
					uni.showToast({
						title: '密码长度不能少于6位',
						icon: 'none'
					})
					return
				}
				
				if (this.newPassword !== this.confirmPassword) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					})
					return
				}
				
				if (this.oldPassword === this.newPassword) {
					uni.showToast({
						title: '新密码不能与旧密码相同',
						icon: 'none'
					})
					return
				}
				
				// 调用修改密码API
				// uni.request({
				// 	url: 'your-api-url/change-password',
				// 	method: 'POST',
				// 	data: {
				// 		phone: this.phoneNumber,
				// 		verificationCode: this.verificationCode,
				// 		oldPassword: this.oldPassword,
				// 		newPassword: this.newPassword
				// 	},
				// 	success: (res) => {
				// 		if (res.data.code === 200) {
				// 			uni.showToast({
				// 				title: '密码修改成功',
				// 				icon: 'success'
				// 			})
				// 			setTimeout(() => {
				// 				uni.navigateBack()
				// 			}, 1500)
				// 		} else {
				// 			uni.showToast({
				// 				title: res.data.message || '修改失败',
				// 				icon: 'none'
				// 			})
				// 		}
				// 	},
				// 	fail: () => {
				// 		uni.showToast({
				// 			title: '网络错误',
				// 			icon: 'none'
				// 		})
				// 	}
				// })
				
				// 模拟提交
				uni.showToast({
					title: '密码修改成功',
					icon: 'success'
				})
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 999;
		background-color: #1296DB;
		padding-top: var(--status-bar-height, 44rpx);
	}

	.navbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 30rpx;
	}

	.navbar-left {
		width: 60rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.back-icon {
		font-size: 60rpx;
		color: #fff;
		line-height: 1;
		font-weight: 300;
	}

	.navbar-title {
		flex: 1;
		text-align: center;
		font-size: 36rpx;
		font-weight: 500;
		color: #fff;
	}

	.navbar-right {
		width: 60rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.more-icon {
		font-size: 40rpx;
		color: #fff;
		line-height: 1;
	}

	/* 内容区域 */
	.content {
		
		background-color: #fff;
		padding: 0 40rpx;
	}

	.form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 36rpx 0;
		border-bottom: 1rpx solid #eee;
		min-height: 100rpx;
		box-sizing: border-box;
	}

	.form-label {
		font-size: 32rpx;
		color: #333;
		flex-shrink: 0;
		width: 160rpx;
	}

	.form-value {
		font-size: 32rpx;
		color: #666;
		flex: 1;
		text-align: right;
	}

	.form-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 20rpx;
	}

	.form-input {
		flex: 1;
		font-size: 32rpx;
		color: #333;
		text-align: right;
		min-width: 0;
	}

	.get-code-btn {
		background-color: #FF9500;
		padding: 12rpx 24rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
	}

	.get-code-btn.disabled {
		background-color: #ccc;
	}

	.code-btn-text {
		font-size: 28rpx;
		color: #fff;
	}

	/* 提交按钮 */
	.submit-btn {
		margin: 60rpx 0 40rpx;
		background-color: #FF9500;
		border-radius: 8rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-text {
		font-size: 36rpx;
		color: #fff;
		font-weight: 500;
	}
</style>

