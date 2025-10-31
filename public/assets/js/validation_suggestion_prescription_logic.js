function enableEnterAsTab() {
  document.addEventListener('keydown', function (e) {
    const el = e.target;

    // Only run for input, select, textarea and when Enter is pressed
    if (
      ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) &&
      e.key === 'Enter'
    ) {
      e.preventDefault();

      // Find all visible, enabled, and not-readonly form fields
      const focusable = Array.from(document.querySelectorAll('input, select, textarea'))
        .filter(f => !f.disabled && !f.readOnly && f.offsetParent !== null);

      const index = focusable.indexOf(el);
      if (index > -1 && index + 1 < focusable.length) {
        focusable[index + 1].focus();
      }
    }
  });
}



document.addEventListener('DOMContentLoaded', enableEnterAsTab);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////Eye Prescription suggestion//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function createSuggestionsFromValue(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    const step = 0.25;
    const count = 4;
    const datalist = document.createElement('datalist');
    const datalistId = 'suggestion-' + Math.random().toString(36).substring(2, 8);
    datalist.id = datalistId;

    if (num === 0) {
        datalist.innerHTML = `<option value="0.00"></option>`;
        for (let i = 1; i < count; i++) {
            const val = (i * step).toFixed(2);
            datalist.innerHTML += `<option value="+${val}"></option><option value="-${val}"></option>`;
        }
    } else {
        for (let i = 0; i < count; i++) {
            // const val = (num + i * step).toFixed(2);
            // datalist.innerHTML += `<option value="+${val}"></option><option value="-${val}"></option>`;
            const val = Math.abs(num + i * step).toFixed(2);
            datalist.innerHTML += `<option value="+${val}"></option><option value="-${val}"></option>`;

        }
    }

    document.body.appendChild(datalist);
    return datalistId;
}

function isValidValue(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (num < -20 || num > 20) return false;

    return Math.abs(num * 100) % 25 === 0;
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input.eye');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = input.value.trim();
            const num = parseFloat(value);
            if (isNaN(num)) return;

            if (isValidValue(value)) {
              input.classList.remove('is-invalid');
              const datalistId = createSuggestionsFromValue(num);
              input.setAttribute('list', datalistId);
            }


        });

        input.addEventListener('blur', () => {
            const value = input.value.trim();
            if (value === '') {
                input.classList.remove('is-invalid');
                return;
            }

            if (!isValidValue(value)) {
                input.classList.add('is-invalid');
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Value',
                    html: `
              <div style="font-size: 16px;">
                Please enter a value between <b>-20.00</b> and <b>+20.00</b><br>
                Only in steps of <b>0.25</b>
              </div>
            `,
                    confirmButtonText: 'OK',
                }).then(() => input.focus());
            } else {
                input.classList.remove('is-invalid');
            }
        });
    });

    // Remove red border when modal is closed
    const modal = document.getElementById('jobcardpowerdetails');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', () => {
            modal.querySelectorAll('input.eye').forEach(i => i.classList.remove('is-invalid'));
        });
    }
});
