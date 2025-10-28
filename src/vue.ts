/**
 * Vue 3 Plugin for Version Check
 */
import type { App, Component } from 'vue'
import type { VersionCheckOptions } from './utils'
import { initializeVersion, initVersionCheck } from './utils'

export * from './utils'

export interface VueVersionCheckOptions extends VersionCheckOptions {
  /**
   * Custom notification component
   */
  notificationComponent?: Component

  /**
   * Auto-start version checking
   * @default true
   */
  autoStart?: boolean

  /**
   * Install global properties
   * @default true
   */
  installGlobalProperties?: boolean
}

export interface VersionCheckInstance {
  /**
   * Start version checking
   */
  start: () => void

  /**
   * Stop version checking
   */
  stop: () => void

  /**
   * Check for updates immediately
   */
  checkNow: () => Promise<void>
}

const PLUGIN_KEY = 'versionCheck'

/**
 * Create Vue plugin for version checking
 */
export function createVersionCheck(options: VueVersionCheckOptions = {}): Plugin {
  const {
    autoStart = true,
    installGlobalProperties = true,
    notificationComponent,
    onUpdateAvailable: customOnUpdateAvailable,
    ...versionCheckOptions
  } = options

  let cleanup: (() => void) | null = null
  let app: App | null = null

  const instance: VersionCheckInstance = {
    start() {
      if (cleanup) {
        console.warn('[Version Check] Already started')
        return
      }

      // Initialize version
      initializeVersion(versionCheckOptions).catch((error) => {
        console.error('[Version Check] Failed to initialize:', error)
      })

      // Start checking
      cleanup = initVersionCheck({
        ...versionCheckOptions,
        onUpdateAvailable: (updateInfo) => {
          if (customOnUpdateAvailable) {
            customOnUpdateAvailable(updateInfo)
          } else if (app) {
            // Emit global event
            app.config.globalProperties.$versionUpdate = updateInfo
          }
        },
      })
    },

    stop() {
      if (cleanup) {
        cleanup()
        cleanup = null
      }
    },

    async checkNow() {
      const { checkForUpdates } = await import('./utils')
      const result = await checkForUpdates(versionCheckOptions)
      return result as any
    },
  }

  return {
    install(vueApp: App) {
      app = vueApp

      // Prevent double installation
      if (vueApp.config.globalProperties[PLUGIN_KEY]) {
        console.warn('[Version Check] Plugin already installed')
        return
      }

      vueApp.config.globalProperties[PLUGIN_KEY] = true

      // Install global properties
      if (installGlobalProperties) {
        vueApp.config.globalProperties.$versionCheck = instance
      }

      // Provide for composition API
      vueApp.provide('versionCheck', instance)

      // Register notification component
      if (notificationComponent) {
        vueApp.component('VersionUpdateNotification', notificationComponent)
      }

      // Auto-start if enabled
      if (autoStart) {
        setTimeout(() => {
          instance.start()
        }, 100)
      }

      // Cleanup on unmount
      const originalUnmount = vueApp.unmount
      vueApp.unmount = function (this: App) {
        instance.stop()
        return originalUnmount.call(this)
      }
    },
  }
}

/**
 * Composition API hook to use version check
 */
export function useVersionCheck(): VersionCheckInstance {
  let inject: any
  try {
    inject = import('vue').then((module) => module.inject)
  } catch {
    throw new Error('[Version Check] Vue is required but not found')
  }

  const instance = inject('versionCheck') as VersionCheckInstance | undefined

  if (!instance) {
    throw new Error('[Version Check] Plugin not installed. Use app.use(createVersionCheck())')
  }

  return instance
}
