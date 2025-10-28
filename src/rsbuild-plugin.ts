import type { RsbuildPlugin } from '@rsbuild/core'
/**
 * Rsbuild Plugin for Version Check
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

export interface RsbuildVersionPluginOptions {
  /**
   * Custom version info generator
   * @param packageJson - The package.json content
   * @returns Version info object
   */
  versionInfo?: (packageJson: any) => Record<string, any>

  /**
   * Output filename
   * @default 'version.json'
   */
  filename?: string

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean
}

/**
 * Rsbuild plugin to generate version.json
 */
export function rsbuildVersionPlugin(options: RsbuildVersionPluginOptions = {}): RsbuildPlugin {
  const { filename = 'version.json', debug = false } = options

  return {
    name: 'rsbuild-plugin-version-check',

    setup(api) {
      api.onAfterBuild(async ({ stats }) => {
        try {
          // Read package.json
          const packageJsonPath = join(process.cwd(), 'package.json')
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

          // Generate version info
          const versionInfo = options.versionInfo
            ? options.versionInfo(packageJson)
            : {
                version: packageJson.version,
                buildTime: new Date().toISOString(),
              }

          // Get output path
          const outputPath = stats?.toJson({}).outputPath || join(process.cwd(), 'dist')

          // Ensure output directory exists
          mkdirSync(outputPath, { recursive: true })

          // Write version file
          const versionFilePath = join(outputPath, filename)
          writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2), 'utf-8')

          if (debug) {
            // eslint-disable-next-line no-console
            console.log(`[rsbuild-plugin-version-check] Generated ${filename}:`, versionInfo)
          } else {
            // eslint-disable-next-line no-console
            console.log(`✓ Generated ${filename}: v${versionInfo.version}`)
          }
        } catch (error) {
          console.error(`[rsbuild-plugin-version-check] Failed to generate ${filename}:`, error)
        }
      })
    },
  }
}
