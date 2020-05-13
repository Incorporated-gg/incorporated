/* eslint-disable */
module.exports = {
  apps: [
    {
      name: 'account-server',
      script: "./node_modules/.bin/ts-node",
      args:"--project ./tsconfig.json ./index.ts",
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
