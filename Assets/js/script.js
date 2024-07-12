function showModal(question, answer) {
  const modal = document.getElementById('trivia-modal');
  modal.classList.add('is-active');
  document.getElementById('modal-content').innerText = `Question: ${question}\nAnswer: ${answer}`;
}


document.addEventListener("DOMContentLoaded", function() {

  

    fetch('https://opentdb.com/api_category.php')
      .then(response => response.json())
      .then(data => {
        const categorySelect = document.getElementById('category-select');
        data.trivia_categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          categorySelect.appendChild(option);
        });
      });
  
    document.getElementById('search-button').addEventListener('click', () => {
      const categoryId = document.getElementById('category-select').value;
      localStorage.setItem('lastSelectedCategory', categoryId);
      fetchTriviaQuestions(categoryId);
    });
  
    function fetchTriviaQuestions(categoryId) {
      console.log(`Fetching trivia questions for category ID: ${categoryId}`); // Debugging log
      fetch(`https://opentdb.com/api.php?amount=5&category=${categoryId}`)
        .then(response => response.json())
        .then(data => displayTriviaQuestions(data.results))
        .catch(error => console.error('Error fetching trivia questions:', error));
    }
  
    function displayTriviaQuestions(questions) {
      const triviaResult = document.getElementById('trivia-result');
      questions.forEach((question, index) => {
        triviaResult.innerHTML += `<div><p><strong>Question ${index + 1}:</strong> ${question.question}</p>`;

          question.incorrect_answers.forEach(function(wrongAnswer){
            triviaResult.innerHTML += `<div><label>${wrongAnswer}</label><input type="radio" name="answers" value="${wrongAnswer}" /></div>`;
          });

          triviaResult.innerHTML += `<div><label>${question.correct_answer}</label><input type="radio" name="answers" value="${question.correct_answer}" /></div>`;

          //<p><strong>Answer:</strong> ${question.correct_answer}</p>
          triviaResult.innerHTML += `<button class="button is-info" onclick="showModal('${question.question}', '${question.correct_answer}')">More Info</button>
        </div>`});

    }
  
    
  
    function closeModal() {
      const modal = document.getElementById('trivia-modal');
      modal.classList.remove('is-active');
    }
  
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-background').addEventListener('click', closeModal);
  });
  