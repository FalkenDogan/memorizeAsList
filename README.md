# memorizeAsList - Quiz & Flashcard Application

A web-based quiz and flashcard application that helps you learn from Google Sheets data.

## Features

- ✅ Import questions directly from Google Sheets
- ✅ Quiz mode with multiple choice questions
- ✅ Flashcard mode for self-paced learning
- ✅ Progress tracking (optional Google Sheets integration)
- ✅ Offline support with automatic sync
- ✅ Resume from where you left off

## Getting Started

1. Open `index.html` in your browser
2. Click on any sheet button to load questions
3. Select question range and start learning!

## Google Sheets Integration (Optional)

This feature allows you to:
- ✅ Save your progress to Google Sheets
- ✅ Track correct/wrong answer counts
- ✅ Resume from where you left off across devices
- ✅ Works with both quiz and flashcard modes
- ✅ Offline support with automatic sync

### Setup Instructions

#### Step 1: Prepare Your Google Sheet

Add the following columns to your Google Sheet (starting from column D):
- **Column D**: `Doğru Sayısı` (correctCount) - Number of correct answers
- **Column E**: `Yanlış Sayısı` (wrongCount) - Number of wrong answers
- **Column F**: `Son Çalışma` (lastStudied) - Last study date
- **Column G**: `Mod` (lastMode) - Last mode used (quiz/flashcard)

Your sheet structure should look like:
```
| A: Question | B: Separator | C: Answer | D: Correct | E: Wrong | F: Last Studied | G: Mode |
```

#### Step 2: Create Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Delete any existing code and paste the following:

```javascript
// Code.gs - Google Apps Script

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === 'updateProgress') {
    const row = data.row;
    const isCorrect = data.isCorrect;
    const mode = data.mode;
    
    const correctCount = sheet.getRange(row, 4).getValue() || 0;
    const wrongCount = sheet.getRange(row, 5).getValue() || 0;
    
    if (isCorrect) {
      sheet.getRange(row, 4).setValue(correctCount + 1);
    } else {
      sheet.getRange(row, 5).setValue(wrongCount + 1);
    }
    
    sheet.getRange(row, 6).setValue(new Date().toISOString().split('T')[0]);
    sheet.getRange(row, 7).setValue(mode);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Progress updated'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getWrongAnswers') {
    const dataRange = sheet.getDataRange().getValues();
    const wrongQuestions = [];
    
    dataRange.forEach((row, index) => {
      if (index === 0) return;
      const wrongCount = row[4] || 0;
      if (wrongCount > 0) {
        wrongQuestions.push({
          rowIndex: index + 1,
          question: row[0],
          answer: row[2],
          correctCount: row[3] || 0,
          wrongCount: wrongCount,
          lastStudied: row[5] || 'Never'
        });
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      wrongQuestions: wrongQuestions
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const action = e.parameter.action;
  
  if (action === 'getProgress') {
    const dataRange = sheet.getDataRange().getValues();
    const progress = [];
    
    dataRange.forEach((row, index) => {
      if (index === 0) return;
      progress.push({
        rowIndex: index + 1,
        question: row[0],
        separator: row[1],
        answer: row[2],
        correctCount: row[3] || 0,
        wrongCount: row[4] || 0,
        lastStudied: row[5] || null,
        lastMode: row[6] || null
      });
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      progress: progress
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (💾 icon)
5. Name your project (e.g., "Quiz Progress Tracker")

#### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: Quiz Progress Tracker
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Important**: Copy the Web App URL (it looks like: `https://script.google.com/macros/s/AKfycby.../exec`)
7. Click **Done**

#### Step 4: Update index.html

1. Open `index.html` in a text editor
2. Find all buttons with `data-webapp-url="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"`
3. Replace `YOUR_SCRIPT_ID` with your actual Web App URL from Step 3
4. Save the file

**Example:**
```html
<!-- Before -->
<button id="generate-json" 
  data-link="https://docs.google.com/spreadsheets/d/..." 
  data-webapp-url="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
  data-sheet-name="Sheet1">My Sheet</button>

<!-- After -->
<button id="generate-json" 
  data-link="https://docs.google.com/spreadsheets/d/..." 
  data-webapp-url="https://script.google.com/macros/s/AKfycby.../exec"
  data-sheet-name="Sheet1">My Sheet</button>
```

### How It Works

1. **Progress Tracking**: Every time you answer a question, the app sends your result to Google Sheets
2. **Offline Support**: If you're offline, answers are queued and synced when you're back online
3. **Resume Feature**: When you return to a quiz, you'll see your progress and can continue from where you left off
4. **Statistics**: Track which questions you get wrong most often

### Without Google Sheets Integration

The app works perfectly fine without Google Sheets integration:
- Progress is stored locally in your browser
- You can still resume quizzes
- Data persists until you clear browser data

**Note**: Without the Web App URL configured (or with the placeholder URL), the app automatically falls back to local storage only.

## File Structure

```
├── index.html                          # Main page with sheet selection
├── index_sheetToJson.js               # Handles Google Sheets data loading
├── selectColumnGenerateQuestion.html   # Column selection page
├── selectColumnGenerateQuestion.js     # Quiz generation logic
├── selectQuestion.html                 # Question range selection
├── selectQuestion.js                   # Question selection logic
├── quiz.html                          # Quiz interface
├── quiz.js                            # Quiz functionality
├── flashcard.html                     # Flashcard interface
├── flashcard.js                       # Flashcard functionality
├── sheet-progress-manager.js          # Google Sheets progress tracking
├── progress-manager.js                # Local progress management
└── styles.css                         # Styling
```

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Works well

## Privacy & Data

- All data is stored locally in your browser's localStorage
- With Google Sheets integration, data is sent only to your personal Google Sheet
- No third-party tracking or analytics
- You have full control over your data

## Troubleshooting

### Google Sheets Integration Not Working?

1. **Check the Web App URL**: Make sure you replaced `YOUR_SCRIPT_ID` in `index.html`
2. **Verify Deployment**: Go to Apps Script → Deploy → Manage deployments → Check if active
3. **Check Permissions**: The script needs permission to access your Google Sheet
4. **Browser Console**: Open Developer Tools (F12) and check for error messages
5. **Test the URL**: Visit the Web App URL directly in your browser - you should see JSON data

### Offline Queue Not Syncing?

- Check your internet connection
- The queue syncs automatically when you start a new quiz/flashcard session
- Check browser console for sync errors

### Progress Not Saving?

- Ensure columns D, E, F, G exist in your Google Sheet
- Check if the Web App deployment is active
- Try the "Test deployment" option in Apps Script

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is open source and available for personal and educational use.

## Support

If you encounter any issues, please check the troubleshooting section or open an issue on GitHub.
