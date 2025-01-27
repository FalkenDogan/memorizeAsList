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
    const [ColumnA, ColumnB] = row.split(',');
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

// Function to handle button clicks
async function handleButtonClick(sheetLink) {
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
}

// Add event listeners to all buttons
document.querySelectorAll('button[data-link]').forEach(button => {
  button.addEventListener('click', () => {
    const sheetLink = button.getAttribute('data-link');
    handleButtonClick(sheetLink);
  });
});
