//selectQuestion.js
let quizData = []; // JSON data will be loaded here

// Load JSON data from LocalStorage
document.addEventListener('DOMContentLoaded', async () => {
  const storedQuizData = localStorage.getItem('quizData'); // JSON data created by sheetToJson.js

  if (storedQuizData) {
    try {
      quizData = JSON.parse(storedQuizData); // Load JSON data
      document.getElementById('questionCount').innerText = `Number of questions: ${quizData.length}`;
      document.getElementById('endQuestion').max = quizData.length; // Set maximum number of questions
      
      // Progress-based recommendation
      const webAppUrl = localStorage.getItem('webAppUrl');
      const sheetName = localStorage.getItem('currentSheetName');

      if (webAppUrl && webAppUrl !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
        const manager = new SheetProgressManager(webAppUrl, sheetName);
        const progress = await manager.loadProgress();
        
        if (progress && progress.length > 0) {
          const lastQuestion = manager.findLastStudiedQuestion(progress);
          const unstudied = manager.getUnstudiedQuestions(progress);
          const mostWrong = manager.getMostWrongQuestions(progress, 5);
          
          let message = '📊 İlerleme Durumunuz:\n\n';
          message += `✅ Son çalıştığınız soru: ${lastQuestion + 1}\n`;
          message += `📝 Hiç çalışılmamış soru: ${unstudied.length}\n`;
          message += `❌ En çok yanlış yapılan: ${mostWrong.length}\n\n`;
          message += 'Devam etmek ister misiniz?\n\n';
          message += 'Tamam: Soru ' + (lastQuestion + 2) + "'den başla\n";
          message += 'İptal: Manuel seçim yapacağım';
          
          const resume = confirm(message);
          
          if (resume && lastQuestion >= 0) {
            document.getElementById('startQuestion').value = lastQuestion + 2;
            document.getElementById('endQuestion').value = quizData.length;
          }
        }
      }
    } catch (error) {
      console.error('Error processing JSON data:', error);
    }
  } else {
    console.error('JSON data not found. Please ensure sheetToJson.js is working correctly.');
    document.getElementById('questionCount').innerText = 'Number of questions: Data not found!';
  }
});
// Start quiz process
document.getElementById('startQuiz').addEventListener('click', function () {
  const startInput = document.getElementById('startQuestion').value;
  const endInput = document.getElementById('endQuestion').value;
  const start = parseInt(startInput) - 1; // Adjust user input to indices
  const end = parseInt(endInput);

  if (isNaN(start) || isNaN(end) || start < 0 || end > quizData.length || start >= end) {
    alert('Please enter a valid start and end value.');
    return;
  }

  // Save selected range to localStorage
  localStorage.setItem('startQuestion', start);
  localStorage.setItem('endQuestion', end);

  // Save selected questions to localStorage
  const selectedQuizData = quizData.slice(start, end);
  localStorage.setItem('selectedQuizData', JSON.stringify(selectedQuizData));

  window.location.href = 'quiz.html'; // Redirect to question asking page
});

// Start flashcard process
document.getElementById('startFlashcard').addEventListener('click', function () {
  const startInput = document.getElementById('startQuestion').value;
  const endInput = document.getElementById('endQuestion').value;
  const start = parseInt(startInput) - 1; // Adjust user input to indices
  const end = parseInt(endInput);

  if (isNaN(start) || isNaN(end) || start < 0 || end > quizData.length || start >= end) {
    alert('Please enter a valid start and end value.');
    return;
  }

  // Save selected range to localStorage
  localStorage.setItem('startQuestion', start);
  localStorage.setItem('endQuestion', end);

  // Save selected questions to localStorage
  const selectedQuizData = quizData.slice(start, end);
  localStorage.setItem('selectedQuizData', JSON.stringify(selectedQuizData));

  window.location.href = 'flashcard.html'; // Redirect to flashcard page
});
// Close the window
document.getElementById('closeButton').addEventListener('click', () => {
  window.location.href = 'index.html';
});

