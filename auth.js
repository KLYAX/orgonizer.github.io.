document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const authMessage = document.getElementById('auth-message');
    const authPage = document.getElementById('auth-page');
    const appPage = document.getElementById('app-page');
    
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    
    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showAuthMessage('Введите имя пользователя и пароль');
            return;
        }
        
        const userData = localStorage.getItem(`user_${username}`);
        
        if (!userData) {
            showAuthMessage('Пользователь не найден');
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            
            if (user.password !== password) {
                showAuthMessage('Неверный пароль');
                return;
            }
            
            // Успешный вход
            localStorage.setItem('currentUser', userData);
            authPage.classList.add('hidden');
            appPage.classList.remove('hidden');
            
            // Загружаем данные пользователя
            if (typeof loadUserData === 'function') {
                loadUserData();
            }
            
        } catch (e) {
            showAuthMessage('Ошибка при загрузке данных пользователя');
            console.error(e);
        }
    }
    
    function handleRegister() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showAuthMessage('Введите имя пользователя и пароль');
            return;
        }
        
        if (username.length < 3) {
            showAuthMessage('Имя пользователя должно содержать минимум 3 символа');
            return;
        }
        
        if (password.length < 4) {
            showAuthMessage('Пароль должен содержать минимум 4 символа');
            return;
        }
        
        if (localStorage.getItem(`user_${username}`)) {
            showAuthMessage('Имя пользователя уже занято');
            return;
        }
        
        const newUser = {
            username,
            password,
            notes: '',
            tasks: {}
        };
        
        try {
            localStorage.setItem(`user_${username}`, JSON.stringify(newUser));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            authPage.classList.add('hidden');
            appPage.classList.remove('hidden');
            
            showMessage('Регистрация прошла успешно!', 'success');
            
        } catch (e) {
            showAuthMessage('Ошибка при регистрации');
            console.error(e);
        }
    }
    
    function handleLogout() {
        localStorage.removeItem('currentUser');
        authPage.classList.remove('hidden');
        appPage.classList.add('hidden');
        
        // Очищаем поля ввода
        usernameInput.value = '';
        passwordInput.value = '';
        authMessage.textContent = '';
    }
    
    function showAuthMessage(message) {
        authMessage.textContent = message;
        setTimeout(() => {
            authMessage.textContent = '';
        }, 3000);
    }
    
    function showMessage(text, type) {
        const message = document.createElement('div');
        message.textContent = text;
        message.className = `message-popup message-${type}`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    // Проверяем авторизацию при загрузке
    checkAuthStatus();
    
    function checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            authPage.classList.add('hidden');
            appPage.classList.remove('hidden');
            
            if (typeof loadUserData === 'function') {
                loadUserData();
            }
        }
    }
});