import '@styles/main.css';
import Database from '@modules/Database';
import cytoscape from 'cytoscape';

class People {
    constructor(database) {

        this.database = database;

        const toggleNav = (e) => {
            let navContainer = document.querySelector('.nav-container');
            navContainer.classList.toggle('nav-container_closed');

            e.currentTarget.classList.toggle('nav__toggler-btn_open');
        };

        const toggleView = () => {
            let wrapper = document.querySelector('.content-wrapper');
            let content = document.querySelector('.content');

            wrapper.classList.toggle('content-wrapper_table');
            content.classList.toggle('content_cards');
            content.classList.toggle('content_table');
        };

        const toggleTab = (e) => {
            let title = document.querySelector('.section__title');
            let clearBtn = document.querySelector('.section__btn');
            let inputsContainer = document.querySelector('.section__inputs');
            let dataContainer = document.querySelector('#workers-list');
            let graph = document.querySelector('#graph');

            clearBtn.classList.toggle('hidden');
            inputsContainer.classList.toggle('hidden');
            dataContainer.classList.toggle('hidden');
            graph.classList.toggle('hidden');

            if (e.target.value === 'divisions') {
                title.textContent = 'Структура подразделений';
                this.createGraph();
            } else {
                title.textContent = 'Сотрудники';
            }
        };

        let navTogglerBtn = document.querySelector('.nav__toggler-btn');
        navTogglerBtn.addEventListener('click', toggleNav);

        let changeViewRadios = document.querySelectorAll('.section__container_radio .section__radio');
        changeViewRadios.forEach((radio) => {
            radio.addEventListener('change', toggleView);
        });

        let changeTabRadios = document.querySelectorAll('.section__tabs .section__radio');
        changeTabRadios.forEach((radio) => {
            radio.addEventListener('change', toggleTab);
        });
    }

    async createGraph() {
        let rows = await this.database.select('division');

        let nodes = [...rows].map( (row) => {
            return {
                data: {
                    id: row.name
                }
            };
        });

        let edges = [...rows].reduce( (arr, row, i, rows) => {
            if (!row['parent_id']) return arr;
            const edge = {
                data: {
                    source: rows.find((item) => item['division_id'] === row['parent_id']).name,
                    target: row.name
                }
            };
            arr.push(edge);
            return arr;
        }, []);

        const cy = cytoscape({
            container: document.querySelector('.section__graph'),

            boxSelectionEnabled: false,
            autounselectify: true,

            style: cytoscape
                .stylesheet()
                .selector('node')
                .css({
                    height: 50,
                    width: 200,
                    'background-fit': 'cover',
                    'border-color': '#000000',
                    'background-color': '#fff',
                    'border-width': 2,
                    'border-opacity': 1,
                    content: 'data(id)',
                    shape: 'rectangle',
                    'text-valign': 'center',
                    'text-halign': 'center',
                })
                .selector('edge')
                .css({
                    width: 1,
                    'target-arrow-shape': 'vee',
                    'line-color': '#000',
                    'target-arrow-color': '#000',
                    'curve-style': 'taxi',
                    'taxi-direction': 'downward',
                    'taxi-turn': 50,
                    'taxi-turn-min-distance': 5,
                }),

            elements: {
                nodes,
                edges
            },

            layout: {
                name: 'breadthfirst',
                directed: true,
                padding: 10,
            },
        });
    }
}

const people = new People(new Database());