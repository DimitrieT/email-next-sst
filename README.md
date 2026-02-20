# email-next-sst SST + Next.js example

![alt text](image.png)

This project shows a minimal SST app deploying a Next.js site with a single page form that accepts an email payload. Email sending is currently disabled only because we need a domain verification to be able to send emails.

setup

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
npm run deploy
```

Local development

Run SST dev (root):

```bash
npm run dev
```

Notes

Note: you can also use the github pipeline to push new features that would deploy the app
