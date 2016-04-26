FROM nginx:1.8-alpine

ENV NODE_VERSION=v4.2.2 NPM_VERSION=3

RUN apk add --update git curl make gcc g++ python linux-headers libgcc libstdc++ && \
    curl -sSL https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}.tar.gz | tar -xz && \
    cd /node-${NODE_VERSION} && \
    ./configure --prefix=/usr && \
    make -j$(grep -c ^processor /proc/cpuinfo 2>/dev/null || 1) && \
    make install && \
    cd / && \
    npm install -g npm@${NPM_VERSION} && \
    apk del curl gcc g++ linux-headers && \
    rm -rf /etc/ssl /node-${NODE_VERSION} \
    /usr/share/man /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp \
    /usr/lib/node_modules/npm/man /usr/lib/node_modules/npm/doc /usr/lib/node_modules/npm/html


ENV DEBUG=* NODE_ENV=production

WORKDIR /app

ADD package.json ./package.json
RUN npm install

ADD . /app

EXPOSE 3000 8080

ENTRYPOINT ["/app/entry.sh"]
