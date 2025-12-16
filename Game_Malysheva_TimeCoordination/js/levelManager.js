class LevelManager {
    constructor(core) {
        this.core = core; // Ссылка на ядро игры
        this.currentLevelHandler = null; // Текущий обработчик уровня
        this.timers = []; // Массив для хранения таймеров
        this.levels = this.createLevelsStructure(); // Структура всех уровней
        this.currentLevelId = null; // ID текущего уровня
        this.currentSublevelId = null; // ID текущего подуровня
        // Инициализация разблокировки уровней на основе прогресса
        this.initializeLevelUnlock();
        // Ссылка на экземпляр для глобальной очистки
        LevelManager.currentInstance = this;
    }

    // Структура всех уровней
    createLevelsStructure() {
        return {
            // ========== УРОВЕНЬ 1: ИЗМЕРЕНИЕ ВРЕМЕНИ ==========
            'level1': {
                id: 'level1',
                name: 'Измерение времени',
                description: 'Развитие базовых навыков восприятия и измерения времени',
                color: 'var(--text-dark)',
                unlocked: true, // Первый уровень разблокирован сразу
                sublevels: {
                    '1-1': {
                        id: '1-1',
                        name: 'Одна лампочка',
                        description: 'Научитесь оценивать время горения одной лампочки с высокой точностью',
                        type: 'input_time', // Подуровень 1-1
                        difficulty: 'easy',
                        attempts: 3,
                        params: {
                            lightbulbs: 1,
                            minDuration: 1.0,
                            maxDuration: 3.0,
                            inputMethod: 'both',
                            inputTimeLimit: 10 // Ограничение по времени на ввод
                        }
                    },
                    '1-2': {
                        id: '1-2',
                        name: 'Летающие карточки',
                        description: 'Тренируйте внимание и точность при выборе правильного времени среди отвлекающих карточек',
                        type: 'select_time', // Подуровень 1-2
                        difficulty: 'easy',
                        attempts: 3,
                        timeLimit: 15,
                        params: {
                            lightbulbs: 1,
                            cardsCount: 6,
                            minDuration: 1.5,
                            maxDuration: 4.0
                        }
                    },
                    '1-3': {
                        id: '1-3',
                        name: 'Двойной интервал',
                        description: 'Развивайте память и точность при запоминании двух интервалов времени',
                        type: 'two_intervals', // Подуровень 1-3
                        difficulty: 'medium',
                        attempts: 3,
                        params: {
                            lightbulbs: 1
                            // intervals генерируются случайно для каждого раунда
                        }
                    }
                }
            },

            // ========== УРОВЕНЬ 2: РАБОЧАЯ ПАМЯТЬ ==========
            'level2': {
                id: 'level2',
                name: 'Рабочая память',
                description: 'Развитие рабочей памяти и внимания при поиске закономерностей',
                color: 'var(--text-dark)',
                unlocked: false, // Будет разблокирован после прохождения уровня 1
                sublevels: {
                    '2-1': {
                        id: '2-1',
                        name: 'Движущиеся лампочки',
                        description: 'Тренируйте внимание и память при поиске целевой лампочки среди отвлекающих факторов',
                        type: 'pattern_blur', // Подуровень 2-1
                        difficulty: 'medium',
                        attempts: 3,
                        params: {
                            lightbulbs: 3,
                            targetIndex: 0,
                            pattern: [1.0, 0.5, 1.5],
                            distractionBlink: true
                        }
                    },
                    '2-2': {
                        id: '2-2',
                        name: 'Найди время',
                        description: 'Комбинируйте внимание и восприятие времени при поиске лампочки с заданным интервалом',
                        type: 'find_duration', // Подуровень 2-2
                        difficulty: 'hard',
                        attempts: 3,
                        timeLimit: 10,
                        params: {
                            lightbulbs: 3,
                            shades: ['light', 'medium', 'dark'],
                            minDuration: 1.2,
                            maxDuration: 3.0
                        }
                    },
                    '2-3': {
                        id: '2-3',
                        name: 'Повтори паттерн',
                        description: 'Развивайте память и моторные навыки при повторении сложных паттернов мигания',
                        type: 'repeat_pattern', // Подуровень 2-3
                        difficulty: 'hard',
                        attempts: 3,
                        params: {
                            lightbulbs: 2,
                            patternLength: 3,
                            segmentMin: 0.5,
                            segmentMax: 1.5,
                            interactiveIndex: 1,
                            demonstrationIndex: 0
                        }
                    }
                }
            },
            // ========== УРОВЕНЬ 3: ЛОГИКА И СМЕКАЛКА ==========
            'level3': {
                id: 'level3',
                name: 'Логика и смекалка',
                description: 'Развитие логического мышления и памяти',
                color: 'var(--text-dark)',
                unlocked: false, // Будет разблокирован после прохождения уровня 2
                sublevels: {
                    '3-1': {
                        id: '3-1',
                        name: 'Ритмические последовательности',
                        description: 'Тренируйте память и точность при воспроизведении ритмических последовательностей',
                        type: 'simon_pattern', // Подуровень 3-1
                        difficulty: 'medium',
                        attempts: 3,
                        params: {
                            lightbulbs: 4,
                            sequenceLength: 4,
                            minDuration: 0.5,
                            maxDuration: 2.0,
                            colors: ['#bd8a8a', '#89b589', '#8d8dd8', '#ffff9e']
                        }
                    },
                    '3-2': {
                        id: '3-2',
                        name: 'Математика времени',
                        description: 'Комбинируйте математическое мышление с восприятием времени для решения задач',
                        type: 'time_math', // Подуровень 3-2
                        difficulty: 'hard',
                        attempts: 3,
                        timeLimit: 20,
                        params: {
                            lightbulbs: 4,
                            equationTypes: ['addition', 'subtraction', 'multiplication'],
                            minValue: 1.0,
                            maxValue: 5.0
                        }
                    }
                }
            },

            // ========== УРОВЕНЬ 4: ЛАБИРИНТ ==========
            'level4': {
                id: 'level4',
                name: 'Стратегия и скорость',
                description: 'Поиск кратчайшего пути в условиях ограниченного времени и тренировка памяти',
                color: 'var(--text-dark)',
                unlocked: false, // Будет разблокирован после прохождения уровня 3
                sublevels: {
                    '4-1': {
                        id: '4-1',
                        name: 'Лабиринт времени',
                        description: 'Комплексная тренировка памяти, внимания и скорости принятия решений',
                        type: 'maze_memory', // Подуровень 4-1
                        difficulty: 'hard',
                        attempts: 3,
                        timeLimit: 15,
                        params: {
                            mazeSize: 5,
                            lightbulbDuration: 3.0,
                            minPathLength: 4,
                            maxPathLength: 8
                        }
                    }
                }
            }
        };
    }

    // Запуск уровня
    startLevel(levelId, sublevelId) {

        this.stopLevel();
        this.clearTimers();

        const levelData = this.levels[levelId];
        if (!levelData) {
            return false;
        }

        if (this.core.getGameMode() !== 'training') {
            if (!levelData.unlocked) {
                return false;
            }

            if (!this.isSublevelAvailable(levelId, sublevelId)) {
                return false;
            }
        }

        let sublevelData;
        const searchKey = sublevelId.toString();

        if (Array.isArray(levelData.sublevels)) {
            sublevelData = levelData.sublevels.find(s => s.id.toString() === searchKey);
        } else {
            sublevelData = levelData.sublevels[searchKey];
        }

        if (!sublevelData) {
            return false;
        }

        this.currentLevelId = levelId;
        this.currentSublevelId = sublevelId;

        try {
            switch (levelId) {
                case 'level1':
                    this.currentLevelHandler = new Level1Handler(this.core, sublevelData);
                    break;
                case 'level2':
                    this.currentLevelHandler = new Level2Handler(this.core, sublevelData);
                    break;
                case 'level3':
                    this.currentLevelHandler = new Level3Handler(this.core, sublevelData);
                    break;
                case 'level4':
                    this.currentLevelHandler = new Level4Handler(this.core, sublevelData);
                    break;
                default:
                    throw new Error(`Неизвестный уровень: ${levelId}`);
            }

            if (this.currentLevelHandler && typeof this.currentLevelHandler.start === 'function') {
                this.currentLevelHandler.start();
                return true;
            }
        } catch (error) {
            this.showError(`Ошибка: ${error.message}`);
            return false;
        }

        return false;
    }

    // Стандартные методы
    stopLevel() {
        this.clearTimers();

        if (this.currentLevelHandler && typeof this.currentLevelHandler.cleanup === 'function') {
            this.currentLevelHandler.cleanup();
        }
        this.currentLevelHandler = null;
    }

    clearTimers() {
        this.timers.forEach(timer => {
            if (timer) {
                clearTimeout(timer);
                clearInterval(timer);
            }
        });
        this.timers = [];
    }

    showError(message) {
        if (this.core.uiManager && typeof this.core.uiManager.showError === 'function') {
            this.core.uiManager.showError(message);
        } else {
            alert(message);
        }
    }

    // Методы для UI
    getLevelInfo(levelId) {
        return this.levels[levelId];
    }

    getSublevelInfo(levelId, sublevelId) {
        const level = this.levels[levelId];
        if (!level || !level.sublevels) return null;

        const sublevelIdStr = sublevelId.toString();

        let searchKey = sublevelIdStr;

        if (!sublevelIdStr.includes('-')) {
            const levelNum = levelId.replace('level', '');
            searchKey = `${levelNum}-${sublevelIdStr}`;
        }

        if (Array.isArray(level.sublevels)) {

            return level.sublevels.find(s => s.id.toString() === searchKey) || null;
        } else {
            return level.sublevels[searchKey] || null;
        }
    }

    getAllLevels() {
        return Object.values(this.levels);
    }

    getCurrentLevelId() {
        return this.currentLevelId;
    }

    getCurrentSublevelId() {
        return this.currentSublevelId;
    }

    // Проверка разблокировки уровня
    isLevelUnlocked(levelId) {
        const level = this.levels[levelId];
        return level ? level.unlocked : false;
    }

    // Проверка прохождения уровня
    checkLevelCompletion(levelId) {
        const level = this.levels[levelId];
        if (!level) return false;

        if (typeof DataManager === 'undefined') {
            return false;
        }

        return DataManager.isLevelCompleted(levelId, 0.8);
    }

    // Сохранить прогресс прохождения подуровня
    saveSublevelProgress(levelId, sublevelId, score, accuracy, mode = 'classic', roundNumber = null, isCompleted = false) {
        if (typeof DataManager === 'undefined') {
            return;
        }

        const gameMode = mode || (this.core && this.core.getGameMode ? this.core.getGameMode() : 'classic');

        let currentRound = roundNumber;
        if (currentRound === null) {
            currentRound = 1;
        }

        this.saveRoundProgress(levelId, sublevelId, score, accuracy, currentRound, gameMode, isCompleted);

    };

    // Сохраняет прогресс раунда и накапливает до полного подуровня
    saveRoundProgress(levelId, sublevelId, score, accuracy, roundNumber, gameMode, isFinal = false) {
        const progressKey = `${levelId}_${sublevelId}_rounds`;

        let roundsData = this.getRoundsData(progressKey);

        roundsData[`round${roundNumber}`] = {
            score: score,
            accuracy: accuracy,
            timestamp: Date.now()
        };

        this.saveRoundsData(progressKey, roundsData);

        if (roundNumber === 3 || isFinal) {
            this.finalizeSublevelProgress(levelId, sublevelId, roundsData, gameMode);
        }
    }

    // Получает данные раундов из sessionStorage
    getRoundsData(key) {
        try {
            if (typeof sessionStorage === 'undefined') {
                console.warn('sessionStorage недоступен');
                return {};
            }

            const data = sessionStorage.getItem(`levelmanager_${key}`);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Ошибка загрузки данных раундов:', error);
            try {
                sessionStorage.removeItem(`levelmanager_${key}`);
            } catch (removeError) {
                console.error('Не удалось удалить поврежденные данные:', removeError);
            }
            return {};
        }
    }

    // Сохраняет данные раундов в sessionStorage
    saveRoundsData(key, data) {
        try {
            if (typeof sessionStorage === 'undefined') {
                console.warn('sessionStorage недоступен, данные не сохранены');
                return false;
            }

            sessionStorage.setItem(`levelmanager_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных раундов:', error);
            return false;
        }
    }

    // Финализирует прогресс подуровня после 3 раундов
    finalizeSublevelProgress(levelId, sublevelId, roundsData, gameMode) {
        const rounds = Object.values(roundsData);
        if (rounds.length === 0) return;

        const totalSublevelScore = rounds.reduce((sum, round) => sum + round.score, 0);

        const totalAccuracy = rounds.reduce((sum, round) => sum + round.accuracy, 0);
        const averageAccuracy = Math.round(totalAccuracy / rounds.length * 10) / 10;

        let finalScore = totalSublevelScore;
        if (averageAccuracy < 80) {
            finalScore = Math.round(finalScore * 0.9);
        }

        const maxSublevelScore = DataManager.getMaxScoreForSublevel(levelId, sublevelId);
        finalScore = Math.min(finalScore, maxSublevelScore);

        DataManager.saveProgress(levelId, sublevelId, finalScore, averageAccuracy, gameMode);

        const progressKey = `${levelId}_${sublevelId}_roundsCompleted`;
        this.saveRoundsData(progressKey, { count: rounds.length });

        const roundsKey = `${levelId}_${sublevelId}_rounds`;
        sessionStorage.removeItem(`levelmanager_${roundsKey}`);

        if (gameMode === 'classic') {
            this.lastUnlockedInfo = this.checkAndUnlockNextLevel(levelId, sublevelId, finalScore);
        }

        if (gameMode === 'classic') {
            DataManager.updateRatingAfterGame(levelId, sublevelId, finalScore, averageAccuracy);
        }
    }


    // Разблокировка следующих уровней/подуровней
    checkAndUnlockNextLevel(levelId, sublevelId, score) {
        const levelOrder = ['level1', 'level2', 'level3', 'level4'];
        const currentLevelIndex = levelOrder.indexOf(levelId);

        if (currentLevelIndex === -1) {
            console.error(`Неизвестный уровень: ${levelId}`);
            return null;
        }

        const levelNum = parseInt(levelId.replace('level', ''));
        let currentSublevelNum;
        if (sublevelId.includes('-')) {
            const parts = sublevelId.split('-');
            currentSublevelNum = parseInt(parts[1]);
        } else {
            currentSublevelNum = parseInt(sublevelId);
        }

        const totalSublevels = DataManager.getTotalSublevelsForLevel(levelId);

        let nextInfo = null;

        if (currentSublevelNum < totalSublevels && score >= DataManager.getMinPassingScore(levelId, sublevelId)) {
            const nextSublevelNum = currentSublevelNum + 1;
            const nextSublevelId = `${levelNum}-${nextSublevelNum}`;
            if (this.levels[levelId].sublevels[nextSublevelId]) {
                this.levels[levelId].sublevels[nextSublevelId].unlocked = true;
                nextInfo = {
                    type: 'sublevel',
                    levelId: levelId,
                    sublevelId: nextSublevelId,
                    name: this.levels[levelId].sublevels[nextSublevelId].name
                };
            }
        }

        else if (score >= DataManager.getMinPassingScore(levelId, sublevelId)) {
            const nextLevelIndex = currentLevelIndex + 1;
            if (nextLevelIndex < levelOrder.length) {
                const nextLevelId = levelOrder[nextLevelIndex];
                this.levels[nextLevelId].unlocked = true;

                const nextLevelNum = parseInt(nextLevelId.replace('level', ''));
                const firstSubId = `${nextLevelNum}-1`;
                if (this.levels[nextLevelId].sublevels[firstSubId]) {
                    this.levels[nextLevelId].sublevels[firstSubId].unlocked = true;
                }

                nextInfo = {
                    type: 'level',
                    levelId: nextLevelId,
                    sublevelId: firstSubId,
                    name: this.levels[nextLevelId].name
                };
            }
        }

        this.saveProgress();

        return nextInfo;
    }

    // Инициализация разблокировки уровней при загрузке
    initializeLevelUnlock() {
        this.loadProgress();

        if (typeof DataManager === 'undefined') {
            console.warn('[LevelManager] DataManager не загружен. Инициализация без прогресса.');
            this.levels['level1'].unlocked = true;
            return;
        }

        this.levels['level1'].unlocked = true;

        const levelOrder = ['level1', 'level2', 'level3', 'level4'];

        for (let i = 0; i < levelOrder.length - 1; i++) {
            const currentLevelId = levelOrder[i];
            const nextLevelId = levelOrder[i + 1];

            const currentLevelNum = parseInt(currentLevelId.replace('level', ''));
            const totalSubsCurrent = DataManager.getTotalSublevelsForLevel(currentLevelId);
            const lastSubIdCurrent = `${currentLevelNum}-${totalSubsCurrent}`;

            if (DataManager.isSublevelCompleted(currentLevelId, lastSubIdCurrent, 0.8)) {
                this.levels[nextLevelId].unlocked = true;

                const nextLevelNum = parseInt(nextLevelId.replace('level', ''));
                const firstSubIdNext = `${nextLevelNum}-1`;
                if (this.levels[nextLevelId].sublevels[firstSubIdNext]) {
                    this.levels[nextLevelId].sublevels[firstSubIdNext].unlocked = true;
                }
            }
        }

    }

    // Получить общий прогресс игрока
    getLevelProgress(levelId) {
        const level = this.levels[levelId];
        if (!level) return null;

        const progress = DataManager.getProgress();
        const trainingProgress = DataManager.getTrainingProgress();
        const levelProgress = {};

        level.sublevels.forEach(sublevel => {
            const classicScore = progress[levelId]?.[sublevel.id] || 0;
            const trainingScore = trainingProgress[levelId]?.[sublevel.id] || 0;
            const bestScore = Math.max(classicScore, trainingScore);

            const maxScore = DataManager.getMaxScoreForSublevel(levelId, sublevel.id);
            const percentage = maxScore > 0 ? Math.round((bestScore / maxScore) * 100) : 0;

            const isAvailable = this.isSublevelAvailable(levelId, sublevel.id);
            const isClassicCompleted = classicScore >= maxScore * 0.8;
            const isTrainingCompleted = trainingScore > 0;

            levelProgress[sublevel.id] = {
                id: sublevel.id,
                name: sublevel.name,
                score: bestScore,
                classicScore: classicScore,
                trainingScore: trainingScore,
                maxScore: maxScore,
                percentage: percentage,
                isAvailable: isAvailable,
                isClassicCompleted: isClassicCompleted,
                isTrainingCompleted: isTrainingCompleted,
                status: this.getSublevelStatus(levelId, sublevel.id, bestScore, maxScore, isAvailable)
            };
        });

        const completedSublevels = Object.values(levelProgress).filter(s => s.isClassicCompleted).length;
        const totalSublevels = level.sublevels.length;

        return {
            levelId: levelId,
            levelName: level.name,
            completedSublevels: completedSublevels,
            totalSublevels: totalSublevels,
            completionPercentage: Math.round((completedSublevels / totalSublevels) * 100),
            isUnlocked: level.unlocked,
            sublevels: levelProgress,
            isCompleted: this.checkLevelCompletion(levelId)
        };
    }

    getPlayerOverallProgress() {
        const progress = DataManager.getProgress();
        const trainingProgress = DataManager.getTrainingProgress();

        if (!progress && !trainingProgress) {
            return {
                totalCompletedSublevels: 0,
                totalSublevels: 0,
                completionPercentage: 0,
                unlockedLevels: ['level1'],
                totalScore: 0,
                bestScore: 0,
                gamesPlayed: 0
            };
        }

        let totalCompletedSublevels = 0;
        let totalSublevels = 0;
        let totalScore = 0;
        let bestScore = 0;
        const unlockedLevels = ['level1'];

        // Проходим по всем уровням
        const levelOrder = ['level1', 'level2', 'level3', 'level4'];

        levelOrder.forEach(levelId => {
            const level = this.levels[levelId];
            if (!level) return;

            totalSublevels += level.sublevels.length;

            const levelProgress = progress[levelId];
            if (levelProgress) {
                // Считаем пройденные подуровни (только классическая игра)
                const completed = level.sublevels.filter(sublevel => {
                    const score = levelProgress[sublevel.id] || 0;
                    const maxScore = DataManager.getMaxScoreForSublevel(levelId, sublevel.id);
                    return score >= maxScore * 0.8;
                }).length;

                totalCompletedSublevels += completed;

                // Собираем статистику
                level.sublevels.forEach(sublevel => {
                    const score = levelProgress[sublevel.id] || 0;
                    if (score > 0) {
                        totalScore += score;
                        if (score > bestScore) {
                            bestScore = score;
                        }
                    }
                });

                // Проверяем разблокировку следующего уровня
                if (completed === level.sublevels.length && levelId !== 'level4') {
                    const nextLevelIndex = levelOrder.indexOf(levelId) + 1;
                    if (nextLevelIndex < levelOrder.length) {
                        const nextLevelId = levelOrder[nextLevelIndex];
                        if (!unlockedLevels.includes(nextLevelId)) {
                            unlockedLevels.push(nextLevelId);
                        }
                    }
                }
            }
        });

        const completionPercentage = totalSublevels > 0
            ? Math.round((totalCompletedSublevels / totalSublevels) * 100)
            : 0;

        // Получаем статистику игрока
        const playerStats = DataManager.getPlayerStats();

        return {
            totalCompletedSublevels,
            totalSublevels,
            completionPercentage,
            unlockedLevels,
            totalScore: playerStats?.totalScore || totalScore,
            bestScore: playerStats?.bestScore || bestScore,
            gamesPlayed: playerStats?.gamesPlayed || 0,
            level: playerStats?.level || 1,
            levelName: playerStats?.levelName || 'Новичок'
        };
    }

    // Проверить доступен ли подуровень
    getSublevelStatus(levelId, sublevelId, score, maxScore, isAvailable) {
        if (!isAvailable) return 'locked';

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

        if (percentage >= 80) return 'completed';
        if (percentage > 0) return 'started';
        return 'available';
    }

    isSublevelAvailable(levelId, sublevelId) {
        const level = this.levels[levelId];
        if (!level) return false;

        if (this.core && this.core.getGameMode && this.core.getGameMode() === 'training') {
            return true;
        }

        return DataManager.isSublevelAvailable(levelId, sublevelId);
    }

    // Получить прогресс для отоброжения в меню
    getMenuProgressData() {
        const overallProgress = this.getPlayerOverallProgress();
        const levelsData = {};

        Object.keys(this.levels).forEach(levelId => {
            const levelProgress = this.getLevelProgress(levelId);
            if (levelProgress) {
                levelsData[levelId] = levelProgress;
            }
        });

        return {
            overall: overallProgress,
            levels: levelsData
        };
    }

    // Сохранить прогресс уровней
    saveProgress() {
        try {
            localStorage.setItem('levelManager_levels', JSON.stringify(this.levels));
        } catch (error) {
            console.error('[LevelManager] Ошибка сохранения прогресса уровней:', error);
        }
    }

    // Загрузить прогресс уровней
    loadProgress() {
        try {
            const savedLevels = localStorage.getItem('levelManager_levels');
            if (savedLevels) {
                const parsedLevels = JSON.parse(savedLevels);
                Object.keys(parsedLevels).forEach(levelId => {
                    if (this.levels[levelId]) {
                        this.levels[levelId].unlocked = parsedLevels[levelId].unlocked;

                        if (parsedLevels[levelId].sublevels) {
                            Object.keys(parsedLevels[levelId].sublevels).forEach(sublevelId => {

                                if (!Array.isArray(this.levels[levelId].sublevels) && this.levels[levelId].sublevels[sublevelId]) {
                                    this.levels[levelId].sublevels[sublevelId] = {
                                        ...this.levels[levelId].sublevels[sublevelId],
                                        unlocked: parsedLevels[levelId].sublevels[sublevelId].unlocked || false,
                                        completed: parsedLevels[levelId].sublevels[sublevelId].completed || false,
                                        bestScore: parsedLevels[levelId].sublevels[sublevelId].bestScore || 0,
                                        bestAccuracy: parsedLevels[levelId].sublevels[sublevelId].bestAccuracy || 0
                                    };
                                }
                            });
                        }
                    }
                });
                console.log('[LevelManager] Прогресс уровней загружен');
            }
        } catch (error) {
            console.error('[LevelManager] Ошибка загрузки прогресса уровней:', error);
        }
    }
}


// Базовый класс для всех уровней
class BaseLevelHandler {
    constructor(core, sublevel) {
        this.core = core;
        this.sublevel = sublevel;
        this.timers = [];
        this.lightbulbs = [];
        this.isActive = false;
        this.timeLimit = 0;
        this.timeLimitTimer = null;
    }

    start() {
        this.isActive = true;
        if (this.core.uiManager) {
            this.core.uiManager.showHint(this.sublevel.description);
            this.core.uiManager.setActionButton('СТАРТ', () => this.beginSequence());
        }
        this.createLightbulbs();
    }

    createLightbulbs() {
        // Базовый метод, должен быть переопределен в наследниках
    }

    beginSequence() {
        // Базовый метод, должен быть переопределен в наследниках
    }

    cleanup() {
        this.isActive = false;
        this.clearTimers();
        this.stopTimeLimit();

        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
            this.keyPressHandler = null;
        }

        const hint = document.getElementById('controls-hint');
        if (hint && hint.parentNode) {
            hint.parentNode.removeChild(hint);
        }

        this.lightbulbs.forEach(lightbulb => {
            if (lightbulb.container && lightbulb.container.parentNode) {
                lightbulb.container.parentNode.removeChild(lightbulb.container);
            }
        });
        this.lightbulbs = [];
    }

    clearTimers() {
        this.timers.forEach(timer => {
            if (timer) {
                clearTimeout(timer);
                clearInterval(timer);
            }
        });
        this.timers = [];
    }

    addTimer(timer) {
        this.timers.push(timer);
    }

    // Методы для таймеров
    createTimeLimitDisplay(initialTime, onTimeUp) {
        const container = document.getElementById('gameArea') || document.body;

        const oldTimer = container.querySelector('.time-limit-display');
        if (oldTimer) oldTimer.remove();

        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'time-limit-display';
        timerDisplay.className = 'game-timer';

        this.timeLimit = initialTime;
        timerDisplay.textContent = `Время: ${this.timeLimit.toFixed(1)} сек`;

        container.appendChild(timerDisplay);

        this.timeLimitTimer = setInterval(() => {
            this.timeLimit -= 0.1;

            if (timerDisplay) {
                timerDisplay.textContent = `Время: ${this.timeLimit.toFixed(1)} сек`;

                if (this.timeLimit < 5) {
                    timerDisplay.classList.add('error');
                }
            }

            if (this.timeLimit <= 0) {
                clearInterval(this.timeLimitTimer);
                if (onTimeUp && typeof onTimeUp === 'function') {
                    onTimeUp();
                }

                if (timerDisplay && timerDisplay.parentNode) {
                    timerDisplay.parentNode.removeChild(timerDisplay);
                }
            }
        }, 100);

        this.addTimer(this.timeLimitTimer);
        return timerDisplay;
    }

    stopTimeLimit() {
        if (this.timeLimitTimer) {
            clearInterval(this.timeLimitTimer);
            this.timeLimitTimer = null;
        }

        const container = document.getElementById('gameArea') || document.body;
        const timerDisplay = container.querySelector('.time-limit-display');
        if (timerDisplay && timerDisplay.parentNode) {
            timerDisplay.parentNode.removeChild(timerDisplay);
        }
    }

    setLightbulbState(index, isOn, color = 'yellow') {
        if (!this.lightbulbs[index]) return;

        const lightbulb = this.lightbulbs[index];
        const svg = lightbulb.svg;

        if (!svg) return;

        const bulb = svg.querySelector('path');
        const rays = svg.querySelector('.rays');

        if (isOn) {
            if (bulb) {
                if (color === 'yellow') {
                    bulb.setAttribute('fill', '#ecde97');
                    bulb.setAttribute('stroke', '#ecbf70');
                } else if (color === 'red') {
                    bulb.setAttribute('fill', '#df7e7e');
                    bulb.setAttribute('stroke', '#a65555');
                } else if (color === 'green') {
                    bulb.setAttribute('fill', '#b8f1cc');
                    bulb.setAttribute('stroke', '#7caa8d');
                } else if (color === 'blue') {
                    bulb.setAttribute('fill', '#a2a2f8');
                    bulb.setAttribute('stroke', '#50508e');
                } else if (color === 'purple') {
                    bulb.setAttribute('fill', '#e2bbe8');
                    bulb.setAttribute('stroke', '#765b81');
                } else {
                    bulb.setAttribute('fill', color);
                    bulb.setAttribute('stroke', color);
                }
            }

            if (rays) {
                rays.style.display = 'block';
            }

            svg.classList.add('on');
            svg.classList.remove('off');
            svg.style.filter = 'drop-shadow(0 0 15px currentColor)';
        } else {
            if (bulb) {
                bulb.setAttribute('fill', '#666666');
                bulb.setAttribute('stroke', '#333333');
            }

            if (rays) {
                rays.style.display = 'none';
            }

            svg.classList.add('off');
            svg.classList.remove('on');
            svg.style.filter = 'none';
        }

        lightbulb.isOn = isOn;
    }

    createLightbulbSVG(state = 'off', size = 'normal', color = 'yellow') {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 25 25');

        if (size === 'normal') {
            svg.setAttribute('width', '120');
            svg.setAttribute('height', '130');
        } else if (size === 'small') {
            svg.setAttribute('width', '80');
            svg.setAttribute('height', '80');
        } else if (size === 'medium') {
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
        }

        svg.setAttribute('class', `lightbulb-svg ${state}`);
        svg.style.transition = 'all 0.3s ease';

        const pathData = 'm5.868 15.583a8.938 8.938 0 0 1 -2.793-7.761 9 9 0 1 1 14.857 7.941 5.741 5.741 0 0 0 -1.594 2.237h-3.338v-7.184a3 3 0 0 0 2-2.816 1 1 0 0 0 -2 0 1 1 0 0 1 -2 0 1 1 0 0 0 -2 0 3 3 0 0 0 2 2.816v7.184h-3.437a6.839 6.839 0 0 0 -1.695-2.417zm2.132 4.417v.31a3.694 3.694 0 0 0 3.69 3.69h.62a3.694 3.694 0 0 0 3.69-3.69v-.31z';

        if (state === 'on') {
            const raysGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            raysGroup.setAttribute('class', 'rays');

            for (let i = 0; i < 8; i++) {
                const angle = (i * 45) * Math.PI / 180;
                const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                const x1 = 12 + Math.cos(angle) * 10;
                const y1 = 12 + Math.sin(angle) * 10;
                const x2 = 12 + Math.cos(angle) * (10 + 2.5);
                const y2 = 12 + Math.sin(angle) * (10 + 2.5);

                ray.setAttribute('x1', x1);
                ray.setAttribute('y1', y1);
                ray.setAttribute('x2', x2);
                ray.setAttribute('y2', y2);
                ray.setAttribute('stroke', color);
                ray.setAttribute('stroke-width', '0.4');
                ray.setAttribute('stroke-linecap', 'round');
                ray.setAttribute('opacity', '0.6');
                raysGroup.appendChild(ray);
            }

            svg.appendChild(raysGroup);

            const bulb = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bulb.setAttribute('d', pathData);
            bulb.setAttribute('fill', color);
            bulb.setAttribute('stroke', color);
            bulb.setAttribute('stroke-width', '0.2');
            svg.appendChild(bulb);
        } else {
            const bulb = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bulb.setAttribute('d', pathData);
            bulb.setAttribute('fill', '#666666');
            bulb.setAttribute('stroke', '#333333');
            bulb.setAttribute('stroke-width', '0.2');
            svg.appendChild(bulb);
        }

        return svg;
    }

    showMessage(text, color = 'black') {
        if (this.core.uiManager && typeof this.core.uiManager.showMessage === 'function') {
            this.core.uiManager.showMessage(text, color);
        } else {
        }
    }

    showResult(message, delta, color) {
        if (this.core.uiManager && typeof this.core.uiManager.showResult === 'function') {
            this.core.uiManager.showResult({
                message: message,
                delta: delta,
                color: color
            });
        } else {
            alert(`${message}\nОтклонение: ${delta}`);
        }
    }
}

// ========== УРОВЕНЬ 1: ИЗМЕРЕНИЕ ВРЕМЕНИ ==========
class Level1Handler extends BaseLevelHandler {
    constructor(core, sublevel) {
        super(core, sublevel);
        this.actualDuration = 0; // Фактическое время горения
        this.inputElement = null; // Элемент ввода времени
        this.timeCards = []; // Карточки с временем
        this.pattern = []; // Паттерн для повторения
        this.interactiveIndex = 0; // Индекс интерактивной лампочки
        this.demonstrationIndex = 0; // Индекс демонстрационной лампочки
        this.isRecording = false; // Флаг записи
        this.recordedPattern = []; // Записанный паттерн
        this.correctTotal = 0; // Правильное общее время (для 1-3)
        this.selectionMade = false; // Флаг выбора карточки (для блокировки интерфейса)
    }

    createLightbulbs() {
        const count = this.sublevel.params.lightbulbs || 1;
        const container = document.getElementById('gameArea') || document.body;

        container.innerHTML = '';

        const bulbsContainer = document.createElement('div');
        bulbsContainer.className = 'lightbulbs-container bulbs-container';

        this.lightbulbs = [];

        for (let i = 0; i < count; i++) {
            const bulbContainer = document.createElement('div');
            bulbContainer.className = 'lightbulb-container bulb-container';
            bulbContainer.dataset.index = i;

            const svg = this.createLightbulbSVG('off', count > 1 ? 'small' : 'normal');

            const label = document.createElement('div');
            label.className = 'bulb-label';

            bulbContainer.appendChild(svg);
            bulbContainer.appendChild(label);

            bulbContainer.addEventListener('click', () => this.handleLightbulbClick(i));

            bulbsContainer.appendChild(bulbContainer);

            this.lightbulbs.push({
                container: bulbContainer,
                svg: svg,
                index: i,
                isOn: false
            });
        }

        container.appendChild(bulbsContainer);
    }

    beginSequence() {
        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', null, true);
        }

        const type = this.sublevel.type;
        switch(type) {
            case 'input_time': // Подуровень 1-1
                this.startInputTime();
                break;
            case 'select_time': // Подуровень 1-2
                this.startSelectTime();
                break;
            case 'two_intervals': // Подуровень 1-3
                this.startTwoIntervals();
                break;
            default:
                console.error(`Неизвестный тип: ${type}`);
        }
    }

    // ========== ПОДУРОВЕНЬ 1-1: ВВОД ВРЕМЕНИ ==========
    startInputTime() {
        const params = this.sublevel.params;

        this.actualDuration = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
        this.actualDuration = Math.round(this.actualDuration * 10) / 10;

        this.showMessage('Смотрите на лампочку...', 'blue');

        this.setLightbulbState(0, true, 'yellow');

        const timer = setTimeout(() => {
            this.setLightbulbState(0, false);
            this.createInputField();

            const inputTimeLimit = params.inputTimeLimit || 10;
            this.createTimeLimitDisplay(inputTimeLimit, () => this.handleInputTimeUp());
        }, this.actualDuration * 1000);

        this.addTimer(timer);
    }

    createInputField() {
        const container = document.getElementById('gameArea') || document.body;

        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        inputContainer.style.marginTop = '30px';
        inputContainer.style.textAlign = 'center';
        inputContainer.style.padding = '20px';
        inputContainer.style.background = 'rgba(255, 255, 255, 0.9)';
        inputContainer.style.borderRadius = '15px';

        const label = document.createElement('div');
        label.textContent = 'Сколько секунд горела лампочка?';
        label.style.fontSize = '18px';
        label.style.marginBottom = '15px';
        label.style.fontWeight = 'bold';

        const inputWrapper = document.createElement('div');
        inputWrapper.style.display = 'flex';
        inputWrapper.style.justifyContent = 'center';
        inputWrapper.style.alignItems = 'center';
        inputWrapper.style.gap = '10px';

        this.inputElement = document.createElement('input');
        this.inputElement.type = 'number';
        this.inputElement.step = '0.1';
        this.inputElement.min = '0';
        this.inputElement.max = '10';
        this.inputElement.style.padding = '10px 15px';
        this.inputElement.style.fontSize = '16px';
        this.inputElement.style.width = '120px';
        this.inputElement.style.border = '2px solid #ddd';
        this.inputElement.style.borderRadius = '8px';
        this.inputElement.style.textAlign = 'center';

        const unit = document.createElement('span');
        unit.textContent = 'сек';
        unit.style.fontSize = '16px';

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Проверить';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.fontSize = '16px';
        submitBtn.style.background = '#90bc92';
        submitBtn.style.color = 'white';
        submitBtn.style.border = 'none';
        submitBtn.style.borderRadius = '8px';
        submitBtn.style.cursor = 'pointer';
        submitBtn.addEventListener('click', () => this.checkInputTime());

        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkInputTime();
            }
        });

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(unit);
        inputWrapper.appendChild(submitBtn);

        inputContainer.appendChild(label);
        inputContainer.appendChild(inputWrapper);

        container.appendChild(inputContainer);
        this.inputElement.focus();
    }

    handleInputTimeUp() {
        if (this.inputElement && this.inputElement.value) {
            this.checkInputTime();
        } else {
            const delta = this.actualDuration;
            const accuracy = 0;
            const calculatedScore = DataManager.calculateScore(
                'level1',
                '1-1',
                accuracy,
                0 // timeBonus
            );

            const message = 'Время вышло!';
            const color = 'red';

            this.showResult(message, 'Не введено', color);

            if (this.core.handleAttemptResult) {
                this.core.handleAttemptResult({
                    delta: delta,
                    score: calculatedScore.finalScore,
                    accuracy: accuracy
                });
            }

            setTimeout(() => {
                if (this.core.getState && this.core.getState().attempts > 0) {
                    this.resetForNextAttempt();
                }
            }, 3000);
        }
    }

    checkInputTime() {
        this.stopTimeLimit();

        if (!this.inputElement) return;

        const userInput = parseFloat(this.inputElement.value);
        if (isNaN(userInput)) {
            this.showMessage('Введите число!', 'red');
            return;
        }

        const delta = Math.abs(userInput - this.actualDuration);

        const accuracy = Math.max(0, 100 - (delta / this.actualDuration) * 100);

        const timeBonus = this.timeLimit > 0 ? 1.0 + (this.timeLimit * 0.02) : 1.0;

        const calculatedScore = DataManager.calculateScore(
            'level1',
            '1-1',
            accuracy,
            timeBonus
        );

        const maxScore = DataManager.getMaxScoreForSublevel('level1', '1-1');
        const percentage = maxScore > 0 ? Math.round((calculatedScore.finalScore / maxScore) * 100) : 0;

        let message = '';
        let color = 'red';

        if (percentage >= 80) {
            color = 'green';
            message = `Идеально! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 60) {
            color = 'yellow';
            message = `Хорошо! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 40) {
            color = 'orange';
            message = `Неплохо! ${accuracy.toFixed(1)}% точности!`;
        } else {
            color = 'red';
            message = `Попробуйте еще! ${accuracy.toFixed(1)}% точности!`;
        }

        this.showResult(message, `Отклонение: ${delta.toFixed(1)} сек`, color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: delta,
                score: calculatedScore.finalScore,
                accuracy: accuracy,
                timeBonus: timeBonus
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    // ========== ПОДУРОВЕНЬ 1-2: ЛЕТАЮЩИЕ КАРТОЧКИ ==========
    startSelectTime() {
        const params = this.sublevel.params;

        this.actualDuration = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
        this.actualDuration = Math.round(this.actualDuration * 10) / 10;


        this.showMessage('Смотрите на лампочку...', 'blue');

        this.setLightbulbState(0, true, 'yellow');

        const timer = setTimeout(() => {
            this.setLightbulbState(0, false);
            this.createTimeCards();

            const timeLimit = this.sublevel.timeLimit || 15;
            this.createTimeLimitDisplay(timeLimit, () => this.handleSelectTimeUp());
        }, this.actualDuration * 1000);

        this.addTimer(timer);
    }

    createTimeCards() {
        const params = this.sublevel.params;
        const container = document.getElementById('gameArea') || document.body;

        const existingCards = container.querySelector('.time-cards-container');
        const existingDropZone = container.querySelector('.time-drop-zone');
        if (existingCards) existingCards.remove();
        if (existingDropZone) existingDropZone.remove();

        const dropTarget = document.createElement('div');
        dropTarget.className = 'drop-target';
        dropTarget.id = 'drop-target';
        dropTarget.style.position = 'absolute';
        dropTarget.style.bottom = '120px';
        dropTarget.style.left = '50%';
        dropTarget.style.transform = 'translateX(-50%)';
        dropTarget.style.width = '250px';
        dropTarget.style.height = '90px';
        dropTarget.style.border = '3px dashed #5c885d';
        dropTarget.style.borderRadius = '12px';
        dropTarget.style.background = 'rgba(92, 136, 93, 0.15)';
        dropTarget.style.display = 'flex';
        dropTarget.style.alignItems = 'center';
        dropTarget.style.justifyContent = 'center';
        dropTarget.style.fontSize = '16px';
        dropTarget.style.fontWeight = 'bold';
        dropTarget.style.color = '#5c885d';
        dropTarget.style.textAlign = 'center';
        dropTarget.style.pointerEvents = 'auto';
        dropTarget.style.transition = 'all 0.3s ease';
        dropTarget.style.zIndex = '2000';
        dropTarget.style.boxShadow = '0 4px 15px rgba(92, 136, 93, 0.3)';
        dropTarget.textContent = 'Перетащите сюда правильное время';

        dropTarget.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropTarget.classList.add('drag-over');
            dropTarget.style.borderColor = '#4a7c4a';
            dropTarget.style.background = 'rgba(74, 124, 74, 0.3)';
            dropTarget.style.transform = 'translateX(-50%) scale(1.05)';
        });

        dropTarget.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = dropTarget.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                dropTarget.classList.remove('drag-over');
                dropTarget.style.borderColor = '#5c885d';
                dropTarget.style.background = 'rgba(92, 136, 93, 0.15)';
                dropTarget.style.transform = 'translateX(-50%) scale(1)';
            }
        });

        dropTarget.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropTarget.classList.remove('drag-over');
            dropTarget.style.borderColor = '#5c885d';
            dropTarget.style.background = 'rgba(92, 136, 93, 0.15)';
            dropTarget.style.transform = 'translateX(-50%) scale(1)';

            if (this.selectionMade) {
                return;
            }

            const draggedTime = e.dataTransfer.getData('text/plain');

            this.selectionMade = true;
            this.lockInterface();

            this.checkSelectedTime(parseFloat(draggedTime));
        });

        container.appendChild(dropTarget);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'time-cards-container';
        cardsContainer.style.position = 'absolute';
        cardsContainer.style.width = '100%';
        cardsContainer.style.height = '100%';
        cardsContainer.style.top = '0';
        cardsContainer.style.left = '0';
        cardsContainer.style.marginTop = '0';
        cardsContainer.style.overflow = 'visible';
        cardsContainer.style.pointerEvents = 'auto';
        cardsContainer.style.zIndex = '1000';

        if (container.style.position !== 'relative' &&
            container.style.position !== 'absolute' &&
            container.style.position !== 'fixed') {
            container.style.position = 'relative';
        }

        const options = [this.actualDuration];
        while (options.length < params.cardsCount) {
            const randomTime = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
            const roundedTime = Math.round(randomTime * 10) / 10;

            if (!options.some(t => Math.abs(t - roundedTime) < 0.2)) {
                options.push(roundedTime);
            }
        }

        options.sort(() => Math.random() - 0.5);

        this.timeCards = [];

        options.forEach((time, index) => {
            const card = document.createElement('div');
            card.className = 'time-card';
            card.textContent = time.toFixed(1) + ' сек';
            card.dataset.time = time;
            card.style.position = 'absolute';
            card.style.padding = '20px 30px';
            card.style.background = 'linear-gradient(135deg, #364548 0%, #708F96 100%)';
            card.style.color = 'white';
            card.style.borderRadius = '12px';
            card.style.cursor = 'grab';
            card.style.fontSize = '18px';
            card.style.fontWeight = 'bold';
            card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            card.style.transition = 'all 0.3s ease';
            card.style.userSelect = 'none';
            card.style.zIndex = '1001';
            card.draggable = true;

            const excludedZones = [];

            const lightbulbContainer = document.querySelector('.lightbulb-container');
            if (lightbulbContainer) {
                const rect = lightbulbContainer.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const bulbX = ((rect.left + rect.width/2 - containerRect.left) / containerRect.width) * 100;
                const bulbY = ((rect.top + rect.height/2 - containerRect.top) / containerRect.height) * 100;
                const bulbRadius = Math.max(rect.width, rect.height) / containerRect.width * 100 * 0.8;

                excludedZones.push({
                    type: 'circle',
                    x: bulbX,
                    y: bulbY,
                    radius: Math.max(bulbRadius, 20)
                });
            }

            const dropTarget = document.getElementById('drop-target');
            if (dropTarget) {
                const rect = dropTarget.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const dropX = ((rect.left + rect.width/2 - containerRect.left) / containerRect.width) * 100;
                const dropY = ((rect.top + rect.height/2 - containerRect.top) / containerRect.height) * 100;
                const dropWidth = (rect.width / containerRect.width) * 100 * 1.5;
                const dropHeight = (rect.height / containerRect.height) * 100 * 1.5;

                excludedZones.push({
                    type: 'rectangle',
                    x: dropX - dropWidth/2,
                    y: dropY - dropHeight/2,
                    width: dropWidth,
                    height: dropHeight
                });
            }

            const cardWidth = 15;
            const cardHeight = 10;

            const collidesWithZone = (x, y, zone) => {
                if (zone.type === 'circle') {
                    const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
                    return distance < (zone.radius + Math.max(cardWidth, cardHeight) / 2);
                } else if (zone.type === 'rectangle') {
                    return !(x + cardWidth/2 < zone.x ||
                        x - cardWidth/2 > zone.x + zone.width ||
                        y + cardHeight/2 < zone.y ||
                        y - cardHeight/2 > zone.y + zone.height);
                }
                return false;
            };

            const collidesWithCards = (x, y, existingCards) => {
                for (const existingCard of existingCards) {
                    const distance = Math.sqrt(
                        Math.pow(x - existingCard.x, 2) +
                        Math.pow(y - existingCard.y, 2)
                    );
                    if (distance < Math.max(cardWidth, cardHeight)) {
                        return true;
                    }
                }
                return false;
            };

            let position = null;
            const placedCards = [];
            let attempts = 0;
            const maxAttempts = 200;

            while (!position && attempts < maxAttempts) {
                const x = 10 + Math.random() * 80;
                const y = 10 + Math.random() * 55;

                let hasCollision = false;

                for (const zone of excludedZones) {
                    if (collidesWithZone(x, y, zone)) {
                        hasCollision = true;
                        break;
                    }
                }

                if (!hasCollision && collidesWithCards(x, y, placedCards)) {
                    hasCollision = true;
                }

                if (!hasCollision) {
                    position = { x, y };
                    placedCards.push({ x, y });
                }

                attempts++;
            }

            if (!position) {
                const fallbackPositions = [
                    { x: 20, y: 20 }, { x: 70, y: 20 }, { x: 45, y: 40 },
                    { x: 15, y: 50 }, { x: 75, y: 50 }, { x: 45, y: 15 }
                ];
                position = fallbackPositions[index % fallbackPositions.length];
                if (placedCards.some(p => Math.sqrt(Math.pow(p.x - position.x, 2) + Math.pow(p.y - position.y, 2)) < cardWidth)) {
                    position.x += (Math.random() - 0.5) * 10;
                    position.y += (Math.random() - 0.5) * 10;
                }
                placedCards.push(position);
            }

            const safeX = Math.max(5, Math.min(position.x, 95));
            const safeY = Math.max(5, Math.min(position.y, 75));

            card.style.left = safeX + '%';
            card.style.top = safeY + '%';

            const floatDuration = 3 + Math.random() * 4;
            card.style.animation = `float ${floatDuration}s ease-in-out infinite`;

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', time.toString());
                card.style.opacity = '0.5';
                card.style.transform = 'scale(1.05)';
                card.style.cursor = 'grabbing';
            });

            card.addEventListener('dragend', (e) => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.cursor = 'grab';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.1)';
                card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
                card.style.zIndex = '1002';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
                card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                card.style.zIndex = '1001';
            });

            cardsContainer.appendChild(card);
            this.timeCards.push(card);
        });

        container.appendChild(cardsContainer);

        this.addFloatAnimation();
    }

    handleSelectTimeUp() {
        this.stopTimeLimit();

        const accuracy = 0;
        const calculatedScore = DataManager.calculateScore(
            'level1',
            '1-2',
            accuracy,
            0
        );

        this.showResult('Время вышло!', 'Не выбрана карточка', 'red');

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: this.actualDuration,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    addFloatAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(5px, 10px) rotate(1deg); }
                50% { transform: translate(-5px, 5px) rotate(-1deg); }
                75% { transform: translate(3px, -5px) rotate(2deg); }
            }
        `;
        document.head.appendChild(style);
    }


    checkSelectedTime(selectedTime) {
        this.stopTimeLimit();

        const delta = Math.abs(selectedTime - this.actualDuration);
        const accuracy = Math.max(0, 100 - (delta / this.actualDuration) * 100);
        const timeBonus = this.timeLimit > 0 ? 1.0 + (this.timeLimit * 0.02) : 1.0;
        const calculatedScore = DataManager.calculateScore(
            'level1',
            '1-2',
            accuracy,
            timeBonus
        );

        const maxScore = DataManager.getMaxScoreForSublevel('level1', '1-2');
        const percentage = maxScore > 0 ? Math.round((calculatedScore.finalScore / maxScore) * 100) : 0;

        let message = '';
        let color = 'red';

        if (percentage >= 80) {
            color = 'green';
            message = `Отлично! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 60) {
            color = 'yellow';
            message = `Хорошо! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 40) {
            color = 'orange';
            message = `Неплохо! ${accuracy.toFixed(1)}% точности!`;
        } else {
            color = 'red';
            message = `Попробуйте еще! ${accuracy.toFixed(1)}% точности!`;
        }

        this.showResult(message, `Отклонение: ${delta.toFixed(1)} сек`, color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: delta,
                score: calculatedScore.finalScore,
                accuracy: accuracy,
                timeBonus: timeBonus
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    lockInterface() {
        this.timeCards.forEach(card => {
            card.draggable = false;
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.6';
            card.classList.add('disabled');
        });

        const dropTarget = document.getElementById('drop-target');
        if (dropTarget) {
            dropTarget.style.pointerEvents = 'none';
            dropTarget.style.opacity = '0.7';
            dropTarget.classList.add('disabled');
        }

    }


    unlockInterface() {
        this.timeCards.forEach(card => {
            card.draggable = true;
            card.style.cursor = 'grab';
            card.style.opacity = '1';
            card.classList.remove('disabled');
        });

        const dropTarget = document.getElementById('drop-target');
        if (dropTarget) {
            dropTarget.style.pointerEvents = 'auto';
            dropTarget.style.opacity = '1';
            dropTarget.classList.remove('disabled');
        }

        this.selectionMade = false;
    }

    // ========== ПОДУРОВЕНЬ 1-3: ДВА ИНТЕРВАЛА ==========
    startTwoIntervals() {
        const params = this.sublevel.params;

        const firstInterval = 0.5 + Math.random() * 1.5;
        const secondInterval = 1.0 + Math.random() * 2.0;
        const intervals = [firstInterval, secondInterval];

        this.correctTotal = intervals[0] + intervals[1];

        this.showMessage('Запомните два интервала горения...', 'blue');

        let currentTime = 0;

        const firstOnTimer = setTimeout(() => {
            this.setLightbulbState(0, true, 'yellow');
        }, currentTime);

        const firstOffTimer = setTimeout(() => {
            this.setLightbulbState(0, false);
        }, currentTime + intervals[0] * 1000);

        currentTime += intervals[0] * 1000 + 1000;

        const secondOnTimer = setTimeout(() => {
            this.setLightbulbState(0, true, 'yellow');
        }, currentTime);

        const secondOffTimer = setTimeout(() => {
            this.setLightbulbState(0, false);
            this.createTotalTimeInput();
        }, currentTime + intervals[1] * 1000);

        this.addTimer(firstOnTimer);
        this.addTimer(firstOffTimer);
        this.addTimer(secondOnTimer);
        this.addTimer(secondOffTimer);
    }

    createTotalTimeInput() {
        const container = document.getElementById('gameArea') || document.body;

        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        inputContainer.style.marginTop = '30px';
        inputContainer.style.textAlign = 'center';
        inputContainer.style.padding = '20px';
        inputContainer.style.background = 'rgba(255, 255, 255, 0.9)';
        inputContainer.style.borderRadius = '15px';

        const label = document.createElement('div');
        label.textContent = 'Какое общее время горения обоих интервалов?';
        label.style.fontSize = '18px';
        label.style.marginBottom = '15px';
        label.style.fontWeight = 'bold';

        const inputWrapper = document.createElement('div');
        inputWrapper.style.display = 'flex';
        inputWrapper.style.justifyContent = 'center';
        inputWrapper.style.alignItems = 'center';
        inputWrapper.style.gap = '10px';

        this.inputElement = document.createElement('input');
        this.inputElement.type = 'number';
        this.inputElement.step = '0.1';
        this.inputElement.min = '0';
        this.inputElement.max = '20';
        this.inputElement.style.padding = '10px 15px';
        this.inputElement.style.fontSize = '16px';
        this.inputElement.style.width = '120px';
        this.inputElement.style.border = '2px solid #ddd';
        this.inputElement.style.borderRadius = '8px';
        this.inputElement.style.textAlign = 'center';

        const unit = document.createElement('span');
        unit.textContent = 'сек';
        unit.style.fontSize = '16px';

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Проверить';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.fontSize = '16px';
        submitBtn.style.background = '#79ae7b';
        submitBtn.style.color = 'white';
        submitBtn.style.border = 'none';
        submitBtn.style.borderRadius = '8px';
        submitBtn.style.cursor = 'pointer';
        submitBtn.addEventListener('click', () => this.checkTotalTime());

        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkTotalTime();
            }
        });

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(unit);
        inputWrapper.appendChild(submitBtn);

        inputContainer.appendChild(label);
        inputContainer.appendChild(inputWrapper);

        container.appendChild(inputContainer);
        this.inputElement.focus();
    }

    checkTotalTime() {
        if (!this.inputElement) return;

        const userInput = parseFloat(this.inputElement.value);
        if (isNaN(userInput)) {
            this.showMessage('Введите число!', 'red');
            return;
        }

        const delta = Math.abs(userInput - this.correctTotal);

        const accuracy = Math.max(0, 100 - (delta / this.correctTotal) * 100);

        const calculatedScore = DataManager.calculateScore(
            'level1',
            '1-3',
            accuracy,
            1.0 // timeBonus
        );

        const maxScore = DataManager.getMaxScoreForSublevel('level1', '1-3');
        const percentage = maxScore > 0 ? Math.round((calculatedScore.finalScore / maxScore) * 100) : 0;

        let message = '';
        let color = 'red';

        if (percentage >= 80) {
            color = 'green';
            message = `Идеально! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 60) {
            color = 'yellow';
            message = `Хорошо! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 40) {
            color = 'orange';
            message = `Неплохо! ${accuracy.toFixed(1)}% точности!`;
        } else {
            color = 'red';
            message = `Попробуйте еще! ${accuracy.toFixed(1)}% точности!`;
        }

        this.showResult(message, `Отклонение: ${delta.toFixed(1)} сек`, color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: delta,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    handleLightbulbClick(index) {
        // Обработчик кликов по лампочкам
    }

    resetForNextAttempt() {
        this.stopTimeLimit();

        const container = document.getElementById('gameArea') || document.body;
        const existingElements = container.querySelectorAll('.input-container, .time-cards-container, .lightbulbs-container, .time-limit-display, .drop-target');
        existingElements.forEach(el => el.remove());

        this.selectionMade = false;
        this.unlockInterface();

        this.createLightbulbs();

        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', () => this.beginSequence());
            this.core.uiManager.showHint(this.sublevel.description);
        }
    }
}

// ========== УРОВЕНЬ 2: РАБОЧАЯ ПАМЯТЬ ==========
class Level2Handler extends BaseLevelHandler {
    constructor(core, sublevel) {
        super(core, sublevel);
        this.targetPattern = []; // Целевой паттерн
        this.targetIndex = 0; // Индекс целевой лампочки
        this.isBlurred = false; // Флаг размытия (для подуровня 2-1)
        this.cardContainer = null; // Контейнер карточек
        this.isRecording = false; // Флаг записи
        this.recordingHandlers = null; // Обработчики записи
        this.lightDurations = []; // Длительности горения лампочек
        this.selectionTimer = null; // Таймер для выбора лампочки
        this.selectionTimeLimit = 7; // Лимит времени на выбор (7 секунд)
        this.selectionTimerDisplay = null; // Отображение таймера
    }

    createLightbulbs() {
        const count = this.sublevel.params.lightbulbs || 3;
        const container = document.getElementById('gameArea') || document.body;

        container.innerHTML = '';

        const bulbsContainer = document.createElement('div');
        bulbsContainer.className = 'lightbulbs-container level2-container';
        bulbsContainer.style.display = 'flex';
        bulbsContainer.style.justifyContent = 'center';
        bulbsContainer.style.alignItems = 'center';
        bulbsContainer.style.gap = '60px';
        bulbsContainer.style.margin = '40px auto';
        bulbsContainer.style.flexWrap = 'wrap';
        bulbsContainer.style.position = 'relative';
        bulbsContainer.style.width = '100%';
        bulbsContainer.style.maxWidth = '1500px';
        bulbsContainer.style.minHeight = '550px';
        bulbsContainer.style.padding = '30px';
        bulbsContainer.style.background = 'rgba(255, 255, 255, 0.05)';
        bulbsContainer.style.borderRadius = '20px';
        bulbsContainer.style.boxSizing = 'border-box';

        this.lightbulbs = [];

        for (let i = 0; i < count; i++) {
            const bulbContainer = document.createElement('div');
            bulbContainer.className = 'lightbulb-container level2-bulb';
            bulbContainer.dataset.index = i;
            bulbContainer.style.cursor = 'pointer';
            bulbContainer.style.transition = 'all 0.5s ease';
            bulbContainer.style.display = 'flex';
            bulbContainer.style.flexDirection = 'column';
            bulbContainer.style.alignItems = 'center';
            bulbContainer.style.justifyContent = 'center';
            bulbContainer.style.padding = '25px';
            bulbContainer.style.borderRadius = '15px';
            bulbContainer.style.position = 'relative';
            bulbContainer.style.margin = '10px';

            const svg = this.createLightbulbSVG('off', 'medium');

            bulbContainer.appendChild(svg);

            bulbContainer.addEventListener('click', () => this.handleLightbulbClick(i));

            bulbsContainer.appendChild(bulbContainer);

            this.lightbulbs.push({
                container: bulbContainer,
                svg: svg,
                index: i,
                isOn: false,
                originalPosition: null,
                isShuffled: false
            });
        }

        container.appendChild(bulbsContainer);

        setTimeout(() => this.saveInitialPositions(), 50);
    }

    saveInitialPositions() {
        const container = this.lightbulbs[0]?.container?.parentElement;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();

        this.lightbulbs.forEach(lightbulb => {
            if (!lightbulb.container) return;

            const rect = lightbulb.container.getBoundingClientRect();
            lightbulb.originalPosition = {
                x: rect.left - containerRect.left + container.scrollLeft,
                y: rect.top - containerRect.top + container.scrollTop,
                width: rect.width,
                height: rect.height
            };
            lightbulb.isShuffled = false;
        });
    }

    beginSequence() {
        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', null, true);
        }

        const type = this.sublevel.type;
        switch(type) {
            case 'pattern_blur': // Подуровень 2-1
                this.startPatternBlur();
                break;
            case 'find_duration': // Подуровень 2-2
                this.startFindDuration();
                break;
            case 'repeat_pattern': // Подуровень 2-3
                this.startRepeatPattern();
                break;
            default:
                console.error(`Неизвестный тип: ${type}`);
        }
    }

    // ========== ПОДУРОВЕНЬ 2-1: ДВИЖУЩИЕСЯ ЛАМПОЧКИ ==========
    startPatternBlur() {
        const params = this.sublevel.params;
        this.targetIndex = params.targetIndex || 0;
        this.targetPattern = params.pattern || [1.0, 0.5, 1.5];

        this.showMessage('Следите за мигающей лампочкой', 'blue');

        let currentTime = 0;
        this.targetPattern.forEach((duration, index) => {
            const onTimer = setTimeout(() => {
                this.setLightbulbState(this.targetIndex, true, 'yellow');
            }, currentTime);

            const offTimer = setTimeout(() => {
                this.setLightbulbState(this.targetIndex, false);
            }, currentTime + duration * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += duration * 1000 + 300;
        });

        const blurTimer = setTimeout(() => {
            this.applyBlur();
        }, currentTime + 500);

        this.addTimer(blurTimer);
    }

    applyBlur() {
        this.isBlurred = true;
        this.showMessage('Найдите лампочку с паттерном! У вас 5 секунд.', 'blue');

        this.lightbulbs.forEach(lightbulb => {
            lightbulb.container.style.filter = 'blur(3px)';
            lightbulb.container.style.opacity = '0.7';
        });

        this.startMovement();

        this.startSelectionTimer();

        const params = this.sublevel.params;
        if (params.distractionBlink) {
            this.lightbulbs.forEach((lightbulb, index) => {
                if (index !== this.targetIndex) {
                    const blinkInterval = setInterval(() => {
                        if (Math.random() < 0.3) {
                            this.setLightbulbState(index, true, 'yellow');
                            setTimeout(() => this.setLightbulbState(index, false), 200);
                        }
                    }, 500);
                    this.addTimer(blinkInterval);
                }
            });
        }
    }

    startMovement() {
        const container = this.lightbulbs[0].container.parentElement;
        const containerRect = container.getBoundingClientRect();

        this.lightbulbs.forEach(lightbulb => {
            const rect = lightbulb.container.getBoundingClientRect();
            lightbulb.originalPosition = {
                x: rect.left - containerRect.left,
                y: rect.top - containerRect.top
            };

            this.moveBulbToNewPosition(lightbulb);

            this.moveBulb(lightbulb);
        });
    }

    moveBulbToNewPosition(lightbulb) {
        const container = lightbulb.container.parentElement;
        const containerRect = container.getBoundingClientRect();

        const maxX = containerRect.width - 150;
        const maxY = containerRect.height - 150;

        if (maxX > 0 && maxY > 0) {
            const newX = Math.random() * maxX;
            const newY = Math.random() * maxY;

            lightbulb.container.style.position = 'absolute';
            lightbulb.container.style.left = newX + 'px';
            lightbulb.container.style.top = newY + 'px';
            lightbulb.container.style.zIndex = '10';
        }
    }

    moveBulb(lightbulb) {
        const container = lightbulb.container.parentElement;
        const containerRect = container.getBoundingClientRect();

        const moveInterval = setInterval(() => {
            if (!this.isBlurred) {
                clearInterval(moveInterval);
                return;
            }

            this.moveBulbToNewPosition(lightbulb);
        }, 2000);

        this.addTimer(moveInterval);
    }

    // ========== ПОДУРОВЕНЬ 2-2: НАЙДИ ВРЕМЯ ==========
    startFindDuration() {
        const params = this.sublevel.params;
        const count = params.lightbulbs || 3;

        this.lightDurations = [];
        for (let i = 0; i < count; i++) {
            const duration = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
            this.lightDurations.push(Math.round(duration * 10) / 10);
        }

        this.isDemonstrating = true;

        this.showMessage('Запоминайте время горения каждой лампочки...', 'blue');

        let currentTime = 0;
        this.lightbulbs.forEach((lightbulb, index) => {

            if (params.shades && params.shades[index]) {
                const shade = params.shades[index];
                let brightness = 1.0;
                if (shade === 'light') brightness = 1.3;
                if (shade === 'dark') brightness = 0.7;
                lightbulb.container.style.filter = `brightness(${brightness})`;
            }

            const onTimer = setTimeout(() => {
                this.setLightbulbState(index, true, 'yellow');
            }, currentTime);

            const offTimer = setTimeout(() => {
                this.setLightbulbState(index, false);
            }, currentTime + this.lightDurations[index] * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += this.lightDurations[index] * 1000 + 500;
        });

        const shuffleTimer = setTimeout(() => {
            this.isDemonstrating = false;

            this.shuffleLightbulbs();
            this.showTargetCard();
        }, currentTime + 1000);

        this.addTimer(shuffleTimer);
    }

    shuffleLightbulbs() {

        const container = this.lightbulbs[0].container.parentElement;
        const containerRect = container.getBoundingClientRect();

        container.style.position = 'relative';
        container.style.overflow = 'visible';
        container.style.minHeight = '350px';
        container.style.height = 'auto';

        if (!this.lightbulbs[0].originalPosition) {
            this.saveInitialPositions();
        }

        const safeArea = {
            width: containerRect.width - 180,
            height: containerRect.height - 180
        };

        const occupiedPositions = [];

        this.lightbulbs.forEach(lightbulb => {
            const bulbWidth = 120;
            const bulbHeight = 140;

            let attempts = 0;
            let newX, newY;
            let positionFound = false;

            while (attempts < 50 && !positionFound) {
                newX = Math.random() * Math.max(50, safeArea.width - bulbWidth);
                newY = Math.random() * Math.max(50, safeArea.height - bulbHeight);

                let overlaps = false;
                for (const pos of occupiedPositions) {
                    const distance = Math.sqrt(
                        Math.pow(newX - pos.x, 2) + Math.pow(newY - pos.y, 2)
                    );
                    if (distance < 150) {
                        overlaps = true;
                        break;
                    }
                }

                if (!overlaps) {
                    positionFound = true;
                    occupiedPositions.push({ x: newX, y: newY });
                }
                attempts++;
            }

            if (!positionFound) {
                newX = Math.random() * Math.max(50, safeArea.width - bulbWidth);
                newY = Math.random() * Math.max(50, safeArea.height - bulbHeight);
            }

            newX += 40;
            newY += 40;

            lightbulb.container.style.position = 'absolute';
            lightbulb.container.style.left = `${newX}px`;
            lightbulb.container.style.top = `${newY}px`;
            lightbulb.container.style.zIndex = '10';
            lightbulb.container.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            lightbulb.container.style.transform = 'none';

            setTimeout(() => {
                lightbulb.container.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }, 100);

            lightbulb.isShuffled = true;
        });

        const instruction = document.createElement('div');
        instruction.className = 'shuffle-instruction';
        instruction.textContent = 'Лампочки перемешаны! Теперь найдите нужную.';
        instruction.style.position = 'absolute';
        instruction.style.bottom = '-40px';
        instruction.style.left = '50%';
        instruction.style.transform = 'translateX(-50%)';
        instruction.style.color = '#4a6fa5';
        instruction.style.fontSize = '16px';
        instruction.style.fontWeight = 'bold';
        instruction.style.textAlign = 'center';
        instruction.style.width = '100%';

        container.appendChild(instruction);
        setTimeout(() => instruction.remove(), 3000);
    }

    resetBulbPositions() {
        const container = this.lightbulbs[0]?.container?.parentElement;
        if (!container) return;

        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.gap = '60px';
        container.style.flexWrap = 'wrap';

        this.lightbulbs.forEach(lightbulb => {
            if (lightbulb.container) {
                lightbulb.container.style.position = 'relative';
                lightbulb.container.style.left = 'auto';
                lightbulb.container.style.top = 'auto';
                lightbulb.container.style.margin = '10px';
                lightbulb.container.style.transform = 'none';
                lightbulb.container.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                lightbulb.container.style.zIndex = 'auto';
                lightbulb.container.style.transition = 'all 0.5s ease';
            }
            lightbulb.isShuffled = false;
        });
    }

    // Запускает таймер для выбора лампочки
    startSelectionTimer() {
        this.stopSelectionTimer();

        this.createSelectionTimerDisplay();

        let timeLeft = this.selectionTimeLimit;

        if (this.selectionTimerDisplay) {
            this.selectionTimerDisplay.textContent = `Время на выбор: ${timeLeft} сек`;
        }

        this.selectionTimer = setInterval(() => {
            timeLeft -= 0.1;

            if (this.selectionTimerDisplay) {
                this.selectionTimerDisplay.textContent = `Время на выбор: ${timeLeft.toFixed(1)} сек`;

                if (timeLeft < 3) {
                    this.selectionTimerDisplay.classList.add('warning');
                }
                if (timeLeft < 1) {
                    this.selectionTimerDisplay.classList.add('critical');
                }
            }

            if (timeLeft <= 0) {
                this.handleSelectionTimeUp();
            }
        }, 100);

        this.addTimer(this.selectionTimer);
    }

    createSelectionTimerDisplay() {
        if (this.selectionTimerDisplay && this.selectionTimerDisplay.parentNode) {
            this.selectionTimerDisplay.parentNode.removeChild(this.selectionTimerDisplay);
        }

        this.selectionTimerDisplay = document.createElement('div');
        this.selectionTimerDisplay.className = 'selection-timer-display';
        this.selectionTimerDisplay.style.position = 'fixed';
        this.selectionTimerDisplay.style.top = '70px';
        this.selectionTimerDisplay.style.left = '50%';
        this.selectionTimerDisplay.style.transform = 'translateX(-50%)';
        this.selectionTimerDisplay.style.zIndex = '1000';
        this.selectionTimerDisplay.style.padding = '10px 20px';
        this.selectionTimerDisplay.style.background = 'rgba(116,163,195,0.9)';
        this.selectionTimerDisplay.style.color = 'white';
        this.selectionTimerDisplay.style.borderRadius = '8px';
        this.selectionTimerDisplay.style.fontSize = '16px';
        this.selectionTimerDisplay.style.fontWeight = 'bold';
        this.selectionTimerDisplay.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        this.selectionTimerDisplay.style.transition = 'all 0.3s ease';

        const container = document.getElementById('gameArea') || document.body;
        container.appendChild(this.selectionTimerDisplay);
    }

    handleSelectionTimeUp() {
        this.stopSelectionTimer();

        this.isBlurred = false;

        const accuracy = 0;
        let sublevelId = '';

        switch(this.sublevel.type) {
            case 'pattern_blur':
                sublevelId = '2-1';
                break;
            case 'find_duration':
                sublevelId = '2-2';
                break;
        }

        const calculatedScore = DataManager.calculateScore(
            'level2',
            sublevelId,
            accuracy,
            0
        );

        const message = 'Время вышло! Вы не успели выбрать лампочку.';
        const color = '#b65048';

        this.lightbulbs.forEach(lightbulb => {
            lightbulb.container.style.filter = 'none';
            lightbulb.container.style.opacity = '1';
            lightbulb.container.style.transform = 'scale(1)';
        });

        this.setLightbulbState(this.targetIndex, true, '#b65048');

        this.showResult(message, 'Время истекло!', color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: 1,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    stopSelectionTimer() {
        if (this.selectionTimer) {
            clearInterval(this.selectionTimer);
            this.selectionTimer = null;
        }

        if (this.selectionTimerDisplay && this.selectionTimerDisplay.parentNode) {
            this.selectionTimerDisplay.parentNode.removeChild(this.selectionTimerDisplay);
            this.selectionTimerDisplay = null;
        }
    }

    showTargetCard() {
        this.targetIndex = Math.floor(Math.random() * this.lightbulbs.length);
        const targetDuration = this.lightDurations[this.targetIndex];

        const container = document.getElementById('gameArea') || document.body;

        const card = document.createElement('div');
        card.className = 'target-card';
        card.textContent = `Найдите лампочку, которая горела ${targetDuration.toFixed(1)} секунд`;
        card.style.position = 'absolute';
        card.style.top = '50px';
        card.style.left = '50%';
        card.style.transform = 'translateX(-50%)';
        card.style.zIndex = '1000';
        card.style.padding = '15px 30px';
        card.style.background = 'rgba(119, 154, 182, 0.95)';
        card.style.color = 'white';
        card.style.borderRadius = '12px';
        card.style.fontSize = '18px';
        card.style.fontWeight = 'bold';
        card.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        card.style.textAlign = 'center';
        card.style.minWidth = '300px';
        card.style.maxWidth = '80%';
        card.style.backdropFilter = 'blur(5px)';
        card.style.border = '2px solid rgba(255, 255, 255, 0.2)';

        container.appendChild(card);
        this.cardContainer = card;

        this.startSelectionTimer();
    }

    // ========== ПОДУРОВЕНЬ 2-3: ПОВТОРИ ПАТТЕРН ==========
    startRepeatPattern() {
        const params = this.sublevel.params;

        this.pattern = [];
        for (let i = 0; i < params.patternLength; i++) {
            const duration = Math.random() * (params.segmentMax - params.segmentMin) + params.segmentMin;
            this.pattern.push(Math.round(duration * 10) / 10);
        }

        this.interactiveIndex = params.interactiveIndex || 1;
        this.demonstrationIndex = params.demonstrationIndex || 0;


        this.showDemonstrationPattern();
    }

    showDemonstrationPattern() {
        this.showMessage('Запоминайте паттерн...', 'blue');

        let currentTime = 0;
        this.pattern.forEach((duration, index) => {
            const onTimer = setTimeout(() => {
                this.setLightbulbState(this.demonstrationIndex, true, 'yellow');
            }, currentTime);

            const offTimer = setTimeout(() => {
                this.setLightbulbState(this.demonstrationIndex, false);
            }, currentTime + duration * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += duration * 1000 + 300;
        });

        const switchTimer = setTimeout(() => {
            this.showMessage('Теперь повторите паттерн на второй лампочке!', 'blue');
            this.setupRecording();
        }, currentTime + 1000);

        this.addTimer(switchTimer);
    }

    setupRecording() {
        const bulbsContainer = document.querySelector('.lightbulbs-container');

        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.marginBottom = '10px';

        this.recordButton = document.createElement('button');
        this.recordButton.textContent = 'Начать запись паттерна';
        this.recordButton.style.userSelect = 'none';
        this.recordButton.style.padding = '15px 30px';
        this.recordButton.style.fontSize = '18px';
        this.recordButton.style.background = '#9bd59d';
        this.recordButton.style.color = 'white';
        this.recordButton.style.border = 'none';
        this.recordButton.style.borderRadius = '10px';
        this.recordButton.style.cursor = 'pointer';
        this.recordButton.style.transition = 'all 0.3s ease';

        this.recordButton.addEventListener('click', () => {
            if (!this.isRecording) {
                this.startRecording();
                this.recordButton.textContent = 'Запись... (двойной клик на лампочку 2)';
                this.recordButton.style.background = '#d19e9a';
            } else {
                this.stopRecording();
                this.checkPattern();
            }
        });

        buttonContainer.appendChild(this.recordButton);
        bulbsContainer.appendChild(buttonContainer);

        const hint = document.createElement('div');
        hint.textContent = 'Двойной клик на лампочке 2, чтобы записать сегменты паттерна';
        hint.style.userSelect = 'none';
        hint.style.textAlign = 'center';
        hint.style.marginTop = '15px';
        hint.style.color = '#666';
        hint.style.fontSize = '14px';

        buttonContainer.appendChild(hint);
    }

    startRecording() {
        this.isRecording = true;
        this.recordedPattern = [];
        this.recordingStartTime = Date.now();

        const interactiveBulb = this.lightbulbs[this.interactiveIndex];
        if (interactiveBulb) {
            const handleDoubleClick = () => {
                if (this.isRecording) {
                    const isCurrentlyOn = interactiveBulb.container.querySelector('svg').classList.contains('on');

                    if (!isCurrentlyOn) {
                        this.setLightbulbState(this.interactiveIndex, true, 'green');
                        this.segmentStartTime = Date.now();
                    } else {
                        if (this.segmentStartTime) {
                            const duration = (Date.now() - this.segmentStartTime) / 1000;
                            this.recordedPattern.push(Math.round(duration * 10) / 10);
                            this.setLightbulbState(this.interactiveIndex, false);

                            this.showMessage(`Сегмент ${this.recordedPattern.length}: ${duration.toFixed(1)} сек`, 'green');
                            this.segmentStartTime = null;
                        }
                    }
                }
            };

            interactiveBulb.container.addEventListener('dblclick', handleDoubleClick);

            this.recordingHandlers = { handleDoubleClick };
        }
    }

    stopRecording() {
        this.isRecording = false;

        if (this.recordingHandlers) {
            const interactiveBulb = this.lightbulbs[this.interactiveIndex];
            if (interactiveBulb) {
                if (this.recordingHandlers.handleDoubleClick) {
                    interactiveBulb.container.removeEventListener('dblclick', this.recordingHandlers.handleDoubleClick);
                }
            }
        }

        this.setLightbulbState(this.interactiveIndex, false);
        this.segmentStartTime = null;
    }

    checkPattern() {

        let correctSegments = 0;
        const minLength = Math.min(this.pattern.length, this.recordedPattern.length);

        for (let i = 0; i < minLength; i++) {
            if (Math.abs(this.pattern[i] - this.recordedPattern[i]) <= 0.3) {
                correctSegments++;
            }
        }

        const accuracy = (correctSegments / this.pattern.length) * 100;

        const calculatedScore = DataManager.calculateScore(
            'level2',
            '2-3',
            accuracy,
            1.0 // timeBonus
        );

        const maxScore = DataManager.getMaxScoreForSublevel('level2', '2-3');
        const percentage = maxScore > 0 ? Math.round((calculatedScore.finalScore / maxScore) * 100) : 0;

        let message = '';
        let color = 'red';

        if (percentage >= 80) {
            color = 'green';
            message = `Отлично! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 60) {
            color = 'yellow';
            message = `Хорошо! ${accuracy.toFixed(1)}% точности!`;
        } else if (percentage >= 40) {
            color = 'orange';
            message = `Неплохо! ${accuracy.toFixed(1)}% точности!`;
        } else {
            color = 'red';
            message = `Попробуйте еще! ${accuracy.toFixed(1)}% точности!`;
        }

        this.showResult(message, `${correctSegments}/${this.pattern.length} сегментов`, color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: this.pattern.length - correctSegments,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }


    // ОБЩИЕ МЕТОДЫ ДЛЯ LEVEL 2
    handleLightbulbClick(index) {
        const type = this.sublevel.type;

        if (type === 'pattern_blur') {
            if (!this.isBlurred) {
                this.showMessage('Сначала дождитесь завершения демонстрации паттерна!', 'blue');
                return;
            }

            this.isBlurred = false;

            if (index === this.targetIndex) {
                this.stopSelectionTimer();
                this.showSuccess();
            } else {
                this.setLightbulbState(index, true, '#bf635d');
                setTimeout(() => {
                    this.setLightbulbState(index, false);
                    this.showMessage('Неверно! Попробуйте еще раз.', '#bf635d');
                }, 500);
            }
        } else if (type === 'find_duration') {
            if (this.isDemonstrating) {
                this.showMessage('Подождите окончания демонстрации!', 'blue');
                return;
            }

            this.stopSelectionTimer();

            if (index !== this.targetIndex) {
                this.setLightbulbState(index, true, '#bf635d');
            }

            setTimeout(() => {
                this.setLightbulbState(this.targetIndex, true, '#648364');

                if (this.cardContainer) {
                    this.cardContainer.remove();
                }

                if (index === this.targetIndex) {
                    this.showMessage('Отлично!', 'green');
                } else {
                    this.showMessage('Неправильно. Правильная лампочка выделена зеленым.', '#bf635d');
                }

                setTimeout(() => {
                    this.showResultForFindDuration(index === this.targetIndex);
                }, 2000);
            }, 500);
        }
    }

    showResultForFindDuration(isCorrect) {
        const accuracy = isCorrect ? 100 : 0;
        const sublevelId = '2-2';

        const timeBonus = this.timeLimit > 0 ? 1.0 + (this.timeLimit * 0.02) : 1.0;
        const calculatedScore = DataManager.calculateScore(
            'level2',
            sublevelId,
            accuracy,
            timeBonus
        );

        const maxScore = DataManager.getMaxScoreForSublevel('level2', sublevelId);
        const percentage = maxScore > 0 ? Math.round((calculatedScore.finalScore / maxScore) * 100) : 0;

        let message = '';
        let color = 'var(--text-dark)';

        if (isCorrect) {
            message = 'Отлично!';
            color = 'green';
        } else {
            message = 'Неправильно. Попробуйте еще раз!';
            color = '#bf635d';
        }

        this.lightbulbs.forEach((lightbulb) => {
            lightbulb.container.style.filter = 'none';
            lightbulb.container.style.opacity = '1';
        });

        this.isBlurred = false;

        this.showResult(message, '', color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: isCorrect ? 0 : 1,
                score: calculatedScore.finalScore,
                accuracy: accuracy,
                timeBonus: timeBonus
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    showSuccess() {
        this.stopSelectionTimer();

        const accuracy = 100;
        let sublevelId = '';

        switch(this.sublevel.type) {
            case 'pattern_blur':
                sublevelId = '2-1';
                break;
            case 'find_duration':
                sublevelId = '2-2';
                this.stopTimeLimit();
                if (this.cardContainer) {
                    this.cardContainer.remove();
                }
                break;
            case 'repeat_pattern':
                sublevelId = '2-3';
                break;
        }

        const timeBonus = this.timeLimit > 0 ? 1.0 + (this.timeLimit * 0.02) : 1.0;
        const calculatedScore = DataManager.calculateScore(
            'level2',
            sublevelId,
            accuracy,
            timeBonus
        );

        const maxScore = DataManager.getMaxScoreForSublevel('level2', sublevelId);
        const percentage = maxScore > 0 ? Math.round((calculatedScore.finalScore / maxScore) * 100) : 0;

        let message = '';
        let color = '#648364';

        message = 'Отлично!';

        this.lightbulbs.forEach((lightbulb, index) => {
            lightbulb.container.style.filter = 'none';
            lightbulb.container.style.opacity = '1';

            if (index === this.targetIndex) {
                this.setLightbulbState(index, true, '#648364');
            } else {
                this.setLightbulbState(index, false);
            }
        });

        this.isBlurred = false;

        this.showResult(message, '', color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: 0,
                score: calculatedScore.finalScore,
                accuracy: accuracy,
                timeBonus: timeBonus
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    timeUp() {
        const accuracy = 0;
        const calculatedScore = DataManager.calculateScore(
            'level2',
            '2-2',
            accuracy,
            0
        );

        this.showResult('Время вышло!', 'Не найдено', '#b65048');

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: 1,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    resetForNextAttempt() {
        const container = document.getElementById('gameArea') || document.body;
        const existingElements = container.querySelectorAll(
            '.target-card, .lightbulbs-container, .recording-controls, ' +
            '.input-container, .time-limit-display, .shuffle-instruction' +
            '.selection-timer-display'
        );
        existingElements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        this.isBlurred = false;
        this.isDemonstrating = false;
        this.targetIndex = 0;
        this.targetPattern = [];
        this.lightDurations = [];
        this.recordedPatterns = [[], []];
        this.isRecording = false;
        this.currentRecordingIndex = null;

        this.clearTimers();
        this.stopTimeLimit();
        this.stopSelectionTimer();

        this.resetBulbPositions();

        this.createLightbulbs();

        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', () => this.beginSequence());
            this.core.uiManager.showHint(this.sublevel.description);
        }
    }
}

// ========== УРОВЕНЬ 3: ЛОГИКА И ПРОГНОЗИРОВАНИЕ ==========
class Level3Handler extends BaseLevelHandler {
    constructor(core, sublevel) {
        super(core, sublevel);
        this.sequence = []; // Последовательность для Simon Says
        this.userSequence = []; // Последовательность игрока
        this.equation = null; // Уравнение для математики времени
        this.correctAnswer = 0; // Правильный ответ
        this.currentStep = 0; // Текущий шаг
        this.isPlayingSequence = false; // Флаг воспроизведения последовательности
        this.isInputEnabled = false; // Флаг разрешения ввода
        this.lightDurations = []; // Время горения каждой лампочки (для 3-2)
        this.userAnswer = null; // Ответ пользователя
        this.timeLimit = null; // Таймер ограничения времени
        this.timeLeft = 0; // Оставшееся время
        this.timeLimitInterval = null; // Интервал таймера
    }

    createLightbulbs() {
        const params = this.sublevel.params;
        const count = params.lightbulbs || 4;
        const container = document.getElementById('gameArea') || document.body;

        container.innerHTML = '';

        const bulbsContainer = document.createElement('div');
        bulbsContainer.className = 'lightbulbs-container';
        bulbsContainer.style.display = 'flex';
        bulbsContainer.style.justifyContent = 'center';
        bulbsContainer.style.gap = '20px';
        bulbsContainer.style.margin = '20px 0';
        bulbsContainer.style.flexWrap = 'wrap';

        this.lightbulbs = [];

        for (let i = 0; i < count; i++) {
            const bulbContainer = document.createElement('div');
            bulbContainer.className = 'lightbulb-container bulb-container';
            bulbContainer.dataset.index = i;
            bulbContainer.style.position = 'relative';
            bulbContainer.style.padding = '10px';

            const colors = params.colors || ['#e8aaaa', '#87ae87', '#5e5e91', '#fafac3'];
            const color = colors[i % colors.length];

            const svg = this.createLightbulbSVG('off', 'small', color);

            bulbContainer.appendChild(svg);

            if (this.sublevel.type === 'simon_pattern') {
                bulbContainer.addEventListener('click', () => this.handleLightbulbClick(i));
            }

            bulbsContainer.appendChild(bulbContainer);

            this.lightbulbs.push({
                container: bulbContainer,
                svg: svg,
                index: i,
                isOn: false,
                color: color
            });
        }

        container.appendChild(bulbsContainer);
    }

    beginSequence() {
        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', null, true);
        }

        const type = this.sublevel.type;
        switch(type) {
            case 'simon_pattern': // Подуровень 3-1
                this.startSimonPattern();
                break;
            case 'time_math': // Подуровень 3-2
                this.startTimeMath();
                break;
            default:
                console.error(`Неизвестный или удаленный тип подуровня: ${type}`);
        }
    }

    // ========== ПОДУРОВЕНЬ 3-1: СИМОН ГОВОРИТ ==========
    startSimonPattern() {
        const params = this.sublevel.params;
        this.sequence = [];
        this.userSequence = [];
        this.currentStep = 0;
        this.isPlayingSequence = false;
        this.isInputEnabled = false;

        const sequenceLength = params.sequenceLength || 4;
        for (let i = 0; i < sequenceLength; i++) {
            const bulbIndex = Math.floor(Math.random() * params.lightbulbs);
            const duration = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
            this.sequence.push({
                index: bulbIndex,
                duration: Math.round(duration * 10) / 10
            });
        }

        this.showMessage('Смотрите внимательно! Запоминайте последовательность...', '#4a6fa5');
        this.playSequence();
    }

    playSequence() {
        this.isPlayingSequence = true;
        this.isInputEnabled = false;

        let currentTime = 0;

        this.sequence.forEach((step, index) => {
            const onTimer = setTimeout(() => {
                const color = this.lightbulbs[step.index].color;
                this.setLightbulbState(step.index, true, color);
            }, currentTime);

            const offTimer = setTimeout(() => {
                this.setLightbulbState(step.index, false);
            }, currentTime + step.duration * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += step.duration * 1000 + 500;
        });

        const finishTimer = setTimeout(() => {
            this.isPlayingSequence = false;
            this.isInputEnabled = true;
            this.showMessage('Теперь повторите последовательность! Кликайте на лампочки в том же порядке.', '#4a6fa5');
            this.currentStep = 0;
            this.userSequence = [];
        }, currentTime);

        this.addTimer(finishTimer);
    }

    // ========== ПОДУРОВЕНЬ 3-2: МАТЕМАТИКА ВРЕМЕНИ ==========
    startTimeMath() {
        const params = this.sublevel.params;
        this.userAnswer = null;

        const container = document.getElementById('gameArea') || document.body;
        const existingElements = container.querySelectorAll('.equation-container, .input-container');
        existingElements.forEach(el => el.remove());

        this.lightDurations = [];
        for (let i = 0; i < params.lightbulbs; i++) {
            const duration = Math.random() * 4 + 1;
            this.lightDurations.push(Math.round(duration * 10) / 10);
        }

        this.showMessage('Внимательно смотрите! Каждая лампочка покажет время своего горения...', '#4a6fa5');

        let currentTime = 0;

        this.lightbulbs.forEach((lightbulb, index) => {
            const delay = index * 100;

            const onTimer = setTimeout(() => {
                this.setLightbulbState(index, true, lightbulb.color);

                this.showDurationOverlay(index, this.lightDurations[index]);
            }, currentTime + delay);

            const offTimer = setTimeout(() => {
                this.setLightbulbState(index, false);
                this.hideDurationOverlay(index);
            }, currentTime + delay + this.lightDurations[index] * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += this.lightDurations[index] * 1000 + 800;
        });

        const equationTimer = setTimeout(() => {
            this.generateEquation();
            this.showEquation();
        }, currentTime + 1000);

        this.addTimer(equationTimer);
    }

    showDurationOverlay(index, duration) {
        const bulbContainer = this.lightbulbs[index].container;

        const existingOverlay = bulbContainer.querySelector('.duration-overlay');
        if (existingOverlay) existingOverlay.remove();

        const overlay = document.createElement('div');
        overlay.className = 'duration-overlay';
        overlay.textContent = `${duration.toFixed(1)}с`;
        overlay.style.position = 'absolute';
        overlay.style.top = '-40px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        overlay.style.color = 'white';
        overlay.style.padding = '5px 10px';
        overlay.style.borderRadius = '10px';
        overlay.style.fontSize = '14px';
        overlay.style.fontWeight = 'bold';
        overlay.style.zIndex = '10';
        overlay.style.minWidth = '60px';
        overlay.style.textAlign = 'center';
        overlay.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';

        bulbContainer.appendChild(overlay);
    }

    hideDurationOverlay(index) {
        const bulbContainer = this.lightbulbs[index].container;
        const overlay = bulbContainer.querySelector('.duration-overlay');
        if (overlay) overlay.remove();
    }

    generateEquation() {
        const params = this.sublevel.params;

        const equationTypes = params.equationTypes || ['addition', 'subtraction', 'multiplication'];
        const equationType = equationTypes[Math.floor(Math.random() * equationTypes.length)];

        let a, b;

        switch(equationType) {
            case 'addition':
                a = Math.floor(Math.random() * this.lightDurations.length);
                b = Math.floor(Math.random() * this.lightDurations.length);
                while (b === a) b = Math.floor(Math.random() * this.lightDurations.length);

                this.equation = {
                    type: 'addition',
                    text: `Время лампочки ${a + 1} + Время лампочки ${b + 1} = ?`,
                    answer: this.lightDurations[a] + this.lightDurations[b],
                    values: [this.lightDurations[a], this.lightDurations[b]]
                };
                break;

            case 'subtraction':
                a = Math.floor(Math.random() * this.lightDurations.length);
                b = Math.floor(Math.random() * this.lightDurations.length);
                while (b === a) b = Math.floor(Math.random() * this.lightDurations.length);

                const timeA = this.lightDurations[a];
                const timeB = this.lightDurations[b];

                if (timeA >= timeB) {
                    this.equation = {
                        type: 'subtraction',
                        text: `Время лампочки ${a + 1} - Время лампочки ${b + 1} = ?`,
                        answer: timeA - timeB,
                        values: [timeA, timeB]
                    };
                } else {
                    this.equation = {
                        type: 'subtraction',
                        text: `Время лампочки ${b + 1} - Время лампочки ${a + 1} = ?`,
                        answer: timeB - timeA,
                        values: [timeB, timeA]
                    };
                }
                break;

            case 'multiplication':
                a = Math.floor(Math.random() * this.lightDurations.length);
                const multiplier = Math.floor(Math.random() * 3) + 2;

                this.equation = {
                    type: 'multiplication',
                    text: `Время лампочки ${a + 1} × ${multiplier} = ?`,
                    answer: this.lightDurations[a] * multiplier,
                    values: [this.lightDurations[a], multiplier]
                };
                break;

            case 'average':
                const indices = [];
                while (indices.length < 2) {
                    const idx = Math.floor(Math.random() * this.lightDurations.length);
                    if (!indices.includes(idx)) indices.push(idx);
                }

                const avg = (this.lightDurations[indices[0]] + this.lightDurations[indices[1]]) / 2;
                this.equation = {
                    type: 'average',
                    text: `Среднее время горения лампочек ${indices[0] + 1} и ${indices[1] + 1} = ?`,
                    answer: avg,
                    values: [this.lightDurations[indices[0]], this.lightDurations[indices[1]]]
                };
                break;
        }

        this.equation.answer = Math.round(this.equation.answer * 10) / 10;
        this.correctAnswer = this.equation.answer;

    }

    showEquation() {
        const container = document.getElementById('gameArea') || document.body;

        const equationContainer = document.createElement('div');
        equationContainer.className = 'equation-container';
        equationContainer.style.textAlign = 'center';
        equationContainer.style.padding = '15px';
        equationContainer.style.background = 'var(--primary-color)';
        equationContainer.style.borderRadius = '15px';
        equationContainer.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        equationContainer.style.maxWidth = '500px';
        equationContainer.style.margin = '10px auto';

        const equationText = document.createElement('div');
        equationText.innerHTML = `
            <h3 style="color: #648364; margin-bottom: 10px; font-size: 18px;">Математическая задача:</h3>
            <div style="font-size: 22px; font-weight: bold; color: #333; margin: 10px 0;">
                ${this.equation.text}
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
                Используйте значения времени, которые вы видели на лампочках
            </div>
        `;

        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        inputContainer.style.marginTop = '10px';

        const inputWrapper = document.createElement('div');
        inputWrapper.style.display = 'flex';
        inputWrapper.style.justifyContent = 'center';
        inputWrapper.style.alignItems = 'center';
        inputWrapper.style.gap = '10px';
        inputWrapper.style.flexWrap = 'wrap';

        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.1';
        input.min = '0';
        input.placeholder = 'Введите ответ';
        input.style.padding = '10px 15px';
        input.style.fontSize = '16px';
        input.style.borderRadius = '8px';
        input.style.width = '180px';
        input.style.textAlign = 'center';
        input.style.outline = 'none';

        input.addEventListener('focus', () => {
            input.style.borderColor = '#708F96';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#648364';
            input.style.boxShadow = 'none';
        });

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Проверить';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.fontSize = '16px';
        submitBtn.style.background = '#708F96';
        submitBtn.style.color = 'white';
        submitBtn.style.border = 'none';
        submitBtn.style.borderRadius = '8px';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.transition = 'transform 0.2s, box-shadow 0.2s';
        submitBtn.style.fontWeight = 'bold';

        submitBtn.addEventListener('mouseover', () => {
            submitBtn.style.transform = 'translateY(-2px)';
        });

        submitBtn.addEventListener('mouseout', () => {
            submitBtn.style.transform = 'translateY(0)';
            submitBtn.style.boxShadow = 'none';
        });

        submitBtn.addEventListener('click', () => {
            this.checkAnswer(input.value);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer(input.value);
            }
        });

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(submitBtn);
        inputContainer.appendChild(inputWrapper);

        equationContainer.appendChild(equationText);
        equationContainer.appendChild(inputContainer);
        container.appendChild(equationContainer);

        setTimeout(() => input.focus(), 100);

        this.startTimeLimit();
    }

    startTimeLimit() {
        const timeLimit = this.sublevel.timeLimit || 30;

        super.createTimeLimitDisplay(timeLimit, () => this.timeUp());
    }

    stopTimeLimit() {
        if (this.timeLimitTimer) {
            clearInterval(this.timeLimitTimer);
            this.timeLimitTimer = null;
        }

        const timerDisplay = document.querySelector('.game-timer');
        if (timerDisplay && timerDisplay.parentNode) {
            timerDisplay.parentNode.removeChild(timerDisplay);
        }
    }

    createTimeLimitDisplay(timeLimit, onTimeUp) {
        const oldDisplay = document.getElementById('timeLimitDisplay');
        if (oldDisplay) oldDisplay.remove();

        const container = document.getElementById('gameArea') || document.body;

        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'timeLimitDisplay';
        timeDisplay.style.position = 'fixed';
        timeDisplay.style.top = '20px';
        timeDisplay.style.right = '20px';
        timeDisplay.style.background = 'rgba(255, 255, 255, 0.95)';
        timeDisplay.style.border = '2px solid #4a6fa5';
        timeDisplay.style.borderRadius = '10px';
        timeDisplay.style.padding = '15px';
        timeDisplay.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        timeDisplay.style.zIndex = '1000';
        timeDisplay.style.minWidth = '200px';

        const timeText = document.createElement('div');
        timeText.className = 'time-text';
        timeText.textContent = `Осталось времени: ${timeLimit} сек`;
        timeText.style.fontSize = '16px';
        timeText.style.fontWeight = 'bold';
        timeText.style.color = '#4a6fa5';
        timeText.style.marginBottom = '10px';
        timeText.style.textAlign = 'center';

        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.width = '100%';
        progressBarContainer.style.height = '10px';
        progressBarContainer.style.background = '#eee';
        progressBarContainer.style.borderRadius = '5px';
        progressBarContainer.style.overflow = 'hidden';

        const progressBarFill = document.createElement('div');
        progressBarFill.className = 'progress-bar-fill';
        progressBarFill.style.width = '100%';
        progressBarFill.style.height = '100%';
        progressBarFill.style.background = 'linear-gradient(90deg, #4caf50, #388e3c)';
        progressBarFill.style.borderRadius = '5px';
        progressBarFill.style.transition = 'width 1s linear';

        progressBarContainer.appendChild(progressBarFill);
        timeDisplay.appendChild(timeText);
        timeDisplay.appendChild(progressBarContainer);

        container.insertBefore(timeDisplay, container.firstChild);

        this.onTimeUp = onTimeUp;
    }

    checkAnswer(userInput) {
        if (!userInput || userInput.trim() === '') {
            this.showMessage('Введите ответ!', '#f44336');
            return;
        }

        const userAnswer = parseFloat(userInput.replace(',', '.'));
        if (isNaN(userAnswer)) {
            this.showMessage('Введите корректное число!', '#f44336');
            return;
        }

        const delta = Math.abs(userAnswer - this.correctAnswer);
        let accuracy = 100;

        if (delta > 0) {
            const maxAllowedError = this.correctAnswer * 0.2;
            accuracy = Math.max(0, 100 - (delta / maxAllowedError) * 100);
        }

        accuracy = Math.min(100, Math.max(0, accuracy));

        const timeBonus = this.timeLeft ? 1.0 + (this.timeLeft / 30) * 0.1 : 1.0;

        const calculatedScore = DataManager.calculateScore(
            'level3',
            '3-2',
            accuracy,
            timeBonus
        );

        let message = '';
        let color = '#333';
        let resultType = '';

        if (delta <= 0.1) {
            message = `Идеально! Ответ: ${this.correctAnswer.toFixed(1)} секунд`;
            color = '#4caf50';
            resultType = 'perfect';
        } else if (delta <= 0.5) {
            message = `Очень хорошо! Правильно: ${this.correctAnswer.toFixed(1)} сек, ваш ответ: ${userAnswer.toFixed(1)} сек`;
            color = '#8bc34a';
            resultType = 'good';
        } else if (delta <= 1.0) {
            message = `Неплохо! Правильно: ${this.correctAnswer.toFixed(1)} сек, ваш ответ: ${userAnswer.toFixed(1)} сек`;
            color = '#ff9800';
            resultType = 'ok';
        } else {
            message = `Есть ошибка. Правильно: ${this.correctAnswer.toFixed(1)} сек, ваш ответ: ${userAnswer.toFixed(1)} сек`;
            color = '#f44336';
            resultType = 'bad';
        }

        message += ` (Точность: ${accuracy.toFixed(1)}%)`;

        this.showResult(message, `Отклонение: ${delta.toFixed(1)} сек`, color);

        this.stopTimeLimit();

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: delta,
                score: calculatedScore.finalScore,
                accuracy: accuracy,
                timeBonus: timeBonus,
                userAnswer: userAnswer,
                correctAnswer: this.correctAnswer
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    // ========== ОБЩИЕ МЕТОДЫ ДЛЯ LEVEL 3 ==========
    handleLightbulbClick(index) {
        if (this.sublevel.type !== 'simon_pattern') {
            return;
        }

        if (!this.isInputEnabled || this.isPlayingSequence) {
            return;
        }

        const color = this.lightbulbs[index].color;
        this.setLightbulbState(index, true, color);

        setTimeout(() => {
            this.setLightbulbState(index, false);
        }, 300);

        this.userSequence.push(index);
        this.currentStep++;

        if (this.userSequence[this.currentStep - 1] !== this.sequence[this.currentStep - 1].index) {
            const accuracy = (this.currentStep - 1) / this.sequence.length * 100;
            const calculatedScore = DataManager.calculateScore(
                'level3',
                '3-1',
                accuracy,
                1.0
            );

            this.showMessage('Неправильно! Попробуйте еще раз.', '#f44336');

            if (this.core.handleAttemptResult) {
                this.core.handleAttemptResult({
                    delta: this.sequence.length - (this.currentStep - 1),
                    score: calculatedScore.finalScore,
                    accuracy: accuracy
                });
            }

            setTimeout(() => {
                this.resetForNextAttempt();
            }, 2000);
            return;
        }

        if (this.currentStep === this.sequence.length) {
            this.showSimonSuccess();
        }
    }

    showSimonSuccess() {
        const accuracy = 100;
        const timeBonus = 1.0;

        const calculatedScore = DataManager.calculateScore(
            'level3',
            '3-1',
            accuracy,
            timeBonus
        );

        this.showResult('Отлично! Последовательность воспроизведена правильно!', 'Идеально!', '#4caf50');

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: 0,
                score: calculatedScore.finalScore,
                accuracy: accuracy,
                timeBonus: timeBonus
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    timeUp() {
        const accuracy = 0;
        const calculatedScore = DataManager.calculateScore(
            'level3',
            '3-2',
            accuracy,
            0
        );

        this.showResult('Время вышло! Не успели ввести ответ.', 'Попробуйте еще раз!', '#f44336');

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: 1,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    resetForNextAttempt() {
        this.stopTimeLimit();

        const container = document.getElementById('gameArea') || document.body;
        const existingElements = container.querySelectorAll('.equation-container, .input-container, .lightbulbs-container, .time-limit-display, .duration-overlay');
        existingElements.forEach(el => el.remove());

        this.sequence = [];
        this.userSequence = [];
        this.equation = null;
        this.correctAnswer = 0;
        this.lightDurations = [];
        this.userAnswer = null;
        this.currentStep = 0;
        this.isPlayingSequence = false;
        this.isInputEnabled = false;
        this.timeLeft = 0;

        this.clearTimers();

        this.createLightbulbs();

        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', () => this.beginSequence());
            this.core.uiManager.showHint(this.sublevel.description);
        }
    }
}

// ========== УРОВЕНЬ 4: СТРАТЕГИЯ И СКОРОСТЬ ==========
class Level4Handler extends BaseLevelHandler {
    constructor(core, sublevel) {
        super(core, sublevel);
        this.maze = []; // Лабиринт
        this.playerPosition = {x: 0, y: 0}; // Позиция игрока
        this.targetPosition = {x: 0, y: 0}; // Целевая позиция
        this.path = []; // Путь к цели
        this.playerSteps = 0; // Шаги игрока
    }

    createLightbulbs() {
        const container = document.getElementById('gameArea') || document.body;
        container.innerHTML = '';
        this.createMaze();
    }

    createMaze() {
        const params = this.sublevel.params;
        const size = params.mazeSize || 5;
        const container = document.getElementById('gameArea') || document.body;

        container.innerHTML = '';

        this.maze = [];
        for (let y = 0; y < size; y++) {
            this.maze[y] = [];
            for (let x = 0; x < size; x++) {
                this.maze[y][x] = {
                    x: x,
                    y: y,
                    isWall: Math.random() < 0.2,
                    isTarget: false
                };
            }
        }

        this.maze[0][0].isWall = false;

        const rightBlocked = this.maze[0][1].isWall;
        const downBlocked = this.maze[1][0].isWall;

        if (rightBlocked && downBlocked) {
            if (Math.random() > 0.5) {
                this.maze[0][1].isWall = false;
            } else {
                this.maze[1][0].isWall = false;
            }
        }

        const startNeighbors = [
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ];

        let passableNeighbors = 0;
        startNeighbors.forEach(neighbor => {
            if (neighbor.x < size && neighbor.y < size && !this.maze[neighbor.y][neighbor.x].isWall) {
                passableNeighbors++;
            }
        });

        if (passableNeighbors === 0) {
            if (1 < size) {
                this.maze[0][1].isWall = false;
            }
        }

        this.playerPosition = {x: 0, y: 0};

        let attempts = 0;
        let targetFound = false;

        while (!targetFound && attempts < 100) {
            this.targetPosition = {
                x: Math.floor(Math.random() * (size - 2)) + 1,
                y: Math.floor(Math.random() * (size - 2)) + 1
            };

            if ((this.targetPosition.x !== 0 || this.targetPosition.y !== 0) &&
                !this.maze[this.targetPosition.y][this.targetPosition.x].isWall) {

                if (this.isPathPossible()) {
                    this.maze[this.targetPosition.y][this.targetPosition.x].isTarget = true;
                    targetFound = true;
                }
            }
            attempts++;
        }

        if (!targetFound) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if ((x !== 0 || y !== 0) && !this.maze[y][x].isWall) {
                        this.targetPosition = {x: x, y: y};
                        this.maze[y][x].isTarget = true;
                        targetFound = true;
                        break;
                    }
                }
                if (targetFound) break;
            }
        }

        const mazeContainer = document.createElement('div');
        mazeContainer.className = 'maze-container';
        mazeContainer.style.display = 'grid';
        mazeContainer.style.gridTemplateColumns = `repeat(${size}, 60px)`;
        mazeContainer.style.gridGap = '5px';
        mazeContainer.style.justifyContent = 'center';
        mazeContainer.style.margin = '30px auto';
        mazeContainer.style.opacity = '0';
        mazeContainer.style.visibility = 'hidden';
        mazeContainer.style.transition = 'opacity 0.5s ease';

        this.mazeCells = [];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.style.width = '60px';
                cell.style.height = '60px';
                cell.style.border = '2px solid #ccc';
                cell.style.borderRadius = '8px';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.fontSize = '24px';
                cell.style.cursor = 'pointer';
                cell.style.opacity = '0';
                cell.style.transition = 'opacity 0.3s ease';

                if (this.maze[y][x].isWall) {
                    cell.style.background = '#333';
                    cell.style.cursor = 'not-allowed';
                } else if (x === this.playerPosition.x && y === this.playerPosition.y) {
                    cell.textContent = '🚶';
                    cell.style.background = '#85c387';
                } else if (x === this.targetPosition.x && y === this.targetPosition.y) {
                    cell.style.background = '#f5f5f5';
                } else {
                    cell.style.background = '#f5f5f5';
                }

                mazeContainer.appendChild(cell);
                this.mazeCells = this.mazeCells || [];
                this.mazeCells.push({x, y, element: cell});
            }
        }

        container.appendChild(mazeContainer);
        this.mazeContainer = mazeContainer;
    }

    isPathPossible() {
        const size = this.maze.length;
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        const queue = [{x: 0, y: 0}];
        visited[0][0] = true;

        const directions = [
            {dx: 1, dy: 0},
            {dx: 0, dy: 1},
            {dx: -1, dy: 0},
            {dx: 0, dy: -1}
        ];

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.x === this.targetPosition.x && current.y === this.targetPosition.y) {
                return true;
            }

            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                if (nx >= 0 && nx < size && ny >= 0 && ny < size &&
                    !this.maze[ny][nx].isWall && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }

        return false;
    }

    showMaze() {
        if (!this.mazeContainer) return;

        this.mazeContainer.style.opacity = '1';
        this.mazeContainer.style.visibility = 'visible';

        if (this.mazeCells) {
            this.mazeCells.forEach((cellData, index) => {
                if (cellData && cellData.element) {
                    setTimeout(() => {
                        if (cellData.element) {
                            cellData.element.style.opacity = '1';
                        }
                    }, index * 20);
                }
            });
        }
    }

    generatePath() {
        const size = this.maze.length;
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        const parent = Array(size).fill().map(() => Array(size).fill(null));
        const queue = [{x: this.playerPosition.x, y: this.playerPosition.y}];
        visited[this.playerPosition.y][this.playerPosition.x] = true;

        const directions = [
            {dx: 1, dy: 0},
            {dx: 0, dy: 1},
            {dx: -1, dy: 0},
            {dx: 0, dy: -1}
        ];

        let found = false;

        while (queue.length > 0 && !found) {
            const current = queue.shift();

            if (current.x === this.targetPosition.x && current.y === this.targetPosition.y) {
                found = true;

                this.path = [];
                let step = current;

                while (step && (step.x !== this.playerPosition.x || step.y !== this.playerPosition.y)) {
                    this.path.unshift({x: step.x, y: step.y});
                    step = parent[step.y][step.x];
                }
                break;
            }

            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                if (nx >= 0 && nx < size && ny >= 0 && ny < size &&
                    !this.maze[ny][nx].isWall && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    parent[ny][nx] = current;
                    queue.push({x: nx, y: ny});
                }
            }
        }

        if (!found) {
            this.path = [];
            console.warn('[Лабиринт] Путь от старта к цели не найден!');
        }
    }

    beginSequence() {
        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', null, true);
        }

        const type = this.sublevel.type;
        switch (type) {
            case 'maze_memory': // Подуровень 4-1
                this.startMazeMemory();
                break;
            default:
                console.error(`Неизвестный или удаленный тип подуровня: ${type}`);
        }
    }

    // ========== ПОДУРОВЕНЬ 4-1: ЛАБИРИНТ ==========
    startMazeMemory() {
        const params = this.sublevel.params;
        const duration = params.lightbulbDuration || 3.0;

        if (!this.playerPosition) {
            this.playerPosition = {x: 0, y: 0};
        }

        this.generatePath();

        console.log(`[Лабиринт] Старт: (${this.playerPosition.x}, ${this.playerPosition.y})`);
        console.log(`[Лабиринт] Цель: (${this.targetPosition.x}, ${this.targetPosition.y})`);
        console.log(`[Лабиринт] Длина оптимального пути: ${this.path.length} шагов`);
        console.log(`[Лабиринт] Путь: ${this.path.map(p => `(${p.x},${p.y})`).join(' → ')}`);

        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
            this.keyPressHandler = null;
        }
        const oldHint = document.getElementById('controls-hint');
        if (oldHint && oldHint.parentNode) {
            oldHint.parentNode.removeChild(oldHint);
        }

        this.showMaze();

        this.showMessage(`Запомните путь к лампочке! У вас ${duration} секунд...`, 'blue');

        const targetCell = document.querySelector(`.maze-cell[data-x="${this.targetPosition.x}"][data-y="${this.targetPosition.y}"]`);
        if (targetCell) {
            targetCell.textContent = '💡';
            targetCell.style.background = '#fdf0a9';
            targetCell.style.color = '#333';
        }

        const timer = setTimeout(() => {
            if (targetCell) {
                targetCell.textContent = '';
                targetCell.style.background = '#f5f5f5';
            }

            this.showMessage('Теперь пройдите по пути к лампочке! Используйте стрелки на клавиатуре.', 'blue');
            this.setupKeyboardControls();
        }, duration * 1000);

        this.addTimer(timer);
    }

    setupKeyboardControls() {
        this.keyPressHandler = (event) => this.handleKeyPress(event);
        document.addEventListener('keydown', this.keyPressHandler);
        this.showControlsHint();
    }

    showControlsHint() {
        const container = document.getElementById('gameArea');
        if (!container) return;

        const hint = document.createElement('div');
        hint.id = 'controls-hint';
        hint.style.position = 'absolute';
        hint.style.bottom = '20px';
        hint.style.right = '20px';
        hint.style.background = 'rgba(74, 106, 165, 0.95)';
        hint.style.color = 'white';
        hint.style.padding = '12px 18px';
        hint.style.borderRadius = '10px';
        hint.style.fontSize = '14px';
        hint.style.zIndex = '1000';
        hint.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        hint.style.border = '2px solid rgba(255,255,255,0.2)';
        hint.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">Управление:</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 18px; margin-right: 8px;">↑</span>
                    <span>Вверх</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 18px; margin-right: 8px;">↓</span>
                    <span>Вниз</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 18px; margin-right: 8px;">←</span>
                    <span>Влево</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 18px; margin-right: 8px;">→</span>
                    <span>Вправо</span>
                </div>
            </div>
        `;

        container.appendChild(hint);

        hint.style.opacity = '0';
        hint.style.transform = 'translateY(10px)';
        hint.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        setTimeout(() => {
            hint.style.opacity = '1';
            hint.style.transform = 'translateY(0)';
        }, 100);
    }

    handleKeyPress(event) {
        if (!this.maze || !this.playerPosition) return;

        let newX = this.playerPosition.x;
        let newY = this.playerPosition.y;

        switch (event.code) {
            case 'ArrowUp':
                newY = this.playerPosition.y - 1;
                event.preventDefault();
                break;
            case 'ArrowDown':
                newY = this.playerPosition.y + 1;
                event.preventDefault();
                break;
            case 'ArrowLeft':
                newX = this.playerPosition.x - 1;
                event.preventDefault();
                break;
            case 'ArrowRight':
                newX = this.playerPosition.x + 1;
                event.preventDefault();
                break;
            default:
                return;
        }

        this.movePlayer(newX, newY);
    }

    movePlayer(x, y) {
        if (x < 0 || x >= this.maze[0].length || y < 0 || y >= this.maze.length) {
            this.showMessage('Выход за пределы лабиринта!', 'red');
            return;
        }

        const isAdjacent = (
            (Math.abs(x - this.playerPosition.x) === 1 && y === this.playerPosition.y) ||
            (Math.abs(y - this.playerPosition.y) === 1 && x === this.playerPosition.x)
        );

        if (!isAdjacent) {
            this.showMessage('Можно ходить только на соседние клетки!', 'red');
            return;
        }

        if (this.maze[y][x].isWall) {
            this.showMessage('Это стена! Выберите другое направление.', 'red');
            return;
        }

        const oldCell = document.querySelector(`.maze-cell[data-x="${this.playerPosition.x}"][data-y="${this.playerPosition.y}"]`);
        if (oldCell) {
            oldCell.textContent = '';
            oldCell.style.background = '#E3F2FD';
        }

        this.playerPosition = {x: x, y: y};
        this.playerSteps++;
        const newCell = document.querySelector(`.maze-cell[data-x="${x}"][data-y="${y}"]`);
        if (newCell) {
            newCell.textContent = '🚶';
            newCell.style.background = '#8cbf8e';
            newCell.style.transform = 'scale(1.1)';
            newCell.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                if (newCell) {
                    newCell.style.transform = 'scale(1)';
                }
            }, 200);
        }

        if (x === this.targetPosition.x && y === this.targetPosition.y) {
            this.showMazeSuccess();
            if (this.keyPressHandler) {
                document.removeEventListener('keydown', this.keyPressHandler);
                this.keyPressHandler = null;
            }
            const hint = document.getElementById('controls-hint');
            if (hint && hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        }
    }

    showMazeSuccess() {
        const optimalLength = this.path.length;
        const playerPathLength = this.playerSteps;

        console.log(`[Лабиринт] Оптимальный путь: ${optimalLength} шагов`);
        console.log(`[Лабиринт] Шагов игрока: ${playerPathLength}`);

        let accuracy = 100;
        if (optimalLength > 0) {
            const difference = Math.abs(optimalLength - playerPathLength);
            console.log(`[Лабиринт] Разница: ${difference} шагов`);
            accuracy = Math.max(0, 100 - (difference * 10));
        }
        console.log(`[Лабиринт] Точность: ${accuracy}%`);

        const calculatedScore = DataManager.calculateScore(
            'level4',
            '4-1',
            accuracy,
            1.0 // timeBonus
        );

        let message = '';
        let color = 'var(--text-dark)';

        if (accuracy === 100) {
            message = 'Идеально! Лампочка найдена оптимальным путем!';
        } else if (accuracy >= 80) {
            message = 'Отлично! Лампочка найдена!';
        } else if (accuracy >= 60) {
            message = 'Хорошо! Лампочка найдена!';
        } else {
            message = 'Лампочка найдена! Можно улучшить путь.';
        }

        this.showResult(message, `Шагов: ${playerPathLength}/${optimalLength}, Точность: ${accuracy.toFixed(0)}%`, color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: Math.abs(optimalLength - playerPathLength),
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    // ОБЩИЕ МЕТОДЫ ДЛЯ LEVEL 4
    resetForNextAttempt() {
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
            this.keyPressHandler = null;
        }

        const hint = document.getElementById('controls-hint');
        if (hint && hint.parentNode) {
            hint.parentNode.removeChild(hint);
        }

        this.clearTimers();
        this.stopTimeLimit();

        const container = document.getElementById('gameArea') || document.body;
        if (container) {
            container.innerHTML = '';
        }

        this.maze = [];
        this.mazeCells = [];
        this.path = [];
        this.playerPosition = {x: 0, y: 0};
        this.targetPosition = {x: 0, y: 0};
        this.playerSteps = 0;

        this.createLightbulbs();

        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', () => this.beginSequence());
            this.core.uiManager.showHint(this.sublevel.description);
        }
    }

    resetMazeVisualState() {

        if (this.mazeCells) {
            this.mazeCells.forEach(cellData => {
                if (cellData && cellData.element) {
                    const cell = cellData.element;
                    cell.textContent = '';
                    cell.style.background = '#f5f5f5';
                    cell.style.transform = 'none';
                    cell.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    cell.classList.remove('drag-over', 'disabled');
                }
            });

            const startCell = this.mazeCells.find(c => c && c.x === 0 && c.y === 0);
            if (startCell && startCell.element) {
                startCell.element.textContent = '🚶';
                startCell.element.style.background = '#85c387';
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.LevelManager = LevelManager;
    window.BaseLevelHandler = BaseLevelHandler;
    window.Level1Handler = Level1Handler;
    window.Level2Handler = Level2Handler;
    window.Level3Handler = Level3Handler;
    window.Level4Handler = Level4Handler;
    LevelManager.currentInstance = null;
}
