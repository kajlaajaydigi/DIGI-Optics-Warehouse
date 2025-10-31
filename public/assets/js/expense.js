$(document).ready(function () {

    $('#expenseForm').on('submit', function (e) {
        e.preventDefault();

        toggleOverlay(true); // Show overlay

        $.ajax({
            url: "/expense/store",
            method: 'POST',
            data: $(this).serialize(),
            success: function (res) {
                toggleOverlay(false); // Hide overlay

                if (res.success) {
                    toastr.success(res.message);
                    $('#expenseForm')[0].reset();
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

});
