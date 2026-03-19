## 2024-05-18 - Overly Permissive CORS
**Vulnerability:** The Vercel serverless function `api/get-style.js` was using `Access-Control-Allow-Origin: *`.
**Learning:** This exposes the backend endpoint to requests from any domain, bypassing browser same-origin policies. Attackers from unauthorized domains could abuse this endpoint to fetch map tile configurations, incurring costs on the MapTiler API key.
**Prevention:** Implement strict origin checks in serverless handlers to validate the `Origin` header against an allowed list of application URLs (e.g., the production domain and known local dev environment ports).
