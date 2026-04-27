# Production Data Migration Runbook

This runbook replaces the outdated migration/import script workflow for production.

Use this process when you need to move the live Art of Nature dataset from one MongoDB environment to another, together with the matching `uploads/` media files.

## What This Migrates

This process migrates the full production dataset exactly as-is:

- public content documents
- structured gallery and journal record collections
- admin users
- contact messages
- visit counts
- forwarding settings
- matching `uploads/` media files

This is intentionally a full-environment transfer, not a seed/import flow.

## Do Not Use These For Production Migration

The following repo scripts are not production migration tools:

- `npm run init:content`
  - Seeds or resets structured content from repo defaults.
  - It does not migrate real production data.
- `npm run import:photography`
  - One-off importer for gallery/media content.
  - It does not transfer the live database state.

## Required Tools

Install or confirm access to:

- `mongodump`
- `mongorestore`
- `rsync` or `tar`
- `ssh`
- a shell with access to both source and destination environments

## Required Inputs

Before starting, prepare these values:

- `SOURCE_MONGODB_URI`
  - Full Mongo connection string for the source environment.
- `DEST_MONGODB_URI`
  - Full Mongo connection string for the production destination.
- `PROD_SSH_USER`
  - SSH username for the production server.
- `PROD_SSH_HOST`
  - SSH hostname or IP for the production server.
- `PROD_APP_ROOT`
  - Absolute path to the deployed application root on production.
- `PROD_UPLOADS_PATH`
  - Absolute path to the production `uploads/` directory.
- `LOCAL_UPLOADS_PATH`
  - Absolute or repo-relative path to the source `uploads/` directory.

Recommended defaults for local work:

```bash
export LOCAL_UPLOADS_PATH="./uploads"
export TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
```

## Collections Covered

The migration unit is the full Mongo database plus the matching `uploads/` directory snapshot.

That includes at least these application collections:

- `aboutcontents`
- `contactcontents`
- `contactmessages`
- `craftsmanshipcontents`
- `forwardingsettings`
- `gallerycategoryrecords`
- `gallerycontents`
- `galleryitemrecords`
- `gallerysubcategoryrecords`
- `herocontents`
- `journalcontents`
- `journalpostrecords`
- `sitevisits`
- `users`

Collection names may vary by Mongo naming conventions, but the full database transfer avoids needing to select them manually.

## Pre-Migration Rules

Before the cutover:

1. Pause admin edits or put production in a short maintenance window.
2. Confirm the source dataset is the one you want to promote.
3. Confirm the source `uploads/` folder matches the database image references.
4. Confirm you can restore a backup before overwriting production.

The main risk is drift between:

- the Mongo dump timestamp
- the `uploads/` sync timestamp
- any admin edits made during the migration window

## Step 1: Backup The Source Database

Create a compressed archive from the source environment:

```bash
export SOURCE_ARCHIVE="source-${TIMESTAMP}.archive.gz"

mongodump \
  --uri="$SOURCE_MONGODB_URI" \
  --archive="$SOURCE_ARCHIVE" \
  --gzip
```

Optional integrity checks:

```bash
ls -lh "$SOURCE_ARCHIVE"
shasum -a 256 "$SOURCE_ARCHIVE"
```

## Step 2: Backup The Current Production Database

Always take a production backup before overwrite:

```bash
export PROD_BACKUP_ARCHIVE="production-backup-${TIMESTAMP}.archive.gz"

mongodump \
  --uri="$DEST_MONGODB_URI" \
  --archive="$PROD_BACKUP_ARCHIVE" \
  --gzip
```

Optional integrity checks:

```bash
ls -lh "$PROD_BACKUP_ARCHIVE"
shasum -a 256 "$PROD_BACKUP_ARCHIVE"
```

## Step 3: Back Up The Current Production Uploads Folder

If production already has data, back up the current media before overwrite.

Recommended remote archive backup:

```bash
ssh "$PROD_SSH_USER@$PROD_SSH_HOST" \
  "tar -czf \"$PROD_APP_ROOT/uploads-backup-${TIMESTAMP}.tar.gz\" -C \"$PROD_APP_ROOT\" uploads"
```

If your deployment stores uploads elsewhere, replace `"$PROD_APP_ROOT"` with the parent directory of `"$PROD_UPLOADS_PATH"`.

## Step 4: Restore The Source Database Into Production

Overwrite production with the source dump:

```bash
mongorestore \
  --uri="$DEST_MONGODB_URI" \
  --drop \
  --archive="$SOURCE_ARCHIVE" \
  --gzip
```

