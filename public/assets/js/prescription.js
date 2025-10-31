$(document).ready(function () {
    // // console.log("this is sales js file.");
    $('#prescriptionForm').on('submit', function (e) {
        e.preventDefault();

        toggleOverlay(true); // Show overlay

        $.ajax({
            url: "/prescription/store",
            method: 'POST',
            data: $(this).serialize(),
            success: function (res) {
                toggleOverlay(false); // Hide overlay

                if (res.success) {
                    toastr.success(res.message);
                    $('#prescriptionForm')[0].reset();

                    if (res.download) {
                        // ✅ Open PDF/download link in a new tab instead of auto download
                        window.open(res.download, '_blank');
                    }
                } else {
                    toastr.error(res.error || 'Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false); // Hide overlay

                if (xhr.status === 422 && xhr.responseJSON.error) {
                    toastr.error(xhr.responseJSON.error);
                } else if (xhr.responseJSON && xhr.responseJSON.message) {
                    toastr.error(xhr.responseJSON.message); // Server side error
                } else {
                    toastr.error('Something went wrong.');
                }
            }
        });
    });


    // -----------------prescription in details ---------------------

    // Copy prescription from right to left and vice versa for eyewear, transpose, and contact tabs
    function copyPrescription(fromSide, toSide, prefix) {
        const fields = [
            'dv_sph', 'dv_cyl', 'dv_axis', 'dv_vis',
            'cl_sph', 'cl_cyl', 'cl_axis', 'cl_vis',
            'nv_sph', 'add'
        ];

        fields.forEach(field => {
            const fromInput = $(`input[name="${prefix}_${fromSide}_${field}"]`);
            const toInput = $(`input[name="${prefix}_${toSide}_${field}"]`);

            if (fromInput.length && toInput.length) {
                toInput.val(fromInput.val());
            }
        });
    }

    // Eyewear tab (prefix: ep)
    $(document).on('click', '#rightcpy', function () {
        copyPrescription('right', 'left', 'ep');
    });
    $(document).on('click', '#leftcpy', function () {
        copyPrescription('left', 'right', 'ep');
    });

    // Transpose tab (prefix: t)
    $(document).on('click', '#rightcpy', function () {
        if ($('#transpose').hasClass('active')) {
            copyPrescription('right', 'left', 't');
        }
    });
    $(document).on('click', '#leftcpy', function () {
        if ($('#transpose').hasClass('active')) {
            copyPrescription('left', 'right', 't');
        }
    });

    // Contact Lens tab (prefix: c)
    $(document).on('click', '#rightcpy', function () {
        if ($('#contact').hasClass('active')) {
            copyPrescription('right', 'left', 'c');
        }
    });
    $(document).on('click', '#leftcpy', function () {
        if ($('#contact').hasClass('active')) {
            copyPrescription('left', 'right', 'c');
        }
    });



    //-------------------------------------------------customer data suggestion--------------------------------------------------------
    $(document).on('keyup', '.customer-field', function () {
        const query = $(this).val().trim();
        const $input = $(this);
        const inputOffset = $input.offset();
        const inputHeight = $input.outerHeight();
        const inputWidth = $input.outerWidth();

        if (query.length < 3) {
            $('.customer-suggestions').remove();
            return;
        }

        $.ajax({
            url: "/customer-autocomplete-jobcard",
            type: "GET",
            data: { query: query },
            success: function (res) {
                $('.customer-suggestions').remove();

                if (!res.length) return;

                const $list = $('<ul class="list-group customer-suggestions bg-white shadow rounded" style="z-index:1000; position:absolute;"></ul>')
                    .css({
                        top: inputOffset.top + inputHeight,
                        left: inputOffset.left,
                        width: inputWidth
                    });

                res.forEach(c => {
                    const item = $(`
                    <li class="list-group-item list-group-item-action"
                        data-customer='${JSON.stringify(c)}'>
                        <strong>${c.name}</strong><br>
                        <small>${c.mobile}</small><br>
                        <small>${c.email}</small>
                    </li>
                `);
                    $list.append(item);
                });

                $('body').append($list);
            },
            error: function (err) {
                console.error("Customer autocomplete failed", err);
            }
        });
    });

    // On selecting a suggestion
    $(document).on('click', '.customer-suggestions li', function () {
        const data = $(this).data('customer');

        $('input[name=cust_id]').val(data.cust_id);
        $('input[name=name]').val(data.name);
        $('input[name=mobile]').val(data.mobile);
        $('input[name=email]').val(data.email);
        $('.customer-suggestions').remove();
    });

    // Close suggestion box when clicked outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.customer-field, .customer-suggestions').length) {
            $('.customer-suggestions').remove();
        }
    });


    // --------------------------tested_by field handling---------------------------


    $('select[name="tested_by"]').on('change', function () {
        const type = $(this).val();
        toggleOverlay(true);

        if (type === 'Self') {
            $.ajax({
                url: '/test-refer-suggestions-jobcard',
                type: 'GET',
                data: { type: 'Self' },
                success: function (res) {
                    toggleOverlay(false);
                    let options = `<option value="">Select Employee</option>`;
                    res.users.forEach(user => {
                        options += `<option value="${user.name}" data-id="${user.id}">${user.name}</option>`;
                    });

                    $('#emp-wrapper').html(`
                        <label class="form-label">Tested by Name</label>
                        <select name="emp" class="form-select" id="emp-select" >${options}</select>
                    `);

                    $('#emp-hospital').val(''); // Clear hidden field

                    // --- Handle select change to fill ID ---
                    $('#emp-select').on('change', function () {
                        const selectedId = $(this).find(':selected').data('id');
                        $('#emp-hospital').val(selectedId);
                    });
                },
                error: function (xhr) {
                    toggleOverlay(false);
                    toastr.error("Error fetching users: " + xhr.responseText, "Error", {
                        closeButton: true,
                        progressBar: true,
                        timeOut: 5000
                    });
                }
            });
        } else {
            toggleOverlay(false);
            // Show input for typing doctor name
            $('#emp-wrapper').html(`
            <label class="form-label">Tested by Name</label>
            <input type="text" name="emp" class="form-control" id="emp-input" autocomplete="off">
            <ul class="list-group position-absolute bg-white shadow w-fit" id="doctor-suggestions" style="z-index: 10;"></ul>
        `);
            $('#emp-hospital').val(''); // clear hidden field
        }
    });


    // --- EMP input doctor suggestions ---
    $(document).on('keyup', '#emp-input', function () {
        const query = $(this).val();
        if (query.length < 3) return $('#doctor-suggestions').empty();

        $.ajax({
            url: '/test-refer-suggestions-jobcard',
            type: 'GET',
            data: { type: 'Outside', query: query },
            success: function (res) {
                const suggestions = res.doctors.map(doctor =>
                    `<li class="list-group-item list-group-item-action" data-id="${doctor.dr_id}" data-name="${doctor.name}">${doctor.name}</li>`
                ).join('');
                $('#doctor-suggestions').html(suggestions);
            },
            error: function (xhr) {
                alert("Error fetching doctor suggestions: " + xhr.responseText);
            }
        });
    });

    // --- When doctor selected from suggestions ---
    $(document).on('click', '#doctor-suggestions li', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');

        $('#emp-input').val(name);
        $('#emp-hospital').val(id);
        $('#doctor-suggestions').empty();
    });


    //refre by is selected  None then triger
    $('select[name="tested_by"]').on('change', function () {
        let val = $(this).val();

        if (val === "None") {
            // emp-hospital (hidden input) और emp-wrapper (doctor name) दोनों छुपा दो
            $('#emp-hospital, #emp-wrapper')
                .hide()
                .prop('disabled', true);

            // values clear कर दो
            $('#emp-hospital').val('');
            $('#emp-input').val('');
        } else {
            $('#emp-hospital, #emp-wrapper')
                .show()
                .prop('disabled', false);
        }
    }).trigger('change');



    //----------------------------cluclation -----------------------

    let userModified = {
        gst_amount: false,
        total_rs: false
    };

    $('input[name="gst_amount"], input[name="total_rs"]').on('input', function () {
        userModified[$(this).attr('name')] = true;
    });

    function calculatePrescriptionTotals() {
        const presRs = parseFloat($('input[name="pres_rs"]').val()) || 0;
        const discount = parseFloat($('input[name="discount"]').val()) || 0;
        const gstType = $('select[name="gst_type"]').val();
        const gstPercentStr = $('select[name="choose_gst"]').val();
        const gstPercent = parseFloat((gstPercentStr || '0').replace('%', '')) || 0;

        let basePrice = 0;
        let gstAmount = 0;
        let finalTotal = 0;

        if (gstType === "Included") {
            finalTotal = presRs - discount;
            gstAmount = (finalTotal * gstPercent) / (100 + gstPercent);
            basePrice = finalTotal - gstAmount;
        } else if (gstType === "Excluded") {
            basePrice = presRs - discount;
            gstAmount = (basePrice * gstPercent) / 100;
            finalTotal = basePrice + gstAmount;
        }

        gstAmount = isNaN(gstAmount) ? 0 : parseFloat(gstAmount.toFixed(2));
        finalTotal = isNaN(finalTotal) ? 0 : parseFloat(finalTotal.toFixed(2));

        if (!userModified.gst_amount) {
            $('input[name="gst_amount"]').val(gstAmount.toFixed(2));
        }
        if (!userModified.total_rs) {
            $('input[name="total_rs"]').val(finalTotal.toFixed(2));
        }
    }

    // Reset override when inputs change
    $('input[name="pres_rs"], input[name="discount"], select[name="gst_type"], select[name="choose_gst"]').on('input change', function () {
        let userModified = {
            gst_amount: false,
            total_rs: false,
        };
        calculatePrescriptionTotals();
    });

    // Initial calculation
    calculatePrescriptionTotals();


});





