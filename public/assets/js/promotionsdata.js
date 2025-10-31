$(document).ready(function () {

    $PromotionDataTable = $('#allPromotionDataTable').DataTable({
        data: PromotionData,
        columns: [
            { data: 'id', title: 'ID' },
            { data: 'name', title: 'Name' },
            { data: 'mobile', title: 'Phone no' },
            { data: 'email', title: 'Email' },
        ],
        scrollX: true
    });


    // Attach event listener to table rows
    $('#allPromotionDataTable tbody').on('click', 'span', function () {
        const table = $('#allPromotionDataTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let pdId = data['id'];
        let Username = data[3];
        let Usermobile = data[4];

    });


    $('#taskType').on('change', function () {
        let type = $(this).val();

        if (type === 'excel') {
            $('#excel_form').show();
            $('#csv_form').hide();
        }
        else if (type === 'csv') {
            $('#csv_form').show();
            $('#excel_form').hide();
        }
        else {
            $('#excel_form, #csv_form').hide();
        }
    });

    // Excel form submit
    $('#excel_upload_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true); // start loading

        let formData = new FormData(this);
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        $.ajax({
            url: '/upload-promotion-data',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                'X-CSRF-TOKEN': token
            },
            success: function (res) {
                toggleOverlay(false);
                toastr.success("Excel uploaded successfully!");
                $('#excel_upload_form')[0].reset();
                setTimeout(function () {
                    location.reload();
                }, 4000);
            },
            error: function (xhr) {
                toggleOverlay(false);
                let errMsg = xhr.responseJSON?.message || "Error uploading Excel.";
                toastr.error(errMsg);
                console.error("Excel Upload Error:", xhr);
            }
        });
    });

    // CSV form submit
    $('#csv_upload_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true); // start loading

        let formData = new FormData(this);
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        $.ajax({
            url: '/upload-promotion-data',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                'X-CSRF-TOKEN': token
            },
            success: function (res) {
                toggleOverlay(false);
                toastr.success("CSV uploaded successfully!");
                $('#csv_upload_form')[0].reset();
                setTimeout(function () {
                    location.reload();
                }, 4000);
            },
            error: function (xhr) {
                toggleOverlay(false);
                let errMsg = xhr.responseJSON?.message || "Error uploading CSV.";
                toastr.error(errMsg);
                console.error("CSV Upload Error:", xhr);
            }
        });
    });



});


