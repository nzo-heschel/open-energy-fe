Frontend for the OpenEnergy NZO website
=======================================

A Next.js 15 (App Router) site. Pages are static or client-rendered; the only
server-side code is three small route handlers under `app/api/`:

- `backend/[...path]` proxies data requests to the Open Energy backend and
  attaches the API key, so the key never reaches the browser and the backend's
  CORS allowlist does not matter for the site.
- `submit-contact` and `newsletter-track` forward form submissions to Google
  Apps Script.

Production is hosted on AWS Amplify.


Local development
-----------------

### 1. Get an API key

Data requests need a backend API key. Each developer uses their own.
Copy `.env.example` to `.env.local` and paste the key in. `.env.local` is
git-ignored.

Without a key the site still runs, but every chart stays empty and the
browser console shows a 503 from `/api/backend/...`.

### 2. Run in Docker (recommended)

Nothing needs to be installed on the host apart from Docker.

```
docker run --rm -it -v "$PWD":/app -w /app -p 3000:3000 node:24 bash
```

Inside the container:

```
yarn install --frozen-lockfile
yarn dev -H 0.0.0.0
```

Then open <http://localhost:3000>. The dev server reloads on file changes.
The `-H 0.0.0.0` flag is required inside Docker; without it the server binds
to the container's loopback and the browser reports a reset connection.

The `node:24` image ships with yarn. If `yarn` is missing, run
`corepack enable` first.

### 3. Run directly on the host

Requires Node 24 (see `.nvmrc`) and yarn 1.x:

```
yarn install --frozen-lockfile
yarn dev
```

### Production-like check

`next dev` is forgiving. Before opening a pull request, confirm the
production build succeeds and the pages behave the same:

```
yarn build
yarn start -H 0.0.0.0     # drop -H when not in Docker
```

This is the same `yarn build` Amplify runs.


Deploying on AWS Amplify
------------------------

Amplify builds every push to the connected branches using `amplify.yml` in
this repo. The build spec pins Node via `.nvmrc`, installs with yarn, copies
the API key into `.env.production` so the proxy route can read it at runtime,
and hands the `.next` output to Amplify's Next.js runtime (Lambda behind
CloudFront).

### First-time setup

1. In the AWS console open **Amplify**, choose **Create new app**, then
   **GitHub**. Authorize the Amplify GitHub app for the organization and
   grant it this repository. An org owner may need to approve.
2. Pick the production branch (`main`). Amplify detects Next.js and reads
   `amplify.yml`; leave the generated build settings as they are.
3. Under **Environment variables** add `OPEN_ENERGY_API_KEY` with the site's
   backend key. This is the only variable the app needs. If it is missing the
   build still succeeds but every chart shows a 503.
4. Save and deploy. The first build takes a few minutes. The site comes up at
   `https://<branch>.<app-id>.amplifyapp.com`.

Adding a server-side variable later means adding it in the console **and** to
the `grep` pattern in `amplify.yml`, otherwise the Lambda never sees it.

### Pull request previews

Under the app, go to **Hosting**, then **Previews**, and enable pull request
previews for the production branch. Each PR then gets its own environment and
the URL is posted on the PR. Previews reuse the environment variables of the
branch they target.

### Custom domain

Under **Hosting**, **Custom domains**, add the domain. Amplify shows the DNS
records to create: one CNAME for certificate validation and one CNAME per
hostname pointing at a `cloudfront.net` address.

If Cloudflare fronts the domain:

- The certificate validation record must be **DNS only** (grey cloud) or the
  certificate never issues.
- Once Amplify reports the domain as available, switch the hostname records to
  **Proxied** (orange cloud).
- Set Cloudflare's SSL mode to **Full (strict)**. Flexible mode causes a
  redirect loop with Amplify.
- Do not rewrite the Host header; Amplify needs the original hostname.

The `amplifyapp.com` address keeps working and bypasses Cloudflare.

### Team access

There are no per-seat charges. Anyone with an IAM role in the AWS account that
allows Amplify access can manage the app. Triggering a build only needs push
access on GitHub.

### Rotating the API key

Change the value under **Environment variables** and redeploy the branch. The
key is baked into the server bundle at build time, so a rebuild is required.
