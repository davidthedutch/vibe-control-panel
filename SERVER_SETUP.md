# Server Setup Guide - AI Workloads (Hetzner VPS)

Deze guide legt uit hoe je de Hetzner VPS server configureert voor AI workloads (Ollama, web scrapers, background jobs).

---

## 📋 Prerequisites

- Hetzner Cloud account
- SSH client (Windows: gebruik WSL of PuTTY)
- Domain naam (optioneel, voor SSL)
- Server provisioned (CAX11 of hoger)

---

## 1. Initial Server Setup

### 1.1 Verbind met SSH

```bash
# Replace <SERVER_IP> with your Hetzner server IP
ssh root@<SERVER_IP>
```

**Eerste keer**: Type "yes" om de SSH fingerprint te accepteren.

### 1.2 Update systeem

```bash
apt update && apt upgrade -y
```

### 1.3 Create non-root user

```bash
# Create user
adduser deploy
usermod -aG sudo deploy

# Setup SSH key voor deploy user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Test SSH als deploy user (open nieuwe terminal)
ssh deploy@<SERVER_IP>
```

### 1.4 Beveilig SSH

```bash
sudo nano /etc/ssh/sshd_config
```

**Wijzig deze regels:**
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

**Restart SSH:**
```bash
sudo systemctl restart sshd
```

---

## 2. Installeer Docker

```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository (ARM64 voor CAX11)
echo "deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add deploy user to docker group
sudo usermod -aG docker deploy
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## 3. Installeer Ollama

### 3.1 Download en installeer Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 3.2 Configureer Ollama als systemd service

```bash
sudo nano /etc/systemd/system/ollama.service
```

**Plak deze configuratie:**
```ini
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=deploy
Group=deploy
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_MODELS=/home/deploy/ollama-models"

[Install]
WantedBy=default.target
```

**Enable en start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

### 3.3 Download AI models

```bash
# Download Llama 3.1 8B (recommended voor CAX11)
ollama pull llama3.1:8b

# Alternatief: kleinere model voor testen
ollama pull llama3.2:3b

# Test model
ollama run llama3.1:8b "Hello, how are you?"
```

**Verwachte model sizes:**
- llama3.1:8b → ~4.7GB
- llama3.2:3b → ~2GB
- codellama:7b → ~3.8GB

---

## 4. Setup AI Server (Node.js API)

### 4.1 Installeer Node.js

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
node --version  # Should show v20.x
```

### 4.2 Clone en setup AI server

```bash
cd /home/deploy
git clone https://github.com/davidthedutch/vibe-control-panel.git
cd vibe-control-panel/server

# Install dependencies
npm install

# Create .env file
nano .env
```

**Plak deze .env configuratie:**
```bash
PORT=3001
OLLAMA_URL=http://localhost:11434
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
NODE_ENV=production
```

### 4.3 Setup server als systemd service

```bash
sudo nano /etc/systemd/system/ai-server.service
```

**Plak deze configuratie:**
```ini
[Unit]
Description=AI Server API
After=network.target ollama.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/vibe-control-panel/server
ExecStart=/home/deploy/.nvm/versions/node/v20.11.1/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Enable en start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-server
sudo systemctl start ai-server
sudo systemctl status ai-server
```

---

## 5. Setup Nginx Reverse Proxy

### 5.1 Installeer Nginx

```bash
sudo apt install -y nginx
```

### 5.2 Configureer Nginx voor AI server

```bash
sudo nano /etc/nginx/sites-available/ai-server
```

**Plak deze configuratie:**
```nginx
server {
    listen 80;
    server_name <YOUR_DOMAIN_OR_IP>;

    # AI Server API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Ollama API
    location /ollama {
        proxy_pass http://localhost:11434;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts voor large model responses
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/ai-server /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuratie
sudo systemctl restart nginx
```

---

## 6. Setup SSL (Optioneel maar aanbevolen)

### 6.1 Installeer Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Verkrijg SSL certificaat

```bash
# Replace <YOUR_DOMAIN> met jouw domain
sudo certbot --nginx -d <YOUR_DOMAIN>

# Follow prompts:
# - Email address voor renewal notifications
# - Agree to Terms of Service
# - Optioneel: redirect HTTP naar HTTPS (recommended)
```

**Auto-renewal test:**
```bash
sudo certbot renew --dry-run
```

---

## 7. Firewall Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT: doe dit eerst!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow alleen Ollama van localhost (niet publiek!)
# (Ollama wordt via Nginx reverse proxy geëxposed)

# Check status
sudo ufw status verbose
```

---

## 8. Monitoring & Logs

### 8.1 Check service status

```bash
# Ollama
sudo systemctl status ollama
journalctl -u ollama -f  # Live logs

# AI Server
sudo systemctl status ai-server
journalctl -u ai-server -f

# Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 8.2 Resource monitoring

```bash
# CPU, RAM, disk usage
htop

# Docker containers
docker ps
docker stats

# Disk usage
df -h

# Ollama model storage
du -sh /home/deploy/ollama-models/
```

### 8.3 Setup log rotation

```bash
sudo nano /etc/logrotate.d/ai-server
```

**Plak:**
```
/var/log/ai-server/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 deploy deploy
}
```

---

## 9. Deployment Script

Maak deployment script voor toekomstige updates:

```bash
nano /home/deploy/deploy.sh
chmod +x /home/deploy/deploy.sh
```

**Plak dit script:**
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to project
cd /home/deploy/vibe-control-panel

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Update server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart ai-server

# Check status
echo "✅ Checking service status..."
sudo systemctl status ai-server --no-pager

echo "✨ Deployment complete!"
```

**Gebruik:**
```bash
/home/deploy/deploy.sh
```

---

## 10. Test de Setup

### 10.1 Test Ollama

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

### 10.2 Test AI Server API

```bash
curl http://localhost:3001/health
```

### 10.3 Test via Nginx (external)

```bash
curl http://<YOUR_SERVER_IP>/ollama/api/tags
curl http://<YOUR_SERVER_IP>/api/health
```

### 10.4 Test from Vercel app

Update `.env.local` in je Next.js app:
```bash
AI_SERVER_URL=https://<YOUR_DOMAIN>/api
OLLAMA_URL=https://<YOUR_DOMAIN>/ollama
```

---

## 11. Kosten Optimalisatie

### CAX11 (€4.15/maand) - Starter:
- **RAM**: 8GB (genoeg voor 1-2 kleine models)
- **CPU**: 4 vCPU ARM (efficient voor inferencing)
- **Storage**: 40GB (3-4 models max)
- **Best voor**: Development, low traffic

### Upgrade Pad:

#### Bij groei → **CPX31** (€18/maand):
- **RAM**: 8GB
- **CPU**: 4 vCPU x86
- **Storage**: 160GB
- **Best voor**: Production, medium traffic

#### Bij schalen → **CPX51** (€46/maand):
- **RAM**: 16GB
- **CPU**: 16 vCPU
- **Storage**: 360GB
- **Best voor**: High traffic, multiple models

---

## 12. Troubleshooting

### Ollama werkt niet:
```bash
sudo systemctl status ollama
journalctl -u ollama -n 50
# Check if port 11434 is listening
sudo netstat -tulpn | grep 11434
```

### AI Server werkt niet:
```bash
sudo systemctl status ai-server
journalctl -u ai-server -n 50
# Check Node.js process
ps aux | grep node
```

### Out of Memory errors:
```bash
# Check RAM usage
free -h
# Check wat processen veel RAM gebruiken
ps aux --sort=-%mem | head -10
# Overweeg kleinere model of upgrade server
```

### Nginx errors:
```bash
sudo nginx -t  # Test config
sudo tail -f /var/log/nginx/error.log
```

---

## 13. Security Checklist

- [ ] SSH key-based authentication (no passwords)
- [ ] Root login disabled
- [ ] UFW firewall enabled
- [ ] Ollama niet direct publiek toegankelijk (alleen via Nginx)
- [ ] SSL certificaat geïnstalleerd (voor productie)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Supabase service role key niet in code (alleen in .env)
- [ ] Fail2ban geïnstalleerd (optioneel): `sudo apt install fail2ban`

---

## 14. Maintenance Schedule

### Dagelijks:
- Check logs voor errors: `journalctl -xe`

### Wekelijks:
- Check disk usage: `df -h`
- Check service status: `systemctl status ollama ai-server nginx`

### Maandelijks:
- System updates: `sudo apt update && sudo apt upgrade`
- Review security logs
- Check backup status (als geconfigureerd)

### Per kwartaal:
- Review kosten en resource usage
- Overweeg server upgrade/downgrade
- Update Ollama models naar nieuwere versies

---

## 🎯 Quick Reference

### Service Commands:
```bash
# Ollama
sudo systemctl start|stop|restart|status ollama

# AI Server
sudo systemctl start|stop|restart|status ai-server

# Nginx
sudo systemctl start|stop|restart|status nginx
```

### Logs:
```bash
# Live logs
journalctl -u ollama -f
journalctl -u ai-server -f
tail -f /var/log/nginx/access.log
```

### Deploy nieuwe code:
```bash
/home/deploy/deploy.sh
```

---

**Setup voltooid!** 🎉

Je server is nu klaar voor AI workloads. Update de environment variables in Vercel met je server URL en test de integratie.

**Volgende stap**: Configureer Supabase en connect alle services (zie DEPLOYMENT_LOG.md).

---

*Laatst bijgewerkt: 2026-02-08*
