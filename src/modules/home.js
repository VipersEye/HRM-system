import '@styles/default.css';
import '@styles/main.css';
import '@styles/section.css';
import '@styles/tasks.css';
import '@styles/sorting-fields.css';
import '@styles/data.css';
import '@styles/calendar.css';

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

        this.createCards();
    }

    async createCards() {
        let candidatesData = (await this.database.select('candidate')).sort((a, b) => a.candidate_id - b.candidate_id);
        let cardsContainer = document.querySelector('.content');
        let candidateCardTemplate = document.querySelector('#candidate-template');

        for (let candidateData of candidatesData) {
            let candidateCard = candidateCardTemplate.content.cloneNode(true).querySelector('.content__item');
            let candidateAvatar = candidateCard.querySelector('.card__avatar');
            candidateAvatar.src = candidateData.avatar;
            let candidateFullName = candidateCard.querySelector('.card__fullname');
            candidateFullName.textContent = `${candidateData.name} ${candidateData.surname}`;
            let candidatePosition = candidateCard.querySelector('.card__position');
            candidatePosition.textContent = candidateData.position;
            cardsContainer.appendChild(candidateCard);
        }
    }
}

const home = new Home(Database);