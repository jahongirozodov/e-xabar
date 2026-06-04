// PM2 process config — e-Xabar (web + worker + scheduler).
// Ishlatish: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "exabar-web",
      script: "npm",
      args: "run start",
      cwd: __dirname,
      env: { NODE_ENV: "production", PORT: 3001 },
      max_restarts: 10,
      autorestart: true,
    },
    {
      name: "exabar-worker",
      script: "npm",
      args: "run worker",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
      autorestart: true,
    },
    // Eslatma: scheduler PM2 daemon EMAS — u repeatable joblarni Redis'ga
    // yozib chiqib ketadi (bir martalik). deploy.sh uni `npm run scheduler`
    // bilan bir marta ishga tushiradi. Worker shu joblarni jadval bo'yicha bajaradi.
  ],
}
