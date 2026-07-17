# Kolb Terminal — built from the official Open Terminal source (MIT
# licensed): https://github.com/open-webui/open-terminal
#
# Verified against the real upstream source at build time (see
# docs/OPEN_TERMINAL.md). Uses the full (non-slim) image because per-user
# isolation (OPEN_TERMINAL_MULTI_USER) needs `useradd`/`sudo`, which the
# slim/alpine variants deliberately omit. The upstream MIT LICENSE is
# preserved in the image at /app/LICENSE.
#
# Multi-user isolation is ON by default here: each distinct Kolb-Bot user
# (identified by the X-User-Id header the app's terminal proxy already
# sends) gets its own Linux account and home directory under /home, with
# kernel-enforced (chmod) separation between users. This is upstream's
# documented "small, trusted group" isolation model, not container-per-user
# isolation — see docs/OPEN_TERMINAL.md for that stronger option.

ARG TERMINAL_SOURCE_REF=v0.11.34

FROM python:3.12.13 AS source
ARG TERMINAL_SOURCE_REF
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git clone --depth 1 --branch "${TERMINAL_SOURCE_REF}" \
    https://github.com/open-webui/open-terminal.git . \
    && test -f LICENSE \
    && grep -qi 'MIT License' LICENSE

FROM python:3.12.13

RUN apt-get update && apt-get install -y --no-install-recommends \
    coreutils findutils grep sed gawk diffutils patch \
    less file tree bc man-db \
    curl wget net-tools iputils-ping dnsutils netcat-openbsd socat telnet \
    openssh-client rsync \
    vim nano \
    git \
    build-essential cmake make \
    jq sqlite3 \
    ffmpeg pandoc imagemagick \
    zip unzip tar gzip bzip2 xz-utils zstd \
    procps htop lsof strace \
    sudo tmux screen tini iptables ipset dnsmasq \
    ca-certificates gnupg apt-transport-https \
    libcap2-bin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=source /src .

RUN pip install --no-cache-dir . \
    && cp "$(readlink -f "$(which python3)")" /usr/local/bin/python3-ot \
    && setcap cap_setgid+ep /usr/local/bin/python3-ot \
    && sed -i "1s|.*|#!/usr/local/bin/python3-ot|" "$(which open-terminal)"

RUN useradd -m -s /bin/bash user && echo 'user ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Multi-user isolation on by default — see file header. Disable per-deploy
# with `-e OPEN_TERMINAL_MULTI_USER=false` if a single shared workspace is
# preferred instead.
ENV OPEN_TERMINAL_MULTI_USER=true \
    SHELL=/bin/bash \
    PATH="/home/user/.local/bin:${PATH}"

USER user
WORKDIR /home/user

EXPOSE 8000

LABEL org.opencontainers.image.title="Kolb Terminal" \
      org.opencontainers.image.description="Kolb-Bot terminal service, built from Open Terminal source (MIT), with per-user isolation." \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/open-webui/open-terminal"

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s \
    CMD curl --silent --fail http://localhost:8000/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--", "/app/entrypoint.sh"]
CMD ["run"]
