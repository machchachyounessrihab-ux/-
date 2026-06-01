/**
 * ==========================================
 * مختبر المتطابقات الهامة - النظام المتكامل
 * Integrated Math Lab System
 * يدعم المتطابقات الثلاث: (a+b)², (a-b)², a²-b²
 * ==========================================
 */

// ============ حالة اللعبة المتكاملة ============
const GameState = {
    // نظام التقدم
    playerLevel: 1,
    totalPoints: 0,
    currentXP: 0,
    xpToNext: 100,
    streak: 0,
    bestStreak: 0,
    
    // الإنجازات
    achievements: [],
    totalCompletions: 0,
    valueChangeCount: 0,
    
    // الحالة الحالية
    currentMode: 'first',
    a: 150,
    b: 60,
    placedPieces: 0,
    totalPieces: 0,
    hintsUsed: 0,
    startTime: Date.now(),
    
    // المؤقت
    timerInterval: null,
    elapsedSeconds: 0,
    
    // الإعدادات
    soundEnabled: true,
    autoCompleteUsed: false,
    
    // حدود القيم
    minA: 100,
    maxA: 200,
    minB: 40,
    maxB: 90,
    
    // تتبع المراحل المكتملة
    completedModes: {
        first: false,
        second: false,
        third: false
    }
};

// ============ نظام الإنجازات الموسع ============
const Achievements = {
    firstStep: {
        id: 'firstStep',
        name: '🛡️ الخطوة الأولى',
        desc: 'أكمل أول برهان هندسي',
        icon: '🛡️',
        points: 50,
        condition: () => GameState.totalCompletions >= 1
    },
    speedRunner: {
        id: 'speedRunner',
        name: '⚡ البطل السريع',
        desc: 'أكمل البرهان في أقل من 30 ثانية',
        icon: '⚡',
        points: 100,
        condition: () => GameState.elapsedSeconds < 30 && GameState.totalCompletions > 0
    },
    perfectStreak: {
        id: 'perfectStreak',
        name: '🔥 سيد الإتقان',
        desc: 'حقق سلسلة من 3 إجابات صحيحة',
        icon: '🔥',
        points: 75,
        condition: () => GameState.streak >= 3
    },
    explorer: {
        id: 'explorer',
        name: '🧭 المستكشف',
        desc: 'جرب جميع المتطابقات الثلاث',
        icon: '🧭',
        points: 60,
        condition: () => Object.values(GameState.completedModes).every(v => v === true)
    },
    noHints: {
        id: 'noHints',
        name: '🧠 العبقري المستقل',
        desc: 'أكمل برهاناً بدون استخدام التلميحات',
        icon: '🧠',
        points: 150,
        condition: () => GameState.hintsUsed === 0 && GameState.totalCompletions > 0
    },
    mathWizard: {
        id: 'mathWizard',
        name: '🧙 ساحر الرياضيات',
        desc: 'اجمع 500 نقطة',
        icon: '🧙',
        points: 200,
        condition: () => GameState.totalPoints >= 500
    },
    collector: {
        id: 'collector',
        name: '🎖️ جامع الأوسمة',
        desc: 'احصل على 6 إنجازات مختلفة',
        icon: '🎖️',
        points: 100,
        condition: () => GameState.achievements.length >= 6
    },
    perfectionist: {
        id: 'perfectionist',
        name: '💎 المثالي',
        desc: 'أكمل جميع المتطابقات بدون أخطاء',
        icon: '💎',
        points: 300,
        condition: () => Object.values(GameState.completedModes).every(v => v === true) && GameState.streak >= 3
    },
    proportionalMaster: {
        id: 'proportionalMaster',
        name: '📐 خبير التناسب',
        desc: 'غير القيم 5 مرات وأكمل البرهان',
        icon: '📐',
        points: 80,
        condition: () => GameState.valueChangeCount >= 5
    },
    marathonRunner: {
        id: 'marathonRunner',
        name: '🏃 عداء الماراثون',
        desc: 'أكمل 10 براهين هندسية',
        icon: '🏃',
        points: 150,
        condition: () => GameState.totalCompletions >= 10
    },
    speedMaster: {
        id: 'speedMaster',
        name: '🚀 سيد السرعة',
        desc: 'أكمل برهاناً في أقل من 15 ثانية',
        icon: '🚀',
        points: 200,
        condition: () => GameState.elapsedSeconds < 15 && GameState.totalCompletions > 0
    },
    noAutoComplete: {
        id: 'noAutoComplete',
        name: '🎓 المعلم الصغير',
        desc: 'أكمل 3 براهين بدون استخدام الحل التلقائي',
        icon: '🎓',
        points: 120,
        condition: () => GameState.totalCompletions >= 3 && !GameState.autoCompleteUsed
    }
};

