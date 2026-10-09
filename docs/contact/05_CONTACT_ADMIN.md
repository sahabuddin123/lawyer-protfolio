# 05. Contact Messages Admin Console

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** UI/UX Designer & Senior React/TypeScript Engineer  
**Component:** `frontend/src/features/contact/ContactInboxManager.tsx`  
**Permissions Required:** `view_contacts`, `manage_contacts`

---

## 1. Inbox Workflow Architecture

The Contact Messages tab inside `ContactInboxManager.tsx` provides chamber assistants and administrative staff with a streamlined message triage workspace:

```
[Messages Datagrid] ──▶ [Interactive Filters & Search] ──▶ [Message Detail Modal] ──▶ [Status & Private Notes]
```

### 1.1 Datagrid Capabilities
- **Sender Details:** Displays submitter legal/individual name with direct `tel:` and `mailto:` action triggers.
- **Subject Column:** Truncated subject line preview.
- **Dynamic Status Badging:**
  - `New`: Gold warning badge.
  - `Read`: Outlined badge.
  - `Replied`: Green success badge.
  - `Closed`: Subdued secondary badge.
  - `Spam`: Destructive badge.
- **Automatic Status Transition:** Opening a message in state `new` automatically promotes it to `read`.
- **Soft Deletion Safety:** Soft delete confirmation dialog prevents accidental record loss.
