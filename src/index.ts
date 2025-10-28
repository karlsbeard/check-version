/**
 * rsbuild-plugin-version-check
 *
 * Automatic version update detection for Rsbuild + Vue 3 applications
 */

// Export Rsbuild plugin
export { rsbuildVersionPlugin, type RsbuildVersionPluginOptions } from './rsbuild-plugin'

// Default export
export { rsbuildVersionPlugin as default } from './rsbuild-plugin'

// Export utilities
export {
  checkForUpdates,
  fetchLatestVersion,
  forceReload,
  getCurrentVersion,
  initializeVersion,
  initVersionCheck,
  setCurrentVersion,
  type VersionCheckOptions,
  type VersionInfo,
} from './utils'
