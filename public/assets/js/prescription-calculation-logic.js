// calculate prescription tab
function showContent(type) {
    if (type === 'first') {
        document.getElementById('firstContent').classList.remove('d-none');
        document.getElementById('secondContent').classList.add('d-none');
        document.getElementById('thirdContent').classList.add('d-none');
        document.getElementById('model_btn1').classList.add('btn-primary');
        document.getElementById('model_btn2').classList.remove('btn-primary');
        document.getElementById('model_btn3').classList.remove('btn-primary');
    } else if (type === 'second') {
        document.getElementById('firstContent').classList.add('d-none');
        document.getElementById('thirdContent').classList.add('d-none');
        document.getElementById('secondContent').classList.remove('d-none');
        document.getElementById('model_btn2').classList.add('btn-primary');
        document.getElementById('model_btn1').classList.remove('btn-primary');
        document.getElementById('model_btn3').classList.remove('btn-primary');
    }
    else if (type === 'third') {
        document.getElementById('firstContent').classList.add('d-none');
        document.getElementById('secondContent').classList.add('d-none');
        document.getElementById('thirdContent').classList.remove('d-none');
        document.getElementById('model_btn3').classList.add('btn-primary');
        document.getElementById('model_btn1').classList.remove('btn-primary');
        document.getElementById('model_btn2').classList.remove('btn-primary');
    }
}



document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('#jobcardpowerdetails input');

  inputs.forEach(input => {
    const id = input.id;

    // Skip Near Vision (-vis) and (-axis)
    if (id.includes('-vis') || id.includes('-axis')) return;

    input.addEventListener('blur', function () {
      let value = parseFloat(this.value);

      if (!isNaN(value)) {
        // let formatted = Math.abs(value).toFixed(2);
        let formatted = value.toFixed(2);

        // Add '+' if the value is positive and doesn't already have '+' or '-'
        if (value > 0 && !this.value.trim().startsWith('+') && !this.value.trim().startsWith('-')) {
          formatted = '+' + formatted;
        }

        this.value = formatted;
      }
    });
  });
});

// document.addEventListener('DOMContentLoaded', function () {
//     const inputs = document.querySelectorAll('#jobcardpowerdetails input');

//     inputs.forEach(input => {
//         const id = input.id;

//         // Skip Near Vision (-vis) and (-axis)
//         if (id.includes('-vis') || id.includes('-axis')) return;

//         // Format on blur
//         input.addEventListener('blur', function () {
//             let value = parseFloat(this.value);

//             if (!isNaN(value)) {
//                 let formatted = value.toFixed(2);

//                 // Add '+' if positive
//                 if (value > 0 && !formatted.startsWith('+')) {
//                     formatted = '+' + formatted;
//                 }

//                 this.value = formatted;
//             }
//         });

//         // Keep '+' sign when focusing again
//         input.addEventListener('focus', function () {
//             if (this.value && !this.value.startsWith('+') && !this.value.startsWith('-')) {
//                 let value = parseFloat(this.value);
//                 if (!isNaN(value) && value > 0) {
//                     this.value = '+' + value.toFixed(2);
//                 }
//             }
//         });
//     });
// });




function updateInputsValue() {
    const inputs = document.querySelectorAll('#jobcardpowerdetails input');

    inputs.forEach(input => {
        const id = input.id;

        // Skip Near Vision (-vis) and (-axis)
        if (id.includes('-vis') || id.includes('-axis')) return;

        const rawValue = input.value.trim();

        // Skip if empty or just a sign
        if (rawValue === '' || rawValue === '+' || rawValue === '-') return;

        const value = parseFloat(rawValue);

        if (!isNaN(value)) {
            let formatted = Math.abs(value).toFixed(2);

            // Apply the correct sign
            if (value > 0) {
                formatted = '+' + formatted;
            } else if (value < 0) {
                formatted = '-' + formatted;
            }

            input.value = formatted;
        }
    });
};



