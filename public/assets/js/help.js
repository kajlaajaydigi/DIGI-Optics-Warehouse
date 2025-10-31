$(document).ready(function () {
    $('#helpMailForm').on('submit', function (e) {
        e.preventDefault();

        toggleOverlay(true); // Show overlay

        $.ajax({
            url: "/help/send-mail",
            method: 'POST',
            data: $(this).serialize(),
            success: function (res) {
                toggleOverlay(false); // Hide overlay

                if (res.success) {
                    toastr.success(res.message);
                    $('#helpMailForm')[0].reset();
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
                    let errorMessage = 'Something went wrong.';

                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    } else if (xhr.responseText) {
                        try {
                            let res = JSON.parse(xhr.responseText);
                            if (res.message) {
                                errorMessage = res.message;
                            }
                        } catch (e) {
                            errorMessage = xhr.responseText; // fallback if plain text
                        }
                    }

                    toastr.error(errorMessage);
                }
            }

        });
    });

});
