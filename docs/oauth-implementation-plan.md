# OAuth Authentication Implementation Plan

## Overview
Replace magic link authentication with Social OAuth (Google, GitHub, Microsoft, Apple, Facebook) while maintaining FocusRails' minimalist design and privacy promise.

## Requirements Summary
- **Auth Method:** Social OAuth only (no email/password)
- **Providers:** Google, GitHub, Microsoft, Apple, Facebook
- **Key Constraint:** Maintain privacy promise (no analytics, tracking, or social features)
- **Design:** Minimalist, matching existing LoginForm aesthetic

---

## Phase 1: Supabase OAuth Configuration

### 1.1 Configure OAuth Providers in Supabase Dashboard

Navigate to: **Supabase Dashboard → Authentication → Providers**

**For each provider, configure:**

1. **Google OAuth:**
   - Enable Google provider in Supabase
   - Create OAuth 2.0 credentials in Google Cloud Console
   - Authorized redirect URI: `https://zkpqhkcipmfdeholwxkz.supabase.co/auth/v1/callback`
   - Scopes: `email`, `profile`

2. **GitHub OAuth:**
   - Enable GitHub provider
   - Create OAuth App in GitHub Developer Settings
   - Callback URL: `https://zkpqhkcipmfdeholwxkz.supabase.co/auth/v1/callback`
   - Scopes: `user:email`

3. **Microsoft OAuth:**
   - Enable Microsoft provider
   - Register app in Azure AD Portal
   - Redirect URI: `https://zkpqhkcipmfdeholwxkz.supabase.co/auth/v1/callback`
   - Scopes: `openid`, `email`, `profile`

4. **Apple OAuth:**
   - Enable Apple provider
   - Create Service ID in Apple Developer Portal
   - Return URLs: `https://zkpqhkcipmfdeholwxkz.supabase.co/auth/v1/callback`
   - Scopes: `email`, `name`

5. **Facebook OAuth:**
   - Enable Facebook provider
   - Create Facebook App in Meta for Developers
   - Valid OAuth Redirect URIs: `https://zkpqhkcipmfdeholwxkz.supabase.co/auth/v1/callback`
   - Permissions: `email`, `public_profile`

**Site URL Configuration:**
- Site URL: `http://localhost:5173` (dev) / `https://focusrails.com` (prod)
- Add both development and production URLs to allowed redirect URLs

**Optional:** Disable magic link provider after OAuth is working

### 1.2 Update Environment Variables

**File:** `.env`

Add:
```env
VITE_AUTH_REDIRECT_URL=http://localhost:5173/board
```

**File:** `.env.example`

Update with OAuth-specific environment variable documentation.

---

## Phase 2: Create New OAuth Components

### 2.1 Create OAuthLogin Component

**File:** `src/components/auth/OAuthLogin.tsx` (NEW)

**Purpose:** Replace LoginForm with OAuth provider selection screen

**Structure:**
```
OAuthLogin
├── Privacy Promise Section (reuse from LoginForm.tsx)
├── OAuth Buttons Container
│   ├── Continue with Google (white bg, Google logo)
│   ├── Continue with GitHub (dark bg, GitHub logo)
│   ├── Continue with Microsoft (white bg, MS logo)
│   ├── Continue with Apple (black bg, Apple logo)
│   └── Continue with Facebook (blue bg, FB logo)
├── Error Display (OAuth errors)
└── How It Works Section (reuse from LoginForm.tsx)
```

**Design Specs:**
- Each button: Full width, 48px height, rounded-lg
- Provider logo left-aligned, text centered
- Consistent spacing (space-y-3 between buttons)
- Loading state: Disable all buttons, show spinner on clicked button
- Error banner: Red alert above buttons

**Button Colors:**

| Provider  | Background | Text Color | Hover |
|-----------|------------|------------|-------|
| Google    | `#FFFFFF` | `#1F2937` | `#F9FAFB` |
| GitHub    | `#24292E` | `#FFFFFF` | `#2F363D` |
| Microsoft | `#FFFFFF` | `#1F2937` | `#F9FAFB` |
| Apple     | `#000000` | `#FFFFFF` | `#1F2937` |
| Facebook  | `#1877F2` | `#FFFFFF` | `#166FE5` |

