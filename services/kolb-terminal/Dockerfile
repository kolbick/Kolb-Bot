# Kolb Terminal — branded build of Open Terminal (MIT licensed).
#
# Builds from the official Open Terminal source at a pinned ref, from source,
# not from a prebuilt image. The upstream MIT license and copyright notice are
# preserved in the image at /app/LICENSE; only user-visible display identity
# is changed (via KOLB_TERMINAL_* environment below and the display name the
# main app assigns to the connection).
#
# NOTE (unfinished item, see docs/OPEN_TERMINAL.md): this build file was
# authored in an environment without network access to the upstream
# repository. Verify the clone URL, the pinned TERMINAL_SOURCE_REF, and the
# install/run commands against the official Open Terminal repository on first
# deploy, and pin TERMINAL_SOURCE_REF to a release tag.

ARG TERMINAL_SOURCE_REF=main

FROM python:3.12-slim AS source

ARG TERMINAL_SOURCE_REF
RUN apt-get update && apt-get install -y --no-install-recommends git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
RUN git clone --depth 1 --branch "${TERMINAL_SOURCE_REF}" \
    https://github.com/open-webui/openterminal.git . \
    && test -f LICENSE

FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 1000 terminal

WORKDIR /app
COPY --from=source --chown=terminal:terminal /src /app

RUN pip install --no-cache-dir -e . || pip install --no-cache-dir -r requirements.txt

# Branded display identity only; upstream package internals are untouched.
ENV TERMINAL_DISPLAY_NAME="Kolb Terminal" \
    HOME=/data

USER terminal
VOLUME /data
EXPOSE 8080

LABEL org.opencontainers.image.title="Kolb Terminal" \
      org.opencontainers.image.description="Kolb-Bot terminal service, built from Open Terminal source (MIT)." \
      org.opencontainers.image.licenses="MIT"

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl --silent --fail http://localhost:8080/health || exit 1

CMD ["python", "-m", "openterminal", "--host", "0.0.0.0", "--port", "8080"]
