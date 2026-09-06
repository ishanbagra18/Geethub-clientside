# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of **GeetHub**:

| Version | Supported          |
| ------- | ------------------ |
| Main    | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🔒 Reporting a Vulnerability

The GeetHub team takes security seriously. If you discover a security vulnerability, please do **NOT** open a public issue. Instead, follow these steps:

### 1. Private Reporting

Send an email to **security@geethub.com** or contact the project maintainer directly via private channels with details of the vulnerability.

Please include the following details in your report:
- Type of issue (e.g. XSS, SQLi/NoSQLi, broken authentication, CORS misconfiguration, secret leak)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept payload or code (if applicable)
- Impact of the vulnerability

### 2. Response Timeline

- **Initial Response**: Within 48 hours acknowledging receipt of the report.
- **Triage & Status Update**: Within 7 business days providing an initial assessment and estimated fix timeline.
- **Resolution & Disclosure**: We will notify you once a patch has been deployed and coordinate any public disclosure.

---

## 🛡️ Security Best Practices for GeetHub Developers

When contributing to GeetHub, please adhere to these security requirements:

1. **Never Commit Secrets**
   - Do **NOT** commit `.env` files, JWT secrets, MongoDB database credentials, or Cloudinary API keys to Git repositories.
   - Always use `.env.example` templates with generic placeholder values.

2. **Authentication & Authorization**
   - Ensure all private API endpoints pass through the JWT authentication middleware (`middleware/authMiddleware.go`).
   - Validate token expiration and signature integrity.

3. **Data Input Validation & Sanitization**
   - Sanitize all user inputs before processing or persisting in MongoDB to prevent Injection attacks.
   - Escape output in React components to prevent Cross-Site Scripting (XSS).

4. **CORS & Headers**
   - Keep `CORS_ORIGINS` strictly limited to authorized client domains in production.
   - Avoid using `*` for CORS wildcard origins when handling credentialed requests.

---

Thank you for helping keep GeetHub secure! 🔒
