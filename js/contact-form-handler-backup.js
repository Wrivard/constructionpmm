// Simple Contact Form Handler - Formspree
(function() {
  'use strict';
  
  // Wait for DOM to be ready
  function init() {
    const form = document.querySelector('#wf-form-Contact-11-Form');
    
    if (!form) {
      console.warn('⚠️ Contact form not found');
      return;
    }
    
    // Remove any existing listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add our listener
    newForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const submitBtn = newForm.querySelector('input[type="submit"]');
      const originalValue = submitBtn ? submitBtn.value : '';
      
      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = 'Envoi...';
      }
      
      try {
        // Get form data
        const formData = new FormData(newForm);
        
        // Send to Formspree
        const response = await fetch('https://formspree.io/f/xwvvjbzd', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Success
          if (submitBtn) {
            submitBtn.value = '✓ Envoyé!';
            submitBtn.style.background = '#28a745';
          }
          
          // Hide form, show success message
          setTimeout(() => {
            newForm.style.display = 'none';
            const successMsg = newForm.parentElement.querySelector('.w-form-done');
            if (successMsg) {
              successMsg.style.display = 'block';
              successMsg.style.visibility = 'visible';
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
        }
        
        // Reset button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.value = originalValue;
        }
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
