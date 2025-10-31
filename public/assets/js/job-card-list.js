var table;
let jcProductTable, jcHistoryTable;
let selectedJobCardId = null;

$(document).ready(function () {



    jcProductTable = $('#view_jc_table').DataTable({
        columns: [
            {
                data: 'created_at',
                title: 'Date',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            { data: 'booking_type', title: 'Job Card categories' },
            { data: 'modal', title: 'Modal' },
            { data: 'booking_type', title: 'Type' },
            { data: 'price', title: 'Price' },
            { data: 'discount', title: 'Discount' },
            { data: 'quantity', title: 'Qty' },
            { data: 'total', title: 'Total' }
        ],
        destroy: true,
        responsive: true
    });

    jcHistoryTable = $('#jobcardhistorytable').DataTable({
        columns: [
            {
                data: 'created_at', title: 'Date',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            { data: 'status', title: 'Status' },
            { data: 'remark', title: 'Status Note' },
            { data: 'update_by', title: 'Update By' },
            { data: 'amount_received', title: 'Amount Received' },
            { data: 'transaction_type', title: 'Transaction Type' },
            { data: 'delivered_date', title: 'Lens Delivery date' }
        ],
        destroy: true,
        responsive: true
    });




    table = $('#alljobcardsTable').DataTable({
        data: window.jobcardData, // Pass the 'result' data as the data source
        columns: [
            {
                title: 'Action', // Add Action column title
                render: function (data, type, row) {
                    // Action buttons with Google Material Icons
                    let buttons = `
                        <center>
                            <span class='material-icons text-secondary cursor-pointer' id='printjobcards' title='Print jobcard' data-bs-toggle='modal' data-bs-target='#printjobcard'>print</span>
                            <span class='material-icons text-primary cursor-pointer ms-2' id='jobcardhistorys' title='View JOb card' data-bs-toggle='modal' data-bs-target='#view_cust_jc'>info</span>
                            <span class='material-icons text-info cursor-pointer ms-2' id='jobCardInvoice' title='Job card Invoice' data-bs-toggle='modal' data-bs-target='#jobCardInvoiceModal'>receipt_long</span>
                            <span class='material-icons text-primary ms-2 cursor-pointer' id='statusChange' title='Update Status JC' data-bs-toggle='modal' data-bs-target='#jcstatusdelmodal'>add_task</span>
                    `;

                    // Conditional Edit button
                    if (row.status.toLowerCase() !== 'delivered') {
                        buttons += `<span class='material-icons text-primary cursor-pointer ms-2' id='editjobcard' title='edit Job Card' data-bs-toggle='modal'>search</span>`;
                    } else if (row.status.toLowerCase() === 'delivered' && editAdmin) {
                        buttons += `<span class='material-icons text-primary cursor-pointer ms-2' id='editjobcard' title='edit Job Card' data-bs-toggle='modal'>search</span>`;
                    }
                    buttons += `</center>`;
                    return buttons;
                }
            },
            {
                data: 'created_at', title: 'Date',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            { data: 'job_card_no', title: 'ID' },
            { data: 'name', title: 'Name' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'email', title: 'Email' },
            { data: 'grand_total', title: 'Total Price' },
            { data: 'advance', title: 'Advance' },
            { data: 'balance', title: 'Balance' },
            { data: 'transaction_type', title: 'Transaction Type' },
            { data: 'status', title: 'Status' },
            { data: 'process_status', title: 'Process Status' },
            {
                title: 'Delete JC',
                render: function (data, type, row) {

                    if (canDelete) {   // 👈 only show if user has permission
                        return `
                        <center>
                            <span id='deletejobcard' class='material-icons text-danger cursor-pointer ms-2' title='Delete jobcard'>delete</span>
                        </center>
                    `;
                    } else {
                        return ''; // hide button
                    }
                }
            }
        ],
        order: [[1, 'desc']],
        responsive: true,
        autoWidth: false,
        scrollX: true,
    });


    // Attach event listener to table rows
    $('#alljobcardsTable tbody').on('click', 'span', function () {
        const table = $('#alljobcardsTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['job_card_no'];
        let jobcardname = data[3];
        let jobcardmobile = data[5];

        // $('#invoicejobcardno').val(cId);
        // $('#invoicecname').val(jobcardname);
        // $('#invoicecmobile').val(jobcardmobile);
        selectedjobcard = data;

        if (spanId === "printjobcards") {
            showjcDetailPrint(cId);
        } else if (spanId === "jobcardhistorys") {
            viewJobCardFullDetails(cId);  // cId = jobcard ID
        } else if (spanId === "jobCardInvoice") {
            $('#jobCardInvoiceModal .uploadInvoiceDataSend')
                .attr('data-id', cId)
                .data('id', cId);
        } else if (spanId === "editjobcard") {
            window.location.href = '/edit-job-card/' + cId;
        } else if (spanId === "deletejobcard") {
            deletejobcardDetails(cId);
        } else if (spanId === "statusChange") {
            // store current row so change handler can use it
            currentJCData = data;
            $("#adstatusjobcardno").val(cId);

            let balance = currentJCData?.balance ?? currentJCData?.grand_total ?? 0;
            $("#JCAmount").text(balance).trigger(balance);

            $("#currentstatus").text(currentJCData.process_status).trigger(currentJCData.process_status);
        }
    });

    let start = 0; // start from 0
    const length = 1000;


    // load 1000 data ata a time.
    $('#loadMoreBtn').on('click', async function () {

        

        $("div.overlay").addClass("show");

        try {
            const response = await fetch(`/job-list?start=${start}&length=${length}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const customerTable = $('#alljobcardsTable').DataTable();

            // Clear existing data and add new data
            // customerTable.clear().rows.add(data.result).draw();
            customerTable.rows.add(data.result).draw();

            // Increment start for next batch
            start += length;

            // Optional: hide button if all data is loaded
            if (start >= data.recordsTotal) {

                $('#loadMoreBtn').prop('disabled', true);

                toastr.info("All Job card loaded.");
            }

        } catch (error) {
            console.error("Fetch failed:", error);
            toastr.error("Failed to load more job card.");
        } finally {
            $("div.overlay").removeClass("show");
        }
    });


    //--------------------- generate Auto Send Invoice ----------------------
    $(document).on('click', '#gstSend', function () {
        let id = $(this).data('id');
        console.log(id);
        toggleOverlay(true); // Show overlay

        try {
            $.ajax({
                url: `/jobcard-generate-invoice-with-gst/${id}/0`,
                method: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');


                    Swal.fire({
                        title: res.message,
                        icon: "success"
                    });
                },
                error: function (xhr, status, error) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');

                    let errMsg = "Something went wrong.";
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message; // Laravel error message
                    } else if (xhr.responseText) {
                        errMsg = xhr.responseText; // Raw server error
                    }

                    Swal.fire({
                        title: "Error!",
                        text: errMsg,
                        icon: "error"
                    });
                }
            });
        } catch (error) {
            toggleOverlay(false);
            console.error("AJAX error:", error);
            toastr.error("An unexpected error occurred. Please try again.");
        }
    });


    //--------------------- send mail invoice with gst ----------------------
    $(document).on('click', '#generateInvoiceWithGstSend', function () {
        let id = $(this).data('id');
        toggleOverlay(true); // Show overlay

        try {
            $.ajax({
                url: `/jobcard-generate-invoice-with-gst/${id}/1`,
                method: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');


                    Swal.fire({
                        title: res.message,
                        icon: "success"
                    });
                },
                error: function (xhr, status, error) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');

                    let errMsg = "Something went wrong.";
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message; // Laravel error message
                    } else if (xhr.responseText) {
                        errMsg = xhr.responseText; // Raw server error
                    }

                    Swal.fire({
                        title: "Error!",
                        text: errMsg,
                        icon: "error"
                    });
                }
            });
        } catch (error) {
            toggleOverlay(false);
            console.error("AJAX error:", error);
            toastr.error("An unexpected error occurred. Please try again.");
        }
    });

    //--------------------- send mail invoice without gst ----------------------
    $(document).on('click', '#withoutGstSend', function () {
        let id = $(this).data('id');
        console.log(id);
        toggleOverlay(true); // Show overlay

        try {
            $.ajax({
                url: `/jobcard-generate-invoice-without-gst/${id}/0`,
                method: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');

                    Swal.fire({
                        title: res.message,
                        icon: "success"
                    });
                },
                error: function (xhr, status, error) {
                    toggleOverlay(false);


                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');

                    let errMsg = "Something went wrong.";
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message; // Laravel error message
                    } else if (xhr.responseText) {
                        errMsg = xhr.responseText; // Raw server error
                    }

                    Swal.fire({
                        title: "Error!",
                        text: errMsg,
                        icon: "error"
                    });
                }
            });
        } catch (error) {
            toggleOverlay(false);
            console.error("AJAX error:", error);
            toastr.error("An unexpected error occurred. Please try again.");
        }
    });

    $(document).on('click', '#generateInvoiceWithoutGstSend', function () {
        let id = $(this).data('id');
        console.log(id);
        toggleOverlay(true); // Show overlay

        try {
            $.ajax({
                url: `/jobcard-generate-invoice-without-gst/${id}/1`,
                method: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');

                    Swal.fire({
                        title: res.message,
                        icon: "success"
                    });
                },
                error: function (xhr, status, error) {
                    toggleOverlay(false);


                    // Modal Close
                    $('#jobCardInvoiceModal').modal('hide');

                    let errMsg = "Something went wrong.";
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message; // Laravel error message
                    } else if (xhr.responseText) {
                        errMsg = xhr.responseText; // Raw server error
                    }

                    Swal.fire({
                        title: "Error!",
                        text: errMsg,
                        icon: "error"
                    });
                }
            });
        } catch (error) {
            toggleOverlay(false);
            console.error("AJAX error:", error);
            toastr.error("An unexpected error occurred. Please try again.");
        }
    });

    //--------------------- download invoice without gst ----------------------

    // Normal Download (without prescription)
    $(document).on('click', '#withoutGstDownload', function () {
        let id = $(this).data('id');
        // console.log(id);
        toggleOverlay(true); // Show overlay

        if (!id) {
            Swal.fire({
                title: "Error!",
                text: "Job card ID missing.",
                icon: "error"
            });
            return;
        }

        // Modal Close
        $('#jobCardInvoiceModal').modal('hide');

        toggleOverlay(false);

        window.open(`/jobcard-download-invoice-without-Gst/${id}/0`, '_blank');

    });

    // Download With Prescription
    $(document).on('click', '#generateInvoiceWithoutGstdownload', function () {
        let id = $(this).data('id');
        // console.log(id);
        toggleOverlay(true); // Show overlay

        if (!id) {
            Swal.fire({
                title: "Error!",
                text: "Job card ID missing.",
                icon: "error"
            });
            return;
        }

        // Modal Close
        $('#jobCardInvoiceModal').modal('hide');

        toggleOverlay(false);

        window.open(`/jobcard-download-invoice-without-Gst/${id}/1`, '_blank');

    });


    //--------------------- download invoice with gst ----------------------
    // Normal Download (without prescription)
    $(document).on('click', '#gstDownload', function () {
        let id = $(this).data('id');
        toggleOverlay(true);

        if (!id) {
            Swal.fire({
                title: "Error!",
                text: "Job card ID missing.",
                icon: "error"
            });
            return;
        }

        $('#jobCardInvoiceModal').modal('hide');

        console.log(id);

        toggleOverlay(false);

        // 👇 without prescription = false
        window.open(`/jobcard-download-invoice-with-gst/${id}/0`, '_blank');

    });

    // Download With Prescription
    $(document).on('click', '#generateInvoiceWithGstDownload', function () {
        let id = $(this).data('id');
        toggleOverlay(true);

        if (!id) {
            Swal.fire({
                title: "Error!",
                text: "Job card ID missing.",
                icon: "error"
            });
            return;
        }

        $('#jobCardInvoiceModal').modal('hide');

        toggleOverlay(false);

        // 👇 with prescription = true
        window.open(`/jobcard-download-invoice-with-gst/${id}/1`, '_blank');

    });

    // ----------------------- upload invoice data -----------------------
    $(document).on('submit', '#invoiceUploadForm', function (e) {
        e.preventDefault();

        let form = $('#invoiceUploadForm')[0];
        let formData = new FormData(form);

        let id = $('#uploadInvoiceSend').data('id'); // button se JobCard ID le raha hu
        if (!id) {
            Swal.fire({
                title: "Error!",
                text: "Job card ID missing.",
                icon: "error"
            });
            return;
        }

        toggleOverlay(true);

        $.ajax({
            url: `/jobcard-upload-invoice/${id}`,
            type: 'POST',
            data: formData,
            processData: false,   // important
            contentType: false,   // important
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content')
            },
            success: function (res) {
                toggleOverlay(false);
                Swal.fire({
                    title: res.message || "Invoice uploaded successfully!",
                    icon: "success"
                }).then(() => {
                    $('#invoiceUploadForm')[0].reset();
                    $('#jobCardInvoiceModal').modal('hide');
                });
            },
            error: function (xhr) {
                toggleOverlay(false);

                let errMsg = "Something went wrong.";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errMsg = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    errMsg = xhr.responseText;
                }

                Swal.fire({
                    title: "Error!",
                    text: errMsg,
                    icon: "error"
                });
            }
        });
    });


    // ------------------ Date Filter via AJAX ------------------
    // let typingTimer;
    // $('#keyword').on('keyup', function () {
    //     clearTimeout(typingTimer);
    //     typingTimer = setTimeout(function () {
    //         loadJobCards();
    //     }, 500); // 0.5 second ke baad search auto run
    // });

    // $('#fromDate, #toDate').on('change', loadJobCards);
    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") loadJobCards();
    });

    // Excel Export ajax call ------------------
    $('#jcexcelmodal form').on('submit', function (e) {
        e.preventDefault();

        let form = $(this);
        let formData = form.serialize();
        toggleOverlay(true);

        $.ajax({
            url: form.attr('action'),
            type: form.attr('method'),
            data: formData,
            xhrFields: {
                responseType: 'blob' // Important: get the file as a blob
            },
            success: function (blob) {
                toggleOverlay(false);

                // Trigger Excel download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Jobcard_' + new Date().toISOString().slice(0, 10) + '.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

                // Close modal
                $('#jcexcelmodal').modal('hide');

                // Reset the form
                form[0].reset();

                // Show success notification
                toastr.success('Job Card Excel Export done successfully');
            },
            error: function (xhr) {
                toggleOverlay(false);
                toastr.error('Something went wrong!');
            }
        });
    });

});


// ------------------ Date Filter via AJAX ------------------
function loadJobCards() {
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let keyword = $('#keyword').val();

    // toggleOverlay(true);
    $.ajax({
        url: `/job-list`,
        method: "GET",
        data: { fromDate, toDate, keyword },
        success: function (response) {
            // toggleOverlay(false);
            table.clear().rows.add(response.result).draw();
            canDelete = response.canDelete;
        }
    });
}

// ✅ Main Function to fetch and show job card full details
function viewJobCardFullDetails(id) {
    $("div.overlay").addClass("show");

    $.ajax({
        url: `/get-jobcard-full-details/${id}`,
        method: 'GET',
        success: function (res) {
            $("div.overlay").removeClass("show");

            let jc = res.jobcard;
            let customer = res.customer;
            let prescription = res.prescription;

            // Basic Info
            $('#displayjcno').text(jc.job_card_no ?? '');
            $('#bookingdate').text(new Date(jc.delivery_date).toLocaleDateString('en-IN') ?? '');
            $('#jch_name').text(jc.name ?? '');
            $('#jch_address').text(customer.address ?? '');
            $('#jch_mobile').text(jc.mobile ?? '');
            $('#jch_email').text(jc.email ?? '');
            $('#jch_dob').text(customer?.dob ? new Date(customer.dob).toLocaleDateString('en-IN') : '');
            $('#jch_anniversary').text(customer.anniversary ? new Date(customer.anniversary).toLocaleDateString('en-IN') : '');
            $('#jch_tested_by').text(jc.tested_by ?? '');
            $('#jch_dname').text(jc.doctor_name ?? '');
            $('#jch_remark').text(jc.delivered_remark ?? '');
            $('#jch_transaction_type').text(jc.transaction_type ?? '');
            $('#jch_power_remark').text(prescription?.power_remark ?? '');
            $('#jch_total').text(jc.grand_total ?? 0);
            $('#jch_advance').text(jc.advance ?? 0);
            $('#jch_balance').text(jc.balance ?? 0);

            // ---------------------------
            // Prescription Mapping
            // ---------------------------
            const sectionPrefixMap = {
                'eyewear': 'info-ep',
                'transpose': 'info-t',
                'contact': 'info-c'
            };

            const sides = ['right', 'left'];

            const fields = [
                'dv_sph', 'dv_cyl', 'dv_axis', 'dv_vis',
                'cl_sph', 'cl_cyl', 'cl_axis', 'cl_vis',
                'add', 'nv_sph'
            ];

            Object.entries(sectionPrefixMap).forEach(([sectionKey, prefixBase]) => {
                sides.forEach(side => {
                    fields.forEach(field => {
                        const elementId = `#${prefixBase}_${side}_${field}`;

                        // build key name from DB (like eyewear_dv_right_sph etc.)
                        const dataKey = `${sectionKey}_${field.includes('add') || field.includes('nv')
                            ? `${side}_${field}`          // eyewear_right_add
                            : `${field.split('_')[0]}_${side}_${field.split('_')[1]}`}`; // eyewear_dv_right_sph

                        $(elementId).text(prescription?.[dataKey] ?? '');
                    });
                });
            });

            // Frame Measurements
            $('#frm').text(prescription?.frm ?? '');
            $('#cor').text(prescription?.cor ?? '');
            $('#a').text(prescription?.a ?? '');
            $('#b').text(prescription?.b ?? '');
            $('#dbl').text(prescription?.dbl ?? '');
            $('#afh').text(prescription?.afh ?? '');
            $('#pd').text(prescription?.pd ?? '');
            $('#r').text(prescription?.r ?? '');
            $('#l').text(prescription?.l ?? '');
            $('#ed').text(prescription?.ed ?? '');
            $('#dia').text(prescription?.dia ?? '');

            // Update products table
            jcProductTable.clear().rows.add(res.products).draw();

            // Update history table
            jcHistoryTable.clear().rows.add(res.history).draw();

            $('#view_cust_jc').modal('show');
        },
        error: function (xhr) {
            $("div.overlay").removeClass("show");
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch jobcard details. Please try again.",
                icon: "error"
            });
        }
    });
}