// ============ عناصر DOM ============
const elements = {
    // HUD
    playerLevel: document.getElementById('playerLevel'),
    totalPoints: document.getElementById('totalPoints'),
    currentXP: document.getElementById('currentXP'),
    xpToNext: document.getElementById('xpToNext'),
    xpBar: document.getElementById('xpBar'),
    streakCount: document.getElementById('streakCount'),
    achievementsCount: document.getElementById('achievementsCount'),
    achievementsPreview: document.getElementById('achievementsPreview'),
    lastEarned: document.getElementById('lastEarned'),
    
    // القياسات
    rangeA: document.getElementById('rangeA'),
    rangeB: document.getElementById('rangeB'),
    valA: document.getElementById('valA'),
    valB: document.getElementById('valB'),
    valADisplay: document.getElementById('valADisplay'),
    valBDisplay: document.getElementById('valBDisplay'),
    valSum: document.getElementById('valSum'),
    valDiff: document.getElementById('valDiff'),
    rangeAValue: document.getElementById('rangeAValue'),
    rangeBValue: document.getElementById('rangeBValue'),
    modeDetails: document.getElementById('modeDetails'),
    
    // اللوحة
    piecesContainer: document.getElementById('piecesContainer'),
    mainDropZone: document.getElementById('mainDropZone'),
    labelsContainer: document.getElementById('labelsContainer'),
    feedback: document.getElementById('feedback'),
    formulaText: document.getElementById('formulaText'),
    explanationContent: document.getElementById('explanationContent'),
    dropPrompt: document.getElementById('dropPrompt'),
    totalAreaVal: document.getElementById('totalAreaVal'),
    rulesPanel: document.getElementById('rulesPanel'),
    boardScaler: document.getElementById('boardScaler'),
    
    // التقدم
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    piecesRemaining: document.getElementById('piecesRemaining'),
    timer: document.getElementById('timer'),
    
    // المحتوى
    storyText: document.getElementById('storyText'),
    dailyChallenge: document.getElementById('dailyChallenge'),
    ruleTitle: document.getElementById('ruleTitle'),
    ruleDetails: document.getElementById('ruleDetails'),
    areaDetails: document.getElementById('areaDetails'),
    achievementsList: document.getElementById('achievementsList'),
    pointsEarned: document.getElementById('pointsEarned')
};

// ============ نظام الصوت ============
const AudioSystem = {
    context: null,
    
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.log('Audio not supported');
        }
    },
    
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.context || !GameState.soundEnabled) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },
    
    playSuccess() {
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.15), 200);
        setTimeout(() => this.playTone(1047, 0.2), 300);
    },
    
    playDrop() {
        this.playTone(440, 0.06, 'triangle', 0.2);
    },
    
    playAchievement() {
        this.playTone(784, 0.1);
        setTimeout(() => this.playTone(988, 0.1), 100);
        setTimeout(() => this.playTone(1175, 0.15), 200);
        setTimeout(() => this.playTone(1319, 0.3), 300);
    },
    
    playError() {
        this.playTone(200, 0.2, 'sawtooth', 0.2);
    }
};

// ============ نظام المؤقت ============
function startTimer() {
    stopTimer();
    GameState.elapsedSeconds = 0;
    updateTimerDisplay();
    
    GameState.timerInterval = setInterval(() => {
        GameState.elapsedSeconds++;
        updateTimerDisplay();
        
        // تحذيرات الوقت
        if (GameState.elapsedSeconds >= 25 && GameState.elapsedSeconds < 30) {
            elements.timer.classList.add('warning');
            elements.timer.classList.remove('danger');
        } else if (GameState.elapsedSeconds >= 30) {
            elements.timer.classList.remove('warning');
            elements.timer.classList.add('danger');
        } else {
            elements.timer.classList.remove('warning', 'danger');
        }
    }, 1000);
}

function stopTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
        GameState.timerInterval = null;
    }
    elements.timer.classList.remove('warning', 'danger');
}

function updateTimerDisplay() {
    const minutes = Math.floor(GameState.elapsedSeconds / 60);
    const seconds = GameState.elapsedSeconds % 60;
    elements.timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============ نظام الجسيمات ============
function createParticles(x, y, count = 25) {
    const container = document.getElementById('particlesContainer');
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (Math.random() * 8 + 4) + 'px';
        particle.style.height = (Math.random() * 8 + 4) + 'px';
        particle.style.setProperty('--tx', (Math.random() - 0.5) * 250 + 'px');
        particle.style.setProperty('--ty', (Math.random() - 0.5) * 250 + 'px');
        particle.style.animationDuration = (Math.random() * 0.8 + 0.6) + 's';
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1500);
    }
}

