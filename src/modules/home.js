import '@styles/main.css';
import Database from '@modules/Database';

class App {
    constructor(Database) {
        this.database = new Database();

        let navTogglerBtn = document.querySelector('.nav__toggler-btn');
        navTogglerBtn.addEventListener('click', (e) => {
            let navContainer = document.querySelector('.nav-container');
            navContainer.classList.toggle('nav-container_closed');

            e.currentTarget.classList.toggle('nav__toggler-btn_open');
        });
    }
}

const app = new App(Database);