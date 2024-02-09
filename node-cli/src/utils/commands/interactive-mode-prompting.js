const { getQuestions } = require('./questions');

const pickOptions = async (userInput, prompt, isPip3Available) => {
	Object.assign(
		userInput,
		await prompt.ask(
			getQuestions(userInput, isPip3Available).slice(0, 2),
		)
	);

  Object.assign(
    userInput,
    await prompt.ask(getQuestions(userInput, isPip3Available).slice(2)),
  );
};

module.exports = pickOptions;
