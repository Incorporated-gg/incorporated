module.exports = {
  apps: [
    {
      name: 'game-server-http-server',
      script: './http-server.js',
      node_args: '-r esm',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'game-server-crons',
      script: './crons.js',
      node_args: '-r esm',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
