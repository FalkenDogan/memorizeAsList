// Process the link provided by the user
function convertToCsvLink(sheetUrl) {
  const regexWithGid = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/.*gid=([0-9]+)/;
  const regexWithUsp = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit\?usp=drivesdk/;
  const matchWithUsp = sheetUrl.match(regexWithUsp);
  if (matchWithUsp) {
    const sheetId = matchWithUsp[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  }

  const matchWithGid = sheetUrl.match(regexWithGid);
  if (matchWithGid) {
    const sheetId = matchWithGid[1];
    const gid = matchWithGid[2];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  throw new Error('Geçersiz Google Sheets linki. Lütfen tam linki girin.');
}

// Fetch CSV data from Google Sheets and convert it to JSON
async function fetchGoogleSheetData(sheetUrl) {
  const response = await fetch(sheetUrl);
  if (!response.ok) {
    throw new Error(`Google Sheets linki hatalı: ${response.statusText}`);
  }
  const csvData = await response.text();

  // Convert CSV to JSON format
  const rows = csvData.split('\n');
  return rows.slice(1).map(row => {
    const [ColumnA, ColumnB] = row.split(',|,');
    return { ColumnA: ColumnA?.trim(), ColumnB: ColumnB?.trim() };
  });
}

// Shuffle the array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Generate Quiz 
function generateQuiz(inputList) {
  const quizData = [];

  inputList.forEach((map) => {
    const question = map["ColumnA"];
    const correctAnswer = map["ColumnB"];

    // Set used to select incorrect answers
    const optionsSet = new Set();
    optionsSet.add(correctAnswer);

    // Random incorrect options are being selected
    while (optionsSet.size < 4) {
      const randomEntry = inputList[Math.floor(Math.random() * inputList.length)];
      optionsSet.add(randomEntry["ColumnB"]);
    }

    // Shuffle the options
    const options = Array.from(optionsSet);
    shuffleArray(options);

    // Create the question structure
    quizData.push({
      question: question,
      options: options,
      answer: correctAnswer,
    });
  });

  return quizData;
}

// Add event listeners to buttons
document.getElementById('miss-day-and-night-1').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1jluqCaMbfK5JxGjT8w8XKqsvdUgy2vNI7GFwot7jnqg/edit?gid=1917887240#gid=1917887240');
});

document.getElementById('miss-day-and-night-2').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1jluqCaMbfK5JxGjT8w8XKqsvdUgy2vNI7GFwot7jnqg/edit?gid=1642463596#gid=1642463596');
});

document.getElementById('miss-day-and-night-3').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1jluqCaMbfK5JxGjT8w8XKqsvdUgy2vNI7GFwot7jnqg/edit?gid=1379391506#gid=1379391506');  
});
document.getElementById('miss-day-and-night-3').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1jluqCaMbfK5JxGjT8w8XKqsvdUgy2vNI7GFwot7jnqg/edit?gid=1379391506#gid=1379391506');  
});
document.getElementById('insta-hochdeutschhochturkce').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1kiKWxExaaF74gbqRYdWrwexbDC_TZ-kOWjVLLuvcIlc/edit?gid=1901053947#gid=1901053947');  
});
document.getElementById('insta-micheda').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1kiKWxExaaF74gbqRYdWrwexbDC_TZ-kOWjVLLuvcIlc/edit?gid=1720778446#gid=1720778446');  
});
document.getElementById('womit-damit').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1rVZ7lyUQVjZj-b1Te4MQq9Zho9YGJRT3R_P03KpcaVg/edit?gid=0#gid=0');  
});

//IHK VORBEREITUNG
document.getElementById('ipv4').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1gPIRYrbfPxcgd-HZw_lEaCqhY9rfKzqRlRbGndEZDac/edit?gid=0#gid=0');
});

document.getElementById('it-abkurzung').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1gPIRYrbfPxcgd-HZw_lEaCqhY9rfKzqRlRbGndEZDac/edit?gid=1191674173#gid=1191674173');
});

document.getElementById('ihk-frage-karten').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1gPIRYrbfPxcgd-HZw_lEaCqhY9rfKzqRlRbGndEZDac/edit?gid=314203259#gid=314203259');
});

document.getElementById('it-begriffe').addEventListener('click', () => {
  window.open('https://docs.google.com/spreadsheets/d/1Twu49Yf3sGDwB6h3nE62LwdgYR_L7oAfcxLPAKYNBbk/edit?gid=0#gid=0');
});

// Process user input to create a quiz and redirect to the next page
document.getElementById('generate-json').addEventListener('click', async () => {
  const sheetLink = document.getElementById('sheet-link').value;

  try {
    // Convert Google Sheets data to JSON
    const csvLink = convertToCsvLink(sheetLink);
    const jsonData = await fetchGoogleSheetData(csvLink);

    // Generate quiz data
    const quizData = generateQuiz(jsonData);

    // Save JSON data to localStorage
    localStorage.setItem('quizData', JSON.stringify(quizData));

    // Redirect the user to the Quiz page
    window.location.href = 'selectQuestion.html';
  } catch (error) {
    alert(`Hata: ${error.message}`);
    console.error('Hata:', error);
  }
});