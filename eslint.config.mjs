import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import nextPlugin from '@next/eslint-plugin-next'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default [
  // 🔕 Global ignores (take effect before any shareable configs)
  {
    ignores: [
      'node_modules',
      '.next',
      'out',
      'dist',
      'coverage',
      'build',
      // Generated & declaration files (too noisy / not hand-edited)
      'src/generated/**',
      '**/*.d.ts',
      'prisma/**',
      // Backup files
      '**/*.backup.*',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Convert Next's shareable config to flat config
  ...compat.config(nextPlugin.configs['core-web-vitals']),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      '@next/next': nextPlugin, // makes rules usable directly if needed
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'warn',
      // Disable base rule as it conflicts with TypeScript rule
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade from error to warning for production builds
    },
  },
]
