
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

    upstream default {
      server 127.0.0.1:3000;
    }

    {{#services}}
    upstream {{name}}_services {
      {{#instances}}
      server {{Address}}:{{Port}}; # instance id: {{ID}}
      {{/instances}}
    }

    {{/services}}

    # Proxies
    {{#services}}

    server {
      listen 8080;
      server_name {{proxy.domain}};
      location / {
          proxy_pass http://{{name}}_services/;
      }
    }
    {{/services}}

    server {
      listen 8080;
      server_name _;
      location / {
        proxy_pass http://default/;
      }
    }
}
