<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<!-- <view class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-left" @click="goBack">
					<text class="back-icon">‹</text>
				</view>
				<view class="navbar-title">个人资料</view>
				<view class="navbar-right">
					<text class="more-icon">⋯</text>
				</view>
			</view>
		</view> -->

		<!-- 内容区域 -->
		<view class="content">
			<!-- 姓名 -->
			<view class="info-item" @click="editName">
				<text class="label">姓名</text>
				<view class="value-wrapper">
					<text class="value">{{ userInfo.name || '初心' }}</text>
					<text class="arrow">›</text>
				</view>
			</view>

			<!-- 电话 -->
			<view class="info-item">
				<text class="label">电话</text>
				<text class="value">{{ userInfo.phone || '15325452152' }}</text>
			</view>

			<!-- 有效期至 -->
			<view class="info-item validity-item">
				<view class="validity-content">
					<text class="label">有效期至</text>
					<view class="validity-right">
						<text class="value validity-value">{{ userInfo.validUntil || 'null' }}</text>
						<view class="renew-btn" @click="renew">
							<text class="renew-text">续费</text>
						</view>
					</view>
				</view>
				<view class="promotion-text" v-if="!userInfo.validUntil">
					回馈老用户:现在续费立即赠送2000条短信
				</view>
			</view>

			<!-- 修改密码 -->
			<view class="info-item" @click="changePassword">
				<text class="label">修改密码</text>
				<text class="arrow">›</text>
			</view>
		</view>

		<!-- 编辑姓名弹窗 -->
		<view class="modal-mask" v-if="showEditNameModal" @click="closeEditModal">
			<view class="modal-dialog" @click.stop>
				<view class="modal-content">
					<view class="modal-input-row">
						<text class="modal-label">姓名</text>
						<view class="modal-input-wrapper">
							<input 
								class="modal-input" 
								v-model="editNameValue" 
								placeholder="请输入姓名"
								:focus="showEditNameModal"
							/>
							<!-- <text class="modal-arrow">›</text> -->
						</view>
					</view>
					<view class="modal-buttons">
						<view class="modal-btn cancel-btn" @click="closeEditModal">
							<text class="cancel-text">取消</text>
						</view>
						<view class="modal-btn save-btn" @click="saveName">
							<text class="save-text">保存</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 在线支付弹窗 -->
		<view class="payment-modal-mask" v-if="showPaymentModal" @click="closePaymentModal">
			<view class="payment-modal-dialog" @click.stop>
				<view class="payment-modal-content">
					<!-- 标题 -->
					<view class="payment-title">在线支付</view>

					<!-- 付费模式 -->
					<view class="payment-section">
						<view class="section-title">付费模式</view>
						<view class="payment-mode-options">
							<view class="mode-option" @click="selectPaymentMode('year')">
								<view class="radio-wrapper">
									<view class="radio-circle" :class="{ 'radio-selected': paymentMode === 'year' }">
										<view class="radio-inner" v-if="paymentMode === 'year'"></view>
									</view>
								</view>
								<text class="mode-text">按年支付</text>
							</view>
							<view class="mode-option" @click="selectPaymentMode('month')">
								<view class="radio-wrapper">
									<view class="radio-circle" :class="{ 'radio-selected': paymentMode === 'month' }">
										<view class="radio-inner" v-if="paymentMode === 'month'"></view>
									</view>
								</view>
								<text class="mode-text">按月支付</text>
							</view>
						</view>
					</view>

					<!-- 单价和开通年份 -->
					<view class="payment-section">
						<view class="price-row">
							<text class="price-label">单价:</text>
							<text class="price-value">{{ unitPrice }}</text>
						</view>
						<view class="year-row" v-if="paymentMode === 'year'">
							<text class="year-label">开通年份:</text>
							<view class="year-control">
								<view class="year-btn" @click="decreaseYear">-</view>
								<input 
									class="year-input" 
									v-model="subscriptionYears" 
									type="number"
									:disabled="true"
								/>
								<view class="year-btn" @click="increaseYear">+</view>
							</view>
						</view>
						<view class="year-row" v-else>
							<text class="year-label">开通月数:</text>
							<view class="year-control">
								<view class="year-btn" @click="decreaseMonth">-</view>
								<input 
									class="year-input" 
									v-model="subscriptionMonths" 
									type="number"
									:disabled="true"
								/>
								<view class="year-btn" @click="increaseMonth">+</view>
							</view>
						</view>
						<view class="amount-row">
							<text class="amount-label">支付金额:</text>
							<text class="amount-value">¥ {{ totalAmount }}</text>
						</view>
					</view>

					<!-- 支付方式 -->
					<view class="payment-section">
						<view class="section-title">支付方式</view>
						<view class="payment-method-options">
							<view class="method-option" @click="selectPaymentMethod('alipay')">
								<view class="radio-wrapper">
									<view class="radio-circle" :class="{ 'radio-selected': paymentMethod === 'alipay' }">
										<view class="radio-inner" v-if="paymentMethod === 'alipay'"></view>
									</view>
								</view>
								<text class="method-text">支付宝支付</text>
							</view>
							<view class="method-option" @click="selectPaymentMethod('wechat')">
								<view class="radio-wrapper">
									<view class="radio-circle" :class="{ 'radio-selected': paymentMethod === 'wechat' }">
										<view class="radio-inner" v-if="paymentMethod === 'wechat'"></view>
									</view>
								</view>
								<text class="method-text">微信钱包支付</text>
							</view>
						</view>
					</view>

					<!-- 条款同意 -->
					<view class="payment-section terms-section">
						<view class="terms-wrapper" @click="toggleTermsAgree">
							<view class="checkbox-wrapper">
								<view class="checkbox" :class="{ 'checkbox-selected': termsAgreed }">
									<text class="checkbox-icon" v-if="termsAgreed">✓</text>
								</view>
							</view>
							<text class="terms-text">我已阅读并同意</text>
							<text class="terms-link" @click.stop="viewTerms">充值条款</text>
						</view>
					</view>

					<!-- 底部按钮 -->
					<view class="payment-buttons">
						<view class="payment-btn cancel-payment-btn" @click="closePaymentModal">
							<text class="payment-btn-text">取消</text>
						</view>
						<view class="payment-btn confirm-payment-btn" @click="confirmPayment">
							<text class="payment-btn-text confirm-text">确认支付</text>
						</view>
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
				userInfo: getApp().globalData.userInfo,
				showEditNameModal: false,
				editNameValue: '',
				// 支付弹窗相关
				showPaymentModal: false,
				paymentMode: 'year', // 'year' 或 'month'
				subscriptionYears: 1,
				subscriptionMonths: 1,
				paymentMethod: 'wechat', // 'alipay' 或 'wechat'
				termsAgreed: true
			}
		},
		computed: {
			unitPrice() {
				return this.paymentMode === 'year' ? '600元/年' : '50元/月'
			},
			totalAmount() {
				if (this.paymentMode === 'year') {
					return 600 * this.subscriptionYears
				} else {
					return 50 * this.subscriptionMonths
				}
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			editName() {
				this.editNameValue = this.userInfo.name
				this.showEditNameModal = true
			},
			closeEditModal() {
				this.showEditNameModal = false
				this.editNameValue = ''
			},
			saveName() {
				if (this.editNameValue && this.editNameValue.trim()) {
					this.userInfo.name = this.editNameValue.trim()
					// 这里可以调用API保存姓名
					// uni.request({
					// 	url: 'your-api-url',
					// 	method: 'POST',
					// 	data: { name: this.userInfo.name },
					// 	success: (res) => {
					// 		uni.showToast({
					// 			title: '保存成功',
					// 			icon: 'success'
					// 		})
					// 	}
					// })
					this.closeEditModal()
				} else {
					uni.showToast({
						title: '请输入姓名',
						icon: 'none'
					})
				}
			},
			renew() {
				this.showPaymentModal = true
			},
			closePaymentModal() {
				this.showPaymentModal = false
			},
			selectPaymentMode(mode) {
				this.paymentMode = mode
			},
			selectPaymentMethod(method) {
				this.paymentMethod = method
			},
			decreaseYear() {
				if (this.subscriptionYears > 1) {
					this.subscriptionYears--
				}
			},
			increaseYear() {
				this.subscriptionYears++
			},
			decreaseMonth() {
				if (this.subscriptionMonths > 1) {
					this.subscriptionMonths--
				}
			},
			increaseMonth() {
				this.subscriptionMonths++
			},
			toggleTermsAgree() {
				this.termsAgreed = !this.termsAgreed
			},
			viewTerms() {
				// 跳转到条款页面或显示条款内容
				uni.showToast({
					title: '查看充值条款',
					icon: 'none'
				})
			},
			confirmPayment() {
				if (!this.termsAgreed) {
					uni.showToast({
						title: '请先同意充值条款',
						icon: 'none'
					})
					return
				}
				// 这里调用支付API
				// uni.request({
				// 	url: 'your-payment-api-url',
				// 	method: 'POST',
				// 	data: {
				// 		paymentMode: this.paymentMode,
				// 		years: this.subscriptionYears,
				// 		paymentMethod: this.paymentMethod,
				// 		amount: this.totalAmount
				// 	},
				// 	success: (res) => {
				// 		// 处理支付结果
				// 	}
				// })
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				})
				this.closePaymentModal()
				// 示例：设置有效期
				// this.userInfo.validUntil = '2025-12-31'
			},
			changePassword() {
				uni.navigateTo({
					url: `/pages/changePassword/index?phone=${this.userInfo.phone}`,
					fail: () => {
						uni.showToast({
							title: '跳转失败',
							icon: 'none'
						})
					}
				})
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
		margin-top: calc(var(--status-bar-height, 44rpx) + 88rpx);
		background-color: #fff;
	}

	.info-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 36rpx 40rpx;
		border-bottom: 1rpx solid #eee;
		min-height: 100rpx;
		box-sizing: border-box;
	}

	.label {
		font-size: 32rpx;
		color: #333;
		flex-shrink: 0;
	}

	.value-wrapper {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: flex-end;
	}

	.value {
		font-size: 32rpx;
		color: #666;
		margin-right: 20rpx;
	}

	.arrow {
		font-size: 40rpx;
		color: #999;
		line-height: 1;
		font-weight: 300;
	}

	/* 有效期特殊样式 */
	.validity-item {
		flex-direction: column;
		align-items: flex-start;
		padding: 36rpx 40rpx;
	}

	.validity-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.validity-right {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.validity-value {
		margin-right: 0;
	}

	.renew-btn {
		background-color: #FF9500;
		padding: 12rpx 32rpx;
		border-radius: 8rpx;
	}

	.renew-text {
		font-size: 28rpx;
		color: #fff;
	}

	.promotion-text {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #FF9500;
		width: 100%;
	}

	/* 编辑姓名弹窗 */
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-dialog {
		width: 600rpx;
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.modal-content {
		padding: 0;
	}

	.modal-input-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 40rpx;
		border-bottom: 1rpx solid #eee;
	}

	.modal-label {
		font-size: 32rpx;
		color: #333;
		flex-shrink: 0;
	}

	.modal-input-wrapper {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: flex-end;
	}

	.modal-input {
		font-size: 32rpx;
		color: #333;
		text-align: right;
		flex: 1;
		margin-right: 20rpx;
	}

	.modal-arrow {
		font-size: 40rpx;
		color: #999;
		line-height: 1;
		font-weight: 300;
	}

	.modal-buttons {
		display: flex;
		align-items: center;
		height: 100rpx;
	}

	.modal-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		border-right: 1rpx solid #eee;
	}

	.modal-btn:last-child {
		border-right: none;
	}

	.cancel-btn {
		background-color: #fff;
	}

	.cancel-text {
		font-size: 32rpx;
		color: #333;
	}

	.save-btn {
		background-color: #fff;
	}

	.save-text {
		font-size: 32rpx;
		color: #FF9500;
		font-weight: 500;
	}

	/* 在线支付弹窗 */
	.payment-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1001;
	}

	.payment-modal-dialog {
		width: 680rpx;
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		max-height: 90vh;
		overflow-y: auto;
	}

	.payment-modal-content {
		padding: 40rpx;
	}

	.payment-title {
		font-size: 36rpx;
		font-weight: 500;
		color: #333;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.payment-section {
		margin-bottom: 40rpx;
	}

	.section-title {
		font-size: 32rpx;
		color: #333;
		margin-bottom: 24rpx;
	}

	/* 付费模式 */
	.payment-mode-options {
		display: flex;
		gap: 40rpx;
	}

	.mode-option {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.radio-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.radio-circle {
		width: 40rpx;
		height: 40rpx;
		border: 2rpx solid #ddd;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
	}

	.radio-selected {
		border-color: #07c160;
	}

	.radio-inner {
		width: 24rpx;
		height: 24rpx;
		background-color: #07c160;
		border-radius: 50%;
	}

	.mode-text {
		font-size: 32rpx;
		color: #333;
	}

	/* 价格和年份 */
	.price-row,
	.year-row,
	.amount-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.price-label,
	.year-label,
	.amount-label {
		font-size: 32rpx;
		color: #666;
	}

	.price-value {
		font-size: 32rpx;
		color: #333;
	}

	.year-control {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.year-btn {
		width: 60rpx;
		height: 60rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
		color: #333;
		background-color: #fff;
	}

	.year-input {
		width: 100rpx;
		height: 60rpx;
		text-align: center;
		font-size: 32rpx;
		color: #333;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
	}

	.amount-value {
		font-size: 36rpx;
		color: #FF9500;
		font-weight: 500;
	}

	/* 支付方式 */
	.payment-method-options {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.method-option {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.method-text {
		font-size: 32rpx;
		color: #333;
	}

	/* 条款同意 */
	.terms-section {
		margin-bottom: 20rpx;
	}

	.terms-wrapper {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.checkbox-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.checkbox {
		width: 36rpx;
		height: 36rpx;
		border: 2rpx solid #ddd;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
	}

	.checkbox-selected {
		background-color: #07c160;
		border-color: #07c160;
	}

	.checkbox-icon {
		color: #fff;
		font-size: 24rpx;
		font-weight: bold;
	}

	.terms-text {
		font-size: 28rpx;
		color: #666;
	}

	.terms-link {
		font-size: 28rpx;
		color: #1296DB;
	}

	/* 底部按钮 */
	.payment-buttons {
		display: flex;
		align-items: center;
		height: 100rpx;
		margin-top: 40rpx;
		border-top: 1rpx solid #eee;
	}

	.payment-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.cancel-payment-btn {
		border-right: 1rpx solid #eee;
	}

	.payment-btn-text {
		font-size: 32rpx;
		color: #333;
	}

	.confirm-text {
		color: #FF9500;
		font-weight: 500;
	}
</style>
