// 轨迹点
export interface TrackPoint {
  created: number
  lat: number
  lng: number
}

// 轨迹响应
export interface TrackResponse {
  count: number
  tracks: TrackPoint[]
}

// 实时位置响应
export type RealtimeLocationsResponse = {
  uid: number
  type: number
  lat: number
  lng: number
  spd: number
  rad: number
  dir: number
  ts: number
}[]
