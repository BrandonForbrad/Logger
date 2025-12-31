# Demo:

[https://youtu.be/e9NHjvWLnb8
](url)
# Setup on Ubuntu Server:



**Install Nodejs and git**
```
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs git
```

**Clone this Repo:**
```
cd /var
mkdir www
cd www
git clone https://github.com/BrandonForbrad/Logger.git
cd Logger
```
**Install Dependencies:**
Run:
```
npm install
```

**Test if server is running:**
Run:
```
node server.js
```
Go to: 
```
http://YOUR_SERVER_IP:3000
```

**Setup to your domain with NGINX:**

Install Nginx:
```
apt update
apt install nginx -y
```
Create Record:
Either with Cloudflare, GoDaddy or who ever your host provider is you can create a record with the following

```
Host: NAME_HERE (example: devlog) so would visit devlog.example.com 
Type: A
Value: YOUR_SERVER_IP
TTL: auto
```

Create a config:
```
nano /etc/nginx/sites-available/logger
```

Edit this and then Paste into config:
```
server {
    listen 80;
    server_name SERVERNAME_HERE (example: devlog.example.com);

    client_max_body_size 200M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;
    }
}

```

Save + exit:
press CTRL + O 
press Enter
press CTRL-X

Run these commands:
```
ln -s /etc/nginx/sites-available/logger /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```






