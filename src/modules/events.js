import '@styles/events.css';

export default class Events {
	constructor(database) {
		this.database = database;
		this.createEvents();
	}

	async createEvents() {
		const workers = await this.database.select('worker');
		const nextEvents = await this.getNextEvents();
		const days = nextEvents.reduce((res, event) => {
			const dateString = `${event.fullDate.getFullYear()} ${
				event.fullDate.getMonth() + 1
			} ${event.fullDate.getDate()}`;
			if (!(dateString in res)) res[dateString] = [];
			res[dateString].push(event);
			return res;
		}, {});

		const daysContainer = document.querySelector('.events__list');
		const clearDaysContainer = () => {
			while (daysContainer.firstChild) daysContainer.removeChild(daysContainer.firstChild);
		};
		const createDay = ([date, events]) => {
			const createEvent = ({start, color, worker_id: eventWorkerID, title}) => {
				const eventTemplate = document.querySelector('#event-template');
				const eventElem = eventTemplate.content.cloneNode(true).querySelector('.event');
				const eventTime = eventElem.querySelector('.event__time');
				eventTime.textContent = start.replace(/:00$/g, '');
				const eventColor = eventElem.querySelector('.event__color');
				eventColor.style.backgroundColor = color;
				const eventAuthor = eventElem.querySelector('.event__author');
				const worker = workers.find(({worker_id}) => worker_id === eventWorkerID);
				eventAuthor.textContent = worker.position;
				const eventTitle = eventElem.querySelector('.event__name');
				eventTitle.textContent = title;
				eventsContainer.appendChild(eventElem);
			};

			const dayTemplate = document.querySelector('#day-template');
			const dayElem = dayTemplate.content.cloneNode(true).querySelector('.day');
			const dayTitle = dayElem.querySelector('.day__title');
			const monthMap = {
				1: 'Января',
				2: 'Февраля',
				3: 'Марта',
				4: 'Апреля',
				5: 'Мая',
				6: 'Июня',
				7: 'Июля',
				8: 'Августа',
				9: 'Сентября',
				10: 'Октября',
				11: 'Ноября',
				12: 'Декабря',
			};
			dayTitle.textContent = `${new Date(date).getDate()} ${
				monthMap[new Date(date).getMonth() + 1]
			}`;

			const eventsContainer = dayElem.querySelector('.day__events');
			for (let evt of events) createEvent(evt);
			daysContainer.appendChild(dayElem);
		};

		clearDaysContainer();
		for (const day of Object.entries(days)) createDay(day);
	}

	async getNextEvents() {
		const eventsData = await this.database.select('event');
		const nextEvents = eventsData
			.map((event) => {
				let [year, month, date] = event.date.split('-');
				let [hour, minutes, seconds] = event.start.split(':');
				event.fullDate = new Date(year, month - 1, date, hour, minutes, seconds);
				return event;
			})
			.filter((event) => {
				const currentDate = new Date();
				return currentDate < event.fullDate;
			})
			.sort((fEvent, sEvent) => {
				return fEvent.fullDate < sEvent.fullDate ? -1 : 1;
			});
		return nextEvents;
	}
}
