-- TeamFlow initial schema
-- Design notes (see design-decisions.md for full rationale):
--  * UUID primary keys everywhere -> safe for future multi-region / offline-first sync.
--  * ActivityLog is append-only (no UPDATE/DELETE granted at the app-role level in prod).
--  * TaskRelation is a single directed edge table; "blocks" and "blocked_by" are
--    modeled as the same relation viewed from either side (no duplicate rows).
--  * RCA cannot transition to 'closed' until every assigned Review has a decision -
--    enforced in the service layer (see rca.service.js) rather than a DB trigger,
--    so we can return rich validation errors to the API caller.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== USERS =====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  theme VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  email_opt_out BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== PROJECTS =====================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  view_preference VARCHAR(10) NOT NULL DEFAULT 'kanban'
    CHECK (view_preference IN ('kanban', 'calendar', 'list')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- ===================== TASKS =====================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'in_review', 'done', 'blocked')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Directed dependency edge: source_task depends on (is blocked by) target_task.
CREATE TABLE task_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  target_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  relation_type VARCHAR(20) NOT NULL DEFAULT 'blocked_by' CHECK (relation_type = 'blocked_by'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_dependency CHECK (source_task_id <> target_task_id),
  UNIQUE (source_task_id, target_task_id)
);

-- ===================== COMMENTS (polymorphic: task OR rca) =====================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  rca_id UUID, -- FK added after rcas table below
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body TEXT NOT NULL,
  mentioned_user_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comment_single_parent CHECK (
    (task_id IS NOT NULL AND rca_id IS NULL) OR (task_id IS NULL AND rca_id IS NOT NULL)
  )
);

-- ===================== ATTACHMENTS (polymorphic: task OR rca) =====================
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  rca_id UUID,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  file_name VARCHAR(255) NOT NULL,
  storage_key TEXT NOT NULL, -- path/key in object storage (S3 or local disk)
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT attachment_single_parent CHECK (
    (task_id IS NOT NULL AND rca_id IS NULL) OR (task_id IS NULL AND rca_id IS NOT NULL)
  )
);

-- ===================== RCA (Root Cause Analysis) =====================
CREATE TABLE rcas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'in_review', 'closed', 'rejected')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE comments ADD CONSTRAINT fk_comments_rca FOREIGN KEY (rca_id) REFERENCES rcas(id) ON DELETE CASCADE;
ALTER TABLE attachments ADD CONSTRAINT fk_attachments_rca FOREIGN KEY (rca_id) REFERENCES rcas(id) ON DELETE CASCADE;

CREATE TABLE rca_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rca_id UUID NOT NULL REFERENCES rcas(id) ON DELETE CASCADE,
  section_type VARCHAR(30) NOT NULL
    CHECK (section_type IN ('timeline', 'contributing_factors', 'corrective_actions', 'preventive_measures')),
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rca_id, section_type)
);

-- Reviewer assignment + decision. A row is created (decision = NULL) when a
-- reviewer is assigned; RCA can only reach 'closed' once every row here has
-- a non-null decision (enforced in rca.service.js).
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rca_id UUID NOT NULL REFERENCES rcas(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision VARCHAR(10) CHECK (decision IN ('approved', 'rejected')),
  comment TEXT, -- mandatory once decision is set; enforced in service layer
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rca_id, reviewer_id)
);

-- ===================== NOTIFICATIONS =====================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(40) NOT NULL,
  -- dedupe_key groups the in-app + email copies of one logical event so
  -- retries/duplicate publishes don't produce a second alert (see Notifications
  -- tradeoff in the design doc: "every alert logged before dispatch").
  dedupe_key VARCHAR(200) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('in_app', 'email')),
  status VARCHAR(15) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'suppressed')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  UNIQUE (user_id, dedupe_key, channel)
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at);

-- ===================== ACTIVITY LOG (append-only) =====================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(30) NOT NULL,
  entity_id UUID NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
