import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/management.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Testing {
	constructor(Database, Events) {
		this.database = new Database();
		this.events = new Events(this.database);

        const navTogglerBtn = document.querySelector('.nav__toggler-btn');
		const toggleNav = (e) => {
			const navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');
			e.currentTarget.classList.toggle('nav__toggler-btn_open');
		};
		navTogglerBtn.addEventListener('click', toggleNav);
	}
}

const testing = new Testing(Database, Events);
