<template>
  <view class="container">
    <view class="header">
      <text class="title">选择维保设备</text>
    </view>
    
    <view class="tab-box">
      <view class="tab-item" :class="{active: currentTab === 0}" @click="currentTab = 0">附近设备</view>
      <view class="tab-item" :class="{active: currentTab === 1}" @click="currentTab = 1">手动输入</view>
    </view>

    <!-- 附近设备 -->
    <view class="content-box" v-if="currentTab === 0">
      <view class="location-info">
        <text class="loc-text">当前位置: {{ locationText }}</text>
        <button class="refresh-btn" size="mini" @click="getLocation">刷新定位</button>
      </view>
      
      <scroll-view class="equipment-list" scroll-y>
        <view class="equipment-item" v-for="(item, index) in nearbyEquipments" :key="index">
          <view class="eq-info">
            <view class="eq-name">{{ item.name }} <text class="eq-code">({{ item.code }})</text></view>
            <view class="eq-dist">距离: {{ item.distance }}m</view>
            <view class="eq-addr">地址: {{ item.address }}</view>
          </view>
          <button class="maintain-btn" size="mini" @click="goToMaintenance(item)">去维保</button>
        </view>
        <view v-if="nearbyEquipments.length === 0" class="empty-tip">暂无附近设备</view>
      </scroll-view>
    </view>

    <!-- 手动输入 -->
    <view class="content-box" v-if="currentTab === 1">
      <view class="search-box">
        <input class="search-input" v-model="searchCode" placeholder="请输入设备编号 (如: XFS7318)" />
        <button class="search-btn" size="mini" @click="searchEquipment">查询</button>
      </view>
      
      <view class="equipment-item mt-20" v-if="searchedEquipment">
        <view class="eq-info">
          <view class="eq-name">{{ searchedEquipment.name }} <text class="eq-code">({{ searchedEquipment.code }})</text></view>
          <view class="eq-addr">地址: {{ searchedEquipment.address }}</view>
        </view>
        <button class="maintain-btn" size="mini" @click="goToMaintenance(searchedEquipment)">去维保</button>
      </view>
      <view v-else-if="hasSearched" class="empty-tip">未找到相关设备</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 0,
      locationText: "正在获取位置...",
      longitude: 0,
      latitude: 0,
      searchCode: "",
      searchedEquipment: null,
      hasSearched: false,
      nearbyEquipments: []
    }
  },
  onLoad() {
    const app = getApp();
    if (!app.globalData.token) {
      uni.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.getLocation();
  },
  methods: {
    getLocation() {
      this.locationText = "定位中...";
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log(res,'定位');
          
          this.longitude = res.longitude;
          this.latitude = res.latitude;
          this.locationText = `经度:${res.longitude.toFixed(4)}, 纬度:${res.latitude.toFixed(4)}`;
          this.getNearbyEquipments();
        },
        fail: () => {
          // 在PC微信开发者工具或未授权时，模拟一个定位
          this.longitude = 120.604984;
          this.latitude = 30.934464;
          this.locationText = `经度:120.6050, 纬度:30.9345 (模拟)`;
          this.getNearbyEquipments();
        }
      });
    },
    getNearbyEquipments() {
      // 模拟根据经纬度获取的附近设备，包含题目要求的XFS7318
      this.nearbyEquipments = [
        { id: 1, name: "消防栓", code: "XFS7318", distance: 15, address: "苏州市吴江区·南城", lat: 30.934464, lng: 120.604984 },
        { id: 2, name: "配电箱", code: "PDX1024", distance: 120, address: "苏州市吴江区·北城", lat: 30.935500, lng: 120.606000 },
        { id: 3, name: "水泵", code: "SB0098", distance: 350, address: "苏州市吴江区·东城", lat: 30.936000, lng: 120.608000 }
      ];
    },
    searchEquipment() {
      if (!this.searchCode) {
        return uni.showToast({ title: '请输入设备编号', icon: 'none' });
      }
      this.hasSearched = true;
      // 模拟查询
      if (this.searchCode.toUpperCase() === 'XFS7318') {
        this.searchedEquipment = { id: 1, name: "消防栓", code: "XFS7318", address: "苏州市吴江区·南城", lat: 30.934464, lng: 120.604984 };
      } else {
        this.searchedEquipment = null;
      }
    },
    goToMaintenance(item) {
      uni.navigateTo({
        url: `/pages/maintenance/index?id=${item.id}&code=${item.code}&name=${item.name}&lat=${item.lat}&lng=${item.lng}&addr=${item.address}`
      });
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #1890ff;
  padding: 40rpx 30rpx 60rpx;
}

.title {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}

.tab-box {
  display: flex;
  background-color: #fff;
  margin: -30rpx 30rpx 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 32rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #1890ff;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #1890ff;
  border-radius: 6rpx;
}

.content-box {
  flex: 1;
  padding: 0 30rpx;
}

.location-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.loc-text {
  font-size: 26rpx;
  color: #333;
}

.refresh-btn {
  margin: 0;
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.equipment-list {
  height: calc(100vh - 350rpx);
}

.equipment-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
}

.mt-20 {
  margin-top: 20rpx;
}

.eq-info {
  flex: 1;
  margin-right: 20rpx;
}

.eq-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.eq-code {
  font-size: 28rpx;
  color: #999;
  font-weight: normal;
}

.eq-dist {
  font-size: 26rpx;
  color: #ff9800;
  margin-bottom: 6rpx;
}

.eq-addr {
  font-size: 24rpx;
  color: #666;
}

.maintain-btn {
  margin: 0;
  background-color: #1890ff;
  color: #fff;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.search-btn {
  margin: 0;
  background-color: #1890ff;
  color: #fff;
  height: 70rpx;
  line-height: 70rpx;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 60rpx 0;
}
</style>