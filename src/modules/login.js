import '@styles/main.css';
import Database from '@modules/Database';

class Login {
    constructor(Database) {
        this.database = new Database();

        const changeForm = () => {
            let loginForms = document.querySelectorAll('.form');
            loginForms.forEach((form) => {
                form.classList.toggle('form_hidden');
            });
        };

        let changeFormBtns = document.querySelectorAll('.form__btn_change-form');
        changeFormBtns.forEach((btn) => {
            btn.addEventListener('click', changeForm);
        });

        let loginBtn = document.querySelector('#btn-login');
        loginBtn.addEventListener('click', this.login.bind(this));

        let firstLoginFormInput = document.querySelector('#form-login .form__input');
        firstLoginFormInput.addEventListener('blur', () => {
            firstLoginFormInput.setCustomValidity('');
        });
        let firstRegisterFormInput = document.querySelector('#form-register .form__input');
        firstRegisterFormInput.addEventListener('blur', () => {
            firstRegisterFormInput.setCustomValidity('');
        });

        if (localStorage.length) {
            let loginDatalist = document.querySelector('#datalist-login');
            let loginOption = document.createElement('option');
            loginOption.value = localStorage.getItem('login');
            loginDatalist.appendChild(loginOption);
        }

        let inputLogin = document.querySelector('#input-login');
        inputLogin.addEventListener('input', (e) => {
            if (!e.inputType) {
                let inputPassword = document.querySelector('#input-password');
                inputPassword.value = localStorage.getItem('password');
            };
        });
    }

    async login(e) {
        let loginForm = document.querySelector('#form-login');
        if (!loginForm.checkValidity()) return;

        e.preventDefault();
        const formData = new FormData(loginForm);
        const conditions = {};
        for (let [key, value] of formData) conditions[key] = value;

        let candidate = await this.database.select('candidate', conditions);
        let worker = await this.database.select('worker', conditions);
        console.log(worker, candidate);

        if (!candidate && !worker) {
            let firstInput = loginForm.querySelector('.form__input');
            firstInput.setCustomValidity('Неправильно введен логин или пароль');
            firstInput.reportValidity();
            return;
        }

        sessionStorage.setItem('id', `${worker ? worker[0]['worker_id'] : candidate[0]['candidate_id']}`);
        sessionStorage.setItem('role', `${worker ? 'worker' : 'candidate'}`);

        let saveLogPasInput = loginForm.querySelector('#input-remember');
        if (saveLogPasInput.checked) {
            let inputLogin = loginForm.querySelector('#input-login');
            let inputPassword = loginForm.querySelector('#input-password');
            localStorage.setItem('login', `${inputLogin.value}`);
            localStorage.setItem('password', `${inputPassword.value}`);
        } else {
            localStorage.clear();
        }

        loginForm.reset();
        console.log('placeholder: here redirect to another page');
    }

}

const login = new Login(Database);