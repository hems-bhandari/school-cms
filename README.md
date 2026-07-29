# School CMS

A bilingual school website and content-management interface built with Next.js and Supabase.

## Requirements

- A currently supported Node.js LTS release
- A Supabase project
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- `NEXT_PUBLIC_SITE_URL` in production

Do not expose a Supabase service-role key to this application. Environment files are ignored by Git.

## Development

```bash
npm install
npm run audit:prod
npm run check
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Database setup and administrator access

Run the numbered files in `sql-migrations` in order. Migration 12 replaces the old “any authenticated user is an admin” policies with an explicit server-managed role.

Before applying migration 12 to an existing deployment, assign each administrator this Auth app metadata using a trusted server or the Supabase dashboard:

```json
{ "role": "admin" }
```

Do not put the role in `user_metadata`; users can change that field themselves. After changing app metadata, the administrator must sign out and back in so the access token contains the new claim.

Disable public user registration in Supabase Auth unless the site intentionally needs it.

The browser only receives the public Supabase URL and anonymous key. All authorization is enforced by Row Level Security in the database; the route check is defense in depth, not the primary security boundary.
