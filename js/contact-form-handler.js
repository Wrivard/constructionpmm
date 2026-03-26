// Contact / demande de soumission — Resend + multipart (téléphone, adresse, plans, images)
(function() {
  'use strict';

  var MAX_IMAGES = 5;
  var MAX_FILE_SIZE = 4 * 1024 * 1024;
  var MAX_TOTAL_SIZE = 4.5 * 1024 * 1024;
  var IMAGE_FIELD = 'Contact-11-Image[]';

  window.contact11PlanImages = window.contact11PlanImages || [];

  function currentTotalBytes() {
    return window.contact11PlanImages.reduce(function(sum, f) {
      return sum + (f && f.size ? f.size : 0);
    }, 0);
  }

  function updateContact11ImageDisplay() {
    var wrap = document.getElementById('contact11-selected-images');
    var list = document.getElementById('contact11-image-list');
    var btnWrap = document.getElementById('contact11-add-image-buttons');
    if (!wrap || !list || !btnWrap) return;

    if (window.contact11PlanImages.length === 0) {
      wrap.style.display = 'none';
    } else {
      wrap.style.display = 'block';
      list.innerHTML = window.contact11PlanImages.map(function(file, index) {
        var mb = (file.size / 1024 / 1024).toFixed(2);
        return (
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:4px;margin-bottom:6px;">' +
          '<span style="flex:1;font-size:14px;word-break:break-all;">' + file.name + ' (' + mb + ' Mo)</span>' +
          '<button type="button" data-remove-index="' + index + '" class="contact11-remove-image" style="background:#6c757d;color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;line-height:1;margin-left:8px;">×</button>' +
          '</div>'
        );
      }).join('');
      list.querySelectorAll('.contact11-remove-image').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var i = parseInt(btn.getAttribute('data-remove-index'), 10);
          removeContact11Image(i);
        });
      });
    }

    var remaining = MAX_IMAGES - window.contact11PlanImages.length;
    if (remaining > 0) {
      btnWrap.innerHTML = '<button type="button" class="contact11-add-image-btn" style="background:#dc3545;color:#fff;border:none;padding:10px 18px;border-radius:5px;cursor:pointer;font-size:14px;">+ Ajouter une image</button>';
      var nb = btnWrap.querySelector('.contact11-add-image-btn');
      if (nb) nb.addEventListener('click', addContact11Image);
    } else {
      btnWrap.innerHTML = '<span class="text-size-small" style="opacity:0.8;font-style:italic;">Nombre maximum d’images atteint</span>';
    }
  }

  function addContact11Image() {
    if (window.contact11PlanImages.length >= MAX_IMAGES) {
      window.alert('Maximum ' + MAX_IMAGES + ' images autorisées.');
      return;
    }

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.style.display = 'none';

    input.onchange = function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type || file.type.indexOf('image/') !== 0) {
        window.alert('Veuillez choisir un fichier image (JPG, PNG, GIF ou WebP).');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        window.alert('Le fichier est trop volumineux. Maximum 4 Mo par image.');
        return;
      }

      if (currentTotalBytes() + file.size > MAX_TOTAL_SIZE) {
        window.alert('La taille totale des images est trop importante. Maximum ~4,5 Mo au total (limite d’envoi). Réduisez la taille ou le nombre d’images.');
        return;
      }

      window.contact11PlanImages.push(file);
      updateContact11ImageDisplay();
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  function removeContact11Image(index) {
    window.contact11PlanImages.splice(index, 1);
    updateContact11ImageDisplay();
  }

  window.addContact11Image = addContact11Image;
  window.removeContact11Image = removeContact11Image;

  /**
   * Format nord-américain (10 chiffres), usage courant au Québec : (450) 272-8140
   * Accepte une entrée avec indicatif pays 1 optionnel.
   */
  function formatNaPhoneQuebec(input) {
    var el = input;
    var start = el.selectionStart;
    var before = el.value;
    var digitsBefore = before.slice(0, start).replace(/\D/g, '').length;

    var d = before.replace(/\D/g, '');
    if (d.length >= 11 && d.charAt(0) === '1') {
      d = d.slice(1);
    }
    d = d.slice(0, 10);

    var f = '';
    if (d.length > 0) {
      f = '(' + d.slice(0, Math.min(3, d.length));
    }
    if (d.length >= 4) {
      f += ') ' + d.slice(3, Math.min(6, d.length));
    }
    if (d.length >= 7) {
      f += '-' + d.slice(6, 10);
    }

    el.value = f;

    var newPos = 0;
    if (digitsBefore <= 0) {
      newPos = 0;
    } else if (digitsBefore >= d.length) {
      newPos = f.length;
    } else {
      var count = 0;
      for (var i = 0; i < f.length; i++) {
        if (/\d/.test(f[i])) {
          count++;
          newPos = i + 1;
          if (count >= digitsBefore) {
            break;
          }
        }
      }
    }

    try {
      el.setSelectionRange(newPos, newPos);
    } catch (e) {
      /* ignore */
    }
  }

  function bindQuebecPhoneFormatting(formEl) {
    var phoneInput = formEl.querySelector('#Contact-11-Phone');
    if (!phoneInput) return;

    phoneInput.setAttribute('maxlength', '14');
    phoneInput.setAttribute('inputmode', 'tel');
    phoneInput.setAttribute('autocomplete', 'tel');

    var run = function() {
      formatNaPhoneQuebec(phoneInput);
    };

    phoneInput.addEventListener('input', run);
    phoneInput.addEventListener('blur', run);
    phoneInput.addEventListener('paste', function() {
      window.setTimeout(run, 0);
    });
  }

  function init() {
    var form = document.querySelector('#wf-form-Contact-11-Form');
    if (!form) {
      console.warn('⚠️ Contact form not found');
      return;
    }

    var loadedAtField = form.querySelector('input[name="_form_loaded_at"]');
    if (loadedAtField) {
      loadedAtField.value = Date.now().toString();
    }

    var newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    bindQuebecPhoneFormatting(newForm);

    updateContact11ImageDisplay();

    newForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();

      var formParent = newForm.parentElement;
      var successMessage = formParent ? formParent.querySelector('.w-form-done') : null;
      var errorMessage = formParent ? formParent.querySelector('.w-form-fail') : null;

      if (successMessage) {
        successMessage.style.setProperty('display', 'none', 'important');
        successMessage.style.visibility = 'hidden';
      }
      if (errorMessage) {
        errorMessage.style.setProperty('display', 'none', 'important');
        errorMessage.style.visibility = 'hidden';
      }

      var submitBtn = newForm.querySelector('input[type="submit"]');
      var originalValue = submitBtn ? submitBtn.value : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = 'Envoi...';
        submitBtn.style.opacity = '0.6';
      }

      try {
        var termsCheckbox = newForm.querySelector('input[name="Contact-11-Checkbox"]');
        if (!termsCheckbox || !termsCheckbox.checked) {
          throw new Error('Vous devez accepter les conditions générales.');
        }

        var formData = new FormData(newForm);
        formData.append('acceptTerms', 'true');

        window.contact11PlanImages.forEach(function(file) {
          formData.append(IMAGE_FIELD, file);
        });

        var response = await fetch('/api/submit-contact-form', {
          method: 'POST',
          body: formData
        });

        if (response.status === 413) {
          throw new Error('Les images sont trop volumineuses. Veuillez réduire la taille des images ou en sélectionner moins. Maximum ~4,5 Mo au total.');
        }

        var responseText = await response.text();
        var result = null;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch (parseErr) {
            if (!response.ok) {
              throw new Error('Erreur serveur (' + response.status + ').');
            }
          }
        }

        if (!response.ok) {
          var msg = (result && result.message) ? result.message : ('Erreur ' + response.status);
          throw new Error(msg);
        }

        if (result && result.success === false) {
          throw new Error(result.message || 'Envoi refusé.');
        }

        if (submitBtn) {
          submitBtn.value = '✓ Envoyé!';
          submitBtn.style.background = '#28a745';
          submitBtn.style.opacity = '1';
        }

        window.contact11PlanImages = [];
        updateContact11ImageDisplay();

        setTimeout(function() {
          newForm.style.display = 'none';
          if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.style.visibility = 'visible';
            var successText = successMessage.querySelector('.success-text');
            if (successText) {
              successText.textContent = 'Merci ! Votre message a été envoyé avec succès.';
            }
          }
        }, 800);
      } catch (error) {
        console.error('❌ Error:', error);

        var raw = error && error.message ? error.message : 'Erreur lors de l\'envoi.';

        if (errorMessage) {
          errorMessage.style.display = 'block';
          errorMessage.style.visibility = 'visible';
          var errorText = errorMessage.querySelector('.error-text');
          if (errorText) {
            errorText.textContent = raw;
          }
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.value = originalValue;
          submitBtn.style.opacity = '1';
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
