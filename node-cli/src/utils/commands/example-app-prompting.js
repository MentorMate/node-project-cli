const {
  selectFramework,
  selectAuthentication,
	selectDatabase
} = require('./questions');

const pickOptions = async (userInput, prompt) => {
	if (!userInput.framework) {
		const selectFrameworkPrompt = selectFramework();
		Object.assign(
			userInput,
			await prompt.ask(selectFrameworkPrompt),
		);
	}

	if (!userInput.authOption) {
		const selectAuthenticationPrompt = selectAuthentication();
		Object.assign(
			userInput,
			await prompt.ask(selectAuthenticationPrompt),
		);
	}

	if (userInput.framework === 'nest' && !userInput.db) {
		const selectDatabasePrompt = selectDatabase();
		Object.assign(
			userInput,
			await prompt.ask(selectDatabasePrompt),
		)
	}

	if (userInput.framework === 'express') {
		// Postgres is the default db for express
		userInput.db = 'pg';
	}

	return userInput;
}

module.exports = pickOptions
