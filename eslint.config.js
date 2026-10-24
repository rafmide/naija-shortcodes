import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['node_modules', 'dist', 'public/vendor', '.vercel'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['public/js/**/*.js', 'eslint.config.js', 'scripts/**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['public/js/**/*.js', 'eslint.config.js', 'scripts/**/*.mjs'],
    languageOptions: {
      parserOptions: { projectService: false },
      globals: {
        ...globals.browser,
        ...globals.node,
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
        htmx: 'readonly',
      },
    },
    rules: { 'no-console': 'off' },
  },
  {
    files: ['scripts/**/*.ts', 'src/dev.ts'],
    rules: { 'no-console': 'off' },
  },
)
