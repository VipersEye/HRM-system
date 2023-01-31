import '@styles/default.css';
import '@styles/login.css';

import Database from '@modules/Database';

class Login {
    constructor(Database) {
        this.database = new Database();

        const changeForm = () => {
            let documentForms = document.querySelectorAll('.form');
            documentForms.forEach((form) => {
                form.classList.toggle('form_hidden');
            });
        };

        const removeCustomValidity = (e) => {
            e.target.setCustomValidity('');
        };

        const insertUserPassword = (e) => {
            if (!e.inputType) {
                let inputPassword = document.querySelector('#input-password');
                inputPassword.value = localStorage.getItem('password');
            };
        };

        let changeFormBtns = document.querySelectorAll('.form__btn_change-form');
        changeFormBtns.forEach((btn) => {
            btn.addEventListener('click', changeForm);
        });

        let loginBtn = document.querySelector('#btn-login');
        loginBtn.addEventListener('click', this.login.bind(this));

        let allInputs = document.querySelectorAll('.form__input');
        allInputs.forEach((input) => {
            input.addEventListener('blur', removeCustomValidity);
            input.addEventListener('input', removeCustomValidity);
        });

        if (localStorage.length) {
            let loginDatalist = document.querySelector('#datalist-login');
            let loginOption = document.createElement('option');
            loginOption.value = localStorage.getItem('login');
            loginDatalist.appendChild(loginOption);
        }

        let inputLogin = document.querySelector('#input-login');
        inputLogin.addEventListener('input', insertUserPassword);

        let registerBtn = document.querySelector('#btn-register');
        registerBtn.addEventListener('click', this.register.bind(this));

        class Slider {
            constructor(slider, imgPaths) {
                this.imgPaths = imgPaths;
                this.slider = slider;
            }

            start() {
                let sliderContainer = this.slider.querySelector('.slider__inner');
                let btnsContainer = this.slider.querySelector('.slider__btns');
                let slideTemplate = document.querySelector('#template-slide');

                for (let i = 0; i < this.imgPaths.length; i++) {
                    let path = this.imgPaths[i];
                    let slide = slideTemplate.content.cloneNode(true);
                    let slideText = slide.querySelector('.slider__desc');
                    slideText.textContent = path.split('/').find((part) => /.+\..+/.test(part)).replace(/\..+/g, '');

                    let slideImage = slide.querySelector('.slider__image');
                    slideImage.src = path;
                    slideImage.alt = slideText.textContent;

                    let slideBtn = document.createElement('button');
                    slideBtn.classList.add('slider__btn');
                    if (i === 0) slideBtn.classList.add('slider__btn_active');
                    slideBtn.type = 'button';
                    slideBtn.addEventListener('click', this.set.bind(this, i));

                    sliderContainer.appendChild(slide);
                    btnsContainer.appendChild(slideBtn);
                }

                this.currentSlide = 0;
                this.timerId = setInterval(this.next.bind(this), 1e4);
            }

            stop() {
                clearInterval(this.timerId);
            }

            set(num) {
                this.currentSlide = num;
                let sliderContainer = this.slider.querySelector('.slider__inner');
                sliderContainer.scrollLeft = sliderContainer.offsetWidth * num;

                let currentActiveBtn = this.slider.querySelector('.slider__btn_active');
                currentActiveBtn.classList.remove('slider__btn_active');
                let btnsContainer = this.slider.querySelector('.slider__btns');
                let nextActiveBtn = btnsContainer.children[num];
                nextActiveBtn.classList.add('slider__btn_active');
            }

            next() {
                this.set((this.currentSlide + 1) % this.imgPaths.length);
            }
        }

        let slider = new Slider(document.querySelector('.slider'),
            ['./images/login/Эффективность.jpg',
            './images/login/Инновации.jpg',
            './images/login/Удобство.jpg',
            './images/login/Надежность.jpg',
            './images/login/Скорость.jpg'
        ]);
        slider.start();
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
        window.location.href = './home.html';
    }

    async register(e) {
        let registerForm = document.querySelector('#form-register');
        if (!registerForm.checkValidity()) return;
        e.preventDefault();

        const checkLoginValidity = async () => {
            let inputLogin = registerForm.querySelector('#input-reg-login');
            let candidates = await this.database.select('candidate', {login: inputLogin.value});
            let workers = await this.database.select('worker', {login: inputLogin.value});
            if (candidates.length || workers.length) {
                inputLogin.setCustomValidity('Пользователь с таким логином уже существует');
                inputLogin.reportValidity();
                return false;
            }
            return true;
        };

        const checkFullNameValidity = async () => {
            let inputName = registerForm.querySelector('#input-reg-name');
            let inputSurname = registerForm.querySelector('#input-reg-surname');
            let inputMiddleName = registerForm.querySelector('#input-reg-middlename');
            let conditions = {
                name: inputName.value,
                surname: inputSurname.value,
                middlename: inputMiddleName.value
            };

            let candidates = await this.database.select('candidate', conditions);
            if (candidates.length) {
                inputName.setCustomValidity('Пользователь с таким ФИО уже существует');
                inputName.reportValidity();
                return false;
            }
            return true;
        };

        const checkRePasswordValidity = () => {
            let inputPassword = registerForm.querySelector('#input-reg-password');
            let inputRepPassword = registerForm.querySelector('#input-reg-repassword');
            if (inputPassword.value !== inputRepPassword.value) {
                inputRepPassword.setCustomValidity('Неправильно повторен пароль');
                inputRepPassword.reportValidity('');
                return false;
            }
            return true;
        };

        const checkRegisterFormValidity = async () => {
            if (!(await checkFullNameValidity())) return false;
            else if (!(await checkLoginValidity())) return false;
            else if (!checkRePasswordValidity()) return false;
            return true;
        };

        if (!(await checkRegisterFormValidity())) return;

        const formData = new FormData(registerForm);
        const values = {};
        for (let [key, value] of formData) values[key] = value;

        let result = await this.database.insert('candidate', values);
        if (result === false) {
            alert('Ошибка при добавлении данных, попробуйте снова');
            return;
        }

        let newUser = await this.database.select('candidate', {login: values.login});
        console.log(newUser);
        sessionStorage.setItem('id', newUser[0]['candidate_id']);
        sessionStorage.setItem('role', 'candidate');

        registerForm.reset();
        window.location.href = './home.html';
    }
}

const login = new Login(Database);