// Eyewear Prescription right eye start
function updateTRSphDvER() {
    const rSphDvInput = document.getElementById("e-r-sph-dv");
    const rCylDvInput = document.getElementById("e-r-cyl-dv");
    const tRSphDvInput = document.getElementById("t-r-sph-dv");
    const rSphDv = parseFloat(rSphDvInput.value.trim());
    const rCylDv = parseFloat(rCylDvInput.value.trim());

    // If any input is blank, clear the result
    if (rSphDvInput.value.trim() === '' || rCylDvInput.value.trim() === '') {
        tRSphDvInput.value = '';
        return;
    }

    if (!isNaN(rSphDv) && !isNaN(rCylDv)) {
        const result = rSphDv + rCylDv;
        let formatted = Math.abs(result).toFixed(2);

        if (result > 0) {
            formatted = '+' + formatted;
        } else if (result < 0) {
            formatted = '-' + formatted;
        }

        tRSphDvInput.value = formatted;
    } else {
        tRSphDvInput.value = ''; // clear if either input is invalid
    }
}

// eyewear prescription start
function calculateNearVisionER() {

    const rSphDv = parseFloat(document.getElementById("e-r-sph-dv").value);
    const rAdd = parseFloat(document.getElementById("e-r-add").value);
    // calculate and set right transpose SPH-DV
    updateTRSphDvER();
    if (isNaN(rSphDv) || isNaN(rAdd) || rAdd < 0) {
        document.getElementById("e-r-sph-nv").value = '';
        return;
    }
    document.getElementById("e-r-sph-nv").value = (rSphDv + rAdd).toFixed(2);

}

function handleAddChangeER() {
    const rSphDv = document.getElementById("e-r-sph-dv").value;

    if (rSphDv) {
        calculateNearVisionER();
    }

    let eRAdd = parseFloat(document.getElementById("e-r-add").value);
    if (eRAdd < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid input',
            text: `Addition value can't be negative`,
        });
        document.getElementById("e-r-add").value = '';
        return;
    }
    if (isNaN(eRAdd)) {
        document.getElementById("t-r-add").value = "";
    } else {
        document.getElementById("t-r-add").value = eRAdd;
    }

    const trSphDv = parseFloat(document.getElementById("t-r-sph-dv").value);
    const trAdd = parseFloat(document.getElementById("t-r-add").value);
    if (isNaN(trSphDv) || isNaN(trAdd)) {
        return;
    }
    document.getElementById("t-r-sph-nv").value = (trSphDv + trAdd).toFixed(2);
    handleTransposeRightAxisER()
    handleCYLER()

}

function handleTransposeRightAxisER() {
    // Get the input element by ID
    const eraxisdv = document.getElementById("e-r-axis-dv");
    const eraxisnv = document.getElementById("e-r-axis-nv");
    const traxisdv = document.getElementById("t-r-axis-dv");
    const traxisnv = document.getElementById("t-r-axis-nv");

    if (eraxisdv.value > 180) {
        eraxisdv.value = 0.00;
    }

    // Copy AXIS from Distance Vision (D.V) to Near Vision (N.V)
    if (document.getElementById("e-r-add").value) eraxisnv.value = eraxisdv.value;

    if (eraxisdv && traxisdv) {
        const value = eraxisdv.value.trim(); // remove any spaces

        if (value !== "" && !isNaN(value)) {
            const inputVal = parseInt(value, 10);

            let result;
            if (inputVal > 90) {
                result = inputVal - 90;
            } else {
                result = inputVal + 90;
            }

            traxisdv.value = result;
            if (document.getElementById("t-r-add").value) traxisnv.value = result;
        } else {
            eraxisdv.value = "";
            eraxisnv.value = "";
            traxisdv.value = "";
            traxisnv.value = "";
        }
    } else {
        console.error("One or both elements not found.");
    }

}

function handleCYLER() {
    // Copy CYL from Distance Vision (D.V) to Near Vision (N.V)
    const ercyldv = document.getElementById("e-r-cyl-dv").value;
    if (document.getElementById("e-r-add").value) document.getElementById("e-r-cyl-nv").value = ercyldv;

    const number = parseFloat(ercyldv);
    const trsphdv = document.getElementById('t-r-sph-dv');
    const trcyldv = document.getElementById('t-r-cyl-dv');
    const trcylnv = document.getElementById('t-r-cyl-nv');

    if (!isNaN(number)) {
        const reversed = -number;
        let formatted = Math.abs(reversed).toFixed(2);

        if (reversed > 0) {
            formatted = '+' + formatted;
        } else if (reversed < 0) {
            formatted = '-' + formatted;
        } else {
            formatted = '0.00'; // or leave as '0.00' without sign
        }

        trcyldv.value = formatted;
        if (document.getElementById("e-r-add").value) trcylnv.value = formatted;
        updateTRSphDvER();
    } else {
        trsphdv.value = '';
        trcyldv.value = '';
        trcylnv.value = '';
    }
}

