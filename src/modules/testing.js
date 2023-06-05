import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/testing.css';

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

		const inputFile = document.querySelector('input[type="file"]');
		inputFile.addEventListener('change', this.addTest.bind(this));
	}

	async addTest(e) {
		const [file] = e.target.files;

		const reader = new FileReader();
		reader.onload = async () => {
			try {
				const fileString = reader.result;
                const values = {
                    data: fileString
                };
                await this.database.insert('test', values);
				alert('Тест успешно добавлен');
			} catch (error) {
				alert('Произошла ошибка при чтении файла');
			}
		};
		reader.readAsText(file);
	}
}

const testing = new Testing(Database, Events);
