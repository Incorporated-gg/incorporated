module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    'sourceType': 'module'
  },
  'globals':{
    'BigInt':true
  },
  extends: ["standard", "prettier"],
  plugins: [
    "prettier"
  ],
  rules: {
    "prettier/prettier": "error",
    "no-shadow": "warn",
    "no-return-await": "off",
    "no-multi-str": "off"
  }
};
