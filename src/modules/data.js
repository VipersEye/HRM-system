import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Data {
	constructor(Database, Events) {
		this.database = new Database();
		this.events = new Events();

		const toggleNav = (e) => {
			const navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');

			e.currentTarget.classList.toggle('nav__toggler-btn_open');
		};

		const clearInput = () => {
			const input = document.querySelector('#input-search');
			input.value = '';
			input.dispatchEvent(new Event('input'));
		};

		const navTogglerBtn = document.querySelector('.nav__toggler-btn');
		navTogglerBtn.addEventListener('click', toggleNav);

		const tabRadios = document.querySelectorAll('.section__radio');
		tabRadios.forEach((radio) => {
			radio.addEventListener('change', this.createTable.bind(this, radio.value, null));
		});

		const clearInputBtn = document.querySelector('.section__btn_clear');
		clearInputBtn.addEventListener('click', clearInput);

		const inputSearch = document.querySelector('#input-search');
		inputSearch.addEventListener('input', this.searchData.bind(this));

		this.createTable('worker');
	}

	async getData(tableName) {
		const dataRaw = await this.database.select(tableName);
		const data = dataRaw
			.sort((item1, item2) => item1[`${tableName}_id`] - item2[`${tableName}_id`])
			.map((item) => {
				for (let key in item) {
					item[key] = item[key] || 'NULL';
				}
				return item;
			});
		return data;
	}

	async searchData() {
		const tableName = document.querySelector('.section__radio:checked').value;
		const data = await this.getData(tableName);

		const searchValue = document.querySelector('#input-search').value;
		const filteredData = data.filter((item) => {
			const summary = Object.values(item).join(' ');
			return summary.includes(searchValue);
		});
		this.createTable(tableName, filteredData);
	}

	async createTable(tableName, filteredData) {
		const data = filteredData || (await this.getData(tableName));

		const wrapper = document.querySelector('.content-wrapper');
		wrapper.classList.add('content-wrapper_table');
		while (wrapper.firstChild) {
			wrapper.removeChild(wrapper.firstChild);
		}

		const table = document.createElement('div');
		table.classList.add('table', 'table_data');

		const tableHeader = document
			.querySelector(`#${tableName}-header-template`)
			.content.cloneNode(true);
		document.documentElement.style.setProperty(
			'--num-of-cols',
			`${tableHeader.children.length}`
		);
		table.append(tableHeader);

		const tableRowTemplate = document.querySelector(`#${tableName}-row-template`);
		data.forEach((item, i) => {
			const tableRow = tableRowTemplate.content.cloneNode(true);
			if (i % 2 !== 0) {
				for (let cell of tableRow.children) {
					cell.classList.add('cell_colored');
				}
			}

			for (let key in item) {
				const cell = tableRow.querySelector(`.cell[content="${key}"]`);
				if (cell) cell.textContent = item[key];
			}
			table.appendChild(tableRow);
		});

		const tableContainer = document.createElement('div');
		tableContainer.classList.add('content_table');
		wrapper.appendChild(tableContainer);
		tableContainer.appendChild(table);
	}
}

const data = new Data(Database, Events);
