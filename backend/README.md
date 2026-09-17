# PhoneDir Backend

PHP + MySQL API for the PhoneDir mobile app. Infrastructure pattern:
**DuckDNS (subdomain) + Freehostia (PHP/MySQL hosting) + Bearer-token auth**,
tested with Postman.

> The PHP itself is **DNS-agnostic** — nothing in it references DuckDNS,
> FreeDNS, or any domain. Switching DNS providers only changes which hostname
> resolves to your Freehostia space and the app's `BASE_URL`.

## Files

| File | Purpose |
|---|---|
| `phones.php` | The API endpoint (GET list / GET by id / create / update / delete) |
| `connection.php` | PDO database connection — **edit the credentials** |
| `auth.php` | Bearer-token check (token must match the app) |
| `.htaccess` | Forwards the `Authorization` header, forces HTTPS, protects sensitive files |
| `schema.sql` | `phones` table + optional seed rows |

## API contract

The app posts **multipart form-data** (not a JSON body) and tunnels update/delete
through POST, because shared hosting can't route native PUT/DELETE reliably.

| Action | Request | Success |
|---|---|---|
| List all | `GET phones.php` | `200` JSON **array** |
| Get one | `GET phones.php?id=123` | `200` JSON **object** (`404` if missing) |
| Create | `POST` fields: `name, brand, model, price, description, image_url` | `201` |
| Update | `POST` fields: `_method=PUT, id, …` | `200` |
| Delete | `POST` fields: `_method=DELETE, id` | `200` |

Every request must send `Authorization: Bearer dwyn-students-api-8f92k3`
(the same token as `src/services/api.ts`). `price` is always returned as a JSON
**number**.

---

## ⚠️ Read this first: DuckDNS + shared hosting

DuckDNS is **not** a drop-in replacement for FreeDNS. FreeDNS could delegate a
subdomain to a host; **DuckDNS only lets you set one thing — the IPv4 address
(an A record).** To serve your API at `yourname.duckdns.org` from Freehostia you must:

1. Point the DuckDNS A record at **Freehostia's server IP**, and
2. **Add `yourname.duckdns.org` as a hosted domain inside Freehostia's control panel**
   so its Apache serves your files for that hostname.

Step 2 is the make-or-break. Some shared hosts accept a domain by simple A-record
pointing; others insist you change the domain's **nameservers** to theirs — which
DuckDNS **cannot** do. If Freehostia rejects the duckdns subdomain, see
**Fallback** at the bottom.

---

## Setup

### Part A — DuckDNS subdomain
1. Go to <https://www.duckdns.org> and sign in (GitHub / Google / etc.).
2. Under **domains**, type a name (e.g. `dwynphonedir`) and click **add domain**.
   You now own `dwynphonedir.duckdns.org`.
3. Leave the IP blank for now — you'll set it in Part C once you know Freehostia's IP.

### Part B — Database (Freehostia)
1. In the Freehostia control panel, open **MySQL Databases** and create a new
   database + user, and attach the user to the database.
2. Open **phpMyAdmin**, select the new database, go to the **SQL** tab, paste the
   contents of `schema.sql`, and run it. Confirm the `phones` table + seed rows in **Browse**.
3. Edit `connection.php` with the real host / dbname / user / pass (from the
   **Databases** tab). Host is almost always `localhost`.

### Part C — Point DuckDNS at Freehostia
1. **Find Freehostia's server IP.** Easiest: open a terminal and run
   `ping your-existing-freehostia-subdomain` (or check **Server Information** in the
   panel). Note the IPv4 address.
2. In DuckDNS, put that IP in the **current ip** box for your domain and click
   **update ip**.
3. In the Freehostia panel, open **Hosted Domains / Domain Manager** and **add**
   `dwynphonedir.duckdns.org`, pointing it to the web folder you'll upload to.
   - If the panel demands nameserver changes and won't accept A-record pointing,
     stop here and use the **Fallback**.
4. Wait for DNS to propagate (a few minutes to ~2 hours). Test by visiting
   `http://dwynphonedir.duckdns.org` in a browser.

### Part D — Upload the API
Upload to the domain's web root (use the File Manager **Host shortcuts** dropdown
to pick the correct domain folder first):
- `phones.php`
- `connection.php`
- `auth.php`
- `.htaccess`

### Part E — Point the app at the API
In `src/services/api.ts`, set:
```ts
const BASE_URL = 'https://dwynphonedir.duckdns.org/phones.php';
```
Use **`https://`** directly — the `.htaccess` redirects HTTP→HTTPS with a 301, and a
redirect can drop the `Authorization` header or mangle a POST body.

---

## Test with Postman (before touching the app)
- Use the **Desktop Agent** (bottom-left of Postman), **not** the Cloud Agent — the
  Cloud Agent's proxy strips the `Authorization` header and you'll get spurious `401`s.
- `GET https://dwynphonedir.duckdns.org/phones.php` with header
  `Authorization: Bearer dwyn-students-api-8f92k3` → expect `200` + a JSON array.
- `POST` the same URL with a **form-data** body (`name`, `brand`, `model`, `price`)
  and the auth header → expect `201`.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Browser can't reach `*.duckdns.org` | DNS not propagated yet, or the subdomain isn't added in Freehostia's panel |
| `401` with a correct token | `Authorization` header dropped — confirm the `.htaccess` passthrough is present; in Postman use the Desktop Agent |
| `ERR_EMPTY_RESPONSE` | PHP fatal error or the HTTPS rule misbehaving behind the proxy — temporarily remove `.htaccess` to isolate |
| `Database connection failed` | placeholder credentials still in `connection.php`, or DB/user not created yet |
| `404 Object not found` on the file | uploaded to the wrong domain folder in File Manager |
| App shows an empty catalog | the app currently treats network errors as "empty" — check the endpoint in a browser/Postman first |

## Fallback — if Freehostia won't host the DuckDNS subdomain
Shared hosting + DuckDNS doesn't always cooperate. Two clean options:
1. **Skip DuckDNS.** Use the subdomain Freehostia already gives you (e.g.
   `yoursite.freehostia.com`) as the API domain and set `BASE_URL` to that. The
   backend is identical — only the hostname differs.
2. **Host where DuckDNS fits.** DuckDNS is designed to point at a machine whose IP
   you control (a VPS, or your own PC running Apache + PHP + MySQL). If the
   assignment allows it, that pairing is the natural one.
