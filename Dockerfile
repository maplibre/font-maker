FROM ubuntu:22.04

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y libboost-all-dev cmake clang libfreetype6-dev pkg-config g++ libharfbuzz-dev git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /root
