
user  nginx;
worker_processes  1;

error_log  /proc/1/fd/1 warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /proc/1/fd/1 main;

    sendfile        off;

    keepalive_timeout  65;

    # Proxies
    {{#services}}

    server {
      resolver 127.0.0.11 valid=5s;
      listen {{listen}};
      server_name {{ingress_host}};
      set $upstream_service {{egress_host}};
      location / {
          proxy_pass http://$upstream_service:{{port}};
      }
    }
    {{/services}}

    server {
      listen {{listen}};
      server_name _;
      location / {
        proxy_pass http://127.0.0.1:3000;
      }
    }
}
