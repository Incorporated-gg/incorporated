module.exports = {
  server: [
    {
      name: 'server',
      script: './worker.js',
      node_args: '-r esm',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
