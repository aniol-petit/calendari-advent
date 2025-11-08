// ============================================
// LETTER PAGE SCRIPT - Handles question tab and return flag
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Extract day number from the current page
    const currentPath = window.location.pathname;
    const dayMatch = currentPath.match(/day(\d+)\.html/);
    if (!dayMatch) return;
    
    const dayNumber = parseInt(dayMatch[1]);
    
    // Set flag when user clicks "Back to Calendar" button
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            // Set flag to indicate we're returning from a letter page
            sessionStorage.setItem('returnedFromLetter', 'true');
            sessionStorage.setItem('returnedFromDay', dayNumber.toString());
        });
    }
    
    // Check if question was already shown for this day
    const questionShownKey = `questionShown_day${dayNumber}`;
    const questionShown = localStorage.getItem(questionShownKey);
    
    if (questionShown === 'true') {
        // Show the question tab
        showQuestionTab(dayNumber);
    }
});

// Show question tab in the letter page
function showQuestionTab(dayNumber) {
    // Check if tab already exists
    if (document.getElementById('question-tab')) {
        return;
    }
    
    const tab = document.createElement('button');
    tab.id = 'question-tab';
    tab.className = 'question-tab';
    tab.type = 'button';
    tab.setAttribute('aria-label', 'Veure pregunta del dia');
    tab.textContent = '❓';
    
    tab.addEventListener('click', function() {
        // Store current day and redirect to calendar
        sessionStorage.setItem('showQuestionForDay', dayNumber.toString());
        window.location.href = '../index.html';
    });
    
    // Add tab to the letter container
    const letterContainer = document.querySelector('.letter-container');
    if (letterContainer) {
        letterContainer.appendChild(tab);
    }
}

