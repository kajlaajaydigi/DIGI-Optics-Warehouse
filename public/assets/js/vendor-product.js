$(document).ready(function () {
    $('#submitBtn').on('click', function () {
        toggleOverlay(true);
        submitData();
    });
});

async function submitData() {
    // Client-side validation
    var form = $('#new-vendor-product-form');
    var formData = form.serialize();

    // CSRF token for Laravel
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        const response = await fetch('/new-vendor-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRF-TOKEN': token
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // console.log("response->", response);
            toggleOverlay(false);
            toastr.success("Vendor product saved successfully!");
            form[0].reset();
            window.location.href = "/vendor-product-list";
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

// DataTable initialization
$(document).ready(function () {

    $('body').on('hidden.bs.modal', '.modal', function () {
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');
    });


    $(document).on('click', '.view-vendor-product-btn', function () {
        const id = $(this).data('id');

        toggleOverlay(true);
        fetch(`/vendor-product/${id}`)
            .then(res => res.json())
            .then(res => {
                toggleOverlay(false);
                if (res.status === 'success') {
                    const data = res.data;
                    $('#v_vendor').text(data.vendor_name);
                    $('#v_product').text(data.product_name);
                    $('#v_cost_price').text(data.cost_price);
                    $('#v_lead_time_days').text(data.lead_time_days);
                    $('#v_moq').text(data.moq);
                    $('#v_notes').text(data.notes || '-');

                    const modalElement = document.getElementById('viewVendorProduct');
                    const modal = new bootstrap.Modal(modalElement);

                    // Make sure to remove any existing backdrop manually if necessary
                    $('.modal-backdrop').remove();
                    $('body').removeClass('modal-open');

                    modal.show();

                    // Optional: clean up when hidden
                    $(modalElement).on('hidden.bs.modal', function () {
                        $('.modal-backdrop').remove(); // Ensure no leftover backdrop
                        $('body').removeClass('modal-open'); // Reset body class
                    });

                } else {
                    toastr.error(res.message || "Data not found");
                }
            })
            .catch(err => {
                toggleOverlay(false);
                toastr.error("Failed to load product details");
                console.error(err);
            });
    });




    if ($('#allVendorProductsTable').length) {
        $('#allVendorProductsTable').DataTable({
            processing: true,
            lengthMenu: [[100, 500, 1000], [100, 500, 1000]],
            serverSide: true,
            ajax: {
                url: "/vendor-product-list",  // Make sure this route exists
                type: 'GET'
            },
            columns: [
                {
                    title: 'Action', // Add Action column title
                    orderable: false,
                    render: function (data, type, row) {
                        // Action buttons with Google Material Icons
                        return `
                            <center>
                                <span class='edit-vendor-product-btn material-icons text-primary cursor-pointer' data-id="${row.id}"  id='editvendorproduct' title='Edit Vendot Product' >edit</span>
                                <span class='view-vendor-product-btn material-icons text-secondary cursor-pointer ms-2 view-vendor-product-btn' data-id="${row.id}"  id='viewvendorproduct' title='View Vendor Product' data-bs-toggle='modal' data-bs-target='#viewVendorProduct'>info</span>
                            </center>
                        `;
                    }
                },
                { data: 'id', title: 'ID' },
                { data: 'vendor_name', title: 'Vendor' },
                { data: 'product_name', title: 'Product' },
                { data: 'cost_price', title: 'Cost Price' },
                { data: 'lead_time_days', title: 'Lead Time Days' },
                { data: 'moq', title: 'Moq' },
                {
                    title: 'Delete',
                    render: function (data, type, row) {
                        // Action buttons with Google Material Icons
                        return `
                            <center><span id='deletevendorproduct' class='delete-vendor-product-btn material-icons text-danger cursor-pointer ms-2' data-id="${row.id}" title='Delete Vendor Product'>delete</span></center>
                        `;
                    }
                }
            ]
        });
    }

    $(document).on('click', '.edit-vendor-product-btn', function () {
        const productId = $(this).data('id'); // Assuming you're passing product_id
        toggleOverlay(true);

        fetch(`/edit-vendor-product/${productId}`) // Update this endpoint to match your route
            .then(response => response.json())
            .then(data => {
                toggleOverlay(false);

                // Populate form fields based on your modal structure
                $('#editVendorProduct #vendor_id').val(data.vendor_id);
                $('#editVendorProduct #product_id').val(data.product_id);
                $('#editVendorProduct #cost_price').val(data.cost_price);
                $('#editVendorProduct #lead_time_days').val(data.lead_time_days);
                $('#editVendorProduct #moq').val(data.moq);
                $('#editVendorProduct #notes').val(data.notes);

                // Save the product ID for update
                $('#edit-vendor-product-form').data('product-id', productId);

                // Enable the Save button
                $('#saveButton').prop('disabled', false);

                // Show modal
                const editVendorModal = new bootstrap.Modal(document.getElementById('editVendorProduct'));
                editVendorModal.show();
            })
            .catch(error => {
                toggleOverlay(false);
                toastr.error("Failed to load vendor product data.");
                console.error(error);
            });
    });

    $(document).on('click', '#edit-vendor-product-form #saveButton', function (e) {
        e.preventDefault();
        updateVendorProduct();
    });

    async function updateVendorProduct() {
        const form = $('#edit-vendor-product-form');
        const productId = form.data('product-id');
        const formData = new URLSearchParams();

        const vendorId = form.find('#vendor_id').val();
        const productIdValue = form.find('#product_id').val();
        const costPrice = form.find('#cost_price').val();
        const leadTime = form.find('#lead_time_days').val();
        const moq = form.find('#moq').val();
        const notes = form.find('#notes').val();

        // Basic validation
        if (!vendorId || !productIdValue || !costPrice || !leadTime || !moq || !notes) {
            toggleOverlay(false);
            toastr.error("Please fill all required fields.");
            return;
        }

        form.serializeArray().forEach(input => {
            formData.append(input.name, input.value);
        });

        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        try {
            toggleOverlay(true);
            const response = await fetch(`/edit-vendor-product/${productId}`, {
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
                toastr.success('Vendor product updated successfully!');

                const vendorProductId = $('#edit-vendor-product-form').data('vendor-product-id');
                const updatedProduct = {
                    id: vendorProductId,
                    vendor_id: $('#editVendorProduct #vendor_id').val(),
                    product_id: $('#editVendorProduct #product_id').val(),
                    cost_price: $('#editVendorProduct #cost_price').val(),
                    lead_time_days: $('#editVendorProduct #lead_time_days').val(),
                    moq: $('#editVendorProduct #moq').val(),
                    notes: $('#editVendorProduct #notes').val()
                };

                // Update the local array
                const index = vendorProductData.findIndex(p => p.id == vendorProductId);
                if (index !== -1) {
                    vendorProductData[index] = updatedProduct;
                }

                // Re-render the table
                const table = $('#allVendorProductsTable').DataTable();
                table.clear();
                table.rows.add(vendorProductData);
                table.draw();

                // Hide modal
                $('#editVendorProduct').modal('hide');

            } else {
                toastr.error("Error: " + (data.message || "Something went wrong."));
            }

        } catch (error) {
            toggleOverlay(false);
            console.error("AJAX error:", error);
            toastr.error("An unexpected error occurred.");
        }
    }

});

//delete vendor
$(document).on('click', '.delete-vendor-product-btn', function () {
    const vendorId = $(this).data('id');

    if (!confirm("Are you sure you want to delete this vendor product?")) return;

    toggleOverlay(true);
    fetch(`/delete-vendor-product/${vendorId}`)
        .then(response => response.json())
        .then(data => {
            toggleOverlay(false);
            if (data.status === 'success') {
                toastr.success('Vendor product deleted successfully!');
                const index = vendorProductData.findIndex(v => v.id === vendorId);
                if (index !== -1) {
                    vendorProductData.splice(index, 1);
                }

                const table = $('#allVendorProductsTable').DataTable();
                table.clear();
                table.rows.add(vendorProductData);
                table.draw();
            } else {
                toastr.error("Error: " + (data.message || "Something went wrong."));
            }
        })
        .catch(error => {
            toggleOverlay(false);
            toastr.error("Failed to load vendor data.");
            console.error(error);
        });
});
