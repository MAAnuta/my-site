const DataManager = {
    STORAGE_KEYS: {
        PLAYER: 'time_coordination_player',
        PROGRESS: 'time_coordination_progress',
        TRAINING_PROGRESS: 'time_coordination_training_progress',
        RATING: 'time_coordination_rating',
        ALL_PLAYERS: 'time_coordination_all_players'
    },

    // Кэш для производительности
    _cache: {
        player: null,
        progress: null,
        trainingProgress: null,
        rating: null
    },

    ACCURACY_MULTIPLIERS: {
        100: 1.0,    // 95–100% точность = ×1.0
        95: 0.9,     // 90–94% точность = ×0.9
        90: 0.8,     // 85–89% точность = ×0.8
        80: 0.7,     // 80–84% точность = ×0.7
        0: 0.5       // <80% точность = ×0.5
    },

    // ФИКСИРОВАННЫЕ ПРОЦЕНТЫ ЗА РАУНДЫ
    ROUND_PERCENTAGES: {
        1: 0.33,  // 33% за первый раунд
        2: 0.33,  // 33% за второй раунд
        3: 0.34   // 34% за третий раунд (чтобы сумма была 100%)
    },

    // УПРАВЛЕНИЕ ДАННЫМИ ИГРОКА
    getPlayer() {
        // Проверяем кэш
        if (this._cache.player) {
            return this._cache.player;
        }

        try {
            const playerData = localStorage.getItem(this.STORAGE_KEYS.PLAYER);
            if (!playerData) return null;

            const player = JSON.parse(playerData);

            // Проверяем наличие обязательных полей и инициализируем defaults с валидацией типов
            player.id = (typeof player.id === 'string' && player.id.trim()) ? player.id : this.generatePlayerId();
            player.name = (typeof player.name === 'string' && player.name.trim()) ? player.name.trim() : 'Игрок';
            player.avatarId = (typeof player.avatarId === 'number' && player.avatarId >= 0 && player.avatarId <= 4) ? player.avatarId : 0;
            player.bestScore = (typeof player.bestScore === 'number' && player.bestScore >= 0) ? player.bestScore : 0;
            player.totalScore = (typeof player.totalScore === 'number' && player.totalScore >= 0) ? player.totalScore : 0;
            player.gamesPlayed = (typeof player.gamesPlayed === 'number' && player.gamesPlayed >= 0) ? player.gamesPlayed : 0;
            player.completedSublevels = (typeof player.completedSublevels === 'number' && player.completedSublevels >= 0) ? player.completedSublevels : 0;
            player.level = (typeof player.level === 'number' && player.level >= 1) ? player.level : this.calculatePlayerLevel(player);
            player.lastActive = (typeof player.lastActive === 'string' && !isNaN(Date.parse(player.lastActive))) ? player.lastActive : new Date().toISOString();

            // Кэшируем
            this._cache.player = player;
            return player;
        } catch (error) {
            console.error('Ошибка загрузки данных игрока:', error);
            localStorage.removeItem(this.STORAGE_KEYS.PLAYER);
            return null;
        }
    },

    // РАСЧЕТ ОЧКОВ И МАКСИМАЛЬНЫХ ЗНАЧЕНИЙ

    // Получить максимальное количество очков для подуровня
    getMaxScoreForSublevel(levelId, sublevelId) {
        const baseScores = {
            'level1': 1000,
            'level2': 1200,
            'level3': 1500,
            'level4': 2000
        };

        // Извлекаем номер подуровня из ID
        let sublevelNum;
        if (typeof sublevelId === 'string' && sublevelId.includes('-')) {
            sublevelNum = parseInt(sublevelId.split('-')[1]);
        } else {
            sublevelNum = parseInt(sublevelId);
        }

        // Базовые очки для уровня
        const baseScore = baseScores[levelId] || 1000;

        // Бонус сложности
        const difficultyBonus = 1.0 + (sublevelNum - 1) * 0.1;

        // Максимальный множитель точности = 1.0
        const maxAccuracyMultiplier = 1.0;

        // Максимум = базовые_очки × 1.0 × бонус_сложности
        const maxScore = Math.round(baseScore * maxAccuracyMultiplier * difficultyBonus);

        return maxScore;
    },

    // Получить минимальный проход для подуровня (80% от максимума)
    getMinPassingScore(levelId, sublevelId) {
        const maxScore = this.getMaxScoreForSublevel(levelId, sublevelId);
        return Math.round(maxScore * 0.8);
    },


    // Получить прогресс игрока с ограничением по максимуму
    getSublevelProgress(levelId, sublevelId) {
        const progress = this.getProgress();
        const rawScore = parseInt(progress?.[levelId]?.[sublevelId]) || 0;
        const maxScore = this.getMaxScoreForSublevel(levelId, sublevelId);

        // Ограничиваем очки максимумом (на случай старых данных)
        const score = Math.min(rawScore, maxScore);
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        const isPassed = percentage >= 80;

        return {
            score,
            maxScore,
            percentage: Math.round(percentage),
            isPassed
        };
    },

    // Получить номер подуровня из ID
    getSublevelNumber(sublevelId) {
        // Поддержка форматов: "level1-2", "1-2", или число
        if (typeof sublevelId === 'string') {
            // Проверяем формат "levelX-Y"
            const levelPattern = /^level\d+-\d+$/;
            if (levelPattern.test(sublevelId)) {
                const parts = sublevelId.split('-');
                const num = parseInt(parts[1]);
                return isNaN(num) ? 1 : num;
            }

            // Проверяем формат "X-Y"
            const simplePattern = /^\d+-\d+$/;
            if (simplePattern.test(sublevelId)) {
                const parts = sublevelId.split('-');
                const num = parseInt(parts[1]);
                return isNaN(num) ? 1 : num;
            }

            // Пытаемся распарсить как число
            const num = parseInt(sublevelId);
            return isNaN(num) ? 1 : num;
        }
        return typeof sublevelId === 'number' ? sublevelId : 1;
    },

    // Получить множитель точности
    getAccuracyMultiplier(accuracy) {
        if (accuracy >= 95) return this.ACCURACY_MULTIPLIERS[100]; // 95-100% = ×1.0
        if (accuracy >= 90) return this.ACCURACY_MULTIPLIERS[95];  // 90-94% = ×0.9
        if (accuracy >= 85) return this.ACCURACY_MULTIPLIERS[90];  // 85-89% = ×0.8
        if (accuracy >= 80) return this.ACCURACY_MULTIPLIERS[80];  // 80-84% = ×0.7
        return this.ACCURACY_MULTIPLIERS[0]; // <80% = ×0.5
    },

    // Рассчитать очки за уровень с учетом всех модификаторов
    calculateScore(levelId, sublevelId, accuracy, timeBonus = 1.0, roundNumber = null) {
        const baseScores = {
            'level1': 1000,
            'level2': 1200,
            'level3': 1500,
            'level4': 2000
        };

        // Получаем базовые очки
        const baseScore = baseScores[levelId] || 1000;

        // Получаем номер подуровня корректно
        const sublevelNum = this.getSublevelNumber(sublevelId);
        const difficultyBonus = 1.0 + (sublevelNum - 1) * 0.1;

        // Максимум для всего подуровня
        const maxSublevelScore = Math.round(baseScore * 1.0 * difficultyBonus);

        // Если это расчет за раунд
        if (roundNumber !== null && roundNumber >= 1 && roundNumber <= 3) {
            // Используем фиксированный процент для этого раунда
            const roundPercentage = this.ROUND_PERCENTAGES[roundNumber] || 0.33;
            const maxScoreForRound = Math.round(maxSublevelScore * roundPercentage);

            // Рассчитываем очки за раунд
            const accuracyMultiplier = this.getAccuracyMultiplier(accuracy);
            const effectiveTimeBonus = accuracy >= 80 ? timeBonus : 1.0;

            // Расчет: максимум_раунда × точность × бонус_времени
            let roundScore = Math.round(maxScoreForRound * accuracyMultiplier * effectiveTimeBonus);

            // Ограничиваем максимумом для раунда
            roundScore = Math.min(roundScore, maxScoreForRound);

            return {
                finalScore: roundScore,
                roundNumber: roundNumber,
                breakdown: {
                    maxScoreForRound,
                    maxSublevelScore,
                    roundPercentage: roundPercentage * 100,
                    accuracy,
                    accuracyMultiplier,
                    timeBonus: effectiveTimeBonus,
                    difficultyBonus
                }
            };
        } else {
            // Расчет за весь подуровень (сумма всех раундов)
            const accuracyMultiplier = this.getAccuracyMultiplier(accuracy);
            const effectiveTimeBonus = accuracy >= 80 ? timeBonus : 1.0;

            let finalScore = Math.round(baseScore * accuracyMultiplier * difficultyBonus * effectiveTimeBonus);

            // Ограничиваем максимумом подуровня
            finalScore = Math.min(finalScore, maxSublevelScore);

            return {
                finalScore,
                breakdown: {
                    baseScore,
                    accuracy,
                    accuracyMultiplier,
                    difficultyBonus,
                    timeBonus: effectiveTimeBonus,
                    maxSublevelScore
                }
            };
        }
    },

    // Получить максимальное количество очков для раунда
    getMaxScoreForRound(levelId, sublevelId, roundNumber) {
        if (roundNumber < 1 || roundNumber > 3) return 0;

        // Максимум для подуровня
        const maxForSublevel = this.getMaxScoreForSublevel(levelId, sublevelId);

        // Процент для этого раунда
        const roundPercentage = this.ROUND_PERCENTAGES[roundNumber] || 0.33;

        // Максимум за раунд
        return Math.round(maxForSublevel * roundPercentage);
    },

    // ПРОВЕРКА РАЗБЛОКИРОВКИ УРОВНЕЙ

    // Проверка пройден ли подуровень на заданный процент
    isSublevelCompleted(levelId, sublevelId, threshold = 0.8) {
        const progress = this.getProgress();
        if (!progress || !progress[levelId]) return false;

        const score = progress[levelId][sublevelId] || 0;
        if (score <= 0) return false; // нет прогресса — не пройден

        const maxScore = this.getMaxScoreForSublevel(levelId, sublevelId);
        const isScorePassed = score >= maxScore * threshold;

        return isScorePassed;
    },

    // Проверить, пройден ли уровень на заданный процент
    // Уровень считается завершенным, если каждый подуровень имеет score >= maxScore * threshold
    isLevelCompleted(levelId, threshold = 0.8) {
        // Получаем количество подуровней в уровне
        const totalSublevels = this.getTotalSublevelsForLevel(levelId);

        const progress = this.getProgress();
        const levelData = progress ? progress[levelId] : null;

        // Проверяем каждый подуровень уровня
        for (let i = 1; i <= totalSublevels; i++) {
            const sublevelId = `${levelId.replace('level', '')}-${i}`;
            const score = levelData ? (levelData[sublevelId] || 0) : 0;
            const maxScore = this.getMaxScoreForSublevel(levelId, sublevelId);
            const requiredScore = maxScore * threshold;

            // Если хотя бы один подуровень не пройден с требуемым порогом, уровень не завершен
            if (score < requiredScore) {
                return false;
            }
        }

        return true;
    },

    // Получить общее количество подуровней в уровне
    getTotalSublevelsForLevel(levelId) {
        // Используем данные из конфигурации уровней
        switch (levelId) {
            case 'level1': return 3;
            case 'level2': return 3;
            case 'level3': return 2;
            case 'level4': return 1;
            default: return 0;
        }
    },

    // Проверка доступен ли подуровень
    isSublevelAvailable(levelId, sublevelId) {
        const levelNum = parseInt(levelId.replace('level', ''));
        const sublevelNum = this.getSublevelNumber(sublevelId);

        // Уровень 1 подуровень 1 всегда доступен
        if (levelId === 'level1' && sublevelId === '1-1') {
            return true;
        }

        // Если это НЕ первый подуровень - проверяем предыдущий в том же уровне
        if (sublevelNum > 1) {
            const prevSublevelId = this.getPrevSublevelId(levelId, sublevelId);
            if (!prevSublevelId) return false;
            return this.isSublevelCompleted(levelId, prevSublevelId, 0.8);
        }

        // Для 1 подуровня уровня (>level1): проверяем последний подуровень предыдущего уровня
        const prevLevelId = `level${levelNum - 1}`;
        const totalSubsPrev = this.getTotalSublevelsForLevel(prevLevelId);
        const expectedLastSubId = `${levelNum - 1}-${totalSubsPrev}`;

        const progress = this.getProgress();
        const prevLevelProgress = progress ? progress[prevLevelId] : null;
        if (!prevLevelProgress) return false;

        // Проверяем конкретно последний подуровень prev уровня
        return this.isSublevelCompleted(prevLevelId, expectedLastSubId, 0.8);
    },

    // Получить ID предыдущего подуровня
    getPrevSublevelId(levelId, sublevelId) {
        const sublevelNum = this.getSublevelNumber(sublevelId);
        if (sublevelNum <= 1) return null;

        const levelNum = levelId.replace('level', '');
        return `${levelNum}-${sublevelNum - 1}`;
    },

    // УПРАВЛЕНИЕ ПРОГРЕССОМ

    // Сохранить прогресс с учетом режима игры
    saveProgress(levelId, sublevelId, score, accuracy, mode = 'classic', playerId = null) {
        try {
            // sublevelId к формату "X-Y"
            if (typeof sublevelId === 'number' || /^[0-9]+$/.test(sublevelId)) {
                sublevelId = `${levelId.replace('level', '')}-${sublevelId}`;
            }

            // Для тренировки сохраняем в отдельное хранилище
            if (mode === 'training') {
                return this.saveTrainingProgress(levelId, sublevelId, score, accuracy);
            }

            // Получаем текущего игрока
            const currentPlayer = playerId ? { id: playerId } : this.getPlayer();
            if (!currentPlayer || !currentPlayer.id) {
                console.warn('Игрок не найден, прогресс не сохранен');
                return false;
            }

            // Загружаем весь прогресс всех игроков
            const progressData = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            const allProgress = progressData ? JSON.parse(progressData) : {};

            // Получаем прогресс текущего игрока
            const playerProgress = allProgress[currentPlayer.id] || {};

            // Инициализируем уровень если его нет
            if (!playerProgress[levelId]) {
                playerProgress[levelId] = {};
            }

            // Сохраняем только если результат лучше предыдущего
            const currentScore = playerProgress[levelId][sublevelId] || 0;
            if (score > currentScore) {
                playerProgress[levelId][sublevelId] = score;

                // Дополнительно сохраняем точность и дату
                playerProgress[levelId][`${sublevelId}_accuracy`] = accuracy;
                playerProgress[levelId][`${sublevelId}_date`] = new Date().toISOString();
                playerProgress[levelId][`${sublevelId}_mode`] = mode;
            }

            // Сохраняем прогресс игрока обратно
            allProgress[currentPlayer.id] = playerProgress;

            // Сохраняем весь прогресс в хранилище
            localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));

            // Обновляем статистику игрока только для классической игры
            this.updatePlayerStats();

            return true;
        } catch (error) {
            console.error('Ошибка сохранения прогресса:', error);
            return false;
        }
    },

    // Сохранить прогресс тренировки
    saveTrainingProgress(levelId, sublevelId, score, accuracy) {
        try {
            // Нормализуем sublevelId к формату "X-Y"
            if (typeof sublevelId === 'number' || /^[0-9]+$/.test(sublevelId)) {
                sublevelId = `${levelId.replace('level', '')}-${sublevelId}`;
            }

            // Получаем текущего игрока
            const currentPlayer = this.getPlayer();
            if (!currentPlayer || !currentPlayer.id) {
                console.warn('Игрок не найден, тренировочный прогресс не сохранен');
                return false;
            }

            // Загружаем весь тренировочный прогресс всех игроков
            const progressData = localStorage.getItem(this.STORAGE_KEYS.TRAINING_PROGRESS);
            const allProgress = progressData ? JSON.parse(progressData) : {};

            // Получаем тренировочный прогресс текущего игрока
            const playerProgress = allProgress[currentPlayer.id] || {};

            // Инициализируем уровень если его нет
            if (!playerProgress[levelId]) {
                playerProgress[levelId] = {};
            }

            // Сохраняем только лучший результат
            const currentScore = playerProgress[levelId][sublevelId] || 0;
            if (score > currentScore) {
                playerProgress[levelId][sublevelId] = score;
                playerProgress[levelId][`${sublevelId}_accuracy`] = accuracy;
                playerProgress[levelId][`${sublevelId}_date`] = new Date().toISOString();
                playerProgress[levelId][`${sublevelId}_mode`] = 'training';
            }

            // Сохраняем прогресс игрока обратно
            allProgress[currentPlayer.id] = playerProgress;

            // Сохраняем весь тренировочный прогресс в хранилище
            localStorage.setItem(this.STORAGE_KEYS.TRAINING_PROGRESS, JSON.stringify(allProgress));

            return true;
        } catch (error) {
            console.error('Ошибка сохранения прогресса тренировки:', error);
            return false;
        }
    },

    // Получить прогресс тренировки

    getTrainingProgress(playerId = null) {
        try {
            const progressData = localStorage.getItem(this.STORAGE_KEYS.TRAINING_PROGRESS);
            const allProgress = progressData ? JSON.parse(progressData) : {};

            if (playerId) {
                return allProgress[playerId] || {};
            }

            const currentPlayer = this.getPlayer();
            if (currentPlayer && currentPlayer.id) {
                return allProgress[currentPlayer.id] || {};
            }

            return {};
        } catch (error) {
            console.error('Ошибка загрузки прогресса тренировки:', error);
            return {};
        }
    },

    // Получить лучший результат для подуровня (из любого режима)
    getBestScore(levelId, sublevelId) {
        const classicProgress = this.getProgress();
        const trainingProgress = this.getTrainingProgress();

        const classicScore = classicProgress[levelId]?.[sublevelId] || 0;
        const trainingScore = trainingProgress[levelId]?.[sublevelId] || 0;

        return Math.max(classicScore, trainingScore);
    },

    // Еще всякие методы

    savePlayer(name, avatarId = 0, isNew = false) {
        try {
            const trimmedName = name.trim();
            const currentPlayer = this.getPlayer();

            // Проверяем уникальность имени при создании нового профиля
            if (isNew || !currentPlayer?.id) {
                const existingPlayers = this.getAllPlayers();
                // Проверяем, есть ли игрок с таким именем (исключая текущего игрока, если он есть)
                const nameExists = existingPlayers.some(p =>
                    p.name.toLowerCase() === trimmedName.toLowerCase() &&
                    (!currentPlayer || p.id !== currentPlayer.id) // Исключаем текущего игрока из проверки
                );

                if (nameExists) {
                    return {
                        success: false,
                        error: 'Игрок с таким именем уже существует. Пожалуйста, выберите другое имя.'
                    };
                }
            }

            let player = currentPlayer || {};

            // Базовые данные
            player.name = trimmedName;
            player.avatarId = parseInt(avatarId) || 0;

            // Генерируем новый ID если это новый игрок или его нет
            if (isNew || !player.id) {
                player.id = this.generatePlayerId();
                console.log('Сгенерирован новый ID игрока:', player.id);

                // Для нового игрока инициализируем статистику
                player.gamesPlayed = 0;
                player.bestScore = 0;
                player.totalScore = 0;
                player.completedSublevels = 0;
                player.level = 1;
                player.lastActive = new Date().toISOString();
            }

            // Обновляем дату последней активности
            player.lastActive = new Date().toISOString();

            // Сохраняем
            this.savePlayerData(player);

            // Добавляем/обновляем игрока в списке всех игроков
            this.addToAllPlayers(player);

            return {
                success: true,
                player: player
            };
        } catch (error) {
            console.error('Ошибка сохранения игрока:', error);
            return {
                success: false,
                error: 'Ошибка сохранения профиля. Попробуйте еще раз.'
            };
        }
    },

    // УПРАВЛЕНИЕ НЕСКОЛЬКИМИ ПРОФИЛЯМИ

    // Получить список всех игроков
    getAllPlayers() {
        try {
            const allPlayersData = localStorage.getItem(this.STORAGE_KEYS.ALL_PLAYERS);
            if (!allPlayersData) return [];

            const players = JSON.parse(allPlayersData);

            return players.sort((a, b) => {
                const dateA = new Date(a.lastActive || 0);
                const dateB = new Date(b.lastActive || 0);
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Ошибка загрузки списка игроков:', error);
            return [];
        }
    },

    // Добавить или обновить игрока в списке всех игроков
    addToAllPlayers(player) {
        try {
            if (!player || !player.id) return;

            const allPlayers = this.getAllPlayers();

            // Ищем существующего игрока
            const existingIndex = allPlayers.findIndex(p => p.id === player.id);

            // Создаем упрощенную версию игрока для списка
            const playerSummary = {
                id: player.id,
                name: player.name,
                avatarId: player.avatarId || 0,
                lastActive: player.lastActive || new Date().toISOString(),
                level: player.level || 1,
                gamesPlayed: player.gamesPlayed || 0,
                bestScore: player.bestScore || 0,
                totalScore: player.totalScore || 0,
                completedSublevels: player.completedSublevels || 0
            };

            if (existingIndex >= 0) {
                // Обновляем существующего игрока
                allPlayers[existingIndex] = playerSummary;
            } else {
                // Добавляем нового игрока
                allPlayers.push(playerSummary);
            }

            // Сортируем по дате последней активности (новые сверху)
            allPlayers.sort((a, b) => {
                const dateA = new Date(a.lastActive || 0);
                const dateB = new Date(b.lastActive || 0);
                return dateB - dateA;
            });

            // Сохраняем список
            localStorage.setItem(this.STORAGE_KEYS.ALL_PLAYERS, JSON.stringify(allPlayers));
        } catch (error) {
            console.error('Ошибка добавления игрока в список:', error);
        }
    },

    // Переключиться на другой профиль
    switchPlayer(playerId) {
        try {
            const allPlayers = this.getAllPlayers();
            const player = allPlayers.find(p => p.id === playerId);

            if (!player) {
                console.warn('Игрок не найден:', playerId);
                return false;
            }

            // Загружаем полные данные игрока из прогресса
            const progress = this.getProgress(playerId);
            const trainingProgress = this.getTrainingProgress(playerId);

            // Восстанавливаем полные данные игрока
            const fullPlayer = {
                ...player,
            };

            // Сохраняем как текущего игрока
            this.savePlayerData(fullPlayer);

            // Обновляем дату последней активности
            fullPlayer.lastActive = new Date().toISOString();
            this.addToAllPlayers(fullPlayer);

            console.log('Переключение на игрока:', player.name);
            return true;
        } catch (error) {
            console.error('Ошибка переключения игрока:', error);
            return false;
        }
    },

    // Выйти из текущего профиля (без удаления прогресса)
    logout() {
        try {
            // Сохраняем текущего игрока в список всех игроков перед выходом
            const current = this.getPlayer();
            if (current) {
                this.addToAllPlayers(current);
            }

            // Очищаем только текущего игрока
            localStorage.removeItem(this.STORAGE_KEYS.PLAYER);
            this._cache.player = null;

            console.log('Выход из профиля выполнен');
            return true;
        } catch (error) {
            console.error('Ошибка выхода из профиля:', error);
            return false;
        }
    },

    // Удалить профиль (с подтверждением)
    deletePlayer(playerId) {
        try {
            // Удаляем из списка всех игроков
            const allPlayers = this.getAllPlayers();
            const filteredPlayers = allPlayers.filter(p => p.id !== playerId);
            localStorage.setItem(this.STORAGE_KEYS.ALL_PLAYERS, JSON.stringify(filteredPlayers));

            // Если это текущий игрок, очищаем его
            const current = this.getPlayer();
            if (current && current.id === playerId) {
                this.logout();
            }

            // Удаляем прогресс игрока
            const progress = this.getProgress();
            const allProgress = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            if (allProgress) {
                const parsedProgress = JSON.parse(allProgress);
                delete parsedProgress[playerId];
                localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(parsedProgress));
            }

            // Удаляем тренировочный прогресс игрока
            const trainingProgress = this.getTrainingProgress();
            const allTrainingProgress = localStorage.getItem(this.STORAGE_KEYS.TRAINING_PROGRESS);
            if (allTrainingProgress) {
                const parsedTrainingProgress = JSON.parse(allTrainingProgress);
                delete parsedTrainingProgress[playerId];
                localStorage.setItem(this.STORAGE_KEYS.TRAINING_PROGRESS, JSON.stringify(parsedTrainingProgress));
            }

            console.log('Профиль удален:', playerId);
            return true;
        } catch (error) {
            console.error('Ошибка удаления профиля:', error);
            return false;
        }
    },

    updatePlayerStats(player = null) {
        try {
            const currentPlayer = player || this.getPlayer();
            if (!currentPlayer) return;

            const progress = this.getProgress(); // Только классический прогресс

            // Пересчитываем статистику только из классической игры
            let totalSublevelsCompleted = 0;
            let bestScore = 0;
            let totalScore = 0;
            let gamesPlayed = currentPlayer.gamesPlayed || 0;

            Object.keys(progress).forEach(levelKey => {
                const levelProgress = progress[levelKey];
                if (levelProgress) {
                    Object.keys(levelProgress).forEach(key => {
                        // Пропускаем служебные поля
                        if (!key.includes('_')) {
                            const score = levelProgress[key];
                            if (score && score > 0) {
                                // Проверяем, что это классическая игра
                                const mode = levelProgress[`${key}_mode`] || 'classic';
                                if (mode === 'classic') { // ТОЛЬКО КЛАССИКА!
                                    totalSublevelsCompleted++;
                                    totalScore += score;
                                    if (score > bestScore) {
                                        bestScore = score;
                                    }
                                }
                            }
                        }
                    });
                }
            });

            // Обновляем данные игрока
            currentPlayer.completedSublevels = totalSublevelsCompleted;
            currentPlayer.bestScore = Math.max(currentPlayer.bestScore || 0, bestScore);
            currentPlayer.totalScore = totalScore;
            currentPlayer.gamesPlayed = gamesPlayed;

            // Пересчитываем уровень
            currentPlayer.level = this.calculatePlayerLevel(currentPlayer);

            // Сохраняем обновленные данные
            this.savePlayerData(currentPlayer);

            return currentPlayer;
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
            return null;
        }
    },

    // Обновить статистику после игры в классическом режиме
    updatePlayerStatsAfterGame(score, mode = 'classic') {
        try {
            const player = this.getPlayer();
            if (!player) return;

            // Увеличиваем счетчик игр ТОЛЬКО для классической игры
            if (mode === 'classic') {
                player.gamesPlayed = (player.gamesPlayed || 0) + 1;

                // Обновляем лучший счет
                if (score > (player.bestScore || 0)) {
                    player.bestScore = score;
                }

                // Обновляем общий счет (только классика!)
                player.totalScore = (player.totalScore || 0) + score;
            }

            // Пересчитываем уровень игрока (всегда)
            player.level = this.calculatePlayerLevel(player);

            // Обновляем дату последней активности
            player.lastActive = new Date().toISOString();

            // Сохраняем
            this.savePlayerData(player);

            return player;
        } catch (error) {
            console.error('Ошибка обновления статистики после игры:', error);
            return null;
        }
    },

    updatePlayerStatsAfterClassicGame(score) {
        // Алиас для обратной совместимости
        return this.updatePlayerStatsAfterGame(score, 'classic');
    },

    // УПРАВЛЕНИЕ РЕЙТИНГОМ (КЛАССИЧЕСКАЯ ИГРА)
    saveRatingEntry(name, lastGameScore, accuracy, avatarId = 0, mode = 'classic') {
        try {
            if (mode !== 'classic') return null;

            const rating = this.getRawRating();
            const player = this.getPlayer();
            const playerId = player?.id || this.generatePlayerId();

            // Получаем ВСЕ очки игрока из прогресса
            const playerProgress = this.getProgress(playerId);
            let totalPlayerScore = 0;
            let bestSingleScore = 0;
            let totalGames = 0;

            // Суммируем все очки из классической игры
            Object.keys(playerProgress).forEach(levelKey => {
                const levelProgress = playerProgress[levelKey];
                if (levelProgress) {
                    Object.keys(levelProgress).forEach(key => {
                        if (!key.includes('_')) {
                            const scoreValue = levelProgress[key];
                            if (scoreValue && scoreValue > 0) {
                                const mode = levelProgress[`${key}_mode`] || 'classic';
                                if (mode === 'classic') {
                                    totalPlayerScore += Number(scoreValue);
                                    totalGames++;
                                    if (scoreValue > bestSingleScore) {
                                        bestSingleScore = scoreValue;
                                    }
                                }
                            }
                        }
                    });
                }
            });

            let existingEntry = rating.find(entry => entry.id === playerId);

            if (existingEntry) {
                // Обновляем с актуальными данными
                existingEntry.name = name;
                existingEntry.totalScore = totalPlayerScore; // Сумма всех очков
                existingEntry.bestScore = Math.max(existingEntry.bestScore || 0, bestSingleScore, lastGameScore);
                existingEntry.averageAccuracy = (
                    (existingEntry.averageAccuracy || 0) * existingEntry.gamesPlayed +
                    Number(accuracy)
                ) / (existingEntry.gamesPlayed + 1);
                existingEntry.avatarId = Number(avatarId) || 0;
                existingEntry.lastPlayed = new Date().toISOString();
                existingEntry.gamesPlayed = totalGames;
                existingEntry.lastGameScore = lastGameScore;
            } else {
                rating.push({
                    id: playerId,
                    name: name,
                    totalScore: totalPlayerScore, // Сумма всех очков
                    bestScore: Math.max(bestSingleScore, lastGameScore),
                    averageAccuracy: Number(accuracy),
                    avatarId: Number(avatarId) || 0,
                    lastPlayed: new Date().toISOString(),
                    gamesPlayed: totalGames || 1,
                    lastGameScore: lastGameScore
                });
            }

            // Сортируем по totalScore (общей сумме очков)
            rating.sort((a, b) => b.totalScore - a.totalScore);
            const top50 = rating.slice(0, 50);
            localStorage.setItem(this.STORAGE_KEYS.RATING, JSON.stringify(top50));

            return true;
        } catch (error) {
            console.error('Ошибка сохранения рейтинга:', error);
            return false;
        }
    },

    getRawRating() {
        try {
            const ratingData = localStorage.getItem(this.STORAGE_KEYS.RATING);
            return ratingData ? JSON.parse(ratingData) : [];
        } catch (error) {
            console.error('Ошибка загрузки сырых данных рейтинга:', error);
            return [];
        }
    },

    getRating() {
        try {
            const ratingData = localStorage.getItem(this.STORAGE_KEYS.RATING);
            const rating = ratingData ? JSON.parse(ratingData) : [];

            // Обновляем totalScore для всех игроков в рейтинге
            const updatedRating = rating.map(player => {
                // Получаем актуальную сумму очков из прогресса игрока
                const playerProgress = this.getProgress(player.id);
                let totalPlayerScore = 0;

                Object.keys(playerProgress).forEach(levelKey => {
                    const levelProgress = playerProgress[levelKey];
                    if (levelProgress) {
                        Object.keys(levelProgress).forEach(key => {
                            if (!key.includes('_')) {
                                const scoreValue = levelProgress[key];
                                if (scoreValue && scoreValue > 0) {
                                    const mode = levelProgress[`${key}_mode`] || 'classic';
                                    if (mode === 'classic') {
                                        totalPlayerScore += Number(scoreValue);
                                    }
                                }
                            }
                        });
                    }
                });

                return {
                    ...player,
                    totalScore: totalPlayerScore || player.totalScore || 0
                };
            });

            // Сортируем по обновленному totalScore
            updatedRating.sort((a, b) => b.totalScore - a.totalScore);

            return updatedRating
                .filter(player => player.totalScore && player.totalScore > 0)
                .map((player, index) => ({
                    rank: index + 1,
                    name: player.name,
                    score: player.totalScore, // Общая сумма очков
                    lastGameScore: player.lastGameScore || 0, // Счет последней игры
                    accuracy: parseFloat((player.averageAccuracy || 0).toFixed(1)),
                    date: player.lastPlayed || new Date().toISOString(),
                    gamesPlayed: player.gamesPlayed || 1,
                    bestScore: player.bestScore || 0,
                    avatarId: player.avatarId || 0
                }));
        } catch (error) {
            console.error('Ошибка загрузки рейтинга:', error);
            return [];
        }
    },

    // При завершении уровня в классическом режиме
    updateRatingAfterGame(levelId, sublevelId, finalScore, accuracy) {
        try {
            const player = this.getPlayer();
            if (!player) {
                console.warn('Игрок не авторизован, рейтинг не обновлен');
                return false;
            }

            // Сначала сохраняем прогресс
            this.saveProgress(levelId, sublevelId, finalScore, accuracy, 'classic', player.id);

            // Обновляем статистику игрока
            this.updatePlayerStatsAfterClassicGame(finalScore);

            // Обновляем рейтинг с актуальными данными
            this.saveRatingEntry(
                player.name,
                finalScore,
                accuracy,
                player.avatarId || 0,
                'classic'
            );

            return true;
        } catch (error) {
            console.error('Ошибка обновления рейтинга после игры:', error);
            return false;
        }
    },

    getPlayerStats() {
        const player = this.getPlayer();
        const progress = this.getProgress(); // Только классический прогресс

        if (!player) {
            console.log('Игрок не найден в localStorage');
            return null;
        }

        // Пересчитываем статистику ТОЛЬКО из классической игры
        let totalSublevelsCompleted = 0;
        let bestScore = 0;
        let totalScore = 0;

        Object.keys(progress).forEach(levelKey => {
            const levelProgress = progress[levelKey];
            if (levelProgress) {
                Object.keys(levelProgress).forEach(key => {
                    // Пропускаем служебные поля (_accuracy, _date, _mode)
                    if (!key.includes('_')) {
                        const score = levelProgress[key];
                        if (score && score > 0) {
                            // Проверяем режим - ТОЛЬКО КЛАССИЧЕСКАЯ ИГРА!
                            const mode = levelProgress[`${key}_mode`] || 'classic';
                            if (mode === 'classic') {
                                totalSublevelsCompleted++;
                                totalScore += score;
                                if (score > bestScore) {
                                    bestScore = score;
                                }
                            }
                        }
                    }
                });
            }
        });

        const stats = {
            name: player.name,
            avatarId: player.avatarId || 0,
            level: player.level || 1,
            levelName: this.getLevelName(player.level || 1),
            gamesPlayed: player.gamesPlayed || 0, // gamesPlayed уже учитывает только классику
            completedSublevels: totalSublevelsCompleted,
            bestScore: bestScore,
            totalScore: totalScore,
            lastActive: player.lastActive || player.updatedAt
        };

        return stats;
    },

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
    getProgress(playerId = null) {
        try {
            const progressData = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            if (!progressData) return {};

            const allProgress = JSON.parse(progressData);

            // Если указан playerId, возвращаем прогресс конкретного игрока
            if (playerId) {
                return allProgress[playerId] || {};
            }

            // Для обратной совместимости - возвращаем прогресс текущего игрока
            const currentPlayer = this.getPlayer();
            if (currentPlayer && currentPlayer.id) {
                return allProgress[currentPlayer.id] || {};
            }

            // Если игрок не найден, возвращаем пустой объект
            return {};
        } catch (error) {
            console.error('Ошибка загрузки прогресса:', error);
            // При повреждении JSON очищаем данные
            localStorage.removeItem(this.STORAGE_KEYS.PROGRESS);
            return {};
        }
    },

    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    calculatePlayerLevel(player) {
        if (!player || !player.gamesPlayed) return 1;

        const games = player.gamesPlayed;

        if (games >= 50) return 5;      // Мастер
        if (games >= 30) return 4;      // Эксперт
        if (games >= 15) return 3;      // Продвинутый
        if (games >= 5) return 2;       // Опытный
        return 1;                       // Новичок
    },

    getLevelName(level) {
        const levelNames = {
            1: 'Новичок',
            2: 'Опытный',
            3: 'Продвинутый',
            4: 'Эксперт',
            5: 'Мастер'
        };
        return levelNames[level] || 'Новичок';
    },

    savePlayerData(player) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.PLAYER, JSON.stringify(player));
            // Инвалидируем кэш
            this._cache.player = null;
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных игрока:', error);
            return false;
        }
    },
};