// Event listeners
document.getElementById("e-r-sph-dv").addEventListener("input", calculateNearVisionER);
document.getElementById("e-r-sph-dv").addEventListener("input", handleCYLER);
document.getElementById("e-r-cyl-dv").addEventListener("input", handleCYLER);
document.getElementById("e-r-axis-dv").addEventListener("input", handleTransposeRightAxisER);
document.getElementById("e-r-add").addEventListener("input", handleAddChangeER);

// Eyewear Prescription right eye end

function copyEyewear(el, side) {
    // Add pressed effect
    el.classList.add('pressed');

    // Remove after a short delay (like a press animation)
    setTimeout(() => {
        el.classList.remove('pressed');
    }, 150);

    if (side == 'eyewear_right') {
        // distance vision right to left copy
        document.getElementById("e-l-sph-dv").value = document.getElementById("e-r-sph-dv").value
        document.getElementById("e-l-cyl-dv").value = document.getElementById("e-r-cyl-dv").value
        document.getElementById("e-l-axis-dv").value = document.getElementById("e-r-axis-dv").value
        document.getElementById("e-l-vis-dv").value = document.getElementById("e-r-vis-dv").value

        // near vision right to left copy
        document.getElementById("e-l-sph-nv").value = document.getElementById("e-r-sph-nv").value
        document.getElementById("e-l-cyl-nv").value = document.getElementById("e-r-cyl-nv").value
        document.getElementById("e-l-axis-nv").value = document.getElementById("e-r-axis-nv").value
        document.getElementById("e-l-vis-nv").value = document.getElementById("e-r-vis-nv").value

        // add right to left copy
        document.getElementById("e-l-add").value = document.getElementById("e-r-add").value

        // set transpose
        calculateNearVisionEL();
        handleAddChangeEL();

        updateTRSphDvEL();
        handleCYLEL();
        handleTransposeRightAxisEL();
    }
    else if (side == 'eyewear_left') {

        // distance vision right to left copy
        document.getElementById("e-r-sph-dv").value = document.getElementById("e-l-sph-dv").value
        document.getElementById("e-r-cyl-dv").value = document.getElementById("e-l-cyl-dv").value
        document.getElementById("e-r-axis-dv").value = document.getElementById("e-l-axis-dv").value
        document.getElementById("e-r-vis-dv").value = document.getElementById("e-l-vis-dv").value

        // near vision right to left copy
        document.getElementById("e-r-sph-nv").value = document.getElementById("e-l-sph-nv").value
        document.getElementById("e-r-cyl-nv").value = document.getElementById("e-l-cyl-nv").value
        document.getElementById("e-r-axis-nv").value = document.getElementById("e-l-axis-nv").value
        document.getElementById("e-r-vis-nv").value = document.getElementById("e-l-vis-nv").value

        // add right to left copy
        document.getElementById("e-r-add").value = document.getElementById("e-l-add").value

        // set transpose
        calculateNearVisionER();
        handleAddChangeER();

        updateTRSphDvER();
        handleCYLER();
        handleTransposeRightAxisER();
    }

}


// Eyewear Prescription left eye start
function updateTRSphDvEL() {
    const lSphDvInput = document.getElementById("e-l-sph-dv");
    const lCylDvInput = document.getElementById("e-l-cyl-dv");
    const tLSphDvInput = document.getElementById("t-l-sph-dv");
    const lSphDv = parseFloat(lSphDvInput.value.trim());
    const lCylDv = parseFloat(lCylDvInput.value.trim());

    if (!isNaN(lSphDv) && !isNaN(lCylDv)) {
        const result = lSphDv + lCylDv;
        let formatted = Math.abs(result).toFixed(2);

        if (result > 0) {
            formatted = '+' + formatted;
        } else if (result < 0) {
            formatted = '-' + formatted;
        }

        tLSphDvInput.value = formatted;
    } else {
        tLSphDvInput.value = ''; // clear if either input is invalid
    }
}

function calculateNearVisionEL() {

    const lSphDv = parseFloat(document.getElementById("e-l-sph-dv").value);
    const lAdd = parseFloat(document.getElementById("e-l-add").value);
    // calculate and set right transpose SPH-DV
    updateTRSphDvEL();
    if (isNaN(lSphDv) || isNaN(lAdd) || lAdd < 0) {
        document.getElementById("e-l-sph-nv").value = '';
        return;
    }
    document.getElementById("e-l-sph-nv").value = (lSphDv + lAdd).toFixed(2);

}

