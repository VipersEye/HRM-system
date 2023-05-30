import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/tasks.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/events.css';
import '@styles/feeling.css';

import CircleProgress from '@modules/CircleProgress';
import Database from '@modules/Database';
import Events from '@modules/events';

class Recruiting {
	constructor(Database) {
		this.database = new Database();

		const changeNavVisibility = (e) => {
			let navToggleBtn = e.currentTarget;
			let navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');
			navToggleBtn.classList.toggle('nav__toggler-btn_open');
		};

		const changeSectionVisibility = (e) => {
			let toggleBtn = e.currentTarget;
			let currentSectionStatus = toggleBtn.ariaExpanded === 'false' ? false : true;
			toggleBtn.ariaExpanded = !currentSectionStatus;
		};

		const clearSearchFields = () => {
			let searchFields = document.querySelectorAll('.section__input');
			searchFields.forEach((field) => (field.value = ''));
			this.createPages();
		};

		const searchCandidates = async () => {
			let nameFieldValue = document.querySelector('#input-search').value.toLowerCase();
			let positionFiledValue = document.querySelector('#input-position').value.toLowerCase();

			let suitableCandidates = (await this.database.select('candidate'))
				.sort((a, b) => a.candidate_id - b.candidate_id)
				.filter(({name, surname, middlename, position}) => {
					let fullName = `${name} ${surname} ${middlename}`.toLowerCase();
					return (
						nameFieldValue.split(' ').every((value) => fullName.includes(value)) &&
						position.toLowerCase().includes(positionFiledValue)
					);
				});
			this.createPages(suitableCandidates);
		};

		let navToggleBtn = document.querySelector('.nav__toggler-btn');
		navToggleBtn.addEventListener('click', changeNavVisibility);

		let expandSectionBtn = document.querySelector('.section__btn[aria-expanded]');
		expandSectionBtn.addEventListener('click', changeSectionVisibility);

		let clearFieldsBtn = document.querySelector('.section__btn_clear');
		clearFieldsBtn.addEventListener('click', clearSearchFields);

		let searchFields = document.querySelectorAll('.section__input');
		searchFields.forEach((field) => field.addEventListener('input', searchCandidates));

		(async () => {
			let positionDataList = document.querySelector('#datalist-positions');
			let candidatesPositions = [
				...new Set((await this.getCandidatesData()).map((candidate) => candidate.position)),
			].sort((a, b) => a - b);
			for (let position of candidatesPositions) {
				let dataListOption = document.createElement('option');
				dataListOption.value = position;
				positionDataList.appendChild(dataListOption);
			}
		})();

		this.createPages();

		const diagramValues = [50, 66, 0, 75];
		const diagrams = document.querySelectorAll('.tasks__diagram');
		diagrams.forEach((diagram, i) => {
			const circleDiagram = new CircleProgress(diagram, {
				animationDuration: 900,
			});
			circleDiagram.min = 0;
			circleDiagram.max = 100;
			circleDiagram.value = diagramValues[i];
			circleDiagram.textFormat = 'percent';
			circleDiagram.indeterminateText = '0';
			circleDiagram.animation = 'easeInCubic';
		});

		this.checkFeeling();
	}

	async getCandidatesData() {
		return (await this.database.select('candidate')).sort(
			(a, b) => a.candidate_id - b.candidate_id
		);
	}

