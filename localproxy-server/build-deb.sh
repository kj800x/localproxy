#!/bin/bash

export VERSION="${VERSION:=0.3.2}"
export ARCH="${ARCH:=amd64}"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

if [ "$ARCH" = "amd64" ]
  then export N_ARCH="x64"
  export MKCERT_ARCH="amd64"
fi

if [ "$ARCH" = "armhf" ]
  then export N_ARCH="armv7l"
  export MKCERT_ARCH="arm"
fi

if [ "$ARCH" = "arm64" ]
  then export N_ARCH="arm64"
  export MKCERT_ARCH="arm64"
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
mkdir -p build/localproxy_${VERSION}_${ARCH}
cd build/localproxy_${VERSION}_${ARCH}

# Fetch nodejs binary
npm install -g n
N_PREFIX=./n-tmp n --arch ${N_ARCH} 12.3.1

# Copy localproxy nodejs code, built site, mkcert, and a nodejs runtime
mkdir -p usr/local/share/localproxy/proxy-ui
cp -r ../../*js usr/local/share/localproxy
cp -r ../../node_modules usr/local/share/localproxy
cp -r ../../proxy-ui/build usr/local/share/localproxy/proxy-ui
cp `N_PREFIX=./n-tmp n which 12.3.1` usr/local/share/localproxy/node
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.2/mkcert-v1.4.2-linux-${MKCERT_ARCH} -O usr/local/share/localproxy/mkcert
chmod +x usr/local/share/localproxy/mkcert

# Clear n-tmp directory
rm -rf ./n-tmp

# Set up reload-nginx
mkdir -p usr/bin
cat - > usr/bin/reload-nginx <<$HERE
#!/bin/bash
nginx -s reload
$HERE
chmod +x usr/bin/reload-nginx
chmod 755 usr/bin/reload-nginx

# Set up mkcert-install
mkdir -p usr/bin
cat - > usr/bin/mkcert-install <<$HERE
#!/bin/bash
/usr/local/share/localproxy/mkcert -install
$HERE
chmod +x usr/bin/mkcert-install
chmod 755 usr/bin/mkcert-install

## Install the sudoers exception for reload-nginx and mkcert-install
mkdir -p etc/sudoers.d
cat - > etc/sudoers.d/localproxy <<$HERE
ALL ALL = NOPASSWD: /usr/bin/reload-nginx
ALL ALL = NOPASSWD:SETENV: /usr/bin/mkcert-install
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
cat - > DEBIAN/control << HERE
Package: localproxy
Version: ${VERSION}
Section: base
Priority: optional
Architecture: ${ARCH}
Depends: nginx (>= 1.14.0), libnss3-tools
Maintainer: Kevin Johnson <kevin@kj800x.com>
Description: localproxy
 Automatic nginx configuration for 
 dynamically run web applications.
HERE

cat - > DEBIAN/postinst <<'HERE'
#!/bin/bash
id -u localproxy &>/dev/null || adduser --quiet --system --no-create-home --home /usr/local/share/localproxy --shell /usr/sbin/nologin localproxy
id -g localproxyusers &>/dev/null || addgroup --quiet --system localproxyusers
usermod -a -G localproxyusers localproxy

if [[ -f /etc/nginx/sites-enabled/default ]]; then
  mv /etc/nginx/sites-enabled/default /etc/nginx/.default-site_disabled_by_localproxy
fi

mkdir -p /etc/localproxy/sites/

if [[ ! -f /etc/localproxy/hosts ]]; then
  echo "localhost" >> /etc/localproxy/hosts
  echo "127.0.0.1" >> /etc/localproxy/hosts
  echo "::1" >> /etc/localproxy/hosts
  hostname >> /etc/localproxy/hosts
  hostname -I | tr ' ' '\012' | awk 'NF' - >> /etc/localproxy/hosts
  chown localproxy /etc/localproxy/hosts
fi

if [[ ! -f /etc/localproxy/localproxy.pem ]]; then
  mkdir -p /etc/localproxy/ca-root
  CAROOT=/etc/localproxy/ca-root /usr/local/share/localproxy/mkcert -install

  CAROOT=/etc/localproxy/ca-root /usr/local/share/localproxy/mkcert -cert-file /etc/localproxy/localproxy.pem -key-file /etc/localproxy/localproxy-key.pem $(tr '\012' ' ' < /etc/localproxy/hosts)
  chown localproxy /etc/localproxy/ca-root/rootCA.pem /etc/localproxy/ca-root/rootCA-key.pem
  chown localproxy /etc/localproxy/localproxy.pem /etc/localproxy/localproxy-key.pem
fi

chown localproxy /etc/nginx/conf.d/localproxy.conf
chown localproxy /etc/localproxy

chown localproxy /etc/localproxy/sites
chgrp localproxyusers /etc/localproxy/sites
chmod g+s /etc/localproxy/sites
chmod 775 /etc/localproxy/sites

systemctl daemon-reload
systemctl start localproxy.service
systemctl enable localproxy.service
systemctl restart localproxy.service
HERE
chmod +x DEBIAN/postinst

cat - > DEBIAN/postrm <<$HERE
#!/bin/bash
[ -f /etc/nginx/.default-site_disabled_by_localproxy ] && mv /etc/nginx/.default-site_disabled_by_localproxy /etc/nginx/sites-enabled/default

systemctl disable localproxy.service
systemctl restart nginx.service
systemctl daemon-reload
$HERE
chmod +x DEBIAN/postrm

# Build the deb file
cd ..
chown -R root localproxy_${VERSION}_${ARCH}
dpkg-deb --build localproxy_${VERSION}_${ARCH}