// Show jobcard details in print modal
function showjcDetailPrint(id) {
    $("div.overlay").addClass("show");
    $.ajax({
        url: `/get-jobcard-details-print/${id}`,  // Route to your Laravel controller
        type: 'GET',
        success: function (response) {
            $("div.overlay").removeClass("show");
            // Assuming response contains the HTML content for the job card
            const jobcardDetails = response.data; // Adjust based on your response structure
            $('#jc_displayid').text(jobcardDetails.job_card_no);
            $('#jc_name').text(jobcardDetails.name);
            $('#jc_mobile').text(jobcardDetails.mobile);
            $('#jc_email').text(jobcardDetails.email);
            $('#jc_dobook').text(new Date(jobcardDetails.booking_date).toLocaleDateString('en-IN') ?? '');
            $('#jc_remark').text(jobcardDetails.remark);
            $('#jc_premark').text(jobcardDetails.power_remark);
            $('#jc_totalrs').text(jobcardDetails.grand_total);
            $('#jc_advance').text(jobcardDetails.advance);
            $('#jc_balance').text(jobcardDetails.balance);
            // $('#printJCInfo').modal('show'); // Show the print modal
        },
        error: function (xhr) {
            $("div.overlay").removeClass("show");
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch jobcard details. Please try again.",
                icon: "error"
            });
        }
    });
}