Notes:

- `--drop` is intentional here so production exactly matches the source database.
- Do not use this command unless you have already created the production backup.

## Step 5: Sync The Uploads Directory

Sync media so image URLs referenced in Mongo still resolve on production.

Recommended approach:

```bash
rsync -av --delete \
  "$LOCAL_UPLOADS_PATH"/ \
  "$PROD_SSH_USER@$PROD_SSH_HOST:$PROD_UPLOADS_PATH"/
```

Notes:

- The trailing slash matters. It syncs the contents of `uploads/`.
- `--delete` is intentional so production media matches the source snapshot.
- If you do not want exact deletion behavior, remove `--delete`, but the result will no longer be an exact mirror.

Fallback if `rsync` is unavailable:

```bash
tar -czf "uploads-${TIMESTAMP}.tar.gz" -C "$(dirname "$LOCAL_UPLOADS_PATH")" "$(basename "$LOCAL_UPLOADS_PATH")"
scp "uploads-${TIMESTAMP}.tar.gz" "$PROD_SSH_USER@$PROD_SSH_HOST:$PROD_APP_ROOT/"
ssh "$PROD_SSH_USER@$PROD_SSH_HOST" \
  "tar -xzf \"$PROD_APP_ROOT/uploads-${TIMESTAMP}.tar.gz\" -C \"$(dirname "$PROD_UPLOADS_PATH")\""
```

## Step 6: Restart The Production App If Needed

If your deployment platform or process manager needs a restart, do it after Mongo restore and media sync.

Examples:

```bash
ssh "$PROD_SSH_USER@$PROD_SSH_HOST" "cd \"$PROD_APP_ROOT\" && pm2 restart art-of-nature"
```

```bash
ssh "$PROD_SSH_USER@$PROD_SSH_HOST" "sudo systemctl restart art-of-nature"
```

Use your actual production restart command.

## Step 7: Validate The Migrated Site

Run this checklist against production after the cutover.

### Public Site

- Open the homepage.
- Confirm hero, about, contact, and craftsmanship content match the source environment.
- Open `/gallery`.
- Confirm categories, pieces, and piece images load correctly.
- Open `/journal`.
- Confirm article cards, covers, and body content match the source environment.
- Open at least one journal article page and confirm cover plus gallery images load.

### Admin

- Log into `/admin`.
- Confirm the admin user account exists and login works.
- Open the Gallery editor and confirm categories, pieces, and frame images are present.
- Open the Journal editor and confirm posts and images are present.
- Open the Messages tab and confirm contact messages are present if they were expected to be migrated.
- Confirm forwarding settings are still visible and correct.

### Media

- Open a few direct `/uploads/...` URLs in the browser.
- Confirm gallery images load from the production server filesystem.
- Confirm journal cover and gallery images load from production.

## Dry-Run In Staging Or Locally

Before production, validate the workflow on a temporary database.

Example:

```bash
export TEMP_RESTORE_URI="mongodb://127.0.0.1:27017/art-of-nature-restore-test"

mongorestore \
  --uri="$TEMP_RESTORE_URI" \
  --drop \
  --archive="$SOURCE_ARCHIVE" \
  --gzip
```

Then:

1. Point the app at `TEMP_RESTORE_URI`.
2. Start the server.
3. Verify homepage, gallery, journal, admin login, and uploads-backed images.

This confirms the dump itself is healthy before production overwrite.

## Rollback Procedure

If the production migration fails:

1. Stop or pause production traffic if needed.
2. Restore the pre-migration production Mongo backup:

```bash
mongorestore \
  --uri="$DEST_MONGODB_URI" \
  --drop \
  --archive="$PROD_BACKUP_ARCHIVE" \
  --gzip
```

3. Restore the production uploads backup:

```bash
ssh "$PROD_SSH_USER@$PROD_SSH_HOST" \
  "tar -xzf \"$PROD_APP_ROOT/uploads-backup-${TIMESTAMP}.tar.gz\" -C \"$PROD_APP_ROOT\""
```

4. Restart the production app if required.
5. Re-run the validation checklist.

## Operational Notes

- This project stores image references in Mongo but the image files themselves live on disk in `uploads/`.
- A database-only migration is incomplete unless production already has the exact matching media tree.
- Because gallery and journal content are mirrored into structured record collections, full-database transfer is safer than hand-selecting collections.
- Keep the dump archive and production backup archive until production has been validated and accepted.