//prescription calculation

// document.addEventListener("DOMContentLoaded", function () {
//     const prescriptionSection = document.querySelector("#prescriptionTabsCalcucation");
//     if (!prescriptionSection) return;

//     // Enable Enter as Tab
//     prescriptionSection.addEventListener("keydown", function (event) {
//         if (event.key === "Enter" && event.target.matches("input, select, textarea")) {
//             event.preventDefault();
//             const focusableElements = Array.from(
//                 prescriptionSection.querySelectorAll("input, select, textarea")
//             ).filter(el => !el.disabled && !el.readOnly && el.offsetParent !== null);

//             let index = focusableElements.indexOf(event.target);
//             if (index > -1 && index + 1 < focusableElements.length) {
//                 focusableElements[index + 1].focus();
//             }
//         }
//     });

//     // Function: validate values
//     function isValidValue(value) {
//         const num = parseFloat(value);
//         if (isNaN(num)) return false;
//         if (num < -20 || num > 20) return false;
//         return Math.abs(num * 100) % 25 === 0;
//     }

//     // Function: create suggestions (same as eye script)
//     function createSuggestionsFromValue(value) {
//         const num = parseFloat(value);
//         if (isNaN(num)) return [];

//         const step = 0.25;
//         const count = 4;
//         let suggestions = [];

