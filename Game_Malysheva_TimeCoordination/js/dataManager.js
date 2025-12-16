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

    // Управление данными игрока
    getPlayer() {
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

    // Расчет очков и максимальных значений
    // Получить максимальное количество очков для подуровня
    getMaxScoreForSublevel(levelId, sublevelId) {
        const baseScores = {
            'level1': 1000,
            'level2': 1200,
            'level3': 1500,
            'level4': 2000
        };

        let sublevelNum;
        if (typeof sublevelId === 'string' && sublevelId.includes('-')) {
            sublevelNum = parseInt(sublevelId.split('-')[1]);
        } else {
            sublevelNum = parseInt(sublevelId);
        }

        const baseScore = baseScores[levelId] || 1000;

        const difficultyBonus = 1.0 + (sublevelNum - 1) * 0.1;

        const maxAccuracyMultiplier = 1.0;

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
        if (typeof sublevelId === 'string') {
            const levelPattern = /^level\d+-\d+$/;
            if (levelPattern.test(sublevelId)) {
                const parts = sublevelId.split('-');
                const num = parseInt(parts[1]);
                return isNaN(num) ? 1 : num;
            }

            const simplePattern = /^\d+-\d+$/;
            if (simplePattern.test(sublevelId)) {
                const parts = sublevelId.split('-');
                const num = parseInt(parts[1]);
                return isNaN(num) ? 1 : num;
            }

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

        const baseScore = baseScores[levelId] || 1000;

        const sublevelNum = this.getSublevelNumber(sublevelId);
        const difficultyBonus = 1.0 + (sublevelNum - 1) * 0.1;

        const maxSublevelScore = Math.round(baseScore * 1.0 * difficultyBonus);

        if (roundNumber !== null && roundNumber >= 1 && roundNumber <= 3) {
            const roundPercentage = this.ROUND_PERCENTAGES[roundNumber] || 0.33;
            const maxScoreForRound = Math.round(maxSublevelScore * roundPercentage);

            const accuracyMultiplier = this.getAccuracyMultiplier(accuracy);
            const effectiveTimeBonus = accuracy >= 80 ? timeBonus : 1.0;

            let roundScore = Math.round(maxScoreForRound * accuracyMultiplier * effectiveTimeBonus);

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
            const accuracyMultiplier = this.getAccuracyMultiplier(accuracy);
            const effectiveTimeBonus = accuracy >= 80 ? timeBonus : 1.0;

            let finalScore = Math.round(baseScore * accuracyMultiplier * difficultyBonus * effectiveTimeBonus);

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

    getMaxScoreForRound(levelId, sublevelId, roundNumber) {
        if (roundNumber < 1 || roundNumber > 3) return 0;

        const maxForSublevel = this.getMaxScoreForSublevel(levelId, sublevelId);

        const roundPercentage = this.ROUND_PERCENTAGES[roundNumber] || 0.33;

        return Math.round(maxForSublevel * roundPercentage);
    },

    // Проверка разблокировки уровней

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
    isLevelCompleted(levelId, threshold = 0.8) {
        const totalSublevels = this.getTotalSublevelsForLevel(levelId);

        const progress = this.getProgress();
        const levelData = progress ? progress[levelId] : null;

        for (let i = 1; i <= totalSublevels; i++) {
            const sublevelId = `${levelId.replace('level', '')}-${i}`;
            const score = levelData ? (levelData[sublevelId] || 0) : 0;
            const maxScore = this.getMaxScoreForSublevel(levelId, sublevelId);
            const requiredScore = maxScore * threshold;

            if (score < requiredScore) {
                return false;
            }
        }

        return true;
    },

    getTotalSublevelsForLevel(levelId) {
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

        if (levelId === 'level1' && sublevelId === '1-1') {
            return true;
        }

        if (sublevelNum > 1) {
            const prevSublevelId = this.getPrevSublevelId(levelId, sublevelId);
            if (!prevSublevelId) return false;
            return this.isSublevelCompleted(levelId, prevSublevelId, 0.8);
        }

        const prevLevelId = `level${levelNum - 1}`;
        const totalSubsPrev = this.getTotalSublevelsForLevel(prevLevelId);
        const expectedLastSubId = `${levelNum - 1}-${totalSubsPrev}`;

        const progress = this.getProgress();
        const prevLevelProgress = progress ? progress[prevLevelId] : null;
        if (!prevLevelProgress) return false;

        return this.isSublevelCompleted(prevLevelId, expectedLastSubId, 0.8);
    },

    // Получить ID предыдущего подуровня
    getPrevSublevelId(levelId, sublevelId) {
        const sublevelNum = this.getSublevelNumber(sublevelId);
        if (sublevelNum <= 1) return null;

        const levelNum = levelId.replace('level', '');
        return `${levelNum}-${sublevelNum - 1}`;
    },

    // Управление прогрессом

    // Сохранить прогресс с учетом режима игры
    saveProgress(levelId, sublevelId, score, accuracy, mode = 'classic', playerId = null) {
        try {
            if (typeof sublevelId === 'number' || /^[0-9]+$/.test(sublevelId)) {
                sublevelId = `${levelId.replace('level', '')}-${sublevelId}`;
            }

            if (mode === 'training') {
                return this.saveTrainingProgress(levelId, sublevelId, score, accuracy);
            }

            const currentPlayer = playerId ? { id: playerId } : this.getPlayer();
            if (!currentPlayer || !currentPlayer.id) {
                console.warn('Игрок не найден, прогресс не сохранен');
                return false;
            }

            const progressData = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            const allProgress = progressData ? JSON.parse(progressData) : {};

            const playerProgress = allProgress[currentPlayer.id] || {};
            if (!playerProgress[levelId]) {
                playerProgress[levelId] = {};
            }

            const currentScore = playerProgress[levelId][sublevelId] || 0;
            if (score > currentScore) {
                playerProgress[levelId][sublevelId] = score;

                playerProgress[levelId][`${sublevelId}_accuracy`] = accuracy;
                playerProgress[levelId][`${sublevelId}_date`] = new Date().toISOString();
                playerProgress[levelId][`${sublevelId}_mode`] = mode;
            }

            allProgress[currentPlayer.id] = playerProgress;

            localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));

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
            if (typeof sublevelId === 'number' || /^[0-9]+$/.test(sublevelId)) {
                sublevelId = `${levelId.replace('level', '')}-${sublevelId}`;
            }

            const currentPlayer = this.getPlayer();
            if (!currentPlayer || !currentPlayer.id) {
                console.warn('Игрок не найден, тренировочный прогресс не сохранен');
                return false;
            }

            const progressData = localStorage.getItem(this.STORAGE_KEYS.TRAINING_PROGRESS);
            const allProgress = progressData ? JSON.parse(progressData) : {};

            const playerProgress = allProgress[currentPlayer.id] || {};

            if (!playerProgress[levelId]) {
                playerProgress[levelId] = {};
            }

            const currentScore = playerProgress[levelId][sublevelId] || 0;
            if (score > currentScore) {
                playerProgress[levelId][sublevelId] = score;
                playerProgress[levelId][`${sublevelId}_accuracy`] = accuracy;
                playerProgress[levelId][`${sublevelId}_date`] = new Date().toISOString();
                playerProgress[levelId][`${sublevelId}_mode`] = 'training';
            }

            allProgress[currentPlayer.id] = playerProgress;

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

            if (isNew || !currentPlayer?.id) {
                const existingPlayers = this.getAllPlayers();
                const nameExists = existingPlayers.some(p =>
                    p.name.toLowerCase() === trimmedName.toLowerCase() &&
                    (!currentPlayer || p.id !== currentPlayer.id)
                );

                if (nameExists) {
                    return {
                        success: false,
                        error: 'Игрок с таким именем уже существует. Пожалуйста, выберите другое имя.'
                    };
                }
            }

            let player = currentPlayer || {};

            player.name = trimmedName;
            player.avatarId = parseInt(avatarId) || 0;

            if (isNew || !player.id) {
                player.id = this.generatePlayerId();
                console.log('Сгенерирован новый ID игрока:', player.id);

                player.gamesPlayed = 0;
                player.bestScore = 0;
                player.totalScore = 0;
                player.completedSublevels = 0;
                player.level = 1;
                player.lastActive = new Date().toISOString();
            }

            player.lastActive = new Date().toISOString();

            this.savePlayerData(player);

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

    // Управление несколькими профилями

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

            const existingIndex = allPlayers.findIndex(p => p.id === player.id);

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
                allPlayers[existingIndex] = playerSummary;
            } else {
                allPlayers.push(playerSummary);
            }

            allPlayers.sort((a, b) => {
                const dateA = new Date(a.lastActive || 0);
                const dateB = new Date(b.lastActive || 0);
                return dateB - dateA;
            });

            localStorage.setItem(this.STORAGE_KEYS.ALL_PLAYERS, JSON.stringify(allPlayers));
        } catch (error) {
            console.error('Ошибка добавления игрока в список:', error);
        }
    },

    switchPlayer(playerId) {
        try {
            const allPlayers = this.getAllPlayers();
            const player = allPlayers.find(p => p.id === playerId);

            if (!player) {
                console.warn('Игрок не найден:', playerId);
                return false;
            }

            const progress = this.getProgress(playerId);
            const trainingProgress = this.getTrainingProgress(playerId);

            const fullPlayer = {
                ...player,
            };

            this.savePlayerData(fullPlayer);

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
            const current = this.getPlayer();
            if (current) {
                this.addToAllPlayers(current);
            }

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
            const allPlayers = this.getAllPlayers();
            const filteredPlayers = allPlayers.filter(p => p.id !== playerId);
            localStorage.setItem(this.STORAGE_KEYS.ALL_PLAYERS, JSON.stringify(filteredPlayers));

            const current = this.getPlayer();
            if (current && current.id === playerId) {
                this.logout();
            }

            const progress = this.getProgress();
            const allProgress = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            if (allProgress) {
                const parsedProgress = JSON.parse(allProgress);
                delete parsedProgress[playerId];
                localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(parsedProgress));
            }

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

            const progress = this.getProgress();

            let totalSublevelsCompleted = 0;
            let bestScore = 0;
            let totalScore = 0;
            let gamesPlayed = currentPlayer.gamesPlayed || 0;

            Object.keys(progress).forEach(levelKey => {
                const levelProgress = progress[levelKey];
                if (levelProgress) {
                    Object.keys(levelProgress).forEach(key => {
                        if (!key.includes('_')) {
                            const score = levelProgress[key];
                            if (score && score > 0) {
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

            currentPlayer.completedSublevels = totalSublevelsCompleted;
            currentPlayer.bestScore = Math.max(currentPlayer.bestScore || 0, bestScore);
            currentPlayer.totalScore = totalScore;
            currentPlayer.gamesPlayed = gamesPlayed;

            currentPlayer.level = this.calculatePlayerLevel(currentPlayer);

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

            if (mode === 'classic') {
                player.gamesPlayed = (player.gamesPlayed || 0) + 1;

                if (score > (player.bestScore || 0)) {
                    player.bestScore = score;
                }

                player.totalScore = (player.totalScore || 0) + score;
            }

            player.level = this.calculatePlayerLevel(player);

            player.lastActive = new Date().toISOString();

            this.savePlayerData(player);

            return player;
        } catch (error) {
            console.error('Ошибка обновления статистики после игры:', error);
            return null;
        }
    },

    updatePlayerStatsAfterClassicGame(score) {
        return this.updatePlayerStatsAfterGame(score, 'classic');
    },

    // Управление рейтингом
    saveRatingEntry(name, lastGameScore, accuracy, avatarId = 0, mode = 'classic') {
        try {
            if (mode !== 'classic') return null;

            const rating = this.getRawRating();
            const player = this.getPlayer();
            const playerId = player?.id || this.generatePlayerId();

            const playerProgress = this.getProgress(playerId);
            let totalPlayerScore = 0;
            let bestSingleScore = 0;
            let totalGames = 0;

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
                existingEntry.name = name;
                existingEntry.totalScore = totalPlayerScore;
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
                    totalScore: totalPlayerScore,
                    bestScore: Math.max(bestSingleScore, lastGameScore),
                    averageAccuracy: Number(accuracy),
                    avatarId: Number(avatarId) || 0,
                    lastPlayed: new Date().toISOString(),
                    gamesPlayed: totalGames || 1,
                    lastGameScore: lastGameScore
                });
            }

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

            const updatedRating = rating.map(player => {
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

            updatedRating.sort((a, b) => b.totalScore - a.totalScore);

            return updatedRating
                .filter(player => player.totalScore && player.totalScore > 0)
                .map((player, index) => ({
                    rank: index + 1,
                    name: player.name,
                    score: player.totalScore,
                    lastGameScore: player.lastGameScore || 0,
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

            this.saveProgress(levelId, sublevelId, finalScore, accuracy, 'classic', player.id);

            this.updatePlayerStatsAfterClassicGame(finalScore);

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
        const progress = this.getProgress();

        if (!player) {
            console.log('Игрок не найден в localStorage');
            return null;
        }

        let totalSublevelsCompleted = 0;
        let bestScore = 0;
        let totalScore = 0;

        Object.keys(progress).forEach(levelKey => {
            const levelProgress = progress[levelKey];
            if (levelProgress) {
                Object.keys(levelProgress).forEach(key => {
                    if (!key.includes('_')) {
                        const score = levelProgress[key];
                        if (score && score > 0) {
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
            gamesPlayed: player.gamesPlayed || 0,
            completedSublevels: totalSublevelsCompleted,
            bestScore: bestScore,
            totalScore: totalScore,
            lastActive: player.lastActive || player.updatedAt
        };

        return stats;
    },

    // Вспомогательные методы
    getProgress(playerId = null) {
        try {
            const progressData = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            if (!progressData) return {};

            const allProgress = JSON.parse(progressData);

            if (playerId) {
                return allProgress[playerId] || {};
            }

            const currentPlayer = this.getPlayer();
            if (currentPlayer && currentPlayer.id) {
                return allProgress[currentPlayer.id] || {};
            }

            return {};
        } catch (error) {
            console.error('Ошибка загрузки прогресса:', error);
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
            this._cache.player = null;
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных игрока:', error);
            return false;
        }
    },
};
