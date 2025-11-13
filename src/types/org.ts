// 组织信息类型
export interface OrgInfo {
  address_ver: number
  avatar: string
  created: number
  creator: number
  dept_cnt: number
  device_cnt: number
  device_ver: number
  group_cnt: number
  group_ver: number
  intro: string
  member_cnt: number
  name: string
  num: number
  vip: number
  vip_expired: number
}

// 组织信息 API 响应类型
export interface OrgResponse {
  org: OrgInfo
}

// VIP 支持功能类型
export interface VipSupport {
  member_limit?: number
  dept_limit?: number
  dept_member_limit?: number
  group_limit?: number
  group_member_limit?: number
  device_limit?: number
  name: string
  support: boolean
  quick_support?: boolean
  type: number
}

// VIP 信息类型
export interface VipInfo {
  vip: number
  vip_name: string
  vip_expired: number
  vip_created: number
  vip_supports: VipSupport[]
}

// VIP 信息 API 响应类型
export interface VipResponse {
  vip: VipInfo
}
