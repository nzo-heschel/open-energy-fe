
Frontend for the OpenEnergy NZO website
=======================================

This is hosted on Cloudflare, and connects to a backend.

To run locally, you need a key. Copy `.dev.vars.example` to `.dev.vars` and
add the API key to the file.

Then in a docker:
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


# Setting up Cloudflare

Cloudflare builds only what is in GitHub, and the repo must contain a
Cloudflare config `wrangler.jsonc`

Then, in the Cloudflare dashboard:

1. Create the Worker. Go to Workers & Pages, Create, Workers, then Import a
   repository. Click Connect GitHub, choose the organization, and grant access
  to this repo. An org owner must approve the request.
2. Project name. Use the name field in wrangler.jsonc.
   Cloudflare warns if they differ.
3. Build configuration: choose the proper branch. Build command `npx
   opennextjs-cloudflare build`. Deploy command `npx opennextjs-cloudflare
   deploy`. Root directory left as `/`.
4. Node version. Add a build variable `NODE_VERSION` with value 24, unless you
   already committed a .nvmrc, which Cloudflare reads on its own.
5. The secret. In the same form, under Variables and Secrets, add
   `OPEN_ENERGY_API_KEY` as a secret, not a plain variable. Without it the
   first deploy builds fine but every chart shows the 503 from the proxy.
6. Save and Deploy. The first build takes a few minutes. Cloudflare asks you to
   pick a workers.dev subdomain for the account, and the site comes up at
   open-energy-fe.<subdomain>.workers.dev.

## After the first successful deploy:

- Previews. Open the Worker, then Settings, Build, Branch control, and enable
  non-production branch builds. Each branch then gets a stable URL of the form
  `<branch>-open-energy-fe.<subdomain>.workers.dev`, and the GitHub app
  comments it on pull requests. The secret is shared with previews automatically.
- Members. Manage Account, Members, Invite. Workers Admin is a reasonable role
  for developers.
- Domain. Settings, Domains & Routes, Add, Custom domain. Only possible once
  the domain's DNS zone is in this account.

