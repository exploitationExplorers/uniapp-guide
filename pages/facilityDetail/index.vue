<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-body">
      <view class="hero">
        <image class="hero-bg" :src="headerBg" mode="aspectFill"></image>
        <view class="hero-overlay"></view>
        <view class="hero-title">{{ facility.platformName }}</view>
      </view>

      <view class="section section-base">
        <view class="section-header section-header-green">
          <text class="section-title">基本信息</text>
        </view>
        <view class="info-list">
          <view class="info-row" v-for="(item, idx) in facilityInfoRows" :key="idx">
            <view class="label">{{ item.label }}</view>
            <view class="value">{{ item.value }}</view>
          </view>
        </view>
      </view>

      <view class="section section-safe">
        <view class="section-header section-header-green">
          <text class="section-title">安全提示</text>
        </view>
        <view class="safe-tip-container" :class="{'is-expanded': isSafeTipExpanded}">
          <view class="safe-tip-content">
            <text decode>破坏公共设备设施处五日以下拘留或者五百元以下罚款，如果构成犯罪的处三年以上十年以下有期徒刑。\n&emsp;&emsp;根据《治安管理处罚法》第三十七条第三项规定，盗窃、损毁路面井盖、照明等公共设施的，处五日以下拘留或者五百元以下罚款；情节严重的，处五日以上十日以下拘留，可以并处五百元以下罚款。\n&emsp;&emsp;根据《刑法》第一百一十七条\n&emsp;&emsp;破坏轨道、桥梁、隧道、公路、机场、航道、灯塔、标志或者进行其他破坏活动，足以使火车、汽车、电车、船只、航空器发生倾覆、毁坏危险，尚未造成严重后果的，处三年以上十年以下有期徒刑。</text>
          </view>
          
          <!-- 折叠时的底部渐变和展开按钮 -->
          <view class="collapse-mask" v-if="!isSafeTipExpanded">
            <view class="toggle-btn" @click="isSafeTipExpanded = true">点击查看全部</view>
          </view>
        </view>
        
        <!-- 展开后的收起按钮 -->
        <view class="collapse-bar" v-if="isSafeTipExpanded">
          <text class="collapse-text" @click="isSafeTipExpanded = false">点击收起</text>
        </view>
      </view>

      <view class="section section-maintain">
        <view class="section-header section-header-green">
          <text class="section-title">日常维护</text>
        </view>
        <view class="entry-card" @click="goToForm('daily')">
          <view class="entry-left">
            <view class="icon-circle icon-green">⚙</view>
            <text class="entry-text">井盖维护登记</text>
          </view>
          <text class="entry-arrow">›</text>
        </view>
        <view class="view-btn btn-green" @click="viewRecords('daily')">查看表单记录</view>

        <view v-if="dailyRecords.length" class="record-list">
          <view class="record-card record-green" v-for="item in dailyRecords" :key="item.id">
            <view class="record-head">{{ facility.code }}</view>
            <view class="record-status">{{ item.status }}</view>
            <view class="record-title">井盖维护记录</view>
            <view class="record-meta">
              <text>{{ item.time }}</text>
              <text>{{ item.user }}</text>
            </view>
            <text class="record-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="section section-repair">
        <view class="section-header section-header-blue">
          <text class="section-title">报修登记</text>
        </view>
        <view class="entry-card" @click="goToForm('repair')">
          <view class="entry-left">
            <view class="icon-circle icon-blue">🔧</view>
            <text class="entry-text">报修登记</text>
          </view>
          <text class="entry-arrow">›</text>
        </view>
        <view class="view-btn btn-blue" @click="viewRecords('repair')">查看表单记录</view>

        <view v-if="repairRecords.length" class="record-list">
          <view class="record-card record-blue" v-for="item in repairRecords" :key="item.id">
            <view class="record-head">{{ facility.code }}</view>
            <view class="record-status">{{ item.status }}</view>
            <view class="record-title">市政设施报修登记</view>
            <view class="record-meta">
              <text>{{ item.time }}</text>
              <text>{{ item.user }}</text>
            </view>
            <text class="record-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="section section-message">
        <view class="section-header section-header-orange">
          <text class="section-title">建议留言</text>
        </view>
        <view class="entry-card" @click="goToForm('message')">
          <view class="entry-left">
            <view class="icon-circle icon-orange">📝</view>
            <text class="entry-text">建议留言记录</text>
          </view>
          <text class="entry-arrow">›</text>
        </view>
        <view class="view-btn btn-orange" @click="viewRecords('message')">查看表单记录</view>
        <view class="empty-tip">——— 暂无记录 ———</view>
      </view>

      <view class="task-stat" @click="openTaskStatistics">
        <view class="entry-left">
          <view class="icon-circle icon-green-light">☑</view>
          <view>
            <view class="task-title">任务统计</view>
            <view class="task-sub">查看计划任务 流程任务</view>
          </view>
        </view>
        <text class="entry-arrow task-arrow">›</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="footer">
      <button class="add-btn" @click="addRecord">添加记录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      headerBg: 'https://images.unsplash.com/photo-1536895058696-a69b1c7ba34f?auto=format&fit=crop&w=1200&q=80',
      facility: {
        platformName: '市政设施管理平台',
        name: '污水井CGJHS-Wn044',
        coverType: '污水井',
        code: 'CGJHS-Wn044',
        loadLevel: 'D400',
        standard: 'GB/T2358-2009《检查井盖》',
        manufacturer: '武汉路宝',
        productionDate: '见井盖正面',
        owner: '某市城市管理局',
        hotline: 'xxxx',
        remark: '球墨铸铁防沉降井盖，直径:700mm，管径600mm'
      },
      dailyRecords: [
        { id: 1, status: '正常', time: '2026-03-25 13:29:10', user: '系统员' },
        { id: 2, status: '正常', time: '2026-01-21 15:09:15', user: '公开号用户_a8645' }
      ],
      repairRecords: [
        { id: 1, status: '一般维修', time: '2026-02-11 11:26:30', user: '维护员_01' }
      ],
      isSafeTipExpanded: false
    };
  },
  onLoad(options) {
    const code = decodeURIComponent(options.code || '');
    const name = decodeURIComponent(options.name || '');
    if (code) this.facility.code = code;
    if (name) this.facility.name = `${name}${code ? code : ''}`;
  },
  computed: {
    facilityInfoRows() {
      return [
        { label: '设施名称', value: this.facility.name },
        { label: '井盖属性', value: this.facility.coverType },
        { label: '井盖编号', value: this.facility.code },
        { label: '承载等级', value: this.facility.loadLevel },
        { label: '执行标准', value: this.facility.standard },
        { label: '生产厂家', value: this.facility.manufacturer },
        { label: '生产日期', value: this.facility.productionDate },
        { label: '产权单位', value: this.facility.owner },
        { label: '24小时行业服务电话', value: this.facility.hotline },
        { label: '基本信息', value: this.facility.remark }
      ];
    }
  },
  methods: {
    goToForm(type) {
      if (type === 'daily') {
        uni.navigateTo({ url: '/pages/maintenanceRecord/index' });
      } else {
        const labels = {
          repair: '报修登记',
          message: '建议留言'
        };
        uni.showToast({ title: `进入${labels[type]}`, icon: 'none' });
      }
    },
    viewRecords(type) {
      const labels = {
        daily: '日常维护',
        repair: '报修登记',
        message: '建议留言'
      };
      uni.showToast({ title: `查看${labels[type]}记录`, icon: 'none' });
    },
    openTaskStatistics() {
      uni.showToast({ title: '进入任务统计', icon: 'none' });
    },
    addRecord() {
      uni.showActionSheet({
        itemList: ['添加日常维护', '添加报修登记', '添加建议留言'],
        success: (res) => {
          const actions = ['daily', 'repair', 'message'];
          this.goToForm(actions[res.tapIndex]);
        }
      });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f5;
  position: relative;
  padding-bottom: 120rpx;
}

.scroll-body {
  height: 100vh;
}

.hero {
  height: 280rpx;
  position: relative;
}

.hero-bg {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
}

.hero-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #ffeb3b;
  color: #000;
  border-radius: 12rpx;
  padding: 12rpx 28rpx;
  font-size: 40rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
  white-space: nowrap;
  box-shadow: 0 0 0 6rpx rgba(255, 255, 255, 0.8);
}

