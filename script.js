document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const notesText = document.getElementById('notes-text');
    const saveNotesBtn = document.getElementById('save-notes');
    const saveTasksBtn = document.getElementById('save-tasks');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthText = document.getElementById('current-month');
    const calendarView = document.getElementById('calendar-view');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Текущая дата
    let currentDate = new Date();
    
    // Инициализация приложения
    initTabs();
    renderCalendar();
    setBackgroundByTime(); // Устанавливаем фон при загрузке
    
    // Инициализация вкладок
    function initTabs() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Убираем активный класс у всех вкладок и контента
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Добавляем активный класс текущей вкладке и контенту
                tab.classList.add('active');
                document.getElementById(`${tabId}-content`).classList.add('active');
                
                // Если открыли календарь, обновляем его
                if (tabId === 'calendar') {
                    renderCalendar();
                }
            });
        });
    }
    
    // Отрисовка календаря
    function renderCalendar() {
        calendarView.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        
        // Устанавливаем заголовок месяца
        currentMonthText.textContent = currentDate.toLocaleDateString('ru-RU', {
            month: 'long',
            year: 'numeric'
        });
        
        // Получаем первый день месяца
        const firstDay = new Date(year, month, 1);
        // Получаем день недели первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
        const firstDayOfWeek = firstDay.getDay();
        // Корректируем для отображения понедельника первым днем
        const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        // Получаем последний день месяца
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Получаем количество дней предыдущего месяца для отображения
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Отображаем 6 недель (42 дня)
        let dayCounter = 0;
        
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                let day = dayCounter - startDay + 1;
                let currentRenderDate = new Date(year, month, day);
                let isCurrentMonth = true;
                
                // Дни предыдущего месяца
                if (day <= 0) {
                    day = prevMonthLastDay + day;
                    currentRenderDate = new Date(year, month - 1, day);
                    isCurrentMonth = false;
                } 
                // Дни следующего месяца
                else if (day > daysInMonth) {
                    day = day - daysInMonth;
                    currentRenderDate = new Date(year, month + 1, day);
                    isCurrentMonth = false;
                }
                
                createDayElement(currentRenderDate, isCurrentMonth, isSameDay(currentRenderDate, today));
                
                dayCounter++;
            }
        }
    }
    
    // Создание элемента дня
    function createDayElement(date, isCurrentMonth, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('current-day');
        }
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = date.getDate();
        
        const dayTasks = document.createElement('div');
        dayTasks.className = 'day-tasks';
        dayTasks.contentEditable = true;
        dayTasks.setAttribute('data-date', date.toISOString());
        
        // Загружаем сохраненные задачи для этого дня
        loadDayTasks(dayTasks, date);
        
        // Сохраняем изменения при потере фокуса
        dayTasks.addEventListener('blur', () => {
            saveTasks();
        });
        
        dayElement.appendChild(dayHeader);
        dayElement.appendChild(dayTasks);
        calendarView.appendChild(dayElement);
    }
    
    // Загрузка задач для конкретного дня
    function loadDayTasks(element, date) {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) return;
        
        try {
            const user = JSON.parse(savedUser);
            if (user.tasks) {
                const dateKey = date.toISOString().split('T')[0];
                if (user.tasks[dateKey]) {
                    element.innerHTML = user.tasks[dateKey];
                }
            }
        } catch (e) {
            console.error('Ошибка при загрузке задач:', e);
        }
    }
    
    // Проверка на совпадение дат
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    // Сохранение заметок
    function saveNotes() {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) return;
        
        try {
            const user = JSON.parse(savedUser);
            user.notes = notesText.value;
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem(`user_${user.username}`, JSON.stringify(user));
            
            showMessage('Заметки сохранены', 'success');
        } catch (e) {
            console.error('Ошибка при сохранении заметок:', e);
            showMessage('Ошибка при сохранении', 'error');
        }
    }
    
    // Сохранение задач
    function saveTasks() {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) return;
        
        try {
            const user = JSON.parse(savedUser);
            if (!user.tasks) {
                user.tasks = {};
            }
            
            // Собираем задачи из всех дней
            const taskElements = document.querySelectorAll('.day-tasks');
            taskElements.forEach(element => {
                const date = new Date(element.getAttribute('data-date'));
                const dateKey = date.toISOString().split('T')[0];
                user.tasks[dateKey] = element.innerHTML;
            });
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem(`user_${user.username}`, JSON.stringify(user));
            
            showMessage('Задачи сохранены', 'success');
        } catch (e) {
            console.error('Ошибка при сохранении задач:', e);
            showMessage('Ошибка при сохранении задач', 'error');
        }
    }
    
    // Загрузка данных пользователя
    function loadUserData() {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) return;
        
        try {
            const user = JSON.parse(savedUser);
            
            // Загружаем заметки
            if (user.notes) {
                notesText.value = user.notes;
            }
            
            // При первом открытии календаря загружаем задачи
            if (document.querySelector('.tab.active').getAttribute('data-tab') === 'calendar') {
                renderCalendar();
            }
        } catch (e) {
            console.error('Ошибка при загрузке данных:', e);
        }
    }
    
    // Показать сообщение
    function showMessage(text, type) {
        const message = document.createElement('div');
        message.textContent = text;
        message.className = `message-popup message-${type}`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    // Функция для установки фона в зависимости от времени
    function setBackgroundByTime() {
        // Создаем дату с московским временем
        const now = new Date();
        const mskTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3 * 3600 * 1000));
        
        // Удаляем предыдущие классы фона
        document.body.classList.remove('morning-bg', 'afternoon-bg');
        
        // Устанавливаем соответствующий фон
        if (mskTime.getHours() >= 13) {
            document.body.classList.add('afternoon-bg');
        } else {
            document.body.classList.add('morning-bg');
        }
    }
    
    // Обработчики событий
    saveNotesBtn.addEventListener('click', saveNotes);
    saveTasksBtn.addEventListener('click', saveTasks);
    
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Автосохранение каждые 30 секунд
    setInterval(() => {
        if (localStorage.getItem('currentUser')) {
            saveTasks();
        }
    }, 30000);
    
    // Проверяем и обновляем фон каждую минуту
    setInterval(setBackgroundByTime, 60000);
    
    // Делаем функцию доступной для auth.js
    window.loadUserData = loadUserData;
});