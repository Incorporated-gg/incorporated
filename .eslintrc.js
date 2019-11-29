module.exports = {
  extends: "standard",
  plugins: [
    "react-hooks"
  ],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-shadow": "warn",
    "no-return-await": "off"
  }
};
