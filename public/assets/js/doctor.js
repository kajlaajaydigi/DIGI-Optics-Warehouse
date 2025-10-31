// doctor List JS
var table;
// DataTable initialization
$(document).ready(function () {

    table = $('#alldoctorTable').DataTable({
        data: DoctorData, // Pass the 'result' data as the data source
        columns: [
            {
                title: 'Action', // Add Action column title
                render: function (data, type, row) {
                    // Action buttons with Google Material Icons
                    return `
                        <center>
                            <span class='material-icons text-primary cursor-pointer' id='editDoctorBtn' title='Edit Doctor' data-bs-toggle='modal' data-bs-target='#editdoctor'>edit</span>
                            <span class='material-icons text-secondary cursor-pointer ms-2' id='viewDoctorBtn' title='View Doctor' data-bs-toggle='modal' data-bs-target='#viewDoctor'>info</span>
                            </center>
                            `;
                }
                // <span class='material-icons text-success cursor-pointer ms-2' id='viewjcs' title='View Job Cards' data-bs-toggle='modal' data-bs-target='#viewJCs'>shopping_cart</span>
                // <span class='material-icons text-info cursor-pointer ms-2' id='viewprescriptions' title='View Prescriptions' data-bs-toggle='modal' data-bs-target='#viewPrescriptions'>assignment</span>
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
            { data: 'dr_id', title: 'ID' },
            { data: 'name', title: 'Name' },
            { data: 'hospital', title: 'Hospital' },
            { data: 'address', title: 'Address' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'email', title: 'Email' },
            { data: 'points', title: 'Loyalty Points' },
            {
                title: 'Delete',
                render: function (data, type, row) {

                    if (canDelete) {
                        return `
                            <center><span id='deleteDoctor' class='material-icons text-danger cursor-pointer ms-2' title='Delete Doctor'>delete</span></center>
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
    $('#alldoctorTable tbody').on('click', 'span', function () {
        const table = $('#alldoctorTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let DId = data['dr_id'];
        let doctorname = data[3];
        let doctorrmobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(customername);
        // $('#invoicecmobile').val(customermobile);
        selectedDoctor = data;

        if (spanId === "editDoctorBtn") {
            editDoctorDetail(DId);
        } else if (spanId === "viewDoctorBtn") {
            viewDoctor(DId);
        } else if (spanId === "viewprescriptions") {
            // viewCustomerPrescription(DId);
            // viewCustomerPrescription(customername, customermobile);
        } else if (spanId === "viewjcs") {
            // viewCutomerJCs(customername, customermobile);
        } else if (spanId === "deleteDoctor") {
            deleteDoctorDetails(DId);
        }
    });

    let start = 0; // start from 0
    const length = 1000;

    $('#loadMoreBtn').on('click', async function () {
        $("div.overlay").addClass("show");

        try {
            const response = await fetch(`/doctor-list?start=${start}&length=${length}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const customerTable = $('#alldoctorTable').DataTable();

            // clear existing data and add new data
            // customerTable.clear().rows.add(data.result).draw();
            customerTable.rows.add(data.result).draw();

            // Increment start for next batch
            start += length;

            // Optional: hide button if all data is loaded
            if (start >= data.recordsTotal) {
                // $('#loadMoreBtn').hide(); // or disable
                $('#loadMoreBtn').prop('disabled', true);
                toastr.info("All Doctor loaded.");
            }

        } catch (error) {
            console.error("Fetch failed:", error);
            toastr.error("Failed to load more Doctor.");
        } finally {
            $("div.overlay").removeClass("show");
        }
    });


    $('#searchDoctorBtn').on('click', loadDoctorfun);
    $('#fromDate, #toDate').on('change', loadDoctorfun);
    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") loadDoctorfun();
    });


});

function loadDoctorfun() {
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let keyword = $('#keyword').val();

    $.ajax({
        url: "/doctor-list",
        type: "GET",
        data: { from_date: fromDate, to_date: toDate, keyword },
        success: function (response) {
            if (response.result) {
                table.clear().rows.add(response.result).draw();
            } else {
                toastr.info("No doctors found.");
            }
        },
        error: function () {
            toastr.error("Failed to fetch data.");
        }
    });
}


// View customer details
function viewDoctor(cId) {
    $("div.overlay").addClass("show");

    $.ajax({
        url: `/view-doctor/${cId}`,  // Route to your Laravel controller
        type: 'GET',
        success: function (response) {
            $("div.overlay").removeClass("show");
            const doctor = response.data;
            $('#v_displaydate').text(new Date(doctor.date).toLocaleDateString('en-IN') ?? '-');
            // $('#v_displaydate').text(doctor.date ?? '-');
            $('#v_displayDid').text(doctor.dr_id ?? '-');
            $('#v_Dname').text(doctor.name ?? '-');
            $('#v_hospital').text(doctor.hospital ?? '-');
            $('#v_mobile').text(doctor.mobile ?? '-');
            $('#v_email').text(doctor.email ?? '-');
            $('#v_address').text(doctor.address ?? '-');
            $('#v_dmodal').modal('show');
        },
        error: function (xhr) {
            $("div.overlay").removeClass("show");
            toastr.error("Failed to fetch doctor details.");
        }
    });
}

//edit Doctor details
async function editDoctorDetail(id) {
    $("div.overlay").addClass("show");

    try {
        const response = await fetch(`/edit-doctor/${id}`, {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

        const data = await response.json();
        $("div.overlay").removeClass("show");

        if (response.ok) {
            const doctor = data.data;
            $('#editdoctorId').val(doctor.dr_id);
            $('#editdname').val(doctor.name);
            $('#editHospital').val(doctor.hospital);
            $('#editAddress').val(doctor.address);
            $('#editMobile').val(doctor.mobile);
            $('#editEmail').val(doctor.email);
            $('#editDoctorModal').modal('show');
        } else {
            toastr.error(data.message || "Error fetching doctor details.");
        }
    } catch (error) {
        $("div.overlay").removeClass("show");
        toastr.error("Unexpected error occurred while fetching doctor details.");
    }
}

//update doctor details

async function saveChanges() {
    const id = $('#editdoctorId').val();
    const data = {
        name: $('#editdname').val(),
        mobile: $('#editMobile').val(),
        email: $('#editEmail').val(),
        address: $('#editAddress').val(),
        hospital: $('#editHospital').val(),
        _token: $('meta[name="csrf-token"]').attr('content')
    };

    try {
        const response = await fetch(`/edit-doctor/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            toastr.success(result.message || "Doctor updated successfully.");
            $('#editDoctor').modal('hide');
            window.location.href = `/doctor-list`; // Redirect to doctor list
        } else {
            toastr.error(result.message || "Failed to update Doctor.");
        }
    } catch (err) {
        toastr.error("Unexpected error occurred while saving changes.");
    }
}



// Delete customer
function deleteDoctorDetails(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete Doctor data: ${id}`,
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
                url: `/delete-doctor/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Doctor ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=doctorlist`);  // Custom redirect or refresh function
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


// refersh page..
function refresh() {
    Swal.fire({
        title: "Are you sure?",
        text: `This will refresh the page and reload Doctor search.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, refresh",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#7366F0",
        cancelButtonColor: "#6c757d"
    }).then((result) => {
        if (result.isConfirmed) {
            $("div.overlay").addClass("show");
            window.location.href = `/doctor-list`;
        }
    });
}
