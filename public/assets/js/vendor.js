// Add Customer JS
// document.addEventListener("DOMContentLoaded", function () {

//     const submitBtn = document.getElementById('submitBtn');
//     submitBtn.addEventListener('click', function () {
//         toggleOverlay(true);
//         submitData();
//     });
// });
//----------------------add local shippingForm ----------------------------------

let selectedOrderId = null; // global variable



async function addlocal_shippingForm() {
    var form = document.getElementById('local_shippingForm');
    var formData = new FormData(form); // ✅ No jQuery, direct FormData

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        toggleOverlay(true);

        const response = await fetch('/add-vendor-order-item', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token },
            body: formData
        });

        const data = await response.json();
        toggleOverlay(false);

        if (response.ok && data.status === 'success') {
            Swal.fire({
                title: "Data submitted successfully!",
                icon: "success"
            }).then(() => {
                form.reset();
                urldeliver(`?v=vendirlist`);
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



function addProduct() {
    let $container = $('#products-container');
    let $newRow = $container.find('.product-row').first().clone();

    // saare input clear kare
    $newRow.find('input').val('');

    // remove button visible kare
    $newRow.find('.p-remove-button').removeClass('d-none');

    // append kare container me
    $container.append($newRow);

    // pehli row ka remove button hidden rakhe
    $container.find('.product-row').first().find('.p-remove-button').addClass('d-none');
}

function removeProduct(button) {
    let $container = $('#products-container');
    if ($container.find('.product-row').length > 1) {
        $(button).closest('.product-row').remove();
    }
}



$(document).ready(function () {
    $('#submitBtn').on('click', function () {
        toggleOverlay(true);
        submitData();
    });

    //product auto fill
    $(document).on('keyup', '.autocomplete-code, .autocomplete-model', function () {
        const input = $(this);
        const query = input.val();
        // FIXED: send correct type (product_code or model_name)
        const type = input.hasClass('autocomplete-code') ? 'product_code' : 'model_name';
        const row = input.closest('.product-row');
        const suggestionBox = input.siblings('.suggestion-box');

        // Hide when clicked outside
        $(document).on('click', function (e) {
            if (!input.is(e.target) && !suggestionBox.is(e.target) && suggestionBox.has(e.target).length === 0) {
                suggestionBox.hide();
            }
        });

        if (query.length >= 2) {
            $.ajax({
                url: '/product-suggestions',
                type: 'GET',
                data: { query, type },
                success: function (res) {
                    let suggestions = '';
                    res.products.forEach(product => {
                        suggestions += `
                        <button type="button" class="dropdown-item suggestion-item" data-id="${product.id}">
                            ${product.product_code} - ${product.name}
                        </button>`;
                    });
                    suggestionBox.html(suggestions).addClass('dropdown-menu').css({
                        position: 'absolute',
                    }).show();
                }
            });
        } else {
            suggestionBox.hide();
        }
    });

    // On suggestion click
    $(document).on('click', '.suggestion-item', function () {
        const id = $(this).data('id');
        const row = $(this).closest('.product-row');
        const box = $(this).parent(); // suggestion-box

        $.ajax({
            url: '/get-product-details-by-id',
            type: 'GET',
            data: { id },
            success: function (res) {
                if (res.success) {
                    const p = res.product;
                    box.hide();

                    // ✅ Use correct keys from controller
                    row.find('input[name="product_id[]"]').val(p.product_code);
                    row.find('input[name="product_name[]"]').val(p.model_name);
                    row.find('input[name="categories[]"]').val(p.booking_type);
                    row.find('input[name="hsn_sac[]"]').val(p.hsn_sac);
                }
            }
        });
    });


});

async function submitData() {
    // Client-side validation
    var form = $('#new-vendor-form');
    var formData = form.serialize();

    var name = form.find('#name').val();
    var phone = form.find('#phone').val();
    var contact_person = form.find('#contact_person').val();

    if (!name || !phone || !contact_person) {
        toggleOverlay(false);
        toastr.error("Please fill the required fields.");
        return;
    }

    // Basic mobile number pattern (example, adjust as needed)
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(phone)) {
        toggleOverlay(false);
        toastr.error("Please enter a valid 10-digit mobile number.");
        return;
    }

    // CSRF token for Laravel
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    try {
        const response = await fetch('/new-vendor', {
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
            toastr.success("Vendor saved successfully!");
            form[0].reset();
            window.location.href = "/vendor-list";
        } else {
            toggleOverlay(false);
            toastr.error("Error: " + (data.message || "Something went wrong."));
        }

    } catch (error) {
        toggleOverlay(false);
        console.error("AJAX error:", error);
        toastr.error("An unexpected error occurred. Please try again.");
    }
}
``

// DataTable initialization
$(document).ready(function () {

    let vendorProductsDT;

    let vendorProductsTable; // global reference
    let vendorOrderItemsTable; // global reference



    vendorProductsTable = $('#VendorPurchaseInventory').DataTable({
        processing: true,
        columns: [
            {
                data: 'created_at', title: "Date",
                render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return `<strong>${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}</strong>`;
                }
            },
            { data: 'product_code', title: "Product code" },
            { data: 'quantity', title: "Qty" },
            { data: 'expiry', title: "Expiry" },
            { data: 'price_per_unit', title: "Price Per Unit" },
            { data: 'tax_percent', title: "Tax %" },
            { data: 'total_price', title: "Total Price" },
            { data: 'mrp', title: "MRP" }
        ],
    });

    vendorOrderItemsTable = $('#VendorOrderItemTable').DataTable({
        processing: true,
        columns: [
            {
                title: 'Action',
                render: function (data, type, row) {
                    return `
                    <center>
                        <span class='material-icons text-secondary cursor-pointer' id='VendorOrderItemUpdate' title='Vendor Order Item' data-bs-toggle='modal' data-id="${data}" data-bs-target='#VendorOrderItemUpdatemodal'>reply</span>
                    </center>
                `;
                }
            },
            {
                data: 'created_at', title: "Date",
                render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return `<strong>${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}</strong>`;
                }
            },
            { data: 'p_order_id', title: "Id" },
            { data: 'order_id', title: "Order Id" },
            { data: 'product_id', title: "Product Code" },
            { data: 'categories', title: "Category" },
            { data: 'product_name', title: "Product Name" },
            { data: 'quantity', title: "Qty" },
            { data: 'unit_price', title: "Price" },
            {
                data: 'expected_date', title: "Expect Date",
                render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return `<strong>${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}</strong>`;
                }
            },
            { data: 'damaged_qty', title: "Damaged Qty" },
            { data: 'missing_qty', title: "Missing Qty" },
            { data: 'remark', title: "Remark" },
        ],
    });

    $(document).on('click', '#VendorOrderItemUpdate', function () {
        let rowData = vendorOrderItemsTable.row($(this).closest('tr')).data();

        if (rowData) {
            // Fill modal fields with row data
            $('#OI_p_id').val(rowData.p_order_id);
            $('#OI_address').val(rowData.order_id);
            $('#OI_p_code').val(rowData.product_id);
            $('#OI_categories').val(rowData.categories);
            $('#OI_product_name').val(rowData.product_name);
            $('#OI_quantity').val(rowData.quantity);
            $('#OI_unit_price').val(rowData.unit_price);
            $('#OI_damaged_qty').val(rowData.damaged_qty);
            $('#OI_missing_qty').val(rowData.missing_qty);
            $('#OI_remark').val(rowData.remark);
        }
    });

    $(document).on('click', '#local_shipping', function () {
        const vendorId = $(this).data('id');

        // Get DataTable instance
        const table = $('#allvendorsTable').DataTable();

        // Get the row data for the clicked icon
        const rowData = table.row($(this).closest('tr')).data();

        if (rowData) {
            // Fill modal form fields
            $('#vendor_id').val(rowData.vendor_id || '');
            $('#vendor_name').val(rowData.name || '');
            $('#vendor_address').val(rowData.address || '');
            $('#vendor_phone').val(rowData.phone || '');
            $('#vendor_email').val(rowData.email || '');
        }

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('local_shippingModel'));
        modal.show();
    });

    //----------------------------add shopping cart 4th option ------------------------------

    $(document).on('click', '#VendorPI', function () {
        const vendorId = $(this).data('id');

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('VendorPIModel'));
        modal.show();

        // Fetch vendor order items
        $.ajax({
            url: `/vendor/${vendorId}/purchase-inventory`,
            type: 'GET',
            success: function (response) {
                vendorProductsTable.clear().rows.add(response.data).draw();
            },
            error: function () {
                alert('Failed to load purchase inventory');
            }
        });
    });




    //delete vendor
    $(document).on('click', '.delete-vendor-btn', function () {
        const vendorId = $(this).data('id');

        if (!confirm("Are you sure you want to delete this vendor?")) return;

        toggleOverlay(true);
        fetch(`/delete-vendor/${vendorId}`)
            .then(response => response.json())
            .then(data => {
                toggleOverlay(false);
                if (data.status === 'success') {
                    toastr.success('Vendor deleted successfully!');
                    const index = vendorData.findIndex(v => v.id === vendorId);
                    if (index !== -1) {
                        vendorData.splice(index, 1);  // Remove the vendor from the array
                    }

                    // Re-render the table
                    const table = $('#allvendorsTable').DataTable();
                    table.clear();
                    table.rows.add(vendorData);
                    table.draw();
                } else {
                    toastr.error("Error: " + (data.message || "Something went wrong."));
                }
            })
            .catch(error => {
                toggleOverlay(false);  // Hide overlay
                toastr.error("Failed to load vendor data.");
                console.error(error);
            });
    });

    $(document).on('click', '.delete-vendor-order-btn', function () {
        const vendorOId = $(this).data('id');

        if (!confirm("Are you sure you want to delete this vendor?")) return;

        toggleOverlay(true);
        fetch(`/delete-vendor-order/${vendorOId}`)
            .then(response => response.json())
            .then(data => {
                toggleOverlay(false);
                if (data.status === 'success') {
                    toastr.success('Vendor Order deleted successfully!');
                    setTimeout(function () {
                        urldeliver(`?v=vendirlist`);
                    }, 4000);
                } else {
                    toastr.error("Error: " + (data.message || "Something went wrong."));
                }
            })
            .catch(error => {
                toggleOverlay(false);  // Hide overlay
                toastr.error("Failed to load vendor data.");
                console.error(error);
            });
    });


    $(document).on('click', '.view-vendor-btn', function () {
        const vendorId = $(this).data('id');
        toggleOverlay(true);

        fetch(`/view-vendor/${vendorId}`)
            .then(response => response.json())
            .then(response => {
                let brandsArray = [];
                try {
                    const brands = response.data.brands;

                    if (typeof brands === 'string') {
                        brandsArray = JSON.parse(brands); // try parsing JSON
                    } else if (Array.isArray(brands)) {
                        brandsArray = brands; // already an array
                    }
                } catch (e) {
                    // fallback: maybe it's just a plain string like "test,test2"
                    brandsArray = response.data.brands.split(',').map(b => b.trim());
                }
                toggleOverlay(false);
                if (response.status === 'success') {
                    // Fill modal data
                    $('#viewVendor #v_name').text(response.data.name);
                    $('#viewVendor #v_email').text(response.data.email ? response.data.email : '-');
                    $('#viewVendor #v_phone').text(response.data.phone ? response.data.phone : '-');
                    $('#viewVendor #v_address').text(response.data.address ? response.data.address : '-');
                    $('#viewVendor #v_city').text(response.data.city ? response.data.city : '-');
                    $('#viewVendor #v_state').text(response.data.state ? response.data.state : '-');
                    $('#viewVendor #v_country').text(response.data.country ? response.data.country : '-');
                    $('#viewVendor #v_postal_code').text(response.data.postal_code ? response.data.postal_code : '-');
                    $('#viewVendor #v_gst_number').text(response.data.gst_number ? response.data.gst_number : '-');
                    $('#viewVendor #v_gst').text(response.data.gst ? response.data.gst + '%' : '-');
                    $('#viewVendor #v_brands').text(response.data.brands ? response.data.brands.join(', ') : '-');
                    $('#viewVendor #v_pan_number').text(response.data.pan_number ? response.data.pan_number : '-');
                    $('#viewVendor #v_contact_person').text(response.data.contact_person ? response.data.contact_person : '-');
                    $('#viewVendor #v_contact_person_phone').text(response.data.contact_person_phone ? response.data.contact_person_phone : '-');
                    $('#viewVendor #v_status').text(response.data.status ? response.data.status : '-');

                    // Show the modal
                    const modalEl = document.getElementById('viewVendor');
                    const viewVendorModal = bootstrap.Modal.getOrCreateInstance(modalEl);
                    viewVendorModal.show();

                    // Handle cleanup on hide
                    modalEl.addEventListener('hidden.bs.modal', () => {
                        $('.modal-backdrop').remove(); // Remove lingering backdrop
                        $('body').removeClass('modal-open'); // Restore scroll
                    }, { once: true });

                } else {
                    toastr.error("Error: " + (response.message || "Something went wrong."));
                }

            })
            .catch(error => {
                toggleOverlay(false);
                toastr.error("Failed to load vendor data.");
                console.error(error);
            });
    });



    if ($('#allvendorsTable').length) {
        $('#allvendorsTable').DataTable({
            processing: true,
            serverSide: true,
            lengthMenu: [[100, 500, 1000], [100, 500, 1000]],
            ajax: {
                url: "/vendor-list",  // Make sure this route exists
                type: 'GET'
            },
            columns: [
                {
                    title: 'Actions',
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <center>
                                <span class="material-icons text-primary cursor-pointer edit-vendor-btn" data-id="${row.id}">edit</span>
                                <span class="material-icons text-secondary cursor-pointer ms-2 view-vendor-btn" data-id="${row.id}">info</span>
                                <span class="material-icons text-primary cursor-pointer ms-2" data-id="${row.id}" id="local_shipping">local_shipping</span>
                                <span class="material-icons cursor-pointer ms-2 " data-id="${row.vendor_id}" style="color: #00E676;" id="VendorPI">add_shopping_cart</span>
                            </center>
                        `;
                    }
                },
                { data: 'vendor_id', title: 'ID' },
                { data: 'name', title: 'Name' },
                { data: 'phone', title: 'Phone' },
                { data: 'email', title: 'Email' },
                { data: 'address', title: 'Address' },
                { data: 'city', title: 'City' },
                { data: 'state', title: 'State' },
                { data: 'country', title: 'Country' },
                { data: 'postal_code', title: 'Postal Code' },
                { data: 'gst_number', title: 'GST Number' },
                { data: 'pan_number', title: 'PAN Number' },
                { data: 'contact_person', title: 'Contact Person' },
                { data: 'status', title: 'Status' },
                {
                    title: 'Delete',
                    orderable: false,
                    render: function (data, type, row) {
                        if (canDelete) {
                            return `
                            <center>
                                <span class="material-icons text-danger cursor-pointer ms-2 delete-vendor-btn" data-id="${row.id}">delete</span>
                            </center>
                        `;
                        } else {
                            return ''; // agar permission nahi hai to empty cell
                        }
                    }
                }
            ]
        });
    }

    if ($('#OrderListTable').length) {
        $('#OrderListTable').DataTable({
            processing: true,
            serverSide: true,
            lengthMenu: [[100, 500, 1000], [100, 500, 1000]],
            search: true,
            ajax: {
                url: "/vendor-order-list",  // Make sure this route exists
                type: 'GET'
            },
            columns: [
                {
                    title: 'Actions',
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <center>
                                <span class='material-icons text-secondary cursor-pointer' id='VendorOrderItms' title='Update Status JC' data-bs-toggle='modal' data-id="${row.order_id}" data-bs-target='#VendorOrderItmsModel'>info</span>
                                <span class='material-icons text-primary cursor-pointer' id='VOstatusdel' title='Update Status JC' data-bs-toggle='modal' data-id="${row.order_id}" data-bs-target='#VOstatusdelmodal'>add_task</span>
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
                { data: 'order_id', title: 'Order ID' },
                { data: 'vendor_id', title: 'Vendor ID' },
                { data: 'name', title: 'Name' },
                { data: 'address', title: 'Address' },
                { data: 'mobile', title: 'Mobile' },
                { data: 'email', title: 'Email' },
                { data: 'order_by', title: 'Order by' },
                { data: 'status', title: 'Status' },
                {
                    title: 'Delete',
                    render: function (data, type, row) {
                        if (canDelete) {
                            return `
                            <center>
                                <span class="material-icons text-danger cursor-pointer ms-2 delete-vendor-order-btn" data-id="${row.id}">delete</span>
                            </center>
                        `;
                        } else {
                            return ''; // agar permission nahi hai to empty cell
                        }
                    }
                }
            ]
        });

    }

    $(document).on('click', '.edit-vendor-btn', function () {
        const vendorId = $(this).data('id');
        toggleOverlay(true);

        fetch(`/edit-vendor/${vendorId}`)
            .then(response => response.json())
            .then(data => {
                $('#gst').val(data.gst).trigger('change');
                toggleOverlay(false);

                // Fill form fields
                $('#editVendor #name').val(data.name);
                $('#editVendor #email').val(data.email);
                $('#editVendor #phone').val(data.phone);
                $('#editVendor #address').val(data.address);
                $('#editVendor #city').val(data.city);
                $('#editVendor #state').val(data.state);
                $('#editVendor #country').val(data.country);
                $('#editVendor #postal_code').val(data.postal_code);
                $('#editVendor #gst_number').val(data.gst_number);
                $('#editVendor #gst').val(data.gst);
                $('#editVendor #brands').val(data.brands?.join(', '));
                $('#editVendor #pan_number').val(data.pan_number);
                $('#editVendor #contact_person').val(data.contact_person);
                $('#editVendor #contact_person_phone').val(data.contact_person_phone);
                $('#editVendor #status').val(data.status);

                // Save ID for update
                $('#edit-vendor-form').data('vendor-id', vendorId);

                // Enable save button
                $('#saveButton').prop('disabled', false);

                // 🔑 Show modal after data is filled
                const editVendorModal = new bootstrap.Modal(document.getElementById('editVendor'));
                editVendorModal.show();
            })
            .catch(error => {
                toggleOverlay(false);
                toastr.error("Failed to load vendor data.");
                console.error(error);
            });
    });

    $(document).on('click', '#edit-vendor-form #saveButton', function (e) {
        e.preventDefault();
        updateVendor()
    })

    async function updateVendor() {
        const form = $('#edit-vendor-form');
        const vendorId = form.data('vendor-id');
        const formData = new URLSearchParams();

        const name = form.find('#name').val();
        const phone = form.find('#phone').val();
        const contact_person = form.find('#contact_person').val();

        if (!name || !phone || !contact_person) {
            toggleOverlay(false);
            toastr.error("Please fill the required fields.");
            return;
        }

        const mobilePattern = /^[0-9]{10}$/;
        if (!mobilePattern.test(phone)) {
            toggleOverlay(false);
            toastr.error("Please enter a valid 10-digit mobile number.");
            return;
        }

        form.serializeArray().forEach(input => {
            formData.append(input.name, input.value);
        });

        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        try {
            toggleOverlay(true);
            const response = await fetch(`/edit-vendor/${vendorId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-TOKEN': token
                },
                body: formData
            });

            const data = await response.json();
            toggleOverlay(false);

            if (response.ok && data.status === 'success') {
                toastr.success('Vendor updated successfully!');

                // Update local array
                const vendorId = $('#edit-vendor-form').data('vendor-id');
                const updatedVendor = {
                    id: vendorId,
                    name: $('#editVendor #name').val(),
                    phone: $('#editVendor #phone').val(),
                    email: $('#editVendor #email').val(),
                    address: $('#editVendor #address').val(),
                    city: $('#editVendor #city').val(),
                    state: $('#editVendor #state').val(),
                    country: $('#editVendor #country').val(),
                    postal_code: $('#editVendor #postal_code').val(),
                    gst_number: $('#editVendor #gst_number').val(),
                    pan_number: $('#editVendor #pan_number').val(),
                    contact_person: $('#editVendor #contact_person').val(),
                    contact_person_phone: $('#editVendor #contact_person_phone').val(),
                    status: $('#editVendor #status').val()
                };

                // Update local array
                const index = vendorData.findIndex(v => v.id == vendorId);
                if (index !== -1) {
                    vendorData[index] = updatedVendor;
                }

                // Re-render table
                const table = $('#allvendorsTable').DataTable();
                table.clear();
                table.rows.add(vendorData);
                table.draw();

                $('#editVendor').modal('hide');
            } else {
                toastr.error("Error: " + (data.message || "Something went wrong."));
            }

        } catch (error) {
            toggleOverlay(false);
            console.error("AJAX error:", error);
            toastr.error("An unexpected error occurred.");
        }
    }


    // ============= gst calculation ========================

    // Track if user manually changed gst_amount or total_price for a row
    let userModifiedProduct = {};

    $(document).on('input', 'input[name="gst_amount[]"], input[name="total_price[]"]', function () {
        const row = $(this).closest('.product-row');
        const rowIndex = row.index();
        if (!userModifiedProduct[rowIndex]) userModifiedProduct[rowIndex] = {};
        userModifiedProduct[rowIndex][$(this).attr('name')] = true;
    });

    // Function to calculate GST for one row
    function calculateProductRow(row) {
        const qty = parseFloat(row.find('input[name="quantity[]"]').val()) || 0;
        const unitPrice = parseFloat(row.find('input[name="unit_price[]"]').val()) || 0;
        const gstType = row.find('select[name="gst_type[]"]').val();
        const gstPercent = parseFloat(row.find('select[name="gst_percent[]"]').val()) || 0;

        let basePrice = qty * unitPrice;
        let gstAmount = 0;
        let totalPrice = 0;

        if (gstType === "Included") {
            totalPrice = basePrice;
            gstAmount = (totalPrice * gstPercent) / (100 + gstPercent);
            basePrice = totalPrice - gstAmount;
        } else if (gstType === "Excluded") {
            gstAmount = (basePrice * gstPercent) / 100;
            totalPrice = basePrice + gstAmount;
        }

        gstAmount = parseFloat(gstAmount.toFixed(2));
        totalPrice = parseFloat(totalPrice.toFixed(2));

        const rowIndex = row.index();
        if (!userModifiedProduct[rowIndex] || !userModifiedProduct[rowIndex]['gst_amount[]']) {
            row.find('input[name="gst_amount[]"]').val(gstAmount);
        }
        if (!userModifiedProduct[rowIndex] || !userModifiedProduct[rowIndex]['total_price[]']) {
            row.find('input[name="total_price[]"]').val(totalPrice);
        }
    }

    // Recalculate when qty, price, GST type, or GST percent changes
    $(document).on('input change', 'input[name="quantity[]"], input[name="unit_price[]"], select[name="gst_type[]"], select[name="gst_percent[]"]', function () {
        const row = $(this).closest('.product-row');
        const rowIndex = row.index();
        userModifiedProduct[rowIndex] = {
            'gst_amount[]': false,
            'total_price[]': false
        };
        calculateProductRow(row);
    });

    // Initial calculation for all rows on page load
    $('#products-container .product-row').each(function () {
        calculateProductRow($(this));
    });


    //========================== Vendor Order Items table ==================]

    $(document).on('click', '#VendorOrderItms', function () {
        let orderId = $(this).data('id');
        selectedOrderId = $(this).data('id');

        // Fetch vendor order
        $.ajax({
            url: `/vendor/${orderId}/order-inventory`,
            type: 'GET',
            success: function (response) {
                vendorOrderItemsTable.clear().rows.add(response.data).draw();
            },
            error: function () {
                alert('Failed to load purchase inventory');
            }
        });
    });

});


