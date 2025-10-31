// if need add in blow data <span class='material-icons text-secondary cursor-pointer ms-2' id='infoprescriptions' title='info Prescriptions' data-bs-toggle='modal' data-bs-target='#infoprescription'>info</span>
var main_table;
$(document).ready(function () {


    main_table = $('#allPrescriptionsTable').DataTable({
        data: PrescriptionData,
        columns: [
            {
                title: 'Action',
                render: function (data, type, row) {
                    return `
                    <center>
                        <span class='material-icons text-secondary cursor-pointer' id='infoprescriptions' title='View Prescription' data-bs-toggle='modal' data-bs-target='#infoprescription'>print</span>
                        <span class='material-icons text-primary cursor-pointer ms-2' id='editPrescriptions' title='Edit Prescription' data-bs-toggle='modal' data-bs-target='#editPrescription'>edit</span>
                        <span class='material-icons text-info cursor-pointer ms-2' id='MailPrescptionInvoice' title='Prescption Invoice Send Mail' data-bs-toggle='modal' data-bs-target='#MailPrescptionInvoiceModal'>receipt_long</span>
                        <span class="material-icons text-success cursor-pointer ms-2"id="DownloadPrescptionInvoice" title="Prescption Invoice Download Mail" data-bs-toggle="modal" data-bs-target="#DownloadPrescptionInvoiceModal"> download </span>
                    </center>
                `;
                }
            },
            { data: 'created_at', title: 'Created At' },
            {
                data: 'prescription_id', title: 'Prescription ID',
                render: function (data, type, row) {
                    return data ? data.toString().toUpperCase() : '';
                }
            },
            {
                data: 'cust_id', title: 'Cust ID',
                render: function (data, type, row) {
                    return data ? data.toString().toUpperCase() : '';
                }
            },
            { data: 'name', title: 'Name' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'email', title: 'Email' },
            { data: 'tested_by', title: 'Tested By' },
            { data: 'tested_by_id', title: 'Tested By ID' },
            { data: 'tested_by_name', title: 'Tested By Name' },

            // Pricing info
            { data: 'unit_price', title: 'Unit Price' },
            { data: 'discount', title: 'Discount' },
            { data: 'gst_type', title: 'GST Type' },
            { data: 'gst_amount', title: 'GST Amount' },
            { data: 'total_amount', title: 'Total' },
            { data: 'transaction_type', title: 'Transaction Type' },


        ],
        scrollX: true, // for horizontal scroll
        order: [[0, 'desc']]
    });



    // Attach event listener to table rows
    $('#allPrescriptionsTable tbody').on('click', 'span', function () {
        const table = $('#allPrescriptionsTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['prescription_id'];
        let Prescriptionname = data[3];
        let Prescriptionmobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Prescriptionname);
        // $('#invoicecmobile').val(Prescriptionmobile);
        selectedPrescription = data;

        if (spanId === "editPrescriptions") {
            editCutomerDetail(data, cId);
        } else if (spanId === "viewPrescriptions") {
            viewPrescription(data);
        } else if (spanId === "DownloadPrescptionInvoice") {
            $('.uploadInvoiceDataSend')
                .attr('data-id', cId)
                .data('id', cId);;
        } else if (spanId === "MailPrescptionInvoice") {
            $('.uploadInvoiceDataSend')
                .attr('data-id', cId)
                .data('id', cId);
        } else if (spanId === "infoprescriptions") {
            infoPrescription(data);

        } else if (spanId === "deletePrescription") {
            deletePrescriptionDetails(cId);
        }
    });



    // ---------------------------------Loaded 1000 data at a time---------------------
    let start = 0; // start from 0
    const length = 1000;

    $('#loadMoreBtn').on('click', async function () {
        $("div.overlay").addClass("show");

        try {
            const response = await fetch(`/prescription/list?start=${start}&length=${length}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const customerTable = $('#allPrescriptionTable').DataTable();

            // Clear existing data and add new data
            // customerTable.clear().rows.add(data.result).draw();
            customerTable.rows.add(data.result).draw();

            // Increment start for next batch
            start += length;

            // Optional: hide button if all data is loaded
            if (start >= data.recordsTotal) {
                // $('#loadMoreBtn').hide(); // or disable
                $('#loadMoreBtn').prop('disabled', true);
                toastr.info("All Prescription loaded.");
            }

        } catch (error) {
            console.error("Fetch failed:", error);
            toastr.error("Failed to load more Prescription.");
        } finally {
            $("div.overlay").removeClass("show");
        }
    });

    //============================= download invoice with gst =========================
    $('#DownloadPrescptionWithGst').on('click', function () {
        const PId = $(this).data('id');
        if (!PId) {
            toastr.error("Prescription ID is missing.");
            return;
        }

        toggleOverlay(true); // Show overlay
        window.open(`/prescription-download-invoice-with-gst/${PId}`, '_blank');
        toggleOverlay(false); // Show overlay
    });

    //============================= download invoice without gst =========================
    $('#DownloadPrescptionWithOutGst').on('click', function () {
        const PId = $(this).data('id');
        if (!PId) {
            toastr.error("Prescription ID is missing.");
            return;
        }

        toggleOverlay(true); // Show overlay
        window.open(`/prescription-download-invoice-without-gst/${PId}`, '_blank');
        toggleOverlay(false); // Show overlay
    });

    //============================= Send MAil invoice With gst =========================
    $('#generateAutoSendInvoice').on('click', function () {
        const PId = $(this).data('id');
        toggleOverlay(true); // Show overlay

        if (!PId) {
            toggleOverlay(false);
            Swal.fire({
                title: "Error!",
                text: "Prescription ID missing." + PId,
                icon: "error"
            });
            return;
        }

        try {
            $.ajax({
                url: `/prescription-generate-invoice-with-bill/${PId}`,
                method: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#MailPrescptionInvoiceModal').modal('hide');


                    Swal.fire({
                        title: res.message,
                        icon: "success"
                    });
                },
                error: function (xhr, status, error) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#MailPrescptionInvoiceModal').modal('hide');

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


    //============================= Send MAil invoice Without gst =========================
    $('#generateInvoiceWithoutGstdownload').on('click', function () {
        const PId = $(this).data('id');
        toggleOverlay(true); // Show overlay

        if (!PId) {
            toggleOverlay(false);
            Swal.fire({
                title: "Error!",
                text: "Prescription ID missing." + PId,
                icon: "error"
            });
            return;
        }

        try {
            $.ajax({
                url: `/prescription-generate-invoice-without-bill/${PId}`,
                method: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#MailPrescptionInvoiceModal').modal('hide');


                    Swal.fire({
                        title: res.message,
                        icon: "success"
                    });
                },
                error: function (xhr, status, error) {
                    toggleOverlay(false);

                    // Modal Close
                    $('#MailPrescptionInvoiceModal').modal('hide');

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

    // $('#fromDate, #toDate').on('change', loadPrescription);
    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") loadPrescription();
    });

});


function loadPrescription() {
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let keyword = $('#keyword').val();

    $.ajax({
        url: "/prescription/list",
        type: "GET",
        data: { from_date: fromDate, to_date: toDate, keyword: keyword },
        success: function (response) {
            if (response.recordsTotal !== undefined) {
                main_table.clear().rows.add(response.result).draw();
            } else {
                toastr.error("Invalid response format.");
            }
        },
        error: function () {
            toastr.error("Failed to fetch data.");
        }
    });
}

// View Prescription details
function viewPrescription(data) {
    // Basic info
    $('#v_p_pre_no').text(data.prescription_id);
    $('#v_p_cust_no').text(data.cust_id);
    $('#v_p_name').text(data.name);
    $('#v_p_mobile').text(data.mobile);
    $('#v_p_email').text(data.email);
    $('#v_p_tested_by').text(data.tested_by);
    $('#v_p_tested_by_id').text(data.tested_by_id);
    $('#v_p_tested_by_name').text(data.tested_by_name);

    const sections = ['eyewear', 'transpose', 'contact'];
    const sides = ['right', 'left'];
    const fields = ['dv_sph', 'dv_cyl', 'dv_axis', 'dv_vis', 'cl_sph', 'cl_cyl', 'cl_axis', 'cl_vis', 'add', 'nv_sph'];

    sections.forEach(section => {
        sides.forEach(side => {
            fields.forEach(field => {
                const key = `${section}_${field.includes('add') || field.includes('nv')
                    ? `${side}_${field}`
                    : `${field.split('_')[0]}_${side}_${field.split('_')[1]}`}`;

                const elementId = `#v_p_${section}_${field.includes('add') || field.includes('nv')
                    ? `${side}_${field}`
                    : `${field.split('_')[0]}_${side}_${field.split('_')[1]}`}`;

                $(elementId).text(data[key]);
            });
        });
    });
}


function infoPrescription(data) {
    // Header Information
    $('#info-p_pre_no').text(data.prescription_id);
    $('#info-p_cust_no').text(data.cust_id);
    $('#info-p_name').text(data.name);
    $('#info-p_mobile').text(data.mobile);
    $('#info-p_email').text(data.email);
    $('#info-p_tested_by').text(data.tested_by);
    $('#info-p_tested_by_id').text(data.tested_by_id);
    $('#info-p_tested_by_name').text(data.tested_by_name);

    // Pricing and GST Info
    $('#info-pres_rs').text(data.unit_price);
    $('#info-gst_amount').text(data.gst_amount);
    $('#info-total_rs').text(data.total_amount);
    $('#info-transaction_type').text(data.transaction_type);

    // Section mapping: tab name to ID prefix
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
                const dataKey = `${sectionKey}_${field.includes('add') || field.includes('nv')
                    ? `${side}_${field}`
                    : `${field.split('_')[0]}_${side}_${field.split('_')[1]}`}`;

                $(elementId).text(data[dataKey] ?? '');
            });
        });
    });
}




function editCutomerDetail(data, cId) {
    // Show modal
    $('#editPrescription').modal('show');

    // Set IDs
    $('input[name="prescription_id"]').val(data.prescription_id);
    $('input[name="cust_id"]').val(data.cust_id);

    // Customer basic info
    $('input[name="name"]').val(data.name);
    $('input[name="mobile"]').val(data.mobile);
    $('input[name="email"]').val(data.email);
    $('select[name="tested_by"]').val(data.tested_by);
    $('input[name="tested_by_id"]').val(data.tested_by_id);
    $('input[name="emp"]').val(data.tested_by_name);

    // Loop through eyewear, transpose, contact (right & left)
    const sections = [
        'eyewear', 'transpose', 'contact'
    ];

    const sides = ['right', 'left'];

    const fields = [
        'dv_sph', 'dv_cyl', 'dv_axis', 'dv_vis',
        'cl_sph', 'cl_cyl', 'cl_axis', 'cl_vis',
        'add', 'nv_sph'
    ];

    sections.forEach(section => {
        sides.forEach(side => {
            fields.forEach(field => {
                const inputName = `${section === 'eyewear' ? (side === 'right' ? 'ep_right' : 'ep_left')
                    : section === 'transpose' ? (side === 'right' ? 't_right' : 't_left')
                        : (side === 'right' ? 'c_right' : 'c_left')}_${field}`;
                const dataKey = `${section}_${field.includes('add') || field.includes('nv') ? side + '_' + field : (field.split('_')[0] + '_' + side + '_' + field.split('_')[1])}`;
                $(`input[name="${inputName}"]`).val(data[dataKey]);
            });
        });
    });

    // Pricing and GST
    $('input[name="pres_rs"]').val(data.unit_price);
    $('input[name="discount"]').val(data.discount);
    $('select[name="choose_gst"]').val(data.gst_percentage); // Optional if you store GST % separately
    $('select[name="gst_type"]').val(data.gst_type);
    $('input[name="gst_amount"]').val(data.gst_amount);
    $('input[name="total_rs"]').val(data.total_amount);
    $('select[name="transaction_type"]').val(data.transaction_type);
    $('select[name="invoice_type"]').val(data.invoice_type);
}

//update prescription data

async function saveChanges() {
    const id = $('#editPrescription input[name="prescription_id"]').val();

    // Collect all form fields into an object using FormData
    const form = document.querySelector('#prescriptionFormupdate');
    const formData = new FormData(form);

    // Convert FormData to plain object
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Add CSRF token manually if not in form
    data._token = $('meta[name="csrf-token"]').attr('content');

    try {
        const response = await fetch(`/prescription/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            toastr.success(result.message || "Prescription updated successfully.");
            $('#editPrescription').modal('hide');
            window.location.href = `/prescription/list`;
        } else {
            toastr.error(result.message || "Failed to update prescription.");
        }
    } catch (err) {
        toastr.error("Unexpected error occurred while saving changes.");
    }
}

// refersh page..
function refresh() {
    Swal.fire({
        title: "Are you sure?",
        text: `This will refresh the page and reload prescription search.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, refresh",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#7366F0",
        cancelButtonColor: "#6c757d"
    }).then((result) => {
        if (result.isConfirmed) {
            $("div.overlay").addClass("show");
            window.location.href = `/prescription/list`;
        }
    });
}
