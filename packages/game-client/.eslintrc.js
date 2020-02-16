module.exports = {
  "env": {
    es6: true,
    browser: true
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    'sourceType': 'module',
    "ecmaFeatures": {
      "jsx": true
    }
  },
  extends: ["plugin:react/recommended", "standard", "prettier", "react-app", "plugin:import/errors", "plugin:import/warnings"],
  "settings": {
    "import/resolver": {
      "node": {
        "moduleDirectory": ["node_modules", "src/"]
      }
    }
  },
  plugins: [
    "prettier",
    "react-hooks"
  ],
  rules: {
    "prettier/prettier": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-shadow": "warn",
    "no-return-await": "off",
    "import/no-named-as-default-member": "off"
  }
};
