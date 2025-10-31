$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    $('#jobCardForm').on('submit', function (e) {
        e.preventDefault();

        toggleOverlay(true);

        let formData = new FormData(this);

        // Add clicked button value manually
        const clickedButton = document.activeElement;
        if (clickedButton.name && clickedButton.value) {
            formData.append(clickedButton.name, clickedButton.value);
        }

        $.ajax({
            url: "/new-job-card",
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                toggleOverlay(false);
                $('#jobCardForm')[0].reset(); // Reset the form
                toastr.success("Job card saved successfully!");

                // ✅ Show low stock messages if exist
                if (response.lowproduct) {
                    if (Array.isArray(response.lowproduct)) {
                        response.lowproduct.forEach(msg => toastr.warning(msg));
                    } else {
                        toastr.warning(response.lowproduct);
                    }
                }

                setTimeout(function () {
                    location.reload();
                }, 4000);

            },
            error: function (xhr) {
                toggleOverlay(false);
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    toastr.error(xhr.responseJSON.message);
                } else {
                    toastr.error("Error saving job card.");
                }
            }
        });
    });

    $('#jobCardFormupdate').on('submit', function (e) {
        e.preventDefault();

        toggleOverlay(true);

        let formData = new FormData(this);
        const actionUrl = $(this).attr('action'); // ✅ Get form action

        // Add clicked button value manually
        const clickedButton = document.activeElement;
        if (clickedButton.name && clickedButton.value) {
            formData.append(clickedButton.name, clickedButton.value);
        }

        $.ajax({
            url: actionUrl, // ✅ use the dynamic action URL
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                toggleOverlay(false);
                $('#jobCardFormupdate')[0].reset(); // ✅ match form ID
                toastr.success("Jobcard updated successfully!");
                // ✅ Show low stock messages if exist
                if (response.lowproduct) {
                    if (Array.isArray(response.lowproduct)) {
                        response.lowproduct.forEach(msg => toastr.warning(msg));
                    } else {
                        toastr.warning(response.lowproduct);
                    }
                }

                setTimeout(function () {
                    location.reload();
                }, 4000);
            },
            error: function (xhr) {
                toggleOverlay(false);
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    toastr.error(xhr.responseJSON.message);
                } else {
                    toastr.error("Error updating customer.");
                }
            }
        });
    });

});


