import Database from '@modules/Database';

export default class Events {
	constructor() {
		this.database = new Database();
		this.createEvents();
	}

	async createEvents() {
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
		const days = nextEvents.reduce((res, event) => {
			const dateString = `${event.fullDate.getFullYear()} ${
				event.fullDate.getMonth() + 1
			} ${event.fullDate.getDate()}`;
			if (!(dateString in res)) res[dateString] = [];
			res[dateString].push(event);
			return res;
		}, {});

		const daysContainer = document.querySelector('.calendar__list');
		const createDay = async ([date, events]) => {
			const createEvent = async (event) => {
				const eventTemplate = document.querySelector('#event-template');
				const eventElem = eventTemplate.content
					.cloneNode(true)
					.querySelector('.events__item');
				const eventTime = eventElem.querySelector('.events__time');
				eventTime.textContent = event.start.replace(/:00$/g, '');
				const eventColor = eventElem.querySelector('.day__color');
				eventColor.style.backgroundColor = event.color;
				const eventAuthor = eventElem.querySelector('.events__author');
				const [worker] = await this.database.select('worker', {worker_id: event.worker_id});
				eventAuthor.textContent = worker.position;
				const eventDesc = eventElem.querySelector('.events__name');
				eventDesc.textContent = event.description;
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

			const eventsContainer = dayElem.querySelector('.events');
			for (let evt of events) createEvent(evt);
			daysContainer.appendChild(dayElem);
		};

		for (const day of Object.entries(days)) createDay(day);
	}
}
