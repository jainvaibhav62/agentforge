'use strict';

const fs = require('fs-extra');

/**
 * Ensures a directory exists (no-op in dry-run).
 */
async function ensureDir(destAbs, dryRun) {
  if (!dryRun) {
    await fs.ensureDir(destAbs);
  }
}

/**
 * Writes a template file to its destination.
 * Returns 'created' | 'skipped' | 'overwritten'
 */
async function writeFile(srcAbs, destAbs, { force, dryRun }) {
  const exists = await fs.pathExists(destAbs);

  if (exists && !force) {
    return 'skipped';
  }

  if (!dryRun) {
    const content = await fs.readFile(srcAbs, 'utf8');
    await fs.ensureFile(destAbs);
    await fs.writeFile(destAbs, content, 'utf8');
  }

  return exists ? 'overwritten' : 'created';
}

/**
 * Makes a file executable (silently ignores errors, e.g. on Windows).
 */
async function chmod(filePath, mode) {
  try {
    await fs.chmod(filePath, mode);
  } catch (_) {
    // Non-fatal — Windows doesn't support Unix permissions
  }
}

module.exports = { ensureDir, writeFile, chmod };