**Props:**
```typescript
interface OAuthLoginProps {
  onError?: (error: string) => void;
  initialError?: string;
}
```

**Provider Icons:**
- Option 1: Use Lucide React icons (already in project) - `<Github />` for GitHub
- Option 2: Create `src/components/auth/provider-icons.tsx` with custom SVGs (20x20px)

---

## Phase 3: Update Authentication Hook

### 3.1 Modify useAuth Hook

**File:** `src/hooks/useAuth.ts`

**Changes:**

1. **Remove:** `signInWithEmail` function (lines 52-67)

2. **Add:** `signInWithOAuth` function:

```typescript
const signInWithOAuth = async (provider: Provider) => {
  setError(null);
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/board`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    setError(error);
    return { error };
  }

  return { error: null };
};

type Provider = 'google' | 'github' | 'azure' | 'apple' | 'facebook';
```

3. **Update return object:**
```typescript
return {
  user,
  loading,
  error,
  signInWithOAuth,  // Replace signInWithEmail
  signOut,
  isAuthenticated: !!user,
};
```

4. **Enhance error handling:**

Add user-friendly error messages for OAuth-specific errors:
```typescript
const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Sign in was cancelled. Please try again.",
  unauthorized_client: "This sign-in method is temporarily unavailable.",
  server_error: "Service temporarily unavailable. Please try another provider.",
  default: "Authentication failed. Please try again.",
};
```

**Keep unchanged:**
- Session initialization (lines 36-50)
- URL hash error parsing (lines 12-31) - works for OAuth errors too
- `signOut` function (lines 69-79)

---

## Phase 4: Update Main App Component

### 4.1 Modify App.tsx

**File:** `src/App.tsx`

**Changes:**

1. **Remove imports:**
```typescript
// DELETE
import { MagicLinkSent } from "./components/auth/MagicLinkSent";
```

2. **Add imports:**
```typescript
import { OAuthLogin } from "./components/auth/OAuthLogin";
```

3. **Remove state (lines 27-29):**
```typescript
// DELETE
const [showMagicLinkSent, setShowMagicLinkSent] = useState(false);
const [sentEmail, setSentEmail] = useState("");
```

4. **Update useAuth destructuring (line 27):**
```typescript
// CHANGE FROM:
const { user, loading: authLoading, signInWithEmail, error: authError } = useAuth();

// TO:
const { user, loading: authLoading, signInWithOAuth, error: authError } = useAuth();
```

5. **Delete handleLogin function (lines 65-74)**

6. **Replace auth rendering logic (lines 349-368):**
```typescript
// REPLACE:
if (!user) {
  if (showMagicLinkSent) {
    return <MagicLinkSent ... />;
  }
  return <LoginForm ... />;
}

// WITH:
if (!user) {
  return (
    <OAuthLogin
      initialError={authError?.message}
    />
  );
}
```

### 4.2 Delete Obsolete Components

**Files to remove:**
- `src/components/auth/MagicLinkSent.tsx` - DELETE (no longer needed)
- `src/components/auth/LoginForm.tsx` - DELETE (replaced by OAuthLogin)

---

## Phase 5: OAuth Flow Implementation

### 5.1 Authentication Flow

```
User clicks "Continue with Google"
  ↓
signInWithOAuth('google')
  ↓
Supabase redirects to Google OAuth
  ↓
User authenticates with Google
  ↓
Google redirects to: /board?access_token=...&refresh_token=...
  ↓
Supabase SDK detects tokens (detectSessionInUrl: true)
  ↓
Session established, user logged in
  ↓