function handleAddChangeEL() {
    const lSphDv = document.getElementById("e-l-sph-dv").value;

    if (lSphDv) {
        calculateNearVisionEL();
    }

    let eLAdd = parseFloat(document.getElementById("e-l-add").value);
    if (eLAdd < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid input',
            text: `Addition value can't be negative`,
        });
        document.getElementById("e-l-add").value = '';
        return;
    }
    if (isNaN(eLAdd)) {
        document.getElementById("t-l-add").value = "";
    } else {
        document.getElementById("t-l-add").value = eLAdd;
    }

    const tlSphDv = parseFloat(document.getElementById("t-l-sph-dv").value);
    const tlAdd = parseFloat(document.getElementById("t-l-add").value);

    if (isNaN(tlSphDv) || isNaN(tlAdd)) {
        return;
    }

    document.getElementById("t-l-sph-nv").value = (tlSphDv + tlAdd).toFixed(2);
    handleTransposeRightAxisEL();
    handleCYLEL();

}

function handleCYLEL() {

    // Copy CYL from Distance Vision (D.V) to Near Vision (N.V)
    const elcyldv = document.getElementById("e-l-cyl-dv").value;
    if (document.getElementById("e-l-add").value) document.getElementById("e-l-cyl-nv").value = elcyldv;

    const number = parseFloat(elcyldv);
    const tlsphdv = document.getElementById('t-l-sph-dv');
    const tlcyldv = document.getElementById('t-l-cyl-dv');
    const tlcylnv = document.getElementById('t-l-cyl-nv');

    if (!isNaN(number)) {
        const reversed = -number;
        let formatted = Math.abs(reversed).toFixed(2);

        if (reversed > 0) {
            formatted = '+' + formatted;
        } else if (reversed < 0) {
            formatted = '-' + formatted;
        } else {
            formatted = '0.00'; // or leave as '0.00' without sign
        }

        tlcyldv.value = formatted;
        if (document.getElementById("e-l-add").value) tlcylnv.value = formatted;
        updateTRSphDvEL();
    } else {
        tlsphdv.value = '';
        tlcyldv.value = '';
        tlcylnv.value = '';
    }
}

function handleTransposeRightAxisEL() {
    // Get the input element by ID
    const elaxisdv = document.getElementById("e-l-axis-dv");
    const elaxisnv = document.getElementById("e-l-axis-nv");
    const tlaxisdv = document.getElementById("t-l-axis-dv");
    const tlaxisnv = document.getElementById("t-l-axis-nv");

    if (elaxisdv.value > 180) {
        elaxisdv.value = 0.00;
    }

    // Copy AXIS from Distance Vision (D.V) to Near Vision (N.V)
    if (document.getElementById("e-l-add").value) elaxisnv.value = elaxisdv.value;

    if (elaxisdv && tlaxisdv) {
        const value = elaxisdv.value.trim(); // remove any spaces

        if (value !== "" && !isNaN(value)) {
            const inputVal = parseInt(value, 10);

            let result;
            if (inputVal > 90) {
                result = inputVal - 90;
            } else {
                result = inputVal + 90;
            }

            tlaxisdv.value = result;
            if (document.getElementById("t-l-add").value) tlaxisnv.value = result;
        } else {
            elaxisdv.value = "";
            elaxisnv.value = "";
            tlaxisdv.value = "";
            tlaxisnv.value = "";
        }
    } else {
        console.error("One or both elements not found.");
    }

}

// Event listeners
document.getElementById("e-l-sph-dv").addEventListener("input", calculateNearVisionEL);
document.getElementById("e-l-sph-dv").addEventListener("input", handleCYLEL);
document.getElementById("e-l-cyl-dv").addEventListener("input", handleCYLEL);
document.getElementById("e-l-axis-dv").addEventListener("input", handleTransposeRightAxisEL);
document.getElementById("e-l-add").addEventListener("input", handleAddChangeEL);

// Eyewear Prescription left eye end

// <!-- add start transpose -->