.section {
  background: #fff;
  margin-top: 20rpx;
  border-radius: 0;
  overflow: hidden;
}

.section-header {
  height: 76rpx;
  display: flex;
  align-items: center;
  padding-left: 20rpx;
  border-left: 10rpx solid transparent;
}

.section-header-green {
  background: #ebf5e3;
  border-left-color: #8cc220;
}

.section-header-blue {
  background: #e6f0fa;
  border-left-color: #3b88eb;
}

.section-header-orange {
  background: #fdf3e5;
  border-left-color: #f3a022;
}

.section-header-red {
  background: #f1efdf;
  border-left-color: #8bc120;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.info-list {
  background: #fff;
  padding: 0 20rpx;
}

.info-row {
  display: flex;
  min-height: 80rpx;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding: 16rpx 0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  flex: 0 0 35%;
  font-size: 28rpx;
  color: #333;
}

.value {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #666;
  line-height: 1.4;
}

.entry-card {
  margin: 20rpx 20rpx 16rpx;
  background: #fff;
  border-radius: 0;
  padding: 16rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.entry-left {
  display: flex;
  align-items: center;
}

.icon-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  font-size: 36rpx;
}

.icon-green {
  background: #8cc220;
}

.icon-blue {
  background: #3b88eb;
}

.icon-orange {
  background: #f3a022;
}

