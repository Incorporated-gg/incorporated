/* eslint-disable */
module.exports = {
  server: [
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
