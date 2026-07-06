const Project = require('../models/project.model');
const { ApiError } = require('../middleware/errorHandler');
const { sendEmail } = require('../services/email.service');
const notificationService = require('../services/notification.service');

async function create(req, res) {
  const project = await Project.create({
    ...req.body,
    ownerId: req.user.id,
  });

  res.status(201).json({ project });
}

async function list(req, res) {
  const projects = await Project.listForUser(req.user.id);
  res.json({ projects });
}

async function getOne(req, res) {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  res.json({ project });
}

async function update(req, res) {
  const project = await Project.update(req.params.projectId, req.body);
  res.json({ project });
}

async function remove(req, res) {
  await Project.delete(req.params.projectId);
  res.status(204).send();
}

async function listMembers(req, res) {
  const members = await Project.listMembers(req.params.projectId);
  res.json({ members });
}

async function addMember(req, res) {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  const member = await Project.addMember(projectId, userId, role);

  const project = await Project.findById(projectId);

  /* -----------------------------
     In-App Notification + Email
  ------------------------------*/

  try {
    await notificationService.notify({
      userId,
      eventType: 'project.memberAdded',
      dedupeState: `${projectId}:${role}`,
      payload: {
        entityId: projectId,
        subject: `Added to project: ${project.name}`,
        text: `You have been added to the project "${project.name}" as ${role || 'member'}.`,
      },
      channels: ['in_app', 'email'],
    });
  } catch (err) {
    console.error('Notification Error:', err.message);
  }

  /* -----------------------------
     Welcome Email
  ------------------------------*/

  try {
    await sendEmail({
      userId,
      subject: `Added to Project: ${project.name}`,
      text: `Hello,

You have been added to the project "${project.name}".

Role: ${role || 'member'}

Please log in to TeamFlow to start collaborating.

Regards,
TeamFlow Team`,
      html: `
        <h2>Project Invitation</h2>

        <p>You have been added to the project:</p>

        <h3>${project.name}</h3>

        <p><strong>Role:</strong> ${role || 'member'}</p>

        <p>Login to TeamFlow to view your project.</p>

        <br>

        <p>Regards,<br>TeamFlow Team</p>
      `,
    });
  } catch (err) {
    console.error('Email Error:', err.message);
  }

  res.status(201).json({
    member,
    message: 'Member added successfully.',
  });
}

async function removeMember(req, res) {
  await Project.removeMember(
    req.params.projectId,
    req.params.userId
  );

  res.status(204).send();
}

async function setViewPreference(req, res) {
  const member = await Project.setViewPreference(
    req.params.projectId,
    req.user.id,
    req.body.viewPreference
  );

  res.json({ member });
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  listMembers,
  addMember,
  removeMember,
  setViewPreference,
};











// const Project = require('../models/project.model');
// const { ApiError } = require('../middleware/errorHandler');

// async function create(req, res) {
//   const project = await Project.create({ ...req.body, ownerId: req.user.id });
//   res.status(201).json({ project });
// }

// async function list(req, res) {
//   const projects = await Project.listForUser(req.user.id);
//   res.json({ projects });
// }

// async function getOne(req, res) {
//   const project = await Project.findById(req.params.projectId);
//   if (!project) throw new ApiError(404, 'Project not found');
//   res.json({ project });
// }

// async function update(req, res) {
//   const project = await Project.update(req.params.projectId, req.body);
//   res.json({ project });
// }

// async function remove(req, res) {
//   await Project.delete(req.params.projectId);
//   res.status(204).send();
// }

// async function listMembers(req, res) {
//   const members = await Project.listMembers(req.params.projectId);
//   res.json({ members });
// }

// async function addMember(req, res) {
//   const member = await Project.addMember(req.params.projectId, req.body.userId, req.body.role);
//   res.status(201).json({ member });
// }

// async function removeMember(req, res) {
//   await Project.removeMember(req.params.projectId, req.params.userId);
//   res.status(204).send();
// }

// async function setViewPreference(req, res) {
//   const member = await Project.setViewPreference(req.params.projectId, req.user.id, req.body.viewPreference);
//   res.json({ member });
// }

// module.exports = { create, list, getOne, update, remove, listMembers, addMember, removeMember, setViewPreference };
