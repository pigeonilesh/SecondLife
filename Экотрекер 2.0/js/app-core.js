/* ==========================================================================
   Единое ядро ИС «Экотрекер — Second Life» v4.1 (Fixed)
   ========================================================================== */

const INITIAL_DATA = {
  institution: "МЦК-КТИТС",
  address: "г. Казань, ул. Бари Галеева, д. 3А",
  group: "323СИС",
  currentUserKey: "nikulin",
  
  containers: [
    {
      id: "cnt_1",
      name: "Главный корпус (Бари Галеева 3А)",
      desc: "1 этаж, около главного входа",
      coords: [55.7981, 49.1818],
      status: "Открыто"
    }
  ],

  challenges: [
    {
      id: "ch_plastic",
      isQuiz: false,
      type: "plastic",
      title: "Пластиковый бум",
      desc: "Сдай 2.0 кг пластика в этом месяце",
      reward: 150,
      target: 2.0,
      unit: "кг"
    },
    {
      id: "ch_battery",
      isQuiz: false,
      type: "battery",
      title: "Охота на батарейки",
      desc: "Сдай 5 использованных батареек",
      reward: 100,
      target: 5,
      unit: "шт"
    },
    {
      id: "ch_quiz_1",
      isQuiz: true,
      type: "quiz",
      title: "Эко-Квиз: Правила сортировки",
      desc: "Ответь правильно на вопрос про раздельный сбор",
      reward: 50,
      question: "Куда следует выбрасывать использованные батарейки?",
      options: [
        { text: "В специальный контейнер для опасных отходов", isCorrect: true },
        { text: "В общий мусорный бак для ТБО", isCorrect: false }
      ]
    }
  ],

  users: {
    admin: {
      name: "Преподаватель (Администратор)",
      role: "admin",
      group: "МЦК-КТИТС",
      points: 0,
      wasteKg: 0,
      challengesDone: 0,
      password: "1234",
      history: []
    },
    nikulin: {
      name: "Никулин Илья",
      role: "student",
      group: "323СИС",
      points: 1250,
      wasteKg: 18.5,
      challengesDone: 3,
      password: "1234",
      joinedChallenges: ["ch_plastic", "ch_battery"],
      completedChallenges: [],
      history: [
        { date: "16.10.2026", type: "Пластик", amount: "1.5 кг", points: "+150" },
        { date: "08.10.2026", type: "Батарейки", amount: "5 шт", points: "+100" },
        { date: "01.10.2026", type: "Макулатура", amount: "10.0 кг", points: "+1000" }
      ]
    },
    gorlanova: {
      name: "Горланова Анастасия",
      role: "student",
      group: "323СИС",
      points: 1420,
      wasteKg: 21.0,
      challengesDone: 4,
      password: "1234",
      joinedChallenges: [],
      completedChallenges: [],
      history: []
    },
    ilin: {
      name: "Ильин Павел",
      role: "student",
      group: "323СИС",
      points: 980,
      wasteKg: 14.2,
      challengesDone: 2,
      password: "1234",
      joinedChallenges: [],
      completedChallenges: [],
      history: []
    },
    hakimzyanova: {
      name: "Хакимзянова Ильзиля",
      role: "student",
      group: "323СИС",
      points: 0,
      wasteKg: 0,
      challengesDone: 0,
      password: "1234",
      joinedChallenges: [],
      completedChallenges: [],
      history: []
    },
    khasanova: {
      name: "Хасанова Илюза",
      role: "student",
      group: "323СИС",
      points: 0,
      wasteKg: 0,
      challengesDone: 0,
      password: "1234",
      joinedChallenges: [],
      completedChallenges: [],
      history: []
    }
  },

  groupRatings: [
    { name: "Группа 323СИС", points: 5640, wasteKg: 82.2 },
    { name: "Группа 221ПО", points: 4890, wasteKg: 68.0 },
    { name: "Группа 115ИБ", points: 4120, wasteKg: 54.5 },
    { name: "Группа 420WEB", points: 3750, wasteKg: 49.1 }
  ]
};