function calculateNearVisionTR() {

    const rSphDv = parseFloat(document.getElementById("t-r-sph-dv").value);
    const rAdd = parseFloat(document.getElementById("t-r-add").value);

    if (isNaN(rSphDv) || isNaN(rAdd) || rAdd < 0) {
        document.getElementById("t-r-sph-nv").value = '';
        return;
    }

    let result = parseFloat((rSphDv + rAdd).toFixed(2));
    let formatted = Math.abs(result).toFixed(2);

    if (result > 0) {
        formatted = '+' + formatted;
    } else if (result < 0) {
        formatted = '-' + formatted;
    }

    document.getElementById("t-r-sph-nv").value = formatted;

}

function handleCYLChangeTR() {
    // Copy CYL from Distance Vision (D.V) to Near Vision (N.V)
    let result = parseFloat(document.getElementById("t-r-cyl-dv").value);
    let formatted = Math.abs(result).toFixed(2);

    if (result > 0) {
        formatted = '+' + formatted;
    } else if (result < 0) {
        formatted = '-' + formatted;
    }

    // tRSphDvInput.value = formatted;
    document.getElementById("t-r-cyl-nv").value = formatted;
}

function handleAddChangeTR() {
    const rSphDv = document.getElementById("t-r-sph-dv").value;

    if (rSphDv) {
        calculateNearVisionTR();
    }

    let tRAdd = parseFloat(document.getElementById("t-r-add").value);
    if (tRAdd < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid input',
            text: `Addition value can't be negative`,
        });
        document.getElementById("t-r-add").value = '';
        return;
    }

    // Copy CYL and AXIS from Distance Vision (D.V) to Near Vision (N.V)
    document.getElementById("t-r-cyl-nv").value = isNaN(document.getElementById("t-r-cyl-dv").value) ? '' : document.getElementById("t-r-cyl-dv").value;
    document.getElementById("t-r-axis-nv").value = document.getElementById("t-r-axis-dv").value;
    handleCYLChangeTR();
}


// Event listeners
document.getElementById("t-r-sph-dv").addEventListener("input", calculateNearVisionTR);
document.getElementById("t-r-add").addEventListener("input", handleAddChangeTR);


// Transpose Prescription right eye end

function copyTranspose(el, side) {
    // Add pressed effect
    el.classList.add('pressed');

    // Remove after a short delay (like a press animation)
    setTimeout(() => {
        el.classList.remove('pressed');
    }, 150);

    if (side == 'transpose_right') {

        // distance vision right to left copy
        document.getElementById("t-l-sph-dv").value = document.getElementById("t-r-sph-dv").value
        document.getElementById("t-l-cyl-dv").value = document.getElementById("t-r-cyl-dv").value
        document.getElementById("t-l-axis-dv").value = document.getElementById("t-r-axis-dv").value
        document.getElementById("t-l-vis-dv").value = document.getElementById("t-r-vis-dv").value

        // near vision right to left copy
        document.getElementById("t-l-sph-nv").value = document.getElementById("t-r-sph-nv").value
        document.getElementById("t-l-cyl-nv").value = document.getElementById("t-r-cyl-nv").value
        document.getElementById("t-l-axis-nv").value = document.getElementById("t-r-axis-nv").value
        document.getElementById("t-l-vis-nv").value = document.getElementById("t-r-vis-nv").value

        // add right to left copy
        document.getElementById("t-l-add").value = document.getElementById("t-r-add").value
    }
    else if (side == 'transpose_left') {

        // distance vision right to left copy
        document.getElementById("t-r-sph-dv").value = document.getElementById("t-l-sph-dv").value
        document.getElementById("t-r-cyl-dv").value = document.getElementById("t-l-cyl-dv").value
        document.getElementById("t-r-axis-dv").value = document.getElementById("t-l-axis-dv").value
        document.getElementById("t-r-vis-dv").value = document.getElementById("t-l-vis-dv").value

        // near vision right to left copy
        document.getElementById("t-r-sph-nv").value = document.getElementById("t-l-sph-nv").value
        document.getElementById("t-r-cyl-nv").value = document.getElementById("t-l-cyl-nv").value
        document.getElementById("t-r-axis-nv").value = document.getElementById("t-l-axis-nv").value
        document.getElementById("t-r-vis-nv").value = document.getElementById("t-l-vis-nv").value

        // add right to left copy
        document.getElementById("t-r-add").value = document.getElementById("t-l-add").value
    }

}

