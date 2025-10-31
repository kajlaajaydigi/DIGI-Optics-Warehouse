$(document).ready(function () {

    document.querySelectorAll(".view-notif").forEach(function (btn) {
        btn.addEventListener("click", function () {
            let title = this.dataset.title;
            let desc = this.dataset.desc;
            let date = this.dataset.date;

            Swal.fire({
                icon: 'info',
                title: title,
                html: `
                        <p>${desc}</p>
                        <p><b>Date:</b> ${date}</p>
                    `,
                confirmButtonText: 'Close',
                confirmButtonColor: '#6c63ff'
            });
        });
    });

    // Delete Notification
    $(document).on('click', '.delete-notif', function (e) {
        e.preventDefault();
        const id = $(this).data('id');

        if (typeof toggleOverlay === 'function') toggleOverlay(true);

        $.ajax({
            url: `/notifications/${id}`,
            type: 'DELETE', // if your host blocks DELETE, switch to POST + _method
            data: {
                _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
            },       // CSRF added via $.ajaxSetup headers
            success: function (res) {
                if (typeof toggleOverlay === 'function') toggleOverlay(false);

                toastr.success(res.message);

                setTimeout(function () {
                    location.reload();
                }, 4000);
            },
            error: function () {
                if (typeof toggleOverlay === 'function') toggleOverlay(false);
                toastr.error('Something went wrong');
            }
        });
    });


});
