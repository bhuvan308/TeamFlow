-- Supplementary indexes informed by the query patterns in report.service.js
-- and the notification dedupe lookups.

CREATE INDEX IF NOT EXISTS idx_rcas_project_status ON rcas(project_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_rca ON reviews(rca_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_rca ON comments(rca_id);
CREATE INDEX IF NOT EXISTS idx_attachments_task ON attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_rca ON attachments(rca_id);
CREATE INDEX IF NOT EXISTS idx_task_relations_target ON task_relations(target_task_id);
