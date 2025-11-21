#!/usr/bin/env zx

import { $ } from 'zx'

/**
 * 获取暂存区的文件列表
 */
async function getStagedFiles() {
  try {
    const result = await $`git diff --cached --name-only --diff-filter=ACM`
    const files = result.stdout
      .split('\n')
      .map(file => file.trim())
      .filter(file => {
        // 只检查 JS、Vue、TS 文件，排除 node_modules 和构建产物
        return file && 
               /\.(js|vue|ts|jsx|tsx)$/.test(file) && 
               !file.includes('node_modules') &&
               !file.includes('unpackage') &&
               !file.includes('dist')
      })
    return files
  } catch (error) {
    // 如果没有暂存文件，返回空数组
    return []
  }
}

/**
 * 执行 ESLint 检查（使用命令行方式）
 * ESLint 会同时检查语法错误和代码质量问题
 */
async function runESLint() {
  const stagedFiles = await getStagedFiles()
  
  if (stagedFiles.length === 0) {
    console.log('📝 没有需要检查的文件\n')
    return { success: true }
  }

  console.log(`📋 使用 ESLint 检查 ${stagedFiles.length} 个文件...\n`)

  try {
    // 使用 ESLint 命令行工具检查文件
    // 直接使用相对路径，ESLint 会在当前工作目录中查找
    // 在 zx 中，数组会自动展开为多个参数
    const eslintArgs = ['eslint', ...stagedFiles, '--format', 'stylish']
    await $`npx ${eslintArgs}`
    console.log('\n✅ ESLint 检查通过\n')
    return { success: true }
  } catch (error) {
    // ESLint 发现错误时会退出并返回非0状态码
    console.error('\n❌ ESLint 检查失败：发现语法错误或代码质量问题\n')
    console.log('💡 提示：请修复上述错误后重新提交\n')
    console.log('💡 可以使用 npm run lint:fix 自动修复一些问题\n')
    return { success: false }
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 执行 ESLint 检查（ESLint 会同时检查语法错误和代码质量问题）
    const eslintResult = await runESLint()
    if (!eslintResult.success) {
      process.exit(1)
    }

    console.log('🎉 所有检查通过！\n')
  } catch (error) {
    console.error('❌ 代码质量检查失败：', error.message)
    if (error.stderr) {
      console.error(error.stderr)
    }
    process.exit(1)
  }
}

main()

