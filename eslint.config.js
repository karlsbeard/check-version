// @ts-check
import antfu, { ignores } from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
  },
  ignores([
    '*.md',
    '*.yml',
    '*.yaml',
  ]),
)
