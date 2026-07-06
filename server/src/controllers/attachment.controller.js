const attachmentService = require('../services/attachment.service');
const Attachment = require('../models/attachment.model');

async function uploadForTask(req, res) {
  const attachment = await attachmentService.uploadAttachment({
    taskId: req.params.taskId,
    file: req.file,
    uploadedBy: req.user.id,
  });
  res.status(201).json({ attachment });
}

async function uploadForRca(req, res) {
  const attachment = await attachmentService.uploadAttachment({
    rcaId: req.params.rcaId,
    file: req.file,
    uploadedBy: req.user.id,
  });
  res.status(201).json({ attachment });
}

async function listForTask(req, res) {
  const attachments = await Attachment.listForTask(req.params.taskId);
  res.json({ attachments });
}

async function listForRca(req, res) {
  const attachments = await Attachment.listForRca(req.params.rcaId);
  res.json({ attachments });
}

async function download(req, res) {
  const { attachment, buffer } = await attachmentService.downloadAttachment(req.params.attachmentId);
  res.set('Content-Type', attachment.mime_type);
  res.set('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
  res.send(buffer);
}

async function remove(req, res) {
  await attachmentService.deleteAttachment(req.params.attachmentId, req.user.id);
  res.status(204).send();
}

module.exports = { uploadForTask, uploadForRca, listForTask, listForRca, download, remove };
