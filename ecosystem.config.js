module.exports = {
  apps: [
    {
      name: "Rafid-Web-AGI-Daemon",
      script: "python3",
      args: "-m uvicorn web_ai_daemon:app --host 0.0.0.0 --port 9000",
      cwd: "./AI",
      autorestart: true,
      max_restarts: 10,
      watch: false
    },
    {
      name: "Rafid-Delphi-SmartBridge-API",
      script: "python3",
      args: "-m uvicorn delphi_api_bridge:app --host 0.0.0.0 --port 8000",
      cwd: "./AI",
      autorestart: true,
      max_restarts: 10,
      watch: false
    },
    {
      name: "Rafid-Autonomous-Finance-Learner",
      script: "autonomous_finance_learner.py",
      interpreter: "python3",
      cwd: "./AI",
      autorestart: true,
      max_restarts: 10,
      watch: false
    }
  ]
};