Board renders with user data
```

**Key Points:**
- Supabase SDK automatically handles OAuth redirect flow
- Session tokens stored in localStorage (persistSession: true)
- Auto-refresh enabled (autoRefreshToken: true)
- No code changes needed in supabase.ts - already configured correctly

### 5.2 Error Handling

**OAuth Error Scenarios:**

| Error | User Message | Recovery |
|-------|-------------|----------|
| `access_denied` | "Sign in was cancelled. Please try again." | Return to OAuthLogin |
| `invalid_request` | "Authentication error. Please try again." | Retry same provider |
| `unauthorized_client` | "This sign-in method is temporarily unavailable." | Try different provider |
| `server_error` | "Service temporarily unavailable. Please try another provider." | Try different provider |

**Implementation:**
- Errors automatically captured from URL hash (existing code in useAuth.ts)
- Display error banner in OAuthLogin component
- Clear error on retry

---

## Phase 6: Documentation Updates

### 6.1 Create OAuth Setup Guide

**File:** `docs/oauth-implementation-plan.md` (NEW)

**Contents:**
- Detailed Supabase configuration steps for each provider
- Environment variable setup
- Testing procedures
- Troubleshooting guide
- Security considerations
- Migration strategy from magic link

### 6.2 Update Visual Specification

**File:** `docs/focusrails-visual-spec.md`

**Section to update:** "Onboarding & Login" (lines 107-133)

**Changes:**

1. Update authentication method description:
```markdown
## 1. Onboarding & Login

* **Flow:**

  1. **Welcome Screen:** Brief introduction to FocusRails ("Get Focused, Stay Uncluttered").

  2. **Privacy Promise:** Concise, plain-language statement emphasizing no analytics, tracking, or social features; data stored only for your personal use.

  3. **OAuth Provider Selection:**
    * User chooses from 5 secure sign-in options:
      * Google
      * GitHub
      * Microsoft
      * Apple
      * Facebook
    * Single-click authentication—no password required.
    * Providers only used for secure identity verification.

  4. **How It Works:** Visual walkthrough or guided sheet:
    * Board structure (NOW, Today, Parking Lot)
    * Focus Timer basics
    * Meeting Mode

  5. **Authentication:**
    * User clicks preferred OAuth provider button
    * Redirects to provider's secure login page
    * After authentication, returns to FocusRails board
    * Session persists across browser restarts

  6. **Skippable Content:** Core onboarding explanations are optional.
```

2. Update account model section:
```markdown
* **Account Model:**

  * **OAuth-Based Authentication:** Users sign in via Google, GitHub, Microsoft, Apple, or Facebook.

  * **No passwords, no email entry, no magic links.**

  * **Privacy-First:** OAuth providers only used for secure identity verification. We never access your social data or share your information.

  * No usernames, avatars, or social discovery.
```

---

## Phase 7: Testing Strategy

### 7.1 Manual Testing Checklist

**OAuth Provider Testing:**
- [ ] Google: Sign in → Redirects → Board loads → Tasks save
- [ ] GitHub: Sign in → Redirects → Board loads → Tasks save
- [ ] Microsoft: Sign in → Redirects → Board loads → Tasks save
- [ ] Apple: Sign in → Redirects → Board loads → Tasks save
- [ ] Facebook: Sign in → Redirects → Board loads → Tasks save

**Error Handling:**
- [ ] Cancel OAuth (Google) → Error message displays → Can retry
- [ ] Deny email permission → Error message → Cannot proceed
- [ ] Invalid provider config → Error banner shown

**Session Management:**
- [ ] Sign in → Close browser → Reopen → Still logged in
- [ ] Sign out → Returns to OAuth login screen
- [ ] Token refresh: Stay logged in > 1 hour

**Data Integrity:**
- [ ] Create task as OAuth user → Task saves with correct user_id
- [ ] Sign in with different provider → Cannot see other user's tasks (RLS)

**Browser Compatibility:**
- [ ] Chrome (Desktop & Mobile)
- [ ] Firefox
- [ ] Safari (Desktop & iOS)
- [ ] Edge

### 7.2 Production Rollout

**Week 1: Staging Deployment**
- Deploy to staging Supabase project
- Test all 5 providers
- Beta user testing

**Week 2-3: Gradual Rollout**
- Enable OAuth in production (keep magic link as fallback)
- Monitor error rates via Supabase logs
- Collect user feedback

**Week 4: Full Migration**
- Disable magic link provider
- Remove old components from codebase
- Update documentation

---

## Phase 8: Security & Privacy

### 8.1 OAuth Scopes (Minimal)

| Provider | Scopes | Justification |
|----------|--------|---------------|
| Google | `email`, `profile` | Email for user ID |
| GitHub | `user:email` | Email only |
| Microsoft | `openid`, `email`, `profile` | Standard OIDC |
| Apple | `email`, `name` | Apple minimum |
| Facebook | `email`, `public_profile` | Email for ID |

**Privacy Alignment:**
- ✓ No tracking pixels on auth page
- ✓ No analytics on OAuth flow
- ✓ User data not shared beyond authentication
- ✓ Minimal scopes requested

### 8.2 Redirect URI Security

**Supabase Configuration:**
```
Site URL: https://focusrails.com
Allowed Redirect URLs:
  - http://localhost:5173/board (dev)
  - https://focusrails.com/board (prod)