function copyContact(el, side) {
    // Add pressed effect
    el.classList.add('pressed');

    // Remove after a short delay (like a press animation)
    setTimeout(() => {
        el.classList.remove('pressed');
    }, 150);

    if (side == 'contact_right') {

        // distance vision right to left copy
        document.getElementById("c-l-sph-dv").value = document.getElementById("c-r-sph-dv").value
        document.getElementById("c-l-cyl-dv").value = document.getElementById("c-r-cyl-dv").value
        document.getElementById("c-l-axis-dv").value = document.getElementById("c-r-axis-dv").value
        document.getElementById("c-l-vis-dv").value = document.getElementById("c-r-vis-dv").value

        // near vision right to left copy
        document.getElementById("c-l-sph-nv").value = document.getElementById("c-r-sph-nv").value
        document.getElementById("c-l-cyl-nv").value = document.getElementById("c-r-cyl-nv").value
        document.getElementById("c-l-axis-nv").value = document.getElementById("c-r-axis-nv").value
        document.getElementById("c-l-vis-nv").value = document.getElementById("c-r-vis-nv").value

        // add right to left copy
        document.getElementById("c-l-add").value = document.getElementById("c-r-add").value
    }
    else if (side == 'contact_left') {

        // distance vision right to left copy
        document.getElementById("c-r-sph-dv").value = document.getElementById("c-l-sph-dv").value
        document.getElementById("c-r-cyl-dv").value = document.getElementById("c-l-cyl-dv").value
        document.getElementById("c-r-axis-dv").value = document.getElementById("c-l-axis-dv").value
        document.getElementById("c-r-vis-dv").value = document.getElementById("c-l-vis-dv").value

        // near vision right to left copy
        document.getElementById("c-r-sph-nv").value = document.getElementById("c-l-sph-nv").value
        document.getElementById("c-r-cyl-nv").value = document.getElementById("c-l-cyl-nv").value
        document.getElementById("c-r-axis-nv").value = document.getElementById("c-l-axis-nv").value
        document.getElementById("c-r-vis-nv").value = document.getElementById("c-l-vis-nv").value

        // add right to left copy
        document.getElementById("c-r-add").value = document.getElementById("c-l-add").value
    }

}


// Transpose Prescription left eye
function calculateNearVisionTL() {

    const rSphDv = parseFloat(document.getElementById("t-l-sph-dv").value);
    const rAdd = parseFloat(document.getElementById("t-l-add").value);
    if (isNaN(rSphDv) || isNaN(rAdd) || rAdd < 0) {
        document.getElementById("t-l-sph-nv").value = '';
        return;
    }

    let result = parseFloat((rSphDv + rAdd).toFixed(2));
    let formatted = Math.abs(result).toFixed(2);

    if (result > 0) {
        formatted = '+' + formatted;
    } else if (result < 0) {
        formatted = '-' + formatted;
    }

    document.getElementById("t-l-sph-nv").value = formatted;
}

function handleCYLChangeTL() {
    // Copy CYL from Distance Vision (D.V) to Near Vision (N.V)
    let result = parseFloat(document.getElementById("t-l-cyl-dv").value);
    let formatted = Math.abs(result).toFixed(2);

    if (result > 0) {
        formatted = '+' + formatted;
    } else if (result < 0) {
        formatted = '-' + formatted;
    }

    // tRSphDvInput.value = formatted;
    document.getElementById("t-l-cyl-nv").value = formatted;
}

function handleAddChangeTL() {
    const rSphDv = document.getElementById("t-l-sph-dv").value;

    if (rSphDv) {
        calculateNearVisionTL();
    }

    let tLAdd = parseFloat(document.getElementById("t-l-add").value);
    if (tLAdd < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid input',
            text: `Addition value can't be negative`,
        });
        document.getElementById("t-l-add").value = '';
        return;
    }

    // Copy CYL and AXIS from Distance Vision (D.V) to Near Vision (N.V)
    document.getElementById("t-l-axis-nv").value = document.getElementById("t-l-axis-dv").value;
    handleCYLChangeTL();
}

// Event listeners
document.getElementById("t-l-sph-dv").addEventListener("input", calculateNearVisionTL);
document.getElementById("t-l-add").addEventListener("input", handleAddChangeTL);
// Transpose left end

document.getElementById('jobcardpowerdetails').addEventListener('hidden.bs.modal', function () {
    const inputs = this.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    showContent('first');
});


