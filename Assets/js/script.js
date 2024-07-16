document.addEventListener('DOMContentLoaded', function() {
  const categorySelect = document.getElementById('category-select');
  const startQuizButton = document.getElementById('start-quiz-button');
  const quizContainer = document.getElementById('quiz-container');
  const showAnswerButton = document.getElementById('show-answer-button');
  const nextButton = document.getElementById('next-button');

  let questions = [];
  let currentQuestionIndex = 0;

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
    } else {
      quizContainer.innerHTML = '<h2 class="title">Quiz Completed!</h2>';
      showAnswerButton.disabled = true;
      nextButton.disabled = true;
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
    fetchQuestions(selectedCategory);
  }

  showAnswerButton.addEventListener('click', handleShowAnswerButton);
  nextButton.addEventListener('click', handleNextButton);
  startQuizButton.addEventListener('click', handleStartQuizButton);

  fetchCategories();
});