// ============ نظام الإشعارات ============
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        achievement: '#8b5cf6',
        info: '#6366f1'
    };
    toast.style.background = colors[type] || colors.info;
    toast.style.color = 'white';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

// ============ نظام XP والمستويات ============
function addXP(amount) {
    GameState.currentXP += amount;
    
    while (GameState.currentXP >= GameState.xpToNext) {
        GameState.currentXP -= GameState.xpToNext;
        GameState.playerLevel++;
        GameState.xpToNext = Math.floor(GameState.xpToNext * 1.5);
        showToast(`🎉 مبروك! وصلت للمستوى ${GameState.playerLevel}!`, 'achievement');
        AudioSystem.playAchievement();
    }
    
    updateHUD();
}

function addPoints(amount, reason = '') {
    GameState.totalPoints += amount;
    elements.lastEarned.textContent = amount;
    
    if (GameState.totalPoints >= 500 && !GameState.achievements.includes('mathWizard')) {
        unlockAchievement('mathWizard');
    }
    
    addXP(amount);
    updateHUD();
}

// ============ نظام الإنجازات ============
function checkAllAchievements() {
    Object.keys(Achievements).forEach(key => {
        const achievement = Achievements[key];
        if (!GameState.achievements.includes(achievement.id) && achievement.condition()) {
            unlockAchievement(achievement.id);
        }
    });
}

function unlockAchievement(achievementId) {
    if (GameState.achievements.includes(achievementId)) return;
    
    const achievement = Achievements[achievementId];
    GameState.achievements.push(achievementId);
    
    showToast(`${achievement.icon} إنجاز جديد: ${achievement.name}! (+${achievement.points} نقطة)`, 'achievement');
    addPoints(achievement.points);
    AudioSystem.playAchievement();
    
    if (GameState.achievements.length >= 6 && !GameState.achievements.includes('collector')) {
        setTimeout(() => unlockAchievement('collector'), 500);
    }
    
    updateAchievements();
    saveProgress();
}

function updateAchievements() {
    elements.achievementsCount.textContent = GameState.achievements.length;
    
    elements.achievementsPreview.innerHTML = GameState.achievements.slice(-5).map(id => 
        `<span title="${Achievements[id].name}" class="text-base">${Achievements[id].icon}</span>`
    ).join('');
    
    elements.achievementsList.innerHTML = Object.values(Achievements).map(ach => `
        <div class="flex items-center gap-2 p-2 rounded-lg transition-all ${
            GameState.achievements.includes(ach.id) 
                ? 'bg-white shadow-sm border border-green-100' 
                : 'bg-slate-100 opacity-60'
        }">
            <span class="text-lg">${ach.icon}</span>
            <div class="flex-1">
                <p class="font-semibold text-xs">${ach.name}</p>
                <p class="text-[10px] text-slate-500">${ach.desc}</p>
            </div>
            <span class="${GameState.achievements.includes(ach.id) ? 'text-emerald-500' : 'text-slate-300'}">
                ${GameState.achievements.includes(ach.id) ? '✅' : '🔒'}
            </span>
        </div>
    `).join('');
}

// ============ تحديث واجهة المستخدم ============
function updateHUD() {
    elements.playerLevel.textContent = GameState.playerLevel;
    elements.totalPoints.textContent = GameState.totalPoints;
    elements.currentXP.textContent = GameState.currentXP;
    elements.xpToNext.textContent = GameState.xpToNext;
    elements.xpBar.style.width = (GameState.currentXP / GameState.xpToNext * 100) + '%';
    elements.streakCount.textContent = GameState.streak;
    elements.progressBar.style.width = (GameState.placedPieces / GameState.totalPieces * 100) + '%';
    elements.progressText.textContent = `${GameState.placedPieces}/${GameState.totalPieces}`;
    elements.piecesRemaining.textContent = `${GameState.totalPieces - GameState.placedPieces} قطعة`;
    
    // تحديث القياسات
    elements.valADisplay.textContent = GameState.a;
    elements.valBDisplay.textContent = GameState.b;
    elements.valSum.textContent = GameState.a + GameState.b;
    elements.valDiff.textContent = Math.abs(GameState.a - GameState.b);
    elements.rangeAValue.textContent = GameState.a;
    elements.rangeBValue.textContent = GameState.b;
    
    updateModeDetails();
}

function updateModeDetails() {
    const modeData = getModeData();
    elements.modeDetails.innerHTML = `
        <span class="text-indigo-600">المساحة الكلية:</span> 
        <span class="font-bold">${modeData.totalArea} وحدة²</span>
    `;
    
    elements.ruleTitle.textContent = getModeTitle();
    elements.ruleDetails.innerHTML = getRuleDetailsHTML();
    elements.areaDetails.innerHTML = getAreaDetailsHTML();
}

