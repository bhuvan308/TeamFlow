const Attachment = require('../models/attachment.model');
const storage = require('../storage/localDriver');
const activityLog = require('./activityLog.service');
const { ApiError } = require('../middleware/errorHandler');

async function uploadAttachment({ taskId, rcaId, file, uploadedBy }) {
  if (!taskId && !rcaId) throw new ApiError(400, 'Either taskId or rcaId is required');

  const storageKey = await storage.save(file.buffer, file.originalname);
  const attachment = await Attachment.create({
    taskId,
    rcaId,
    uploadedBy,
    fileName: file.originalname,
    storageKey,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  });

  await activityLog.log(taskId ? 'task' : 'rca', taskId || rcaId, uploadedBy, 'attachment_added', {
    fileName: file.originalname,
  });
  return attachment;
}

async function downloadAttachment(attachmentId) {
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) throw new ApiError(404, 'Attachment not found');
  const buffer = await storage.read(attachment.storage_key);
  return { attachment, buffer };
}

async function deleteAttachment(attachmentId, actorId) {
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) throw new ApiError(404, 'Attachment not found');
  await storage.remove(attachment.storage_key);
  await Attachment.delete(attachmentId);
  await activityLog.log(
    attachment.task_id ? 'task' : 'rca',
    attachment.task_id || attachment.rca_id,
    actorId,
    'attachment_removed',
    { fileName: attachment.file_name }
  );
}

module.exports = { uploadAttachment, downloadAttachment, deleteAttachment };
