// Simple Contact Form Handler - Formspree
// Configured for: https://formspree.io/f/xwvvjbzd

(function() {
  'use strict';
  
  console.log('🚀 Formspree handler loading...');
  
  // Wait for DOM to be ready
  function init() {
    const form = document.querySelector('#wf-form-Contact-11-Form');
    
    if (!form) {
      console.warn('⚠️ Contact form not found');
      return;
    }
    
    console.log('✅ Contact form found, attaching Formspree handler');
    
    // Remove any existing listeners by cloning
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add our listener
    newForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('📝 Form submitted, processing...');
      
      const submitBtn = newForm.querySelector('input[type="submit"]');
      const originalValue = submitBtn ? submitBtn.value : '';
      
      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = 'Envoi...';
        submitBtn.style.opacity = '0.6';
      }
      
      try {
        // Get form data
        const formData = new FormData(newForm);
        
        console.log('📤 Sending to Formspree...');
        
        // Send to Formspree
        const response = await fetch('https://formspree.io/f/xwvvjbzd', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('📥 Response received:', response.status, response.ok);
        
        if (response.ok) {
          // Success
          console.log('✅ Form submitted successfully!');
          
          if (submitBtn) {
            submitBtn.value = '✓ Envoyé!';
            submitBtn.style.background = '#28a745';
            submitBtn.style.opacity = '1';
          }
          
          // Hide form, show success message
          setTimeout(() => {
            newForm.style.display = 'none';
            const successMsg = newForm.parentElement.querySelector('.w-form-done');
            if (successMsg) {
              successMsg.style.display = 'block';
              successMsg.style.visibility = 'visible';
              const successText = successMsg.querySelector('.success-text');
              if (successText) {
                successText.textContent = 'Merci ! Votre message a été envoyé avec succès.';
              }
            }
          }, 1000);
          
        } else {
          throw new Error('Erreur ' + response.status);
        }
        
      } catch (error) {
        console.error('❌ Error:', error);
        
        // Show error message
        const errorMsg = newForm.parentElement.querySelector('.w-form-fail');
        if (errorMsg) {
          errorMsg.style.display = 'block';
          errorMsg.style.visibility = 'visible';
          const errorText = errorMsg.querySelector('.error-text');
          if (errorText) {
            errorText.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer.';
          }
        }
        
        // Reset button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.value = originalValue;
          submitBtn.style.opacity = '1';
        }
      }
    });
    
    console.log('✅ Formspree handler ready!');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();

console.log('📦 Formspree handler script loaded');