function submitPrescription(prescription) {
    updateInputsValue();

    if (prescription == 'eyewear') {
        // distance vision - eyewear - right
        document.getElementById('rdvsph').value = document.getElementById('e-r-sph-dv').value;
        document.getElementById('rdvcyl').value = document.getElementById('e-r-cyl-dv').value;
        document.getElementById('rdvaxis').value = document.getElementById('e-r-axis-dv').value;
        document.getElementById('rdvvis').value = document.getElementById('e-r-vis-dv').value;

        // near vision - eyewear - right
        document.getElementById('rnvsphr').value = document.getElementById('e-r-sph-nv').value;

        // add - right
        document.getElementById('radd').value = document.getElementById('e-r-add').value;

        // distance vision - eyewear - left
        document.getElementById('ldvsph').value = document.getElementById('e-l-sph-dv').value;
        document.getElementById('ldvcyl').value = document.getElementById('e-l-cyl-dv').value;
        document.getElementById('ldvaxis').value = document.getElementById('e-l-axis-dv').value;
        document.getElementById('ldvvis').value = document.getElementById('e-l-vis-dv').value;

        // near vision - eyewear - left
        document.getElementById('lnvsphl').value = document.getElementById('e-l-sph-nv').value;

        // add - left
        document.getElementById('ladd').value = document.getElementById('e-l-add').value;

    }

    else if (prescription == 'transpose') {
        // distance vision - Transpose - right
        document.getElementById('rdvsph').value = document.getElementById('t-r-sph-dv').value;
        document.getElementById('rdvcyl').value = document.getElementById('t-r-cyl-dv').value;
        document.getElementById('rdvaxis').value = document.getElementById('t-r-axis-dv').value;
        document.getElementById('rdvvis').value = document.getElementById('t-r-vis-dv').value;

        // near vision - Transpose - left
        document.getElementById('rnvsphr').value = document.getElementById('t-r-sph-nv').value;

        // add - right
        document.getElementById('radd').value = document.getElementById('t-r-add').value;

        // distance vision - Transpose - right
        document.getElementById('ldvsph').value = document.getElementById('t-l-sph-dv').value;
        document.getElementById('ldvcyl').value = document.getElementById('t-l-cyl-dv').value;
        document.getElementById('ldvaxis').value = document.getElementById('t-l-axis-dv').value;
        document.getElementById('ldvvis').value = document.getElementById('t-l-vis-dv').value;

        // near vision - Transpose - left
        document.getElementById('lnvsphl').value = document.getElementById('t-l-sph-nv').value;

        // add - right
        document.getElementById('ladd').value = document.getElementById('t-l-add').value;

    }

    else if (prescription == 'contact') {
        // distance vision - Transpose - right
        document.getElementById('rnvsph').value = document.getElementById('c-r-sph-dv').value;
        document.getElementById('rnvcyl').value = document.getElementById('c-r-cyl-dv').value;
        document.getElementById('rnvaxis').value = document.getElementById('c-r-axis-dv').value;
        document.getElementById('rnvvis').value = document.getElementById('c-r-vis-dv').value;

        // near vision - Transpose - left
        document.getElementById('rnvsphr').value = document.getElementById('c-r-sph-nv').value;

        // add - right
        document.getElementById('radd').value = document.getElementById('c-r-add').value;

        // distance vision - Transpose - right
        document.getElementById('lnvsph').value = document.getElementById('c-l-sph-dv').value;
        document.getElementById('lnvcyl').value = document.getElementById('c-l-cyl-dv').value;
        document.getElementById('lnvaxis').value = document.getElementById('c-l-axis-dv').value;
        document.getElementById('lnvvis').value = document.getElementById('c-l-vis-dv').value;

        // near vision - Transpose - left
        document.getElementById('lnvsphl').value = document.getElementById('c-l-sph-nv').value;

        // add - right
        document.getElementById('ladd').value = document.getElementById('c-l-add').value;


    }

    // close the modal
    const myModal = bootstrap.Modal.getInstance(document.getElementById('jobcardpowerdetails'));
    myModal.hide();

}


// <!-- end start transpose -->

// <!-- contact lens right eye start -->
function calculateNearVisionR() {

    const rSphDv = parseFloat(document.getElementById("c-r-sph-dv").value);
    const rAdd = parseFloat(document.getElementById("c-r-add").value);
    if (isNaN(rSphDv) || isNaN(rAdd) || radd < 0) {
        document.getElementById("c-r-sph-nv").value = '';
        console.log("Chirag")
        return;
    }

    document.getElementById("c-r-sph-nv").value = (rSphDv + rAdd).toFixed(2);

}

