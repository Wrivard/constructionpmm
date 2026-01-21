// Career CV Upload Handler
window.careerCVFiles = {};
window.selectedJobs = {};

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
      addButtonContainer.innerHTML = '<button type="button" onclick="addCV(' + formNumber + ')" class="cv-upload-btn" style="background: #d4a574; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(212, 165, 116, 0.3);">📄 Ajouter votre CV</button>';
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
      addButtonContainer.innerHTML = '<span style="color: #d4a574; font-style: italic; font-weight: 600;">✓ CV sélectionné</span>';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize CV displays
  for (let i = 1; i <= 3; i++) {
    updateCVDisplay(i);
  }
  
  // Add hover effect to CV upload buttons
  document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('cv-upload-btn')) {
      e.target.style.background = '#c99a66';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 8px rgba(212, 165, 116, 0.4)';
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('cv-upload-btn')) {
      e.target.style.background = '#d4a574';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 4px rgba(212, 165, 116, 0.3)';
    }
  });
  
  // Handle job selection when modal opens
  document.querySelectorAll('[data-w-id]').forEach(button => {
    button.addEventListener('click', function(e) {
      const jobTitle = this.closest('.career26_item')?.querySelector('.heading-style-h5')?.textContent?.trim();
      if (jobTitle) {
        const modalIndex = this.getAttribute('data-w-id').includes('38e6b010') ? 1 : 
                          this.getAttribute('data-w-id').includes('5134edfc') ? 2 : 3;
        window.selectedJobs[modalIndex] = jobTitle;
        
        // Update hidden field if it exists
        setTimeout(() => {
          const form = document.getElementById(`wf-form-Contact-1-Form-${modalIndex}`);
          if (form) {
            let jobInput = form.querySelector('input[name="Job-Title"]');
            if (jobInput) {
              jobInput.value = jobTitle;
            }
          }
        }, 100);
      }
    });
  });
  
  const forms = document.querySelectorAll('.career-form');
  forms.forEach((form, index) => {
    const formNumber = index + 1;
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formElement = e.target;
      const formData = new FormData(formElement);
      
      // Add CV file if selected
      if (window.careerCVFiles[formNumber]) {
        formData.append('Contact-1-CV', window.careerCVFiles[formNumber]);
      }
      
      // Add job title
      if (window.selectedJobs[formNumber]) {
        formData.append('Job-Title', window.selectedJobs[formNumber]);
      }
      
      const successMessage = formElement.querySelector('.w-form-done');
      const errorMessage = formElement.querySelector('.w-form-fail');
      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';
      
      const submitButton = formElement.querySelector('input[type="submit"]');
      const originalButtonValue = submitButton ? submitButton.value : '';
      
      // Create sending animation
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.position = 'relative';
        submitButton.style.background = '#d4a574';
        submitButton.value = '';
        
        // Add spinner animation
        const spinner = document.createElement('div');
        spinner.className = 'submit-spinner';
        spinner.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        `;
        submitButton.appendChild(spinner);
        
        // Add keyframe animation if not exists
        if (!document.getElementById('spinner-style')) {
          const style = document.createElement('style');
          style.id = 'spinner-style';
          style.textContent = `
            @keyframes spin {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes successPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `;
          document.head.appendChild(style);
        }
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
          // Success animation
          if (submitButton) {
            const spinner = submitButton.querySelector('.submit-spinner');
            if (spinner) spinner.remove();
            
            submitButton.value = '✓ Envoyé !';
            submitButton.style.background = '#4caf50';
            submitButton.style.animation = 'successPulse 0.6s ease';
            
            setTimeout(() => {
              formElement.style.display = 'none';
              if (successMessage) {
                successMessage.style.display = 'block';
                const successText = successMessage.querySelector('.success-text');
                if (successText) successText.textContent = 'Merci! Votre candidature a été reçue avec succès.';
              }
              formElement.reset();
              delete window.careerCVFiles[formNumber];
              delete window.selectedJobs[formNumber];
              updateCVDisplay(formNumber);
            }, 1200);
          }
        } else {
          throw new Error(result?.message || 'Erreur lors de l\'envoi');
        }
      } catch (error) {
        // Remove spinner on error
        if (submitButton) {
          const spinner = submitButton.querySelector('.submit-spinner');
          if (spinner) spinner.remove();
        }
        
        const errorMsg = error?.message?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'Une erreur est survenue.';
        if (errorMessage) {
          errorMessage.style.display = 'block';
          const errorText = errorMessage.querySelector('.error-text');
          if (errorText) errorText.textContent = errorMsg;
        }
      } finally {
        if (submitButton && !submitButton.value.includes('✓')) {
          submitButton.disabled = false;
          submitButton.value = originalButtonValue;
          submitButton.style.background = '';
        }
      }
    });
  });
});
