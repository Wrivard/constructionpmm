// Career CV Upload Handler
window.careerCVFiles = {};
window.selectedJobs = {};

function addCV(formNumber) {
  if (window.careerCVFiles[formNumber]) {
    showCustomAlert('Vous avez déjà sélectionné un CV. Veuillez le retirer avant d\'en ajouter un autre.', 'warning');
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
        showCustomAlert('Le fichier est trop volumineux. Taille maximale : 5 Mo', 'error');
        return;
      }
      
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        showCustomAlert('Format non accepté. Veuillez sélectionner un fichier PDF, DOC ou DOCX.', 'error');
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

// Custom alert function for better UX
function showCustomAlert(message, type = 'info') {
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();
  
  const alert = document.createElement('div');
  alert.className = 'custom-alert';
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#28a745'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  alert.textContent = message;
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
  
  // Add animations
  if (!document.getElementById('alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
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
      addButtonContainer.innerHTML = '<button type="button" onclick="addCV(' + formNumber + ')" class="cv-upload-btn" style="background: #dc3545; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);">📄 Sélectionner un fichier</button>';
    }
  } else {
    const file = window.careerCVFiles[formNumber];
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    if (selectedCVDiv) selectedCVDiv.style.display = 'block';
    if (cvDisplay) {
      const spanElement = cvDisplay.querySelector('span');
      if (spanElement) spanElement.textContent = `✓ ${file.name} (${fileSizeMB} Mo)`;
    }
    if (addButtonContainer) {
      addButtonContainer.innerHTML = '<span style="color: #ffffff; font-style: italic; font-weight: 600;">✓ Fichier sélectionné</span>';
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
      e.target.style.background = '#c82333';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.4)';
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('cv-upload-btn')) {
      e.target.style.background = '#dc3545';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.3)';
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
        submitButton.style.background = '#dc3545';
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
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (response.status === 413) {
          throw new Error('Le fichier CV est trop volumineux. Maximum 5MB.');
        }
        
        let result;
        try {
          const responseText = await response.text();
          console.log('📡 Response text:', responseText);
          result = responseText ? JSON.parse(responseText) : null;
          console.log('📡 Parsed result:', result);
        } catch (parseError) {
          console.error('❌ Parse error:', parseError);
          if (!response.ok) {
            throw new Error(`Erreur serveur (${response.status})`);
          }
          throw parseError;
        }
        
        // Check if response is successful
        if (!response.ok) {
          console.error('❌ Response not OK');
          throw new Error(result?.message || `Erreur serveur (${response.status})`);
        }
        
        if (!result || !result.success) {
          console.error('❌ Result success is false or missing');
          throw new Error(result?.message || 'Erreur lors de l\'envoi');
        }
        
        console.log('✅ Form submission successful!');
        
        // Success animation
        try {
          if (submitButton) {
            console.log('🎨 Starting success animation...');
            const spinner = submitButton.querySelector('.submit-spinner');
            if (spinner) {
              spinner.remove();
              console.log('  - Spinner removed');
            }
            
            submitButton.value = '✓ Envoyé !';
            submitButton.style.background = '#28a745';
            submitButton.style.animation = 'successPulse 0.6s ease';
            console.log('  - Button styled for success');
            
            setTimeout(() => {
              try {
                console.log('🎬 Starting success timeout actions...');
                console.log('  - formElement:', formElement ? 'exists' : 'null');
                console.log('  - successMessage:', successMessage ? 'exists' : 'null');
                
                formElement.style.display = 'none';
                console.log('  - Form hidden');
                
                if (successMessage) {
                  successMessage.style.display = 'block';
                  const successText = successMessage.querySelector('.success-text');
                  if (successText) {
                    successText.textContent = 'Merci ! Votre candidature a été reçue avec succès.';
                    console.log('  - Success message displayed');
                  }
                } else {
                  console.warn('⚠️ Success message element not found!');
                }
                
                formElement.reset();
                delete window.careerCVFiles[formNumber];
                delete window.selectedJobs[formNumber];
                updateCVDisplay(formNumber);
                console.log('  - Form reset and cleaned up');
                console.log('✅ Success animation complete!');
              } catch (timeoutError) {
                console.error('❌ Error in success timeout:', timeoutError);
                console.error('Stack:', timeoutError.stack);
              }
            }, 1200);
          }
        } catch (animationError) {
          console.error('❌ Error in success animation:', animationError);
          console.error('Stack:', animationError.stack);
          // Don't throw - animation errors shouldn't show error message to user
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

// Enhanced Checkbox Functionality (Shadcn-inspired)
document.addEventListener('DOMContentLoaded', function() {
  // Find all checkboxes in the career forms
  const checkboxContainers = document.querySelectorAll('.form_checkbox, .w-checkbox');
  
  checkboxContainers.forEach(function(container) {
    const checkbox = container.querySelector('input[type="checkbox"]');
    const checkboxIcon = container.querySelector('.form_checkbox-icon-2, .w-checkbox-input');
    const label = container.querySelector('.form_checkbox-label, .w-form-label');
    
    if (!checkbox) return;
    
    // Make the entire container clickable
    container.addEventListener('click', function(e) {
      // Don't trigger if clicking directly on the input (it handles itself)
      if (e.target === checkbox) return;
      
      // Prevent default to avoid double-toggle
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle the checkbox
      checkbox.checked = !checkbox.checked;
      
      // Trigger change event for form validation
      const changeEvent = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(changeEvent);
      
      // Update visual state
      updateCheckboxVisual(container, checkbox, checkboxIcon);
    });
    
    // Also listen to the checkbox itself
    checkbox.addEventListener('change', function() {
      updateCheckboxVisual(container, checkbox, checkboxIcon);
    });
    
    // Initialize visual state
    updateCheckboxVisual(container, checkbox, checkboxIcon);
  });
  
  function updateCheckboxVisual(container, checkbox, icon) {
    if (!icon) return;
    
    if (checkbox.checked) {
      container.classList.add('checked');
      icon.classList.add('checked');
      icon.setAttribute('data-checked', 'true');
    } else {
      container.classList.remove('checked');
      icon.classList.remove('checked');
      icon.setAttribute('data-checked', 'false');
    }
  }
});
