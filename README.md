# email-next-sst SST + Next.js example

This project shows a minimal SST app deploying a Next.js site with a single page form that accepts an email payload. Email sending is currently disabled.

Quick start

1. Install root deps and web deps:

```bash
# from repo root
npm install
cd web
npm install
```

2. Deploy with SST:

```bash
# optional: export AWS_REGION=us-east-1
npm run deploy
```

Local development

Run SST dev (root):

```bash
npm run dev
```

Notes

Note: email sending via SES was removed. You can re-enable SES and set `FROM_EMAIL` later if needed.