// ============ حفظ وتحميل التقدم ============
function saveProgress() {
    const saveData = {
        level: GameState.playerLevel,
        points: GameState.totalPoints,
        xp: GameState.currentXP,
        xpToNext: GameState.xpToNext,
        achievements: GameState.achievements,
        streak: GameState.streak,
        bestStreak: GameState.bestStreak,
        totalCompletions: GameState.totalCompletions,
        valueChangeCount: GameState.valueChangeCount,
        completedModes: GameState.completedModes,
        autoCompleteUsed: GameState.autoCompleteUsed
    };
    localStorage.setItem('mathLabProProgress', JSON.stringify(saveData));
}

function loadProgress() {
    const saved = localStorage.getItem('mathLabProProgress');
    if (saved) {
        const data = JSON.parse(saved);
        GameState.playerLevel = data.level || 1;
        GameState.totalPoints = data.points || 0;
        GameState.currentXP = data.xp || 0;
        GameState.xpToNext = data.xpToNext || 100;
        GameState.achievements = data.achievements || [];
        GameState.streak = data.streak || 0;
        GameState.bestStreak = data.bestStreak || 0;
        GameState.totalCompletions = data.totalCompletions || 0;
        GameState.valueChangeCount = data.valueChangeCount || 0;
        GameState.completedModes = data.completedModes || { first: false, second: false, third: false };
        GameState.autoCompleteUsed = data.autoCompleteUsed || false;
        updateHUD();
        updateAchievements();
    }
}

// ============ نظام القطع المتناسبة ============
function getModeData() {
    const a = GameState.a;
    const b = GameState.b;
    
    switch(GameState.currentMode) {
        case 'first': // (a+b)²
            return {
                pieces: [
                    { w: a, h: a, c: 'bg-indigo-500', label: `a²`, calc: a*a, id: 'sq-a', 
                      pos: { top: '0px', right: '0px' } },
                    { w: b, h: b, c: 'bg-pink-500', label: `b²`, calc: b*b, id: 'sq-b', 
                      pos: { bottom: '0px', left: '0px' } },
                    { w: a, h: b, c: 'bg-amber-400', label: `ab`, calc: a*b, id: 'rect-1', 
                      pos: { bottom: '0px', right: '0px' } },
                    { w: b, h: a, c: 'bg-amber-400', label: `ab`, calc: a*b, id: 'rect-2', 
                      pos: { top: '0px', left: '0px' } }
                ],
                totalWidth: a + b,
                totalHeight: a + b,
                totalArea: (a + b) ** 2,
                dims: [
                    { text: 'a', x: b, y: -22, w: a, type: 'h' },
                    { text: 'b', x: 0, y: -22, w: b, type: 'h' },
                    { text: 'a', x: a+b+10, y: 0, h: a, type: 'v' },
                    { text: 'b', x: a+b+10, y: a, h: b, type: 'v' }
                ],
                formula: `(a+b)² = a² + 2ab + b²`,
                explanation: `المساحة = (${a}+${b})² = ${a}² + 2×${a}×${b} + ${b}² = ${a*a} + ${2*a*b} + ${b*b} = ${(a+b)**2}`
            };
            
        case 'second': // (a-b)²
            const amb = a - b;
            return {
                pieces: [
                    { w: amb, h: amb, c: 'bg-indigo-700', label: `(a-b)²`, calc: amb**2, id: 'sq-amb', 
                      pos: { top: '0px', right: '0px' } },
                    { w: b, h: amb, c: 'bg-slate-400', label: `b(a-b)`, calc: b*amb, id: 'rect-sub1', 
                      pos: { top: '0px', left: '0px' } },
                    { w: amb, h: b, c: 'bg-slate-400', label: `b(a-b)`, calc: amb*b, id: 'rect-sub2', 
                      pos: { bottom: '0px', right: '0px' } },
                    { w: b, h: b, c: 'bg-pink-500', label: `b²`, calc: b*b, id: 'sq-b2', 
                      pos: { bottom: '0px', left: '0px' } }
                ],
                totalWidth: a,
                totalHeight: a,
                totalArea: a ** 2,
                dims: [
                    { text: 'a-b', x: b, y: -22, w: amb, type: 'h' },
                    { text: 'b', x: 0, y: -22, w: b, type: 'h' },
                    { text: 'a-b', x: a+10, y: 0, h: amb, type: 'v' },
                    { text: 'b', x: a+10, y: amb, h: b, type: 'v' }
                ],
                formula: `(a-b)² = a² - 2ab + b²`,
                explanation: `المساحة = (${a}-${b})² = ${a}² - 2×${a}×${b} + ${b}² = ${a*a} - ${2*a*b} + ${b*b} = ${amb**2}`
            };
            
        case 'third': // a² - b² = (a-b)(a+b)
            const amb2 = a - b;
            return {
                pieces: [
                    { w: a, h: amb2, c: 'bg-indigo-500', label: `a(a-b)`, calc: a*amb2, id: 't-rect-1', 
                      pos: { top: '0px', left: '0px' } },
                    { w: b, h: amb2, c: 'bg-amber-400', label: `b(a-b)`, calc: b*amb2, id: 't-rect-2', 
                      pos: { top: '0px', right: '0px' } }
                ],
                totalWidth: a + b,
                totalHeight: amb2,
                totalArea: (a + b) * amb2,
                dims: [
                    { text: 'a', x: 0, y: -22, w: a, type: 'h' },
                    { text: 'b', x: a, y: -22, w: b, type: 'h' },
                    { text: 'a-b', x: a+b+10, y: 0, h: amb2, type: 'v' }
                ],
                formula: `a² - b² = (a-b)(a+b)`,
                explanation: `المساحة = (${a}-${b})(${a}+${b}) = ${a}² - ${b}² = ${a*a} - ${b*b} = ${(a+b)*amb2}`
            };
    }
}

