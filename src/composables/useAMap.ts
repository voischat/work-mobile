import AMapLoader from '@amap/amap-jsapi-loader'

const isLoaded = ref(false)
const AMapInstance = ref<any>(null)

export function useAMap() {
  async function loadAMap() {
    if (isLoaded.value)
      return AMapInstance.value

    // 设置安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: AMapKeys.secert,
    }

    const AMap = await AMapLoader.load({
      key: AMapKeys.js,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    })

    isLoaded.value = true
    AMapInstance.value = AMap
    return AMap
  }

  return {
    isLoaded,
    loadAMap,
  }
}

// 声明 window 类型扩展
declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
    AMap?: any
  }
}
