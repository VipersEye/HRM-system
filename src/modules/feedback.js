import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/events.css';
import '@styles/feedback.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Feedback {
	constructor(Database) {
		this.database = new Database();

		(async () => {
			const feedback = await this.getFeedback();
			this.createTable(feedback);
		})();
	}

	async getFeedback() {
		const workers = await this.database.select('worker');
		let feedback = await this.database.select('question');
		feedback = feedback
			.map((message) => {
				message.date = new Date(message.date).toLocaleDateString();
				message.status =
					message.status === 't' ? true : message.status === 'f' ? false : 'pending';
				const author = workers.find((worker) => worker.worker_id === message.worker_id);
				message.author = `${author.surname} ${author.name}`;
				return message;
			})
			.sort((message1, message2) => message1.question_id - message2.question_id);
		return feedback;
	}

	async createTable(feedback) {
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
			table.appendChild(tableRow);
		});

		const tableContainer = document.createElement('div');
		tableContainer.classList.add('content_table');
		wrapper.appendChild(tableContainer);
		tableContainer.appendChild(table);
	}
}

const feedback = new Feedback(Database);
const events = new Events();