function getModeTitle() {
    switch(GameState.currentMode) {
        case 'first': return 'المتطابقة الأولى: مربع المجموع';
        case 'second': return 'المتطابقة الثانية: مربع الفرق';
        case 'third': return 'المتطابقة الثالثة: فرق المربعين';
    }
}

function getRuleDetailsHTML() {
    const a = GameState.a;
    const b = GameState.b;
    
    switch(GameState.currentMode) {
        case 'first':
            return `
                <p>• المساحة الكلية = (a+b)² = <strong>${(a+b)**2}</strong></p>
                <p>• a² = ${a}² = <strong>${a*a}</strong></p>
                <p>• b² = ${b}² = <strong>${b*b}</strong></p>
                <p>• 2ab = 2×${a}×${b} = <strong>${2*a*b}</strong></p>
                <p class="text-emerald-600">✅ ${a*a} + ${2*a*b} + ${b*b} = ${(a+b)**2}</p>
            `;
        case 'second':
            const amb = a - b;
            return `
                <p>• المساحة الكلية = a² = <strong>${a*a}</strong></p>
                <p>• (a-b)² = (${a}-${b})² = <strong>${amb**2}</strong></p>
                <p>• b² = ${b}² = <strong>${b*b}</strong></p>
                <p>• 2×b(a-b) = 2×${b}×${amb} = <strong>${2*b*amb}</strong></p>
                <p class="text-emerald-600">✅ ${amb**2} + ${2*b*amb} + ${b*b} = ${a*a}</p>
            `;
        case 'third':
            const amb2 = a - b;
            return `
                <p>• المساحة الكلية = (a+b)(a-b) = <strong>${(a+b)*amb2}</strong></p>
                <p>• a(a-b) = ${a}×${amb2} = <strong>${a*amb2}</strong></p>
                <p>• b(a-b) = ${b}×${amb2} = <strong>${b*amb2}</strong></p>
                <p class="text-emerald-600">✅ ${a*amb2} + ${b*amb2} = ${(a+b)*amb2}</p>
            `;
    }
}

function getAreaDetailsHTML() {
    const a = GameState.a;
    const b = GameState.b;
    
    switch(GameState.currentMode) {
        case 'first':
            return `
                <p>🔵 المربع الأزرق: a² = <strong>${a*a}</strong></p>
                <p>🩷 المربع الوردي: b² = <strong>${b*b}</strong></p>
                <p>🟡 المستطيلان: 2(ab) = <strong>${2*a*b}</strong></p>
                <p class="font-bold mt-1">المجموع: ${(a+b)**2}</p>
            `;
        case 'second':
            const amb = a - b;
            return `
                <p>🔵 المربع الأزرق: (a-b)² = <strong>${amb**2}</strong></p>
                <p>⬜ المستطيلان: 2b(a-b) = <strong>${2*b*amb}</strong></p>
                <p>🩷 المربع الوردي: b² = <strong>${b*b}</strong></p>
                <p class="font-bold mt-1">المجموع: ${a*a}</p>
            `;
        case 'third':
            const amb2 = a - b;
            return `
                <p>🔵 المستطيل الأزرق: a(a-b) = <strong>${a*amb2}</strong></p>
                <p>🟡 المستطيل الأصفر: b(a-b) = <strong>${b*amb2}</strong></p>
                <p class="font-bold mt-1">المجموع: ${(a+b)*amb2}</p>
            `;
    }
}

// ============ الدوال الأساسية ============
function triggerMathJax() {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
    }
}

