module.exports = {
  apps: [
    {
      name: "rafid-ai-daemon",
      script: "venv/bin/uvicorn",
      args: "web_ai_daemon:app --host 0.0.0.0 --port 9000 --workers 2",
      cwd: "./AI",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
      restart_delay: 3000,
      max_memory_restart: "1G",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      merge_logs: true,
      time: true
    }
  ]
};
