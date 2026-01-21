// Career CV Upload Handler
window.careerCVFiles = {};

function addCV(formNumber) {
  if (window.careerCVFiles[formNumber]) {
    alert('Vous avez déjà sélectionné un CV. Veuillez le retirer avant d\'en ajouter un autre.');
    return;
  }
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  input.style.display = 'none';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const maxFileSize = 5 * 1024 * 1024;
      if (file.size > maxFileSize) {
        alert('Le fichier est trop volumineux. Maximum 5MB.');
        return;
      }
      
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        alert('Format non accepté. Veuillez sélectionner un fichier PDF, DOC ou DOCX.');
        return;
      }
      
      window.careerCVFiles[formNumber] = file;
      updateCVDisplay(formNumber);
    }
  };
  
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

function removeCV(formNumber) {
  delete window.careerCVFiles[formNumber];
  updateCVDisplay(formNumber);
}

function updateCVDisplay(formNumber) {
  const selectedCVDiv = document.getElementById(`selected-cv-${formNumber}`);
  const cvDisplay = document.getElementById(`cv-display-${formNumber}`);
  const addButtonContainer = document.getElementById(`add-cv-button-${formNumber}`);
  
  if (!window.careerCVFiles[formNumber]) {
    if (selectedCVDiv) selectedCVDiv.style.display = 'none';
    if (addButtonContainer) {
      addButtonContainer.innerHTML = '<button type="button" onclick="addCV(' + formNumber + ')" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;">📄 Ajouter votre CV</button>';
    }
  } else {
    const file = window.careerCVFiles[formNumber];
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    if (selectedCVDiv) selectedCVDiv.style.display = 'block';
    if (cvDisplay) {
      const spanElement = cvDisplay.querySelector('span');
      if (spanElement) spanElement.textContent = `${file.name} (${fileSizeMB} MB)`;
    }
    if (addButtonContainer) {
      addButtonContainer.innerHTML = '<span style="color: #666; font-style: italic;">CV sélectionné</span>';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  for (let i = 1; i <= 3; i++) {
    updateCVDisplay(i);
  }
  
  const forms = document.querySelectorAll('.career-form');
  forms.forEach((form, index) => {
    const formNumber = index + 1;
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formElement = e.target;
      const formData = new FormData(formElement);
      
      if (window.careerCVFiles[formNumber]) {
        formData.append('Contact-1-CV', window.careerCVFiles[formNumber]);
      }
      
      const successMessage = formElement.querySelector('.w-form-done');
      const errorMessage = formElement.querySelector('.w-form-fail');
      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';
      
      const submitButton = formElement.querySelector('input[type="submit"]');
      const originalButtonValue = submitButton ? submitButton.value : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.value = 'Envoi en cours...';
      }
      
      try {
        const response = await fetch('/api/submit-career-form', {
          method: 'POST',
          body: formData
        });
        
        if (response.status === 413) {
          throw new Error('Le fichier CV est trop volumineux. Maximum 5MB.');
        }
        
        let result;
        try {
          const responseText = await response.text();
          result = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          if (!response.ok) {
            throw new Error(`Erreur serveur (${response.status})`);
          }
          throw parseError;
        }
        
        if (result && result.success) {
          formElement.style.display = 'none';
          if (successMessage) {
            successMessage.style.display = 'block';
            const successText = successMessage.querySelector('.success-text');
            if (successText) successText.textContent = 'Merci! Votre candidature a été reçue avec succès.';
          }
          formElement.reset();
          delete window.careerCVFiles[formNumber];
          updateCVDisplay(formNumber);
        } else {
          throw new Error(result?.message || 'Erreur lors de l\'envoi');
        }
      } catch (error) {
        const errorMsg = error?.message?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'Une erreur est survenue.';
        if (errorMessage) {
          errorMessage.style.display = 'block';
          const errorText = errorMessage.querySelector('.error-text');
          if (errorText) errorText.textContent = errorMsg;
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.value = originalButtonValue;
        }
      }
    });
  });
});
