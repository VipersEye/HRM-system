import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';

import Database from '@modules/Database';
import Events from '@modules/events';

class Data {
    constructor(Database) {
        this.database = new Database();
        this.events = new Events();

        const toggleNav = (e) => {
			const navContainer = document.querySelector('.nav-container');
			navContainer.classList.toggle('nav-container_closed');

			e.currentTarget.classList.toggle('nav__toggler-btn_open');
		};

        const navTogglerBtn = document.querySelector('.nav__toggler-btn');
		navTogglerBtn.addEventListener('click', toggleNav);
    }
}

const data = new Data(Database, Events);