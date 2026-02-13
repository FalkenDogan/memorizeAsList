// progress-manager.js - İlerleme Yönetimi

// Export Progress (JSON dosyası indir)
function exportProgress() {
  const data = {
    quiz: JSON.parse(localStorage.getItem('quizProgress')),
    flashcard: JSON.parse(localStorage.getItem('flashcardProgress')),
    selectedQuizData: JSON.parse(localStorage.getItem('selectedQuizData')),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz-progress-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert('✅ İlerlemeniz indirildi!\n\nDosyayı güvenli bir yere kaydedin (Google Drive, OneDrive, vb.)');
}

// Import Progress (JSON dosyası yükle)
function importProgress() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // Verileri localStorage'a yükle
        if (data.quiz) {
          localStorage.setItem('quizProgress', JSON.stringify(data.quiz));
        }
        if (data.flashcard) {
          localStorage.setItem('flashcardProgress', JSON.stringify(data.flashcard));
        }
        if (data.selectedQuizData) {
          localStorage.setItem('selectedQuizData', JSON.stringify(data.selectedQuizData));
        }

        const quizInfo = data.quiz ? `Quiz: Soru ${(data.quiz.currentQuestion || 0) + 1}` : 'Quiz: Yok';
        const flashcardInfo = data.flashcard ? `Flashcard: Kart ${(data.flashcard.currentQuestion || 0) + 1}` : 'Flashcard: Yok';

        alert(`✅ İlerlemeniz yüklendi!\n\n${quizInfo}\n${flashcardInfo}\n\nSayfa yenileniyor...`);

        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        alert('❌ Hata: Geçersiz dosya formatı!\n\nLütfen doğru bir progress JSON dosyası seçin.');
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

// Show Progress Status
function showProgressStatus() {
  const quiz = JSON.parse(localStorage.getItem('quizProgress'));
  const flashcard = JSON.parse(localStorage.getItem('flashcardProgress'));
  const selected = JSON.parse(localStorage.getItem('selectedQuizData'));

  let message = '📊 İlerleme Durumu:\n\n';

  if (quiz) {
    message += `🎯 Quiz:\n`;
    message += `   Soru: ${quiz.currentQuestion + 1}\n`;
    message += `   Puan: ${quiz.score}\n`;
    message += `   Tarih: ${new Date(quiz.timestamp).toLocaleString('tr-TR')}\n\n`;
  } else {
    message += `🎯 Quiz: Kayıt yok\n\n`;
  }

  if (flashcard) {
    message += `🎴 Flashcard:\n`;
    message += `   Kart: ${flashcard.currentQuestion + 1}\n`;
    message += `   Tarih: ${new Date(flashcard.timestamp).toLocaleString('tr-TR')}\n\n`;
  } else {
    message += `🎴 Flashcard: Kayıt yok\n\n`;
  }

  if (selected) {
    message += `📚 Seçili Sorular: ${selected.length} adet`;
  } else {
    message += `📚 Seçili Sorular: Yok`;
  }

  alert(message);
}

// Clear All Progress
function clearProgress() {
  const confirm = window.confirm(
    '⚠️ TÜM İLERLEME VERİLERİ SİLİNECEK!\n\n' +
    '• Quiz ilerlemesi\n' +
    '• Flashcard ilerlemesi\n' +
    '• Seçili sorular\n\n' +
    'Emin misiniz?'
  );

  if (confirm) {
    localStorage.removeItem('quizProgress');
    localStorage.removeItem('flashcardProgress');
    localStorage.removeItem('selectedQuizData');
    alert('✅ Tüm ilerleme verileri temizlendi!');
    location.reload();
  }
}

// Sayfa yüklendiğinde durum göster
window.addEventListener('load', () => {
  const progressIndicator = document.getElementById('progressIndicator');
  if (!progressIndicator) return;

  const quiz = JSON.parse(localStorage.getItem('quizProgress'));
  const flashcard = JSON.parse(localStorage.getItem('flashcardProgress'));

  let html = '';

  if (quiz || flashcard) {
    if (quiz) {
      html += `<div class="progress-item">🎯 Quiz: Soru ${quiz.currentQuestion + 1} (Puan: ${quiz.score})</div>`;
    }
    if (flashcard) {
      html += `<div class="progress-item">🎴 Flashcard: Kart ${flashcard.currentQuestion + 1}</div>`;
    }
  } else {
    html = '<div class="progress-item">ℹ️ Kayıtlı ilerleme bulunmuyor</div>';
  }

  progressIndicator.innerHTML = html;
});
