/**
 * Version Check Utilities
 */

export interface VersionInfo {
  version: string
  buildTime: string
  [key: string]: any
}

export interface VersionCheckOptions {
  /**
   * Check interval in milliseconds
   * @default 300000 (5 minutes)
   */
  checkInterval?: number

  /**
   * Initial check delay in milliseconds
   * @default 10000 (10 seconds)
   */
  initialDelay?: number

  /**
   * Version file URL
   * @default '/version.json'
   */
  versionUrl?: string

  /**
   * LocalStorage key for version
   * @default 'app_version'
   */
  storageKey?: string

  /**
   * Callback when update is available
   */
  onUpdateAvailable?: (updateInfo: {
    currentVersion: string | null
    latestVersion: string
    buildTime: string
  }) => void
}

const DEFAULT_OPTIONS: Required<Omit<VersionCheckOptions, 'onUpdateAvailable'>> = {
  checkInterval: 5 * 60 * 1000, // 5 minutes
  initialDelay: 10000, // 10 seconds
  versionUrl: '/version.json',
  storageKey: 'app_version',
}

/**
 * Get current version from localStorage
 */
export function getCurrentVersion(storageKey = DEFAULT_OPTIONS.storageKey): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return localStorage.getItem(storageKey)
}

/**
 * Set current version in localStorage
 */
export function setCurrentVersion(version: string, storageKey = DEFAULT_OPTIONS.storageKey): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  localStorage.setItem(storageKey, version)
}

/**
 * Fetch latest version from server
 */
export async function fetchLatestVersion(
  versionUrl = DEFAULT_OPTIONS.versionUrl,
): Promise<VersionInfo> {
  const response = await fetch(`${versionUrl}?t=${Date.now()}`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch version: ${response.status}`)
  }

  return response.json()
}

/**
 * Check for version updates
 */
export async function checkForUpdates(
  options: Pick<VersionCheckOptions, 'versionUrl' | 'storageKey'> = {},
): Promise<{
  hasUpdate: boolean
  currentVersion: string | null
  latestVersion: string
  buildTime: string
}> {
  const { versionUrl, storageKey } = { ...DEFAULT_OPTIONS, ...options }

  const currentVersion = getCurrentVersion(storageKey)
  const latestVersionInfo = await fetchLatestVersion(versionUrl)

  const hasUpdate = currentVersion !== null && currentVersion !== latestVersionInfo.version

  return {
    hasUpdate,
    currentVersion,
    latestVersion: latestVersionInfo.version,
    buildTime: latestVersionInfo.buildTime,
  }
}

/**
 * Force reload page with cache clearing
 */
export function forceReload(): void {
  if (typeof window === 'undefined') return

  // Clear service worker caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name))
    })
  }

  // Force reload from server
  window.location.reload()
}

/**
 * Initialize version checking
 * @returns Cleanup function
 */
export function initVersionCheck(options: VersionCheckOptions = {}): () => void {
  const {
    checkInterval = DEFAULT_OPTIONS.checkInterval,
    initialDelay = DEFAULT_OPTIONS.initialDelay,
    versionUrl = DEFAULT_OPTIONS.versionUrl,
    storageKey = DEFAULT_OPTIONS.storageKey,
    onUpdateAvailable,
  } = options

  let timerId: ReturnType<typeof setInterval> | null = null
  let initialTimeout: ReturnType<typeof setTimeout> | null = null

  const check = async (): Promise<void> => {
    try {
      const result = await checkForUpdates({ versionUrl, storageKey })

      if (result.hasUpdate && onUpdateAvailable) {
        onUpdateAvailable({
          currentVersion: result.currentVersion,
          latestVersion: result.latestVersion,
          buildTime: result.buildTime,
        })
      }
    } catch (error) {
      console.error('[Version Check] Failed:', error)
    }
  }

  // Initial check after delay
  initialTimeout = setTimeout(() => {
    check()
  }, initialDelay)

  // Periodic checks
  timerId = setInterval(check, checkInterval)

  // Return cleanup function
  return () => {
    if (initialTimeout) clearTimeout(initialTimeout)
    if (timerId) clearInterval(timerId)
  }
}

/**
 * Initialize version on first load
 */
export async function initializeVersion(
  options: Pick<VersionCheckOptions, 'versionUrl' | 'storageKey'> = {},
): Promise<void> {
  const { versionUrl, storageKey } = { ...DEFAULT_OPTIONS, ...options }

  try {
    const versionInfo = await fetchLatestVersion(versionUrl)
    const storedVersion = getCurrentVersion(storageKey)

    // Only update if version matches or no stored version
    if (!storedVersion || storedVersion === versionInfo.version) {
      setCurrentVersion(versionInfo.version, storageKey)
    }
  } catch (error) {
    console.error('[Version Check] Failed to initialize:', error)
  }
}
