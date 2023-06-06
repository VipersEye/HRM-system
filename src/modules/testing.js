import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/testing.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Testing {
	constructor(Database, Events) {
		this.database = new Database();
		this.events = new Events(this.database);

		const navTogglerBtn = document.querySelector('.nav__toggler-btn');
		const toggleNav = (e) => {
			const navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');
			e.currentTarget.classList.toggle('nav__toggler-btn_open');
		};
		navTogglerBtn.addEventListener('click', toggleNav);

		const inputFile = document.querySelector('input[type="file"]');
		inputFile.addEventListener('change', this.addTest.bind(this));

		this.createCards();
	}

	async getTests() {
		const testsJSON = await this.database.select('test');
		const tests = testsJSON.map((test) => {
			const testObject = JSON.parse(test.data);
			testObject.test_id = test.test_id;
			return testObject;
		});
		return tests;
	}

	async createCards(inputData) {
		const tests = inputData || (await this.getTests());
		const currentWorkerID = sessionStorage.getItem('id');
		const currentWorkerTests =
			(await this.database.select('worker_test', {
				worker_id: currentWorkerID,
			})) || [];

		const cardsContainer = document.querySelector('.test_container');
		while (cardsContainer.firstChild) cardsContainer.removeChild(cardsContainer.firstChild);

		const testCardTemplate = document.querySelector('#test-card-template');
		tests.forEach((test) => {
			const testCard = testCardTemplate.content.cloneNode(true).querySelector('.test');
			testCard.setAttribute('test_id', test.test_id);
			const testCardInfo = testCard.querySelector('.test__info');
			testCardInfo.innerHTML = test.icon + testCardInfo.innerHTML;
			const testCardTitle = testCard.querySelector('.test__title');
			testCardTitle.textContent = test.title;
			const testCardDesc = testCard.querySelector('.test__desc');
			testCardDesc.textContent = test.description;
			const testCardQuestionsCount = testCard.querySelector('.test__questions__count');
			testCardQuestionsCount.textContent = test.questions.length;
			const testCardQuestionsText = testCard.querySelector('.test__questions__text');
			testCardQuestionsText.textContent = 'Вопросов';
			const testCardBtn = testCard.querySelector('.test__btn');
			testCardBtn.addEventListener('click', this.startExamination.bind(this, test));

			if (currentWorkerTests.find((item) => item.test_id === test.test_id)) {
				const testCardProgress = testCard.querySelector('.test__progress');
				testCardProgress.value = 100;
				testCardBtn.textContent = 'Завершено';
				testCardBtn.disabled = true;

				const workerCompletedTest = currentWorkerTests.find(
					(item) => item.test_id === test.test_id
				);
				testCardQuestionsCount.textContent = `${workerCompletedTest.score}/${workerCompletedTest.max_score}`;
				testCardQuestionsText.remove();
			}

			cardsContainer.appendChild(testCard);
		});
	}

	startExamination({test_id, title, questions}) {
		const examinationTemplate = document.querySelector('#examination-template');
		const examination = examinationTemplate.content
			.cloneNode(true)
			.querySelector('.examination');
		const examinationTitle = examination.querySelector('.examination__title');
		examinationTitle.textContent = title;

		let currentQuestion = 0;
		const userAnswers = [];

		const nextQuestionBtn = examination.querySelector('.examination__btn_next');
		const prevQuestionBtn = examination.querySelector('.examination__btn_prev');

		const setCurrentQuestion = () => {
			const question = questions[currentQuestion];
			const examinationQuestion = examination.querySelector('.examination__question');
			examinationQuestion.textContent = `${currentQuestion + 1}) ${question.text}`;

			const answersContainer = examination.querySelector('.examination__answers');
			while (answersContainer.firstChild) {
				answersContainer.removeChild(answersContainer.firstChild);
			}

			const answerTemplate = document.querySelector('#examination-answer-template');
			question.options.forEach((option, i) => {
				const answer = answerTemplate.content
					.cloneNode(true)
					.querySelector('.examination__answer');
				const answerInput = answer.querySelector('.examination__input');
				answerInput.type = question.mode;
				answerInput.id = `answer-${i + 1}`;
				answerInput.value = i + 1;
				const answerLabel = answer.querySelector('.examination__label');
				answerLabel.setAttribute('for', answerInput.id);
				answerLabel.textContent = option;
				answersContainer.appendChild(answer);
			});

			if (userAnswers[currentQuestion]?.length) {
				userAnswers[currentQuestion].forEach((answer) => {
					const answerInput = examination.querySelector(`[id=answer-${answer}]`);
					answerInput.checked = true;
				});
			}

			nextQuestionBtn.textContent =
				currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее';
		};

		const finishExamination = async () => {
			const max_score = questions.reduce((sum, question) => sum + question.score, 0);
			const score = questions.reduce((sum, question, i) => {
				if (
					userAnswers[i].every((answer) => question.answers.includes(+answer)) &&
					userAnswers[i].length
				) {
					return sum + +question.score;
				}
				return +sum;
			}, 0);
			const worker_id = sessionStorage.getItem('id');
			const values = {
				worker_id,
				test_id,
				score,
				max_score,
			};
			await this.database.insert('worker_test', values);
			await this.createCards();
		};

		const toggleCurrentQuestion = (e) => {
			const saveUserAnswers = () => {
				const currentAnswers = Array.from(
					examination.querySelectorAll('.examination__input:checked'),
					(input) => input.value
				);
				userAnswers[currentQuestion] = currentAnswers;
			};

			saveUserAnswers();

			const btn = e.target;
			if (btn.classList.contains('examination__btn_next')) {
				if (currentQuestion === questions.length - 1) {
					finishExamination();
					return;
				}
				currentQuestion = Math.min(questions.length - 1, currentQuestion + 1);
			} else {
				currentQuestion = Math.max(0, currentQuestion - 1);
			}

			setCurrentQuestion();
		};

		prevQuestionBtn.addEventListener('click', toggleCurrentQuestion);
		nextQuestionBtn.addEventListener('click', toggleCurrentQuestion);

		setCurrentQuestion();

		const container = document.querySelector('.test_container');
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
		container.appendChild(examination);
	}

	async addTest(e) {
		const examination = document.querySelector('.examination');
		if (examination) {
			return;
		}

		const [file] = e.target.files;
		console.log(e.target.files);

		const reader = new FileReader();
		reader.onload = async () => {
			try {
				const fileString = reader.result;
				const values = {
					data: fileString,
				};
				await this.database.insert('test', values);
				this.createCards();
				e.target.value = null;
			} catch (error) {
				alert('Произошла ошибка при чтении файла');
			}
		};
		reader.readAsText(file);
	}
}

const testing = new Testing(Database, Events);