//------------------------ update status --------------------
$(document).on('click', '#VOstatusdel', function () {
    const table = $('#OrderListTable').DataTable();

    const rowData = table.row($(this).closest('tr')).data();

    $('#VOId').val(rowData.order_id);

    $('#currentstatus').text(rowData.status);

    $('#adselectstatus').val(rowData.status);

    if (rowData.status === "return") {
        $("#CreditNote").closest('.col-md-3').show();
    } else {
        $("#CreditNote").val("").closest('.col-md-3').hide();
    }
});



async function updatestatuses() {
    var form = document.getElementById('statusupdate');
    var formData = new FormData(form); // ✅ No jQuery, direct FormData

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        toggleOverlay(true);

        const response = await fetch('/update-vendor-order-status', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token },
            body: formData
        });

        const data = await response.json();
        toggleOverlay(false);

        if (response.ok && data.status === 'success') {
            Swal.fire({
                title: "Status update successfully!",
                icon: "success"
            }).then(() => {
                form.reset();
                urldeliver(`?v=vendirlist`);
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

// vendor status order update time work to add credit note if selected type is return .
$(document).ready(function () {
    // By default Credit Note hide
    $("#CreditNote").closest('.col-md-3').hide();

    // On status change
    $("#adselectstatus").on("change", function () {
        let status = $(this).val();

        if (status === "return") {
            $("#CreditNote").closest('.col-md-3').show();
        } else {
            // Hide and clear value
            $("#CreditNote").val("").closest('.col-md-3').hide();
        }
    });
});

// -------------------------vendow order update function -----------------------------
async function UpadatVOIForm() {
    var OrderId = $('#OI_p_id').val();
    var form = document.getElementById('Vendor_order_item_update');
    var formData = new FormData(form); // ✅ No jQuery, direct FormData

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        toggleOverlay(true);

        const response = await fetch(`/update-vendor-order-items/${OrderId}`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token },
            body: formData
        });

        const data = await response.json();
        toggleOverlay(false);

        if (response.ok && data.status === 'success') {
            Swal.fire({
                title: "Update vendor order item submitted successfully!",
                icon: "success"
            }).then(() => {
                form.reset();
                urldeliver(`?v=vendirlist`);
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



$(document).on('click', '.btn-return', async function () {
    try {
        toggleOverlay(true);
        let response = await fetch(`/vendor-order-items/${selectedOrderId}`);
        let items = await response.json();
        toggleOverlay(false);

        let container = $('#bulk-products-container');
        container.empty();

        items.forEach((item, index) => {
            container.append(`
                <div class="border rounded p-3 mb-3">
                    <h6>Product ${index + 1}: ${item.product_name}</h6>

                    <div class="row g-2">
                        <div class="col-md-2">
                            <label>Order Id</label>
                            <input type="text" class="form-control" name="items[${index}][p_order_id]" value="${item.p_order_id || ''}" readonly>
                        </div>
                        <div class="col-md-2">
                            <label>Order Id</label>
                            <input type="text" class="form-control" name="items[${index}][order_id]" value="${item.order_id || ''}" readonly>
                        </div>
                        <div class="col-md-2">
                            <label>Product Code</label>
                            <input type="text" class="form-control" name="items[${index}][product_id]" value="${item.product_id || ''}" readonly>
                        </div>
                        <div class="col-md-2">
                            <label>Category</label>
                            <input type="text" class="form-control" name="items[${index}][categories]" value="${item.categories || ''}" readonly>
                        </div>
                        <div class="col-md-2">
                            <label>Product Name</label>
                            <input type="text" class="form-control" name="items[${index}][product_name]" value="${item.product_name || ''}" readonly>
                        </div>
                        <div class="col-md-2">
                            <label>Quantity</label>
                            <input type="text" class="form-control" name="items[${index}][quantity]" value="${item.quantity || ''}" readonly>
                        </div>
                        <div class="col-md-2">
                            <label>Price Per Unit</label>
                            <input type="text" class="form-control" name="items[${index}][unit_price]" value="${item.unit_price || ''}">
                        </div>
                        <div class="col-md-2">
                            <label>Damaged Qty</label>
                            <input type="text" class="form-control" name="items[${index}][damaged_qty]" value="${item.damaged_qty || ''}">
                        </div>
                        <div class="col-md-2">
                            <label>Missing Qty</label>
                            <input type="text" class="form-control" name="items[${index}][missing_qty]" value="${item.missing_qty || ''}">
                        </div>
                        <div class="col-md-6">
                            <label>Remark</label>
                            <input type="text" class="form-control" name="items[${index}][remark]" value="${item.remark || ''}">
                        </div>
                    </div>
                </div>
            `);
        });

        // Close first modal
        $('#VendorOrderItmsModel').modal('hide');

        // Wait for modal close animation to finish, then open next
        setTimeout(() => {
            $('#VendorBulkUpdateModal').modal('show');
        }, 400); // Bootstrap fade animation delay

    } catch (error) {
        toggleOverlay(false);
        toastr.error("Error loading items");
    }
});


async function updateBulkVOI() {
    let form = document.getElementById('Vendor_bulk_update_form');
    let formData = new FormData(form);
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        toggleOverlay(true);
        let response = await fetch(`/update-vendor-order-items-bulk`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token },
            body: formData
        });

        toggleOverlay(false);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();

        if (data.status === 'success') {
            Swal.fire("Updated!", "All vendor order items updated successfully", "success");
            $('#VendorBulkUpdateModal').modal('hide');
        } else {
            Swal.fire("Error!", data.message || "Something went wrong", "error");
        }
    } catch (error) {
        toggleOverlay(false);
        toastr.error(error.message || "An unexpected error occurred.");
    }
}