$(document).ready(function () {


    //customer data suggestion
    $(document).on('keyup', '.customer-field', function () {
        const query = $(this).val().trim();
        const $input = $(this);
        const inputOffset = $input.offset();
        const inputHeight = $input.outerHeight();
        const inputWidth = $input.outerWidth();

        if (query.length < 2) {
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
        $('input[name=address]').val(data.address);
        $('input[name=mobile]').val(data.mobile);
        $('input[name=email]').val(data.email);
        $('input[name=dob]').val(data.dob);
        $('input[name=anniversary]').val(data.anniversary);
        $('#act_l_point').text(data.points);  // Assuming points is the loyalty points field. In payment.

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
                    let options = `<option value="" disabled selected>Select Employee</option>`;
                    res.users.forEach(user => {
                        options += `<option value="${user.name}">${user.name}</option>`;
                    });
                    $('#emp-wrapper').html(`<select name="emp" class="form-select" id="emp-select">${options}</select>`);
                },
                error: function (xhr) {
                    toggleOverlay(false);
                    alert("Error fetching users: " + xhr.responseText);
                }
            });
        } else {

            toggleOverlay(false);
            $('#emp-wrapper').html(`
                <input type="text" name="emp" class="form-control" id="emp-input" autocomplete="off">
                <ul class="list-group position-absolute bg-white shadow w-fit" id="doctor-suggestions" style="z-index: 10;"></ul>
            `);
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
                    `<li class="list-group-item list-group-item-action" data-name="${doctor.name}">${doctor.name}</li>`
                ).join('');
                $('#doctor-suggestions').html(suggestions);
            },
            error: function (xhr) {
                alert("Error fetching doctor suggestions: " + xhr.responseText);
            }
        });
    });

    // --- When doctor selected from suggestions (emp only) ---
    $(document).on('click', '#doctor-suggestions li', function () {
        const name = $(this).data('name');
        $('#emp-input').val(name);
        $('#doctor-suggestions').empty();
    });

    //refre by is selected  None then triger
    $('select[name="refer_by"]').on('change', function () {
        let val = $(this).val();

        if (val === "None") {
            $('#ReferName, #ReferPhone')
                .hide()
                .prop('disabled', true)
                .find('input').val(''); // clear the value
            $('#ReferName input, #ReferPhone input').val(''); // alternative way
        } else {
            $('#ReferName, #ReferPhone')
                .show()
                .prop('disabled', false);
        }
    }).trigger('change');



    // --- REFER NAME Suggestions -----

    function fetchReferSuggestions(field) {
        const referBy = $('select[name="refer_by"]').val();
        const query = $(field).val();
        const targetName = $(field).attr('name'); // either 'refer_name' or 'refer_phone'

        if (query.length < 3) {
            $('.refer-suggestions').remove();
            return;
        }

        $.ajax({
            url: '/refer-name-suggestions-jobcard',
            type: 'GET',
            data: { refer_by: referBy, query: query },
            success: function (res) {
                const suggestions = res.list.map(item =>
                    `<li class="list-group-item list-group-item-action"
                    data-name="${item.name}" data-phone="${item.phone}" data-id="${item.id}">
                    ${item.name} (${item.phone})
                </li>`
                ).join('');

                $('.refer-suggestions').remove(); // Remove previous
                $(field).after(`
                <ul class="list-group position-absolute bg-white shadow w-fit refer-suggestions" style="z-index: 10;">
                    ${suggestions}
                </ul>
            `);
            },
            error: function (xhr) {
                alert("Error fetching refer suggestions: " + xhr.responseText);
            }
        });
    }

    // --- Trigger suggestion for both fields ---
    $(document).on('keyup', 'input[name="refer_name"], input[name="refer_phone"]', function () {
        fetchReferSuggestions(this);
    });

    // --- When suggestion is clicked ---
    $(document).on('click', '.refer-suggestions li', function () {
        const name = $(this).data('name');
        const phone = $(this).data('phone');
        const refre_id = $(this).data('id');
        $('input[name="refer_id"]').val(refre_id);
        $('input[name="refer_name"]').val(name);
        $('input[name="refer_phone"]').val(phone);
        $('.refer-suggestions').remove();
    });

    // --- Hide on outside click ---
    $(document).on('click', function (e) {
        if (!$(e.target).closest('input[name="refer_name"], input[name="refer_phone"]').length) {
            $('.refer-suggestions').remove();
        }
    });


    // ----------------------Product code and model name autocomplete functionality--------------------------------


    $(document).on('keyup', '.autocomplete-code, .autocomplete-model', function () {
        const input = $(this);
        const query = input.val();
        const type = input.attr('name').replace('[]', ''); // 'product_code' OR 'model_name'
        const card = input.closest('.product-card');
        const suggestionBox = input.siblings('.suggestion-box');
        const bookingType = card.find('select[name="booking_type[]"]').val(); // get booking type

        $(document).on('click', function () {
            suggestionBox.hide();
        });

        if (query.length >= 2) {
            $.ajax({
                url: '/product-suggestions',
                type: 'GET',
                data: { query, type, booking_type: bookingType },
                success: function (res) {
                    let suggestions = '';
                    if (res.products.length > 0) {
                        res.products.forEach(product => {
                            suggestions += `
                            <button type="button" class="dropdown-item suggestion-item" data-id="${product.id}">
                                ${product.product_code} - ${product.name}
                            </button>`;
                        });
                    } else {
                        suggestions = `
                        <button type="button" class="dropdown-item disabled">
                            Not Found
                        </button>`;
                    }
                    suggestionBox.html(suggestions).addClass('dropdown-menu').css('position', 'absolute').show();
                }
            });
        } else {
            suggestionBox.hide();
        }
    });

    // On suggestion click

    $(document).on('click', '.suggestion-item', function () {
        const id = $(this).data('id');
        const card = $(this).closest('.product-card');
        const box = $(this).parent(); // suggestion-box

        $.ajax({
            url: '/get-product-details-by-id',
            type: 'GET',
            data: { id },
            success: function (res) {
                if (res.success) {
                    const p = res.product;
                    box.hide();
                    // Autofill product data
                    card.find('input[name="product_code[]"]').val(p.product_code);
                    card.find('input[name="model_name[]"]').val(p.model_name);
                    card.find('select[name="booking_type[]"]').val(p.booking_type);
                    card.find('input[name="rs[]"]').val(Math.round(p.rs)).trigger('change');
                    $('input[name="sub_total"]').val(p.rs);
                    card.find('input[name="quantity[]"]').val(1).trigger('change');
                    card.find('input[name="hsn_sac[]"]').val(p.hsn_sac);

                    if (p.image) {
                        let imageUrl = '/storage/' + p.image;

                        card.find('.old_img').removeClass("d-none");
                        card.find('.new_img').addClass("d-none");
                        card.find('input[name="old_image[]"]').val(p.image);
                        card.find('.image_link').attr("href", imageUrl).text("View");
                    } else {
                        card.find('.old_img').addClass("d-none");
                        card.find('.new_img').removeClass("d-none");
                    }
                }
            }
        });
        $(this).parent().hide(); // Hide suggestion box after selection
    });

    $(document).on('input change', 'input[name="rs[]"], input[name="quantity[]"], input[name="discount[]"], select[name="gst_chose[]"], select[name="gst_type[]"]', function () {
        const card = $(this).closest('.product-card');
        updateGSTandTotal(card);
    });

    function updateGSTandTotal(card) {
        const rsInput = card.find('input[name="rs[]"]');
        const baseRsInput = card.find('input[name="base_rs[]"]');
        const gstSelect = card.find('select[name="gst_chose[]"]');
        const gstTypeSelect = card.find('select[name="gst_type[]"]');
        const discountInput = card.find('input[name="discount[]"]');
        const qtyInput = card.find('input[name="quantity[]"]');
        const gstAmountInput = card.find('input[name="gst_amount[]"]');
        const totalRsInput = card.find('input[name="total_rs[]"]');

        let enteredPrice = parseFloat(rsInput.val()) || 0;
        let gstRate = parseFloat((gstSelect.val() || '0').replace('%', '')) || 0;
        let gstType = gstTypeSelect.val();
        let discount = parseFloat(discountInput.val()) || 0;
        let quantity = parseInt(qtyInput.val()) || 1;

        if (quantity < 1) {
            quantity = 1;
            qtyInput.val(1);
        }

        let basePrice = 0;
        let gstAmount = 0;
        let totalAmount = 0;

        if (gstType === 'Included') {
            // Total after discount
            totalAmount = (enteredPrice * quantity) - discount;

            gstAmount = (totalAmount * gstRate) / (100 + gstRate);
            basePrice = totalAmount - gstAmount;
        } else if (gstType === 'Excluded') {
            basePrice = enteredPrice * quantity - discount;
            gstAmount = (basePrice * gstRate) / 100;
            totalAmount = basePrice + gstAmount;
        }

        // Fallback if result is NaN
        basePrice = isNaN(basePrice) ? 0 : Math.round(basePrice);
        gstAmount = isNaN(gstAmount) ? 0 : Math.round(gstAmount);
        totalAmount = isNaN(totalAmount) ? 0 : Math.round(totalAmount);

        baseRsInput.val(Math.round(basePrice / quantity));
        gstAmountInput.val(gstAmount);
        totalRsInput.val(totalAmount);

        calculateSubTotalFromProducts(); // auto update subtotal
    }


    // Add product card dynamically
    $('#addProductBtn').on('click', function () {


        const newCard = `
            <div class="card mb-2 product-card">
                <div class="card-header">Product Details</div>
                <div class="card-body row g-3">

                    <div class="col-md-1">
                        <label class="form-label">Scan</label>
                        <input type="text" class="form-control autocomplete-code" name="product_code[]" autocomplete="off">
                        <div class="suggestion-box dropdown-menu"></div>
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">Booking Type<span class="text-danger">*</span></label>
                        <select name="booking_type[]" class="form-select">
                            <option disabled selected>Select Booking</option>
                             ${bookingTypeOptions}
                        </select>
                        <input type="text" name="other_booking_type[]" class="form-control d-none">
                    </div>

                    <div class="col-md-1">
                        <label class="form-label">Model<span class="text-danger">*</span></label>
                        <input type="text" class="form-control autocomplete-model" name="model_name[]"
                            autocomplete="off">
                        <div class="suggestion-box dropdown-menu" id="scanSuggestions"></div>
                    </div>

                    <div class="col-md-2 d-none new_img" >
                        <label class="form-label">Upload Image</label>
                        <input type="file" name="new_image[]" class="form-control image_input" name="image">
                    </div>

                    <div class="col-md-1 d-none old_img" >
                        <label class="form-label d-block">Image</label>
                        <input type="text" name="old_image[]" hidden>
                        <a href="#" target="_blank" class="image_link">View</a>
                    </div>


                    <div class="col-md-1 contanctlens_filed d-none">
                        <label class="form-label">Lens Color.</label>
                        <input type="text" name="color[]" class="form-control">
                    </div>

                    <div class="col-md-1 notframe d-none">
                        <label class="form-label">Lense Avail<span class="text-danger">*</span></label>
                        <select name="lense_avail[]" class="form-select">
                            <option disabled selected>select</option>
                            <option>In House</option>
                            <option>Order</option>
                        </select>
                    </div>

                    <div class="col-md-2 notframe d-none">
                        <label class="form-label">Order to whom</label>
                        <input type="hidden" name="vendor_id[]" class="vendor_id ">
                        <select name="vendor_name[]" class="form-select vendor_select">
                            <option disabled selected>select</option>
                            ${vandorbyOptions}
                        </select>
                    </div>

                    <div class="col-md-2 contanctlens_filed d-none">
                        <label class="form-label">Lens Expiry</label>
                        <input type="date" name="expiry[]" class="form-control">
                    </div>

                    <div class="col-md-1">
                        <label class="form-label">Rs.<span class="text-danger">*</span></label>
                        <input type="number" name="rs[]" class="form-control">
                    </div>

                    <div class="col-md-1">
                        <label class="form-label">Discount</label>
                        <input type="number" name="discount[]" class="form-control">
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">Discount reasons</label>
                        <input type="text" name="discount_reasons[]" class="form-control">
                    </div>

                    <div class="col-md-1">
                        <label class="form-label">Quantity<span class="text-danger">*</span></label>
                        <input type="number" name="quantity[]" class="form-control">
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">Choose GST</label>
                        <select name="gst_chose[]" class="form-select">
                            <option disabled selected>selected</option>
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                        </select>
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">HSN/SAC</label>
                        <input type="text" name="hsn_sac[]" class="form-control">
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">GST Mode</label>
                        <select name="gst_mode[]" class="form-select">
                            <option>CGST/SGST</option>
                            <option>IGST</option>
                        </select>
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">GST Type</label>
                        <select name="gst_type[]" class="form-select">
                            <option>Included</option>
                            <option>Excluded</option>
                        </select>
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">GST Amount</label>
                        <input type="number" name="gst_amount[]" class="form-control" readonly>
                    </div>

                    <div class="col-md-1">
                        <label class="form-label">Total Rs.</label>
                        <input type="number" name="total_rs[]" class="form-control" readonly>
                    </div>

                    <div class="col-md-2">
                        <label class="form-label">Booked By<span class="text-danger">*</span></label>
                        <select name="booked_by[]" class="form-select">
                            <option disabled selected>select</option>
                            ${bookedByOptions}
                        </select>
                    </div>

                    <div class="col-md-1 d-flex align-items-end">
                        <span class='material-icons text-danger cursor-pointer remove-btn' title='Delete Customer'>delete</span>
                    </div>
                </div>
            </div>
        `;

        $('#productContainer').append(newCard);
    });



    // Remove product card
    $(document).on('click', '.remove-btn', function () {
        const card = $(this).closest('.product-card');

        // Get the total of this card
        const totalRs = parseFloat(card.find('input[name="total_rs[]"]').val()) || 0;

        // Get existing subtotal
        let currentSubtotal = parseFloat($('input[name="sub_total"]').val()) || 0;

        // Subtract product total from subtotal
        let newSubtotal = currentSubtotal - totalRs;
        $('input[name="sub_total"]').val(newSubtotal.toFixed(2)).trigger('input'); // will also update balance, etc.

        $(this).closest('.product-card').remove();
    });



    // -----------------------Payment Details -----------------------------

    // ----------------------- Subtotal from products -----------------------------
    function calculateSubTotalFromProducts() {
        let subtotal = 0;

        $('.product-card').each(function () {
            const totalRs = parseFloat($(this).find('input[name="total_rs[]"]').val()) || 0;
            subtotal += totalRs;
        });

        $('input[name="sub_total"]').val(subtotal.toFixed(2));
        calculatePayments(); // recalc grand total whenever subtotal changes
    }

    // ----------------------- Payments Calculation -----------------------------
    function calculatePayments() {
        let subTotal = parseFloat($('input[name="sub_total"]').val()) || 0;
        let loyaltyPoints = parseInt($('input[name="loyalty_points"]').val()) || 0;
        let additionalDiscount = parseFloat($('input[name="additional_discount"]').val()) || 0;
        let advance = parseFloat($('input[name="advance"]').val()) || 0;
        let couponDiscount = parseFloat($('input[name="coupon_discount"]').val()) || 0;

        let loyaltyDiscount = loyaltyPoints * 10; // Example: 1 point = 10 currency
        let totalRs = subTotal - loyaltyDiscount - additionalDiscount - couponDiscount;
        let balance = totalRs - advance;

        $('input[name="loyalty_discount"]').val(loyaltyDiscount.toFixed(2));
        $('input[name="grand_total"]').val(totalRs.toFixed(2));
        $('input[name="balance"]').val(balance.toFixed(2));
    }

    // ----------------------- Input changes trigger calculation -----------------
    $(document).on('input change', 'input[name="sub_total"], input[name="loyalty_points"], input[name="additional_discount"], input[name="advance"], input[name="coupon_discount"]', function () {
        let actualPoints = parseInt($('#act_l_point').text()) || 0;
        let enteredPoints = parseInt($('input[name="loyalty_points"]').val()) || 0;

        if (enteredPoints > actualPoints) {
            toastr.error(`You can use only ${actualPoints} loyalty points.`);
            $('input[name="loyalty_points"]').val(actualPoints);
        }

        calculatePayments();
    });

    // ----------------------- Coupon AJAX -----------------------------
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    $(document).on('click', '#applyCouponBtn', function () {
        let code = $('input[name="coupon_code"]').val().trim();
        let subTotal = parseFloat($('input[name="sub_total"]').val()) || 0;
        let custId = $('input[name="cust_id"]').val();
        let custName = $('input[name="name"]').val(); // name field

        $.ajax({
            url: '/coupon/apply-coupon',
            method: "POST",
            data: {
                code: code,
                sub_total: subTotal,
                cust_id: custId,
                name: custName
            },
            success: function (res) {
                if (res.valid) {
                    let discount = parseFloat(res.discount) || 0;
                    $('input[name="coupon_discount"]').val(discount.toFixed(2));
                    calculatePayments();
                    toastr.success("Coupon applied successfully!");
                } else {
                    $('input[name="coupon_discount"]').val(0);
                    calculatePayments();
                    toastr.error(res.errors || res.message || "Coupon not valid!");
                }
            },
            error: function (xhr) {
                $('input[name="coupon_discount"]').val(0);
                calculatePayments();
                if (xhr.status === 422) {
                    toastr.error(xhr.responseJSON.errors);
                } else {
                    toastr.error("Something went wrong, please try again!");
                }
            }
        });
    });



});

