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
			if (currentWorkerTests.find((item) => item.test_id === test.test_id)) {
				const testCardProgress = testCard.querySelector('.test__progress');
				testCardProgress.value = 100;
				const testCardBtn = testCard.querySelector('.test__btn');
				testCardBtn.textContent = 'Завершено';
				testCardBtn.disabled = true;
			}
			cardsContainer.appendChild(testCard);
		});
	}

	async addTest(e) {
		debugger;
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
