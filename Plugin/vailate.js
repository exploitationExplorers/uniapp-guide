const RE = {
  phone: /^1[3-9]\d{9}$/,
  email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
};

const RULE_MSG = {
  required: "此项必填",
  phone: "手机号格式不正确",
  email: "邮箱格式不正确",
  pattern: "格式不正确",
  custom: "校验失败",
};

const FIELD_MSG = {
  phone: "请输入手机号",
  code: "请输入验证码",
  password: "请输入密码",
  confirmPassword: "请输入确认密码",
  name: "请输入姓名",
  realName: "请输入真实姓名",
  companyName: "请输入企业名称",
  email: "请输入邮箱",
};

/**
 * @description 表单校验插件
 * @param {Object} opts - 配置选项
 * @param {boolean} opts.skipOnFirstError - 是否在第一个错误时跳过其他校验
 * @param {Array} opts.plugins - 插件列表
 * @param {Object} opts.form - 表单数据
 * @param {Array} opts.errors - 错误列表
 * @param {boolean} opts.isValid - 是否有效
 * @param {Object} opts.firstError - 第一个错误
 */
class Validator {
  constructor(opts = {}) {
    this.opts = { skipOnFirstError: true, ...opts };
    this.plugins = [];
  }
  /**
   * 注册插件
   */
  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }
  /**
   * 执行校验
   */
  validate(form) {
    const initCtx = {
      form,
      errors: [],
      isValid: true,
      firstError: null,
    };

    return this.plugins.reduce((ctx, plugin) => {
      if (this.opts.skipOnFirstError && !ctx.isValid) {
        return ctx;
      }

      const result = plugin(ctx);

      if (result?.error) {
        ctx.errors.push(result.error);
        ctx.isValid = false;
        if (!ctx.firstError) {
          ctx.firstError = result.error.msg;
        }
      }

      return ctx;
    }, initCtx);
  }

  /**
   * 单字段多规则校验（推荐使用，按顺序校验该字段的所有规则）
   * @param {String} fieldName - 字段名
   * @param {Object} rules - 规则配置
   */
  field(fieldName, rules) {
    // 必填校验
    if (rules.required) {
      const msg = typeof rules.required === 'string' 
        ? rules.required 
        : FIELD_MSG[fieldName] || RULE_MSG.required;
      this.use((ctx) => {
        const val = ctx.form[fieldName];
        if (val === "" || val == null) {
          return { error: { field: fieldName, msg } };
        }
      });
    }

    // 手机号校验
    if (rules.phone) {
      const msg = typeof rules.phone === 'string' ? rules.phone : RULE_MSG.phone;
      this.use((ctx) => {
        const val = ctx.form[fieldName];
        if (val && !RE.phone.test(val)) {
          return { error: { field: fieldName, msg } };
        }
      });
    }


    // 正则校验
    if (rules.pattern) {
      const { regex, message } = rules.pattern;
      this.use((ctx) => {
        const val = ctx.form[fieldName];
        if (val && !regex.test(val)) {
          return { error: { field: fieldName, msg: message || RULE_MSG.pattern } };
        }
      });
    }

    // 自定义校验
    if (rules.custom) {
      const { validator, message } = rules.custom;
      this.use((ctx) => {
        if (!validator(ctx.form[fieldName], ctx.form)) {
          return { error: { field: fieldName, msg: message || RULE_MSG.custom } };
        }
      });
    }

    return this;
  }

  /**
   * 批量必填
   * @param {Array|String} fields - 字段名数组或单个字段名
   * @param {Array|String|Object} msgs - 可选，自定义提示信息
   */
  required(fields, msgs) {
    const arr = [].concat(fields);
    
    // 处理不同类型的 msgs 参数
    let msgMap = {};
    if (!msgs) {
    
      msgMap = {};
    } else if (typeof msgs === 'string') {
    
      arr.forEach(field => msgMap[field] = msgs);
    } else if (Array.isArray(msgs)) {
    
      arr.forEach((field, i) => msgMap[field] = msgs[i]);
    } else if (typeof msgs === 'object') {
    
      msgMap = msgs;
    }

    arr.forEach((field) => {
      const msg = msgMap[field] || FIELD_MSG[field] || RULE_MSG.required;
      this.use((ctx) => {
        const val = ctx.form[field];
        if (val === "" || val == null) {
          return { error: { field, msg } };
        }
      });
    });
    return this;
  }

  /**
   * 正则校验
   */
  pattern(field, re, msg) {
    return this.use((ctx) => {
      const val = ctx.form[field];
      if (val && !re.test(val)) {
        return { error: { field, msg: msg || RULE_MSG.pattern } };
      }
    });
  }

  /**
   * 手机号
   */
  phone(field, msg) {
    return this.pattern(field, RE.phone, msg || RULE_MSG.phone);
  }

  /**
   * 邮箱
   */
  email(field, msg) {
    return this.pattern(field, RE.email, msg || RULE_MSG.email);
  }

  /**
   * 自定义规则
   */
  addRule(field, fn, msg) {
    return this.use((ctx) => {
      if (!fn(ctx.form[field], ctx.form)) {
        return { error: { field, msg: msg || RULE_MSG.custom } };
      }
    });
  }

  /**
   * 清空插件
   */
  clear() {
    this.plugins = [];
    return this;
  }
}

export function createValidator(opts) {
  return new Validator(opts);
}
