#!/bin/bash
cd /opt/jsoncrack/jsoncrack.com
exec /home/ubuntu/.local/share/pnpm/pnpm exec serve out -l 3000

sudo nano /etc/systemd/system/jsoncrack.service

[Unit]
Description=JSON Crack static site
After=network.target

[Service]
ExecStart=/opt/jsoncrack/jsoncrack.com/start.sh
Restart=always
RestartSec=5
User=ubuntu
Environment=PATH=/home/ubuntu/.nvm/versions/node/v20.19.2/bin:/home/ubuntu/.local/share/pnpm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr>

[Install]
WantedBy=multi-user.target
