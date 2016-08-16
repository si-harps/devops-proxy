FROM mhart/alpine-node:4.4.3

RUN apk add --no-cache nginx=1.8.1-r1

ENV DEBUG=* NODE_ENV=production

WORKDIR /app

ADD package.json ./package.json
RUN npm install

ADD . /app

ENTRYPOINT ["/usr/bin/npm"]

CMD ["start"]
