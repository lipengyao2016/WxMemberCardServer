FROM node
# 维护者信息
MAINTAINER lipy "lipy@163.com"

# Create app directory
RUN mkdir -p /home/node/WxMemberCardServer
WORKDIR /home/node/WxMemberCardServer

# Bundle app source
COPY . /home/node/WxMemberCardServer
RUN   npm config set registry https://registry.npm.taobao.org \
     && npm install \
    && /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo 'Asia/Shanghai' >/etc/timezone

EXPOSE 6003
CMD [ "node", "server.js" ]