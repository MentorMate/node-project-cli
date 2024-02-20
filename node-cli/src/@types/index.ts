export enum Framework {
  EXPRESS = 'express',
  NEST = 'nest',
}

export enum ProjectLanguage {
  TS = 'TS',
  JS = 'JS',
}

export enum Database {
  POSTGRESQL = 'pg',
  MONGODB = 'mongodb',
  NONE = 'none',
}

export enum AuthOption {
  JWT = 'jwt',
  AUTH0 = 'auth0',
}

export type UserInput = {
  appDir: string;
  workflowsFolder: string;
  assetsPath: string;
  framework: Framework;
  projectLanguage: ProjectLanguage;
  pkgJson: Record<string, any>;
  devSetup: boolean;
  projectName: string;
  isExampleApp: boolean;
  features: string[];
  db: Database;
  authOption: AuthOption;
  envVars: Record<string, any>;
};

export type PickPartial<T, P extends keyof T> = Partial<T> & Pick<T, P>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
