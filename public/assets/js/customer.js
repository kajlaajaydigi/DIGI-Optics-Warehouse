let jcProductTable, jcHistoryTable;

document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById('submitBtn');
    const doctorBtn = document.getElementById('doctorBtn');

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            toggleOverlay(true);
            submitCustomer();
        });
    }

    if (doctorBtn) {
        doctorBtn.addEventListener('click', function () {
            toggleOverlay(true);
            submitDoctor();
        });
    }
});

async function submitCustomer() {
    const cname = document.getElementById('cname').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const dob = document.getElementById('dob').value;
    const anniversary = document.getElementById('anniversary').value;

    if (!cname || !mobile) {
        toggleOverlay(false);
        toastr.error("Customer name and mobile number are required.");
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        toastr.error("Invalid mobile number.");
        toggleOverlay(false);
        return;
    }

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        const res = await fetch('/new-customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify({
                cname, mobile, email, address, dob, anniversary
            })
        });

        const data = await res.json();
        if (res.ok) {
            toggleOverlay(false);
            toastr.success("Customer saved successfully!");
            document.getElementById('myForm').reset();
            // window.location.href = `/customer-list`; // Redirect to customer list
        } else {
            toggleOverlay(false);
            toastr.error(data.message || "Error saving customer.");
        }
    } catch (err) {
        toggleOverlay(false);
        toastr.error("Unexpected error occurred.");
    }
}

async function submitDoctor() {
    const dname = document.getElementById('dname').value.trim();
    const dmobile = document.getElementById('dmobile').value.trim();
    const demail = document.getElementById('demail').value.trim();
    const hospital = document.getElementById('hospital').value.trim();
    const address = document.getElementById('daddress').value.trim();

    if (!dname || !dmobile || !hospital) {
        toggleOverlay(false);
        toastr.error("Doctor name, mobile number and Hospital name are required.");
        return;
    }

    if (!/^\d{10}$/.test(dmobile)) {
        toastr.error("Invalid mobile number.");
        toggleOverlay(false);
        return;
    }

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        const res = await fetch('/new-doctor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify({
                dname, dmobile, demail, hospital, address
            })
        });

        const data = await res.json();
        toggleOverlay(false);
        if (res.ok) {
            toastr.success("Doctor saved successfully!");
            document.getElementById('myForm').reset();
        } else {
            toastr.error(data.message || "Error saving doctor.");
        }
    } catch (err) {
        toggleOverlay(false);
        toastr.error("Unexpected error occurred.");
    }
}


// Customer List JS

var table;

