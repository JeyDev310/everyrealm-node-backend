module.exports = {
  apps: [{
    script: 'npm run start:dev',
    name: 'user-backend',
    watch: '.',
    ignore_watch: ['./logs', 'node_modules', 'logs/*', 'src/locals/*', './src/locals/*', './src/locals']
  }],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}