```

**Do NOT add:**
- Wildcard URLs (*.focusrails.com)
- HTTP in production
- Untrusted domains

### 8.3 Token Storage

**Current (Secure):**
- Access tokens in localStorage (encrypted by Supabase SDK)
- Refresh tokens auto-managed
- Tokens scoped to Supabase domain

**Recommendation:** Add Content Security Policy headers in index.html

---

## Phase 9: Migration Strategy

### 9.1 Existing User Impact

**If production users exist:**
1. Keep magic link enabled for 30 days alongside OAuth
2. Show banner: "New sign-in options available! Use Google, GitHub, etc."
3. Gradually phase out magic link

**If pre-production:**
1. Clean cut to OAuth only
2. Delete magic link components immediately

### 9.2 Database Schema

**Answer: ZERO changes required**

**Rationale:**
- OAuth users get same UUID format as magic link users
- RLS policies use `auth.uid()` - provider-agnostic
- Foreign keys reference `auth.users(id)` - unchanged
- No provider metadata stored (privacy-first)

---

## Critical Files for Implementation

### Files to Create:
1. `src/components/auth/OAuthLogin.tsx` - OAuth provider selection UI
2. `src/components/auth/provider-icons.tsx` - Provider SVG icons (optional)
3. `docs/oauth-implementation-plan.md` - Detailed setup guide

### Files to Modify:
1. `src/hooks/useAuth.ts` - Replace signInWithEmail with signInWithOAuth
2. `src/App.tsx` - Update auth rendering logic, remove magic link state
3. `.env` - Add VITE_AUTH_REDIRECT_URL
4. `.env.example` - Document OAuth env vars
5. `docs/focusrails-visual-spec.md` - Update authentication section

### Files to Delete:
1. `src/components/auth/MagicLinkSent.tsx` - No longer needed
2. `src/components/auth/LoginForm.tsx` - Replaced by OAuthLogin

---

## Implementation Order

1. **Supabase Configuration** (Day 1-2)
   - Configure all 5 OAuth providers
   - Test redirect URLs
   - Verify scopes

2. **Component Development** (Day 3-4)
   - Create OAuthLogin component with UI
   - Add provider icons
   - Implement loading/error states

3. **Hook Updates** (Day 5)
   - Update useAuth with signInWithOAuth
   - Enhance error handling
   - Test OAuth flow locally

4. **App Integration** (Day 6)
   - Update App.tsx
   - Remove old components
   - Test full auth flow

5. **Documentation** (Day 7)
   - Create oauth-implementation-plan.md
   - Update focusrails-visual-spec.md
   - Write troubleshooting guide

6. **Testing & Deployment** (Week 2)
   - Manual testing all providers
   - Cross-browser testing
   - Deploy to staging
   - Production rollout

---

## Success Criteria

- [ ] All 5 OAuth providers working in production
- [ ] OAuth sign-in success rate > 95%
- [ ] Zero data loss or security incidents
- [ ] User auth flow < 5 seconds average
- [ ] Privacy promise maintained (no tracking)
- [ ] Documentation complete and accurate

---

## Rollback Plan

**If critical OAuth issue found:**

1. **Immediate:** Re-enable magic link in Supabase Dashboard
2. **Code:** Redeploy previous version from git
3. **Data:** No rollback needed (no schema changes)
4. **Sessions:** Existing OAuth sessions remain valid

**Partial rollback:** Disable specific provider if one is problematic
