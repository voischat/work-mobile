// 登录接口返回的数据类型
export interface LoginAccount {
  country_code: string
  password: string
  user_number: string
}

export interface LoginUser {
  user_id: number
  user_num: string
  job_num: string
  product: string
  imei: string
  sex: number
  name: string
  avatar: string
  is_dept_admin: number
  dept_id: number
  phone: string
  country_code: string
  state: number
  type: number
  tts: number
  loc_share: number
  track: number
  grp_cnt: number
  grp_lmt: number
  created: number
  bind_phone: string
  bind_email: string
}

export interface LoginResponse {
  access_token: string
  account: LoginAccount
  expires_in: number
  refresh_token: string
  user: LoginUser
}

// 刷新 token 接口返回的数据类型
export interface RefreshTokenResponse {
  access_token: string
  expires_in: number
  refresh_token: string
}

// 用户信息接口（对应 get-selfinfo 返回的数据）
export interface UserInfo {
  user_id: number
  user_num: string
  job_num: string
  product: string
  imei: string
  sex: number
  name: string
  avatar: string
  is_dept_admin: number
  dept_id: number
  phone: string
  country_code: string
  state: number
  type: number
  tts: number
  loc_share: number
  track: number
  grp_cnt: number
  grp_lmt: number
  created: number
  bind_phone: string
  bind_email: string
}

// 修改密码请求参数
export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

// 绑定手机请求参数
export interface BindPhoneRequest {
  phone: string
  country_code: string
  verifycode: string
}

// 绑定邮箱请求参数
export interface BindEmailRequest {
  email: string
  verifycode: string
}

// 注销账号请求参数（手机）
export interface UnregistRequest {
  phone: string
  country_code: string
  verifycode: string
}

// 注销账号请求参数（邮箱）
export interface UnregistByEmailRequest {
  email: string
  country_code: string
  verifycode: string
}

// 图形验证码响应
export interface ImageVerifyCodeResponse {
  id: string
  image: string
}

// 发送短信验证码请求参数
export interface SendSmsVerifyCodeRequest {
  phone: string
  countrycode: string
  verify_id: string
  verify_answer: string
  smstype: 'work-login' | 'work-regist' | 'work-bind-phone' | 'work-reset-password' | 'work-add-device' | 'work-unregist'
}

// 发送邮箱验证码请求参数
export interface SendEmailVerifyCodeRequest {
  email: string
  countrycode: string
  verify_id: string
  verify_answer: string
  emailtype: 'work-login' | 'work-bind' | 'work-unregist'
}

// 手机号登录请求参数
export interface LoginBySmsRequest {
  phone: string
  country_code: string
  verifycode: string
}

// 邮箱登录请求参数
export interface LoginByEmailRequest {
  email: string
  verifycode: string
}
