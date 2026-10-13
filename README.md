# Last Passion Clothing Website

The public source for [lastpassionclothing.co.za](https://lastpassionclothing.co.za/), a clothing storefront for Last Passion.

## Developer

Designed and developed by **Musa Mgijima**, under **Digilayn**.

This was my first website published online.

- Developer website: [digilayn.co.za](https://digilayn.co.za/)
- Developer GitHub: [usrmusa](https://github.com/usrmusa)
- Public source: [usrmusa/web-lastpassion](https://github.com/usrmusa/web-lastpassion)

This credit describes the website development. The existing Last Passion brand story and founder attribution remain on the website.

## Features

- Product catalogue and collection filters.
- Shopping bag saved in the browser.
- Customer registration, sign-in and profile pages.
- Orders prepared for WhatsApp, with manual payment coordination.
- Brand story and support information.
- An administration interface for store content.

## Technology

HTML, CSS and JavaScript, with Firebase services. The browser loads Firebase modules from Google's CDN. Product and site-branding information are loaded from Firestore.

## Structure

- `index.html`: storefront homepage.
- `store/collections.html`: product collections.
- `company/support.html`: brand story and contact information.
- `authentication/`: customer account pages and supporting code.
- `admin.html`: store administration interface.
- `core/FirebaseService.js`: shared Firebase setup.
- `script.js`: shopping bag, WhatsApp order preparation and developer console credit.
- `styles.css`, `img/` and `favicon/`: website styling and visual assets.

## Local Preview

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://127.0.0.1:8000/). Firebase-backed features still require network access and the appropriate permissions. A local preview does not create a separate Firebase environment.

## Public Source

This repository is public intentionally. Do not commit credentials, service-account keys, access tokens or private customer records.
