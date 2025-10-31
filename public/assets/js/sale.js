$(document).ready(function () {
    // console.log("this is sales js file.");
    $('#saleForm').on('submit', function (e) {
        e.preventDefault();

        toggleOverlay(true); // Show overlay

        $.ajax({
            url: "/sales/store",
            method: 'POST',
            data: $(this).serialize(),
            success: function (res) {
                toggleOverlay(false); // Hide overlay

                if (res.success) {
                    toastr.success(res.message);
                    $('#saleForm')[0].reset();
                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false); // Hide overlay

                if (xhr.status === 422) {
                    const errors = xhr.responseJSON.errors;
                    $.each(errors, function (key, value) {
                        toastr.error(value[0]);
                    });
                } else {
                    toastr.error('Something went wrong.');
                }
            }
        });
    });

    $('#paymentForSelect').on('change', function () {
        let selected = $(this).val();

        if (selected === 'other') {
            $('#otherPaymentInput').removeClass('d-none').val('').focus();
            $('#finalPaymentFor').val(''); // clear main hidden field
        } else {
            $('#otherPaymentInput').addClass('d-none');
            $('#finalPaymentFor').val(selected);
        }
    });

    // On typing in the "Other" box, set its value into the hidden field
    $('#otherPaymentInput').on('input', function () {
        $('#finalPaymentFor').val($(this).val());
    });



    //------------------------Caluclate data----------------------------------
    let userModified = {
        gst_amount: false,
        total_amount: false,
    };

    // Detect manual field changes
    $('input[name="gst_amount"], input[name="total_amount"]').on('input', function () {
        userModified[$(this).attr('name')] = true;
    });

    function calculateValues() {
        // Input values parsed and rounded to 2 decimals
        const qty = parseFloat(($('input[name="qty"]').val()) || 0).toFixed(2);
        const unitPrice = parseFloat(($('input[name="unit_price"]').val()) || 0).toFixed(2);
        const gstType = $('select[name="gst_type"]').val();
        const gstPercentStr = $('select[name="gst_percent"]').val();
        const gstPercent = gstPercentStr ? parseFloat(gstPercentStr.replace('%', '')).toFixed(2) : 0;

        // Convert to numbers for calc
        const qtyNum = parseFloat(qty);
        const unitPriceNum = parseFloat(unitPrice);
        const gstPercentNum = parseFloat(gstPercent);

        const baseTotal = qtyNum * unitPriceNum;
        let gstAmount = 0;
        let finalTotal = baseTotal;

        if (gstType === "Included") {
            gstAmount = baseTotal - (baseTotal * 100 / (100 + gstPercentNum));
            finalTotal = baseTotal;
        } else if (gstType === "Excluded") {
            gstAmount = baseTotal * gstPercentNum / 100;
            finalTotal = baseTotal + gstAmount;
        }

        // Round GST and Total
        gstAmount = parseFloat(gstAmount.toFixed(2));
        finalTotal = parseFloat(finalTotal.toFixed(2));

        // Display values
        if (!userModified.gst_amount) {
            $('input[name="gst_amount"]').val(Math.round(gstAmount));
        }
        if (!userModified.total_amount) {
            $('input[name="total_amount"]').val(finalTotal.toFixed(2));
        }
    }

    // Trigger on change of any related field
    $('input[name="qty"], input[name="unit_price"], select[name="gst_type"], select[name="gst_percent"]').on('input change', function () {
        userModified = {
            gst_amount: false,
            total_amount: false,
        };
        calculateValues();
    });

    // Initial calculation
    calculateValues();

});
