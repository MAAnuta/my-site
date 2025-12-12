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

    // СТРУКТУРА ВСЕХ УРОВНЕЙ
    createLevelsStructure() {
        return {
            // ========== УРОВЕНЬ 1: ИЗМЕРЕНИЕ ВРЕМЕНИ ==========
            'level1': {
                id: 'level1',
                name: 'Измерение времени',
                description: 'Базовые навыки восприятия времени',
                color: 'var(--text-dark)',
                unlocked: true, // Первый уровень разблокирован сразу
                sublevels: {
                    '1-1': {
                        id: '1-1',
                        name: 'Одна лампочка',
                        description: 'Определите время горения одной лампочка',
                        type: 'input_time', // Подуровень 1-1
                        difficulty: 'easy',
                        attempts: 3,
                        params: {
                            lightbulbs: 1,
                            minDuration: 1.0,
                            maxDuration: 3.0,
                            inputMethod: 'both',
                            inputTimeLimit: 10 // Добавляем ограничение по времени на ввод
                        }
                    },
                    '1-2': {
                        id: '1-2',
                        name: 'Летающие карточки',
                        description: 'Найдите правильное время среди движущихся карточек',
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
                        description: 'Запомните два последовательных времени горения',
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
                description: 'Поиск паттернов среди отвлекающих факторов',
                color: 'var(--text-dark)',
                unlocked: false, // Будет разблокирован после прохождения уровня 1
                sublevels: {
                    '2-1': {
                        id: '2-1',
                        name: 'Движущиеся лампочки',
                        description: 'Найдите целевую лампочку среди движущихся',
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
                        description: 'Найдите лампочку с нужным временем среди движущихся',
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
                        description: 'Запомните и повторите паттерн мигания',
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
            // ========== УРОВЕНЬ 3: ЛОГИКА И ПРОГНОЗИРОВАНИЕ ==========
            'level3': {
                id: 'level3',
                name: 'Логика и прогнозирование',
                description: 'Развитие логического мышления и предсказания',
                color: 'var(--text-dark)',
                unlocked: false, // Будет разблокирован после прохождения уровня 2
                sublevels: {
                    '3-1': {
                        id: '3-1',
                        name: 'Ритмические последовательности',
                        description: 'Повторите порядок и длительность горения последовательности лампочек',
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
                        description: 'Решите уравнение и найдите лампочку с нужным временем',
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

            // ========== УРОВЕНЬ 4: СТРАТЕГИЯ И СКОРОСТЬ ==========
            'level4': {
                id: 'level4',
                name: 'Стратегия и скорость',
                description: 'Комбинация скорости реакции и стратегического мышления',
                color: 'var(--text-dark)',
                unlocked: false, // Будет разблокирован после прохождения уровня 3
                sublevels: {
                    '4-1': {
                        id: '4-1',
                        name: 'Лабиринт времени',
                        description: 'Запомните путь к лампочке за ограниченное время',
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

    // 2. ЗАПУСК УРОВНЯ (с улучшенной проверкой доступности)
    startLevel(levelId, sublevelId) {
        console.log(`[LevelManager] Запуск ${levelId}, подуровень ${sublevelId}, режим: ${this.core.getGameMode()}`);

        this.stopLevel(); // Останавливаем текущий уровень
        this.clearTimers(); // Очищаем таймеры

        const levelData = this.levels[levelId];
        if (!levelData) {
            // Тихо возвращаем false без уведомлений
            return false;
        }

        // Для тренировки все уровни доступны
        if (this.core.getGameMode() !== 'training') {
            if (!levelData.unlocked) {
                // Тихо возвращаем false без уведомлений
                return false;
            }

            // Проверяем доступность подуровня по новой системе
            if (!this.isSublevelAvailable(levelId, sublevelId)) {
                // Тихо возвращаем false без уведомлений
                return false;
            }
        }

        // Получаем данные подуровня
        let sublevelData;
        const searchKey = sublevelId.toString();

        if (Array.isArray(levelData.sublevels)) {
            // sublevels - массив (для других уровней)
            sublevelData = levelData.sublevels.find(s => s.id.toString() === searchKey);
        } else {
            // sublevels - объект (для level1)
            sublevelData = levelData.sublevels[searchKey];
        }

        if (!sublevelData) {
            // Тихо возвращаем false без уведомлений
            return false;
        }

        this.currentLevelId = levelId;
        this.currentSublevelId = sublevelId;

        try {
            // Выбираем обработчик в зависимости от уровня
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
            console.error('Ошибка при создании уровня:', error);
            this.showError(`Ошибка: ${error.message}`);
            return false;
        }

        return false;
    }

    // 3. СТАНДАРТНЫЕ МЕТОДЫ
    stopLevel() {
        // Останавливаем все таймеры
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

    // 4. МЕТОДЫ ДЛЯ UI
    getLevelInfo(levelId) {
        return this.levels[levelId];
    }

    getSublevelInfo(levelId, sublevelId) {
        const level = this.levels[levelId];
        if (!level || !level.sublevels) return null;

        // sublevelId может приходить как строка или число, приводим к строке
        const sublevelIdStr = sublevelId.toString();

        // Определяем ключ для поиска
        let searchKey = sublevelIdStr;

        // Если sublevelId не содержит дефис, добавляем префикс уровня
        if (!sublevelIdStr.includes('-')) {
            const levelNum = levelId.replace('level', '');
            searchKey = `${levelNum}-${sublevelIdStr}`;
        }

        // В текущей структуре sublevels может быть массивом или объектом
        if (Array.isArray(level.sublevels)) {
            // sublevels - массив, ищем по id
            return level.sublevels.find(s => s.id.toString() === searchKey) || null;
        } else {
            // sublevels - объект с ключами в формате 'level-sublevel'
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

    // 5. ПРОВЕРКА РАЗБЛОКИРОВКИ УРОВНЯ
    isLevelUnlocked(levelId) {
        const level = this.levels[levelId];
        return level ? level.unlocked : false;
    }

    // 6. ПРОВЕРКА ПРОХОЖДЕНИЯ УРОВНЯ
    checkLevelCompletion(levelId) {
        const level = this.levels[levelId];
        if (!level) return false;

        // Проверяем, доступен ли DataManager
        if (typeof DataManager === 'undefined') {
            console.warn('[LevelManager] DataManager не загружен. Не могу проверить прогресс.');
            return false;
        }

        // Используем новую функцию проверки завершения уровня на 80%
        return DataManager.isLevelCompleted(levelId, 0.8);
    }

    // 7. СОХРАНИТЬ ПРОГРЕСС ПРОХОЖДЕНИЯ ПОДУРОВНЯ
    saveSublevelProgress(levelId, sublevelId, score, accuracy, mode = 'classic', roundNumber = null, isCompleted = false) {
        // Проверяем, доступен ли DataManager
        if (typeof DataManager === 'undefined') {
            console.warn('[LevelManager] DataManager не загружен. Прогресс не сохранен.');
            return;
        }

        // Получаем режим игры из GameCore
        const gameMode = mode || (this.core && this.core.getGameMode ? this.core.getGameMode() : 'classic');

        // Определяем номер раунда
        let currentRound = roundNumber;
        if (currentRound === null) {
            // Пока используем фиксированный раунд для обратной совместимости
            currentRound = 1;
        }

        // Всегда используем логику накопления раундов
        this.saveRoundProgress(levelId, sublevelId, score, accuracy, currentRound, gameMode, isCompleted);

        console.log(`[LevelManager] Прогресс сохранен: ${levelId}-${sublevelId}, очки: ${score}, режим: ${gameMode}, раунд: ${currentRound}`);
    };

    /**
     * Сохраняет прогресс раунда и накапливает до полного подуровня
     */
    saveRoundProgress(levelId, sublevelId, score, accuracy, roundNumber, gameMode, isFinal = false) {
        const progressKey = `${levelId}_${sublevelId}_rounds`;

        // Получаем текущие данные раундов
        let roundsData = this.getRoundsData(progressKey);

        // Добавляем/обновляем данные текущего раунда
        roundsData[`round${roundNumber}`] = {
            score: score,
            accuracy: accuracy,
            timestamp: Date.now()
        };

        // Сохраняем данные раундов
        this.saveRoundsData(progressKey, roundsData);

        console.log(`[LevelManager] Раунд ${roundNumber} сохранен: ${score} очков, ${accuracy}% точности`);

        // Если это финальный раунд (3-й) или isFinal=true, рассчитываем итоговый результат
        if (roundNumber === 3 || isFinal) {
            this.finalizeSublevelProgress(levelId, sublevelId, roundsData, gameMode);
        }
    }

    /**
     * Получает данные раундов из sessionStorage
     */
    getRoundsData(key) {
        try {
            const data = sessionStorage.getItem(`levelmanager_${key}`);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Ошибка загрузки данных раундов:', error);
            return {};
        }
    }

    /**
     * Сохраняет данные раундов в sessionStorage
     */
    saveRoundsData(key, data) {
        try {
            sessionStorage.setItem(`levelmanager_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения данных раундов:', error);
        }
    }

    /**
     * Финализирует прогресс подуровня после 3 раундов
     */
    finalizeSublevelProgress(levelId, sublevelId, roundsData, gameMode) {
        // Рассчитываем итоговые показатели
        const rounds = Object.values(roundsData);
        if (rounds.length === 0) return;

        // Сумма очков за все раунды
        const totalSublevelScore = rounds.reduce((sum, round) => sum + round.score, 0);

        // Средняя точность
        const totalAccuracy = rounds.reduce((sum, round) => sum + round.accuracy, 0);
        const averageAccuracy = Math.round(totalAccuracy / rounds.length * 10) / 10; // до 1 знака

        // Штраф за низкую среднюю точность (< 80%)
        let finalScore = totalSublevelScore;
        if (averageAccuracy < 80) {
            finalScore = Math.round(finalScore * 0.9); // -10%
        }

        // Кап по максимуму подуровня
        const maxSublevelScore = DataManager.getMaxScoreForSublevel(levelId, sublevelId);
        finalScore = Math.min(finalScore, maxSublevelScore);

        // Сохраняем финальный прогресс
        DataManager.saveProgress(levelId, sublevelId, finalScore, averageAccuracy, gameMode);

        // Сохраняем количество завершенных раундов
        const progressKey = `${levelId}_${sublevelId}_roundsCompleted`;
        this.saveRoundsData(progressKey, { count: rounds.length });

        // Очищаем временные данные раундов
        const roundsKey = `${levelId}_${sublevelId}_rounds`;
        sessionStorage.removeItem(`levelmanager_${roundsKey}`);

        // Только для классической игры проверяем разблокировку следующего уровня
        if (gameMode === 'classic') {
            this.lastUnlockedInfo = this.checkAndUnlockNextLevel(levelId, sublevelId, finalScore);
            console.log(`[LevelManager] lastUnlockedInfo сохранен:`, this.lastUnlockedInfo);
        }

        // Обновляем рейтинг только для классической игры
        if (gameMode === 'classic') {
            DataManager.updateRatingAfterGame(levelId, sublevelId, finalScore, averageAccuracy);
        }
    }


    // 8. РАЗБЛОКИРОВКА СЛЕДУЮЩИХ УРОВНЕЙ/ПОДУРОВНЕЙ
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

        // Если это НЕ последний подуровень уровня — разблокируем следующий подуровень в уровне
        if (currentSublevelNum < totalSublevels) {
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
        // Если это ПОСЛЕДНИЙ подуровень уровня И score >=80% — разблокируем следующий УРОВЕНЬ
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

        console.log(`[LevelManager] Разблокировка после ${levelId}-${currentSublevelNum}:`, nextInfo);
        return nextInfo;
    }

    // 9. ИНИЦИАЛИЗАЦИЯ РАЗБЛОКИРОВКИ УРОВНЕЙ ПРИ ЗАГРУЗКЕ
    initializeLevelUnlock() {
        // Загружаем сохраненный прогресс уровней
        this.loadProgress();

        // Проверяем, доступен ли DataManager
        if (typeof DataManager === 'undefined') {
            console.warn('[LevelManager] DataManager не загружен. Инициализация без прогресса.');
            // level1 всегда разблокирован
            this.levels['level1'].unlocked = true;
            return;
        }

        // level1 всегда разблокирован
        this.levels['level1'].unlocked = true;

        const levelOrder = ['level1', 'level2', 'level3', 'level4'];

        // Проверяем прогресс и разблокируем следующие уровни ТОЛЬКО после ПОЛНОГО прохождения предыдущего
        for (let i = 0; i < levelOrder.length - 1; i++) {
            const currentLevelId = levelOrder[i];
            const nextLevelId = levelOrder[i + 1];

            // Проверяем, пройден ли ПОСЛЕДНИЙ подуровень текущего уровня >=80%
            const currentLevelNum = parseInt(currentLevelId.replace('level', ''));
            const totalSubsCurrent = DataManager.getTotalSublevelsForLevel(currentLevelId);
            const lastSubIdCurrent = `${currentLevelNum}-${totalSubsCurrent}`;

            if (DataManager.isSublevelCompleted(currentLevelId, lastSubIdCurrent, 0.8)) {
                this.levels[nextLevelId].unlocked = true;

                // Разблокируем первый подуровень следующего уровня
                const nextLevelNum = parseInt(nextLevelId.replace('level', ''));
                const firstSubIdNext = `${nextLevelNum}-1`;
                if (this.levels[nextLevelId].sublevels[firstSubIdNext]) {
                    this.levels[nextLevelId].sublevels[firstSubIdNext].unlocked = true;
                }
            }
        }

        console.log('[LevelManager] Разблокировка уровней инициализирована на основе полного прохождения уровней.');
    }

    // 11. ПОЛУЧИТЬ ОБЩИЙ ПРОГРЕСС ИГРОКА
    getLevelProgress(levelId) {
        const level = this.levels[levelId];
        if (!level) return null;

        const progress = DataManager.getProgress();
        const trainingProgress = DataManager.getTrainingProgress();
        const levelProgress = {};

        // Собираем прогресс по подуровням
        level.sublevels.forEach(sublevel => {
            const classicScore = progress[levelId]?.[sublevel.id] || 0;
            const trainingScore = trainingProgress[levelId]?.[sublevel.id] || 0;
            const bestScore = Math.max(classicScore, trainingScore);

            const maxScore = DataManager.getMaxScoreForSublevel(levelId, sublevel.id);
            const percentage = maxScore > 0 ? Math.round((bestScore / maxScore) * 100) : 0;

            // Проверяем доступность для классической игры
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

        // Общий прогресс уровня
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

    // 12. ПРОВЕРИТЬ, ДОСТУПЕН ЛИ ПОДУРОВЕНЬ
    getSublevelStatus(levelId, sublevelId, score, maxScore, isAvailable) {
        if (!isAvailable) return 'locked';

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

        if (percentage >= 80) return 'completed';
        if (percentage > 0) return 'started';
        return 'available';
    }

    // 13. ПРОВЕРИТЬ, ДОСТУПЕН ЛИ ПОДУРОВЕНЬ (ОБНОВЛЕННЫЙ)
    isSublevelAvailable(levelId, sublevelId) {
        const level = this.levels[levelId];
        if (!level) return false;

        // Для тренировки все подуровни доступны
        if (this.core && this.core.getGameMode && this.core.getGameMode() === 'training') {
            return true;
        }

        // Используем новую систему проверки доступности из DataManager
        return DataManager.isSublevelAvailable(levelId, sublevelId);
    }

    // 14. ПОЛУЧИТЬ ОБЩИЙ ПРОГРЕСС ИГРОКА (обновленный)
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

    // 15. ПОЛУЧИТЬ ПРОГРЕСС ДЛЯ ОТОБРАЖЕНИЯ В МЕНЮ
    getMenuProgressData() {
        const overallProgress = this.getPlayerOverallProgress();
        const levelsData = {};

        // Собираем данные по каждому уровню
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

    // 16. СОХРАНИТЬ ПРОГРЕСС УРОВНЕЙ
    saveProgress() {
        try {
            localStorage.setItem('levelManager_levels', JSON.stringify(this.levels));
            console.log('[LevelManager] Прогресс уровней сохранен');
        } catch (error) {
            console.error('[LevelManager] Ошибка сохранения прогресса уровней:', error);
        }
    }

    // 17. ЗАГРУЗИТЬ ПРОГРЕСС УРОВНЕЙ
    loadProgress() {
        try {
            const savedLevels = localStorage.getItem('levelManager_levels');
            if (savedLevels) {
                const parsedLevels = JSON.parse(savedLevels);
                // Обновляем существующие уровни, сохраняя структуру
                Object.keys(parsedLevels).forEach(levelId => {
                    if (this.levels[levelId]) {
                        // Обновляем статус уровня
                        this.levels[levelId].unlocked = parsedLevels[levelId].unlocked;

                        // Обновляем подуровни, если они существуют в сохраненных данных
                        if (parsedLevels[levelId].sublevels) {
                            Object.keys(parsedLevels[levelId].sublevels).forEach(sublevelId => {
                                // Для level1 sublevels - объект, обновляем только unlocked/completed поля
                                if (!Array.isArray(this.levels[levelId].sublevels) && this.levels[levelId].sublevels[sublevelId]) {
                                    this.levels[levelId].sublevels[sublevelId] = {
                                        ...this.levels[levelId].sublevels[sublevelId],
                                        unlocked: parsedLevels[levelId].sublevels[sublevelId].unlocked || false,
                                        completed: parsedLevels[levelId].sublevels[sublevelId].completed || false,
                                        bestScore: parsedLevels[levelId].sublevels[sublevelId].bestScore || 0,
                                        bestAccuracy: parsedLevels[levelId].sublevels[sublevelId].bestAccuracy || 0
                                    };
                                }
                                // Для других уровней (массивы) - пока не обновляем, так как структура создается динамически
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

    // 18. ПОЛУЧИТЬ КОНФИГУРАЦИЮ УРОВНЕЙ
    // 17. ОСТАНОВИТЬ ТЕКУЩИЙ УРОВЕНЬ
}


// БАЗОВЫЙ КЛАСС ДЛЯ ВСЕХ УРОВНЕЙ
class BaseLevelHandler {
    constructor(core, sublevel) {
        this.core = core;
        this.sublevel = sublevel;
        this.timers = [];
        this.lightbulbs = [];
        this.isActive = false;
        this.timeLimit = 0; // Оставшееся время
        this.timeLimitTimer = null; // Таймер ограничения времени
    }

    start() {
        this.isActive = true;
        if (this.core.uiManager) {
            this.core.uiManager.showHint(this.sublevel.description);
            this.core.uiManager.setActionButton('СТАРТ', () => this.beginSequence());
        }
        this.createLightbulbs(); // Создаем лампочки для уровня
    }

    createLightbulbs() {
        // Базовый метод, должен быть переопределен в наследниках
        console.log('BaseLevelHandler: createLightbulbs не реализован');
    }

    beginSequence() {
        // Базовый метод, должен быть переопределен в наследниках
        console.log('BaseLevelHandler: beginSequence не реализован');
    }

    cleanup() {
        this.isActive = false;
        this.clearTimers();
        this.stopTimeLimit();

        // Удаляем обработчик клавиш для лабиринта
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
            this.keyPressHandler = null;
        }

        // Удаляем подсказку управления
        const hint = document.getElementById('controls-hint');
        if (hint && hint.parentNode) {
            hint.parentNode.removeChild(hint);
        }

        // Удаляем все лампочки из DOM
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

    // МЕТОДЫ ДЛЯ ТАЙМЕРОВ
    createTimeLimitDisplay(initialTime, onTimeUp) {
        const container = document.getElementById('gameArea') || document.body;

        // Удаляем старый таймер, если есть
        const oldTimer = container.querySelector('.time-limit-display');
        if (oldTimer) oldTimer.remove();

        // Создаем новый дисплей таймера
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'time-limit-display';
        timerDisplay.className = 'game-timer';

        this.timeLimit = initialTime;
        timerDisplay.textContent = `Время: ${this.timeLimit.toFixed(1)} сек`;

        container.appendChild(timerDisplay);

        // Запускаем таймер
        this.timeLimitTimer = setInterval(() => {
            this.timeLimit -= 0.1;

            if (timerDisplay) {
                timerDisplay.textContent = `Время: ${this.timeLimit.toFixed(1)} сек`;

                // Меняем цвет при малом остатке времени
                if (this.timeLimit < 5) {
                    timerDisplay.classList.add('error');
                }
            }

            if (this.timeLimit <= 0) {
                clearInterval(this.timeLimitTimer);
                if (onTimeUp && typeof onTimeUp === 'function') {
                    onTimeUp();
                }

                // Удаляем дисплей
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

        // Удаляем дисплей
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

        // Находим элементы лампочки в SVG
        const bulb = svg.querySelector('path');
        const rays = svg.querySelector('.rays');

        if (isOn) {
            // Включаем лампочку
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
            // Выключаем лампочку
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
            // Создаем лучики для включенной лампочки
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

            // Создаем саму лампочку
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
            console.log(text);
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
    }

    createLightbulbs() {
        const count = this.sublevel.params.lightbulbs || 1;
        const container = document.getElementById('gameArea') || document.body;

        // Очищаем контейнер
        container.innerHTML = '';

        // Создаем контейнер для лампочек
        const bulbsContainer = document.createElement('div');
        bulbsContainer.className = 'lightbulbs-container bulbs-container';

        this.lightbulbs = [];

        for (let i = 0; i < count; i++) {
            const bulbContainer = document.createElement('div');
            bulbContainer.className = 'lightbulb-container bulb-container';
            bulbContainer.dataset.index = i;
            // Стили применяются через CSS класс .bulb-container

            // Создаем SVG лампочки
            const svg = this.createLightbulbSVG('off', count > 1 ? 'small' : 'normal');

            // Добавляем номер под лампочкой
            const label = document.createElement('div');
            label.className = 'bulb-label';

            bulbContainer.appendChild(svg);
            bulbContainer.appendChild(label);

            // Обработчик клика
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
            this.core.uiManager.setActionButton('СТАРТ', null, true); // Делаем кнопку неактивной
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

        // Генерируем случайное время
        this.actualDuration = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
        this.actualDuration = Math.round(this.actualDuration * 10) / 10;

        console.log(`Правильное время: ${this.actualDuration} сек`);

        this.showMessage('Смотрите на лампочку...', 'blue');

        // Показываем лампочку
        this.setLightbulbState(0, true, 'yellow');

        // Гасим через нужное время
        const timer = setTimeout(() => {
            this.setLightbulbState(0, false);
            this.createInputField(); // Создаем поле для ввода

            // Запускаем таймер для ввода
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

        // Также проверка по Enter
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
        // Время вышло, проверяем ответ
        if (this.inputElement && this.inputElement.value) {
            this.checkInputTime();
        } else {
            // Игрок не ввел ответ
            const delta = this.actualDuration; // Максимальное отклонение
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

            // Сохранение прогресса происходит через gameCore.js

            setTimeout(() => {
                if (this.core.getState && this.core.getState().attempts > 0) {
                    this.resetForNextAttempt();
                }
            }, 3000);
        }
    }

    checkInputTime() {
        // Останавливаем таймер
        this.stopTimeLimit();

        if (!this.inputElement) return;

        const userInput = parseFloat(this.inputElement.value);
        if (isNaN(userInput)) {
            this.showMessage('Введите число!', 'red');
            return;
        }

        const delta = Math.abs(userInput - this.actualDuration);

        // РАСЧЕТ ПО НОВОЙ СИСТЕМЕ
        const accuracy = Math.max(0, 100 - (delta / this.actualDuration) * 100);

        // Бонус за скорость (если осталось время)
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

        // Определяем цвет по проценту
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

        if (timeBonus > 1.0) {
            const bonusPercent = Math.round((timeBonus - 1.0) * 100);
            message += ` (+${bonusPercent}% за скорость)`;
        }

        this.showResult(message, `Отклонение: ${delta.toFixed(1)} сек`, color);

        // Передаем результат в ядро игры с ПРАВИЛЬНЫМИ очками
        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: delta,
                score: calculatedScore.finalScore,
                accuracy: accuracy,
                timeBonus: timeBonus
            });
        }

        // Сохранение прогресса происходит через gameCore.js

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

        console.log(`Правильное время: ${this.actualDuration} сек`);

        this.showMessage('Смотрите на лампочку...', 'blue');

        // Показываем лампочку
        this.setLightbulbState(0, true, 'yellow');

        const timer = setTimeout(() => {
            this.setLightbulbState(0, false);
            this.createTimeCards(); // Создаем летающие карточки

            // Запускаем таймер для выбора
            const timeLimit = this.sublevel.timeLimit || 15;
            this.createTimeLimitDisplay(timeLimit, () => this.handleSelectTimeUp());
        }, this.actualDuration * 1000);

        this.addTimer(timer);
    }

    createTimeCards() {
        const params = this.sublevel.params;
        const container = document.getElementById('gameArea') || document.body;

        // Удаляем предыдущие элементы
        const existingCards = container.querySelector('.time-cards-container');
        if (existingCards) existingCards.remove();

        // Создаем контейнер для карточек
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

        // Убедимся, что game-area имеет относительное позиционирование
        if (container.style.position !== 'relative' &&
            container.style.position !== 'absolute' &&
            container.style.position !== 'fixed') {
            container.style.position = 'relative';
        }

        // Генерируем варианты времени
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
            card.style.cursor = 'pointer';
            card.style.fontSize = '18px';
            card.style.fontWeight = 'bold';
            card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            card.style.transition = 'all 0.3s ease';
            card.style.userSelect = 'none';
            card.style.zIndex = '1001';

            // Позиционируем карточки вокруг лампочки
            const angle = (index / options.length) * 2 * Math.PI;
            const radius = 180;

            // Находим лампочку
            const lightbulbContainer = document.querySelector('.lightbulb-container');
            let centerX = 50;
            let centerY = 50;

            if (lightbulbContainer) {
                const rect = lightbulbContainer.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                centerX = ((rect.left + rect.width/2 - containerRect.left) / containerRect.width) * 100;
                centerY = ((rect.top + rect.height/2 - containerRect.top) / containerRect.height) * 100;
            }

            // Рассчитываем позицию карточки
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Ограничиваем позицию, чтобы карточки не выходили за пределы экрана
            const safeX = Math.max(10, Math.min(x, 90));
            const safeY = Math.max(10, Math.min(y, 90));

            card.style.left = safeX + '%';
            card.style.top = safeY + '%';

            // Анимация плавания
            const floatDuration = 3 + Math.random() * 4;
            card.style.animation = `float ${floatDuration}s ease-in-out infinite`;

            // Обработчики событий
            card.addEventListener('click', () => this.checkSelectedTime(time));
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

        // Добавляем стили для анимации
        this.addFloatAnimation();
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

    handleSelectTimeUp() {
        // Время вышло, игрок не выбрал карточку
        const accuracy = 0;
        const calculatedScore = DataManager.calculateScore(
            'level1',
            '1-2',
            accuracy,
            0 // timeBonus
        );

        const message = 'Время вышло!';
        const color = 'red';

        this.showResult(message, 'Не выбрано', color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: 1,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        // Сохранение прогресса
        // Сохранение прогресса происходит через gameCore.js

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    checkSelectedTime(selectedTime) {
        // Останавливаем таймер
        this.stopTimeLimit();

        const delta = Math.abs(selectedTime - this.actualDuration);

        // РАСЧЕТ ПО НОВОЙ СИСТЕМЕ
        const accuracy = Math.max(0, 100 - (delta / this.actualDuration) * 100);

        // Бонус за скорость (если осталось время)
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

        // Определяем цвет по проценту
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

        if (timeBonus > 1.0) {
            const bonusPercent = Math.round((timeBonus - 1.0) * 100);
            message += ` (+${bonusPercent}% за скорость)`;
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

        // Сохранение прогресса
        // Сохранение прогресса происходит через gameCore.js

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    // ========== ПОДУРОВЕНЬ 1-3: ДВА ИНТЕРВАЛА ==========
    startTwoIntervals() {
        const params = this.sublevel.params;

        // Генерируем случайные интервалы для каждого раунда
        // Диапазон: 0.5-2.0 сек для первого интервала, 1.0-3.0 сек для второго
        const firstInterval = 0.5 + Math.random() * 1.5; // 0.5-2.0
        const secondInterval = 1.0 + Math.random() * 2.0; // 1.0-3.0
        const intervals = [firstInterval, secondInterval];

        this.correctTotal = intervals[0] + intervals[1];

        this.showMessage('Запомните два интервала горения...', 'blue');

        let currentTime = 0;

        // Первый интервал
        const firstOnTimer = setTimeout(() => {
            this.setLightbulbState(0, true, 'yellow');
        }, currentTime);

        const firstOffTimer = setTimeout(() => {
            this.setLightbulbState(0, false);
        }, currentTime + intervals[0] * 1000);

        currentTime += intervals[0] * 1000 + 1000; // Пауза 1 сек

        // Второй интервал
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

        // РАСЧЕТ ПО НОВОЙ СИСТЕМЕ
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

        // Определяем цвет по проценту
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

        // Сохранение прогресса происходит через gameCore.js

        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    handleLightbulbClick(index) {
        // Обработчик кликов по лампочкам
        console.log(`Клик по лампочке ${index}`);
    }

    resetForNextAttempt() {
        // Останавливаем таймер
        this.stopTimeLimit();

        // Очищаем все созданные элементы
        const container = document.getElementById('gameArea') || document.body;
        const existingElements = container.querySelectorAll('.input-container, .time-cards-container, .lightbulbs-container, .time-limit-display');
        existingElements.forEach(el => el.remove());

        // Создаем лампочки заново
        this.createLightbulbs();

        // Сбрасываем кнопку
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

            // Обработчик клика
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

        // Сохраняем начальные позиции после рендеринга
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
            this.applyBlur(); // Применяем размытие и движение
        }, currentTime + 500);

        this.addTimer(blurTimer);
    }

    applyBlur() {
        this.isBlurred = true; // Устанавливаем флаг для разрешения кликов
        this.showMessage('Найдите лампочку с паттерном! У вас 5 секунд.', 'blue');

        // Размываем все лампочки
        this.lightbulbs.forEach(lightbulb => {
            lightbulb.container.style.filter = 'blur(3px)';
            lightbulb.container.style.opacity = '0.7';
        });

        // Запускаем движение
        this.startMovement();

        // ЗАПУСКАЕМ ТАЙМЕР ВЫБОРА НА 5 СЕКУНД
        this.startSelectionTimer();

        // Запускаем мигание отвлекающих лампочек
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
            // Сохраняем оригинальную позицию
            const rect = lightbulb.container.getBoundingClientRect();
            lightbulb.originalPosition = {
                x: rect.left - containerRect.left,
                y: rect.top - containerRect.top
            };

            // Запускаем движение
            this.moveBulb(lightbulb);
        });
    }

    moveBulb(lightbulb) {
        const container = lightbulb.container.parentElement;
        const containerRect = container.getBoundingClientRect();

        const moveInterval = setInterval(() => {
            if (!this.isBlurred) {
                clearInterval(moveInterval);
                return;
            }

            // Генерируем новую позицию в пределах контейнера
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
        }, 2000);

        this.addTimer(moveInterval);
    }

    // ========== ПОДУРОВЕНЬ 2-2: НАЙДИ ВРЕМЯ ==========
    startFindDuration() {
        const params = this.sublevel.params;
        const count = params.lightbulbs || 3;

        // Генерируем случайные длительности для каждой лампочки
        this.lightDurations = [];
        for (let i = 0; i < count; i++) {
            const duration = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
            this.lightDurations.push(Math.round(duration * 10) / 10);
        }

        this.showMessage('Запоминайте время горения каждой лампочки...', 'blue');

        let currentTime = 0;
        this.lightbulbs.forEach((lightbulb, index) => {
            // Применяем оттенок
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
            this.shuffleLightbulbs(); // Перемешиваем лампочки
            this.showTargetCard(); // Показываем целевую карточку
        }, currentTime + 1000);

        this.addTimer(shuffleTimer);
    }

    shuffleLightbulbs() {
        console.log('Перемешивание лампочек...');

        const container = this.lightbulbs[0].container.parentElement;
        const containerRect = container.getBoundingClientRect();

        // Сбрасываем стили контейнера для правильного позиционирования
        container.style.position = 'relative';
        container.style.overflow = 'visible';
        container.style.minHeight = '350px';
        container.style.height = 'auto';

        // Убедимся, что лампочки имеют начальные позиции
        if (!this.lightbulbs[0].originalPosition) {
            this.saveInitialPositions();
        }

        // Рассчитываем безопасную область для перемещения
        const safeArea = {
            width: containerRect.width - 180, // Оставляем отступы
            height: containerRect.height - 180
        };

        console.log(`Безопасная область: ${safeArea.width}x${safeArea.height}`);

        // Массив для отслеживания занятых позиций
        const occupiedPositions = [];

        this.lightbulbs.forEach(lightbulb => {
            const bulbWidth = 120;
            const bulbHeight = 140;

            let attempts = 0;
            let newX, newY;
            let positionFound = false;

            // Пытаемся найти свободную позицию
            while (attempts < 50 && !positionFound) {
                newX = Math.random() * Math.max(50, safeArea.width - bulbWidth);
                newY = Math.random() * Math.max(50, safeArea.height - bulbHeight);

                // Проверяем, не перекрывает ли эта позиция другие лампочки
                let overlaps = false;
                for (const pos of occupiedPositions) {
                    const distance = Math.sqrt(
                        Math.pow(newX - pos.x, 2) + Math.pow(newY - pos.y, 2)
                    );
                    if (distance < 150) { // Минимальное расстояние между лампочками
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

            // Если не нашли свободную позицию, используем случайную
            if (!positionFound) {
                newX = Math.random() * Math.max(50, safeArea.width - bulbWidth);
                newY = Math.random() * Math.max(50, safeArea.height - bulbHeight);
            }

            // Добавляем отступ от краев
            newX += 40;
            newY += 40;

            console.log(`Лампочка ${lightbulb.index}: позиция (${newX.toFixed(0)}, ${newY.toFixed(0)})`);

            // Применяем новую позицию
            lightbulb.container.style.position = 'absolute';
            lightbulb.container.style.left = `${newX}px`;
            lightbulb.container.style.top = `${newY}px`;
            lightbulb.container.style.zIndex = '10';
            lightbulb.container.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            lightbulb.container.style.transform = 'none';

            // Добавляем небольшую анимацию для визуального эффекта
            setTimeout(() => {
                lightbulb.container.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }, 100);

            lightbulb.isShuffled = true;
        });

        // Добавляем инструкцию для пользователя
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

    /**
     * Запускает таймер для выбора лампочки (5 секунд)
     */
    startSelectionTimer() {
        // Очищаем старый таймер если есть
        this.stopSelectionTimer();

        // Создаем отображение таймера
        this.createSelectionTimerDisplay();

        // Устанавливаем начальное время
        let timeLeft = this.selectionTimeLimit;

        // Обновляем отображение
        if (this.selectionTimerDisplay) {
            this.selectionTimerDisplay.textContent = `Время на выбор: ${timeLeft} сек`;
        }

        // Запускаем таймер
        this.selectionTimer = setInterval(() => {
            timeLeft -= 0.1;

            if (this.selectionTimerDisplay) {
                this.selectionTimerDisplay.textContent = `Время на выбор: ${timeLeft.toFixed(1)} сек`;

                // Меняем цвет при малом остатке времени
                if (timeLeft < 3) {
                    this.selectionTimerDisplay.classList.add('warning');
                }
                if (timeLeft < 1) {
                    this.selectionTimerDisplay.classList.add('critical');
                }
            }

            // Проверяем истекло ли время
            if (timeLeft <= 0) {
                this.handleSelectionTimeUp();
            }
        }, 100);

        this.addTimer(this.selectionTimer);
    }

    // Создает отображение таймера выбора
    createSelectionTimerDisplay() {
        // Удаляем старый таймер если есть
        if (this.selectionTimerDisplay && this.selectionTimerDisplay.parentNode) {
            this.selectionTimerDisplay.parentNode.removeChild(this.selectionTimerDisplay);
        }

        // Создаем новый элемент таймера
        this.selectionTimerDisplay = document.createElement('div');
        this.selectionTimerDisplay.className = 'selection-timer-display';
        this.selectionTimerDisplay.style.position = 'fixed';
        this.selectionTimerDisplay.style.top = '70px'; // Под основным таймером
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

        // Добавляем в DOM
        const container = document.getElementById('gameArea') || document.body;
        container.appendChild(this.selectionTimerDisplay);
    }

    // Обработчик истечения времени на выбор
    handleSelectionTimeUp() {
        // Останавливаем таймер
        this.stopSelectionTimer();

        // Останавливаем движение лампочек если есть
        this.isBlurred = false;

        // Показываем сообщение о проигрыше
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

        // Убираем размытие
        this.lightbulbs.forEach(lightbulb => {
            lightbulb.container.style.filter = 'none';
            lightbulb.container.style.opacity = '1';
            lightbulb.container.style.transform = 'scale(1)';
        });

        // Подсвечиваем правильную лампочку красным
        this.setLightbulbState(this.targetIndex, true, '#b65048');

        this.showResult(message, 'Время истекло!', color);

        if (this.core.handleAttemptResult) {
            this.core.handleAttemptResult({
                delta: 1,
                score: calculatedScore.finalScore,
                accuracy: accuracy
            });
        }

        // Через 3 секунды начинаем новую попытку
        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    // Останавливает таймер выбора
    stopSelectionTimer() {
        if (this.selectionTimer) {
            clearInterval(this.selectionTimer);
            this.selectionTimer = null;
        }

        // Удаляем отображение таймера
        if (this.selectionTimerDisplay && this.selectionTimerDisplay.parentNode) {
            this.selectionTimerDisplay.parentNode.removeChild(this.selectionTimerDisplay);
            this.selectionTimerDisplay = null;
        }
    }

    showTargetCard() {
        // Выбираем случайную лампочку как цель
        this.targetIndex = Math.floor(Math.random() * this.lightbulbs.length);
        const targetDuration = this.lightDurations[this.targetIndex];

        // Создаем карточку с временем
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

        // ЗАПУСКАЕМ ТАЙМЕР ВЫБОРА НА 5 СЕКУНД
        this.startSelectionTimer();
    }

    // ========== ПОДУРОВЕНЬ 2-3: ПОВТОРИ ПАТТЕРН ==========
    startRepeatPattern() {
        const params = this.sublevel.params;

        // Генерируем случайный паттерн
        this.pattern = [];
        for (let i = 0; i < params.patternLength; i++) {
            const duration = Math.random() * (params.segmentMax - params.segmentMin) + params.segmentMin;
            this.pattern.push(Math.round(duration * 10) / 10);
        }

        this.interactiveIndex = params.interactiveIndex || 1;
        this.demonstrationIndex = params.demonstrationIndex || 0;

        console.log('Паттерн:', this.pattern);

        this.showDemonstrationPattern();
    }

    showDemonstrationPattern() {
        this.showMessage('Запоминайте паттерн...', 'blue');

        let currentTime = 0;
        this.pattern.forEach((duration, index) => {
            // Включаем лампочку
            const onTimer = setTimeout(() => {
                this.setLightbulbState(this.demonstrationIndex, true, 'yellow');
            }, currentTime);

            // Выключаем
            const offTimer = setTimeout(() => {
                this.setLightbulbState(this.demonstrationIndex, false);
            }, currentTime + duration * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += duration * 1000 + 300; // Пауза 300мс
        });

        // После демонстрации
        const switchTimer = setTimeout(() => {
            this.showMessage('Теперь повторите паттерн на второй лампочке!', 'blue');
            this.setupRecording();
        }, currentTime + 1000);

        this.addTimer(switchTimer);
    }

    setupRecording() {
        const container = document.getElementById('gameArea') || document.body;

        // Создаем кнопку для записи
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '30px';

        this.recordButton = document.createElement('button');
        this.recordButton.textContent = 'Начать запись паттерна';
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
                this.recordButton.textContent = 'Запись... (кликайте на лампочку 2)';
                this.recordButton.style.background = '#d19e9a';
            } else {
                this.stopRecording();
                this.checkPattern();
            }
        });

        buttonContainer.appendChild(this.recordButton);
        container.appendChild(buttonContainer);

        // Добавляем подсказку
        const hint = document.createElement('div');
        hint.textContent = 'Нажимайте и удерживайте на лампочке 2, чтобы записать сегменты паттерна';
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

        // Устанавливаем обработчики для интерактивной лампочки
        const interactiveBulb = this.lightbulbs[this.interactiveIndex];
        if (interactiveBulb) {
            let pressStartTime = 0;

            const handleMouseDown = () => {
                if (this.isRecording) {
                    pressStartTime = Date.now();
                    this.setLightbulbState(this.interactiveIndex, true, 'green');
                }
            };

            const handleMouseUp = () => {
                if (this.isRecording && pressStartTime > 0) {
                    const duration = (Date.now() - pressStartTime) / 1000;
                    this.recordedPattern.push(Math.round(duration * 10) / 10);
                    this.setLightbulbState(this.interactiveIndex, false);
                    pressStartTime = 0;

                    // Показываем обратную связь
                    console.log(`Записан сегмент: ${duration.toFixed(1)} сек`);
                    this.showMessage(`Сегмент ${this.recordedPattern.length}: ${duration.toFixed(1)} сек`, 'green');
                }
            };

            interactiveBulb.container.addEventListener('mousedown', handleMouseDown);
            interactiveBulb.container.addEventListener('mouseup', handleMouseUp);

            // Сохраняем для удаления
            this.recordingHandlers = { handleMouseDown, handleMouseUp };
        }
    }

    stopRecording() {
        this.isRecording = false;

        // Удаляем обработчики
        if (this.recordingHandlers) {
            const interactiveBulb = this.lightbulbs[this.interactiveIndex];
            if (interactiveBulb) {
                interactiveBulb.container.removeEventListener('mousedown', this.recordingHandlers.handleMouseDown);
                interactiveBulb.container.removeEventListener('mouseup', this.recordingHandlers.handleMouseUp);
            }
        }
    }

    checkPattern() {
        console.log('Оригинал:', this.pattern);
        console.log('Записано:', this.recordedPattern);

        // Сравниваем паттерны
        let correctSegments = 0;
        const minLength = Math.min(this.pattern.length, this.recordedPattern.length);

        for (let i = 0; i < minLength; i++) {
            if (Math.abs(this.pattern[i] - this.recordedPattern[i]) <= 0.3) {
                correctSegments++;
            }
        }

        const accuracy = (correctSegments / this.pattern.length) * 100;

        // РАСЧЕТ ПО НОВОЙ СИСТЕМЕ
        const calculatedScore = DataManager.calculateScore(
            'level2',
            '2-3',
            accuracy,
            1.0 // timeBonus (для этого уровня можно добавить бонус за скорость)
        );

        const maxScore = DataManager.getMaxScoreForSublevel('level2', '2-3');
        const percentage = maxScore > 0 ? Math.round((calculatedScore.finalScore / maxScore) * 100) : 0;

        let message = '';
        let color = 'red';

        // Определяем цвет по проценту
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

        // Сохранение прогресса происходит через gameCore.js

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

            // ОСТАНАВЛИВАЕМ ДВИЖЕНИЕ
            this.isBlurred = false;

            if (index === this.targetIndex) {
                // Правильно! Останавливаем таймер
                this.stopSelectionTimer();
                this.showSuccess();
            } else {
                // Неправильно - показываем красный цвет
                this.setLightbulbState(index, true, '#bf635d');
                setTimeout(() => {
                    this.setLightbulbState(index, false);
                    this.showMessage('Неверно! Попробуйте еще раз.', '#bf635d');
                }, 500);
            }
        } else if (type === 'find_duration') {
            if (index === this.targetIndex) {
                // Правильно! Останавливаем таймеры
                this.stopTimeLimit();
                this.stopSelectionTimer();
                if (this.cardContainer) {
                    this.cardContainer.remove();
                }
                this.showSuccess();
            } else {
                // Неправильно
                this.setLightbulbState(index, true, '#bf635d');
                setTimeout(() => {
                    this.setLightbulbState(index, false);
                    this.showMessage('Неверно! Попробуйте еще раз.', '#bf635d');
                }, 500);
            }
        }
    }

    showSuccess() {
        // ОСТАНАВЛИВАЕМ ТАЙМЕР ВЫБОРА
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

        if (timeBonus > 1.0) {
            const bonusPercent = Math.round((timeBonus - 1.0) * 100);
            message += ` (+${bonusPercent}% за скорость)`;
        }

        // Убираем размытие и подсвечиваем правильную лампочку
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

        this.showResult(message, 'Правильно!', color);

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

        // Сбрасываем состояние
        this.isBlurred = false;
        this.targetIndex = 0;
        this.targetPattern = [];
        this.lightDurations = [];
        this.recordedPatterns = [[], []];
        this.isRecording = false;
        this.currentRecordingIndex = null;

        // Очищаем таймеры
        this.clearTimers();
        this.stopTimeLimit();
        this.stopSelectionTimer();

        // Сбрасываем позиции лампочек
        this.resetBulbPositions();

        // Создаем лампочки заново
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
        bulbsContainer.style.gap = '30px';
        bulbsContainer.style.margin = '40px 0';
        bulbsContainer.style.flexWrap = 'wrap';

        this.lightbulbs = [];

        for (let i = 0; i < count; i++) {
            const bulbContainer = document.createElement('div');
            bulbContainer.className = 'lightbulb-container bulb-container';
            bulbContainer.dataset.index = i;
            bulbContainer.style.position = 'relative';

            // Определяем цвет для лампочки
            const colors = params.colors || ['#e8aaaa', '#87ae87', '#5e5e91', '#fafac3'];
            const color = colors[i % colors.length];

            // Создаем SVG лампочки с цветом
            const svg = this.createLightbulbSVG('off', 'medium', color);

            bulbContainer.appendChild(svg);

            // Обработчик клика только для 3-1
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

        // Генерируем случайную последовательность
        const sequenceLength = params.sequenceLength || 4;
        for (let i = 0; i < sequenceLength; i++) {
            const bulbIndex = Math.floor(Math.random() * params.lightbulbs);
            const duration = Math.random() * (params.maxDuration - params.minDuration) + params.minDuration;
            this.sequence.push({
                index: bulbIndex,
                duration: Math.round(duration * 10) / 10
            });
        }

        console.log('Последовательность:', this.sequence);

        this.showMessage('Смотрите внимательно! Запоминайте последовательность...', '#4a6fa5');
        this.playSequence();
    }

    playSequence() {
        this.isPlayingSequence = true;
        this.isInputEnabled = false;

        let currentTime = 0;

        this.sequence.forEach((step, index) => {
            // Включаем лампочку
            const onTimer = setTimeout(() => {
                const color = this.lightbulbs[step.index].color;
                this.setLightbulbState(step.index, true, color);
            }, currentTime);

            // Выключаем лампочку через нужное время
            const offTimer = setTimeout(() => {
                this.setLightbulbState(step.index, false);
            }, currentTime + step.duration * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += step.duration * 1000 + 500; // Пауза между шагами
        });

        // После воспроизведения включаем ввод
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

        // Очищаем предыдущие элементы
        const container = document.getElementById('gameArea') || document.body;
        const existingElements = container.querySelectorAll('.equation-container, .input-container');
        existingElements.forEach(el => el.remove());

        // Генерируем случайное время для каждой лампочки (от 1 до 5 секунд)
        this.lightDurations = [];
        for (let i = 0; i < params.lightbulbs; i++) {
            const duration = Math.random() * 4 + 1; // от 1 до 5 секунд
            this.lightDurations.push(Math.round(duration * 10) / 10); // округляем до 0.1
        }

        this.showMessage('Внимательно смотрите! Каждая лампочка покажет время своего горения...', '#4a6fa5');

        // Показываем время горения каждой лампочки
        let currentTime = 0;

        this.lightbulbs.forEach((lightbulb, index) => {
            // Добавляем небольшой разброс для визуального интереса
            const delay = index * 100; // небольшая задержка между включениями

            // Включаем лампочку
            const onTimer = setTimeout(() => {
                this.setLightbulbState(index, true, lightbulb.color);

                // Показываем время горения над лампочкой
                this.showDurationOverlay(index, this.lightDurations[index]);
            }, currentTime + delay);

            // Выключаем лампочку через нужное время
            const offTimer = setTimeout(() => {
                this.setLightbulbState(index, false);
                this.hideDurationOverlay(index);
            }, currentTime + delay + this.lightDurations[index] * 1000);

            this.addTimer(onTimer);
            this.addTimer(offTimer);

            currentTime += this.lightDurations[index] * 1000 + 800; // Пауза между лампочками
        });

        // Генерируем уравнение после показа всех лампочек
        const equationTimer = setTimeout(() => {
            this.generateEquation();
            this.showEquation();
        }, currentTime + 1000);

        this.addTimer(equationTimer);
    }

    showDurationOverlay(index, duration) {
        const bulbContainer = this.lightbulbs[index].container;

        // Удаляем предыдущий оверлей если есть
        const existingOverlay = bulbContainer.querySelector('.duration-overlay');
        if (existingOverlay) existingOverlay.remove();

        // Создаем оверлей с временем
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

        // Выбираем тип уравнения случайным образом
        const equationTypes = params.equationTypes || ['addition', 'subtraction', 'multiplication'];
        const equationType = equationTypes[Math.floor(Math.random() * equationTypes.length)];

        // Выбираем случайные индексы лампочек
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

                // Убедимся, что результат положительный
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
                const multiplier = Math.floor(Math.random() * 3) + 2; // 2, 3 или 4

                this.equation = {
                    type: 'multiplication',
                    text: `Время лампочки ${a + 1} × ${multiplier} = ?`,
                    answer: this.lightDurations[a] * multiplier,
                    values: [this.lightDurations[a], multiplier]
                };
                break;

            case 'average':
                // Среднее значение двух лампочек
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

        // Округляем ответ до 1 знака после запятой
        this.equation.answer = Math.round(this.equation.answer * 10) / 10;
        this.correctAnswer = this.equation.answer;

        console.log('Сгенерировано уравнение:', this.equation);
        console.log('Времена горения лампочек:', this.lightDurations);
    }

    showEquation() {
        const container = document.getElementById('gameArea') || document.body;

        // Создаем контейнер для уравнения
        const equationContainer = document.createElement('div');
        equationContainer.className = 'equation-container';
        equationContainer.style.textAlign = 'center';
        equationContainer.style.padding = '30px';
        equationContainer.style.background = 'var(--primary-color)';
        equationContainer.style.borderRadius = '20px';
        equationContainer.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        equationContainer.style.maxWidth = '600px';

        // Показываем уравнение
        const equationText = document.createElement('div');
        equationText.innerHTML = `
            <h3 style="color: #648364; margin-bottom: 15px; font-size: 20px;">Математическая задача:</h3>
            <div style="font-size: 28px; font-weight: bold; color: #333; margin: 20px 0;">
                ${this.equation.text}
            </div>
            <div style="font-size: 16px; color: #666; margin-bottom: 25px;">
                Используйте значения времени, которые вы видели на лампочках
            </div>
        `;

        // Создаем поле для ввода ответа
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        inputContainer.style.marginTop = '20px';

        const inputWrapper = document.createElement('div');
        inputWrapper.style.display = 'flex';
        inputWrapper.style.justifyContent = 'center';
        inputWrapper.style.alignItems = 'center';
        inputWrapper.style.gap = '15px';
        inputWrapper.style.flexWrap = 'wrap';

        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.1';
        input.min = '0';
        input.placeholder = 'Введите ответ (секунды)';
        input.style.padding = '15px 20px';
        input.style.fontSize = '18px';
        input.style.borderRadius = '10px';
        input.style.width = '250px';
        input.style.textAlign = 'center';
        input.style.outline = 'none';

        input.addEventListener('focus', () => {
            input.style.borderColor = '#648364';
            input.style.boxShadow = '0 0 0 3px rgba(156, 39, 176, 0.2)';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#648364';
            input.style.boxShadow = 'none';
        });

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Проверить ответ';
        submitBtn.style.padding = '15px 30px';
        submitBtn.style.fontSize = '18px';
        submitBtn.style.background = 'linear-gradient(135deg, #9c27b0, #7b1fa2)';
        submitBtn.style.color = 'white';
        submitBtn.style.border = 'none';
        submitBtn.style.borderRadius = '10px';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.transition = 'transform 0.2s, box-shadow 0.2s';
        submitBtn.style.fontWeight = 'bold';

        submitBtn.addEventListener('mouseover', () => {
            submitBtn.style.transform = 'translateY(-2px)';
            submitBtn.style.boxShadow = '0 5px 15px rgba(156, 39, 176, 0.4)';
        });

        submitBtn.addEventListener('mouseout', () => {
            submitBtn.style.transform = 'translateY(0)';
            submitBtn.style.boxShadow = 'none';
        });

        submitBtn.addEventListener('click', () => {
            this.checkAnswer(input.value);
        });

        // Также проверяем по нажатию Enter
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

        // Фокусируемся на поле ввода
        setTimeout(() => input.focus(), 100);

        // Запускаем таймер
        this.startTimeLimit();
    }

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ТАЙМЕРОМ ==========
    startTimeLimit() {
        const timeLimit = this.sublevel.timeLimit || 30; // 30 секунд по умолчанию

        // Используем стандартный таймер из базового класса (game-timer)
        super.createTimeLimitDisplay(timeLimit, () => this.timeUp());
    }

    stopTimeLimit() {
        // Используем метод остановки таймера из базового класса
        if (this.timeLimitTimer) {
            clearInterval(this.timeLimitTimer);
            this.timeLimitTimer = null;
        }

        // Удаляем дисплей таймера
        const timerDisplay = document.querySelector('.game-timer');
        if (timerDisplay && timerDisplay.parentNode) {
            timerDisplay.parentNode.removeChild(timerDisplay);
        }
    }

    createTimeLimitDisplay(timeLimit, onTimeUp) {
        // Удаляем старый таймер если есть
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

        // Вставляем таймер в начало контейнера
        container.insertBefore(timeDisplay, container.firstChild);

        // Сохраняем callback
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

        // Рассчитываем отклонение и точность
        const delta = Math.abs(userAnswer - this.correctAnswer);
        let accuracy = 100;

        if (delta > 0) {
            // Рассчитываем процент точности (чем больше отклонение, тем меньше точность)
            const maxAllowedError = this.correctAnswer * 0.2; // Максимально допустимая ошибка 20%
            accuracy = Math.max(0, 100 - (delta / maxAllowedError) * 100);
        }

        // Ограничиваем точность от 0 до 100
        accuracy = Math.min(100, Math.max(0, accuracy));

        // Бонус за скорость (если осталось время)
        const timeBonus = this.timeLeft ? 1.0 + (this.timeLeft / 30) * 0.1 : 1.0;

        // Рассчитываем очки
        const calculatedScore = DataManager.calculateScore(
            'level3',
            '3-2',
            accuracy,
            timeBonus
        );

        // Определяем результат
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

        // Добавляем информацию о точности
        message += ` (Точность: ${accuracy.toFixed(1)}%)`;

        if (timeBonus > 1.0) {
            const bonusPercent = Math.round((timeBonus - 1.0) * 100);
            message += ` +${bonusPercent}% за скорость`;
        }

        this.showResult(message, `Отклонение: ${delta.toFixed(1)} сек`, color);

        // Останавливаем таймер
        this.stopTimeLimit();

        // Передаем результат в ядро игры
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

        // Перезапускаем через 3 секунды для следующей попытки
        setTimeout(() => {
            if (this.core.getState && this.core.getState().attempts > 0) {
                this.resetForNextAttempt();
            }
        }, 3000);
    }

    // ========== ОБЩИЕ МЕТОДЫ ДЛЯ LEVEL 3 ==========
    handleLightbulbClick(index) {
        // Для 3-2 клики по лампочкам не обрабатываются
        if (this.sublevel.type !== 'simon_pattern') {
            return;
        }

        if (!this.isInputEnabled || this.isPlayingSequence) {
            return;
        }

        // Запоминаем клик игрока
        const color = this.lightbulbs[index].color;
        this.setLightbulbState(index, true, color);

        setTimeout(() => {
            this.setLightbulbState(index, false);
        }, 300);

        this.userSequence.push(index);
        this.currentStep++;

        // Проверяем правильность
        if (this.userSequence[this.currentStep - 1] !== this.sequence[this.currentStep - 1].index) {
            // Неправильно
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

        // Проверяем, закончена ли последовательность
        if (this.currentStep === this.sequence.length) {
            // Правильно!
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
        // Если время вышло до ввода ответа
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
        // Останавливаем таймер
        this.stopTimeLimit();

        const container = document.getElementById('gameArea') || document.body;
        const existingElements = container.querySelectorAll('.equation-container, .input-container, .lightbulbs-container, .time-limit-display, .duration-overlay');
        existingElements.forEach(el => el.remove());

        // Очищаем состояние
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

        // Очищаем таймеры
        this.clearTimers();

        // Создаем лампочки заново
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

        // лабиринт для подуровня 4-1
        this.createMaze();
    }

    createMaze() {
        const params = this.sublevel.params;
        const size = params.mazeSize || 5;
        const container = document.getElementById('gameArea') || document.body;

        container.innerHTML = '';

        // Создаем простой лабиринт (сетка)
        this.maze = [];
        for (let y = 0; y < size; y++) {
            this.maze[y] = [];
            for (let x = 0; x < size; x++) {
                this.maze[y][x] = {
                    x: x,
                    y: y,
                    isWall: Math.random() < 0.2, // 20% стен
                    isTarget: false
                };
            }
        }

        // Клетка (0,0) - стартовая позиция игрока - НЕ может быть стеной
        this.maze[0][0].isWall = false;

        // Клетки (0,1) и (1,0) не могут быть стенами одновременно
        const rightBlocked = this.maze[0][1].isWall;
        const downBlocked = this.maze[1][0].isWall;

        if (rightBlocked && downBlocked) {
            // Если обе потенциальные выходные клетки - стены, делаем одну из них проходимой
            // Случайно выбираем какую освободить
            if (Math.random() > 0.5) {
                this.maze[0][1].isWall = false; // Освобождаем правую клетку
            } else {
                this.maze[1][0].isWall = false; // Освобождаем нижнюю клетку
            }
        }

        // Есть хотя бы один выход из стартовой зоны
        const startNeighbors = [
            {x: 1, y: 0},  // справа
            {x: 0, y: 1},  // снизу
            {x: 1, y: 1}   // по диагонали (не используется для движения, но влияет на обход)
        ];

        let passableNeighbors = 0;
        startNeighbors.forEach(neighbor => {
            if (neighbor.x < size && neighbor.y < size && !this.maze[neighbor.y][neighbor.x].isWall) {
                passableNeighbors++;
            }
        });

        // Если все соседние клетки - стены, создаем хотя бы один проход
        if (passableNeighbors === 0) {
            // Делаем клетку справа проходимой
            if (1 < size) {
                this.maze[0][1].isWall = false;
            }
        }

        // Убедимся, что есть проход от старта к финишу
        this.playerPosition = {x: 0, y: 0};

        // Выбираем позицию для цели
        let attempts = 0;
        let targetFound = false;

        while (!targetFound && attempts < 100) {
            this.targetPosition = {
                x: Math.floor(Math.random() * (size - 2)) + 1,
                y: Math.floor(Math.random() * (size - 2)) + 1
            };

            // Цель не должна быть в стартовой позиции и не должна быть стеной
            if ((this.targetPosition.x !== 0 || this.targetPosition.y !== 0) &&
                !this.maze[this.targetPosition.y][this.targetPosition.x].isWall) {

                // Проверяем, достижима ли цель из старта
                if (this.isPathPossible()) {
                    this.maze[this.targetPosition.y][this.targetPosition.x].isTarget = true;
                    targetFound = true;
                }
            }
            attempts++;
        }

        // Если не нашли подходящую цель, помещаем ее в первую доступную клетку
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

        // Генерируем путь
        this.generatePath();

        console.log(`[Лабиринт] Старт: (${this.playerPosition.x}, ${this.playerPosition.y})`);
        console.log(`[Лабиринт] Цель: (${this.targetPosition.x}, ${this.targetPosition.y})`);
        console.log(`[Лабиринт] Длина оптимального пути: ${this.path.length} шагов`);
        console.log(`[Лабиринт] Путь: ${this.path.map(p => `(${p.x},${p.y})`).join(' → ')}`);

        // Рисуем лабиринт
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

        // Создаем клетки лабиринта
        this.mazeCells = []; // Сохраняем ссылки на клетки для быстрого доступа

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
                    // Не показываем лампочку пока не начали игру
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
        this.mazeContainer = mazeContainer; // Сохраняем ссылку на контейнер
    }

    isPathPossible() {
        const size = this.maze.length;
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        const queue = [{x: 0, y: 0}];
        visited[0][0] = true;

        const directions = [
            {dx: 1, dy: 0},  // вправо
            {dx: 0, dy: 1},  // вниз
            {dx: -1, dy: 0}, // влево
            {dx: 0, dy: -1}  // вверх
        ];

        while (queue.length > 0) {
            const current = queue.shift();

            // Если достигли цели
            if (current.x === this.targetPosition.x && current.y === this.targetPosition.y) {
                return true;
            }

            // Проверяем соседние клетки
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                // Проверяем границы и проходимость
                if (nx >= 0 && nx < size && ny >= 0 && ny < size &&
                    !this.maze[ny][nx].isWall && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }

        return false; // Путь не найден
    }

    showMaze() {
        if (!this.mazeContainer) return;

        this.mazeContainer.style.opacity = '1';
        this.mazeContainer.style.visibility = 'visible';

        // Показываем все клетки с небольшой задержкой для анимации
        if (this.mazeCells) {
            this.mazeCells.forEach((cellData, index) => {
                setTimeout(() => {
                    cellData.element.style.opacity = '1';
                }, index * 20); // Постепенное появление
            });
        }
    }

    generatePath() {
        // Используем алгоритм BFS для поиска кратчайшего пути
        const size = this.maze.length;
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        const parent = Array(size).fill().map(() => Array(size).fill(null));
        const queue = [{x: this.playerPosition.x, y: this.playerPosition.y}];
        visited[this.playerPosition.y][this.playerPosition.x] = true;

        const directions = [
            {dx: 1, dy: 0},  // вправо
            {dx: 0, dy: 1},  // вниз
            {dx: -1, dy: 0}, // влево
            {dx: 0, dy: -1}  // вверх
        ];

        let found = false;

        while (queue.length > 0 && !found) {
            const current = queue.shift();

            // Если достигли цели
            if (current.x === this.targetPosition.x && current.y === this.targetPosition.y) {
                found = true;

                // Восстанавливаем путь
                this.path = [];
                let step = current;

                while (step && (step.x !== this.playerPosition.x || step.y !== this.playerPosition.y)) {
                    this.path.unshift({x: step.x, y: step.y});
                    step = parent[step.y][step.x];
                }
                break;
            }

            // Проверяем соседние клетки
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                // Проверяем границы и проходимость
                if (nx >= 0 && nx < size && ny >= 0 && ny < size &&
                    !this.maze[ny][nx].isWall && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    parent[ny][nx] = current;
                    queue.push({x: nx, y: ny});
                }
            }
        }

        // Если путь не найден, создаем пустой путь
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

        // Очищаем предыдущие обработчики клавиш
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
            this.keyPressHandler = null;
        }
        const oldHint = document.getElementById('controls-hint');
        if (oldHint && oldHint.parentNode) {
            oldHint.parentNode.removeChild(oldHint);
        }

        // ПОКАЗЫВАЕМ ЛАБИРИНТ ПЕРЕД НАЧАЛОМ ИГРЫ
        this.showMaze();

        this.showMessage(`Запомните путь к лампочке! У вас ${duration} секунд...`, 'blue');

        // Показываем лампочку в центре лабиринта
        const targetCell = document.querySelector(`.maze-cell[data-x="${this.targetPosition.x}"][data-y="${this.targetPosition.y}"]`);
        if (targetCell) {
            targetCell.textContent = '💡';
            targetCell.style.background = '#fdf0a9';
            targetCell.style.color = '#333';
        }

        // Таймер просмотра
        const timer = setTimeout(() => {
            // Скрываем лампочку
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
        // Добавляем обработчик клавиш стрелок
        this.keyPressHandler = (event) => this.handleKeyPress(event);
        document.addEventListener('keydown', this.keyPressHandler);

        // Добавляем визуальные подсказки о управлении
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

        // Анимируем появление подсказки
        hint.style.opacity = '0';
        hint.style.transform = 'translateY(10px)';
        hint.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        setTimeout(() => {
            hint.style.opacity = '1';
            hint.style.transform = 'translateY(0)';
        }, 100);
    }

    handleKeyPress(event) {
        // Игнорируем, если игра не активна
        if (!this.maze || !this.playerPosition) return;

        let newX = this.playerPosition.x;
        let newY = this.playerPosition.y;

        // Определяем направление движения по клавише
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
                return; // Игнорируем другие клавиши
        }

        this.movePlayer(newX, newY);
    }

    movePlayer(x, y) {
        // Проверяем границы лабиринта
        if (x < 0 || x >= this.maze[0].length || y < 0 || y >= this.maze.length) {
            this.showMessage('Выход за пределы лабиринта!', 'red');
            return;
        }

        // Проверяем, является ли движение на соседнюю клетку
        const isAdjacent = (
            (Math.abs(x - this.playerPosition.x) === 1 && y === this.playerPosition.y) ||
            (Math.abs(y - this.playerPosition.y) === 1 && x === this.playerPosition.x)
        );

        if (!isAdjacent) {
            this.showMessage('Можно ходить только на соседние клетки!', 'red');
            return;
        }

        // Проверяем, не стена ли
        if (this.maze[y][x].isWall) {
            this.showMessage('Это стена! Выберите другое направление.', 'red');
            return;
        }

        // Обновляем позицию игрока
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
            // Добавляем небольшую анимацию движения
            newCell.style.transform = 'scale(1.1)';
            newCell.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                if (newCell) {
                    newCell.style.transform = 'scale(1)';
                }
            }, 200);
        }

        // Проверяем, достиг ли игрок цели
        if (x === this.targetPosition.x && y === this.targetPosition.y) {
            this.showMazeSuccess();
            // Удаляем обработчик клавиш и подсказку при завершении
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
        // Рассчитываем точность пути
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

        // Определяем сообщение
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
        const container = document.getElementById('gameArea') || document.body;
        container.innerHTML = '';

        // Сбрасываем состояние
        this.maze = [];
        this.playerPosition = {x: 0, y: 0};
        this.targetPosition = {x: 0, y: 0};
        this.path = [];
        this.playerSteps = 0;
        this.mazeContainer = null;
        this.mazeCells = null;

        // Очищаем таймеры
        this.clearTimers();
        this.stopTimeLimit();

        // Создаем лабиринт заново
        this.createLightbulbs();

        if (this.core.uiManager) {
            this.core.uiManager.setActionButton('СТАРТ', () => this.beginSequence());
            this.core.uiManager.showHint(this.sublevel.description);
        }
    }
}

// Экспорт классов
if (typeof window !== 'undefined') {
    window.LevelManager = LevelManager;
    window.BaseLevelHandler = BaseLevelHandler;
    window.Level1Handler = Level1Handler;
    window.Level2Handler = Level2Handler;
    window.Level3Handler = Level3Handler;
    window.Level4Handler = Level4Handler;
    // Ссылка на текущий экземпляр для глобальной очистки
    LevelManager.currentInstance = null;
    console.log('LevelManager инициализирован с новой системой статистики');
}
