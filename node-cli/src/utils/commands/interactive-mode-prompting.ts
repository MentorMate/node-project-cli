import { UserInput } from 'src/@types';
import { getQuestions } from './questions';
import { GluegunToolbox } from 'gluegun';
import { PromptOptions } from 'gluegun/build/types/toolbox/prompt-enquirer-types';

export const interactiveAppPrompting = async (
  userInput: Partial<UserInput>,
  prompt: GluegunToolbox['prompt'],
  isPip3Available: boolean,
) => {
  Object.assign(
    userInput,
    await prompt.ask(
      getQuestions(userInput, isPip3Available).slice(0, 2) as PromptOptions[],
    ),
  );

  Object.assign(
    userInput,
    await prompt.ask(
      getQuestions(userInput, isPip3Available).slice(2) as PromptOptions[],
    ),
  );
};