// Delete jobcard
function deletejobcardDetails(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete jobcard data: ${id}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
    }).then((result) => {
        if (result.isConfirmed) {
            $("div.overlay").addClass("show");

            $.ajax({
                url: `/delete-jobcard/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `jobcard ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=jobcardlist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete jobcard. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}


// ------------------ Refresh Button ------------------
function refresh() {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to refresh the page?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, refresh it!',
        cancelButtonText: 'No, cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // If user clicks yes
            location.reload();
        } else {
            // If user clicks no, do nothing
        }
    });
}


//---------------------- status update ---------------
function updatestatuses() {
    let formData = {
        _token: $('meta[name="csrf-token"]').attr('content'), // CSRF token
        job_card_no: $('#adstatusjobcardno').val(),
        jc_status: $('#adselectstatus').val(),
        amount_received: $('#amount_received').val() || null,
        jc_trans_type: $('#transaction_type_select').val(),
        led_date: $('#Len_Exp_Delivery_date').val(),
        note: $('#adstatusnote').val(),
        payment_delay: $('#payment_delay').val(),
        holiAft: $('#holidayafter').val(),
        holiRes: $('#holidayresion').val(),
        holifev: $('#holidayfev').val(),
    };

    $("div.overlay").addClass("show"); // show loader

    $.ajax({
        url: '/job-card/update-status', // Laravel route
        type: 'POST',
        data: formData,
        success: function (response) {
            $("div.overlay").removeClass("show"); // hide loader

            if (response.success) {
                toastr.success(response.message);
                $('#jcstatusdelmodal').modal('hide');
                // Reload table or refresh data
                setTimeout(function () {
                    location.reload();
                }, 2000); // faster reload
            } else {
                toastr.error(response.message);
            }
        },
        error: function (xhr) {
            $("div.overlay").removeClass("show"); // hide loader

            if (xhr.status === 422) { // Laravel validation error
                let errors = xhr.responseJSON.errors;
                for (let key in errors) {
                    if (errors.hasOwnProperty(key)) {
                        toastr.error(errors[key][0]); // show first error for each field
                    }
                }
            } else {
                console.error(xhr.responseText); // log other errors
                toastr.error("Something went wrong. Please try again.");
            }
        }
    });
}


$(document).ready(function () {

    //form reset
    var jcStatusModal = document.getElementById('jcstatusdelmodal');

    // Listen for the hidden event
    jcStatusModal.addEventListener('hidden.bs.modal', function () {
        // Reset the form inside the modal
        document.getElementById('statusupdate').reset();

        // Optional: hide any custom divs if needed
        var extraDivs = jcStatusModal.querySelectorAll('.adselectstatus, .adselectstatus2, .adselectstatus3');
        extraDivs.forEach(function (div) {
            div.style.display = 'none';
        });
    });
    // holidy hidden field
    $('.holiday').hide();

    $('#adselectstatus').on('change', function () {
        let selected = $(this).val()?.toLowerCase() ?? ''; // lowercase for matching
        let statusContainer = $('.adselectstatus');
        let statusContainer2 = $('.adselectstatus2');
        let statusContainer3 = $('.adselectstatus3');

        // Clear old fields
        statusContainer.empty().hide();
        statusContainer2.empty().hide();
        statusContainer3.empty().hide();


        // holidy hidden field
        $('.holiday').find('input').val(''); // clear all inputs inside
        $('.holiday').hide();

        // Clear Status Note & Customer Id fields
        $('#adstatusnote').val('');

        // Step 1: Lens Ordered → show Lens Expected Delivery Date
        if (selected === 'lens ordered') {
            statusContainer.html(`
                <label class="form-label d-block">Lens Expected Delivery Date</label>
                <input type="date" class="form-control" name="date" id="Len_Exp_Delivery_date">
            `).show();
        }

        // Step 2: Delivered → show Amount & Transaction Type
        if (selected === 'delivered' || selected === 'part payment') {
            // Use unique id for transaction select (no duplicate id)
            statusContainer.html(`
                <label class="form-label d-block">Amount-(Balance Rs.<span id="JCAmount" class="text-nowrap">0.00</span>)<span class="text-danger">*</span></label>
                <input type="number" class="form-control mb-2" name="amount_received" step="0.01" id="amount_received" required oninput="validateAmount()">
            `).show();

            statusContainer2.html(`
                <label class="form-label d-block">Transaction Type</label>
                <select id="transaction_type_select" name="transaction_type" class="form-select">
                    <option selected disabled>Select Type</option>
                    <option >Credit</option>
                    <option >Cash</option>
                    <option >UPI</option>
                    <option >None</option>
                </select>
            `).show();

            let balance = currentJCData?.balance ?? currentJCData?.grand_total ?? 0;

            $('#JCAmount').text(balance);
        } else if (selected === 'holiday closed') {
            // holidy hidden field is show
            $('.holiday').show();
        }

        // Step 3: Payment Delay → add Payment Delay Date after Status Note
        if (selected === 'payment delay') {
            statusContainer3.html(`
                <label class="form-label d-block">Payment Delay Date</label>
                <input type="date" class="form-control" name="payment_delay" id="payment_delay">
            `).show();
        }
    });

    $('#parent_statusjobcards').hide();

    $('#parent_statusjobcards').on('hidden.bs.modal', function () {
        $('.adselectstatus').empty().hide();
        $('.adselectstatus2').empty().hide();
        $('.adselectstatus3').empty().hide();

        // agar dropdown bhi reset karna hai:
        $('#adselectstatus').val('');
    });
});



// status change time validation
function validateAmount() {
    let jcAmount = parseFloat(document.getElementById('JCAmount').innerText) || 0;
    let amountInput = document.getElementById('amount_received');
    let val = parseFloat(amountInput.value) || 0;

    if (val > jcAmount) {
        amountInput.value = jcAmount; // cap at JCAmount
    }
}
