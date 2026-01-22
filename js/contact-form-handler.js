// Contact Form Handler
// Handles form submission with custom validation and animations
// 
// SETUP FORMSPREE:
// 1. Go to https://formspree.io/ and sign up (free)
// 2. Create a new form and get your Form ID
// 3. Replace 'YOUR_FORM_ID' in line ~167 with your actual Form ID
// Example: https://formspree.io/f/xyzabcd123

// Hide all success/error messages on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔒 Contact Form: Hiding all messages on page load...');
  
  // Hide all success messages
  const successMessages = document.querySelectorAll('.w-form-done');
  successMessages.forEach(msg => {
    msg.style.setProperty('display', 'none', 'important');
    msg.style.visibility = 'hidden';
  });
  
  // Hide all error messages
  const errorMessages = document.querySelectorAll('.w-form-fail');
  errorMessages.forEach(msg => {
    msg.style.setProperty('display', 'none', 'important');
    msg.style.visibility = 'hidden';
  });
  
  console.log(`✅ Hidden ${successMessages.length} success messages and ${errorMessages.length} error messages`);
  
  // Initialize contact form
  initializeContactForm();
});

function initializeContactForm() {
  const form = document.querySelector('#wf-form-Contact-11-Form');
  
  if (!form) {
    console.warn('⚠️ Contact form not found');
    return;
  }
  
  console.log('✅ Contact form found, attaching handler');
  
  // Prevent default Webflow form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📝 Contact form submission intercepted');
    await handleContactFormSubmit(form);
  });
}

async function handleContactFormSubmit(formElement) {
  console.log('🚀 Starting contact form submission...');
  console.log('='.repeat(50));
  
  try {
    // Get form elements
    const formParent = formElement.parentElement;
    const successMessage = formParent ? formParent.querySelector('.w-form-done') : null;
    const errorMessage = formParent ? formParent.querySelector('.w-form-fail') : null;
    
    console.log('📋 Form elements:', {
      formElement: formElement ? 'exists' : 'null',
      formParent: formParent ? 'exists' : 'null',
      successMessage: successMessage ? 'exists' : 'null',
      errorMessage: errorMessage ? 'exists' : 'null'
    });
    
    // Hide messages immediately and forcefully
    if (successMessage) {
      successMessage.style.setProperty('display', 'none', 'important');
      successMessage.style.visibility = 'hidden';
    }
    if (errorMessage) {
      errorMessage.style.setProperty('display', 'none', 'important');
      errorMessage.style.visibility = 'hidden';
    }
    
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
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      `;
      
      submitButton.parentElement.style.position = 'relative';
      submitButton.parentElement.appendChild(spinner);
      
      // Add keyframe animation if not exists
      if (!document.querySelector('#spinner-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spinner-keyframes';
        style.textContent = `
          @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      
      console.log('🎨 Sending animation started');
    }
    
    // Get form data
    console.log('📊 Collecting form data...');
    const formData = new FormData(formElement);
    
    const name = formData.get('Contact-11-Name');
    const email = formData.get('Contact-11-Email');
    const message = formData.get('Contact-11-Message');
    const acceptTermsCheckbox = formElement.querySelector('input[name="Contact-11-Checkbox"]');
    const acceptTerms = acceptTermsCheckbox && acceptTermsCheckbox.checked ? 'true' : 'false';
    
    console.log('Form data collected:', {
      name: name || 'N/A',
      email: email || 'N/A',
      messageLength: message ? message.length : 0,
      acceptTerms
    });
    
    // Client-side validation
    console.log('✅ Validating form data...');
    
    if (!name || !email || !message) {
      throw new Error('Tous les champs sont requis.');
    }
    
    if (acceptTerms !== 'true') {
      throw new Error('Vous devez accepter les conditions générales.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format d\'email invalide.');
    }
    
    console.log('✅ All validation passed');
    
    // Prepare form data for Formspree
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);
    formData.append('_subject', `Nouveau message de ${name}`);
    
    console.log('📤 Sending to Formspree...');
    
    // Submit to Formspree
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xwvvjbzd';
    
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('📥 Formspree response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const result = await response.json();
      console.error('Formspree error:', result);
      throw new Error('Une erreur est survenue lors de l\'envoi du message.');
    }
    
    const result = await response.json();
    console.log('Response data:', result);
    
    console.log('✅ Form submission successful!');
    console.log('🎉 Starting success animation...');
    
    // Success animation
    if (submitButton) {
      const spinner = submitButton.parentElement.querySelector('.submit-spinner');
      if (spinner) spinner.remove();
      
      submitButton.style.background = '#28a745';
      submitButton.value = '✓ Envoyé !';
      
      setTimeout(() => {
        console.log('🎭 Showing success message...');
        
        // Hide error message explicitly
        if (errorMessage) {
          errorMessage.style.setProperty('display', 'none', 'important');
          errorMessage.style.visibility = 'hidden';
          console.log('  - Error message hidden');
        }
        
        formElement.style.display = 'none';
        console.log('  - Form hidden');
        
        if (successMessage) {
          successMessage.style.setProperty('display', 'block', 'important');
          successMessage.style.visibility = 'visible';
          const successText = successMessage.querySelector('.success-text');
          if (successText) {
            successText.textContent = 'Merci ! Votre message a été envoyé avec succès.';
            console.log('  - Success message displayed');
          }
        } else {
          console.warn('⚠️ Success message element not found!');
        }
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ Form submission error:', error);
    
    // Get elements again in case they weren't captured
    const formParent = formElement.parentElement;
    const successMessage = formParent ? formParent.querySelector('.w-form-done') : null;
    const errorMessage = formParent ? formParent.querySelector('.w-form-fail') : null;
    const submitButton = formElement.querySelector('input[type="submit"]');
    
    // Remove spinner
    const spinner = submitButton?.parentElement?.querySelector('.submit-spinner');
    if (spinner) spinner.remove();
    
    // Reset button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.style.background = '';
      submitButton.value = 'Envoyée';
    }
    
    // Hide success message and show error message
    if (successMessage) {
      successMessage.style.setProperty('display', 'none', 'important');
      successMessage.style.visibility = 'hidden';
    }
    
    const errorMsg = error?.message?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'Une erreur est survenue.';
    if (errorMessage) {
      errorMessage.style.setProperty('display', 'block', 'important');
      errorMessage.style.visibility = 'visible';
      const errorText = errorMessage.querySelector('.error-text');
      if (errorText) errorText.textContent = errorMsg;
    }
    
    // Show custom toast
    showToast(errorMsg, 'error');
  }
}

// Custom toast notification
function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#28a745'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: 'PP Neue Montreal', Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    animation: slideInRight 0.3s ease-out;
  `;
  toast.textContent = message;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  if (!document.querySelector('#toast-keyframes')) {
    style.id = 'toast-keyframes';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

console.log('✅ Contact form handler loaded');
