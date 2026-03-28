'use strict';

const path = require('path');
const fs = require('fs-extra');

/**
 * Maps indicator files → tech stack labels and relevant metadata.
 */
const INDICATORS = [
  { file: 'package.json',       label: 'Node.js',      readFile: true  },
  { file: 'requirements.txt',   label: 'Python',        readFile: true  },
  { file: 'pyproject.toml',     label: 'Python',        readFile: true  },
  { file: 'go.mod',             label: 'Go',            readFile: true  },
  { file: 'Cargo.toml',         label: 'Rust',          readFile: true  },
  { file: 'pom.xml',            label: 'Java/Maven',    readFile: false },
  { file: 'build.gradle',       label: 'Java/Gradle',   readFile: false },
  { file: 'Gemfile',            label: 'Ruby',          readFile: false },
  { file: 'composer.json',      label: 'PHP',           readFile: false },
  { file: 'tsconfig.json',      label: 'TypeScript',    readFile: false },
  { file: 'next.config.js',     label: 'Next.js',       readFile: false },
  { file: 'next.config.ts',     label: 'Next.js',       readFile: false },
  { file: 'vite.config.ts',     label: 'Vite',          readFile: false },
  { file: 'vite.config.js',     label: 'Vite',          readFile: false },
  { file: 'docker-compose.yml', label: 'Docker',        readFile: false },
  { file: 'docker-compose.yaml','label': 'Docker',      readFile: false },
  { file: 'Dockerfile',         label: 'Docker',        readFile: false },
  { file: '.terraform',         label: 'Terraform',     readFile: false },
];

/**
 * Detects the tech stack and returns labels + key file contents for context.
 * @param {string} targetDir
 * @returns {{ labels: string[], context: string }}
 */
async function detect(targetDir) {
  const labels = new Set();
  const contextParts = [];

  for (const indicator of INDICATORS) {
    const filePath = path.join(targetDir, indicator.file);
    const exists = await fs.pathExists(filePath);
    if (!exists) continue;

    labels.add(indicator.label);

    if (indicator.readFile) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        // Truncate to avoid bloating the prompt
        const trimmed = content.slice(0, 1500);
        contextParts.push(`--- ${indicator.file} ---\n${trimmed}`);
      } catch (_) {}
    }
  }

  return {
    labels: [...labels],
    context: contextParts.join('\n\n'),
  };
}

module.exports = { detect };
