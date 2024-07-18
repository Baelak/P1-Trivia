document.addEventListener('DOMContentLoaded', function() {
  const categorySelect = document.getElementById('category-select');
  const startQuizButton = document.getElementById('start-quiz-button');
  const quizContainer = document.getElementById('quiz-container');
  const showAnswerButton = document.getElementById('show-answer-button');
  const nextButton = document.getElementById('next-button');
  const endGameButton = document.getElementById('end-game-button');
  const triviaModal = document.getElementById('trivia-modal');
  const closeModalButton = document.getElementById('close-modal-button');
  const playGameButton = document.getElementById('play-game-button');
  const cancelButton = document.getElementById('cancel-button');
  const highScoreModal = document.getElementById('high-score-modal');
  const closeHighScoreModalButton = document.getElementById('close-high-score-modal-button');
  const highScoreMessage = document.getElementById('high-score-message');
  const closeHighScoreButton = document.getElementById('close-high-score-button');

  let questions = [];
  let currentQuestionIndex = 0;
  let currentScore = 0;

  // Show the modal on page load
  triviaModal.classList.add('is-active');

  // Event listeners for modal buttons
  closeModalButton.addEventListener('click', () => {
    triviaModal.classList.remove('is-active');
  });

  playGameButton.addEventListener('click', () => {
    triviaModal.classList.remove('is-active');
    handleStartQuizButton();
  });

  cancelButton.addEventListener('click', () => {
    triviaModal.classList.remove('is-active');
  });

  closeHighScoreModalButton.addEventListener('click', () => {
    highScoreModal.classList.remove('is-active');
  });

  closeHighScoreButton.addEventListener('click', () => {
    highScoreModal.classList.remove('is-active');
  });

  function fetchCategories() {
    fetch('https://opentdb.com/api_category.php')
      .then(response => response.json())
      .then(data => {
        if (data && data.trivia_categories) {
          data.trivia_categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }

  function fetchQuestions(category, retries = 5) {
    const url = category === 'any' 
      ? 'https://opentdb.com/api.php?amount=10' 
      : `https://opentdb.com/api.php?amount=10&category=${category}`;
    fetch(url)
      .then(response => {
        if (response.status === 429 && retries > 0) {
          console.warn('Rate limited, retrying...');
          setTimeout(() => fetchQuestions(category, retries - 1), 2000);
        } else if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data && data.results) {
          questions = data.results;
          displayQuestion();
        } else {
          console.error('No data received');
        }
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
      });
  }

  function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      quizContainer.innerHTML = `
        <h2 class="title">${question.question}</h2>
        ${getAnswersHtml(question)}
        <div id="correct-answer" class="notification is-success is-hidden">${question.correct_answer}</div>
      `;
      showAnswerButton.disabled = false;
      quizContainer.classList.remove('is-hidden');
      showAnswerButton.classList.remove('is-hidden');
      nextButton.classList.remove('is-hidden');
      endGameButton.classList.remove('is-hidden');
    } else {
      endGame();
    }
  }

  function getAnswersHtml(question) {
    if (question.type === 'multiple') {
      let answers = [...question.incorrect_answers];
      answers.splice(Math.floor(Math.random() * (answers.length + 1)), 0, question.correct_answer);
      return answers.map(answer => `
        <label class="radio">
          <input type="radio" name="answer" value="${answer}">
          ${answer}
        </label>
      `).join('');
    } else if (question.type === 'boolean') {
      return `
        <label class="radio">
          <input type="radio" name="answer" value="True">
          True
        </label>
        <label class="radio">
          <input type="radio" name="answer" value="False">
          False
        </label>
      `;
    }
  }

  function handleShowAnswerButton() {
    const correctAnswerDiv = document.getElementById('correct-answer');
    correctAnswerDiv.classList.remove('is-hidden');
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer && selectedAnswer.value === correctAnswerDiv.textContent) {
      currentScore++;
    }
  }

  function handleNextButton() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }
    currentQuestionIndex++;
    displayQuestion();
  }

  function handleStartQuizButton() {
    const selectedCategory = categorySelect.value;
    currentQuestionIndex = 0;
    currentScore = 0;
    fetchQuestions(selectedCategory);
  }

  function handleEndGameButton() {
    endGame();
  }

  function endGame() {
    saveHighScore(currentScore);
    highScoreMessage.textContent = `Your score: ${currentScore}. High score: ${localStorage.getItem('highScore') || 0}`;
    highScoreModal.classList.add('is-active');
    showAnswerButton.classList.add('is-hidden');
    nextButton.classList.add('is-hidden');
    endGameButton.classList.add('is-hidden');
  }

  function saveHighScore(score) {
    const highScore = localStorage.getItem('highScore');
    if (!highScore || score > highScore) {
      localStorage.setItem('highScore', score);
    }
  }

  showAnswerButton.addEventListener('click', handleShowAnswerButton);
  nextButton.addEventListener('click', handleNextButton);
  startQuizButton.addEventListener('click', handleStartQuizButton);
  endGameButton.addEventListener('click', handleEndGameButton);
  fetchCategories();
});
