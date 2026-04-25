/**
 * 生成带「消火栓编号」在码下方的测试二维码图，与维保页 data 及扫码解析逻辑一致。
 * 使用：npx -y -p qrcode@1.5.3 -p sharp@0.33.5 node scripts/gen-qr-hydrant-test.cjs
 */
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'static', 'qr-hydrant-scan-test-XFS7318.png');
const CODE = 'XFS7318';
// 与 maintenance/index.vue generateQrcode 中 navUrl 结构一致
const Q_DATA =
  'https://uri.amap.com/marker?position=120.604984,30.934464&name=' +
  encodeURIComponent('消防栓') +
  '&coordinate=gaode&callnative=1&hydrantCode=' +
  encodeURIComponent(CODE);

async function main() {
  const qrSize = 320;
  const margin = 20;
  const labelH = 44;
  const padX = 24;

  const qrBuf = await QRCode.toBuffer(Q_DATA, {
    type: 'png',
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
  const qMeta = await sharp(qrBuf).metadata();
  const w = qMeta.width + 2 * padX;
  const h = qMeta.height + margin * 2 + labelH + 6;

  const labelSvg = Buffer.from(
    `<svg width="${w}" height="${labelH}"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="ui-monospace,Consolas,monospace" fill="#1a1a1a" font-weight="500">${CODE}</text></svg>`,
    'utf-8',
  );
  const labelPng = await sharp(labelSvg).png().toBuffer();
  const labelMeta = await sharp(labelPng).metadata();

  const xQr = Math.round((w - qMeta.width) / 2);
  const yQr = margin;
  const yLabel = yQr + qMeta.height + 10;
  const xLabel = Math.round((w - labelMeta.width) / 2);

  const outBuf = await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      { input: qrBuf, left: xQr, top: yQr },
      { input: labelPng, left: xLabel, top: yLabel },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(OUT, outBuf);
  // eslint-disable-next-line no-console
  console.log('已写入', OUT);
  // eslint-disable-next-line no-console
  console.log('编码内容:\n', Q_DATA);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
