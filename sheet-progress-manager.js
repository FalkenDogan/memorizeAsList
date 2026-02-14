// sheet-progress-manager.js
// Google Sheets Progress Manager for Quiz/Flashcard Application

// Placeholder URL for Google Apps Script Web App
const PLACEHOLDER_WEBAPP_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

class SheetProgressManager {
  constructor(webAppUrl, sheetName) {
    this.webAppUrl = webAppUrl;
    this.sheetName = sheetName;
  }

  // Sheet'ten tüm progress'i çek (GET request)
  async loadProgress() {
    try {
      const response = await fetch(`${this.webAppUrl}?action=getProgress`);
      const data = await response.json();
      
      if (data.success && data.progress) {
        // Başarılı ise localStorage'a kaydet
        localStorage.setItem(`progress_${this.sheetName}`, JSON.stringify(data.progress));
        return data.progress;
      }
      
      throw new Error('Failed to load progress from sheet');
    } catch (error) {
      console.error('Error loading progress from sheet:', error);
      // Offline durumunda localStorage'dan yükle
      const cached = localStorage.getItem(`progress_${this.sheetName}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    }
  }

  // İlerleme kaydet (POST request)
  async updateProgress(rowIndex, isCorrect, mode = 'quiz') {
    const data = {
      action: 'updateProgress',
      row: rowIndex + 2, // +2 because spreadsheet row 1 is header and rowIndex is 0-based
      isCorrect: isCorrect,
      mode: mode
    };

    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result;
      }
      
      throw new Error('Failed to update progress');
    } catch (error) {
      console.error('Error updating progress:', error);
      // Offline ise queue'ya ekle
      this.addToOfflineQueue(data);
      return null;
    }
  }

  // Yanlış yapılan soruları getir (POST request)
  async getWrongAnswers() {
    const data = {
      action: 'getWrongAnswers'
    };

    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.wrongQuestions;
      }
      
      throw new Error('Failed to get wrong answers');
    } catch (error) {
      console.error('Error getting wrong answers:', error);
      return null;
    }
  }

  // Son çalışılan soruyu bul (local hesaplama)
  findLastStudiedQuestion(progress) {
    if (!progress || progress.length === 0) return -1;
    
    let lastQuestion = -1;
    let lastDate = null;
    
    progress.forEach((item, index) => {
      if (item.lastStudied) {
        const studiedDate = new Date(item.lastStudied);
        if (!lastDate || studiedDate > lastDate) {
          lastDate = studiedDate;
          lastQuestion = index;
        }
      }
    });
    
    return lastQuestion;
  }

  // Hiç çalışılmamış soruları bul
  getUnstudiedQuestions(progress) {
    if (!progress || progress.length === 0) return [];
    
    return progress.filter(item => {
      const correctCount = item.correctCount || 0;
      const wrongCount = item.wrongCount || 0;
      return correctCount === 0 && wrongCount === 0;
    });
  }

  // En çok yanlış yapılan soruları bul
  getMostWrongQuestions(progress, limit = 10) {
    if (!progress || progress.length === 0) return [];
    
    const wrongQuestions = progress
      .map((item, index) => ({
        ...item,
        index: index
      }))
      .filter(item => (item.wrongCount || 0) > 0)
      .sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0))
      .slice(0, limit);
    
    return wrongQuestions;
  }

  // Offline queue yönetimi
  addToOfflineQueue(data) {
    try {
      const queueKey = 'offline_queue';
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      queue.push(data);
      localStorage.setItem(queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  async syncOfflineQueue() {
    try {
      const queueKey = 'offline_queue';
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      
      if (queue.length === 0) return;
      
      const successfulItems = [];
      
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        try {
          const response = await fetch(this.webAppUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
          });
          
          const result = await response.json();
          
          if (result.success) {
            successfulItems.push(i);
          }
        } catch (error) {
          console.error('Error syncing item:', error);
        }
      }
      
      // Başarılı olanları queue'dan çıkar (ters sırayla)
      for (let i = successfulItems.length - 1; i >= 0; i--) {
        queue.splice(successfulItems[i], 1);
      }
      
      localStorage.setItem(queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Error syncing offline queue:', error);
    }
  }
}

// Make it globally available
window.SheetProgressManager = SheetProgressManager;
window.PLACEHOLDER_WEBAPP_URL = PLACEHOLDER_WEBAPP_URL;
