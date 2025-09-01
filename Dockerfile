FROM ubuntu:16.04

EXPOSE 8080
ENV PORT 8080

# Install Packages
RUN apt-get update \
    && apt-get install -y apt-utils libtool dh-autoreconf \
    && apt-get install -y cmake python3-dev python3-sip-dev git curl \
    && rm -rf /var/lib/apt/lists/*

# Add Directories
ADD cura-engine/protobuf-3.6.1/ /cura/protobuf
ADD cura-engine/libArcus-3.6.0/ /cura/libArcus
ADD cura-engine/CuraEngine-3.6.0/ /cura/curaEngine
ADD cura-engine/printer-settings/ /printer-settings

# Install Protobuf
WORKDIR /cura/protobuf
RUN chmod +x ./autogen.sh && ./autogen.sh \
    && ./configure && make && make install && ldconfig

# Install libArcus
RUN mkdir /cura/libArcus/build
WORKDIR /cura/libArcus/build
RUN cmake .. && make && make install

# Install CuraEngine
RUN mkdir /cura/curaEngine/build
WORKDIR /cura/curaEngine/build
RUN cmake .. && make && make install

# install node
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

# install server
WORKDIR /server
ADD /server /server
RUN npm install

# 👉 node server.js çalışsın
CMD ["npm", "start"]
