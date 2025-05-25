# 🧪 Spiralogic QA Checklist (Final Beta)

## 1. Core Oracle Flow
- [ ] Open OracleChat, type a message, receive response
- [ ] Test TTS voice playback (emotion fallback works)
- [ ] Click "Save to Journal" — confirm data persists

## 2. Onboarding
- [ ] Visit `/onboarding` — assign crystal + guide
- [ ] Complete guide selection and continue to dashboard

## 3. Journal
- [ ] Saved Oracle messages appear in `/journal`
- [ ] Journal entry includes: message, guide, phase, and element

## 4. Dashboard
- [ ] Spiral Polar Map loads with current growth state
- [ ] Assigned archetype avatar is visible
- [ ] Crystal map shows phase progression

## 5. Feedback Submission
- [ ] Navigate to `/feedback`
- [ ] Submit text, element, and file upload
- [ ] Confirm feedback stored in `feedback_log` (verify in Supabase)

## 6. Auth + Access
- [ ] Sign-in/sign-up flow completes smoothly
- [ ] `/beta` is protected behind passcode
- [ ] Redirect on logout works properly

## 7. Mobile Responsiveness
- [ ] All pages responsive on iPhone/Android
- [ ] Menu, inputs, and scroll areas behave correctly

---

Run `npm run dev-check` before each deploy.
