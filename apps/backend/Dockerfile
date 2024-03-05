FROM public.ecr.aws/docker/library/node:18.15.0-buster-slim
ENV NODE_ENV=development
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init openssl python3 build-essential

COPY --chown=node:node ./dist/apps/backend/ /usr/src/app/
COPY --chown=node:node package* /usr/src/app/

USER node
WORKDIR /usr/src/app
RUN npm ci --omit=dev --ignore-scripts

EXPOSE 4000
ENV HOSTNAME "0.0.0.0"
CMD ["dumb-init", "node", "./main.js"]
