module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: [
    'standard',
    'prettier',
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'prettier',
    '@typescript-eslint'
  ],
  rules: {
    "prettier/prettier": "error",
    "no-shadow": "warn",
    "no-return-await": "off",
    "no-multi-str": "off",
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/member-delimiter-style":  [2, {
      "multiline": {
        "delimiter": "none",
        "requireLast": false
      },
      "singleline": {
        "delimiter": "comma",
        "requireLast": false
      }
    }]
  },
  ignorePatterns: ["node_modules/", "build/"],
  overrides: [
      {
          "files": ["*.js", "*.jsx"],
          "rules": {
              "@typescript-eslint/*": "off",
              "@typescript-eslint/explicit-function-return-type": "off",
              "@typescript-eslint/camelcase": "off",
              "@typescript-eslint/no-unused-vars": "off",
          }
      }
  ]
}
