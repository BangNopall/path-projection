module.exports = {
  apps: [
    {
      name: "path-projection",
      script: "./.output/server/index.mjs",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 4444,
        HOST: "0.0.0.0",
      },
      max_memory_restart: "500M",
      restart_delay: 3000,
      autorestart: true,
    },
  ],
};
