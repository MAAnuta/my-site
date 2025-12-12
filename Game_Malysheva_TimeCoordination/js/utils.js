// Генерация случайного числа в диапазоне
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Генерация случайного целого числа в диапазоне
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Форматирование времени в читаемый вид
function formatTime(ms) {
    if (ms < 1000) {
        return ms.toFixed(0) + ' мс';
    }
    return (ms / 1000).toFixed(2) + ' сек';
}

// Очистка всех таймеров из массива
function clearAllTimers(timers) {
    timers.forEach(timer => {
        if (timer) {
            clearTimeout(timer);
            clearInterval(timer);
        }
    });
    timers.length = 0;
}

// Создание промиса с задержкой
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Получить случайный элемент из массива
function randomElement(array) {
    return array[randomInt(0, array.length - 1)];
}

// Перемешать массив (алгоритм Фишера-Йетса)
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}



