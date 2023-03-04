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

        const changeSectionVisibility = (e) => {
            let toggleBtn = e.currentTarget;
            let currentSectionStatus = toggleBtn.ariaExpanded === 'false' ? false : true;
            toggleBtn.ariaExpanded = !currentSectionStatus;
        };

        let expandSectionBtn = document.querySelector('.section__btn[aria-expanded]');
        expandSectionBtn.addEventListener('click', changeSectionVisibility);

        (async () => {
            let numOfCandidates = (await this.getCandidatesData()).length;
            let cardsContainer = document.querySelector('.content');
            let containerWidth = cardsContainer.getBoundingClientRect().width;
            let containerGap = parseFloat(getComputedStyle(cardsContainer)['gap']);
            let cardWidth = parseFloat(getComputedStyle(cardsContainer)['gridTemplateColumns'].split(' ')[0]);
            const rows = 4;
            let cols = 1;
            while (cardWidth * (cols + 1) + containerGap * cols < containerWidth + 10) cols++;
            let maxCardsOnPage = cols * rows;

            let numofPages = Math.floor(numOfCandidates / maxCardsOnPage);
            let pageBtnsContainer = document.querySelector('.content__page-btns');
            for (let i = 0; i < numofPages; i++) {
                let pageBtn = document.createElement('button');
                pageBtn.classList.add('content__page-btn');
                pageBtn.type = 'button';
                pageBtn.textContent = `${i + 1}`;
                pageBtn.ariaPressed = i === 0 ? true : false;

                const setPage = async (e) => {
                    let pageBtn = e.currentTarget;
                    let currentPageBtn = [...pageBtnsContainer.children].find((btn) => btn.ariaPressed === 'true');
                    currentPageBtn.ariaPressed = false;
                    pageBtn.ariaPressed = true;

                    [...cardsContainer.children].forEach((node) => cardsContainer.removeChild(node));
                    let page = +pageBtn.textContent;
                    let starCard = page * maxCardsOnPage;
                    let endCard = (page + 1) * maxCardsOnPage;
                    await this.createCards(starCard, endCard);
                };
                pageBtn.addEventListener('click', setPage);

                pageBtnsContainer.appendChild(pageBtn);
            }

            await this.createCards(0, maxCardsOnPage);

        })();

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
    }

    async getCandidatesData() {
        return (await this.database.select('candidate')).sort((a, b) => a.candidate_id - b.candidate_id);
    }

    async createCards(start = 0, end) {
        let candidatesData = (await this.getCandidatesData()).slice(start, end);
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