#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

# Nuke the last run if it still exists
rm -rf build

# Ensure that the working directory is ready
npm i
cd proxy-ui
npm i
npm run build
cd ..

# Set up the structure for the deb file
mkdir -p build/localproxy_0.0.3-2
cd build/localproxy_0.0.3-2

# Fetch nodejs binary
npm install -g n
n 12.3.1

# Copy localproxy nodejs code, built site, and a nodejs runtime
mkdir -p usr/local/share/localproxy/proxy-ui
cp -r ../../*js usr/local/share/localproxy
cp -r ../../node_modules usr/local/share/localproxy
cp -r ../../proxy-ui/build usr/local/share/localproxy/proxy-ui
cp `n which 12.3.1` usr/local/share/localproxy/node

# Set up reload-nginx
mkdir -p usr/bin
cat - > usr/bin/reload-nginx <<$HERE
#!/bin/bash
nginx -s reload
$HERE
chmod +x usr/bin/reload-nginx
chmod 755 usr/bin/reload-nginx

## Install the sudoers exception for reload-nginx
mkdir -p etc/sudoers.d
cat - > etc/sudoers.d/localproxy <<$HERE
ALL ALL = NOPASSWD: /usr/bin/reload-nginx
$HERE
chmod 440 etc/sudoers.d/localproxy

# Set up the nginx localproxy.conf
mkdir -p etc/nginx/conf.d
touch etc/nginx/conf.d/localproxy.conf
chmod 644 etc/nginx/conf.d/localproxy.conf

# Set up the systemd service
mkdir -p lib/systemd/system
cat - > lib/systemd/system/localproxy.service <<$HERE
[Unit]
Description=localproxy server

[Service]
User=localproxy
ExecStart=/usr/local/share/localproxy/node /usr/local/share/localproxy/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
$HERE

# Deb stuff
mkdir DEBIAN
cat - > DEBIAN/control <<$HERE
Package: localproxy
Version: 0.0.3-2
Section: base
Priority: optional
Architecture: amd64
Depends: nginx (>= 1.14.0)
Maintainer: Kevin Johnson <kevin@kj800x.com>
Description: localproxy
 Dynamically run multiple web applications
 on routes on http://localhost:80.

$HERE

cat - > DEBIAN/postinst <<$HERE
#!/bin/bash
id -u localproxy &>/dev/null || adduser --quiet --system --no-create-home --home /usr/local/share/localproxy --shell /usr/sbin/nologin localproxy
id -g localproxyusers &>/dev/null || addgroup --quiet --system localproxyusers
mkdir -p /etc/localproxy
chown localproxy /etc/nginx/conf.d/localproxy.conf
chown localproxy /etc/localproxy
chgrp localproxyusers /etc/localproxy
chmod g+s /etc/localproxy
chmod 775 /etc/localproxy
systemctl daemon-reload
systemctl start localproxy.service
systemctl enable localproxy.service
systemctl restart localproxy.service
$HERE
chmod +x DEBIAN/postinst

cat - > DEBIAN/postrm <<$HERE
#!/bin/bash
systemctl disable localproxy.service
systemctl daemon-reload
$HERE
chmod +x DEBIAN/postrm

# Build the deb file
cd ..
chown -R root localproxy_0.0.3-2
dpkg-deb --build localproxy_0.0.3-2