.icon-green-light {
  background: transparent;
  color: #8cc220;
  font-size: 50rpx;
}

.entry-text {
  font-size: 32rpx;
  color: #333;
}

.entry-arrow {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
}

.view-btn {
  margin: 0 20rpx 20rpx;
  height: 72rpx;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30rpx;
  color: #333;
}

.btn-green {
  background: #ebf5e3;
  border: 1px solid #d0e6ba;
}

.btn-blue {
  background: #e6f0fa;
  border: 1px solid #c0d8f0;
}

.btn-orange {
  background: #fdf3e5;
  border: 1px solid #e8cdae;
}

.record-list {
  padding: 0 20rpx 20rpx;
}

.record-card {
  border-radius: 4rpx;
  background: #fff;
  padding: 16rpx;
  margin-bottom: 16rpx;
  position: relative;
  border-left: 8rpx solid transparent;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.record-green {
  border-left-color: #8cc220;
}

.record-blue {
  border-left-color: #3b88eb;
}

.record-head {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.record-status {
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.record-green .record-status {
  color: #8cc220;
}

.record-blue .record-status {
  color: #3b88eb;
}

.record-title {
  font-size: 30rpx;
  color: #333;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

.record-arrow {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40rpx;
  color: #999;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 30rpx 0 40rpx;
}

.safe-tip-container {
  position: relative;
  overflow: hidden;
  max-height: 200rpx;
}

.safe-tip-container.is-expanded {
  max-height: none;
}

.safe-tip-content {
  padding: 24rpx 28rpx 0;
  color: #c84116;
  font-size: 30rpx;
  line-height: 1.6;
}

.collapse-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 60%);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 20rpx;
}

.toggle-btn {
  border: 1px solid #1890ff;
  color: #1890ff;
  border-radius: 8rpx;
  padding: 8rpx 36rpx;
  font-size: 28rpx;
  background: #fff;
  z-index: 10;
}

.collapse-bar {
  text-align: center;
  padding: 16rpx 0 24rpx;
  background: #f7f7f7;
}

.collapse-text {
  color: #1890ff;
  font-size: 28rpx;
}

.task-stat {
  margin: 20rpx;
  border-radius: 12rpx;
  background: #ebf5e3;
  border: 1px solid #d0e6ba;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-title {
  font-size: 32rpx;
  color: #8cc220;
  font-weight: 700;
}

.task-sub {
  font-size: 28rpx;
  color: #8cc220;
  margin-top: 8rpx;
}

.task-arrow {
  color: #8cc220;
  font-size: 44rpx;
}

.bottom-space {
  height: 40rpx;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 30rpx;
  background: #f0f2f5;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.add-btn {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 8rpx;
  font-size: 34rpx;
  color: #fff;
  background: #1890ff;
}

.add-btn::after {
  border: none;
}
</style>