function handleAddChangeR() {
    const rSphDv = document.getElementById("c-r-sph-dv").value;

    if (rSphDv) {
        calculateNearVisionR();
    }
    let cRAdd = parseFloat(document.getElementById("c-r-add").value);
    if (cRAdd < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid input',
            text: `Addition value can't be negative`,
        });
        document.getElementById("c-r-add").value = '';
        document.getElementById("c-r-sph-nv").value = '';
        return;
    }
    handleContactRightAxis();
    handleCYLChangeCR();

}

function handleCYLChangeCR() {
    // Copy CYL from Distance Vision (D.V) to Near Vision (N.V)
    const ercyldv = document.getElementById("c-r-cyl-dv").value;

    const number = ercyldv;
    const trcyldv = document.getElementById('c-r-cyl-dv');
    const trcylnv = document.getElementById('c-r-cyl-nv');

    if (!isNaN(number)) {
        trcyldv.value = number;
        trcylnv.value = number;
    } else {
        trcyldv.value = '';
        trcylnv.value = '';
    }
}

function handleContactRightAxis() {
    const inputElement = document.getElementById("c-r-axis-dv");
    const outputElement = document.getElementById("c-r-axis-nv");

    let inputVal = inputElement.value.trim();

    // Check if input contains non-numeric characters
    if (!/^\d+$/.test(inputVal)) {
        inputElement.value = '';
        outputElement.value = '';
        return;
    }

    inputVal = parseInt(inputVal, 10);

    // If value is less than 1, clear the inputs
    if (inputVal < 1) {
        inputElement.value = '';
        outputElement.value = '';
    } else {
        outputElement.value = inputVal;
    }
}


// Event listeners
document.getElementById("c-r-sph-dv").addEventListener("input", calculateNearVisionR);
document.getElementById("c-r-add").addEventListener("input", handleAddChangeR);

// Contact Lens right eye end

// Contact Lens left eye start
function calculateNearVision() {

    const lSphDv = parseFloat(document.getElementById("c-l-sph-dv").value);
    const lAdd = parseFloat(document.getElementById("c-l-add").value);
    if (isNaN(lSphDv) || isNaN(lAdd) || lAdd < 0) {
        document.getElementById("c-l-sph-nv").value = '';
        return;
    }


    document.getElementById("c-l-sph-nv").value = (lSphDv + lAdd).toFixed(2);

}

function handleAddChangeCL() {
    const lSphDv = document.getElementById("c-l-sph-dv").value;

    if (lSphDv) {
        calculateNearVision();
    }

    let cLAdd = parseFloat(document.getElementById("c-l-add").value);
    if (cLAdd < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid input',
            text: `Addition value can't be negative`,
        });
        document.getElementById("c-l-add").value = '';
        return;
    }

    handleContactLeftAxis();
    handleCYLChangeCL();

}

function handleContactLeftAxis() {
    const inputElement = document.getElementById("c-l-axis-dv");
    const outputElement = document.getElementById("c-l-axis-nv");

    let inputVal = inputElement.value.trim();

    // Check if input contains non-numeric characters
    if (!/^\d+$/.test(inputVal)) {
        inputElement.value = '';
        outputElement.value = '';
        return;
    }

    inputVal = parseInt(inputVal, 10);

    // If value is less than 1, clear the inputs
    if (inputVal < 1) {
        inputElement.value = '';
        outputElement.value = '';
    } else {
        outputElement.value = inputVal;
    }
}

function handleCYLChangeCL() {
    // Copy CYL from Distance Vision (D.V) to Near Vision (N.V)
    const elcyldv = document.getElementById("c-l-cyl-dv").value;
    document.getElementById("c-l-cyl-nv").value = elcyldv;

    const number = elcyldv;
    const tlcyldv = document.getElementById('c-l-cyl-dv');
    const tlcylnv = document.getElementById('c-l-cyl-nv');

    if (!isNaN(number)) {
        tlcyldv.value = number;
        tlcylnv.value = number;
    } else {
        tlcyldv.value = '';
        tlcylnv.value = '';
    }
}

// Event listeners
document.getElementById("c-l-sph-dv").addEventListener("input", calculateNearVision);
document.getElementById("c-l-add").addEventListener("input", handleAddChangeCL);

// <!-- contact lens end -->

// Clear button clear all input values in model
function clearinputs() {
    const modal = document.getElementById('jobcardpowerdetails');
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    showContent('first'); // reset tab
}
