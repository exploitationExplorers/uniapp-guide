<template>
	<view class="flex_row">
		<text>总计：</text>
		<text>{{detailsMoney}}</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detailsMoney: 9527,
			}
			{
                 
			}
		}
	}
</script>

<style scoped lang="scss">
	.flex_row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 20rpx;
		>text:nth-child(1){
			color: #909297;
		}
		>text:nth-child(2){
			color: #E09B6C;
		}
	}
</style>