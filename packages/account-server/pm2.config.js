/* eslint-disable */
module.exports = {
  apps: [
    {
      name: 'account-server',
      script: './build/index.js',
      node_args: '-r esm',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
