import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/tasks.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/events.css';
import '@styles/calendar.css';

import CircleProgress from '@modules/CircleProgress';
import Database from '@modules/Database';
import Events from '@modules/events';

class Calendar {
	constructor() {
		this.currentDate = new Date();
		this.setCalendar();

		const setMonth = (e) => {
			const setMonthBtn = e.currentTarget;
			const newMonth =
				setMonthBtn.id === 'btn-prev-month'
					? this.currentDate.getMonth() - 1
					: this.currentDate.getMonth() + 1;
			this.currentDate = new Date(this.currentDate.setMonth(newMonth));
			console.log(this.currentDate);
			this.setCalendar();
		};

		const prevMonthBtn = document.querySelector('#btn-prev-month');
		const nextMonthBtn = document.querySelector('#btn-next-month');
		prevMonthBtn.addEventListener('click', setMonth);
		nextMonthBtn.addEventListener('click', setMonth);
	}

	setCalendar() {
		const calendarGrid = document.querySelector('.calendar__grid');
		const year = this.currentDate.getFullYear();
		const month = this.currentDate.getMonth() + 1;

		const setCalendarYearMonth = () => {
			const calendarYearEl = document.querySelector('#calendar-year');
			const calendarMonthEl = document.querySelector('#calendar-month');

			calendarYearEl.textContent = this.currentDate.getFullYear();
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
			calendarMonthEl.textContent = monthMap[this.currentDate.getMonth()];
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
				const appendGridCell = (content) => {
					const gridCell = document.createElement('div');
					gridCell.classList.add('calendar__cell');
					if (currentCell % 7 === 0) gridCell.classList.add('calendar__cell_right');
					if ((currentCell - 1) % 7 === 0) gridCell.classList.add('calendar__cell_left');
					if (currentCell > 35) gridCell.classList.add('calendar__cell_bottom');
					gridCell.textContent = content;
					calendarGrid.appendChild(gridCell);
				};

				let availableCells = 42;
				let currentCell = 1;

				for (
					let firstDay = new Date(year, month - 1, 1).getDay() || 7,
						date = new Date(year, month - 1, 0).getDate() - firstDay + 2;
					firstDay > 1;
					date++, availableCells--, firstDay--, currentCell++
				) {
					appendGridCell(date);
				}
				for (
					let date = 1;
					date <= new Date(year, month, 0).getDate();
					date++, availableCells--, currentCell++
				) {
					appendGridCell(date);
				}
				for (let date = 1; availableCells > 0; date++, availableCells--, currentCell++) {
					appendGridCell(date);
				}
			};

			clearCalendarCells();
			setGridHeader();
			setGridCells();
		};

		const setEvents = () => {};

		setCalendarYearMonth();
		setCalendarDays();
		setEvents();
	}
}

const calendar = new Calendar();
const events = new Events();
