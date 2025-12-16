class GameCore {
    constructor(gameMode = 'classic') {
        console.log('Инициализация GameCore, режим:', gameMode);

        this.state = {
            score: 0,
            totalScore: 0,
            attempts: 3,
            isPaused: false,
            currentLevel: null,
            currentSublevel: null,
            totalAttempts: 0,
            successfulAttempts: 0,
            accuracy: 0,
            gameMode: gameMode
        };

        this.gameMode = gameMode;
        this.levelManager = null;
        this.initUIManager();

        this.initGameModeUI();
    }

    initGameModeUI() {
        const modeIndicator = document.getElementById('gameModeIndicator');
        if (modeIndicator) {
            modeIndicator.textContent = `Режим: ${this.gameMode === 'classic' ? 'Классическая игра' : 'Тренировка'}`;
            modeIndicator.style.color = this.gameMode === 'classic' ? '#5c885d' : '#83af9d';
        }
    }

    initUIManager() {
        this.uiManager = {
            showHint: (text) => {
                const hint = document.getElementById('hintText');
                if (hint) {
                    hint.innerHTML = text;
                    hint.style.color = '#333';
                }
                console.log('Подсказка:', text);
            },

            showResult: (data) => {
                const hint = document.getElementById('hintText');
                if (hint && data) {
                    const deltaText = data.delta ? ` (${data.delta})` : '';
                    hint.innerHTML = `<strong style="color: ${data.color || '#333'}; font-size: 20px;">${data.message}${deltaText}</strong>`;
                }
                console.log('Результат:', data);
            },

            setActionButton: (text, onClick, disabled = false) => {
                const btn = document.getElementById('actionBtn');
                if (!btn) return;

                btn.textContent = text || 'СТАРТ';
                btn.disabled = disabled;
                btn.onclick = onClick;

                console.log('Кнопка установлена:', text, 'disabled:', disabled);
            },

            onLevelStarted: (data) => {
                console.log('Уровень начат:', data);
            },

            showMessage: (text, color) => {
                this.uiManager.showHint(`<span style="color:${color || '#333'}">${text}</span>`);
            },

            updateScoreDisplay: (score, maxScore = null, percentage = null) => {
                const scoreElement = document.getElementById('scoreInfo');
                if (!scoreElement) return;

                let scoreText = `Очки: ${score}`;
                if (maxScore !== null) {
                    scoreText += ` / ${maxScore}`;
                }
                if (percentage !== null) {
                    scoreText += ` (${percentage}%)`;
                }

                scoreElement.textContent = scoreText;
            }
        };
    }

    init(levelId, sublevelId) {
        console.log('Инициализация игры:', levelId, sublevelId, 'Режим:', this.gameMode);

        try {
            if (typeof DataManager === 'undefined') {
                throw new Error('DataManager не загружен');
            }

            const player = DataManager.getPlayer();
            if (!player) {
                window.location.href = 'index.html';
                return false;
            }

            this.levelManager = new LevelManager(this);
            console.log('LevelManager создан успешно');

            const levelInfo = this.levelManager.getLevelInfo(levelId);
            if (!levelInfo) {
                throw new Error(`Уровень ${levelId} не найден`);
            }

            const sublevelInfo = this.levelManager.getSublevelInfo(levelId, sublevelId);
            if (!sublevelInfo) {
                throw new Error(`Подуровень ${sublevelId} не найден`);
            }

            if (this.gameMode === 'classic') {
                if (!this.levelManager.isLevelUnlocked(levelId)) {
                    window.location.href = 'menu.html';
                    return false;
                }

                if (!this.levelManager.isSublevelAvailable(levelId, sublevelId)) {
                    window.location.href = 'menu.html';
                    return false;
                }
            }

            if (this.gameMode === 'training') {
                this.uiManager.showMessage('Режим тренировки: результат не сохраняется в рейтинг', '#83af9d');
            }

            const success = this.levelManager.startLevel(levelId, sublevelId);

            if (!success) {
                throw new Error('Не удалось запустить уровень');
            }

            this.uiManager.showHint(sublevelInfo.description);

            this.state.currentLevel = levelId;
            this.state.currentSublevel = sublevelId;

            const maxScore = DataManager.getMaxScoreForSublevel(levelId, sublevelId);
            this.uiManager.updateScoreDisplay(0, maxScore, 0);

            console.log('Игра успешно инициализирована');
            return true;

        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showLoadingError(`Ошибка запуска игры: ${error.message}`);
            return false;
        }
    }

    getPrevSublevelId(levelId, sublevelId) {
        const sublevelNum = DataManager.getSublevelNumber(sublevelId);
        if (sublevelNum <= 1) return null;

        if (typeof sublevelId === 'string' && sublevelId.includes('-')) {
            const parts = sublevelId.split('-');
            return `${parts[0]}-${sublevelNum - 1}`;
        }

        return (sublevelNum - 1).toString();
    }

    calculateScore(levelId, sublevelId, accuracy, timeBonus = 1.0, roundNumber = null) {
        return DataManager.calculateScore(levelId, sublevelId, accuracy, timeBonus, roundNumber);
    }
    handleAttemptResult(result) {
        console.log('Обработка результата попытки:', result);

        if (!result) return;

        const attemptAccuracy = result.accuracy || 0;

        if (this.state.totalAttempts > 0) {
            this.state.accuracy = ((this.state.accuracy * this.state.totalAttempts) + attemptAccuracy) / (this.state.totalAttempts + 1);
        } else {
            this.state.accuracy = attemptAccuracy;
        }

        const rawRoundNumber = 3 - this.state.attempts;
        const roundNumber = Math.min(3, Math.max(1, rawRoundNumber));

        const scoreResult = this.calculateScore(
            this.state.currentLevel,
            this.state.currentSublevel,
            attemptAccuracy,
            result.timeBonus || 1.0,
            roundNumber
        );
        const calculatedScore = scoreResult.finalScore;

        console.log(`Раунд ${roundNumber}: ${calculatedScore} очков (${scoreResult.breakdown?.roundPercentage || 33}% от максимума)`);

        this.state.totalAttempts++;

        if (attemptAccuracy >= 80) {
            this.state.successfulAttempts++;
        }

        this.state.totalScore += calculatedScore;
        this.state.attempts--;

        const maxScore = DataManager.getMaxScoreForSublevel(
            this.state.currentLevel,
            this.state.currentSublevel
        );

        const currentTotalScore = Math.min(this.state.totalScore, maxScore);
        const progressPercentage = Math.min(100, Math.round((currentTotalScore / maxScore) * 100));

        this.uiManager.updateScoreDisplay(
            currentTotalScore,
            maxScore,
            progressPercentage
        );

        const attemptsElement = document.getElementById('attemptsInfo');
        if (attemptsElement) {
            attemptsElement.textContent = `Попытки: ${this.state.attempts}`;
        }

        const accuracyElement = document.getElementById('accuracyInfo');
        if (!accuracyElement) {
            const headerInfo = document.querySelector('.header-info');
            if (headerInfo) {
                const newAccuracyElement = document.createElement('span');
                newAccuracyElement.id = 'accuracyInfo';
                newAccuracyElement.style.padding = '8px 16px';
                newAccuracyElement.style.background = '#f0f0f0';
                newAccuracyElement.style.borderRadius = '10px';
                newAccuracyElement.style.color = '#333';
                headerInfo.appendChild(newAccuracyElement);
            }
        }

        const updatedAccuracyElement = document.getElementById('accuracyInfo');
        if (updatedAccuracyElement) {
            updatedAccuracyElement.textContent = `Точность: ${attemptAccuracy.toFixed(1)}%`;
        }

        console.log('Новое состояние:', this.state);

        const isCompleted = result.isCompleted || (this.state.attempts <= 0);
        this.saveAttemptProgress(calculatedScore, attemptAccuracy, isCompleted);

        if (result.isCompleted || this.state.attempts <= 0) {
            setTimeout(() => {
                this.showGameOver();
            }, 3000);
        }
    }

    saveAttemptProgress(score, accuracy, isCompleted = false) {
        try {
            const roundNumber = 4 - this.state.attempts;

            if (this.levelManager) {
                this.levelManager.saveSublevelProgress(
                    this.state.currentLevel,
                    this.state.currentSublevel,
                    score,
                    accuracy,
                    this.gameMode,
                    roundNumber,
                    isCompleted
                );
            }

            console.log('Прогресс попытки сохранен:', { score, accuracy, mode: this.gameMode, isCompleted });
        } catch (error) {
            console.error('Ошибка сохранения прогресса попытки:', error);
        }
    }

    static calculateTimeBonus(timeSpent) {
        const referenceTime = 60;
        if (timeSpent <= referenceTime) {
            return 1.0 + (referenceTime - timeSpent) / referenceTime * 0.2;
        }
        return 1.0;
    }

    static checkIfNewRecord(levelId, sublevelId, score, mode) {
        if (mode === 'training') {
            const trainingProgress = JSON.parse(localStorage.getItem('timeCoordinationTrainingProgress') || '{}');
            const currentBest = trainingProgress[levelId]?.[sublevelId] || 0;
            return score > currentBest;
        } else {
            const progress = DataManager.getProgress();
            const currentBest = progress?.[levelId]?.[sublevelId] || 0;
            return score > currentBest;
        }
    }

    static endGame(levelId, sublevelId, accuracy, timeSpent, mode = 'classic') {
        const timeBonus = this.calculateTimeBonus(timeSpent);

        const scoreResult = this.calculateScore(levelId, sublevelId, accuracy, timeBonus);
        const finalScore = scoreResult.finalScore;

        DataManager.saveProgress(levelId, sublevelId, finalScore, accuracy, mode);

        if (mode === 'classic') {
            DataManager.updatePlayerStatsAfterGame(finalScore, mode);
            DataManager.updateRatingAfterGame(levelId, sublevelId, finalScore, accuracy);
        } else if (mode === 'training') {
            console.log('Тренировка завершена - результат не влияет на рейтинг');
        }

        return {
            score: finalScore,
            accuracy: accuracy,
            mode: mode,
            breakdown: scoreResult.breakdown,
            isNewRecord: this.checkIfNewRecord(levelId, sublevelId, finalScore, mode)
        };
    }

    calculateAccuracy() {
        if (this.state.totalAttempts === 0) return 0;

        const accuracy = this.state.accuracy || 0;
        return Math.round(accuracy * 10) / 10;
    }

    saveGameResult(isCompleted = false) {
        try {
            const player = DataManager.getPlayer();
            if (!player) return false;

            const maxScore = DataManager.getMaxScoreForSublevel(
                this.state.currentLevel,
                this.state.currentSublevel
            );
            const finalScore = Math.min(this.state.totalScore, maxScore);

            const accuracy = this.calculateAccuracy();

            if (this.levelManager) {
                const roundsData = {
                    round1: {
                        score: finalScore,
                        accuracy: accuracy,
                        timestamp: Date.now()
                    }
                };

                this.levelManager.finalizeSublevelProgress(
                    this.state.currentLevel,
                    this.state.currentSublevel,
                    roundsData,
                    this.gameMode
                );
            }

            if (this.gameMode === 'classic') {
                const saved = DataManager.saveRatingEntry(
                    player.name,
                    finalScore,
                    accuracy,
                    player.avatarId,
                    this.gameMode
                );

                if (!saved) {
                    console.error('Не удалось сохранить результат в рейтинг');
                }

                DataManager.updatePlayerStatsAfterGame(finalScore, this.gameMode);

                const sessionGames = parseInt(sessionStorage.getItem('games_played_in_session') || 0);
                sessionStorage.setItem('games_played_in_session', sessionGames + 1);
            }

            if (this.gameMode === 'training') {
                console.log('Тренировка завершена:', {
                    score: this.state.totalScore,
                    accuracy: accuracy,
                    mode: this.gameMode
                });
            }

            console.log('Результат игры сохранен:', {
                score: this.state.totalScore,
                accuracy: accuracy,
                attempts: this.state.successfulAttempts + '/' + this.state.totalAttempts,
                mode: this.gameMode
            });

            return true;
        } catch (error) {
            console.error('Ошибка сохранения результата:', error);
            return false;
        }
    }

    showGameOver() {
        const gameArea = document.getElementById('gameArea');
        if (!gameArea) return;

        const maxScore = DataManager.getMaxScoreForSublevel(
            this.state.currentLevel,
            this.state.currentSublevel
        );

        const originalScore = this.state.totalScore;

        this.state.totalScore = Math.min(this.state.totalScore, maxScore);

        this.saveGameResult(true);

        let nextLevelInfo = null;
        if (this.gameMode === 'classic' && this.levelManager) {
            nextLevelInfo = this.levelManager.lastUnlockedInfo;
        }

        const accuracy = this.calculateAccuracy();

        const progressPercentage = Math.min(100, Math.round((this.state.totalScore / maxScore) * 100));

        const finalScoreForCheck = Math.min(originalScore, maxScore);
        const shouldAutoAdvance = (finalScoreForCheck / maxScore) >= 0.8;

        let progressColor = '#915853';
        if (progressPercentage >= 80) progressColor = '#648364';
        else if (progressPercentage >= 50) progressColor = '#c69d60';

        const modeText = this.gameMode === 'classic' ? 'Классическая игра' : 'Тренировка';
        const modeColor = this.gameMode === 'classic' ? '#648364' : '#83af9d';

        gameArea.innerHTML = `
            <div style="text-align: center; padding: 15px; max-height: 100vh; overflow-y: auto;">
                ${this.gameMode === 'classic' && nextLevelInfo && nextLevelInfo.type === 'sublevel' && progressPercentage >= 80 ?
            `<div style="margin: 10px 0; padding: 12px; background: #fff3e0; border-radius: 8px; color: #d68910; font-size: 16px; font-weight: bold; border: 2px solid #f39c12;">
                 ⏰ Автоматический переход к следующему подуровню через 3 секунды...
            </div>` : ''
        }
                <div style="margin-bottom: 15px;">
                    <svg viewBox="0 0 24 24" width="60" height="60" style="fill: ${modeColor};">
                        <path d="M19,8.99c0-.88-.39-1.71-1.06-2.29-.67-.57-1.56-.82-2.44-.67-1.22,.2-2.18,1.19-2.44,2.42l-2.68-2.68c-.55-.55-1.32-.84-2.09-.77-.78,.06-1.49,.47-1.95,1.11-.05,.07-.09,.14-.13,.21-.52-.41-1.18-.61-1.85-.55-.78,.06-1.49,.47-1.95,1.11-.41,.57-.55,1.28-.44,1.96-.52,.18-.99,.51-1.32,.98-.75,1.04-.6,2.54,.35,3.49l.29,.29c-.31,.19-.59,.44-.81,.74-.75,1.04-.6,2.54,.35,3.49l4.13,4.13c1.38,1.38,3.19,2.07,5.01,2.07s3.63-.69,5.01-2.07l1.98-1.98c1.32-1.32,2.05-3.08,2.05-4.95v-6.01Zm-2,6.01c0,1.32-.53,2.6-1.46,3.54l-1.98,1.98c-1.98,1.98-5.2,1.98-7.18,0l-4.13-4.13c-.26-.26-.32-.65-.14-.9,.16-.22,.38-.27,.49-.28,.19,0,.38,.05,.52,.19l2.1,2.1c.39,.39,1.02,.39,1.41,0s.39-1.02,0-1.41L2.42,11.86c-.26-.26-.32-.65-.14-.9,.16-.22,.38-.27,.49-.28,.19-.02,.38,.05,.52,.19l4.28,4.28c.39,.39,1.02,.39,1.41,0s.39-1.02,0-1.41l-4.8-4.8c-.26-.26-.32-.65-.14-.9,.16-.22,.38-.27,.49-.28,.19-.02,.38,.05,.52,.19l4.86,4.86c.2,.2,.45,.29,.71,.29s.51-.1,.71-.29c.39-.39,.39-1.02,0-1.41l-3.2-3.2s-.01-.01-.02-.02c-.26-.26-.32-.65-.14-.9,.16-.22,.38-.27,.49-.28,.19-.02,.38,.05,.52,.19l4.32,4.32c.29,.29,.71,.37,1.09,.22,.37-.15,.62-.52,.62-.92v-1.7c0-.54,.36-1.02,.82-1.09,.3-.05,.6,.03,.82,.22,.22,.19,.35,.47,.35,.76v6.01Zm7-6.01v6.3c0,1.66-.59,3.26-1.66,4.53l-2.51,2.96c-.45,.45-.88,.79-1.34,1.08-.16,.1-.35,.15-.52,.15-.34,0-.66-.17-.85-.47-.29-.47-.15-1.09,.33-1.38,.33-.2,.64-.45,.92-.73l2.46-2.9c.77-.9,1.19-2.05,1.19-3.23v-6.3c0-.29-.13-.57-.35-.76-.23-.19-.52-.27-.82-.22-.55,.1-1.06-.28-1.15-.83-.09-.55,.28-1.06,.83-1.15,.88-.15,1.77,.1,2.44,.67,.67,.57,1.06,1.4,1.06,2.29ZM10.29,3.71c-.39-.39-.39-1.02,0-1.41l1-1c.39-.39,1.02-.39,1.41,0s.39,1.02,0,1.41l-1,1c-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29ZM3.29,2.71c-.39-.39-.39-1.02,0-1.41s1.02-.39,1.41,0l1,1c.39,.39,.39,1.02,0,1.41-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29l-1-1Zm3.71-.71V1c0-.55,.45-1,1-1s1,.45,1,1v1c0,.55-.45,1-1,1s-1-.45-1-1Z"/>
                    </svg>
                </div>
                <h2 style="color: ${modeColor}; margin-bottom: 8px; font-size: 24px;">${modeText} завершена!</h2>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 15px auto; max-width: 480px;">
                    <div style="font-size: 28px; margin: 15px 0; color: #364447;">
                        <strong>${this.state.totalScore}</strong> очков
                    </div>
                    <div style="margin: 12px 0;">
                        <div style="font-size: 18px; margin-bottom: 3px;">
                            Точность: <strong style="color: ${accuracy >= 80 ? '#648364' : '#e6685f'}">${accuracy.toFixed(1)}%</strong>
                        </div>
                        <small style="font-size: 13px; color: #666;">
                            (${this.state.successfulAttempts} из ${this.state.totalAttempts})
                        </small>
                    </div>
                    <div style="margin: 12px 0;">
                        <div style="font-size: 16px; margin-bottom: 8px;">
                            Прогресс подуровня: <strong style="color: ${progressColor}">${progressPercentage}%</strong>
                        </div>
                        <div style="background: #ddd; height: 18px; border-radius: 9px; overflow: hidden;">
                            <div style="background: ${progressColor}; height: 100%; width: ${progressPercentage}%; transition: width 1s ease;"></div>
                        </div>
                        <small style="font-size: 11px; color: #666;">
                            ${this.state.totalScore} / ${maxScore} очков
                        </small>
                    </div>
                    ${this.gameMode === 'classic' && progressPercentage >= 80 ?
            '<div style="margin: 12px 0; padding: 8px; background: #e8f5e9; border-radius: 6px; color: #5e8e60; font-size: 14px;"> Отлично! Вы разблокировали доступ к следующему уровню!</div>' :
            this.gameMode === 'classic' && progressPercentage < 80 ?
                '<div style="margin: 12px 0; padding: 8px; background: #ffebee; border-radius: 6px; color: #c15f5f; font-size: 14px;"> Для разблокировки следующего уровня нужно набрать минимум 80%</div>' :
                '<div style="margin: 12px 0; padding: 8px; background: #fff3e0; border-radius: 6px; color: #e4a774; font-size: 14px;"> Тренировка: результат не влияет на прогресс разблокировки</div>'
        }
                </div>
                <div style="margin: 20px 0;">
                        <button onclick="window.location.href='menu.html${this.gameMode === 'training' ? `?from=training&level=${this.state.currentLevel}&sublevel=${this.state.currentSublevel}` : ''}&t=' + Date.now()"
                            style="padding: 12px 24px; font-size: 16px; background: #364447;
                                   color: white; border: none; border-radius: 6px; cursor: pointer; margin: 0 8px 8px 8px;">
                        Вернуться в меню
                    </button>
                    <button onclick="window.location.reload()"
                            style="padding: 12px 24px; font-size: 16px; background: ${modeColor};
                                   color: white; border: none; border-radius: 6px; cursor: pointer; margin: 0 8px 8px 8px;">
                        Сыграть ещё
                    </button>
                    ${this.gameMode === 'training' ?
            `<button onclick="window.location.href='game.html?mode=classic&level=${this.state.currentLevel}&sublevel=${this.state.currentSublevel}'"
                                style="padding: 12px 24px; font-size: 16px; background: #648364;
                                       color: white; border: none; border-radius: 6px; cursor: pointer; margin: 8px 8px 0 8px;">
                            Попробовать в классическом режиме
                        </button>` : ''
        }
                    ${nextLevelInfo && progressPercentage >= 80 ?
            `<button onclick="window.location.href='game.html?mode=classic&level=${nextLevelInfo.levelId}&sublevel=${nextLevelInfo.sublevelId}&t=' + Date.now()"
                                style="padding: 12px 24px; font-size: 16px; background: #d8ad70;
                                       color: white; border: none; border-radius: 6px; cursor: pointer; margin: 8px 8px 0 8px;">
                            ${nextLevelInfo.type === 'level' ? 'Следующий уровень' : 'Следующий подуровень'}
                        </button>` : ''
        }
                </div>
            </div>
        `;

        this.uiManager.setActionButton('В МЕНЮ', () => {
            window.location.href = 'menu.html?refresh=1&t=' + Date.now();
        });

        if (this.gameMode === 'classic' && nextLevelInfo && nextLevelInfo.type === 'sublevel' && progressPercentage >= 80) {
            setTimeout(() => {
                window.location.href = `game.html?mode=classic&level=${nextLevelInfo.levelId}&sublevel=${nextLevelInfo.sublevelId}&t=${Date.now()}`;
            }, 3000);
        }
    }

    showLoadingError(message, details) {
        const gameArea = document.getElementById('gameArea');
        if (!gameArea) return;

        gameArea.innerHTML = `
            <div class="error-container">
                <h2 style="color: #cf5f57;">Ошибка загрузки</h2>
                <p style="font-size: 18px; margin: 20px 0;">${message}</p>
                ${details ? `<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
                    <strong>Детали:</strong><br>
                    <pre style="font-size: 12px; color: #666;">${details}</pre>
                </div>` : ''}
                <div style="margin-top: 30px;">
                    <button onclick="window.location.href='menu.html'" 
                            style="padding: 12px 24px; background: #364548; color: white; 
                                   border: none; border-radius: 8px; cursor: pointer; margin: 0 10px;">
                        Вернуться в меню
                    </button>
                    <button onclick="window.location.reload()" 
                            style="padding: 12px 24px; background: #648364; color: white; 
                                   border: none; border-radius: 8px; cursor: pointer; margin: 0 10px;">
                        Обновить страницу
                    </button>
                </div>
            </div>
        `;
    }

    cleanup() {
        if (this.levelManager) {
            try {
                this.levelManager.stopCurrentLevel();
            } catch (error) {
                console.error('Ошибка очистки LevelManager:', error);
            }
        }
    }

    getState() {
        return { ...this.state };
    }

    getGameMode() {
        return this.gameMode;
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.state.gameMode = mode;
        this.initGameModeUI();
        console.log('Режим игры изменен на:', mode);
    }

    saveResult(score, accuracy) {
        try {
            const player = DataManager.getPlayer();
            if (!player) return false;

            if (this.gameMode === 'classic') {
                DataManager.saveRatingEntry(
                    player.name,
                    score,
                    accuracy,
                    player.avatarId,
                    this.gameMode
                );

                DataManager.updatePlayerStatsAfterClassicGame(score);
            } else {
                console.log('Тренировка: результат не сохраняется в рейтинг');
            }

            console.log('Результат сохранен:', { score, accuracy, mode: this.gameMode });
            return true;
        } catch (error) {
            console.error('Ошибка сохранения результата:', error);
            return false;
        }
    }
}

if (typeof window !== 'undefined') {
    window.GameCore = GameCore;
}
