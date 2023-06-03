import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/data.css';
import '@styles/calendar.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Calendar {
	constructor() {
		this.database = new Database();
		this.events = new Events(this.database);
		this.currentDate = new Date();

		const setMonth = (e) => {
			const currentMonth = this.currentDate.getMonth();
			const currentYear = this.currentDate.getFullYear();

			const setMonthBtn = e.currentTarget;
			const newMonth =
				setMonthBtn.id === 'btn-prev-month' ? currentMonth - 1 : currentMonth + 1;
			const newDate = new Date(currentYear, newMonth);
			this.currentDate = newDate;
			this.setCalendar(this.currentDate);
		};

		const prevMonthBtn = document.querySelector('#btn-prev-month');
		const nextMonthBtn = document.querySelector('#btn-next-month');
		prevMonthBtn.addEventListener('click', setMonth);
		nextMonthBtn.addEventListener('click', setMonth);

		const closeModal = () => {
			const modal = document.querySelector('.calendar__modal');
			modal.close();
		};

		const closeModalBtn = document.querySelector('.modal__btn_close');
		const addEventBtn = document.querySelector('.modal__btn_add');
		closeModalBtn.addEventListener('click', closeModal);
		addEventBtn.addEventListener('click', this.addEvent.bind(this));

		this.setCalendar(this.currentDate);
	}

	setCalendar(date) {
		const calendarGrid = document.querySelector('.calendar__grid');

		const setCalendarYearMonth = () => {
			const calendarYearEl = document.querySelector('#calendar-year');
			const calendarMonthEl = document.querySelector('#calendar-month');

			calendarYearEl.textContent = date.getFullYear();
			const monthMap = {
				0: 'Январь',
				1: 'Февраль',
				2: 'Март',
				3: 'Апрель',
				4: 'Май',
				5: 'Июнь',
				6: 'Июль',
				7: 'Август',
				8: 'Сентябрь',
				9: 'Октябрь',
				10: 'Ноябрь',
				11: 'Декабрь',
			};
			calendarMonthEl.textContent = monthMap[date.getMonth()];
		};

		const setCalendarDays = () => {
			const clearCalendarCells = () => {
				while (calendarGrid.firstChild) calendarGrid.removeChild(calendarGrid.firstChild);
			};

			const setGridHeader = () => {
				const weekDays = {
					1: 'Понедельник',
					2: 'Вторник',
					3: 'Среда',
					4: 'Четверг',
					5: 'Пятница',
					6: 'Суббота',
					7: 'Воскресенье',
				};
				for (let i = 1; i <= 7; i++) {
					const headerCell = document.createElement('div');
					headerCell.classList.add('calendar__cell', 'calendar__cell_top');
					if (i === 1) headerCell.classList.add('calendar__cell_left');
					if (i === 7) headerCell.classList.add('calendar__cell_right');
					headerCell.textContent = weekDays[i];
					calendarGrid.appendChild(headerCell);
				}
			};

			const setGridCells = () => {
				const appendGridCell = (cellDate, cellNum) => {
					const gridCell = document.createElement('div');
					const cellYear = cellDate.getFullYear();
					const cellMonth = cellDate.getMonth();
					const cellDay = cellDate.getDate();

					const formatNumber = (number) => {
						return String(number).length < 2 ? `0${number}` : number;
					};

					const formatDate = `${cellYear}-${formatNumber(cellMonth + 1)}-${formatNumber(
						cellDay
					)}`;
					gridCell.setAttribute('date', formatDate);
					gridCell.classList.add('calendar__cell');
					if (cellNum % 7 === 0) gridCell.classList.add('calendar__cell_right');
					if ((cellNum - 1) % 7 === 0) gridCell.classList.add('calendar__cell_left');
					if (cellNum > 35) gridCell.classList.add('calendar__cell_bottom');
					gridCell.textContent = cellDay;

					const appendNewEventBtn = () => {
						const openModal = () => {
							const modal = document.querySelector('.calendar__modal');
							const modalDay = modal.querySelector('#new-event-day');
							modalDay.textContent = cellDay;
							const modalMonth = modal.querySelector('#new-event-month');
							const monthMap = {
								0: 'Января',
								1: 'Февраля',
								2: 'Марта',
								3: 'Апреля',
								4: 'Мая',
								5: 'Июня',
								6: 'Июля',
								7: 'Августа',
								8: 'Сентября',
								9: 'Октября',
								10: 'Ноября',
								11: 'Декабря',
							};
							modalMonth.textContent = monthMap[cellMonth];
							modal.setAttribute('date', formatDate);
							modal.showModal();
						};

						const btnTemplate = document.querySelector('#btn-event-template');
						const btnAddEvent = btnTemplate.content
							.cloneNode(true)
							.querySelector('.calendar__cell__btn');
						btnAddEvent.addEventListener('click', openModal);
						gridCell.appendChild(btnAddEvent);
					};

					if (new Date(cellYear, cellMonth, cellDay, 23, 59, 59) > new Date()) {
						appendNewEventBtn();
					}
					calendarGrid.appendChild(gridCell);
				};

				for (
					let currentYear = date.getFullYear(),
						currentMonth = date.getMonth(),
						availableCells = 42,
						currentCell = 1,
						firstWeekDay = new Date(currentYear, currentMonth, 1).getDay() || 7,
						day = new Date(currentYear, currentMonth, 0).getDate() - firstWeekDay + 2;
					availableCells > 0;
					day++, availableCells--, currentCell++
				) {
					appendGridCell(new Date(currentYear, currentMonth - 1, day), currentCell);
				}
			};

			clearCalendarCells();
			setGridHeader();
			setGridCells();
		};

		setCalendarYearMonth();
		setCalendarDays();
		this.setEvents();
	}

	async setEvents() {
		const calendarGrid = document.querySelector('.calendar__grid');
		const clearAllEvents = () => {
			const allEvents = calendarGrid.querySelectorAll('.calendar__event');
			allEvents.forEach((event) => event.remove());
		};

		const allEvents = await this.database.select('event');
		const monthEvents = allEvents
			.filter((event) => {
				let [, month] = event.date.split('-');
				const currentMonth = this.currentDate.getMonth() + 1;
				return (
					currentMonth - 1 === +month ||
					currentMonth === +month ||
					currentMonth + 1 === +month
				);
			})
			.sort((event1, event2) => {
				const createDate = (event) => {
					const [year, month, day] = event.date.split('-');
					return new Date(year, month - 1, day, ...event.start.split(':'));
				};
				return createDate(event1) - createDate(event2);
			});

		clearAllEvents();
		for (let evt of monthEvents) {
			const eventEl = document.createElement('div');
			eventEl.classList.add('calendar__event');
			eventEl.style.backgroundColor = evt.color;
			eventEl.textContent = evt.title;

			const dayCell = calendarGrid.querySelector(`.calendar__cell[date="${evt.date}"]`);
			dayCell.appendChild(eventEl);
		}
	}

	async addEvent() {
		const modalEvent = document.querySelector('.calendar__modal');
		const modalForm = modalEvent.querySelector('.modal__form');

		const formData = new FormData(modalForm);
		const values = {
			worker_id: sessionStorage.getItem('id'),
			date: modalEvent.getAttribute('date'),
		};
		for (let [key, value] of formData) values[key] = value;
		await this.database.insert('event', values);

		modalForm.reset();
		this.setEvents();
		this.events.createEvents();
	}
}

const calendar = new Calendar(Database, Events);
