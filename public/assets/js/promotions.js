$(document).ready(function () {
    $('#submitBtn').on('click', function (e) {
        e.preventDefault();
        toggleOverlay(true);
        submitData();
    });
});

async function submitData() {
    var form = $('#temtlateForm');
    var formData = form.serialize();

    // CSRF token for Laravel
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    try {

        //send to request
        const response = await fetch('/promotion/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRF-TOKEN': token
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            toggleOverlay(false);
            Swal.fire({
                title: "Template Successfully Added",
                text: `Template added successfully.`,
                icon: "success"
            }).then(() => {
                form[0].reset();
                urldeliver(`?v=Templatelist`);  // Custom redirect or refresh function
            });
        } else {
            toggleOverlay(false);
            Swal.fire({
                title: "Error!",
                text: "Error: " + data.message || "Something went wrong.",
                icon: "error"
            });
        }
    } catch (error) {
        toggleOverlay(false);
        console.error("AJAX error:", error);
        toastr.error("An unexpected error occurred. Please try again.");
    }
}

function setStatusAndSubmit(value) {
    document.getElementById('status').value = value;
    addEmailTemplate(); // No event needed
}

async function addEmailTemplate() {
    var form = document.getElementById('addEmailTemplate');
    var formData = new FormData(form); // ✅ No jQuery, direct FormData

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        toggleOverlay(true);

        const response = await fetch('/promotion/add-email-template', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token },
            body: formData
        });

        const data = await response.json();
        toggleOverlay(false);

        if (response.ok && data.status === 'success') {
            Swal.fire({
                title: "Email campaign submitted successfully!",
                icon: "success"
            }).then(() => {
                form.reset();
                urldeliver(`?v=Templatelist`);
            });
        } else {
            Swal.fire({
                title: "Error!",
                text: data.message || "Something went wrong.",
                icon: "error"
            });
        }
    } catch (error) {
        toggleOverlay(false);
        console.error("AJAX error:", error);
        toastr.error("An unexpected error occurred. Please try again.");
    }
}

function setStatusAndSubmit1(value) {
    document.getElementById('status1').value = value;
    addWhatsappTemplate(); // No event needed
}

async function addWhatsappTemplate() {
    var form = document.getElementById('addWhatsappTemplate');
    var formData = new FormData(form); // ✅ No jQuery, direct FormData

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        toggleOverlay(true);

        const response = await fetch('/promotion/add-whatsapp-template', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token },
            body: formData
        });

        const data = await response.json();
        toggleOverlay(false);

        if (response.ok && data.status === 'success') {
            Swal.fire({
                title: "Whatsapp campaign submitted successfully!",
                icon: "success"
            }).then(() => {
                form.reset();
                urldeliver(`?v=Templatelist`);
            });
        } else {
            Swal.fire({
                title: "Error!",
                text: data.message || "Something went wrong.",
                icon: "error"
            });
        }
    } catch (error) {
        toggleOverlay(false);
        console.error("AJAX error:", error);
        toastr.error("An unexpected error occurred. Please try again.");
    }
}


