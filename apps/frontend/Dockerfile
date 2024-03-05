FROM public.ecr.aws/docker/library/node:18.15.0-buster-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
COPY --chown=node:node package* /usr/src/app/
COPY --chown=node:node next* /usr/src/app/
COPY --chown=node:node apps/frontend/.next /usr/src/app/.next/
COPY --chown=node:node apps/frontend/public /usr/src/app/.next/standalone/public/
COPY --chown=node:node apps/frontend/.next/static /usr/src/app/.next/standalone/apps/frontend/.next/static/
COPY --chown=node:node apps/frontend/next.config.js /usr/src/app/
USER node
WORKDIR /usr/src/app
RUN npm ci --omit=dev --ignore-scripts
ENV NEXT_TELEMETRY_DISABLED 1
EXPOSE 3000
ENV HOSTNAME "0.0.0.0"
CMD ["dumb-init", "node", "/usr/src/app/.next/standalone/apps/frontend/server.js"]