function clearZone() {
    Array.from(elements.mainDropZone.children).forEach(child => {
        if (child.classList && child.classList.contains('draggable')) {
            child.remove();
        }
    });
    elements.labelsContainer.innerHTML = '';
    document.getElementById('particlesContainer').innerHTML = '';
    elements.dropPrompt.classList.remove('hidden');
    elements.mainDropZone.classList.remove('correct-bg', 'drag-over');
    elements.feedback.classList.add('invisible');
    elements.rulesPanel.classList.remove('visible');
    GameState.placedPieces = 0;
    GameState.hintsUsed = 0;
    GameState.autoCompleteUsed = false;
    updateHUD();
}

function createPieces() {
    elements.piecesContainer.innerHTML = '';
    
    const modeData = getModeData();
    const pieces = modeData.pieces;
    GameState.totalPieces = pieces.length;

    pieces.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = `draggable rounded-lg flex items-center justify-center relative ${p.c}`;
        div.style.width = Math.max(p.w, 35) + 'px';
        div.style.height = Math.max(p.h, 35) + 'px';
        div.draggable = true;
        div.id = p.id;
        div.title = `${p.label}: ${p.calc} وحدة² | اسحبني إلى اللوحة`;
        
        div.dataset.width = p.w;
        div.dataset.height = p.h;
        div.dataset.area = p.calc;
        div.dataset.position = JSON.stringify(p.pos);
        
        const label = document.createElement('span');
        label.className = 'shape-label';
        
        const fontSize = Math.min(p.w, p.h) > 50 ? '0.75rem' : '0.6rem';
        label.style.fontSize = fontSize;
        label.innerHTML = `<span>${p.label}</span><span class="area-val" style="font-size:${Math.min(p.w, p.h) > 50 ? '0.6rem' : '0.5rem'}">${p.calc}</span>`;
        
        div.appendChild(label);

        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.target.style.opacity = '0.7';
        });
        
        div.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });

        div.style.animationDelay = `${index * 0.15}s`;
        
        elements.piecesContainer.appendChild(div);
    });
    
    updateHUD();
}

function drawDimensions() {
    elements.labelsContainer.innerHTML = '';
    
    const modeData = getModeData();
    const dims = modeData.dims;
    
    dims.forEach(d => {
        const line = document.createElement('div');
        line.className = `dimension-line ${d.type === 'h' ? 'h-dim' : 'v-dim'}`;
        
        if (d.type === 'h') {
            line.style.width = d.w + 'px';
            line.style.height = '2px';
            line.style.left = d.x + 'px';
            line.style.top = d.y + 'px';
        } else {
            line.style.width = '2px';
            line.style.height = d.h + 'px';
            line.style.left = d.x + 'px';
            line.style.top = d.y + 'px';
        }
        
        const label = document.createElement('span');
        label.className = 'side-label';
        label.innerText = d.text;
        
        if (d.type === 'h') {
            label.style.left = (d.x + d.w/2) + 'px';
            label.style.top = (d.y - 15) + 'px';
            label.style.transform = 'translateX(-50%)';
        } else {
            label.style.left = (d.x + 10) + 'px';
            label.style.top = (d.y + d.h/2) + 'px';
            label.style.transform = 'translateY(-50%)';
        }
        
        elements.labelsContainer.appendChild(line);
        elements.labelsContainer.appendChild(label);
    });
}

function checkCompletion() {
    if (GameState.placedPieces === GameState.totalPieces) {
        stopTimer();
        GameState.totalCompletions++;
        
        const modeData = getModeData();
        
        elements.mainDropZone.classList.add('correct-bg');
        elements.totalAreaVal.textContent = modeData.totalArea;
        elements.feedback.classList.remove('invisible');
        elements.rulesPanel.classList.add('visible');
        
        drawDimensions();
        
        // حساب النقاط
        let earnedPoints = 50;
        const bonuses = [];
        
        if (GameState.elapsedSeconds < 15) {
            earnedPoints += 100;
            bonuses.push('🚀 سريع جداً (+100)');
        } else if (GameState.elapsedSeconds < 30) {
            earnedPoints += 50;
            bonuses.push('⚡ سريع (+50)');
        }
        
        if (GameState.streak >= 2) {
            earnedPoints += 25;
            bonuses.push('🔥 سلسلة (+25)');
        }
        
        if (GameState.hintsUsed === 0) {
            earnedPoints += 25;
            bonuses.push('🧠 بدون تلميح (+25)');
        }
        
        addPoints(earnedPoints);
        GameState.streak++;
        if (GameState.streak > GameState.bestStreak) {
            GameState.bestStreak = GameState.streak;
        }
        
        // تسجيل اكتمال المرحلة
        GameState.completedModes[GameState.currentMode] = true;
        
        // جسيمات
        const rect = elements.mainDropZone.getBoundingClientRect();
        createParticles(rect.width / 2, rect.height / 2, 30);
        
        AudioSystem.playSuccess();
        
        // عرض النقاط
        elements.pointsEarned.innerHTML = `
            <span class="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">+${earnedPoints} نقطة</span>
            ${bonuses.map(b => `<span class="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">${b}</span>`).join('')}
        `;
        
        // التحقق من الإنجازات
        checkAllAchievements();
        
        updateHUD();
        saveProgress();
        setTimeout(triggerMathJax, 100);
    }
}

