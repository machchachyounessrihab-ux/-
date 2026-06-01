/**
 * ==========================================
 * مختبر المتطابقات - نظام القطع المتناسبة
 * Gamified Math Lab - Proportional Pieces System
 * ==========================================
 */

// ============ حالة اللعبة ============
const GameState = {
    playerLevel: 1,
    totalPoints: 0,
    currentXP: 0,
    xpToNext: 100,
    streak: 0,
    achievements: [],
    soundEnabled: true,
    currentMode: 'first',
    a: 150,
    b: 60,
    placedPieces: 0,
    totalPieces: 0,
    hintsUsed: 0,
    startTime: Date.now(),
    // حدود القيم
    minA: 100,
    maxA: 200,
    minB: 40,
    maxB: 90
};

// ============ نظام الإنجازات ============
const Achievements = {
    firstComplete: { id: 'firstComplete', name: '🛡️ البداية', desc: 'أكمل أول متطابقة', icon: '🛡️', points: 50 },
    speedRunner: { id: 'speedRunner', name: '⚡ السريع', desc: 'أكمل البرهان في أقل من 30 ثانية', icon: '⚡', points: 100 },
    perfectStreak: { id: 'perfectStreak', name: '🔥 متقن', desc: '3 محاولات ناجحة متتالية', icon: '🔥', points: 75 },
    explorer: { id: 'explorer', name: '🧭 مستكشف', desc: 'جرب جميع المتطابقات الثلاث', icon: '🧭', points: 60 },
    noHints: { id: 'noHints', name: '🧠 عبقري', desc: 'أكمل بدون استخدام تلميحات', icon: '🧠', points: 150 },
    mathWizard: { id: 'mathWizard', name: '🧙 ساحر الرياضيات', desc: 'اجمع 500 نقطة', icon: '🧙', points: 200 },
    collector: { id: 'collector', name: '🎖️ جامع الإنجازات', desc: 'احصل على 5 إنجازات', icon: '🎖️', points: 100 },
    perfectionist: { id: 'perfectionist', name: '💎 المثالي', desc: 'أكمل جميع المتطابقات', icon: '💎', points: 300 },
    proportionalMaster: { id: 'proportionalMaster', name: '📐 خبير التناسب', desc: 'غير القيم 5 مرات وأكمل البرهان', icon: '📐', points: 80 }
};

// ============ عناصر DOM ============
const elements = {
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
    piecesContainer: document.getElementById('piecesContainer'),
    mainDropZone: document.getElementById('mainDropZone'),
    labelsContainer: document.getElementById('labelsContainer'),
    feedback: document.getElementById('feedback'),
    formulaText: document.getElementById('formulaText'),
    explanationContent: document.getElementById('explanationContent'),
    dropPrompt: document.getElementById('dropPrompt'),
    totalAreaVal: document.getElementById('totalAreaVal'),
    rulesPanel: document.getElementById('rulesPanel'),
    playerLevel: document.getElementById('playerLevel'),
    totalPoints: document.getElementById('totalPoints'),
    currentXP: document.getElementById('currentXP'),
    xpToNext: document.getElementById('xpToNext'),
    xpBar: document.getElementById('xpBar'),
    streakCount: document.getElementById('streakCount'),
    achievementsCount: document.getElementById('achievementsCount'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    piecesRemaining: document.getElementById('piecesRemaining'),
    storyText: document.getElementById('storyText'),
    dailyChallenge: document.getElementById('dailyChallenge'),
    boardScaler: document.getElementById('boardScaler')
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
    
    playTone(frequency, duration, type = 'sine') {
        if (!this.context || !GameState.soundEnabled) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },
    
    playSuccess() {
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.2), 200);
    },
    
    playDrop() {
        this.playTone(440, 0.05, 'triangle');
    },
    
    playAchievement() {
        this.playTone(784, 0.1);
        setTimeout(() => this.playTone(988, 0.1), 100);
        setTimeout(() => this.playTone(1175, 0.3), 200);
    }
};

