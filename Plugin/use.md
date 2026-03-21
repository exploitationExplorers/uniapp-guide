## 表单校验插件使用方法

```js
import { createValidator } from '@/Plugin/vailate.js'

const validator = createValidator({ skipOnFirstError: true })

// ✅ 推荐方式：field() 方法 - 单字段多规则按顺序校验
// 优点：phone 字段的 required 和 phone 格式校验会按顺序执行，不会跳到下一个字段
validator
  .field('phone', { required: true, phone: true })
  .field('code', { required: true })
  .field('password', { required: true })
  .field('confirmPassword', { 
    required: true,
    custom: {
      validator: (val, form) => val === form.password,
      message: '两次输入的密码不一致'
    }
  })
  .field('email', { 
    required: true, 
    email: true  // 或自定义提示：email: '邮箱格式错误'
  })
  .field('idCard', {
    required: true,
    pattern: {
      regex: /^\d{18}$/,
      message: '身份证号格式不正确'
    }
  })

// 执行校验
const result = validator.validate(this.form)

if (!result.isValid) {
  uni.showToast({ title: result.firstError, icon: 'none' })
  return
}
```

### field() 方法支持的规则

```js
.field('字段名', {
  required: true,              // 必填，使用内置提示
  required: '自定义必填提示',   // 必填，自定义提示
  
  phone: true,                 // 手机号格式，使用内置提示
  phone: '手机号格式不正确',    // 手机号格式，自定义提示
  
  email: true,                 // 邮箱格式
  email: '邮箱格式错误',
  
  pattern: {                   // 正则校验
    regex: /正则表达式/,
    message: '提示信息'
  },
  
  custom: {                    // 自定义校验函数
    validator: (val, form) => {
      // 返回 true 表示校验通过
      return val === form.otherField
    },
    message: '校验失败提示'
  }
})
```

---

### 旧版 API（兼容保留）

```js
// 方式1：批量必填 + 单独格式校验（会先校验所有 required，再校验格式）
validator
  .required(['phone', 'code', 'password'])
  .phone('phone')  // ⚠️ 注意：会在所有 required 校验完后才执行

// 方式2：自定义部分字段提示
validator.required(['phone', 'code'], {
  phone: '请输入手机号',
  code: '请输入验证码'
})

// 方式3：数组方式
validator.required(['phone', 'code'], ['请输入手机号', '请输入验证码'])

// 方式4：统一提示
validator.required(['field1', 'field2'], '此项必填')

// 单独的格式校验方法
validator.phone('phone', '手机号格式不正确')
validator.email('email', '邮箱格式错误')
validator.pattern('idCard', /^\d{18}$/, '身份证号格式不正确')
validator.addRule('field', (val, form) => val === form.other, '校验失败')
```

---

### 内置字段提示列表
- phone: "请输入手机号"
- code: "请输入验证码"
- password: "请输入密码"
- confirmPassword: "请输入确认密码"
- name: "请输入姓名"
- realName: "请输入真实姓名"
- companyName: "请输入企业名称"
- email: "请输入邮箱"
- idCard: "请输入身份证号"
- username: "请输入用户名"
- nickname: "请输入昵称"
- address: "请输入地址"
- remark: "请输入备注"