module.exports = {
  apps: [
    {
      name: 'game-server',
      script: './index.js',
      node_args: '-r esm',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
