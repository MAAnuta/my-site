// ДАННЫЕ ОПРОСА
const questions = [
    {
        text: "А когда с человеком может произойти дрожемент?",
        answers: [
            {txt:"Когда он влюбляется", correct:false},
            {txt:"Когда он идет шопиться", correct:false},
            {txt:"Когда он слышит смешную шутку", correct:false},
            {txt:"Когда он боится, пугается", correct:true,
                exp:"Лексема «дрожемент» имплицирует состояние крайнего напряжения и страха: «У меня всегда дрожемент в ногах, когда копы подходят»."}
        ]
    },
    {
        text: "Говорят, Антон заовнил всех. Это еще как понимать?",
        answers: [
            {txt:"Как так, заовнил? Ну и хамло. Кто с ним теперь дружить-то будет?", correct:false},
            {txt:"Антон очень надоедливый и въедливый человек, всех задолбал", correct:false},
            {txt:"Молодец, Антон, всех победил!", correct:true,
                exp:"Термин «заовнить» заимствован из английского языка, он происходит от слова own и переводится как «победить», «завладеть», «получить»."},
            {txt:"Нет ничего плохого в том, что Антон тщательно выбирает себе друзей", correct:false}
        ]
    },
    {
        text: "А фразу «заскамить мамонта» как понимать?",
        answers: [
            {txt:"Разозлить кого-то из родителей", correct:false},
            {txt:"Увлекаться археологией", correct:false},
            {txt:"Развести недотепу на деньги", correct:true,
                exp:"Заскамить мамонта — значит обмануть или развести на деньги. Почему мамонта? Потому что мошенники часто выбирают в жертвы пожилых людей (древних, как мамонты), которых легко обвести вокруг пальца."},
            {txt:"Оскорбить пожилого человека", correct:false}
        ]
    },
    {
        text: "Кто такие бефефе?",
        answers: [
            {txt:"Вши?", correct:false},
            {txt:"Милые котики, такие милые, что бефефе", correct:false},
            {txt:"Лучшие друзья", correct:true,
                exp:"Бефефе — это лучшие друзья. Этакая аббревиатура от английского выражения best friends forever."},
            {txt:"Люди, которые не держат слово", correct:false}
        ]
    }
];

// ПЕРЕМЕННЫЕ
const quizArea = document.getElementById('quiz-area');
const statsArea = document.getElementById('stats');
const resultP   = document.getElementById('result');

let shuffledQuestions = [];
let userAnswers = [];
let currentQIndex = 0;
let correctCount = 0;
let answered = false;

// ИНИЦИАЛИЗАЦИЯ
function init() {
    shuffledQuestions = [];
    userAnswers = [];
    currentQIndex = 0;
    correctCount = 0;
    answered = false;

    quizArea.innerHTML = '';
    statsArea.classList.remove('visible');
    statsArea.classList.add('hidden');

    const existingRestartBtn = statsArea.querySelector('.restart-btn');
    if (existingRestartBtn) {
        existingRestartBtn.remove();
    }

    shuffledQuestions = [...questions].sort(()=> Math.random() < 0.5 ? -1 : 1);
    shuffledQuestions.forEach(q => {
        q.answers = q.answers.sort(() => Math.random() < 0.5 ? -1 : 1);
    });
    showNextQuestion();
}

// ОТОБРАЖЕНИЕ СЛЕДУЮЩЕГО ВОПРОСА
function showNextQuestion() {
    if (currentQIndex >= shuffledQuestions.length) {
        finishQuiz();
        return;
    }

    const q = shuffledQuestions[currentQIndex];

    const wrapper = document.createElement('div');
    wrapper.className = 'question-wrapper';

    const qBlock = document.createElement('div');
    qBlock.className = 'question-block';
    qBlock.dataset.idx = currentQIndex.toString(); // сохраняем номер текущего вопроса прямо в dom-элементе

    const num = document.createElement('div');
    num.className = 'q-num';
    num.textContent = `Вопрос ${currentQIndex + 1}`;
    qBlock.appendChild(num);

    const txt = document.createElement('div');
    txt.className = 'q-text';
    txt.textContent = q.text;
    qBlock.appendChild(txt);

    // Контейнер для ответов в одну линию
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';

    q.answers.forEach((a, i) => {
        const aBlock = document.createElement('div');
        aBlock.className = 'answer-block';
        aBlock.textContent = a.txt;
        aBlock.dataset.idx = i.toString();

        aBlock.addEventListener('click', () => selectAnswer(aBlock, a.correct, a.exp));

        if (a.exp) {
            const exp = document.createElement('div');
            exp.className = 'explanation';
            exp.textContent = a.exp;
            aBlock.appendChild(exp);
        }

        answersContainer.appendChild(aBlock);
    });
    qBlock.appendChild(answersContainer);
    wrapper.appendChild(qBlock);
    quizArea.appendChild(wrapper);

    answered = false;
}

