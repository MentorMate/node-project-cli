import { Database, UserInput, Framework } from '../../@types';
import {
  selectFrameworkPrompt,
  selectAuthPrompt,
	selectDbPrompt
} from './questions'
import { GluegunToolbox } from 'gluegun';

export const exampleAppPrompting = async (userInput: Partial<UserInput>, prompt: GluegunToolbox['prompt']) => {
	if (!userInput.framework) {
		Object.assign(
			userInput,
			await prompt.ask(selectFrameworkPrompt()),
		);
	}

	if (!userInput.authOption) {
		Object.assign(
			userInput,
			await prompt.ask(selectAuthPrompt(!!userInput.isExampleApp)),
		);
	}

	if (userInput.framework === 'nest' && !userInput.db) {
		Object.assign(
			userInput,
			await prompt.ask(selectDbPrompt(Framework.NEST, !!userInput.isExampleApp)),
		)
	}

	if (userInput.framework === Framework.EXPRESS) {
		// Postgres is the default db for express
		userInput.db = Database.POSTGRESQL;
	}

	return userInput;
}