function initGame() {
    GameState.a = parseInt(elements.rangeA.value);
    GameState.b = parseInt(elements.rangeB.value);
    
    // ضمان صحة القيم
    if (GameState.a <= GameState.b) {
        GameState.a = GameState.b + 20;
        elements.rangeA.value = GameState.a;
    }
    
    if (GameState.currentMode === 'second' || GameState.currentMode === 'third') {
        if (GameState.a - GameState.b < 20) {
            GameState.b = GameState.a - 20;
            elements.rangeB.value = GameState.b;
        }
    }
    
    elements.valA.textContent = GameState.a;
    elements.valB.textContent = GameState.b;

    const modeData = getModeData();
    
    elements.formulaText.innerHTML = `\\( ${modeData.formula} \\)`;
    elements.storyText.textContent = getStoryText();
    elements.explanationContent.innerHTML = getExplanationHTML();
    elements.dailyChallenge.textContent = `أكمل البرهان: ${modeData.formula} مع a=${GameState.a}, b=${GameState.b}`;

    clearZone();

    elements.mainDropZone.style.width = Math.max(modeData.totalWidth, 80) + 'px';
    elements.mainDropZone.style.height = Math.max(modeData.totalHeight, 80) + 'px';

    createPieces();
    updateHUD();
    updateModeDetails();
    
    adjustBoardScale(modeData.totalWidth, modeData.totalHeight);
    
    startTimer();
    setTimeout(triggerMathJax, 100);
}

function adjustBoardScale(totalWidth, totalHeight) {
    const maxWidth = 450;
    const maxHeight = 450;
    
    const scaleX = maxWidth / totalWidth;
    const scaleY = maxHeight / totalHeight;
    const scale = Math.min(scaleX, scaleY, 1.4);
    
    if (window.innerWidth >= 1024) {
        elements.boardScaler.style.transform = `scale(${Math.min(scale, 1.25)})`;
    } else if (window.innerWidth >= 768) {
        elements.boardScaler.style.transform = `scale(${Math.min(scale, 1.1)})`;
    } else {
        elements.boardScaler.style.transform = `scale(${Math.min(scale, 0.85)})`;
    }
}

function getStoryText() {
    switch(GameState.currentMode) {
        case 'first': return `🏰 ابنِ المربع الكبير! (${GameState.a}+${GameState.b})²`;
        case 'second': return `🔍 اكتشف المساحة المخفية! (${GameState.a}-${GameState.b})²`;
        case 'third': return `🎯 اصنع المستطيل السحري! ${GameState.a}²-${GameState.b}²`;
    }
}

function getExplanationHTML() {
    const modeData = getModeData();
    return `
        <p class="text-indigo-300 font-bold text-lg md:text-xl mb-2">${getModeTitle()}</p>
        <p class="text-base">${modeData.explanation}</p>
        <p class="text-emerald-300 mt-2">✅ النتيجة: ${modeData.totalArea} وحدة مربعة</p>
    `;
}

function switchMode(mode) {
    GameState.currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    
    elements.rulesPanel.classList.remove('visible');
    
    initGame();
}

// ============ وظائف إضافية ============
function useHint() {
    if (GameState.totalPoints >= 10) {
        GameState.totalPoints -= 10;
        GameState.hintsUsed++;
        updateHUD();
        
        const pieces = document.querySelectorAll('#piecesContainer > div');
        const placed = GameState.placedPieces;
        
        if (pieces[placed]) {
            pieces[placed].style.animation = 'none';
            pieces[placed].style.boxShadow = '0 0 30px #f59e0b, 0 0 60px #f59e0b';
            pieces[placed].style.transform = 'scale(1.1)';
            pieces[placed].style.zIndex = '50';
            setTimeout(() => {
                pieces[placed].style.boxShadow = '';
                pieces[placed].style.transform = '';
                pieces[placed].style.zIndex = '';
                pieces[placed].style.animation = '';
            }, 2500);
        }
        
        showToast('💡 تم خصم 10 نقاط للتلميح', 'warning');
    } else {
        showToast('❌ ليس لديك نقاط كافية! (تحتاج 10 نقاط)', 'error');
    }
}

