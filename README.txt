PRAKSH COLLECTION REWARDS — V5

WHAT CHANGED
- Fixed the Supabase config/module loading bug.
- Customer UUIDs are no longer trusted from browser JavaScript.
- Customer login now creates a short-lived server-side session token stored only as a hash in Postgres.
- Customer API calls are handled by the Supabase Edge Function customer-api.
- Customer bill images are uploaded by the Edge Function with service_role; there is no public Storage upload policy.
- Customer login is rate-limited.
- Reward redemption uses a PostgreSQL advisory transaction lock to prevent double-spending during concurrent requests.
- Server-side bill, amount, date, photo-path and reward validation added.
- Failed bill database inserts remove the uploaded image.
- Loyalty points are calculated as floor(amount / 100) × 5 (for example ₹99 = 0, ₹100 = 5, ₹999 = 45, ₹1000 = 50).
- Local date is used instead of UTC for the browser default date.
- Theme preference persists in localStorage.
- Owner dashboard uses protected Supabase Auth + owner_users checks and signed private image URLs.
- Removed node_modules and unused Node/Express package files from the deployable ZIP.

SETUP
1. Create/open your Supabase project.
2. Open SQL Editor and run supabase-setup.sql. This also migrates existing bills to the new point formula.
3. Create the owner account in Authentication > Users.
4. Copy the owner user's UUID and run:
   insert into public.owner_users(user_id) values('YOUR-OWNER-UUID') on conflict do nothing;
5. Deploy the Edge Function from this folder before testing customer login. If the function is not deployed, the browser cannot connect to the customer API:
   supabase functions deploy customer-api
   (Use the Supabase CLI. The function automatically receives SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the project runtime.)
6. Keep the publishable/anon key in supabase-config.js. NEVER put a service_role/secret key there.
7. Upload the static website files (index.html, owner-login.html, owner.html, app.js, owner-login.js, owner.js, common.js, style.css, supabase-config.js) to Cloudflare Pages, Netlify, Vercel, or another static host.
8. The `supabase/` folder is deployment source for the Edge Function and SQL setup; it is not required to be served publicly as website content.

CUSTOMER SECURITY NOTE
The simple mobile + PIN experience is retained, but customer data/actions now require a server-issued session token. Sessions expire after 7 days. Login attempts are rate-limited. For the strongest possible identity assurance, phone OTP authentication can still be added later.

OWNER SECURITY
Owner access uses Supabase Auth. The database checks owner_users for the authenticated user. Do not share the owner password and do not place it in website source code.
