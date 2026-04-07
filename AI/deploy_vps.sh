#!/bin/bash
# RAFID SOVEREIGN AGI - VPS AUTO DEPLOYMENT SCRIPT 
# يدعم Ubuntu 22.04 LTS / 24.04 LTS

echo "==========================================================="
echo " 🚀 BEGINNING RAFID SOVEREIGN AGI VPS DEPLOYMENT..."
echo "==========================================================="

# 1. تحديث النظام ותثبيت الحزم الأساسية
echo "[1/6] تحديث خوادم النظام الأساسية وتثبيت المتطلبات (Python, Nginx)..."
sudo apt-get update -y
sudo apt-get install -y python3.11 python3.11-venv python3-pip nginx ufw curl

# 2. إعداد البيئة الوهمية والبايثون
echo "[2/6] تهيئة العقل المركزي (Virtual Environment) وتثبيت المكتبات..."
cd "$(dirname "$0")" || exit
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 3. إعداد الجدار الناري
echo "[3/6] تفعيل وتكوين الدرع السيبراني (UFW)..."
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
yes | sudo ufw enable

# 4. إعداد (NGINX) للربط مع API
echo "[4/6] برمجة البوابة العكسية (Nginx Reverse Proxy)..."
cat <<EOF | sudo tee /etc/nginx/sites-available/rafid-ai
server {
    listen 80;
    server_name _; # يستقبل أي IP موجه للـ VPS
    
    location / {
        proxy_pass http://127.0.0.1:9095; # البورت الذي يعمل عليه web_ai_daemon
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # لضمان عدم إغلاق الاتصال لطلبات الـ Generation الطويلة
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# تفعيل إعدادات Nginx
sudo ln -sf /etc/nginx/sites-available/rafid-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# 5. إعداد نظام التشغيل الذاتي الدائم (Systemd)
echo "[5/6] تركيب قلب النظام للعمل الدائم 24/7 (Systemd Daemon)..."
WORK_DIR=$(pwd)
VENV_PYTHON="$WORK_DIR/.venv/bin/python"
EXEC_SCRIPT="$WORK_DIR/daemon_runner.py"

cat <<EOF | sudo tee /etc/systemd/system/rafid-ai.service
[Unit]
Description=Rafid Sovereign AGI Master Daemon
After=network.target nginx.service

[Service]
User=root
WorkingDirectory=$WORK_DIR
ExecStart=$VENV_PYTHON $EXEC_SCRIPT
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=rafid-ai

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable rafid-ai.service
sudo systemctl restart rafid-ai.service

# 6. النهاية
echo "==========================================================="
echo " ✅ اكتمل بناء النظام بنجاح!"
echo " 🌐 رافد الآن حي ويعمل على خادمك الـ VPS (منفذ 80)"
echo " لمراقبة عقل النظام بشكل حي، أكتب: sudo journalctl -u rafid-ai -f"
echo "==========================================================="
