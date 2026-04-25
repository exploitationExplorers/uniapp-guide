/**
 * 扫码进维保：解析内容、组 URL。首页「去维保」也使用 buildMaintenanceUrl。
 */

function formatScanTime(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${mi}:${s}`;
}

function normalizeScanCode(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return '';

  const extractFromQuery = (source) => {
    const keys = ['code', 'deviceCode', 'hydrantCode'];
    const queryIndex = source.indexOf('?');
    const queryString = queryIndex >= 0 ? source.slice(queryIndex + 1) : source;
    const pairs = queryString.split('&').filter(Boolean);
    for (let i = 0; i < pairs.length; i += 1) {
      const [keyPart = '', valuePart = ''] = pairs[i].split('=');
      const key = decodeURIComponent(keyPart || '').trim();
      if (!keys.includes(key)) continue;
      return decodeURIComponent(valuePart || '').trim();
    }
    return '';
  };

  if (/^https?:\/\//i.test(raw) || raw.includes('?') || raw.includes('&')) {
    const queryCode = extractFromQuery(raw);
    if (queryCode) return queryCode;
  }

  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed = JSON.parse(raw);
      return String(parsed.code || parsed.deviceCode || parsed.hydrantCode || '').trim();
    } catch (e) {
      void e;
    }
  }

  return raw.replace(/^"|"$/g, '');
}

function buildMaintenanceUrl(item = {}, extraParams = {}) {
  const params = {
    id: item.id || '',
    code: item.code || '',
    name: item.name || '',
    lat: item.lat || '',
    lng: item.lng || '',
    addr: item.address || item.addr || '',
    ...extraParams
  };

  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

  return `/pages/maintenance/index${query ? `?${query}` : ''}`;
}

/**
 * 调起系统扫码，成功后跳转维保。成功跳转前会 set skipNextScanOnShow，从维保页返回时不再立刻二次弹扫。
 */
function scanToMaintenance() {
  return new Promise((resolve) => {
    uni.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        const deviceCode = normalizeScanCode(res.result);
        if (!deviceCode) {
          uni.showToast({ title: '未识别到消火栓编号', icon: 'none' });
          resolve(false);
          return;
        }
        const scanTime = formatScanTime();
        uni.navigateTo({
          url: buildMaintenanceUrl({ code: deviceCode }, { scanTime }),
          complete: () => resolve(true)
        });
      },
      fail: (err) => {
        if (err && err.errMsg && err.errMsg.includes('cancel')) {
          resolve(false);
          return;
        }
        uni.showToast({ title: '扫码失败，请重试', icon: 'none' });
        resolve(false);
      }
    });
  });
}

export { formatScanTime, normalizeScanCode, buildMaintenanceUrl, scanToMaintenance };
