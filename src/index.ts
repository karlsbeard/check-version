/**
 * @jd/rsbuild-plugin-version-check
 *
 * Automatic version update detection for Rsbuild + Vue 3 applications
 */

// Export Rsbuild plugin
export { rsbuildVersionPlugin, type RsbuildVersionPluginOptions } from './rsbuild-plugin'

// Export utilities
export {
  getCurrentVersion,
  setCurrentVersion,
  fetchLatestVersion,
  checkForUpdates,
  forceReload,
  initVersionCheck,
  initializeVersion,
  type VersionInfo,
  type VersionCheckOptions,
} from './utils'

// Default export
export { rsbuildVersionPlugin as default } from './rsbuild-plugin'
