# Hosting Guide for Backend

This guide provides step-by-step instructions to deploy the Node.js backend on a VPS (Virtual Private Server) like DigitalOcean, AWS EC2, or Linode.

## Prerequisites

- **VPS Access**: Root or sudo user access to a Linux server (Ubuntu 20.04/22.04 recommended).
- **Domain Name**: A domain pointing to your server's IP address (optional but recommended for SSL).
- **GitHub Repository**: Your code pushed to a Git repository.

---

## Step 1: Server Access

Connect to your server via SSH:

```bash
ssh root@your_server_ip
# OR if you have a specific user
ssh username@your_server_ip
```

---

## Step 2: Environment Setup

Update your package list and install the necessary tools: Node.js, NPM, and Git.

```bash
# 1. Update package index
sudo apt update

# 2. Install curl (if not present)
sudo apt install curl -y

# 3. Download setup script for Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 4. Install Node.js
sudo apt install -y nodejs

# 5. Verify installation
node -v
npm -v
```

---

## Step 3: Install PM2 Globally

PM2 is a production process manager for Node.js that keeps your app alive forever.

```bash
sudo npm install -g pm2
```

---

## Step 4: Application Deployment

### 1. Clone the Repository

Navigate to your desired directory (e.g., `/var/www` or `~/`) and clone your project.

```bash
cd ~
git clone https://github.com/MANSIAG1/Referal-Earning-System
cd Referal-Earning-System
```

### 2. Backend Setup

Navigate to the server directory and install dependencies.

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file with your production secrets.

```bash
nano .env
```

Paste your configuration (adjust values as needed):

```env
PORT=5000
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.

---

## Step 5: Start with PM2

Start your application using PM2 so it runs in the background.

```bash
# Start the app (assuming server.js is the entry point)
pm2 start server.js --name "referral-backend"

# Ensure PM2 restarts on server reboot
pm2 startup
# (Copy and run the command PM2 provides in the output)

# Save the current process list
pm2 save
```

### Common PM2 Commands

Manage your application process with these commands:

- **Restart**: `pm2 restart referral-backend`
  - Use this after pushing new code changes.
- **Stop**: `pm2 stop referral-backend`
  - Stops the application without deleting it from the process list.
- **Delete**: `pm2 delete referral-backend`
  - Removes the application from the PM2 registry.
- **Start**: `pm2 start server.js --name "referral-backend"`
  - Starts the application. Use `--name` to give it a memorable ID.
- **Logs**: `pm2 logs referral-backend`
  - View real-time logs for debugging.
- **Status**: `pm2 status`
  - View the status of all managed applications.
- **Monitor**: `pm2 monit`
  - Detailed dashboard of CPU and Memory usage.

---

## Step 6: Setup Nginx as Reverse Proxy (Recommended)

Instead of exposing port 5000 directly, use Nginx to forward traffic from port 80.

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Create Configuration

```bash
sudo nano /etc/nginx/sites-available/referral-backend
```

Add the following configuration (replace `your_domain_or_ip`):

```nginx
server {
    listen 80;
    server_name your_domain_or_ip; # e.g., api.example.com or your IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable the Site

```bash
# Link the config to sites-enabled
sudo ln -s /etc/nginx/sites-available/referral-backend /etc/nginx/sites-enabled/

# Test configuration for syntax errors
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 7: Configure Firewall (UFW)

Secure your server by allowing only necessary ports.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Step 8: SSL Setup (Optional but Recommended)

Secure your API with HTTPS using Certbot (Let's Encrypt). *Requires a domain name.*

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain and install certificate
sudo certbot --nginx -d your_domain.com
```

Follow the prompts to configure HTTPS redirect.

---

## Conclusion

Your backend should now be live and accessible at `http://your_domain_or_ip` (or `https` if you set up SSL).
