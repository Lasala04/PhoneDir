# PhoneDir Backend

PHP + MySQL API for the PhoneDir mobile app, following the AT3 infrastructure
pattern (FreeDNS + Freehostia + PHP/MySQL, Bearer-token auth).

## Files

| File | Purpose |
|---|---|
| `phones.php` | The API endpoint (GET list / GET by id / create / update / delete) |
| `connection.php` | PDO database connection — **edit the credentials** |
| `auth.php` | Bearer-token check (token must match the app) |
| `.htaccess` | Forwards the `Authorization` header, forces HTTPS, protects sensitive files |
| `schema.sql` | `phones` table + optional seed rows |

## API contract

The app posts **multipart form-data** (not a JSON body), and tunnels update/delete
through POST because shared hosting can't route native PUT/DELETE reliably.

| Action | Request | Success |
|---|---|---|
| List all | `GET phones.php` | `200` JSON **array** |
| Get one | `GET phones.php?id=123` | `200` JSON **object** (`404` if missing) |
| Create | `POST` fields: `name, brand, model, price, description, image_url` | `201` |
| Update | `POST` fields: `_method=PUT, id, …` | `200` |
| Delete | `POST` fields: `_method=DELETE, id` | `200` |

Every request must send: `Authorization: Bearer dwyn-students-api-8f92k3`
(the same token as `src/services/api.ts`). `price` is always returned as a JSON
**number**, so the app never has to guess whether a `DECIMAL` came back as a string.

## Deploy steps (Freehostia)

1. **Database:** in phpMyAdmin, create the DB, then run `schema.sql` (SQL tab).
2. **Credentials:** edit `connection.php` with the real host/dbname/user/pass from
   Freehostia's *Databases* tab.
3. **Upload:** put `phones.php`, `connection.php`, `auth.php`, and `.htaccess`
   in your domain's public folder (use the File Manager *Host shortcuts* dropdown
   to select the correct domain root before uploading).
4. **Point the app at it:** in `src/services/api.ts`, set
   ```ts
   const BASE_URL = 'https://YOUR-SUBDOMAIN.example.com/phones.php';
   ```
   Use **`https://`** directly — the `.htaccess` redirects HTTP→HTTPS with a 301,
   and a redirect can drop the `Authorization` header / mangle a POST body.

## Test with Postman

- Use the **Desktop Agent** (bottom-left), not the Cloud Agent — the Cloud Agent's
  proxy strips the `Authorization` header and you'll get spurious `401`s.
- `GET` the endpoint with an `Authorization: Bearer …` header → expect `200` + JSON.
- `POST` with a form-data body (`name`, `brand`, `model`, `price`) → expect `201`.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `401` with a correct token | `Authorization` header dropped — confirm the `.htaccess` passthrough is present; in Postman use the Desktop Agent |
| `ERR_EMPTY_RESPONSE` | PHP fatal error or the HTTPS rule misbehaving behind the proxy — temporarily remove `.htaccess` to isolate |
| `Database connection failed` | placeholder credentials still in `connection.php` |
| `404 Object not found` on the file | uploaded to the wrong domain folder in File Manager |
| App shows an empty catalog | the app currently treats network errors as "empty" — check the endpoint in a browser/Postman first |