// DataTable initialization
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



    table = $('#allcustomersTable').DataTable({
        data: customerData, // Pass the 'result' data as the data source
        columns: [
            {
                title: 'Action', // Add Action column title
                render: function (data, type, row) {
                    // Action buttons with Google Material Icons
                    return `
                        <center>
                            <span class='material-icons text-primary cursor-pointer' id='editcustomer' title='Edit Customer' data-bs-toggle='modal' data-bs-target='#editCustomer'>edit</span>
                            <span class='material-icons text-secondary cursor-pointer ms-2' id='viewcustomer' title='View Cutomer' data-bs-toggle='modal' data-bs-target='#viewCustomer'>info</span>
                            <span class='material-icons text-info cursor-pointer ms-2' id='viewprescriptions' title='View Prescriptions' data-bs-toggle='modal' data-bs-target='#viewPrescriptions'>assignment</span>
                            <span class='material-icons text-success cursor-pointer ms-2' id='viewjc' title='View Job Cards' data-bs-toggle='modal' data-bs-target='#viewJCs'>shopping_cart</span>
                        </center>
                    `;
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
            { data: 'cust_id', title: 'ID' },
            { data: 'name', title: 'Name' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'email', title: 'Email' },
            { data: 'address', title: 'Address' },
            { data: 'dob', title: 'Date of Birth' },
            { data: 'anniversary', title: 'Anniversary' },
            { data: 'points', title: 'Loyalty Points' },
            {
                title: 'Delete',
                render: function (data, type, row) {
                    if (canDelete) {
                        return `
                            <center><span id='deletecustomer' class='material-icons text-danger cursor-pointer ms-2' title='Delete Customer'>delete</span></center>
                        `;
                    } else {
                        return ''; // agar permission nahi hai to empty cell
                    }
                }
            }
        ],
        order: [[0, 'desc']]
    });


    // Attach event listener to table rows
    $('#allcustomersTable tbody').on('click', 'span', function () {
        const table = $('#allcustomersTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['cust_id'];
        let customername = data[3];
        let customermobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(customername);
        // $('#invoicecmobile').val(customermobile);
        selectedCustomer = data;

        if (spanId === "editcustomer") {
            editCutomerDetail(cId);
        } else if (spanId === "viewcustomer") {
            viewCustomer(cId);
        } else if (spanId === "viewprescriptions") {
            viewCustomerPrescription(cId);
            // viewCustomerPrescription(customername, customermobile);
        } else if (spanId === "viewjc") {
            viewCutomerJCs(cId);
        } else if (spanId === "deletecustomer") {
            deleteCustomerDetails(cId);
        }
    });

    let start = 0; // start from 0
    const length = 1000;

    $('#loadMoreBtn').on('click', async function () {
        $("div.overlay").addClass("show");

        try {
            const response = await fetch(`/customer-list?start=${start}&length=${length}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const customerTable = $('#allcustomersTable').DataTable();

            // Clear existing data and add new data
            // customerTable.clear().rows.add(data.result).draw();
            customerTable.rows.add(data.result).draw();

            // Increment start for next batch
            start += length;

            // Optional: hide button if all data is loaded
            if (start >= data.recordsTotal) {
                // $('#loadMoreBtn').hide(); // or disable
                $('#loadMoreBtn').prop('disabled', true);
                toastr.info("All customers loaded.");
            }

        } catch (error) {
            console.error("Fetch failed:", error);
            toastr.error("Failed to load more customers.");
        } finally {
            $("div.overlay").removeClass("show");
        }
    });


    //edit customer details
    async function editCutomerDetail(id) {
        $("div.overlay").addClass("show");

        try {
            const response = await fetch(`/edit-customer/${id}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const data = await response.json();
            $("div.overlay").removeClass("show");

            if (response.ok) {
                const customer = data.data;
                $('#editCustomerId').val(customer.cust_id);
                $('#editCname').val(customer.name);
                $('#editMobile').val(customer.mobile);
                $('#editEmail').val(customer.email);
                $('#editAddress').val(customer.address);
                $('#editDob').val(customer.dob);
                $('#editAnniversary').val(customer.anniversary);
                $('#editCustomerModal').modal('show');
            } else {
                toastr.error(data.message || "Error fetching customer details.");
            }
        } catch (error) {
            $("div.overlay").removeClass("show");
            toastr.error("Unexpected error occurred while fetching customer details.");
        }
    }


    // View customer details
    function viewCustomer(cId) {
        $("div.overlay").addClass("show");

        $.ajax({
            url: `/view-customer/${cId}`,  // Route to your Laravel controller
            type: 'GET',
            success: function (response) {
                $("div.overlay").removeClass("show");
                const customer = response.data;
                $('#v_displaydate').text(new Date(customer.date).toLocaleDateString('en-IN') ?? '-');
                $('#v_displaycid').text(customer.cust_id ?? '-');
                $('#v_cname').text(customer.name ?? '-');
                $('#v_address').text(customer.address ?? '-');
                $('#v_mobile').text(customer.mobile ?? '-');
                $('#v_email').text(customer.email ?? '-');
                $('#v_dob').text(customer.dob ? new Date(customer.dob).toLocaleDateString('en-IN') : '');
                $('#v_anniversary').text(customer.anniversary ? new Date(customer.anniversary).toLocaleDateString('en-IN') : '');
                $('#v_pres_date').text(new Date(customer.prescription_date).toLocaleDateString('en-IN') ?? '-');
                $('#v_dname').text(customer.dr_name ?? '-');
                $('#v_shop_name').text(customer.shop ?? '-');
                $('#v_cmodal').modal('show');
            },
            error: function (xhr) {
                $("div.overlay").removeClass("show");
                toastr.error("Failed to fetch customer details.");
            }
        });
    }

    $('#dobFilter, #anniversaryFilter').on('change', loadCustomers);
    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") loadCustomers();
    });


});

function loadCustomers() {
    const dob = $('#dobFilter').val();
    const anniversary = $('#anniversaryFilter').val();
    const keyword = $('#keyword').val();

    $.ajax({
        url: "/customer-list",
        type: "GET",
        data: { dob, anniversary, keyword },
        success: function (response) {
            table.clear().rows.add(response.result).draw();
        }
    });
}

//update customer details

async function saveChanges() {
    const id = $('#editCustomerId').val();
    const data = {
        name: $('#editCname').val(),
        mobile: $('#editMobile').val(),
        email: $('#editEmail').val(),
        address: $('#editAddress').val(),
        dob: $('#editDob').val(),
        anniversary: $('#editAnniversary').val(),
        _token: $('meta[name="csrf-token"]').attr('content')
    };

    try {
        const response = await fetch(`/edit-customer/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            toastr.success(result.message || "Customer updated successfully.");
            $('#editCustomer').modal('hide');
            window.location.href = `/customer-list`; // Redirect to customer list
        } else {
            toastr.error(result.message || "Failed to update customer.");
        }
    } catch (err) {
        toastr.error("Unexpected error occurred while saving changes.");
    }
}



// Delete customer
function deleteCustomerDetails(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete customer data: ${id}`,
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
                url: `/delete-customer/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Customer ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=customerlist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Customer. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}


// function deleteCustomerDetails(id) {
//     Swal.fire({
//     title: "Are you sure?",
//     text: `You are about to delete customer data: ${id}`,
//     icon: "warning",
//     showCancelButton: true,  // Enables the cancel button
//     confirmButtonText: "Yes, delete it!",
//     cancelButtonText: "Cancel",
//     confirmButtonColor: "#d33", // Red color for delete button
//     cancelButtonColor: "#3085d6"
//     }).then((result) => {
//         if (result.isConfirmed) {
//           $("div.overlay").addClass("show");
//           google.script.run
//             .withSuccessHandler(() => {
//               $("div.overlay").removeClass("show");
//               Swal.fire({
//                 title: "Deleted!",
//                 text: `Customer ID ${id} has been deleted.`,
//                 icon: "success"
//               }).then(() => {
//                 $("div.overlay").removeClass("show");
//                 urldeliver(`?v=customerlist`);
//               });
//             })
//             .withFailureHandler(() => {
//               $("div.overlay").removeClass("show");
//               Swal.fire({
//                 title: "Error!",
//                 text: "Failed to delete Customer. Please try again.",
//                 icon: "error"
//               });
//             })
//             .deleteCustomerFromSheet(id); // Call Google Apps Script function
//         }
//     });
// }


// -----------------------refersh page..-------------------------------
function refresh() {
    Swal.fire({
        title: "Are you sure?",
        text: `This will refresh the page and reload Customer search.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, refresh",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#7366F0",
        cancelButtonColor: "#6c757d"
    }).then((result) => {
        if (result.isConfirmed) {
            $("div.overlay").addClass("show");
            window.location.href = `/customer-list`;
        }
    });
}


// -----------------------------------view Customer Prescription-----------------------
function viewCustomerPrescription(cId) {
    $.ajax({
        url: `/show-customer-prescription/${cId}`,
        method: 'GET',
        success: function (res) {
            if (res.prescriptions) {
                $('#customer_prescription_table').DataTable({
                    data: res.prescriptions,
                    columns: [
                        {
                            title: 'Update', // Add Action column title
                            render: function (data, type, row) {
                                // Action buttons with Google Material Icons
                                return `
                                        <center>
                                            <span class='material-icons text-secondary cursor-pointer viewCustomerPresciptions'  title='view Job card' data-bs-toggle='modal' data-bs-target='#viewCustomerPresciption'>info</span>
                                        </center>
                                `;
                            }
                        },
                        {
                            data: 'created_at', title: 'Date',
                            render: function (data) {
                                const d = new Date(data);
                                return d.toLocaleString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit', hour12: true
                                });
                            }
                        },
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

                        // Add eyewear right
                        { data: 'eyewear_dv_right_sph', title: 'Eyewear-DV Right SPH' },
                        { data: 'eyewear_dv_right_cyl', title: 'Eyewear-DV Right CYL' },
                        { data: 'eyewear_dv_right_axis', title: 'Eyewear-DV Right Axis' },
                        { data: 'eyewear_dv_right_vis', title: 'Eyewear-DV Right VIS' },

                        { data: 'eyewear_cl_right_sph', title: 'Eyewear-CL Right SPH' },
                        { data: 'eyewear_cl_right_cyl', title: 'Eyewear-CL Right CYL' },
                        { data: 'eyewear_cl_right_axis', title: 'Eyewear-CL Right Axis' },
                        { data: 'eyewear_cl_right_vis', title: 'Eyewear-CL Right VIS' },

                        { data: 'eyewear_right_add', title: 'Eyewear-Right Add' },
                        { data: 'eyewear_right_nv_sph', title: 'Eyewear-Right NV SPH' },

                        // Eyewear left
                        { data: 'eyewear_dv_left_sph', title: 'Eyewear-DV Left SPH' },
                        { data: 'eyewear_dv_left_cyl', title: 'Eyewear-DV Left CYL' },
                        { data: 'eyewear_dv_left_axis', title: 'Eyewear-DV Left Axis' },
                        { data: 'eyewear_dv_left_vis', title: 'Eyewear-DV Left VIS' },

                        { data: 'eyewear_cl_left_sph', title: 'Eyewear-CL Left SPH' },
                        { data: 'eyewear_cl_left_cyl', title: 'Eyewear-CL Left CYL' },
                        { data: 'eyewear_cl_left_axis', title: 'Eyewear-CL Left Axis' },
                        { data: 'eyewear_cl_left_vis', title: 'Eyewear-CL Left VIS' },

                        { data: 'eyewear_left_add', title: 'Eyewear-Left Add' },
                        { data: 'eyewear_left_nv_sph', title: 'Eyewear-Left NV SPH' },

                        // Transpose right
                        { data: 'transpose_dv_right_sph', title: 'Transpose-DV R SPH' },
                        { data: 'transpose_dv_right_cyl', title: 'Transpose-DV R CYL' },
                        { data: 'transpose_dv_right_axis', title: 'Transpose-DV R Axis' },
                        { data: 'transpose_dv_right_vis', title: 'Transpose-DV R VIS' },

                        { data: 'transpose_cl_right_sph', title: 'Transpose-CL R SPH' },
                        { data: 'transpose_cl_right_cyl', title: 'Transpose-CL R CYL' },
                        { data: 'transpose_cl_right_axis', title: 'Transpose-CL R Axis' },
                        { data: 'transpose_cl_right_vis', title: 'Transpose-CL R VIS' },

                        { data: 'transpose_right_add', title: 'Transpose-R Add' },
                        { data: 'transpose_right_nv_sph', title: 'Transpose-R NV SPH' },

                        // Transpose left
                        { data: 'transpose_dv_left_sph', title: 'Transpose-DV L SPH' },
                        { data: 'transpose_dv_left_cyl', title: 'Transpose-DV L CYL' },
                        { data: 'transpose_dv_left_axis', title: 'Transpose-DV L Axis' },
                        { data: 'transpose_dv_left_vis', title: 'Transpose-DV L VIS' },

                        { data: 'transpose_cl_left_sph', title: 'Transpose-CL L SPH' },
                        { data: 'transpose_cl_left_cyl', title: 'Transpose-CL L CYL' },
                        { data: 'transpose_cl_left_axis', title: 'Transpose-CL L Axis' },
                        { data: 'transpose_cl_left_vis', title: 'Transpose-CL L VIS' },

                        { data: 'transpose_left_add', title: 'Transpose-L Add' },
                        { data: 'transpose_left_nv_sph', title: 'Transpose-L NV SPH' },

                        // Contact right
                        { data: 'contact_dv_right_sph', title: 'Contact-DV R SPH' },
                        { data: 'contact_dv_right_cyl', title: 'Contact-DV R CYL' },
                        { data: 'contact_dv_right_axis', title: 'Contact-DV R Axis' },
                        { data: 'contact_dv_right_vis', title: 'Contact-DV R VIS' },

                        { data: 'contact_cl_right_sph', title: 'Contact-CL R SPH' },
                        { data: 'contact_cl_right_cyl', title: 'Contact-CL R CYL' },
                        { data: 'contact_cl_right_axis', title: 'Contact-CL R Axis' },
                        { data: 'contact_cl_right_vis', title: 'Contact-CL R VIS' },

                        { data: 'contact_right_add', title: 'Contact-R Add' },
                        { data: 'contact_right_nv_sph', title: 'Contact-R NV SPH' },

                        // Contact left
                        { data: 'contact_dv_left_sph', title: 'Contact-DV L SPH' },
                        { data: 'contact_dv_left_cyl', title: 'Contact-DV L CYL' },
                        { data: 'contact_dv_left_axis', title: 'Contact-DV L Axis' },
                        { data: 'contact_dv_left_vis', title: 'Contact-DV L VIS' },

                        { data: 'contact_cl_left_sph', title: 'Contact-CL L SPH' },
                        { data: 'contact_cl_left_cyl', title: 'Contact-CL L CYL' },
                        { data: 'contact_cl_left_axis', title: 'Contact-CL L Axis' },
                        { data: 'contact_cl_left_vis', title: 'Contact-CL L VIS' },

                        { data: 'contact_left_add', title: 'ontactC-L Add' },
                        { data: 'contact_left_nv_sph', title: 'Contact-L NV SPH' },

                        // Pricing info
                        { data: 'unit_price', title: 'Unit Price' },
                        { data: 'discount', title: 'Discount' },
                        { data: 'gst_type', title: 'GST Type' },
                        { data: 'gst_amount', title: 'GST Amount' },
                        { data: 'total_amount', title: 'Total' },
                        { data: 'transaction_type', title: 'Transaction Type' },


                    ],
                    destroy: true,
                    responsive: true
                });
            }
        },
        error: function (err) {
            console.error("Failed to load prescriptions", err);
        }
    });

    // Attach event listener to table rows
    $(document).on('click', '.viewCustomerPresciptions', function () {
        const table = $('#customer_prescription_table').DataTable();
        const data = table.row($(this).closest('tr')).data();
        if (data) {
            infoPrescription(data);
        }
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

// ----------------------------View Customer Job card details ---------------------------------------
function viewCutomerJCs(cId) {
    $.ajax({
        url: `/show-customer-prescription/${cId}`,
        method: 'GET',
        success: function (res) {
            if (res.jobcard) {

                $('#customer_jc_table').DataTable({
                    data: res.jobcard,
                    columns: [
                        {
                            title: 'Update', // Add Action column title
                            render: function (data, type, row) {
                                // Action buttons with Google Material Icons
                                return `
                                        <center>
                                            <span class='material-icons text-secondary cursor-pointer viewjobCards' title='view Job card' data-bs-toggle='modal' data-bs-target='#view_cust_jc'>info</span>
                                        </center>
                                    `;
                            }

                        },
                        {
                            data: 'created_at', title: 'Date',
                            render: function (data) {
                                const d = new Date(data);
                                return d.toLocaleString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit', hour12: true
                                });
                            }
                        },
                        { data: 'job_card_no', title: 'Job Card No.' },
                        { data: 'name', title: 'Name' },
                        { data: 'mobile', title: 'Mobile' },
                        { data: 'email', title: 'Email' },
                        { data: 'tested_by', title: 'Tested By' },
                        { data: 'doctor_name', title: 'Doctor Name' },
                        { data: 'delivery_date', title: 'Delivery Date' },
                        { data: 'grand_total', title: 'Grand Total' },
                        { data: 'add_discount', title: 'Discount' },
                        { data: 'advance', title: 'Advance' },
                        { data: 'balance', title: 'Balance' },
                        { data: 'transaction_type', title: 'Transaction Type' },
                        { data: 'refer_by', title: 'Refer By' },
                        { data: 'refer_name', title: 'Refer Name' },
                        { data: 'refer_phone', title: 'Refer Phone' },
                        { data: 'status', title: 'Status' },
                        { data: 'process_status', title: 'Process Status' },
                        { data: 'employee_commission', title: 'Commission' },
                        { data: 'delivered_date', title: 'Delivered Date' },
                        { data: 'delivered_remark', title: 'Delivered Remark' },

                    ],
                    destroy: true,
                    responsive: true
                });
            }
        },
        error: function (err) {
            console.error("Failed to load prescriptions", err);
        }
    });

    // Global event delegation (ek hi bar chalega)
    $(document).on('click', '.viewjobCards', function () {
        const table = $('#customer_jc_table').DataTable();
        const data = table.row($(this).parents('tr')).data();

        let cId = data['job_card_no'];  // ya id if available
        selectedCjobCard = data;

        viewJobCardFullDetails(cId);
    });

}


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
                        // ✅ tab name add kiya ID ke andar
                        const elementId = `#${prefixBase}_${sectionKey}_${side}_${field}`;

                        // DB key build
                        const dataKey = `${sectionKey}_${field.includes('add') || field.includes('nv')
                            ? `${side}_${field}`
                            : `${field.split('_')[0]}_${side}_${field.split('_')[1]}`}`;

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
