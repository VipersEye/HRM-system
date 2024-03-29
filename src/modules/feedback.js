import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/feedback.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Feedback {
	constructor(Database) {
		this.database = new Database();
		this.events = new Events(this.database);
		this.createTable();

		const changeNavVisibility = (e) => {
			let navToggleBtn = e.currentTarget;
			let navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');
			navToggleBtn.classList.toggle('nav__toggler-btn_open');
		};

		let navToggleBtn = document.querySelector('.nav__toggler-btn');
		navToggleBtn.addEventListener('click', changeNavVisibility);

		const clearSearchField = () => {
			const inputSearch = document.querySelector('#input-search');
			inputSearch.value = '';
			inputSearch.dispatchEvent(new Event('input'));
		};

		const clearInputBtn = document.querySelector('.section__btn_clear');
		clearInputBtn.addEventListener('click', clearSearchField);

		const inputSearch = document.querySelector('#input-search');
		inputSearch.addEventListener('input', this.searchMessage.bind(this));
	}

	async getFeedback() {
		const workers = await this.database.select('worker');
		let feedback = await this.database.select('question');
		feedback = feedback
			.map((message) => {
				message.date = new Date(message.date).toLocaleDateString();
				message.status =
					message.status === 't' ? 'Принято' : message.status === 'f' ? 'Отклонено' : '';
				const author = workers.find((worker) => worker.worker_id === message.worker_id);
				message.author = `${author.surname} ${author.name}`;
				return message;
			})
			.sort((message1, message2) => message1.question_id - message2.question_id);
		return feedback;
	}

	async createTable(fb) {
		const feedback = fb || (await this.getFeedback());

		const wrapper = document.querySelector('.content-wrapper');
		while (wrapper.firstChild) {
			wrapper.removeChild(wrapper.firstChild);
		}

		const table = document.createElement('div');
		table.classList.add('table', 'table_feedback');

		const tableHeader = document
			.querySelector('#table-header-template')
			.content.cloneNode(true);
		table.append(tableHeader);

		const tableRowTemplate = document.querySelector('#table-row-template');

		const addStatusControl = (cell) => {
			const controlTemplate = document.querySelector('#feedback-status-template');
			const control = controlTemplate.content
				.cloneNode(true)
				.querySelector('.feedback__btns');

			const btnAccept = control.querySelector('.feedback__btn_accept');
			const btnDeny = control.querySelector('.feedback__btn_deny');

			const updateStatus = async (e) => {
				const values = {
					status: e.target.classList.contains('feedback__btn_accept'),
				};

				const conditions = {
					worker_id: cell.getAttribute('id'),
				};

				await this.database.update('question', values, conditions);
				await this.createTable();
			};

			btnAccept.addEventListener('click', updateStatus);
			btnDeny.addEventListener('click', updateStatus);

			cell.appendChild(control);
		};

		feedback.forEach((message, i) => {
			const tableRow = tableRowTemplate.content.cloneNode(true);
			if (i % 2 !== 0) {
				for (let cell of tableRow.children) {
					cell.classList.add('cell_colored');
				}
			}

			for (let key in message) {
				const data = tableRow.querySelector(`.cell[content="${key}"]`);
				if (data) data.textContent = message[key];
			}

			if (message.status === '') {
				const cellStatus = tableRow.querySelector('.cell[content="status"]');
				cellStatus.setAttribute('id', message.worker_id);
				addStatusControl(cellStatus);
			}

			table.appendChild(tableRow);
		});

		const tableContainer = document.createElement('div');
		tableContainer.classList.add('content_table');
		wrapper.appendChild(tableContainer);
		tableContainer.appendChild(table);
	}

	async searchMessage() {
		const feedback = await this.getFeedback();
		const searchedValue = document.querySelector('#input-search').value;

		const suitableMeesages = feedback.filter((message) => {
			const summary = Object.values(message).join(' ');
			return summary.includes(searchedValue);
		});

		this.createTable(suitableMeesages);
	}
}

const feedback = new Feedback(Database, Events);