// -----------------prescription in details ---------------------

// Copy prescription from right to left and vice versa for eyewear, transpose, and contact tabs
// function copyPrescription(fromSide, toSide, prefix) {
//     const fields = [
//         'dv_sph', 'dv_cyl', 'dv_axis', 'dv_vis',
//         'cl_sph', 'cl_cyl', 'cl_axis', 'cl_vis',
//         'nv_sph', 'add'
//     ];

//     fields.forEach(field => {
//         const fromInput = $(`input[name="${prefix}_${fromSide}_${field}"]`);
//         const toInput = $(`input[name="${prefix}_${toSide}_${field}"]`);

//         if (fromInput.length && toInput.length) {
//             toInput.val(fromInput.val());
//         }
//     });
// }

// // Eyewear tab (prefix: ep)
// $(document).on('click', '#rightcpy', function () {
//     copyPrescription('right', 'left', 'ep');
// });
// $(document).on('click', '#leftcpy', function () {
//     copyPrescription('left', 'right', 'ep');
// });

// // Transpose tab (prefix: t)
// $(document).on('click', '#rightcpy', function () {
//     if ($('#transpose').hasClass('active')) {
//         copyPrescription('right', 'left', 't');
//     }
// });
// $(document).on('click', '#leftcpy', function () {
//     if ($('#transpose').hasClass('active')) {
//         copyPrescription('left', 'right', 't');
//     }
// });

