import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/events.css';
import '@styles/graph.css';
import '@styles/persona.css';

import Database from '@modules/Database';
import cytoscape from 'cytoscape';
import Chart from 'chart.js/auto';
import FIRO from '@modules/FIRO-B';
import Events from '@modules/events';

class Workers {
	constructor(database) {
		this.database = database;

		const toggleNav = (e) => {
			let navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');

			e.currentTarget.classList.toggle('nav__toggler-btn_open');
		};

		const toggleTab = (e) => {
			let title = document.querySelector('.section__title');
			let clearBtn = document.querySelector('.section__btn');
			let inputsContainer = document.querySelector('.section__inputs');
			let dataContainer = document.querySelector('#workers-list');
			let graph = document.querySelector('#graph');

			clearBtn.classList.toggle('hidden');
			inputsContainer.classList.toggle('hidden');
			dataContainer.classList.toggle('hidden');
			graph.classList.toggle('hidden');

			if (e.target.value === 'divisions') {
				title.textContent = 'Структура подразделений';
				this.createGraph();
			} else {
				title.textContent = 'Сотрудники';
			}
		};

		let navTogglerBtn = document.querySelector('.nav__toggler-btn');
		navTogglerBtn.addEventListener('click', toggleNav);

		let changeTabRadios = document.querySelectorAll('.section__tabs .section__radio');
		changeTabRadios.forEach((radio) => {
			radio.addEventListener('change', toggleTab);
		});

		const radioCardsView = document.querySelector('#radio-cards');
		const radioTableView = document.querySelector('#radio-table');
		radioCardsView.addEventListener('change', this.createCards.bind(this));
		radioTableView.addEventListener('change', this.createTable.bind(this));

		this.createCards();
	}

	async createGraph() {
		let rows = await this.database.select('division');

		let nodes = [...rows].map((row) => {
			return {
				data: {
					id: row.name,
				},
			};
		});

		let edges = [...rows].reduce((arr, row, i, rows) => {
			if (!row['parent_id']) return arr;
			const edge = {
				data: {
					source: rows.find((item) => item['division_id'] === row['parent_id']).name,
					target: row.name,
				},
			};
			arr.push(edge);
			return arr;
		}, []);

		const cy = cytoscape({
			container: document.querySelector('.section__graph'),

			boxSelectionEnabled: false,
			autounselectify: true,

			style: cytoscape
				.stylesheet()
				.selector('node')
				.css({
					height: 50,
					width: 200,
					'background-fit': 'cover',
					'border-color': '#000000',
					'background-color': '#fff',
					'border-width': 2,
					'border-opacity': 1,
					content: 'data(id)',
					shape: 'rectangle',
					'text-valign': 'center',
					'text-halign': 'center',
				})
				.selector('edge')
				.css({
					width: 1,
					'target-arrow-shape': 'vee',
					'line-color': '#000',
					'target-arrow-color': '#000',
					'curve-style': 'taxi',
					'taxi-direction': 'downward',
					'taxi-turn': 50,
					'taxi-turn-min-distance': 5,
				}),

			elements: {
				nodes,
				edges,
			},

			layout: {
				name: 'breadthfirst',
				directed: true,
				padding: 10,
			},
		});
	}

	async getWorkersData() {
		let workers = await this.database.select('worker');
		let divisions = await this.database.select('division');

		let divisionsNameMap = new Map(
			[...divisions].map((division) => [+division.division_id, division.name])
		);
		workers.sort((workerFirst, workerSecond) => workerFirst.worker_id - workerSecond.worker_id);
		workers.forEach((worker) => {
			worker.worker_id = +worker.worker_id;
			worker.fullname = `${worker.surname} ${worker.name}`;
			worker.age = `${Math.floor(
				(new Date() - new Date(Date.parse(worker.birthdate))) / 3.154e10
			)} лет`;
			worker.division_id = +worker.division_id;
			worker.division = divisionsNameMap.get(worker.division_id);
			worker.salary = `${worker.salary}₽`;
			worker.firo = JSON.parse(worker.firo);
			worker.birthdate = new Date(worker.birthdate).toLocaleDateString();
			worker.employment = new Date(worker.employment).toLocaleDateString();
			worker.dismissal = worker.dismissal
				? new Date(worker.dismissal).toLocaleDateString()
				: '-';
		});

		return workers;
	}

