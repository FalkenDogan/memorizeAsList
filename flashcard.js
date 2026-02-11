//flashcard.js

let selectedQuizData = []; 
let currentQuestion = 0; 
let score = 0; 
let previousAnswers = []; 

function shuffleArray(array) { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
}

function getFlashcardId() { 
  if (!selectedQuizData || selectedQuizData.length === 0) return null; 
  return `${selectedQuizData.length}_${selectedQuizData[0].question.substring(0, 20)}`; 
}

function saveProgress() { 
  const progress = { 
    flashcardId: getFlashcardId(), 
    currentQuestion: currentQuestion, 
    timestamp: Date.now() 
  }; 
  localStorage.setItem('flashcardProgress', JSON.stringify(progress)); 
}

function displayQuestion() { 
  const quizContainer = document.getElementById('quiz'); 
  quizContainer.style.display = 'block'; 

  const questionData = selectedQuizData[currentQuestion]; 
  quizContainer.innerHTML = `
    <div class="flashcard" onclick="flipCard()">
      <div class="front" style="overflow-y: auto; display: flex; align-items: flex-start; justify-content: center;">${questionData.question}</div>
      <div class="back" style="overflow-y: auto; display: flex; align-items: flex-start; justify-content: center;">${questionData.answer}</div>
    </div>
  `;

  const questionNumberElement = document.getElementById('questionNumber'); 
  questionNumberElement.innerText = `Question number: ${currentQuestion + 1}/${selectedQuizData.length}`; 
}

function flipCard() { 
  const flashcard = document.querySelector('.flashcard'); 
  flashcard.classList.toggle('flipped'); 
}

function startQuiz() { 
  const quizData = JSON.parse(localStorage.getItem('selectedQuizData')); 
  if (!quizData || quizData.length === 0) { 
    alert('No questions selected for the quiz.'); 
    window.location.href = 'selectQuestion.html'; 
    return; 
  } 

  selectedQuizData = quizData;  
  
  const savedProgress = JSON.parse(localStorage.getItem('flashcardProgress')); 
  if (savedProgress && savedProgress.flashcardId === getFlashcardId()) { 
    const resume = confirm( 
      `Flashcard'larda ${savedProgress.currentQuestion + 1}/${selectedQuizData.length} numaralı kartta kalmıştınız. Devam etmek ister misiniz?\n\nTamam: Kaldığınız yerden devam edin\nİptal: Yeni başlayın`
    );  
    
    if (resume) { 
      currentQuestion = savedProgress.currentQuestion || 0; 
    } else { 
      localStorage.removeItem('flashcardProgress'); 
      currentQuestion = 0; 
    } 
  } else { 
    currentQuestion = 0; 
  }  
  
  score = 0; 
  previousAnswers = new Array(selectedQuizData.length).fill(null); 

  document.getElementById('submit').style.display = 'inline-block'; 
  document.getElementById('previous').style.display = 'inline-block'; 
  displayQuestion(); 
}

function checkAnswer() { 
  currentQuestion++;  
  
  saveProgress();  
  
  if (currentQuestion < selectedQuizData.length) { 
    displayQuestion(); 
  } else { 
    displayResult(); 
    localStorage.removeItem('flashcardProgress'); 
  } 
}

function showPreviousQuestion() { 
  if (currentQuestion > 0) { 
    currentQuestion--; 
    saveProgress(); 
    displayQuestion(); 
  } 
}

function displayResult() { 
  const quizContainer = document.getElementById('quiz'); 
  const resultContainer = document.getElementById('result'); 
  quizContainer.style.display = 'none'; 
  document.getElementById('submit').style.display = 'none'; 
  document.getElementById('previous').style.display = 'none'; 
  resultContainer.innerHTML = `You reviewed all ${selectedQuizData.length} flashcards!`; 

  document.getElementById('exit').classList.remove('hide'); 
  document.getElementById('selectQuestionPage').classList.remove('hide'); 
}

function exitQuiz() { 
  window.location.href = 'index.html'; 
}

function goSelectQuestionPage() { 
  window.location.href = 'selectQuestion.html'; 
}

document.getElementById('submit').addEventListener('click', checkAnswer); 
document.getElementById('previous').addEventListener('click', showPreviousQuestion); 
document.getElementById('exit').addEventListener('click', exitQuiz); 
document.getElementById('selectQuestionPage').addEventListener('click', goSelectQuestionPage); 
document.getElementById('closeButton').addEventListener('click', () => { 
  window.location.href = 'index.html'; 
});

startQuiz();