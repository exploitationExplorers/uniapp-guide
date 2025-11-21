#!/usr/bin/env zx

// import { $ } from 'zx'

async function main() {
  console.log('🚀 ~ 开始执行代码质量评估....\n')

  try {
    await import('./check-commit.js')
    console.log('✅ 检测通过, 创建 commit 中...\n')
  } catch (error) {
    console.error('❌ 代码质量评估失败, 请检查代码')
    console.error(error.message)
    process.exit(1)
  }
}

main()
