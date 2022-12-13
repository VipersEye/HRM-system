import '@styles/main.css';
import CircleProgress from '@modules/CircleProgress';
import Database from '@modules/Database';

class Home {
    constructor(Database) {
        this.database = new Database();

        let navTogglerBtn = document.querySelector('.nav__toggler-btn');
        navTogglerBtn.addEventListener('click', (e) => {
            let navContainer = document.querySelector('.nav-container');
            navContainer.classList.toggle('nav-container_closed');

            e.currentTarget.classList.toggle('nav__toggler-btn_open');
        });

        const diagrams = document.querySelectorAll('.tasks__diagram');
        diagrams.forEach((diagram) => {
            const circleDiagram = new CircleProgress(diagram, {
                animationDuration: 900,
            });
            circleDiagram.min = 0;
            circleDiagram.max = 100;
            circleDiagram.value = Math.floor(Math.random() * 100);
            circleDiagram.textFormat = 'percent';
            circleDiagram.indeterminateText = '0';
            circleDiagram.animation = 'easeInCubic';
        });
    }
}

const home = new Home(Database);