// // Contact Lens tab (prefix: c)
// $(document).on('click', '#rightcpy', function () {
//     if ($('#contact').hasClass('active')) {
//         copyPrescription('right', 'left', 'c');
//     }
// });
// $(document).on('click', '#leftcpy', function () {
//     if ($('#contact').hasClass('active')) {
//         copyPrescription('left', 'right', 'c');
//     }
// });


// // Eyewear
// $(document).on('click', '#ep_rightcpy', () => copyPrescription('right', 'left', 'ep'));
// $(document).on('click', '#ep_leftcpy', () => copyPrescription('left', 'right', 'ep'));

// // Transpose
// $(document).on('click', '#t_rightcpy', () => copyPrescription('right', 'left', 't'));
// $(document).on('click', '#t_leftcpy', () => copyPrescription('left', 'right', 't'));

// // Contact Lens
// $(document).on('click', '#c_rightcpy', () => copyPrescription('right', 'left', 'c'));
// $(document).on('click', '#c_leftcpy', () => copyPrescription('left', 'right', 'c'));



//booked_by other option
$(document).on("change", "select[name='booking_type[]']", function () {
    let selected = $(this).val();
    let cardBody = $(this).closest(".card-body");

    // target fields
    let otherTypeInput = cardBody.find("input[name='other_booking_type[]']");
    let newImage = cardBody.find(".new_img");
    let oldImage = cardBody.find(".old_img");

    // new fields
    let notFrameFields = cardBody.find(".notframe");
    let contactLensFields = cardBody.find(".contanctlens_filed");

    // reset sabhi fields ko hide karke
    notFrameFields.addClass("d-none");
    contactLensFields.addClass("d-none");

    if (selected === "Others") {
        // show other input, model & upload image
        otherTypeInput.removeClass("d-none");
        newImage.removeClass("d-none");

        // hide view image
        oldImage.addClass("d-none");
    } else {
        otherTypeInput.addClass("d-none");
        newImage.removeClass("d-none");

        // hide view image
        oldImage.addClass("d-none");
    }

    // Booking type ke hisab se fields dikhana
    if (selected === "Glass") {
        notFrameFields.removeClass("d-none");
    } else if (selected === "Contact Lens") {
        notFrameFields.removeClass("d-none");
        contactLensFields.removeClass("d-none");
    }
});


$(document).on("change", ".vendor_select", function () {
    let selectedId = $(this).find(":selected").data("id"); // vendor_id
    let cardBody = $(this).closest(".col-md-2");

    // hidden input me id set karo
    cardBody.find(".vendor_id").val(selectedId);
});

