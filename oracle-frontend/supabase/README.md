# 🧠 Supabase Architecture – Spiralogic Feedback System

This directory contains the schema, policies, and storage definitions used for collecting symbolic user feedback in the Spiralogic Oracle System.

---

## 📄 `feedback_log` Table

Tracks symbolic feedback, bug reports, or archetypal dreams submitted by users.

**Schema:**
| Column       | Type         | Description                            |
|--------------|--------------|----------------------------------------|
| `id`         | `uuid`       | Primary key                            |
| `created_at` | `timestamptz`| Timestamp of submission                |
| `user_id`    | `uuid`       | References `auth.users.id`            |
| `message`    | `text`       | Main feedback content                  |
| `element`    | `text`       | Optional: Fire, Water, Earth, Air, etc.|
| `archetype`  | `text`       | Optional: e.g., Healer, Mystic         |
| `agent`      | `text`       | Optional: Internal guide or agent used |
| `file_url`   | `text`       | Public URL for any uploaded media      |

---

## 🔐 Row-Level Security (RLS)

Feedback table is protected by default.

### Active Policy:
```sql
create policy "Authenticated users can insert feedback"
on feedback_log
for insert
to authenticated
with check (auth.uid() = user_id);