// ВЫБОР ОТВЕТА
function selectAnswer(el, isCorrect) {
    if (answered || !el || el.classList.contains('disabled'))
        return;
    answered = true;

    const qBlock = el.closest('.question-block');
    const wrapper = el.closest('.question-wrapper');
    if (!qBlock || !wrapper)
        return;

    const allAnswers = qBlock.querySelectorAll('.answer-block');

    allAnswers.forEach(a => a.classList.add('disabled'));

    const selectedIdx = Array.from(allAnswers).indexOf(el);
    userAnswers[currentQIndex] = { selectedIdx, correct: isCorrect };
    el.classList.add('selected');

    setTimeout(() => {
        const marker = document.createElement('span');
        marker.className = 'marker ' + (isCorrect ? 'correct' : 'wrong');
        marker.textContent = isCorrect ? '✅' : '❌';
        qBlock.appendChild(marker);

        if (isCorrect) {
            correctCount++;
            el.classList.add('correct', 'grow');

            setTimeout(() => {
                allAnswers.forEach(a => {
                    if (a !== el) a.classList.add('slide-right');
                });

                setTimeout(() => {
                    el.classList.add('slide-right');
                    setTimeout(() => {
                        wrapper.remove();
                        currentQIndex++;
                        showNextQuestion();
                    }, 700);
                }, 2000);
            }, 1600);
        } else {
            el.classList.add('wrong');
            setTimeout(() => {
                allAnswers.forEach(a => a.classList.add('slide-right'));
                setTimeout(() => {
                    wrapper.remove();
                    currentQIndex++;
                    showNextQuestion();
                }, 800);
            }, 600);
        }
    }, 1200);
}

// ЗАВЕРШЕНИЕ ТЕСТА
function finishQuiz() {
    const msg = document.createElement('div');
    msg.className = 'finished';
    msg.textContent = 'Вопросы закончились';
    quizArea.prepend(msg);

    resultP.textContent = `Правильных ответов: ${correctCount} из ${questions.length}`;

    statsArea.classList.remove('hidden');
    setTimeout(() => {
        statsArea.classList.add('visible');
    }, 50);

    addRestartButton();
    enableReview();
}

// ДОБАВЛЕНИЕ КНОПКИ ПЕРЕЗАПУСКА
function addRestartButton() {
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Пройти тест заново';
    restartBtn.className = 'restart-btn';
    restartBtn.addEventListener('click', init);
    statsArea.appendChild(restartBtn);
}

// РЕЖИМ ПРОСМОТРА
function enableReview() {
    shuffledQuestions.forEach((q, qIdx) => {
        const revBlock = document.createElement('div');
        revBlock.className = 'review-block';
        revBlock.dataset.qidx = qIdx.toString();

        const userChoice = userAnswers[qIdx];
        const isCorrect = userChoice && userChoice.correct;
        const marker = isCorrect ? '✅' : '❌';

        // Заголовок вопроса с маркером
        const questionTitle = document.createElement('div');
        questionTitle.className = 'review-question';
        questionTitle.innerHTML = `
            <span class="question-marker">${marker}</span>
            <span>${q.text}</span>
        `;
        revBlock.appendChild(questionTitle);

        // Контейнер для ответов в одну линию
        const answersContainer = document.createElement('div');
        answersContainer.className = 'answers-container';

        // Отображаем все варианты ответов
        q.answers.forEach((answer, ansIdx) => {
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';

            const isUserAnswer = userChoice && userChoice.selectedIdx === ansIdx;
            const isCorrectAnswer = answer.correct;

            // Определяем стиль в зависимости от типа ответа
            if (isCorrectAnswer) {
                answerOption.classList.add('correct-option');
            } else if (isUserAnswer && !isCorrectAnswer) {
                answerOption.classList.add('user-wrong');
            } else if (isUserAnswer && isCorrectAnswer) {
                answerOption.classList.add('user-correct');
            }

            // Текст ответа
            answerOption.textContent = answer.txt;

            // Добавляем статус для ответов пользователя
            if (isUserAnswer) {
                const status = document.createElement('span');
                status.className = `answer-status ${isCorrectAnswer ? 'correct-status' : 'wrong-status'}`;
                answerOption.appendChild(status);
            }

            answersContainer.appendChild(answerOption);
        });

        revBlock.appendChild(answersContainer);

        // Добавляем пояснение если есть
        const correctAnswer = q.answers.find(a => a.correct);
        if (correctAnswer && correctAnswer.exp) {
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'explanation-text';
            explanationDiv.innerHTML = `<strong>Пояснение:</strong> ${correctAnswer.exp}`;
            revBlock.appendChild(explanationDiv);
        }

        revBlock.style.display = 'none';
        quizArea.appendChild(revBlock);
    });

// Заголовки для навигации по вопросам без маркеров
    const reviewHeaders = document.createElement('div');
    reviewHeaders.id = 'review-headers';
    shuffledQuestions.forEach((q, i) => {
        const userChoice = userAnswers[i];
        const isCorrect = userChoice && userChoice.correct;
        const marker = isCorrect ? '✅' : '❌';

        const head = document.createElement('div');
        head.className = 'review-header';
        head.innerHTML = `
            <span class="review-marker">${marker}</span>
            <span>Вопрос ${i + 1}</span>
        `;
        head.addEventListener('click', () => toggleReview(i));
        reviewHeaders.appendChild(head);
    });
    quizArea.appendChild(reviewHeaders);
}

function toggleReview(qIdx) {
    document.querySelectorAll('.review-block').forEach(b => b.style.display = 'none');
    const block = document.querySelector(`.review-block[data-qidx="${qIdx}"]`);
    if (block) block.style.display = 'block';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', init);