	async createCards() {
		const workers = await this.getWorkersData();

		const wrapper = document.querySelector('.content-wrapper');
		wrapper.classList.remove('content-wrapper_table');
		while (wrapper.firstChild) {
			wrapper.removeChild(wrapper.firstChild);
		}

		const cardsContainer = document.createElement('ul');
		cardsContainer.classList.add('content_cards');
		cardsContainer.role = 'list';
		cardsContainer.ariaLabel = 'Список сотрудников';

		const template = document.querySelector('#card-template');
		workers.forEach((worker) => {
			let workerCard = template.content.cloneNode(true).querySelector('.card');

			workerCard.querySelector('.card__avatar').src =
				worker.avatar || './images/avatars/default-avatar.png';
			for (let prop in worker) {
				let cardData = workerCard.querySelector(`.card__${prop}`);
				if (cardData) cardData.textContent = worker[prop];
			}

			let moreBtn = workerCard.querySelector('.card__btn_more');
			moreBtn.addEventListener('click', () => {
				this.createPersona(worker.worker_id);
			});

			cardsContainer.append(workerCard);
		});

		wrapper.appendChild(cardsContainer);
	}

	async createTable() {
		const workers = await this.getWorkersData();

		const wrapper = document.querySelector('.content-wrapper');
		wrapper.classList.add('content-wrapper_table');

		while (wrapper.firstChild) {
			wrapper.removeChild(wrapper.firstChild);
		}

		const table = document.createElement('div');
		table.classList.add('table_worker');

		const tableHeader = document
			.querySelector('#table-header-template')
			.content.cloneNode(true);
		table.append(tableHeader);

		const tableRowTemplate = document.querySelector('#table-row-template');
		workers.forEach((worker, i) => {
			const tableRow = tableRowTemplate.content.cloneNode(true);
			if (i % 2 !== 0) {
				for (let cell of tableRow.children) {
					cell.classList.add('cell_colored');
				}
			}

			for (let key in worker) {
				const data = tableRow.querySelector(`.cell[content="${key}"]`);
				if (data) data.textContent = worker[key];
			}
			table.appendChild(tableRow);
		});

		const tableContainer = document.createElement('div');
		tableContainer.classList.add('content_table');
		wrapper.appendChild(tableContainer);
		tableContainer.appendChild(table);
	}

