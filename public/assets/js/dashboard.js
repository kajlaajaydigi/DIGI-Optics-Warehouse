// --- place near the top
let Status_Jobcards;
let jcProductTable, jcHistoryTable;
let currentJCData = null; // <-- store currently selected jobcard row



$(document).ready(function () {

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
                    <option value="credit">Credit</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="nan">NaN</option>
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
    $('#parent_statusjobcards_load').hide();

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
            { data: 'job_card_id', title: 'Job Card ID' },
            { data: 'status', title: 'Status' },
            { data: 'remark', title: 'Status Note' },
            { data: 'update_by', title: 'Update By' },
            { data: 'amount_received', title: 'Amount Received' },
            { data: 'transaction_type', title: 'Transaction Type' },
            { data: 'delivered_date', title: 'Lens Delivery date' },
            { data: 'payment_delay', title: 'Payment Delay date' }
        ],
        destroy: true,
        responsive: true
    });


    Status_Jobcards = $('#statusjobcards').DataTable({
        columns: [
            {
                title: 'Action',
                render: function (data, type, row) {
                    let html = `<center>`;

                    if (row.status === 'draft' || row.status === 'Draft') {
                        // Sirf edit show hoga
                        html += `
                        <span class='material-icons text-primary cursor-pointer ms-2'
                              id='editjobcard'
                              title='Edit Job Card'
                              data-bs-toggle='modal'>search</span>`;
                    } else {
                        // Baki icons show honge (edit hide)
                        html += `
                        <span class='material-icons text-secondary mx-1 cursor-pointer' id='printmodals' title='Print JC' data-bs-toggle='modal' data-bs-target='#printmodal'>print</span>
                        <span class='material-icons text-primary mx-1 cursor-pointer' id='statusChange' title='Update Status JC' data-bs-toggle='modal' data-bs-target='#jcstatusdelmodal'>add_task</span>
                        <span class='material-icons text-secondary mx-1 cursor-pointer' id='JCinfo' title='Info JC' data-bs-toggle='modal' data-bs-target='#view_cust_jc'>info</span>
                        <span class='material-icons text-info mx-1 cursor-pointer' id='jobCardInvoice' title='Job card Invoice' data-bs-toggle='modal' data-bs-target='#jobCardInvoiceModal'>receipt_long</span>
                    `;
                    }

                    html += `</center>`;
                    return html;
                }
            },
            {
                data: 'created_at',
                title: 'Date',
                render: function (data, type, row) {
                    if (!data) return '';
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `<strong>${day}/${month}/${year}</strong>`;
                }
            },
            { data: 'job_card_no', title: 'Job card ID' },
            { data: 'name', title: 'Cust. Name' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'email', title: 'Email' },
            { data: 'delivered_remark', title: 'Remark' },
            {
                data: 'power_remark', title: 'Power Remark', render: function (data, type, row) {
                    return row.prescriptiondata?.power_remark || 'N/A';
                }
            },
            { data: 'grand_total', title: 'Total Price' },
            { data: 'advance', title: 'Advance' },
            { data: 'balance', title: 'Balance' },
            { data: 'status', title: 'JC Status' },
            { data: 'process_status', title: 'JC Process Status' },
            {
                data: 'delivered_date', title: 'Delivered',
                render: function (data, type, row) {
                    if (!data) return '';
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `<strong>${day}/${month}/${year}</strong>`;
                }
            },
            { data: 'transaction_type', title: 'Balance Transaction Type' },
            { data: 'delivered_remark', title: 'Delivered Remark' },
        ],
        destroy: true,
        responsive: true,
        lengthChange: false,
        info: true,
    });



    // Attach event listener to table rows
    $('#statusjobcards tbody').on('click', 'span', function () {
        const table = $('#statusjobcards').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let JCId = data['job_card_no'];

        if (spanId === "printmodals") {
            printmodals(data);
        } else if (spanId === "JCinfo") {
            viewJobCardFullDetails(JCId);
        } else if (spanId === "statusChange") {
            // store current row so change handler can use it
            currentJCData = data;
            $("#adstatusjobcardno").val(currentJCData.job_card_no);

            let balance = currentJCData?.balance ?? currentJCData?.grand_total ?? 0;
            $("#JCAmount").text(balance).trigger(balance);
            $("#currentstatus").text(currentJCData.process_status).trigger(currentJCData.process_status);
        } else if (spanId === "jobCardInvoice") {
            $('#jobCardInvoiceModal .uploadInvoiceDataSend')
                .attr('data-id', JCId)
                .data('id', JCId);
        } else if (spanId === "editjobcard") {
            window.location.href = '/edit-job-card/' + JCId;
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

        window.open(`/jobcard-download-invoice-without-Gst/${id}/0`, '_blank');

        toggleOverlay(false);
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

        window.open(`/jobcard-download-invoice-without-Gst/${id}/1`, '_blank');

        toggleOverlay(false);
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

        // 👇 without prescription = false
        window.open(`/jobcard-download-invoice-with-gst/${id}/0`, '_blank');

        toggleOverlay(false);
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

        // 👇 with prescription = true
        window.open(`/jobcard-download-invoice-with-gst/${id}/1`, '_blank');

        toggleOverlay(false);
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

    // Load More Button
    $('#loadMoreBtn').on('click', function () {
        toggleOverlay(true);

        $.ajax({
            url: '/get-jobcards-by-status',
            method: 'GET',
            data: {
                status: dashStatus,
                process_status: dashProcess,
                start: dashStart,
                length: dashLength
            },
            success: function (response) {
                toggleOverlay(false);

                // ✅ Add new rows (append only)
                Status_Jobcards.rows.add(response.data).draw();

                dashStart += dashLength;

                if (dashStart >= response.recordsTotal) {
                    $('#loadMoreBtn').prop('disabled', true);
                    toastr.info("All job cards loaded.");
                }
            }
        });
    });

});

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
            $('#bookingdate').text(jc.delivery_date ?? '');
            $('#jch_name').text(jc.name ?? '');
            $('#jch_address').text(customer.address ?? '');
            $('#jch_mobile').text(jc.mobile ?? '');
            $('#jch_email').text(jc.email ?? '');
            $('#jch_dob').text(customer?.dob ?? '');
            $('#jch_anniversary').text(customer?.anniversary ?? '');
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

function printmodals(data) {
    $('#print_jcnum').text(data.job_card_no);
    $('#print_cname').text(data.name);
    $('#print_mobile').text(data.mobile);
    $('#print_bookingdate').text(new Date(data.created_at).toLocaleDateString('en-IN'));
    $('#print_deliverydate').text(new Date(data.delivery_date).toLocaleDateString('en-IN'));
    $('#print_remark').text(data.delivered_remark);
    $('#print_premark').text(data.prescriptiondata.power_remark);
    $('#print_total').text(data.grand_total);
    $('#print_advance').text(data.advance);
    $('#print_balance').text(data.balance);
    $('#print_Dremark').text(data.delivered_remark);
}


let dashStart = 0;
const dashLength = 500;
let dashStatus = '';
let dashProcess = '';

//   ------------------------- dashboard datatable according to status  ----------------------------------
function findCards(status = '', process_status = '') {
    dashStart = 0;  // reset
    dashStatus = status;
    dashProcess = process_status;

    toggleOverlay(true);

    $.ajax({
        url: '/get-jobcards-by-status',
        method: 'GET',
        data: {
            status: dashStatus,
            process_status: dashProcess,
            start: dashStart,
            length: dashLength
        },
        success: function (response) {
            toggleOverlay(false);
            $('#parent_statusjobcards').show();
            $('#parent_statusjobcards_load').show();

            Status_Jobcards.clear().rows.add(response.data).draw();

            dashStart += dashLength;

            if (dashStart >= response.recordsTotal) {
                $('#loadMoreBtn').prop('disabled', true);
            } else {
                $('#loadMoreBtn').prop('disabled', false);
            }
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


// status change time validation
function validateAmount() {
    let jcAmount = parseFloat(document.getElementById('JCAmount').innerText) || 0;
    let amountInput = document.getElementById('amount_received');
    let val = parseFloat(amountInput.value) || 0;

    if (val > jcAmount) {
        amountInput.value = jcAmount; // cap at JCAmount
    }
}