function autoComplete() {
    if (GameState.placedPieces === GameState.totalPieces) {
        showToast('⚠️ البرهان مكتمل بالفعل!', 'warning');
        return;
    }
    
    GameState.autoCompleteUsed = true;
    const modeData = getModeData();
    
    // إزالة القطع الموجودة
    Array.from(elements.mainDropZone.children).forEach(child => {
        if (child.classList && child.classList.contains('draggable')) {
            child.remove();
        }
    });
    
    // وضع جميع القطع تلقائياً
    modeData.pieces.forEach(p => {
        const el = document.getElementById(p.id);
        if (el && !elements.mainDropZone.contains(el)) {
            el.style.position = 'absolute';
            if (p.pos.top !== undefined) el.style.top = p.pos.top;
            if (p.pos.bottom !== undefined) el.style.bottom = p.pos.bottom;
            if (p.pos.left !== undefined) el.style.left = p.pos.left;
            if (p.pos.right !== undefined) el.style.right = p.pos.right;
            el.style.width = p.w + 'px';
            el.style.height = p.h + 'px';
            
            elements.mainDropZone.appendChild(el);
        }
    });
    
    GameState.placedPieces = modeData.pieces.length;
    elements.dropPrompt.classList.add('hidden');
    updateHUD();
    checkCompletion();
    
    showToast('🤖 تم عرض الحل تلقائياً', 'info');
}

function nextChallenge() {
    const modes = ['first', 'second', 'third'];
    const nextMode = modes[Math.floor(Math.random() * modes.length)];
    
    GameState.a = Math.floor(Math.random() * (GameState.maxA - GameState.minA + 1)) + GameState.minA;
    GameState.b = Math.floor(Math.random() * (GameState.maxB - GameState.minB + 1)) + GameState.minB;
    
    if (GameState.a <= GameState.b) {
        GameState.a = GameState.b + 25;
    }
    
    elements.rangeA.value = GameState.a;
    elements.rangeB.value = GameState.b;
    elements.valA.textContent = GameState.a;
    elements.valB.textContent = GameState.b;
    
    switchMode(nextMode);
    showToast('🚀 تحدي جديد يبدأ الآن!', 'success');
}

function resetCurrentMode() {
    GameState.streak = 0;
    GameState.hintsUsed = 0;
    initGame();
    showToast('🔄 تم إعادة نفس التحدي');
}

// ============ أحداث المستخدم ============
elements.mainDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.mainDropZone.classList.add('drag-over');
});

elements.mainDropZone.addEventListener('dragleave', () => {
    elements.mainDropZone.classList.remove('drag-over');
});

elements.mainDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.mainDropZone.classList.remove('drag-over');
    
    const id = e.dataTransfer.getData('text/plain');
    const el = document.getElementById(id);
    
    if (!el || elements.mainDropZone.contains(el)) return;

    const modeData = getModeData();
    const pieceConfig = modeData.pieces.find(p => p.id === id);
    if (!pieceConfig) return;

    el.style.position = 'absolute';
    if (pieceConfig.pos.top !== undefined) el.style.top = pieceConfig.pos.top;
    if (pieceConfig.pos.bottom !== undefined) el.style.bottom = pieceConfig.pos.bottom;
    if (pieceConfig.pos.left !== undefined) el.style.left = pieceConfig.pos.left;
    if (pieceConfig.pos.right !== undefined) el.style.right = pieceConfig.pos.right;
    el.style.width = pieceConfig.w + 'px';
    el.style.height = pieceConfig.h + 'px';

    elements.mainDropZone.appendChild(el);
    GameState.placedPieces++;
    AudioSystem.playDrop();
    
    elements.dropPrompt.classList.add('hidden');
    updateHUD();
    checkCompletion();
});

elements.rangeA.addEventListener('input', () => {
    GameState.valueChangeCount++;
    initGame();
});

elements.rangeB.addEventListener('input', () => {
    GameState.valueChangeCount++;
    initGame();
});

document.getElementById('resetBtn').addEventListener('click', resetCurrentMode);
document.getElementById('hintBtn').addEventListener('click', useHint);
document.getElementById('autoCompleteBtn').addEventListener('click', autoComplete);

window.addEventListener('resize', () => {
    const modeData = getModeData();
    adjustBoardScale(modeData.totalWidth, modeData.totalHeight);
});

// جعل الدوال متاحة عالمياً
window.switchMode = switchMode;
window.nextChallenge = nextChallenge;
window.resetCurrentMode = resetCurrentMode;

// ============ التهيئة عند التحميل ============
window.addEventListener('DOMContentLoaded', () => {
    AudioSystem.init();
    loadProgress();
    initGame();
    
    console.log('🎮 مختبر المتطابقات الهامة - النظام المتكامل جاهز!');
    console.log('📐 المتطابقات المدعومة: (a+b)², (a-b)², a²-b²');
    console.log('📏 القيم الافتراضية: a=' + GameState.a + ', b=' + GameState.b);
    console.log('🏆 الإنجازات المحققة: ' + GameState.achievements.length + '/12');
});