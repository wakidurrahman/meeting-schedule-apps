---
name: 🐛 Bug Report
about: Report a bug or issue with the Meeting Scheduler App
title: '[BUG] '
labels: ['bug']
assignees: ''
---

## 🐛 Bug Report

### 📝 Describe the bug

A clear and concise description of what the bug is.

### 🔄 To Reproduce

Steps to reproduce the behavior:

1. **Navigate to**: '...'
2. **Click on**: '...'
3. **Fill in**: '...'
4. **Submit/Execute**: '...'
5. **See error**: '...'

### 🎯 Expected behavior

A clear and concise description of what you expected to happen.

### 💥 Actual behavior

What actually happened instead.

### 📱 Screenshots/Videos

If applicable, add screenshots or screen recordings to help explain your problem.

### 🖥️ Environment

**Client Environment:**

- Browser: [e.g., Chrome 120.0, Firefox 121.0, Safari 17.0]
- Device: [e.g., Desktop, iPhone 15, Samsung Galaxy S23]
- Screen Resolution: [e.g., 1920x1080, 390x844]
- Operating System: [e.g., Windows 11, macOS 14.6, iOS 17.2]

**Server Environment (if applicable):**

- Node.js Version: [e.g., 22.14.0]
- npm Version: [e.g., 10.x]
- Database: [e.g., MongoDB 7.0.0]
- Environment: [e.g., Development, Staging, Production]

### 📋 Component/Area

Which part of the application is affected?

#### Frontend Issues

- [ ] **Authentication** (Login, Register, Logout)
- [ ] **Dashboard** (Main dashboard view)
- [ ] **Meetings** (Meeting creation, editing, deletion)
- [ ] **Events** (Event management, booking)
- [ ] **User Profile** (Profile management, settings)
- [ ] **Navigation** (Routing, menu, breadcrumbs)
- [ ] **Forms** (Form validation, submission, error handling)
- [ ] **UI Components** (Buttons, inputs, modals, tables)
- [ ] **Responsive Design** (Mobile, tablet layout issues)

#### Backend Issues

- [ ] **GraphQL API** (Queries, mutations, subscriptions)
- [ ] **Authentication** (JWT, session management)
- [ ] **Database** (Data persistence, queries)
- [ ] **Server Performance** (Slow responses, timeouts)
- [ ] **Error Handling** (Server errors, validation)

#### Integration Issues

- [ ] **Client-Server Communication** (API calls, data sync)
- [ ] **Real-time Updates** (WebSocket, live data)
- [ ] **External Services** (Third-party integrations)

### 🔍 Error Details

**Console Errors (Browser DevTools):**

```javascript
// Paste any console errors here
```

**Server Logs (if applicable):**

```bash
# Paste relevant server logs here
```

**GraphQL Errors (if applicable):**

```json
{
  "errors": [
    {
      "message": "Error message here",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

**Network Requests (if applicable):**

```
Request URL:
Request Method:
Status Code:
Response:
```

### 📊 Severity

How severe is this bug?

- [ ] **🔴 Critical** (App crashes, data loss, security vulnerability)
- [ ] **🟡 High** (Major feature broken, significant user impact)
- [ ] **🟢 Medium** (Feature partially working, workaround available)
- [ ] **🔵 Low** (Minor UI issue, cosmetic problem)

### 🔄 Frequency

How often does this bug occur?

- [ ] **Always** (100% reproduction rate)
- [ ] **Frequently** (>75% of the time)
- [ ] **Sometimes** (25-75% of the time)
- [ ] **Rarely** (<25% of the time)
- [ ] **Once** (Cannot reproduce)

### 👥 User Impact

Who is affected by this bug?

- [ ] **All Users** (Everyone experiences this issue)
- [ ] **Specific User Roles** (Only certain user types)
- [ ] **Specific Browsers/Devices** (Platform-specific issue)
- [ ] **New Users** (Affects registration/onboarding)
- [ ] **Existing Users** (Affects current functionality)

### 📱 Workaround

If you found a way to work around this issue, please describe it:

```
Steps to work around the issue:
1. ...
2. ...
3. ...
```

### 🔗 Additional Context

- **Related Issues**: Links to similar issues or bug reports
- **Recent Changes**: Did this start happening after a recent update?
- **Data Context**: Any specific data that triggers the issue?
- **User Permissions**: Does this affect users with specific permissions?

### 🧪 Testing Information

**Has this been tested in different environments?**

- [ ] **Development Environment** (Works/Doesn't work)
- [ ] **Staging Environment** (Works/Doesn't work)
- [ ] **Production Environment** (Works/Doesn't work)

**Browser Testing:**

- [ ] **Chrome** (Works/Doesn't work)
- [ ] **Firefox** (Works/Doesn't work)
- [ ] **Safari** (Works/Doesn't work)
- [ ] **Edge** (Works/Doesn't work)
- [ ] **Mobile Safari** (Works/Doesn't work)
- [ ] **Chrome Mobile** (Works/Doesn't work)

### 📈 Business Impact

How does this bug affect the business or users?

- [ ] **Prevents user registration/login**
- [ ] **Blocks core meeting functionality**
- [ ] **Affects data accuracy/integrity**
- [ ] **Creates poor user experience**
- [ ] **Security or privacy concern**
- [ ] **Performance degradation**

---

### 📝 For Maintainers

**Investigation Priority**:

- [ ] **P0** (Drop everything, fix immediately)
- [ ] **P1** (Fix within 24 hours)
- [ ] **P2** (Fix within 1 week)
- [ ] **P3** (Fix in next release)
- [ ] **P4** (Fix when convenient)

**Likely Root Cause**:

- [ ] **Frontend Logic** (React/TypeScript issue)
- [ ] **Backend Logic** (GraphQL/Node.js issue)
- [ ] **Database** (MongoDB/Mongoose issue)
- [ ] **Authentication** (JWT/Auth middleware issue)
- [ ] **Validation** (Zod/Form validation issue)
- [ ] **Environment** (Configuration/deployment issue)
- [ ] **Third-party** (External service/dependency issue)

**Requires**:

- [ ] **Frontend Developer** (React/TypeScript expertise)
- [ ] **Backend Developer** (Node.js/GraphQL expertise)
- [ ] **Full-Stack Developer** (End-to-end debugging)
- [ ] **DevOps Support** (Infrastructure/deployment)
- [ ] **Database Analysis** (MongoDB/query optimization)

**Testing Requirements**:

- [ ] **Manual Testing** (Reproduce and verify fix)
- [ ] **Automated Testing** (Add test cases to prevent regression)
- [ ] **Cross-browser Testing** (Verify fix across browsers)
- [ ] **Performance Testing** (Ensure no performance regression)
- [ ] **Security Testing** (If security-related)
