import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/management.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Data {
	constructor(Database, Events) {
		this.database = new Database();
		this.events = new Events();

		const navTogglerBtn = document.querySelector('.nav__toggler-btn');
		const toggleNav = (e) => {
			const navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');
			e.currentTarget.classList.toggle('nav__toggler-btn_open');
		};
		navTogglerBtn.addEventListener('click', toggleNav);

		const tabRadios = document.querySelectorAll('.section__radio');
		tabRadios.forEach((radio) => {
			radio.addEventListener('change', this.createTable.bind(this, radio.value, null));
		});

		const clearInputBtn = document.querySelector('.section__btn_clear');
		const clearInput = () => {
			const input = document.querySelector('#input-search');
			input.value = '';
			input.dispatchEvent(new Event('input'));
		};
		clearInputBtn.addEventListener('click', clearInput);

		const inputSearch = document.querySelector('#input-search');
		inputSearch.addEventListener('input', this.searchData.bind(this));

		const btnToggleMode = document.querySelector('.section__btn_edit');
		const toggleMode = (e) => {
			const btnMode = e.currentTarget;
			btnMode.classList.toggle('section__btn_active');
			const table = document.querySelector('.table_data');
			table.classList.toggle('table_editable');

			const tableCells = document.querySelectorAll(
				'.cell:not(.cell_header):not(.cell_first)'
			);
			tableCells.forEach((cell) => {
				cell.contentEditable = table.classList.contains('table_editable');
			});
		};
		btnToggleMode.addEventListener('click', toggleMode);

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
		const btnModeToggle = document.querySelector('.section__btn_edit');
		if (btnModeToggle.classList.contains('section__btn_active')) {
			table.classList.add('table_editable');
		}

		const tableHeader = document
			.querySelector(`#${tableName}-header-template`)
			.content.cloneNode(true);
		document.documentElement.style.setProperty(
			'--num-of-cols',
			`${tableHeader.children.length}`
		);
		table.append(tableHeader);

		const tableRowTemplate = document.querySelector(`#${tableName}-row-template`);
		const deleteBtnTemplate = document.querySelector('#delete-btn-template');
		const primaryKey = `${tableName}_id`;
		data.forEach((item, i) => {
			const tableRow = tableRowTemplate.content.cloneNode(true);
			if (i % 2 !== 0) {
				for (let cell of tableRow.children) {
					cell.classList.add('cell_colored');
				}
			}

			for (let key in item) {
				const cell = tableRow.querySelector(`.cell[content="${key}"]`);
				cell.setAttribute(primaryKey, item[primaryKey]);
				if (cell) cell.textContent = item[key];
			}

			const addDeleteBtn = () => {
				const firstCell = tableRow.querySelector('.cell_first');
				const btnDelete = deleteBtnTemplate.content
					.cloneNode(true)
					.querySelector('.cell__btn');
				btnDelete.setAttribute(primaryKey, item[primaryKey]);

				const deleteRow = async () => {
					const conditions = {
						[primaryKey]: item[primaryKey],
					};
					await this.database.delete(tableName, conditions);
					this.createTable(tableName);
					this.events.createEvents();
				};
				btnDelete.addEventListener('click', deleteRow);

				firstCell.appendChild(btnDelete);
			};
			addDeleteBtn();

			table.appendChild(tableRow);
		});

		const changeBtnDeleteVisibility = (e) => {
			const table = document.querySelector('.table_data');
			if (
				!e.target.classList.contains('cell') ||
				e.target.classList.contains('cell_header') ||
				!table.classList.contains('table_editable')
			) {
				return;
			}
			const cell = e.target;
			const primaryKeyValue = cell.getAttribute(primaryKey);
			const btnDelete = document.querySelector(
				`.cell__btn[${primaryKey}="${primaryKeyValue}"]`
			);
			const eventType = e.type;
			btnDelete.style.opacity = eventType === 'mouseover' ? 1 : 0;
		};
		table.addEventListener('mouseover', changeBtnDeleteVisibility);
		table.addEventListener('mouseout', changeBtnDeleteVisibility);

		const updateData = (e) => {
			if (!e.target.classList.contains('cell')) {
				return;
			}
			const cell = e.target;
			const values = {
				[cell.getAttribute('content')]: cell.textContent,
			};
			const conditions = {
				[primaryKey]: cell.getAttribute(primaryKey),
			};
			this.database.update(tableName, values, conditions);
		};
		table.addEventListener('input', updateData);

		const tableContainer = document.createElement('div');
		tableContainer.classList.add('content_table');
		wrapper.appendChild(tableContainer);
		tableContainer.appendChild(table);
	}
}

const data = new Data(Database, Events);
