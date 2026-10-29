# OmniScope

A public SPHEREx sky comparison tool for the NASA Space Apps Planet X challenge. The image pairs are real NASA/IPAC FITS observations. The solar system uses NASA JPL reference positions. Quick-look change markers are unconfirmed candidates.

## Publish with Cloudflare Pages

1. In the Cloudflare dashboard, open **Workers & Pages > Create application > Pages > Connect to Git**. Connect `ANSHUMANTheOne/beacon-of-unity`.
2. Choose **no framework preset**. Set **Root directory** to `omniscope`, leave **Build command** empty, and set **Build output directory** to `public`. Select the `main` branch, then deploy.
3. Open the generated `*.pages.dev` URL. Future commits to `main` deploy automatically.

The `functions/api/` routes proxy live NASA/IPAC SPHEREx archive requests and NASA JPL Horizons requests. Git integration is required for Pages to compile these functions; deploying only the static `public/` files would break live searches.

SPHEREx, AllWISE, 2MASS, and JPL credits remain in the application because they identify the scientific data sources.
