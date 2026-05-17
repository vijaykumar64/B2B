# Security Specification - Franchise & Distribution Mobile Directory

## Data Invariants
1. A brand owner can only create and manage their own business opportunities.
2. An investor can only view their own applications and chat history.
3. Chat messages can only be sent by members of the parent conversation.
4. Notifications are strictly private to the recipient.
5. Critical platform configurations can only be modified by admins.
6. IDs must match '^[a-zA-Z0-9_\\-]+$' to prevent injection attacks.

## The "Dirty Dozen" Payloads (Malicious Attempts)

1. **Identity Spoofing**: Attempt to create an opportunity with `owner_uid` set to another user's ID.
2. **State Shortcutting**: An investor attempting to change an application status to 'shortlisted' (only brand owners/admins should do this).
3. **Ghost Field Update**: Adding a field like `is_admin: true` to a user profile update.
4. **PII Scraping**: An unauthenticated user attempting to list the `users` collection.
5. **Orphaned Message**: Attempting to create a message in a conversation that doesn't exist or that the user isn't part of.
6. **Denial of Wallet (ID Poisoning)**: Creating a document with a 1MB string as the ID.
7. **Temporal Fraud**: Providing a fake `createdAt` timestamp from the client instead of `request.time`.
8. **Resource Exhaustion**: Sending a 1MB string in a field that should only contain a short title.
9. **Relational Bypass**: Listing `applications` without a filter, trying to see other investors' leads.
10. **Unauthorized Role Escalation**: A user updating their own profile to change their role to 'admin'.
11. **Shadow Join**: Attempting to read messages of a conversation by guessing the ID without being a member.
12. **Status Locking Violation**: Attempting to update a 'completed' application to 'pending'.

## Validation Helpers Strategy
- `isValidId(id)`: Enforce size and regex.
- `isValidOpportunity(data)`: Check required fields and types.
- `isValidApplication(data)`: relational checks and status enums.
- `isValidUser(data)`: Prevent self-role assignment.
- `isValidConversation(data)`: Verify both parties exist and match the user.
- `isValidMessage(data)`: Check parent conversation membership.
- `isValidActivity(data)`: Enforce userId match.