// DataTable initialization
$(document).ready(function () {

    $('#allTemplateTable').DataTable({
        data: TemplateData,
        columns: [
            {
                data: "created_at", title: 'Date',
                render: function (data, type, row) {
                    if (!data) return '';
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                    const year = date.getFullYear();
                    return `<strong>${day}-${month}-${year}</strong>`;
                }
            },
            { data: "template_id", title: 'Template ID' },
            { data: "type", title: 'Type' },
            { data: 'title', title: 'Title' },
            { data: 'content', title: 'Template' },
            {
                title: 'Action',
                render: function (data, type, row) {
                    return `
                    <center>
                        <span id='deleteTemplate' class='material-icons text-danger cursor-pointer ms-2' title='Delete Customer'>delete</span>
                    </center>
                `;
                }
            },


        ],
        scrollX: true // for horizontal scroll
    });


    // 2️⃣ Populate dropdowns from TemplateData
    function populateTemplateDropdowns() {
        $('#emailTemplates').empty().append('<option value="">Select</option>');
        $('#whatsappTemplates').empty().append('<option value="">Select</option>');

        TemplateData.forEach(function (tpl) {
            if (tpl.type === 'Email') {
                $('#emailTemplates').append(
                    `<option value="${tpl.id}">${tpl.template_id}</option>`
                );
            } else if (tpl.type === 'Whatsapp') {
                $('#whatsappTemplates').append(
                    `<option value="${tpl.id}">${tpl.template_id}</option>`
                );
            }
        });

        // Initial disabled state
        $('#emailSubject, #emailTemplateContent').prop('disabled', true);
        // $('#whatsappSubject, #whatsappTemplateContent').prop('disabled', true); // always disabled
        $('#metaTemplateId, #imageUrl').prop('disabled', true); // optional fields
    }
    populateTemplateDropdowns();

    // Auto-fill Email form
    $('#emailTemplates').on('change', function () {
        const selectedId = $(this).val();

        if (!selectedId) {
            $('#emailSubject, #emailTemplateContent').val('').prop('disabled', true);
            return;
        }

        $('#emailSubject, #emailTemplateContent').prop('disabled', false);

        const tpl = TemplateData.find(t => String(t.id) === String(selectedId));
        if (tpl) {
            $('#emailType').val(tpl.type);
            $('#emailSubject').val(tpl.title);
            $('#emailTemplateContent').val(tpl.content);
        }
    });

    // Auto-fill WhatsApp form
    $('#whatsappTemplates').on('change', function () {
        const selectedId = $(this).val();

        if (!selectedId) {
            $('#metaTemplateId, #imageUrl').val('').prop('disabled', true);
            $('#whatsappSubject, #whatsappTemplateContent').val(''); // stays disabled
            return;
        }

        $('#metaTemplateId, #imageUrl').prop('disabled', false);

        const tpl = TemplateData.find(t => String(t.id) === String(selectedId));
        if (tpl) {
            $('#whatsappType').val(tpl.type);
            $('#whatsappSubject').val(tpl.title); // stays disabled
            $('#whatsappTemplateContent').val(tpl.content); // stays disabled
        }
    });




    // Attach event listener to table rows
    $('#allTemplateTable tbody').on('click', 'span', function () {
        const table = $('#allTemplateTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let tId = data['template_id'];
        // let Username = data[3];
        // let Usermobile = data[5];

        selectedUser = data;

        populateTemplateDropdowns();

        if (spanId === "deleteTemplate") {
            deleteTemplateDetails(tId);
        } else if (spanId === "") {
            //
        }
    });

    //-----------------------------all Loyal Customer List Table--------------------
    // Loyal Customers Table
    $('#allLoyalCustomerListTable').DataTable({
        data: loyalData,
        columns: [
            { data: 'lastVisit', title: 'Last Visit' },
            { data: 'name', title: 'Name' },
            { data: 'email', title: 'Email' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'recentVisits', title: 'Total Visit (in 6 months)' },
            // {
            //     title: 'Action',
            //     render: function () {
            //         return `
            //         <center>
            //             <span class='material-icons text-primary cursor-pointer ms-2'
            //                   id='editPromotions' title='Send Chat'
            //                   data-bs-toggle='modal' data-bs-target='#editUser'>chat</span>
            //         </center>`;
            //     }
            // }
        ],
        scrollX: true
    });


    // Attach event listener to table rows
    $('#allLoyalCustomerListTable tbody').on('click', 'span', function () {
        const table = $('#allLoyalCustomerListTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['User_id'];
        let Username = data[3];
        let Usermobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Username);
        // $('#invoicecmobile').val(Usermobile);
        selectedUser = data;

        if (spanId === "editPromotions`") {
            editUserDetail(data, cId);
        } else if (spanId === "deleteUser") {
            deleteUserDetails(cId);
        }
    });

    //-----------------------------all Loyal Customer List Table--------------------
    // Irregular Customers Table
    $('#allIrregularCustomerListTable').DataTable({
        data: irregularData,
        columns: [
            { data: 'lastVisit', title: 'Last Visit' },
            { data: 'name', title: 'Name' },
            { data: 'email', title: 'Email' },
            { data: 'mobile', title: 'Mobile' },
            // {
            //     title: 'Action',
            //     render: function () {
            //         return `
            //         <center>
            //             <span class='material-icons text-primary cursor-pointer ms-2'
            //                   id='editPromotions' title='Send Chat'
            //                   data-bs-toggle='modal' data-bs-target='#editUser'>chat</span>
            //         </center>`;
            //     }
            // }
        ],
        scrollX: true
    });



    // Attach event listener to table rows
    $('#allIrregularCustomerListTable tbody').on('click', 'span', function () {
        const table = $('#allIrregularCustomerListTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['User_id'];
        let Username = data[3];
        let Usermobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Username);
        // $('#invoicecmobile').val(Usermobile);
        selectedUser = data;

        if (spanId === "editPromotions`") {
            editUserDetail(data, cId);
        } else if (spanId === "deleteUser") {
            deleteUserDetails(cId);
        }
    });

    //-----------------------------all Loyal Customer List Table--------------------
    $('#allCampaignListTable').DataTable({
        data: campData,
        columns: [
            {
                data: 'created_at', title: 'Date',
                render: function (data, type, row) {
                    if (!data) return '';
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                    const year = date.getFullYear();
                    return `<strong>${day}-${month}-${year}</strong>`;
                }
            },
            { data: 'campaign_id', title: 'Campaign ID' },
            { data: 'template_id', title: 'Template ID' },
            { data: 'type', title: 'Type' },
            { data: 'title', title: 'Title' },
            { data: 'content', title: 'Content' },
            {
                data: 'image', title: 'Image',
                render: function (data, type, row) {
                    if (!data) return 'No Image';
                    return `<a href="${data}" target="_blank">
                            view
                        </a>`;
                }
            },
            { data: 'status', title: 'Status' },
            {
                title: 'Action',
                render: function (data, type, row) {
                    return `
                    <center>
                        <span class='material-icons text-danger cursor-pointer ms-2' id='deletePromotions' title='Edit User' data-bs-toggle='modal' data-bs-target='#editUser'>delete</span>
                    </center>
                `;
                }
            },


        ],
        // scrollX: true // for horizontal scroll
    });



    // Attach event listener to table rows
    $('#allCampaignListTable tbody').on('click', 'span', function () {
        const table = $('#allCampaignListTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['campaign_id'];
        // let Username = data[3];
        // let Usermobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Username);
        // $('#invoicecmobile').val(Usermobile);
        selectedUser = data;

        if (spanId === "editPromotions`") {
            editUserDetail(data, cId);
        } else if (spanId === "deletePromotions") {
            deletePromotionDetails(cId);
        }
    });

});

function deletePromotionDetails(id) {

    Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete this Campaign data?: ${id}`,
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
                url: `/promotion/delete-Campaign/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `campaign ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=campaignlist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Campaign. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}

// Delete User
function deleteTemplateDetails(id) {

    Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete this Template?: ${id}`,
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
                url: `/promotion/delete/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Template ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=Templatelist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Template. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}
