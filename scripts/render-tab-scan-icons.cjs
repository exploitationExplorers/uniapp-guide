/* 为 tabBar 生成 81px PNG（与微信建议尺寸一致），与 tab 未选/已选色一致。 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, '..', 'static', 'scan-icon.svg');
const outDefault = path.join(__dirname, '..', 'static', 'tab-scan.png');
const outActive = path.join(__dirname, '..', 'static', 'tab-scan-active.png');

async function run() {
  const svgBase = fs.readFileSync(svgPath, 'utf-8');
  const toPng = (fill, out) => {
    const svg = svgBase.replace(/fill="[^"]*"/, `fill="${fill}"`);
    return sharp(Buffer.from(svg)).resize(81, 81).png().toFile(out);
  };
  await toPng('#999999', outDefault);
  await toPng('#1890ff', outActive);
  // eslint-disable-next-line no-console
  console.log('OK', outDefault, outActive);
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
