export function initVConsole(): Promise<void> {
  return new Promise((resolve) => {
    // Enable VConsole when URL query parameter debug=true is present
    // Handle both regular query params and hash routing scenarios
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')

    const isDebugEnabled = searchParams.get('debug') === 'true' || hashParams.get('debug') === 'true'

    if (isDebugEnabled) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js'
      script.onload = () => {
        // @ts-expect-error - VConsole will be available globally after script loads
        const vConsole = new VConsole()
        console.log('VConsole initialized:', vConsole)
        resolve()
      }
      script.onerror = () => {
        // If VConsole fails to load, continue anyway
        resolve()
      }
      document.head.appendChild(script)
    }
    else {
      resolve()
    }
  })
}
