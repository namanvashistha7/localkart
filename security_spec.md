# Security Specification — LocalKart Firebase Rules

## 1. Data Invariants
1. **User Profile Ownership & PII Isolation**: A `/users/{userId}` document can only be read (`get`) or modified by the authenticated user whose `request.auth.uid == userId` (and `email_verified == true`), or an explicitly verified platform administrator. `list` on `/users` is strictly denied to non-admins to prevent PII scraping.
2. **No Self-Assigned Admin Privileges**: A user creating `/users/{userId}` can only set `role` to `'customer'` or `'retailer'` and cannot self-assign `'admin'` or `'founder'`, nor create records in `/admins/{adminId}`.
3. **Master Gate on Subcollections**: `/users/{userId}/requests/{requestId}` and `/users/{userId}/saved/{itemId}` validate parent `/users/{userId}` existence via `get()`/`exists()` and enforce `customerId == request.auth.uid` / `userId == request.auth.uid`.
4. **Terminal State Locking**: Once a `UserPurchaseRequest` reaches `status == 'completed'` or `status == 'cancelled'`, non-admin users cannot alter `status` again (only post-completion `rating` & `reviewText` can be added once while `rating` was not yet set).
5. **Temporal Integrity**: `createdAt` on create and `updatedAt` on create/update must equal `request.time`. `createdAt` and `uid`/`customerId` are immutable on update.
6. **Path ID & String Length Hardening**: All path IDs match `^[a-zA-Z0-9_\-]+$` (`size() <= 128`). Every string field has explicit `size()` bounds.

## 2. "Dirty Dozen" Adversarial Payloads
1. **Cross-User Profile Read**: User A attempts `get(/users/userB)` -> `PERMISSION_DENIED`.
2. **PII Collection Scrape**: User A attempts `list(/users)` -> `PERMISSION_DENIED`.
3. **Privilege Escalation on Create**: User A attempts `setDoc(/users/userA, { role: 'admin', ... })` -> `PERMISSION_DENIED`.
4. **Privilege Escalation on Update**: User A attempts `updateDoc(/users/userA, { role: 'admin' })` -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: User A attempts `setDoc(/users/userA, { ..., isVerified: true })` -> `PERMISSION_DENIED`.
6. **Unverified Email Spoofing**: User with `email_verified: false` and admin email attempts admin write -> `PERMISSION_DENIED`.
7. **ID Poisoning**: User attempts write to `/users/userA/requests/bad..id!!` or 1.5KB ID -> `PERMISSION_DENIED`.
8. **Resource Exhaustion (1MB String)**: User attempts `setDoc` with 50,000-character `name` or `pickupNotes` -> `PERMISSION_DENIED`.
9. **Impersonated Customer Request**: User A attempts to create `/users/userA/requests/req1` with `customerId: 'userB'` -> `PERMISSION_DENIED`.
10. **Client Timestamp Forgery**: User attempts create with `createdAt: '2020-01-01T00:00:00Z'` instead of `serverTimestamp()` -> `PERMISSION_DENIED`.
11. **Terminal State Shortcutting / Reopening**: User attempts to change `status` from `'completed'` back to `'submitted'` -> `PERMISSION_DENIED`.
12. **Admin Record Injection**: Non-admin user attempts `setDoc(/admins/userA, { uid: 'userA', email: '...' })` -> `PERMISSION_DENIED`.