// ============ نظام الجسيمات ============
function createParticles(x, y) {
    const container = document.getElementById('particlesContainer');
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
        particle.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
        particle.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

// ============ نظام الإشعارات ============
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = type === 'success' ? '#10b981' : 
                             type === 'warning' ? '#f59e0b' : '#8b5cf6';
    toast.style.color = 'white';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

// ============ نظام XP والمستويات ============
function addXP(amount) {
    GameState.currentXP += amount;
    
    while (GameState.currentXP >= GameState.xpToNext) {
        GameState.currentXP -= GameState.xpToNext;
        GameState.playerLevel++;
        GameState.xpToNext = Math.floor(GameState.xpToNext * 1.5);
        showToast(`🎉 تهانينا! وصلت للمستوى ${GameState.playerLevel}!`, 'success');
        AudioSystem.playAchievement();
    }
    
    updateHUD();
}

function addPoints(amount) {
    GameState.totalPoints += amount;
    document.getElementById('lastEarned').textContent = amount;
    
    if (GameState.totalPoints >= 500 && !GameState.achievements.includes('mathWizard')) {
        unlockAchievement('mathWizard');
    }
    
    addXP(amount);
    updateHUD();
}

// ============ نظام الإنجازات ============
let valueChangeCount = 0;

function unlockAchievement(achievementId) {
    if (GameState.achievements.includes(achievementId)) return;
    
    const achievement = Achievements[achievementId];
    GameState.achievements.push(achievementId);
    
    showToast(`${achievement.icon} إنجاز جديد: ${achievement.name}!`, 'achievement');
    addPoints(achievement.points);
    AudioSystem.playAchievement();
    
    if (GameState.achievements.length >= 5 && !GameState.achievements.includes('collector')) {
        unlockAchievement('collector');
    }
    
    updateAchievements();
    saveProgress();
}

function updateAchievements() {
    elements.achievementsCount.textContent = GameState.achievements.length;
    
    const preview = document.getElementById('achievementsPreview');
    preview.innerHTML = GameState.achievements.slice(-4).map(id => 
        `<span title="${Achievements[id].name}">${Achievements[id].icon}</span>`
    ).join('');
    
    const list = document.getElementById('achievementsList');
    list.innerHTML = Object.values(Achievements).map(ach => `
        <div class="flex items-center gap-2 p-2 rounded-lg ${GameState.achievements.includes(ach.id) ? 'bg-white shadow-sm' : 'bg-slate-100 opacity-50'}">
            <span class="text-lg">${ach.icon}</span>
            <div>
                <p class="font-semibold text-xs">${ach.name}</p>
                <p class="text-[10px] text-slate-500">${ach.desc}</p>
            </div>
            ${GameState.achievements.includes(ach.id) ? '<span class="ml-auto text-emerald-500">✅</span>' : '<span class="ml-auto text-slate-300">🔒</span>'}
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
    elements.piecesRemaining.textContent = `${GameState.totalPieces - GameState.placedPieces} قطع`;
    
    // تحديث القياسات
    elements.valADisplay.textContent = GameState.a;
    elements.valBDisplay.textContent = GameState.b;
    elements.valSum.textContent = GameState.a + GameState.b;
    elements.valDiff.textContent = GameState.a - GameState.b;
    elements.rangeAValue.textContent = GameState.a;
    elements.rangeBValue.textContent = GameState.b;
}

// ============ حفظ وتحميل التقدم ============
function saveProgress() {
    const saveData = {
        level: GameState.playerLevel,
        points: GameState.totalPoints,
        xp: GameState.currentXP,
        achievements: GameState.achievements,
        streak: GameState.streak,
        valueChangeCount: valueChangeCount
    };
    localStorage.setItem('mathLabProgress', JSON.stringify(saveData));
}

function loadProgress() {
    const saved = localStorage.getItem('mathLabProgress');
    if (saved) {
        const data = JSON.parse(saved);
        GameState.playerLevel = data.level || 1;
        GameState.totalPoints = data.points || 0;
        GameState.currentXP = data.xp || 0;
        GameState.achievements = data.achievements || [];
        GameState.streak = data.streak || 0;
        valueChangeCount = data.valueChangeCount || 0;
        updateHUD();
        updateAchievements();
    }
}

// ============ نظام التلميحات ============
function useHint() {
    if (GameState.totalPoints >= 10) {
        GameState.totalPoints -= 10;
        GameState.hintsUsed++;
        updateHUD();
        
        const pieces = document.querySelectorAll('#piecesContainer > div');
        const placed = GameState.placedPieces;
        
        if (pieces[placed]) {
            pieces[placed].style.animation = 'none';
            pieces[placed].style.boxShadow = '0 0 25px #f59e0b, 0 0 50px #f59e0b';
            pieces[placed].style.transform = 'scale(1.08)';
            setTimeout(() => {
                pieces[placed].style.boxShadow = '';
                pieces[placed].style.transform = '';
                pieces[placed].style.animation = '';
            }, 2000);
        }
        
        showToast('💡 تم خصم 10 نقاط للتلميح', 'warning');
    } else {
        showToast('❌ ليس لديك نقاط كافية! تحتاج 10 نقاط على الأقل', 'warning');
    }
}

// ============ التحدي التالي ============
function nextChallenge() {
    const modes = ['first', 'second', 'third'];
    const nextMode = modes[Math.floor(Math.random() * modes.length)];
    
    // توليد قيم متناسبة جديدة
    GameState.a = Math.floor(Math.random() * (GameState.maxA - GameState.minA + 1)) + GameState.minA;
    GameState.b = Math.floor(Math.random() * (GameState.maxB - GameState.minB + 1)) + GameState.minB;
    
    // ضمان أن a > b دائماً
    if (GameState.a <= GameState.b) {
        GameState.a = GameState.b + 20;
    }
    
    elements.rangeA.value = GameState.a;
    elements.rangeB.value = GameState.b;
    elements.valA.textContent = GameState.a;
    elements.valB.textContent = GameState.b;
    
    switchMode(nextMode);
    showToast('🚀 تحدي جديد يبدأ الآن!', 'success');
}

// ============ نظام القطع المتناسبة ============
/**
 * حساب أبعاد القطع بناءً على a و b
 * تضمن هذه الدالة تناسب القطع مع المربع/المستطيل الكلي
 */
function calculateProportionalPieces(mode) {
    const a = GameState.a;
    const b = GameState.b;
    
    switch(mode) {
        case 'first': // (a+b)²
            return {
                pieces: [
                    { 
                        w: a, h: a, 
                        c: 'bg-indigo-500', 
                        l: `a² = ${a*a}`, 
                        calc: a*a, 
                        id: 'sq-a', 
                        pos: { top: '0px', right: '0px' },
                        label: `a²`
                    },
                    { 
                        w: b, h: b, 
                        c: 'bg-pink-500', 
                        l: `b² = ${b*b}`, 
                        calc: b*b, 
                        id: 'sq-b', 
                        pos: { bottom: '0px', left: '0px' },
                        label: `b²`
                    },
                    { 
                        w: a, h: b, 
                        c: 'bg-amber-400', 
                        l: `ab = ${a*b}`, 
                        calc: a*b, 
                        id: 'rect-1', 
                        pos: { bottom: '0px', right: '0px' },
                        label: `ab`
                    },
                    { 
                        w: b, h: a, 
                        c: 'bg-amber-400', 
                        l: `ab = ${a*b}`, 
                        calc: a*b, 
                        id: 'rect-2', 
                        pos: { top: '0px', left: '0px' },
                        label: `ab`
                    }
                ],
                totalWidth: a + b,
                totalHeight: a + b,
                totalArea: (a + b) * (a + b),
                dims: [
                    { text: 'a', x: b, y: -25, w: a, type: 'h' },
                    { text: 'b', x: 0, y: -25, w: b, type: 'h' },
                    { text: 'a', x: a+b+12, y: 0, h: a, type: 'v' },
                    { text: 'b', x: a+b+12, y: a, h: b, type: 'v' }
                ]
            };
            
        case 'second': // (a-b)²
            return {
                pieces: [
                    { 
                        w: a-b, h: a-b, 
                        c: 'bg-indigo-700', 
                        l: `(a-b)² = ${(a-b)*(a-b)}`, 
                        calc: (a-b)*(a-b), 
                        id: 'sq-amb', 
                        pos: { top: '0px', right: '0px' },
                        label: `(a-b)²`
                    },
                    { 
                        w: b, h: a-b, 
                        c: 'bg-slate-400', 
                        l: `b(a-b) = ${b*(a-b)}`, 
                        calc: b*(a-b), 
                        id: 'rect-sub1', 
                        pos: { top: '0px', left: '0px' },
                        label: `b(a-b)`
                    },
                    { 
                        w: a-b, h: b, 
                        c: 'bg-slate-400', 
                        l: `b(a-b) = ${(a-b)*b}`, 
                        calc: (a-b)*b, 
                        id: 'rect-sub2', 
                        pos: { bottom: '0px', right: '0px' },
                        label: `b(a-b)`
                    },
                    { 
                        w: b, h: b, 
                        c: 'bg-pink-500', 
                        l: `b² = ${b*b}`, 
                        calc: b*b, 
                        id: 'sq-b2', 
                        pos: { bottom: '0px', left: '0px' },
                        label: `b²`
                    }
                ],
                totalWidth: a,
                totalHeight: a,
                totalArea: a * a,
                dims: [
                    { text: 'a-b', x: b, y: -25, w: a-b, type: 'h' },
                    { text: 'b', x: 0, y: -25, w: b, type: 'h' },
                    { text: 'a-b', x: a+12, y: 0, h: a-b, type: 'v' },
                    { text: 'b', x: a+12, y: a-b, h: b, type: 'v' }
                ]
            };
            
        case 'third': // (a-b)(a+b)
            return {
                pieces: [
                    { 
                        w: a, h: a-b, 
                        c: 'bg-indigo-500', 
                        l: `a(a-b) = ${a*(a-b)}`, 
                        calc: a*(a-b), 
                        id: 't-rect-1', 
                        pos: { top: '0px', left: '0px' },
                        label: `a(a-b)`
                    },
                    { 
                        w: b, h: a-b, 
                        c: 'bg-amber-400', 
                        l: `b(a-b) = ${b*(a-b)}`, 
                        calc: b*(a-b), 
                        id: 't-rect-2', 
                        pos: { top: '0px', right: '0px' },
                        label: `b(a-b)`
                    }
                ],
                totalWidth: a + b,
                totalHeight: a - b,
                totalArea: (a + b) * (a - b),
                dims: [
                    { text: 'a', x: 0, y: -25, w: a, type: 'h' },
                    { text: 'b', x: a, y: -25, w: b, type: 'h' },
                    { text: 'a-b', x: a+b+12, y: 0, h: a-b, type: 'v' }
                ]
            };
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
    GameState.startTime = Date.now();
    GameState.hintsUsed = 0;
    updateHUD();
}

/**
 * إنشاء القطع المتناسبة مع الأبعاد الصحيحة
 */
function createPieces() {
    elements.piecesContainer.innerHTML = '';
    
    const modeData = calculateProportionalPieces(GameState.currentMode);
    const pieces = modeData.pieces;
    GameState.totalPieces = pieces.length;

    pieces.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = `draggable rounded-lg flex items-center justify-center relative ${p.c}`;
        div.style.width = Math.max(p.w, 40) + 'px';   // حد أدنى 40px
        div.style.height = Math.max(p.h, 40) + 'px';   // حد أدنى 40px
        div.draggable = true;
        div.id = p.id;
        div.title = `${p.label}: ${p.calc} وحدة مربعة`;
        
        // إضافة بيانات القطعة كـ data attributes
        div.dataset.width = p.w;
        div.dataset.height = p.h;
        div.dataset.area = p.calc;
        div.dataset.position = JSON.stringify(p.pos);
        
        const label = document.createElement('span');
        label.className = 'shape-label';
        
        // تسمية متكيفة مع حجم القطعة
        const fontSize = Math.min(p.w, p.h) > 60 ? '0.8rem' : '0.6rem';
        label.style.fontSize = fontSize;
        label.innerHTML = `<span>${p.label}</span><span class="area-val" style="font-size:${Math.min(p.w, p.h) > 60 ? '0.65rem' : '0.5rem'}">${p.calc} م²</span>`;
        
        div.appendChild(label);

        // أحداث السحب
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.target.style.opacity = '0.7';
            e.target.style.transform = 'scale(1.05)';
        });
        
        div.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
            e.target.style.transform = '';
        });

        // تأخير الحركة للتنوع
        div.style.animationDelay = `${index * 0.15}s`;
        
        elements.piecesContainer.appendChild(div);
    });
    
    updateHUD();
}

/**
 * رسم خطوط الأبعاد على اللوحة
 */
function drawDimensions() {
    elements.labelsContainer.innerHTML = '';
    
    const modeData = calculateProportionalPieces(GameState.currentMode);
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
            label.style.top = (d.y - 18) + 'px';
            label.style.transform = 'translateX(-50%)';
        } else {
            label.style.left = (d.x + 12) + 'px';
            label.style.top = (d.y + d.h/2) + 'px';
            label.style.transform = 'translateY(-50%)';
        }
        
        elements.labelsContainer.appendChild(line);
        elements.labelsContainer.appendChild(label);
    });
}

/**
 * التحقق من اكتمال البرهان
 */
function checkCompletion() {
    if (GameState.placedPieces === GameState.totalPieces) {
        const completionTime = (Date.now() - GameState.startTime) / 1000;
        const modeData = calculateProportionalPieces(GameState.currentMode);
        
        elements.mainDropZone.classList.add('correct-bg');
        elements.totalAreaVal.innerText = modeData.totalArea;
        elements.feedback.classList.remove('invisible');
        elements.rulesPanel.classList.add('visible');
        
        drawDimensions();
        
        // حساب النقاط مع مكافآت
        let earnedPoints = 50; // نقاط أساسية
        if (completionTime < 30) earnedPoints += 50; // مكافأة السرعة
        if (GameState.streak >= 2) earnedPoints += 25; // مكافأة السلسلة
        if (GameState.hintsUsed === 0) earnedPoints += 25; // مكافأة عدم استخدام تلميحات
        
        addPoints(earnedPoints);
        GameState.streak++;
        
        // جسيمات النجاح
        const rect = elements.mainDropZone.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        createParticles(centerX, centerY);
        
        AudioSystem.playSuccess();
        
        // التحقق من الإنجازات
        if (!GameState.achievements.includes('firstComplete')) {
            unlockAchievement('firstComplete');
        }
        
        if (completionTime < 30 && !GameState.achievements.includes('speedRunner')) {
            unlockAchievement('speedRunner');
        }
        
        if (GameState.streak >= 3 && !GameState.achievements.includes('perfectStreak')) {
            unlockAchievement('perfectStreak');
        }
        
        if (GameState.hintsUsed === 0 && !GameState.achievements.includes('noHints')) {
            unlockAchievement('noHints');
        }
        
        if (valueChangeCount >= 5 && !GameState.achievements.includes('proportionalMaster')) {
            unlockAchievement('proportionalMaster');
        }
        
        // عرض النقاط المكتسبة
        document.getElementById('pointsEarned').innerHTML = `
            <span class="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">+${earnedPoints} نقطة</span>
            ${completionTime < 30 ? '<span class="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">⚡ سريع</span>' : ''}
            ${GameState.hintsUsed === 0 ? '<span class="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">🧠 بدون تلميح</span>' : ''}
        `;
        
        updateHUD();
        saveProgress();
        setTimeout(triggerMathJax, 60);
    }
}

/**
 * تهيئة اللعبة مع القطع المتناسبة
 */
function initGame() {
    // تحديث القيم
    GameState.a = parseInt(elements.rangeA.value);
    GameState.b = parseInt(elements.rangeB.value);
    
    // ضمان أن a > b
    if (GameState.a <= GameState.b) {
        GameState.a = GameState.b + 10;
        elements.rangeA.value = GameState.a;
    }
    
    // ضمان أن a-b لا يقل عن 20 للوضوح
    if (GameState.a - GameState.b < 20) {
        GameState.b = GameState.a - 20;
        elements.rangeB.value = GameState.b;
    }
    
    elements.valA.textContent = GameState.a;
    elements.valB.textContent = GameState.b;

    const modeData = calculateProportionalPieces(GameState.currentMode);
    
    // تحديث النصوص
    elements.formulaText.innerHTML = getFormulaText();
    elements.storyText.textContent = getStoryText();
    elements.explanationContent.innerHTML = getExplanationHTML();
    elements.dailyChallenge.textContent = `أكمل البرهان بقيم a=${GameState.a}, b=${GameState.b}`;

    // تنظيف وإعادة تهيئة
    clearZone();

    // تعيين حجم منطقة الإفلات
    elements.mainDropZone.style.width = Math.max(modeData.totalWidth, 100) + 'px';
    elements.mainDropZone.style.height = Math.max(modeData.totalHeight, 100) + 'px';

    createPieces();
    updateHUD();
    
    // ضبط التكبير التلقائي
    adjustBoardScale(modeData.totalWidth, modeData.totalHeight);
    
    setTimeout(triggerMathJax, 70);
}

/**
 * ضبط تكبير اللوحة تلقائياً حسب حجم المربع
 */
function adjustBoardScale(totalWidth, totalHeight) {
    const maxWidth = 500; // أقصى عرض مسموح
    const maxHeight = 500; // أقصى ارتفاع مسموح
    
    const scaleX = maxWidth / totalWidth;
    const scaleY = maxHeight / totalHeight;
    const scale = Math.min(scaleX, scaleY, 1.5); // لا يزيد عن 1.5x
    
    if (window.innerWidth >= 768) {
        elements.boardScaler.style.transform = `scale(${Math.min(scale, 1.35)})`;
    } else {
        elements.boardScaler.style.transform = `scale(${Math.min(scale, 0.9)})`;
    }
}

function getFormulaText() {
    switch(GameState.currentMode) {
        case 'first': return `\\( (a+b)^2 = a^2 + 2ab + b^2 \\)`;
        case 'second': return `\\( (a-b)^2 = a^2 - 2ab + b^2 \\)`;
        case 'third': return `\\( (a-b)(a+b) = a^2 - b^2 \\)`;
    }
}

function getStoryText() {
    switch(GameState.currentMode) {
        case 'first': return `🏰 ابنِ القلعة المربعة الكبيرة! (${GameState.a}+${GameState.b})²`;
        case 'second': return `🔍 اكتشف المساحة المخفية داخل المربع! (${GameState.a}-${GameState.b})²`;
        case 'third': return `🎯 اصنع المستطيل السحري! (${GameState.a}-${GameState.b})(${GameState.a}+${GameState.b})`;
    }
}

function getExplanationHTML() {
    switch(GameState.currentMode) {
        case 'first': return `
            <p class="text-indigo-300 font-bold text-xl mb-2">المتطابقة الأولى: مربع المجموع</p>
            <p>المساحة الكلية = (${GameState.a} + ${GameState.b})² = ${(GameState.a + GameState.b) ** 2}</p>
            <p>المربع الأزرق: ${GameState.a}² = ${GameState.a ** 2}</p>
            <p>المربع الوردي: ${GameState.b}² = ${GameState.b ** 2}</p>
            <p>المستطيلان الأصفران: 2 × (${GameState.a} × ${GameState.b}) = ${2 * GameState.a * GameState.b}</p>
            <p class="text-emerald-300 mt-2">✅ ${GameState.a ** 2} + ${2 * GameState.a * GameState.b} + ${GameState.b ** 2} = ${(GameState.a + GameState.b) ** 2}</p>
        `;
        case 'second': return `
            <p class="text-indigo-300 font-bold text-xl mb-2">المتطابقة الثانية: مربع الفرق</p>
            <p>المساحة الكلية = ${GameState.a}² = ${GameState.a ** 2}</p>
            <p>المربع الأزرق الداكن: (${GameState.a}-${GameState.b})² = ${(GameState.a - GameState.b) ** 2}</p>
            <p>المستطيلان الرماديان: 2 × ${GameState.b}(${GameState.a}-${GameState.b}) = ${2 * GameState.b * (GameState.a - GameState.b)}</p>
            <p>المربع الوردي: ${GameState.b}² = ${GameState.b ** 2}</p>
            <p class="text-emerald-300 mt-2">✅ ${GameState.a ** 2} = ${(GameState.a - GameState.b) ** 2} + ${2 * GameState.b * (GameState.a - GameState.b)} + ${GameState.b ** 2}</p>
        `;
        case 'third': return `
            <p class="text-indigo-300 font-bold text-xl mb-2">المتطابقة الثالثة: فرق المربعين</p>
            <p>المساحة الكلية = (${GameState.a}+${GameState.b})(${GameState.a}-${GameState.b}) = ${(GameState.a + GameState.b) * (GameState.a - GameState.b)}</p>
            <p>المستطيل الأزرق: ${GameState.a}(${GameState.a}-${GameState.b}) = ${GameState.a * (GameState.a - GameState.b)}</p>
            <p>المستطيل الأصفر: ${GameState.b}(${GameState.a}-${GameState.b}) = ${GameState.b * (GameState.a - GameState.b)}</p>
            <p class="text-emerald-300 mt-2">✅ ${GameState.a ** 2} - ${GameState.b ** 2} = ${(GameState.a + GameState.b) * (GameState.a - GameState.b)}</p>
        `;
    }
}

function switchMode(mode) {
    GameState.currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    
    elements.rulesPanel.classList.remove('visible');
    
    // التحقق من إنجاز المستكشف
    const allModes = ['first', 'second', 'third'];
    const completedModes = new Set();
    
    if (GameState.achievements.includes('firstComplete')) completedModes.add('first');
    if (GameState.achievements.includes('explorer')) completedModes.add('second');
    
    if (completedModes.size >= 2 && !GameState.achievements.includes('explorer')) {
        unlockAchievement('explorer');
    }
    
    initGame();
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

    const modeData = calculateProportionalPieces(GameState.currentMode);
    const pieceConfig = modeData.pieces.find(p => p.id === id);
    if (!pieceConfig) return;

    // وضع القطعة في موقعها الصحيح داخل المربع
    el.style.position = 'absolute';
    if (pieceConfig.pos.top !== undefined) el.style.top = pieceConfig.pos.top;
    if (pieceConfig.pos.bottom !== undefined) el.style.bottom = pieceConfig.pos.bottom;
    if (pieceConfig.pos.left !== undefined) el.style.left = pieceConfig.pos.left;
    if (pieceConfig.pos.right !== undefined) el.style.right = pieceConfig.pos.right;
    
    // ضبط الأبعاد بدقة
    el.style.width = pieceConfig.w + 'px';
    el.style.height = pieceConfig.h + 'px';

    elements.mainDropZone.appendChild(el);
    GameState.placedPieces++;
    AudioSystem.playDrop();
    
    elements.dropPrompt.classList.add('hidden');
    updateHUD();
    checkCompletion();
});

// أحداث المنزلقات
elements.rangeA.addEventListener('input', () => {
    valueChangeCount++;
    initGame();
});

elements.rangeB.addEventListener('input', () => {
    valueChangeCount++;
    initGame();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    GameState.streak = 0;
    GameState.hintsUsed = 0;
    initGame();
    showToast('🔄 تم إعادة التعيين');
});

document.getElementById('hintBtn').addEventListener('click', useHint);

// تحديث التكبير عند تغيير حجم النافذة
window.addEventListener('resize', () => {
    const modeData = calculateProportionalPieces(GameState.currentMode);
    adjustBoardScale(modeData.totalWidth, modeData.totalHeight);
});

// جعل الدوال متاحة عالمياً
window.switchMode = switchMode;
window.nextChallenge = nextChallenge;

// ============ التهيئة عند التحميل ============
window.addEventListener('DOMContentLoaded', () => {
    AudioSystem.init();
    loadProgress();
    initGame();
    console.log('🎮 مختبر المتطابقات - نظام القطع المتناسبة جاهز!');
    console.log(`📐 الأبعاد الحالية: a=${GameState.a}, b=${GameState.b}`);
    console.log(`📏 المربع الكلي: ${calculateProportionalPieces(GameState.currentMode).totalWidth}x${calculateProportionalPieces(GameState.currentMode).totalHeight}`);
});