//         if (num === 0) {
//             suggestions.push("0.00");
//             for (let i = 1; i < count; i++) {
//                 const val = (i * step).toFixed(2);
//                 suggestions.push("+" + val, "-" + val);
//             }
//         } else {
//             for (let i = 0; i < count; i++) {
//                 const val = Math.abs(num + i * step).toFixed(2);
//                 suggestions.push("+" + val, "-" + val);
//             }
//         }

//         return suggestions;
//     }

//     // Target only sph/cyl inputs inside all 3 tabs
//     const eyeInputs = prescriptionSection.querySelectorAll(
//         "#eyewear input[name$='_dv_sph'], #eyewear input[name$='_dv_cyl'], " +
//         "#eyewear input[name$='_cl_sph'], #eyewear input[name$='_cl_cyl'], " +
//         "#transpose input[name$='_dv_sph'], #transpose input[name$='_dv_cyl'], " +
//         "#transpose input[name$='_cl_sph'], #transpose input[name$='_cl_cyl'], " +
//         "#contact input[name$='_dv_sph'], #contact input[name$='_dv_cyl']," +
//         "#contact input[name$='_cl_sph'], #contact input[name$='_cl_cyl']," +
//         "#eyewear input[name$='_add'], #contact input[name$='_add'],"+
//         "#transpose input[name$='_add']"

//     );

//     eyeInputs.forEach(input => {
//         // On input (typing) -> attach datalist suggestions
//         input.addEventListener("input", function () {
//             const value = this.value.trim();
//             const num = parseFloat(value);
//             if (isNaN(num)) return;

//             if (isValidValue(value)) {
//                 this.style.border = "";
//                 const suggestions = createSuggestionsFromValue(num);

//                 // Create/update datalist
//                 let dataListId = this.name + "_list";
//                 let dataList = document.getElementById(dataListId);

//                 if (!dataList) {
//                     dataList = document.createElement("datalist");
//                     dataList.id = dataListId;
//                     document.body.appendChild(dataList);
//                     this.setAttribute("list", dataListId);
//                 }

//                 dataList.innerHTML = "";
//                 suggestions.forEach(s => {
//                     let option = document.createElement("option");
//                     option.value = s;
//                     dataList.appendChild(option);
//                 });
//             }
//         });

//         // On blur -> validate
//         input.addEventListener("blur", function () {
//             const value = this.value.trim();
//             if (value === "") {
//                 this.style.border = "";
//                 return;
//             }

//             if (!isValidValue(value)) {
//                 this.style.border = "2px solid red";
//                 Swal.fire({
//                     icon: "error",
//                     title: "Invalid Value",
//                     html: `
//                         <div style="font-size: 16px;">
//                             Please enter a value between <b>-20.00</b> and <b>+20.00</b><br>
//                                 Only in steps of <b>0.25</b>
//                         </div>
//                         `,
//                     confirmButtonText: "OK",
//                 }).then(() => this.focus());
//             } else {
//                 this.style.border = "";
//             }
//         });
//     });
// });


// $(document).on("input blur", "input[name$='_dv_axis']", function () {
//     let val = parseInt($(this).val(), 10);

//     if (isNaN(val)) {
//         $(this).val(""); // blank if not number
//         return;
//     }

//     if (val < 0) {
//         $(this).val(0);
//     } else if (val > 180) {
//         $(this).val(180);
//     }
// });
