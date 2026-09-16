
Frontend for the OpenEnergy NZO website
=======================================

This is hosted on Cloudflare, and connects to a backend.

To run locally in a docker:
```
$ docker run --rm -it -v "$PWD":/app -w /app -p 3000:3000 node:24 bash
```

Then inside the docker setup the environment
```
# corepack enable
# yarn install --frozen-lockfile
# yarn add -D @opennextjs/cloudflare wrangler
```

After every change, build and check the site
# npx opennextjs-cloudflare build
# npx wrangler dev --ip 0.0.0.0 --port 3000

Then browse to http://localhost:3000
