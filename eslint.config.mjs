import { fileURLToPath } from 'node:url';
import path from 'node:path';
import next from 'eslint-config-next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [
      '.next',
      'dist',
      'node_modules',
      'contracts',
      'script',
      'scripts',
      'test',
      '**/*.spec.*',
      '**/*.test.*',
      '**/*.t.sol',
      '**/*.sol',
      'lib/forge-std',
      'lib/openzeppelin-contracts',
      'foundry.toml',
      'hardhat.config.*'
    ],
  },
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
];
