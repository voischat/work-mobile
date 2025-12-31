// 企业认证信息类型
export interface LegalInfo {
  id: number
  org_num: number
  category: number
  name: string
  identify: string
  business_license: string
  state: number
  updated: string
}

// 企业认证请求类型
export interface LegalRequest {
  id?: number
  name: string
  identify: string
  business_license: string
}

// 企业认证 API 响应类型
export interface LegalResponse {
  legal: LegalInfo
}
