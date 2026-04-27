
  # Premium Portfolio Website Design

  This is a code bundle for Premium Portfolio Website Design. The original project is available at https://www.figma.com/design/VP6KCFo5NfrWVlSVMgPC63/Premium-Portfolio-Website-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Copy `.env.example` to `.env` and update `MONGODB_URI`.

  Run `npm run dev` or `npm run start` to start the development server.

  Run `npm run build` to create a production build.

  Run `npm run preview` to preview the production build locally.

  Run `npm run dev:ssr` to start the SSR server. This requires `MONGODB_URI` to be set in your environment.

  Create/update an admin user with:

  `npm run create:user -- --user "Admin" --email "admin@example.com" --password "your-secret"`

  ## Production Data Migration

  For production-safe database migration, do not use the seed/import scripts.

  Use the dedicated runbook instead:

  [PRODUCTION_DATA_MIGRATION_RUNBOOK.md](./PRODUCTION_DATA_MIGRATION_RUNBOOK.md)
  
