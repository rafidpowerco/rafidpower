#!/bin/bash
# =========================================================================
# Rafid Power - Sovereign Core AGI (Ubuntu/Debian VPS Automated Deployment)
# =========================================================================

echo "⏳ Initiating Rafid Power VPS Ecosystem Deployment..."

# 1. Update system and install base dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx python3-pip python3.11-venv software-properties-common ufw

# 2. Setup Node.js (Version 20) and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. Setup Python Virtual Environment
cd /var/www/rafid-power || exit
python3 -m venv venv
source venv/bin/activate
pip install -r AI/requirements.txt # Ensure requirements.txt exists

# 4. Build the React Frontend
echo "🔧 Building React Client..."
cd /var/www/rafid-power/client
npm install
npm run build
cd ..

# 5. Connect Nginx Configuration
echo "🌐 Configuring Nginx Web Server..."
sudo cp vps_deployment_assets/rafid_nginx.conf /etc/nginx/sites-available/rafid_power
sudo ln -sf /etc/nginx/sites-available/rafid_power /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 6. Setup Firewall (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# 7. Start AI Daemon using PM2
echo "🧠 Booting Sovereign AI Daemon (PM2)..."
pm2 start vps_deployment_assets/ecosystem.config.js
pm2 save
pm2 startup

echo "======================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "Next Step: Point your domain to this VPS IP and run:"
echo "sudo certbot --nginx -d rafidpower.xyz -d www.rafidpower.xyz"
echo "======================================================="
