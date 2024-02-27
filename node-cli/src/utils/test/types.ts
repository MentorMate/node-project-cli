import { GluegunStrings } from 'gluegun';
import { AuthOption, Database, Framework, ProjectLanguage } from '../../@types';

export type SampleExtensionInput = {
  projectName: string;
  framework: Framework;
  projectLanguage: ProjectLanguage;
  authOption?: AuthOption;
  appDir: string;
  assetsPath: string;
  workflowsFolder: string;
  features: string[];
  pkgJson: {
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  pkgJsonScripts?: string[];
  pkgJsonInstalls?: string[];
  envVars: {
    Node: Record<string, string>;
  };
  db?: Database;
  isExampleApp: boolean;
};

export type MockToolbox = {
  filesystem: {
    copy: jest.Mock;
    copyAsync: jest.Mock;
    dir: jest.Mock;
    exists: jest.Mock;
    path: jest.Mock;
    read: jest.Mock;
    write: jest.Mock;
    cwd: jest.Mock;
    removeAsync: jest.Mock;
    writeAsync: jest.Mock;
  };
  parameters: {
    plugin: string;
    command: string;
    array: string[];
    options: Record<string, unknown>;
    raw: string[];
    argv: string[];
    first: string;
    second: unknown;
    third: unknown;
    string: string;
  };
  patching: Record<string, unknown>;
  print: {
    success: jest.Mock;
    highlight: jest.Mock;
    error: jest.Mock;
    muted: jest.Mock;
    warning: jest.Mock;
  };
  prompt: Record<string, unknown> & { ask: jest.Mock };
  strings: GluegunStrings;
  system: Record<string, unknown> & {
    run: jest.Mock;
    which: jest.Mock;
  };
  meta: Record<string, string>;
  template: {
    generate: jest.Mock;
  };
  // Extensions
  os: {
    isWin: jest.Mock;
  };
  createProjectDirectory: jest.Mock;
  initializeNpm: jest.Mock;
  initializeGit: jest.Mock;
  installExpress: jest.Mock;
  installNest: jest.Mock;
  jsLinters: jest.Mock;
  jestConfig: jest.Mock;
  auditConfig: jest.Mock;
  setupTs: jest.Mock;
  setupHusky: jest.Mock;
  dockerizeWorkflow: jest.Mock;
  setupJwt: jest.Mock;
  setupPostgreSQL: jest.Mock;
  generateReadme: jest.Mock;
  debug: jest.Mock;
  editorconfig: jest.Mock;
  setupLicenseChecks: jest.Mock;
  setupMarkdownLinter: jest.Mock;
  commandHelp: Record<string, unknown>;
};

export type Operations = {
  asyncOperations: () => Promise<unknown>;
  syncOperations: () => unknown;
};

export type ProjectEnvVars = Record<string, Record<string, string>>;