	async createPages(candidatesData) {
		const createCards = (start = 0, end) => {
			let candidatesPageData = candidatesData.slice(start, end);
			let cardsContainer = document.querySelector('.content');
			let candidateCardTemplate = document.querySelector('#candidate-template');

			[...cardsContainer.children].forEach((card) => cardsContainer.removeChild(card));
			for (let candidateData of candidatesPageData) {
				let candidateCard = candidateCardTemplate.content
					.cloneNode(true)
					.querySelector('.content__item');
				let candidateAvatar = candidateCard.querySelector('.card__avatar');
				candidateAvatar.src = candidateData.avatar;
				let candidateFullName = candidateCard.querySelector('.card__fullname');
				candidateFullName.textContent = `${candidateData.name} ${candidateData.surname}`;
				let candidatePosition = candidateCard.querySelector('.card__position');
				candidatePosition.textContent = candidateData.position;
				cardsContainer.appendChild(candidateCard);
			}
		};

		const createCorrectTitle = (num) => {
			if (/^1$|[0,2-9]+1$/.test(num)) return `${num} Кандидат`;
			else if (/^[2,3,4]$|[0,2-9]+[2,3,4]$/.test(num)) return `${num} Кандидата`;
			else if (/^[5,6,7,8,9]$|1[1,2,3,4]$|[0,5,6,7,8,9]$/.test(num))
				return `${num} Кандидатов`;
		};

		candidatesData = candidatesData || (await this.getCandidatesData());
		let numOfCandidates = candidatesData.length;
		let numOfCandidatesTitle = document.querySelector('.section__title_large');
		numOfCandidatesTitle.textContent = createCorrectTitle(numOfCandidates);

		let cardsContainer = document.querySelector('.content');
		let containerWidth = cardsContainer.getBoundingClientRect().width;
		let containerGap = parseFloat(getComputedStyle(cardsContainer)['gap']);
		let cardWidth = parseFloat(
			getComputedStyle(cardsContainer)['gridTemplateColumns'].split(' ')[0]
		);
		const rows = 3;
		let cols = 1;
		while (cardWidth * (cols + 1) + containerGap * cols < containerWidth + 10) cols++;
		let maxCardsOnPage = cols * rows;

		let numOfPages = Math.ceil(numOfCandidates / maxCardsOnPage);
		let pageBtnsContainer = document.querySelector('.content__page-btns');
		[...pageBtnsContainer.children].forEach((pageBtn) =>
			pageBtnsContainer.removeChild(pageBtn)
		);
		for (let i = 0; i < numOfPages; i++) {
			let pageBtn = document.createElement('button');
			pageBtn.classList.add('content__page-btn');
			pageBtn.type = 'button';
			pageBtn.textContent = `${i + 1}`;
			pageBtn.ariaPressed = i === 0 ? true : false;

			const setPage = (e) => {
				let pageBtn = e.currentTarget;
				let currentPageBtn = [...pageBtnsContainer.children].find(
					(btn) => btn.ariaPressed === 'true'
				);
				currentPageBtn.ariaPressed = false;
				pageBtn.ariaPressed = true;

				[...cardsContainer.children].forEach((node) => cardsContainer.removeChild(node));
				let page = +pageBtn.textContent;
				let starCard = (page - 1) * maxCardsOnPage;
				let endCard = page * maxCardsOnPage;
				createCards(starCard, endCard);
			};
			pageBtn.addEventListener('click', setPage);

			pageBtnsContainer.appendChild(pageBtn);
		}

		createCards(0, maxCardsOnPage);
	}

	checkFeeling() {
		const modalFeedback = document.querySelector('.modal__feedback');
		const modalFeeling = document.querySelector('.modal__feeling');
		const closeFeedbackBtn = document.querySelector('.feedback__btn_close');
		const addFeedbackBtn = document.querySelector('.feedback__btn_submit');
		const modalForm = modalFeedback.querySelector('.feedback__form');

		const chooseFeeling = (e) => {
			if (!e.target.classList.contains('feeling__radio')) {
				return;
			}

			const feelingValue = e.target.value;
			sessionStorage.setItem('feeling', feelingValue);
			modalFeeling.close();
			if (feelingValue < 4) {
				modalFeedback.showModal();
			}
		};

		const closeFeedbackModal = () => {
			modalForm.reset();
			modalFeedback.close();
		};

		const addFeedback = async () => {
			const formData = new FormData(modalForm);
			const values = {
				worker_id: sessionStorage.getItem('id'),
			};
			for (let [key, value] of formData) values[key] = value;
			await this.database.insert('question', values);
			modalForm.reset();
		};

		modalFeeling.addEventListener('click', chooseFeeling);
		closeFeedbackBtn.addEventListener('click', closeFeedbackModal);
		addFeedbackBtn.addEventListener('click', addFeedback);

		if (sessionStorage.getItem('feeling') === 'false') {
			modalFeeling.showModal();
		}
	}
}

const recruiting = new Recruiting(Database);
const events = new Events();
