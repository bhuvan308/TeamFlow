// Object storage abstraction. Every consumer (attachment.service.js) talks to
// this interface only — swapping to S3/GCS for prod means writing one new
// driver file with the same three methods, no changes anywhere else.
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const ROOT = path.resolve(env.uploadDir);
if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });

async function save(buffer, originalName) {
  const key = `${uuidv4()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  await fs.promises.writeFile(path.join(ROOT, key), buffer);
  return key; // stored as attachments.storage_key
}

async function read(key) {
  return fs.promises.readFile(path.join(ROOT, key));
}

async function remove(key) {
  const target = path.join(ROOT, key);
  if (fs.existsSync(target)) await fs.promises.unlink(target);
}

module.exports = { save, read, remove };
