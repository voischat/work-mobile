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
  is_admin: number
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
