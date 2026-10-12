# Security Specification (security_spec.md)

## 1. Data Invariants
- A `UserBook` cannot exist without a valid `userId` (must be authenticated owner) and `bookId`.
- An `Annotation` cannot exist without a `bookId` and must belong to the user (`userId` must match `request.auth.uid`).
- A `Discussion` must belong to an `Annotation`.
- A `MapHotspot` cannot be created by users, only system processes (requires server-side role/admin).

## 2. The "Dirty Dozen" Payloads (Examples)
1. `UserBook` creation with `userId` not matching `request.auth.uid`.
2. `Annotation` creation with `userId` not matching `request.auth.uid`.
3. `Annotation` update trying to change the `annotationId`.
4. `Discussion` creation for non-existent `annotationId`.
5. `MapHotspot` creation by a regular user.
6. `User` profile update to elevate privilege (e.g., adding `role: 'admin'`).
7. `Annotation` creation with a 2MB text field.
8. `UserBook` update changing `bookId`.
9. `Discussion` update changing `annotationId`.
10. `Annotation` creation with invalid `page` number (-1).
11. Reading `Annotation` for a `bookId` not in the user's `UserBook` library (if privacy is enforced).
12. `User` reading another `User`'s profile (PII protection).

## 3. The Test Runner (`firestore.rules.test.ts` placeholder)
(To be implemented in the testing phase)
