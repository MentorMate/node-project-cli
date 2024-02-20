import { Framework, ProjectLanguage } from '../../@types';
import getFeatures from './features'

export default (framework: Framework, isPip3Avaialble: boolean) => ({
  framework,
  projectLanguage: ProjectLanguage.TS,
  features: getFeatures(isPip3Avaialble)
});
