// 成员类型
export interface Member {
  user_id: number
  user_num: string
  job_num: string
  product?: string
  imei?: string
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
  grp_cnt?: number
  grp_lmt?: number
  online_status?: number
  created: number
}

// 成员列表响应
export interface MemberListResponse {
  count: number
  members: Member[]
}

// 部门类型
export interface Dept {
  id: number
  name: string
  user_count: number
}

// 部门列表响应
export interface DeptListResponse {
  depts: Dept[]
}

// 群组类型
export interface Group {
  id: number
  dept_id: number
  name: string
  avatar: string
  creator: number
  type: number
  user_count: number
  member_version: number
  burst_mode: number
  created: number
}

// 群组列表响应
export interface GroupListResponse {
  count: number
  groups: Group[]
}
