$(document).ready(function () {
    $('#taskType').on('change', function () {
        let selectedType = $(this).val();

        $('#weekDayContainer').hide();
        $('#monthDateContainer').hide();

        if (selectedType === 'Weekly') {
            $('#weekDayContainer').show();
        } else if (selectedType === 'Monthly') {
            $('#monthDateContainer').show();
        }
    });

    $('#MainTask').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);
        $.ajax({
            url: "/task/store",
            type: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message);
                    $('#MainTask')[0].reset();
                    $('#weekDayContainer, #monthDateContainer').hide();
                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);
                if (xhr.status === 422) {
                    const errors = xhr.responseJSON.errors;
                    for (let field in errors) {
                        toastr.error(errors[field][0]);
                        break; // Show only first error
                    }
                } else {
                    toastr.error('Something went wrong.');
                }
            }
        });
    });


    // $('#MainTask').on('submit', function (e) {
    //     e.preventDefault();

    //     toggleOverlay(true); // Show overlay

    //     $.ajax({
    //         url: "/sales/store",
    //         method: 'POST',
    //         data: $(this).serialize(),
    //         success: function (res) {
    //             toggleOverlay(false); // Hide overlay

    //             if (res.success) {
    //                 toastr.success(res.message);
    //                 $('#MainTask')[0].reset();
    //             } else {
    //                 toastr.error('Unexpected response.');
    //             }
    //         },
    //         error: function (xhr) {
    //             toggleOverlay(false); // Hide overlay

    //             if (xhr.status === 422) {
    //                 const errors = xhr.responseJSON.errors;
    //                 $.each(errors, function (key, value) {
    //                     toastr.error(value[0]);
    //                 });
    //             } else {
    //                 toastr.error('Something went wrong.');
    //             }
    //         }
    //     });
    // });
});