class EcoTrackerCore {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    // First launch: seed a complete demo dataset.
    const raw = localStorage.getItem('ecotracker_data');
    if (!raw) {
      localStorage.setItem('ecotracker_data', JSON.stringify(INITIAL_DATA));
      return;
    }
    // Safe, additive migration: keep user-created records but restore newly added
    // demo users/challenges and missing fields from the default schema.
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') throw new Error('Invalid data');
      data.users ||= {};
      data.challenges ||= [];
      data.containers ||= INITIAL_DATA.containers;
      data.groupRatings ||= INITIAL_DATA.groupRatings;
      for (const [key, user] of Object.entries(INITIAL_DATA.users)) {
        if (!data.users[key]) data.users[key] = JSON.parse(JSON.stringify(user));
        else {
          data.users[key].joinedChallenges ||= [];
          data.users[key].completedChallenges ||= [];
          data.users[key].history ||= [];
          if (!data.users[key].password) data.users[key].password = '1234';
        }
      }
      for (const challenge of INITIAL_DATA.challenges) {
        if (!data.challenges.some(item => item.id === challenge.id)) {
          data.challenges.push(JSON.parse(JSON.stringify(challenge)));
        }
      }
      data.currentUserKey = data.users[data.currentUserKey] ? data.currentUserKey : 'nikulin';
      localStorage.setItem('ecotracker_data', JSON.stringify(data));
    } catch (error) {
      console.error('Не удалось прочитать сохранённые данные Экотрекера:', error);
      localStorage.setItem('ecotracker_data', JSON.stringify(INITIAL_DATA));
    }
  }

  getData() {
    try {
      const data = JSON.parse(localStorage.getItem('ecotracker_data') || 'null');
      if (data && data.users && Array.isArray(data.challenges)) return data;
    } catch (error) {
      console.error('Ошибка чтения данных Экотрекера:', error);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveData(data) {
    try {
      localStorage.setItem('ecotracker_data', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения данных Экотрекера:', error);
      alert('Не удалось сохранить данные. Проверьте доступность хранилища браузера.');
      return false;
    }
  }

  getCurrentUser() {
    const data = this.getData();
    return data.users[data.currentUserKey] || data.users.nikulin;
  }

  login(userKey, password) {
    const data = this.getData();
    if (data.users[userKey] && data.users[userKey].password === password) {
      data.currentUserKey = userKey;
      this.saveData(data);
      if (data.users[userKey].role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'hh.html';
      }
    } else {
      alert('Неверный пользователь или пароль. Для демо-входа используйте пароль 1234.');
    }
  }

  logout() {
    window.location.href = 'login.html';
  }

  addPoints(userKey, points, wasteAmountKg = 0.5, wasteType = "Пластик") {
    const data = this.getData();
    const u = data.users[userKey];
    if (u) {
      u.points += points;
      u.wasteKg = parseFloat((u.wasteKg + wasteAmountKg).toFixed(1));
      
      if (!u.history) u.history = [];
      u.history.unshift({
        date: new Date().toLocaleDateString('ru-RU'),
        type: wasteType,
        amount: `${wasteAmountKg} кг`,
        points: `+${points}`
      });

      this.saveData(data);
      this.refreshUI();
    }
  }

  addChallengeOrQuiz(itemData) {
    const data = this.getData();
    const newItem = {
      ...itemData,
      id: 'ch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
    };
    if (!newItem.title || !newItem.title.trim()) { alert('Укажите название задания.'); return; }
    if (!Number.isFinite(Number(newItem.reward)) || Number(newItem.reward) < 0) { alert('Укажите корректную награду.'); return; }
    if (newItem.isQuiz && (!newItem.question || !Array.isArray(newItem.options) || newItem.options.length < 2)) { alert('Для квиза нужны вопрос и минимум два варианта ответа.'); return; }
    data.challenges.push(newItem);
    this.saveData(data);
    alert('✅ Задание успешно создано!');
    this.refreshUI();
  }

  joinChallenge(chId) {
    const data = this.getData();
    const user = data.users[data.currentUserKey];
    if (!user.joinedChallenges) user.joinedChallenges = [];
    
    if (!user.joinedChallenges.includes(chId)) {
      user.joinedChallenges.push(chId);
      this.saveData(data);
      alert('🎉 Вы приняли челлендж!');
      this.refreshUI();
    }
  }

  changePassword(oldPass, newPass) {
    const data = this.getData();
    const user = data.users[data.currentUserKey];
    if (user.password && user.password !== oldPass) {
      alert('❌ Старый пароль введён неверно!');
      return false;
    }
    user.password = newPass;
    this.saveData(data);
    alert('✅ Пароль успешно изменён!');
    return true;
  }

  addStudent(fullName) {
    const data = this.getData();
    const key = 'student_' + Date.now();
    data.users[key] = {
      name: fullName,
      role: "student",
      group: data.group,
      points: 0,
      wasteKg: 0,
      challengesDone: 0,
      password: "1234",
      history: []
    };
    this.saveData(data);
    this.renderAdminPage();
  }

  renderAdminPage() {
    const data = this.getData();
    const tbody = document.getElementById('admin-students-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    Object.keys(data.users).forEach(key => {
      const u = data.users[key];
      if (u.role === 'student') {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${u.name}</strong></td>
          <td>${u.wasteKg} кг</td>
          <td><span style="color: var(--color-primary-dark); font-weight:700;">${u.points} Б</span></td>
          <td>
            <button class="btn-add-points" onclick="EcoCore.addPoints('${key}', 50, 0.5, 'Начислено преподавателем')">+50 Б</button>
          </td>
        `;
        tbody.appendChild(tr);
      }
    });
  }

  exportToExcel() {
    if (typeof XLSX === 'undefined') { alert('Экспорт Excel недоступен: проверьте подключение к интернету и загрузку библиотеки XLSX.'); return; }
    const data = this.getData();
    const exportData = [];
    Object.keys(data.users).forEach(key => {
      const u = data.users[key];
      if (u.role === 'student') {
        exportData.push({
          "Учебное заведение": data.institution,
          "Адрес": data.address,
          "Группа": u.group,
          "ФИО Студента": u.name,
          "Набрано баллов": u.points,
          "Сдано мусора (кг)": u.wasteKg
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ведомость");
    XLSX.writeFile(workbook, `Экотрекер_${data.group}_Ведомость.xlsx`);
  }

  importFromExcel(event) {
    if (typeof XLSX === 'undefined') { alert('Импорт Excel недоступен: проверьте подключение к интернету и загрузку библиотеки XLSX.'); event.target.value = ''; return; }
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      let workbook;
      try { workbook = XLSX.read(buffer, { type: 'array' }); } catch (error) { alert('Не удалось прочитать файл. Выберите корректный файл Excel (.xlsx или .xls).'); event.target.value = ''; return; }
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      const data = this.getData();

      jsonData.forEach(row => {
        const studentName = row["ФИО Студента"];
        const points = Math.max(0, parseInt(row["Набрано баллов"], 10) || 0);
        const wasteKg = Math.max(0, parseFloat(String(row["Сдано мусора (кг)"] ?? 0).replace(',', '.')) || 0);

        let foundKey = Object.keys(data.users).find(k => data.users[k].name === studentName);
        if (foundKey) {
          data.users[foundKey].points = points;
          data.users[foundKey].wasteKg = wasteKg;
        } else if (studentName) {
          const newKey = 'student_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
          data.users[newKey] = {
            name: studentName,
            role: "student",
            group: data.group,
            points: points,
            wasteKg: wasteKg,
            challengesDone: 0,
            password: "1234",
            joinedChallenges: [],
            completedChallenges: [],
            history: []
          };
        }
      });

      this.saveData(data);
      alert("✅ Данные импортированы из Excel!");
      this.renderAdminPage();
    };
    reader.readAsArrayBuffer(file);
  }

  refreshUI() {
    const user = this.getCurrentUser();
    const data = this.getData();

    const sortedStudents = Object.keys(data.users)
      .map(k => ({ key: k, ...data.users[k] }))
      .filter(u => u.role === 'student')
      .sort((a, b) => b.points - a.points);

    const myRank = sortedStudents.findIndex(s => s.key === data.currentUserKey) + 1;

    document.querySelectorAll('.user-info .name, .profile-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.avatar, .profile-avatar').forEach(el => {
      const initials = user.name.split(' ').map(n => n[0]).join('');
      el.textContent = initials;
    });

    document.querySelectorAll('.profile-university').forEach(el => el.textContent = `${data.institution} (${data.address})`);
    document.querySelectorAll('.tag-pill-group').forEach(el => el.textContent = `Группа: ${user.group}`);

    document.querySelectorAll('.balance-amount').forEach(el => {
      el.innerHTML = `${user.points.toLocaleString()} <span>Б</span>`;
    });
    document.querySelectorAll('.rank-badge').forEach(el => {
      el.textContent = `🏆 ${myRank} место из ${sortedStudents.length}`;
    });

    document.querySelectorAll('.stat-value-waste').forEach(el => el.textContent = `${user.wasteKg} кг`);
    document.querySelectorAll('.stat-value-points').forEach(el => el.textContent = user.points.toLocaleString());

    this.checkAchievements(user);
    this.renderLeaderboard('personal');
    this.renderChallenges('all');
  }

  checkAchievements(user) {
    const badgesRow = document.querySelector('.badges-row');
    if (!badgesRow) return;

    const achievements = [
      { id: 'start', icon: '🚀', title: 'Быстрый старт', unlocked: user.wasteKg > 0 },
      { id: 'plastic', icon: '🍾', title: 'Пластик-Гуру', unlocked: user.wasteKg >= 10.0 },
      { id: 'battery', icon: '🔋', title: 'Чистый Энергетик', unlocked: user.points >= 1000 },
      { id: 'leader', icon: '👑', title: 'Эко-Лидер', unlocked: user.points >= 2000 }
    ];

    badgesRow.innerHTML = '';
    achievements.forEach(ach => {
      const div = document.createElement('div');
      div.className = `badge-item ${ach.unlocked ? '' : 'badge-locked'}`;
      div.innerHTML = `
        <div class="badge-icon">${ach.unlocked ? ach.icon : '🔒'}</div>
        <span class="badge-title">${ach.title}</span>
      `;
      badgesRow.appendChild(div);
    });
  }

  renderChallenges(filterType = 'all') {
    const container = document.querySelector('.challenges-grid');
    if (!container) return;

    const data = this.getData();
    const user = this.getCurrentUser();
    let list = data.challenges || [];

    // Фильтрация без вызова рекурсии
    if (filterType === 'in_progress') {
      list = list.filter(c => (user.joinedChallenges || []).includes(c.id) && !(user.completedChallenges || []).includes(c.id));
    } else if (filterType === 'completed') {
      list = list.filter(c => (user.completedChallenges || []).includes(c.id));
    }

    container.innerHTML = '';

    list.forEach(ch => {
      const isJoined = (user.joinedChallenges || []).includes(ch.id);
      let isCompleted = (user.completedChallenges || []).includes(ch.id);

      // Считаем прогресс по истории именно этого типа отходов, а не по общему весу.
      const typeLabels = { plastic: ['Пластик'], paper: ['Макулатура', 'Бумага'], battery: ['Батарейки', 'Батарейка'], glass: ['Стекло'], metal: ['Металл'] };
      const acceptedTypes = typeLabels[ch.type] || [];
      const progressValue = (user.history || []).reduce((sum, entry) => {
        if (!acceptedTypes.some(label => String(entry.type || '').toLowerCase().includes(label.toLowerCase()))) return sum;
        const amount = parseFloat(String(entry.amount || '').replace(',', '.'));
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);
      if (isJoined && !ch.isQuiz && Number(ch.target) > 0 && progressValue >= Number(ch.target) && !isCompleted) {
        isCompleted = true;
        user.completedChallenges ||= [];
        user.completedChallenges.push(ch.id);
        user.points = Number(user.points || 0) + Number(ch.reward || 0);
        user.challengesDone = Number(user.challengesDone || 0) + 1;
        user.history ||= [];
        user.history.unshift({ date: new Date().toLocaleDateString('ru-RU'), type: 'Челлендж: ' + ch.title, amount: '—', points: '+' + Number(ch.reward || 0) });
        this.saveData(data);
      }

      const card = document.createElement('article');
      card.className = `challenge-card ${isCompleted ? 'challenge-completed' : ''}`;

      let actionBlock = '';
      if (isCompleted) {
        actionBlock = `<span class="reward-tag tag-done">Выполнено (+${ch.reward} Б)</span>`;
      } else if (ch.isQuiz) {
        actionBlock = `<button class="btn-join btn-quiz" onclick="openQuizModal('${ch.id}')">Пройти квиз</button>`;
      } else if (isJoined) {
        const currentVal = Math.min(progressValue, Number(ch.target) || 0);
        const percent = Number(ch.target) > 0 ? Math.min(100, Math.round((currentVal / Number(ch.target)) * 100)) : 0;

        actionBlock = `
          <div class="progress-container">
            <div class="progress-labels">
              <span>Прогресс</span>
              <span>${currentVal} / ${ch.target} ${ch.unit}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percent}%;"></div>
            </div>
          </div>
        `;
      } else {
        actionBlock = `<button class="btn-join" onclick="EcoCore.joinChallenge('${ch.id}')">Участвовать</button>`;
      }

      card.innerHTML = `
        <div class="challenge-top">
          <div class="challenge-info">
            <div class="challenge-icon icon-${ch.type}">♻️</div>
            <div class="challenge-details">
              <h4>${ch.title}</h4>
              <p>${ch.desc}</p>
            </div>
          </div>
          <span class="reward-tag">+${ch.reward} Б</span>
        </div>
        ${actionBlock}
      `;
      container.appendChild(card);
    });
  }

  renderLeaderboard(type = 'personal') {
    const listContainer = document.querySelector('.leaderboard-list');
    const pedestal = document.getElementById('pedestal-block');
    if (!listContainer) return;

    const data = this.getData();

    if (type === 'personal') {
      if (pedestal) pedestal.style.display = 'flex';

      const students = Object.keys(data.users)
        .map(k => ({ key: k, ...data.users[k] }))
        .filter(u => u.role === 'student')
        .sort((a, b) => b.points - a.points);

      if (students[0]) this.updatePedestal('.rank-1', students[0].name, students[0].points);
      if (students[1]) this.updatePedestal('.rank-2', students[1].name, students[1].points);
      if (students[2]) this.updatePedestal('.rank-3', students[2].name, students[2].points);

      listContainer.innerHTML = '';
      students.slice(3).forEach((st, idx) => {
        const isCurrent = st.key === data.currentUserKey;
        const div = document.createElement('div');
        div.className = `list-item ${isCurrent ? 'item-current-user' : ''}`;
        div.innerHTML = `
          <div class="item-rank ${isCurrent ? 'user-rank' : ''}">${idx + 4}</div>
          <div class="item-avatar ${isCurrent ? 'avatar-user' : ''}">${st.name.split(' ').map(n=>n[0]).join('')}</div>
          <div class="item-info">
            <div class="item-name">${st.name} ${isCurrent ? '<span class="you-tag">Вы</span>' : ''}</div>
            <div class="item-sub">Группа ${st.group}</div>
          </div>
          <div class="item-score ${isCurrent ? 'user-score' : ''}">${st.points} Б</div>
        `;
        listContainer.appendChild(div);
      });
    } else {
      if (pedestal) pedestal.style.display = 'none';

      const groups = data.groupRatings.sort((a, b) => b.points - a.points);
      listContainer.innerHTML = '';
      groups.forEach((g, idx) => {
        const div = document.createElement('div');
        div.className = `list-item ${g.name.includes(data.group) ? 'item-current-user' : ''}`;
        div.innerHTML = `
          <div class="item-rank user-rank" style="font-size:16px;">${idx + 1}</div>
          <div class="item-avatar">🏫</div>
          <div class="item-info">
            <div class="item-name">${g.name} ${g.name.includes(data.group) ? '<span class="you-tag">Ваша группа</span>' : ''}</div>
            <div class="item-sub">Сдано мусора: ${g.wasteKg} кг</div>
          </div>
          <div class="item-score user-score">${g.points} Б</div>
        `;
        listContainer.appendChild(div);
      });
    }
  }

  updatePedestal(selector, name, score) {
    const el = document.querySelector(selector);
    if (el) {
      const nameEl = el.querySelector('.pedestal-name');
      const scoreEl = el.querySelector('.pedestal-score');
      if (nameEl) nameEl.textContent = name;
      if (scoreEl) scoreEl.innerHTML = `${score} <span>Б</span>`;
    }
  }
}

window.EcoCore = new EcoTrackerCore();

document.addEventListener('DOMContentLoaded', () => {
  EcoCore.refreshUI();
});