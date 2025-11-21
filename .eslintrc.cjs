module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-env']
    }
  },
  plugins: [
    'vue'
  ],
  rules: {
    // 关闭一些严格的规则，适合 Uniapp 项目
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-v-model-argument': 'off',
    'no-undef': 'off', // Uniapp 的全局变量
    'no-redeclare': 'off' // 允许条件编译中的重复声明
  },
  globals: {
    // Uniapp 全局变量
    uni: 'readonly',
    plus: 'readonly',
    wx: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    // 条件编译
    __PLATFORM__: 'readonly',
    __VERSION__: 'readonly',
    __LINE__: 'readonly',
    // Vue
    Vue: 'readonly'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // Vue 文件特定规则
      }
    }
  ]
}