	async createPersona(id) {
		let workers = await this.getWorkersData();
		let worker = workers.find((worker) => worker.worker_id === id);
		let personaTemplate = document.querySelector('#persona-template');
		let persona = personaTemplate.content.cloneNode(true).querySelector('.persona');
		let container = document.querySelector('.container');

		console.log(worker);

		const setPersonaInfo = () => {
			let avatar = persona.querySelector('.persona__avatar');
			avatar.src = worker.avatar || './images/avatars/default-avatar.png';
			for (let prop in worker) {
				let elem = persona.querySelector(`[persona-${prop}]`);
				if (elem) elem.textContent = worker[prop];
			}
		};

		setPersonaInfo();

		let closeBtn = persona.querySelector('.persona__btn');
		closeBtn.addEventListener('click', () => {
			persona.remove();
		});

		if (!worker.firo) {
			persona.classList.add('persona_no-charts');
			container.append(persona);
			return;
		}

		const setPersonaCompatibility = () => {
			const coworkers = workers.filter(
				(coworker) =>
					coworker.division_id === worker.division_id &&
					coworker.worker_id !== worker.worker_id &&
					coworker.firo !== null
			);
			const compatibilities = coworkers.map((coworker) => {
				let compatibility = {
					worker,
					coworker,
					firo: {
						I: 0,
						C: 0,
						A: 0,
					},
				};

				let incompatibility = 0;
				for (let key in compatibility.firo) {
					compatibility.firo[key] =
						Math.abs(worker.firo[key].e - coworker.firo[key].w) +
						Math.abs(coworker.firo[key].e - worker.firo[key].w);
					if (compatibility.firo[key] < 6) incompatibility++;
				}

				compatibility.status =
					incompatibility === 0 ? 'success' : incompatibility === 1 ? 'alert' : 'error';

				return compatibility;
			});

			let compatibilityElem = persona.querySelector('.persona__compatibility');
			let compatibilityIcon = persona.querySelector('.persona__compatibility__icon use');
			let compatibilityText = persona.querySelector('.persona__status');

			if (compatibilities.find((comp) => comp.status === 'error')) {
				compatibilityElem.classList.add('persona__compatibility_error');
				compatibilityIcon.setAttribute(
					'xlink:href',
					'./images/icons/svg/icons.svg#error-icon'
				);
				compatibilityText.textContent = 'Высокий риск несовместимости сотрудников';
			} else if (compatibilities.find((comp) => comp.status === 'alert')) {
				compatibilityElem.classList.add('persona__compatibility_alert');
				compatibilityIcon.setAttribute(
					'xlink:href',
					'./images/icons/svg/icons.svg#question-icon'
				);
				compatibilityText.textContent = 'Риск несовместимости сотрудников';
			} else {
				compatibilityElem.classList.add('persona__compatibility_success');
				compatibilityIcon.setAttribute(
					'xlink:href',
					'./images/icons/svg/icons.svg#success-icon'
				);
				compatibilityText.textContent = 'Полная совместимость сотрудников';
			}
		};

		const setPersonaStats = () => {
			let score = [];
			for (let prop in worker.firo) {
				score.push(...Object.values(worker.firo[prop]));
				document.documentElement.style.setProperty(`--${prop}`, worker.firo[prop].e);

				for (let key in worker.firo[prop]) {
					let description = persona.querySelector(`[scale="${prop + key}"]`);
					description.textContent = `${prop}${key}: ${
						FIRO.meaning[`${prop}${key}`][worker.firo[prop][key] < 5 ? 'low' : 'high']
					}`;
				}
			}

			container.append(persona);
			const radarContainer = persona.querySelector('#radar');
			this.createChart(radarContainer, score);
		};

		setPersonaCompatibility();

		setPersonaStats();
	}

	createChart(ctx, score) {
		const data = {
			labels: ['Ie', 'Iw', 'Ce', 'Cw', 'Ae', 'Aw'],
			datasets: [
				{
					label: 'Баллы по шкалам',
					data: score,
					fill: true,
					backgroundColor: 'rgba(100, 39, 241, 0.4)',
					borderColor: 'rgb(100, 39, 241)',
					pointBackgroundColor: 'rgb(100, 39, 241)',
					pointBorderColor: '#fff',
					pointHoverBackgroundColor: '#fff',
					pointHoverBorderColor: 'rgb(100, 39, 241)',
				},
				{
					label: '',
					data: [0, 0, 0, 9, 9, 9],
					fill: true,
					backgroundColor: 'transparent',
					borderColor: 'transparent',
					pointBackgroundColor: 'transparent',
					pointBorderColor: 'transparent',
					pointHoverBackgroundColor: 'transparent',
					pointHoverBorderColor: 'transparent',
				},
			],
		};

		const config = {
			type: 'radar',
			data: data,
			options: {
				elements: {
					line: {
						borderWidth: 4,
					},
				},
			},
		};

		Chart.defaults.font.size = 16;
		new Chart(ctx, config);
	}
}

const workers = new Workers(new Database());
const events = new Events();
