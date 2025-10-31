var allCategories;
let offset = 10;     // adjust to number already loaded
const limit = 20;
let table;
// const loadBtn = document.getElementById('loadMoreBtn');

let irregular, regular;


$.ajaxSetup({
    headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
    }
});

// Initialize DataTable
$(document).ready(function () {
    const initialRows = mapProductsToRows(initialData);

    if (!$.fn.DataTable.isDataTable('#inventorylist')) {
        table = $('#inventorylist').DataTable({
            data: initialRows,
            columns: [
                { title: "Action" },
                {
                    title: "Date",
                    render: function (data) {
                        const d = new Date(data);
                        return d.toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        });
                    }
                },
                { title: "Product Code" },
                { title: "Name" },
                { title: "Category" },
                { title: "Brand" },
                { title: "Color" },
                { title: "Size" },
                { title: "Type" },
                { title: "Shape" },
                { title: "Quantity" },
                { title: "Coating" },
                { title: "Expiry" },
                { title: "MRP" },
                { title: "GST Type" },
                { title: "HSN/SAC" },
                { title: "Product Image" },
                { title: "Remark" },
                { title: "Delete" }
            ],
            columnDefs: [
                {
                    targets: 0,
                    defaultContent: `<center>
                            <span class='material-icons text-primary cursor-pointer' id='editProduct' title='Edit Product' data-bs-toggle='modal' data-bs-target='#editProductModal'>edit</span>
                            <span id='addprod' class='material-icons text-success cursor-pointer me-2' title='Update Stock' data-bs-toggle='modal' data-bs-target='#updateInventoryModal' onclick='nonValidation();'>add_shopping_cart</span>
                            <span id='barcodeprint' class='material-symbols-outlined text-warning cursor-pointer me-2' title='Barcode Print' data-bs-toggle='modal' data-bs-target='#barcodePrintModal' >barcode</span>
                            <span id='inventoryhistoryspan' class='material-icons text-primary cursor-pointer' title='Inventory History' data-bs-toggle='modal' data-bs-target='#showInventoryModal'>info</span>
                    </center>`
                },
                {
                    targets: 12,
                    createdCell: function (td) {
                        $(td).css({ color: '#000000', fontWeight: '800' });
                    }
                },
                {
                    targets: 16, // Frame Image column
                    render: function (data, type, row, meta) {
                        // if (data == '') return '';
                        if (!data || data.trim() === 'No image data') return 'NA';
                        return `<a href="/storage/${data}" target="_blank">
                        Image
                            </a>`;
                    },
                },
                // ✅ agar delete permission hai tabhi delete ka button add karo
                ...(canDelete ? [{
                    targets: -1, // last column
                    defaultContent: "<center><span id='deleteproduct' class='material-icons text-danger cursor-pointer' title='Delete Product' style='margin-left:5px;'>delete</span></center>"
                }] : [])
            ],
            scrollX: true,
            pageLength: 10,
            bPaginate: true,
            language: {
                emptyTable: 'No data available'
            }
        });

    }

    // Attach event listener to table rows
    $('#inventorylist tbody').on('click', 'span', function () {
        const table = $('#inventorylist').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data[2];
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
        } else if (spanId === "editProduct") {
            updateproduct(data);
        } else if (spanId === "barcodeprint") {
            const productCode = data[2];   // Product Code


            $('.pro_id').val(productCode);
        } else if (spanId === "inventoryhistoryspan") {
            const productCode = data[2]; // "Product Code" ka column index (2nd column)
            inventoryhistoryfun(productCode);
        } else if (spanId === "deleteproduct") {
            const productCode = data[2]; // "Product Code" ka column index (2nd column)
            deleteproductdetails(productCode);
        }
    });



    let start = 0; // start from 0
    const length = 1000;


    // load 1000 data ata a time.
    $('#loadMoreBtn').on('click', async function () {


        $("div.overlay").addClass("show");

        try {
            const response = await fetch(`/Inventory/list?start=${start}&length=${length}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const newRows = mapProductsToRows(data.result);

            // Clear existing data and add new data
            // table.clear().rows.add(newRows).draw();
            table.rows.add(newRows).draw();

            // Increment start for next batch
            start += length;

            // Optional: hide button if all data is loaded
            if (start >= data.recordsTotal) {
                // $('#loadMoreBtn').hide(); // or disable
                $('#loadMoreBtn').prop('disabled', true);
                toastr.info("All Product loaded.");
            }

        } catch (error) {
            console.error("Fetch failed:", error);
            toastr.error("Failed to load more Product.");
        } finally {
            $("div.overlay").removeClass("show");
        }
    });


    let ProductrowIndex = 0;

    // Add new row
    $("#addProductRow").on("click", function () {
        let newRow = `
    <hr class="my-3">
    <div class="row g-2 align-items-end productRow mb-3">
        <div class="col-md-2 col-6 position-relative">
            <label class="form-label">Product Code</label>
            <input type="text" name="products[${ProductrowIndex}][product_code]"
                class="form-control product-code-input" placeholder="Type product code...">

            <!-- Suggestion box -->
            <div class="suggestions list-group shadow-sm"></div>
        </div>
        <div class="col-md-2 col-6">
            <label class="form-label">Template 1 Qty</label>
            <input type="number" name="products[${ProductrowIndex}][template1_qty]" class="form-control" min="0" placeholder="0">
        </div>
        <div class="col-md-2 col-6">
            <label class="form-label">Template 2 Qty</label>
            <input type="number" name="products[${ProductrowIndex}][template2_qty]" class="form-control" min="0" placeholder="0">
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-sm removeRow">
                <span class="material-icons">delete</span>
            </button>
        </div>
    </div>
    `;

        $("#productRows").append(newRow);
        ProductrowIndex++;
        reindexProductRows();
    });

    // Remove row
    $(document).on("click", ".removeRow", function () {
        $(this).closest(".productRow").remove();
        reindexProductRows();
    });


    // Remove row + its <hr>
    $(document).on("click", ".removeRow", function () {
        let row = $(this).closest(".productRow");
        let hr = row.prev("hr"); // if hr exists before row
        hr.remove();
        row.remove();
    });


    // 🔹 Autocomplete for product code input
    $(document).on("keyup", ".product-code-input", function () {
        let $input = $(this);
        let term = $input.val().trim();

        // Remove existing suggestions
        $(".suggestions").remove();

        if (term.length < 2) return;

        $.ajax({
            url: "/products/search",
            method: "GET",
            data: { term: term },
            success: function (data) {
                if (data.length === 0) return;

                // Create suggestions div
                let $suggestions = $('<div class="suggestions list-group shadow-sm"></div>');

                data.forEach(function (item) {
                    // Store input reference using data attribute
                    $suggestions.append(
                        `<div class="list-group-item list-group-item-action suggestion-item" data-input-index="${$input.index()}">${item}</div>`
                    );
                });

                $("body").append($suggestions);

                let offset = $input.offset();
                $suggestions.css({
                    top: offset.top + $input.outerHeight(),
                    left: offset.left,
                    width: $input.outerWidth(),
                    display: "block",
                    position: "absolute",
                    zIndex: 1050
                });

                // Store the input element on the suggestions for click reference
                $suggestions.data("relatedInput", $input);
            },
            error: function (xhr) {
                console.error("Search error:", xhr.responseText);
            }
        });
    });

    // On clicking a suggestion
    $(document).on("click", ".suggestion-item", function (e) {
        e.preventDefault();

        let $item = $(this);
        // Find the input related to this suggestion
        let $input = $item.closest(".suggestions").data("relatedInput");

        // Set value
        $input.val($item.text());

        // Remove suggestions
        $(".suggestions").remove();

        // Optionally, load barcode preview
        $.ajax({
            url: "/barcode/preview",
            method: "POST",
            data: {
                product_code: $item.text(),
                _token: $('meta[name="csrf-token"]').attr("content")
            },
            success: function (res) {
                if (res.success) {
                    $("#barcodePreview").html(res.html);
                } else {
                    $("#barcodePreview").html("<p class='text-danger'>Product not found</p>");
                }
            },
            error: function (xhr) {
                console.error("Barcode preview error:", xhr.responseText);
            }
        });
    });

    // 🔹 Hide suggestions when clicking outside
    $(document).on("click", function (e) {
        if (!$(e.target).closest(".product-code-input, .suggestion-item").length) {
            $(".suggestions").remove();
        }
    });


    document.getElementById('barcodeForm').addEventListener('submit', function () {
        setTimeout(() => {
            this.reset();

            document.querySelectorAll('.productRow:not(:first-child)').forEach(row => row.remove());
        }, 500);
    });
});

// Function to map products
function mapProductsToRows(products) {
    return products.map(product => ([
        null,
        product.created_at,
        product.product_code,
        product.name,
        product.category ?? '',
        product.brand ?? '',
        product.color ?? '',
        product.size ?? '',
        product.type ?? '',
        product.shape ?? '',
        product.quantity,
        product.coatin ?? '',
        product.expiry ?? '',
        product.mrp,
        product.gst_type ?? '',
        product['hsn/sac'] ?? '',
        product.product_image ?? '',
        product.remark ?? '',
        null,
    ]));
}

// DataTable initialization
$(document).ready(function () {


    // let start = 0; // start from 0
    // const length = 1000;

    //---------------------------------  from date to To date filter ---------------------------------
    // $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    //     var fromDate = $('#fromDate').val();
    //     var toDate = $('#toDate').val();
    //     var createdAt = data[1]; // Assuming 'Created At' is at index 1

    //     if (!createdAt) return false;

    //     // Convert 'DD/MM/YYYY HH:MM AM/PM' to Date object
    //     function parseCustomDate(str) {
    //         const [datePart, timePart] = str.split(' ');
    //         const [day, month, year] = datePart.split('/').map(Number);
    //         let [hour, minute] = time Part.split(':');
    //         const ampm = timePart.split(' ')[1];

    //         hour = parseInt(hour);
    //         minute = parseInt(minute);

    //         if (ampm && ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
    //         if (ampm && ampm.toLowerCase() === 'am' && hour === 12) hour = 0;

    //         return new Date(year, month - 1, day, hour, minute);
    //     }

    //     var createdDate = parseCustomDate(createdAt);
    //     var from = fromDate ? new Date(fromDate) : null;
    //     var to = toDate ? new Date(toDate) : null;

    //     if ((from === null || createdDate >= from) &&
    //         (to === null || createdDate <= to)) {
    //         return true;
    //     }

    //     return false;
    // });


    // // Trigger draw on date change
    // $('#fromDate, #toDate').on('change', function () {
    //     $('#allPrescriptionsTable').DataTable().draw();
    // });


    irregular = $('#irregularlist').DataTable({
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
                            <span id='deletecustomer' class='material-icons text-danger cursor-pointer ms-2' title='Delete Customer'>delete</span>
                        </center>
                    `;
                }
            },
            { data: 'purchase_date', title: 'Purchase Date' },
            { data: 'job_card_id', title: 'Job Card ID' },
            { data: 'name', title: 'Name' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'email', title: 'Email' },
        ],
        destroy: true,
        responsive: true,
        language: {
            emptyTable: 'No data available'
        }
    });



    regular = $('#regularlist').DataTable({
        // data: customerData, // Pass the 'result' data as the data source
        columns: [
            // {
            //     title: 'Action', // Add Action column title
            //     render: function (data, type, row) {
            //         // Action buttons with Google Material Icons
            //         return `
            //             <center>
            //                 <span class='material-icons text-primary cursor-pointer' id='editcustomer' title='Edit Customer' data-bs-toggle='modal' data-bs-target='#editCustomer'>edit</span>
            //                 <span class='material-icons text-secondary cursor-pointer ms-2' id='viewcustomer' title='View Cutomer' data-bs-toggle='modal' data-bs-target='#viewCustomer'>info</span>
            //                 <span class='material-icons text-info cursor-pointer ms-2' id='viewprescriptions' title='View Prescriptions' data-bs-toggle='modal' data-bs-target='#viewPrescriptions'>assignment</span>
            //                 <span class='material-icons text-success cursor-pointer ms-2' id='viewjc' title='View Job Cards' data-bs-toggle='modal' data-bs-target='#viewJCs'>shopping_cart</span>
            //                 <span id='deletecustomer' class='material-icons text-danger cursor-pointer ms-2' title='Delete Customer'>delete</span>
            //             </center>
            //         `;
            //     }
            // },
            { data: 'purchase_date', title: 'Purchase Date' },
            { data: 'job_card_id', title: 'Job Card ID' },
            { data: 'name', title: 'Name' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'email', title: 'Email' },
        ],
        destroy: true,
        responsive: true,
        language: {
            emptyTable: 'No data available'
        }
    });

});

// refresh page
function confirmAndRefreshPage() {
    location.reload();
}

// Show Customer Purchase Tables
function showCustomerPurchaseTables() {
    document.getElementById("irregularcustomer").classList.remove("hide");
    document.getElementById("regularcustomer").classList.remove("hide");
}

// Add Product Row
function addProductRow() {
    const container = document.getElementById('productRowsContainer');
    const existingRows = container.querySelectorAll('.dynamic-product-row').length;
    const rowIndex = existingRows + 1;

    // Generate options directly from categories array
    const categoryOptions = ['<option value="">Select Category</option>']
        .concat(categories.map(option => `<option value="${option}">${option}</option>`))
        .join('');

    const html = `
    <div class="row border-top pt-3 mt-3 align-items-end dynamic-product-row" id="productRow${rowIndex}">
      <div class="col-md-1">
        <label for="date${rowIndex}" class="form-label d-block">Date <span class="required">*</span></label>
        <input type="date" class="form-control" id="date${rowIndex}" style="margin-bottom: 20px;" required>
      </div>
      <div class="col-md-1">
        <label for="productcode${rowIndex}" class="form-label d-block">Product Code <span class="required">*</span></label>
        <input type="text" class="form-control" id="productcode${rowIndex}" style="margin-bottom: 20px;" required>
      </div>
      <div class="col-md-1">
        <label for="name${rowIndex}" class="form-label d-block">Name <span class="required">*</span></label>
        <input type="text" class="form-control" id="name${rowIndex}" style="margin-bottom: 20px;" required>
      </div>
      <div class="col-md-1">
        <label for="category${rowIndex}" class="form-label d-block">Category <span class="required">*</span></label>
        <select id="category${rowIndex}" class="form-select" style="margin-bottom: 20px;" required>${categoryOptions}</select>
      </div>
      <div class="col-md-1">
        <label for="brand${rowIndex}" class="form-label d-block">Brand <span class="required">*</span></label>
        <input type="text" class="form-control" id="brand${rowIndex}" style="margin-bottom: 20px;" required>
      </div>
      <div class="col-md-1">
        <label for="color${rowIndex}" class="form-label d-block">Color</label>
        <input type="text" class="form-control" id="color${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="size${rowIndex}" class="form-label d-block">Size</label>
        <input type="text" class="form-control" id="size${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="type${rowIndex}" class="form-label d-block">Type</label>
        <input type="text" class="form-control" id="type${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="shape${rowIndex}" class="form-label">Shape</label>
        <input type="text" class="form-control" id="shape${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="coating${rowIndex}" class="form-label d-block">Coating</label>
        <input type="text" class="form-control" id="coating${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-2">
        <label class="form-label d-block">Product Image</label>
        <input class="form-control" id="frameimage${rowIndex}" type="file" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="expiry${rowIndex}" class="form-label d-block">Expiry</label>
        <input type="date" class="form-control" id="expiry${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="qty${rowIndex}" class="form-label d-block">Quantity</label>
        <input type="number" class="form-control" id="qty${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="mrp${rowIndex}" class="form-label d-block">MRP</label>
        <input type="number" class="form-control" id="mrp${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="hsn_code${rowIndex}" class="form-label d-block">HSN/SAC</label>
        <input type="text" class="form-control" id="hsn_code${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <label for="gst_type${rowIndex}" class="form-label d-block">GST Type</label>
        <select id="gst_type${rowIndex}" class="form-select" style="margin-bottom: 20px;">
          <option value="Included">Included</option>
          <option value="Excluded">Excluded</option>
        </select>
      </div>
      <div class="col-md-2">
        <label for="remark${rowIndex}" class="form-label d-block">Remark</label>
        <input type="text" class="form-control" id="remark${rowIndex}" style="margin-bottom: 20px;">
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteProductRow(this)" style="margin-bottom: 21px;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;

    container.insertAdjacentHTML('beforeend', html);
}

// Function to delete a product row
function deleteProductRow(button) {
    const row = button.closest('.dynamic-product-row');
    if (row) {
        row.remove();
        reindexProductRows();
    }
}

function reindexProductRows() {
    const rows = document.querySelectorAll('.dynamic-product-row');
    rows.forEach((row, index) => {
        const newIndex = index + 1;

        row.id = `productRow${newIndex}`;

        row.querySelectorAll('[id]').forEach(el => {
            const oldId = el.id;
            const baseId = oldId.replace(/\d+$/, ''); // remove last number
            el.id = `${baseId}${newIndex}`;
        });

        row.querySelectorAll('[for]').forEach(label => {
            const oldFor = label.getAttribute('for');
            const baseFor = oldFor.replace(/\d+$/, '');
            label.setAttribute('for', `${baseFor}${newIndex}`);
        });
    });
}


// Clear added product rows on modal close
document.getElementById('addProductModal').addEventListener('hidden.bs.modal', function () {
    const container = document.getElementById('productRowsContainer');

    // Remove all dynamic rows except the first one
    const dynamicRows = container.querySelectorAll('.dynamic-product-row[id^="productRow"]:not(#productRow1)');
    dynamicRows.forEach(row => row.remove());

    // Clear inputs inside the first row only
    const firstRowInputs = document.querySelectorAll('#productRow1 input, #productRow1 select');
    firstRowInputs.forEach(input => {
        if (input.type === 'file') {
            input.value = ''; // Clear file input
        } else {
            input.value = '';
        }
    });
});


// Function to validate and calculate row on stock entry
function validateAndCalculateRow(selectElement) {
    if (!selectElement || !selectElement.id) return;

    const rowIndex = selectElement.id.match(/\d+$/)?.[0]; // Extract number from ID like "tax3"
    if (!rowIndex) return;

    const qtyInput = document.getElementById(`iqty${rowIndex}`);
    const ppuInput = document.getElementById(`ippu${rowIndex}`);
    const totalField = document.getElementById(`itotal${rowIndex}`);

    const qty = parseFloat(qtyInput?.value);
    const ppu = parseFloat(ppuInput?.value);
    const tax = parseFloat(selectElement.value);

    if (!qty || !ppu || !totalField) {
        if (totalField) totalField.value = '';
        return;
    }

    const subtotal = qty * ppu;
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount;

    totalField.value = total.toFixed(2);
}

// Add Product JS
// document.addEventListener("DOMContentLoaded", function () {
const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", validation);

async function validation() {
    const productRows = document.querySelectorAll(".dynamic-product-row");
    const formData = new FormData();
    let isFormValid = true;

    // Define fields only once
    const fieldConfig = [
        { name: 'date', required: true, type: 'date' },
        { name: 'productcode', required: false },
        { name: 'name', required: true },
        { name: 'category', required: true },
        { name: 'brand', required: true },
        { name: 'color' },
        { name: 'size' },
        { name: 'type' },
        { name: 'shape' },
        { name: 'coating' },
        { name: 'frameimage', type: 'file' },
        { name: 'expiry', type: 'date' },
        { name: 'qty', type: 'number', required: true },
        { name: 'mrp', type: 'number' },
        { name: 'hsn_code' },
        { name: 'gst_type' },
        { name: 'remark' }
    ];



    productRows.forEach((row, index) => {
        const rowNum = index + 1;

        fieldConfig.forEach(field => {
            const input = row.querySelector(`#${field.name}${rowNum}`);
            if (!input) return;

            const value = input.value.trim();

            // Required check
            if (field.required && !value) {
                markInvalid(input);
                isFormValid = false;
                return;
            } else {
                markValid(input);
            }

            // Type-specific validation
            if (value) {
                switch (field.type) {
                    case 'number':
                        if (isNaN(value)) {
                            markInvalid(input);
                            isFormValid = false;
                        }
                        break;
                    case 'date':
                        if (isNaN(new Date(value).getTime())) {
                            markInvalid(input);
                            isFormValid = false;
                        }
                        break;
                    case 'file':
                        if (input.files.length > 0) {
                            const file = input.files[0];
                            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
                            const maxSize = 2 * 1024 * 1024; // 2MB
                            if (!allowedTypes.includes(file.type) || file.size > maxSize) {
                                markInvalid(input);
                                isFormValid = false;
                            }
                        }
                        break;
                }
            }

            // Append to FormData
            const key = `products[${index}][${field.name}]`;
            if (field.type === "file" && input.files.length > 0) {
                formData.append(key, input.files[0]);
            } else {
                formData.append(key, value);
            }
        });
    });

    if (!isFormValid) {
        Swal.fire({
            icon: 'error',
            title: 'Please fix the highlighted fields.',
            showConfirmButton: true
        });
        return;
    }

    //print formdata
    // Print all key-value pairs
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    // Submit via AJAX
    try {
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const response = await fetch("/Inventory/products/store", {
            method: "POST",
            headers: { 'X-CSRF-TOKEN': token },
            body: formData
        });

        console.log(response);
        // console.log("Form data submitted successfully.");

        const result = await response.json();

        if (response.ok) {
            // Hide modal
            let modalEl = document.getElementById("addProductModal");
            let modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            // Optionally reset the form
            document.getElementById("addProductForm").reset();

            Swal.fire({
                icon: 'success',
                title: 'Products saved successfully!',
                showConfirmButton: false,
                timer: 1500
            });
        } else if (response.status === 422) {
            // ❌ Validation errors
            let errorMessages = Object.values(result.errors)
                .map(errArr => errArr.join("<br>"))
                .join("<hr>");

            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                html: errorMessages,
                showConfirmButton: true
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed to save.',
                text: result.message || 'Something went wrong.',
                showConfirmButton: true
            });
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        Swal.fire({
            icon: 'error',
            title: error.message || 'Unexpected error during submission.',
            showConfirmButton: true
        });
    }
}

function markInvalid(input) {
    input.classList.add("is-invalid");
}
function markValid(input) {
    input.classList.remove("is-invalid");
}
// });

// update product function----------------------------------[]
function updateproduct(data) {
    productId = data[2];

    // console.log("Product ID to update:", productId);
    $("div.overlay").addClass("show");

    $.ajax({
        url: '/Inventory/get-product/' + productId,   // Controller route
        type: 'GET',
        success: function (response) {
            if (response.success) {
                let product = response.product;

                $("div.overlay").removeClass("show");

                $('#updatedate').val(product.created_at);
                $('#updateproductcode').val(product.product_code);
                $('#updatename').val(product.name);
                $('#updatecategory').val(product.category);
                $('#updatebrand').val(product.brand);
                $('#updatecolor').val(product.color);
                $('#updatesize').val(product.size);
                $('#updatetype').val(product.type);
                $('#updateshape').val(product.shape);
                $('#updatesph').val(product.sph);
                $('#updatecyl').val(product.cyl);
                $('#updateindex').val(product.index);
                $('#updateaxis').val(product.axis);
                $('#updatecoating').val(product.coatin);
                $('#updateexpiry').val(product.expiry);
                $('#imginput').val(product.product_image);
                $('#updateHsn').val(product.hsn_code);
                // Show modal
                $('#updateProductModal').modal('show');
            } else {
                alert("Product not found!");
                $("div.overlay").removeClass("show");
            }
        },
        error: function (xhr) {
            console.error(xhr.responseText);
            alert("Error fetching product details.");
        }
    });
}

function validateProductEdit() {
    let form = $('#updateProductForm')[0];
    let formData = new FormData(form);

    // Append CSRF token manually
    formData.append('_token', $('meta[name="csrf-token"]').attr('content'));

    $.ajax({
        url: '/Inventory/update',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function () {
            // Show loader
            $("div.overlay").addClass("show");
        },
        success: function (response) {
            // Hide loader
            $("div.overlay").removeClass("show");

            if (response.success) {
                $('#editProductModal').modal('hide');
                Swal.fire("Updated!", "Product updated successfully.", "success");

                $('#productTable').DataTable().ajax.reload(null, false);

                // Reload page after 4 sec
                setTimeout(function () {
                    location.reload();
                }, 4000);
            } else {
                Swal.fire("Failed!", response.message || "Update failed.", "error");
            }
        },
        error: function (xhr) {
            $("div.overlay").removeClass("show"); // loader hatao

            if (xhr.status === 422) {
                // Validation errors
                let errors = xhr.responseJSON.errors;
                let errorMessages = "";
                $.each(errors, function (key, value) {
                    errorMessages += value[0] + "<br>";
                });

                Swal.fire({
                    icon: "error",
                    title: "Validation Failed!",
                    html: errorMessages
                });
            } else {
                // Other errors (500, 404, etc.)
                let msg = xhr.responseJSON?.message || "Something went wrong!";
                Swal.fire("Error!", msg, "error");
            }
        }
    });
}


//add inventory stock

let rowIndex = 1;

function addStockRow() {
    let newRow = `
        <div class="row stockRow mb-2 border rounded p-2">

            <div class="col-md">
                <label class="form-label d-block">Date<span class="required">*</span></label>
                <input type="date" class="form-control" name="stock[${rowIndex}][date]" required>
            </div>

            <div class="col-md">
                <label class="form-label d-block text-nowrap">Product Code<span class="required">*</span></label>
                <input type="text" class="form-control autocomplete-code" name="stock[${rowIndex}][product_code]" required>
                <div class="suggestion-box"></div>
            </div>

            <div class="col-md position-relative">
                <label class="form-label d-block">Name<span class="required">*</span></label>
                <input type="text" class="form-control autocomplete-name" name="stock[${rowIndex}][model_name]" required>
                <div class="suggestion-box"></div>
            </div>

            <div class="col-md">
                <label class="form-label d-block">Category<span class="required">*</span></label>
                <input type="text" class="form-control" name="stock[${rowIndex}][category]" required>
            </div>

            <div class="col-md">
                <label class="form-label d-block">Brand<span class="required">*</span></label>
                <input type="text" class="form-control" name="stock[${rowIndex}][brand]" required>
            </div>

            <div class="col-md">
                <label class="form-label d-block">Quantity<span class="required">*</span></label>
                <input type="number" class="form-control" name="stock[${rowIndex}][quantity]" required>
            </div>

            <div class="col-md">
                <label class="form-label d-block">Expiry</label>
                <input type="date" class="form-control" name="stock[${rowIndex}][expiry]">
            </div>

            <div class="col-md">
                <label class="form-label d-block text-nowrap">Price Per Unit<span class="required">*</span></label>
                <input type="number" class="form-control" name="stock[${rowIndex}][price_per_unit]" required>
            </div>

            <div class="col-md">
                <label class="form-label d-block">Tax %<span class="required">*</span></label>
                <select class="form-select" name="stock[${rowIndex}][tax]" onchange="validateAndCalculateRow(this)" required>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                </select>
            </div>

            <div class="col-md">
                <label class="form-label d-block">Total Price<span class="required">*</span></label>
                <input type="number" class="form-control" name="stock[${rowIndex}][total_price]">
            </div>

            <div class="col-md">
                <label class="form-label d-block">MRP<span class="required">*</span></label>
                <input type="number" class="form-control" name="stock[${rowIndex}][mrp]">
            </div>

            <div class="col-md position-relative">
                <input type="text" class="form-control d-none vendor_id" name="stock[${rowIndex}][vendor_id]">
                <label class="form-label d-block">Vendor Name</label>
                <input type="text" class="form-control autocomplete-vendor vendor_name" name="stock[${rowIndex}][vendor_name]">
                <div class="suggestion-box"></div>
            </div>

            <div class="col-md">
                <label class="form-label d-block">Vendor Gst</label>
                <input type="number" class="form-control vendor_gst" name="stock[${rowIndex}][vendor_gst]">
            </div>

            <div class="col-md-auto d-flex align-items-end">
                <span class="material-icons text-danger cursor-pointer removeRow" title="Delete">delete</span>
            </div>
        </div>
    `;

    $("#stockRowsContainer").append(newRow);
    rowIndex++;
}


// Row remove
$(document).on("click", ".removeRow", function () {
    $(this).closest(".stockRow").remove();
});


// auto suggestion for inventory product code


$(document).on('keyup', '.autocomplete-code, .autocomplete-name', function () {
    const input = $(this);
    const query = input.val();
    const card = input.closest('.stockRow');
    const suggestionBox = input.siblings('.suggestion-box');


    const type = input.hasClass('autocomplete-code') ? 'product_code' : 'model_name';

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
                suggestionBox.html(suggestions)
                    .addClass('dropdown-menu')
                    .css('position', 'absolute')
                    .show();
            }
        });
    } else {
        suggestionBox.hide();
    }
});


$(document).on('click', '.suggestion-item', function () {
    const id = $(this).data('id');
    const card = $(this).closest('.stockRow');
    const box = $(this).parent();

    $.ajax({
        url: '/get-product-details-by-id',
        type: 'GET',
        data: { id },
        success: function (res) {
            if (res.success) {
                const p = res.product;
                box.hide();


                card.find('input[name*="[product_code]"]').val(p.product_code);
                card.find('input[name*="[model_name]"]').val(p.model_name);
                card.find('input[name*="[category]"]').val(p.booking_type);
                card.find('input[name*="[brand]"]').val(p.brand ?? '');
            }
        }
    });

    $(this).parent().hide();
});

// Hide suggestion box if clicked outside
$(document).on('click', function (e) {
    if (!$(e.target).closest('.autocomplete-code, .autocomplete-name').length) {
        $('.suggestion-box').hide();
    }
});



//vendor autosuggetion for inventory
$(document).on('keyup', '.autocomplete-vendor', function () {
    const input = $(this);
    const query = input.val();
    const row = input.closest('.stockRow');
    const suggestionBox = input.siblings('.suggestion-box');

    if (query.length >= 2) {
        $.ajax({
            url: '/Inventory/vendor-suggestions', // create this route
            type: 'GET',
            data: { query },
            success: function (res) {
                let suggestions = '';
                console.log(res.vendors);
                res.vendors.forEach(vendor => {
                    suggestions += `<button type="button" class="dropdown-item vendor-item"
                                        data-id="${vendor.vendor_id}"
                                        data-gst="${vendor.gst_number}">
                                        ${vendor.name}
                                    </button>`;
                });
                suggestionBox.html(suggestions)
                    .addClass('dropdown-menu')
                    .css('position', 'absolute')
                    .show();
            }
        });
    } else {
        suggestionBox.hide();
    }
});


$(document).on('click', '.vendor-item', function () {
    const suggestionBox = $(this).closest('.suggestion-box');
    const row = suggestionBox.closest('.stockRow');

    const id = $(this).data('id');
    const gst = $(this).data('gst');
    const name = $.trim($(this).text());

    // Fill inputs
    row.find('.vendor_name').val(name);
    row.find('.vendor_gst').val(gst);
    row.find('.vendor_id').val(id);

    suggestionBox.hide(); // hide suggestions
});


$(document).on('click', function (e) {
    if (!$(e.target).closest('.autocomplete-vendor').length) {
        $('.autocomplete-vendor').siblings('.suggestion-box').hide();
    }
});


//calculation
function validateAndCalculateRow(selectElement) {
    const row = $(selectElement).closest('.stockRow');

    const quantity = parseFloat(row.find('input[name*="[quantity]"]').val()) || 0;
    const pricePerUnit = parseFloat(row.find('input[name*="[price_per_unit]"]').val()) || 0;
    const taxPercent = parseFloat($(selectElement).val()) || 0;

    // Base amount
    const baseAmount = quantity * pricePerUnit;

    // GST calculation
    const gstAmount = (baseAmount * taxPercent) / 100;

    // Final total price
    const totalPrice = baseAmount + gstAmount;

    // Set values
    row.find('input[name*="[total_price]"]').val(totalPrice.toFixed(2));
}



// submit updateInventoryForm to add inventory
function validationEdit() {
    let isValid = true;
    let errorMsg = "";

    $("#updateInventoryForm .stockRow").each(function () {
        let date = $(this).find('input[name*="[date]"]').val();
        let productCode = $(this).find('input[name*="[product_code]"]').val();
        let name = $(this).find('input[name*="[model_name]"]').val();
        let category = $(this).find('input[name*="[category]"]').val();
        let brand = $(this).find('input[name*="[brand]"]').val();
        let qty = $(this).find('input[name*="[quantity]"]').val();
        let price = $(this).find('input[name*="[price_per_unit]"]').val();

        if (!date || !productCode || !name || !category || !brand || !qty || !price) {
            isValid = false;
            errorMsg = "All required fields (*) must be filled.";
            return false; // break loop
        }

        if (qty <= 0) {
            isValid = false;
            errorMsg = "Quantity must be greater than 0.";
            return false;
        }

        if (price <= 0) {
            isValid = false;
            errorMsg = "Price must be greater than 0.";
            return false;
        }
    });

    if (!isValid) {
        Swal.fire({
            icon: "warning",
            title: "Validation Error",
            text: errorMsg
        });
        return;
    }

    // ✅ Show loading overlay
    $("div.overlay").addClass("show");

    // Submit form with AJAX
    let form = $("#updateInventoryForm");
    let formData = form.serialize();

    $.ajax({
        url: "/Inventory/inventory-data-store",
        type: "POST",
        data: formData,
        headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") },
        success: function (res) {
            $("div.overlay").removeClass("show"); // hide overlay
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: res.message,
                timer: 2000,
                showConfirmButton: false
            });
            $("#updateInventoryModal").modal("hide");
            form[0].reset();

            setTimeout(function () {
                location.reload();
            }, 4000);
        },
        error: function (xhr) {
            $("div.overlay").removeClass("show"); // hide overlay

            if (xhr.status === 422) {
                // Laravel validation error
                let errors = xhr.responseJSON.message;
                let errorHtml = "<ul>";
                $.each(errors, function (key, messages) {
                    $.each(messages, function (i, msg) {
                        errorHtml += "<li>" + msg + "</li>";
                    });
                });
                errorHtml += "</ul>";

                Swal.fire({
                    icon: "warning",
                    title: "Validation Error",
                    html: errorHtml
                });
            } else {
                // Other errors
                let errMsg = "Something went wrong!";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errMsg = xhr.responseJSON.message;
                }
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: errMsg
                });
            }
        }
    });
}

let inventoryhistoryspantable;


$(document).ready(function () {
    inventoryhistoryspantable = $('#inventoryhistory').DataTable({
        columns: [
            { title: "Date", data: "date" },
            { title: "Product Code", data: "product_code" },
            { title: "Quantity", data: "quantity" },
            { title: "Expiry", data: "expiry" },
            { title: "Price Per Unit", data: "price_per_unit" },
            { title: "Tax (%)", data: "tax" },
            { title: "Total Price", data: "total_price" },
            { title: "MRP", data: "mrp" },
            { title: "Vendor", data: "vendor_name" },
        ],
        destroy: true,
        responsive: true
    });
});


// Function to show inventory history
function inventoryhistoryfun(productCode) {
    toggleOverlay(true);

    inventoryhistoryspantable.clear().draw();

    $.ajax({
        url: `/Inventory/inventory-history/${productCode}`,
        method: 'GET',
        success: function (res) {
            toggleOverlay(false);

            let InventoryData = res.data || [];

            // 🔑 Pehle clear karo
            inventoryhistoryspantable.clear();

            if (InventoryData.length > 0) {
                inventoryhistoryspantable.rows.add(InventoryData).draw();
            } else {
                // agar data nahi mila to sirf empty draw karo
                inventoryhistoryspantable.draw();
            }

            setTimeout(function () {
                location.reload();
            }, 4000);
        },
        error: function () {
            toggleOverlay(false);
            inventoryhistoryspantable.clear().draw(); // ❌ error me bhi purana data hatao
        }
    });
}



function deleteproductdetails(productCode) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete Product data: ${productCode}`,
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
                url: `/Inventory/delete/${productCode}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Product ID ${productCode} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=croductlist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Product. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}


// Find Customers Based on What They Buy

// function fetchProduct() {
//     toggleOverlay(true);

//     let bookingType = $("#frame").val();

//     if (!bookingType) {
//         toggleOverlay(true);
//         return;
//     }

//     $.ajax({
//         url: "/Inventory/get-models-by-category",
//         type: "GET",
//         data: { category: bookingType },
//         success: function (res) {
//             toggleOverlay(false);
//             let $modelSelect = $("#modelSuggestion");
//             $modelSelect.empty().append('<option value="">Select Model</option>');

//             if (res.models && res.models.length > 0) {
//                 res.models.forEach(model => {
//                     $modelSelect.append(`<option value="${model}">${model}</option>`);
//                 });
//             }
//         },
//         error: function () {
//             toggleOverlay(false);
//             Swal.fire("Error", "Unable to fetch models!", "error");
//         }
//     });
// }


// to fetch customer regural and irregular

function showCustomerPurchaseTables() {
    let bookingType = $("#frame").val();
    let m_name = $("#modal_name").val();

    // if (!model || !bookingType) {
    //     Swal.fire("Warning", "Please select booking type and model!", "warning");
    //     return;
    // }

    $.ajax({
        url: "/Inventory/get-customers-by-model",
        type: "POST",
        data: {
            _token: $('meta[name="csrf-token"]').attr("content"),
            modal: m_name,
            category: bookingType
        },
        success: function (res) {
            // Show sections
            $("#irregularcustomer").removeClass("hide");
            $("#regularcustomer").removeClass("hide");

            let recustomer = res.regulardata;
            let irreCustomer = res.irregulardata;

            regular.clear().rows.add(recustomer).draw();
            irregular.clear().rows.add(irreCustomer).draw();

        },
        error: function () {
            Swal.fire("Error", "Unable to fetch customer data!", "error");
        }
    });

}


function filterModels() {
    $("#modal_name").trigger("keyup"); // reuse existing keyup logic
}

$(document).ready(function () {

    // Autocomplete for model_name
    $(document).on('keyup', '#modal_name', function () {
        const input = $(this);
        const query = input.val();
        const suggestionBox = input.siblings('.suggestion-box');

        const bookingType = $('#frame').val();

        if (query.length >= 2) {
            $.ajax({
                url: '/product-suggestions',
                type: 'GET',
                data: {
                    query,
                    type: 'model_name',
                    booking_type: bookingType
                }, // ✅ only model name
                success: function (res) {
                    let suggestions = '';
                    res.products.forEach(product => {
                        suggestions += `
                            <button type="button" class="dropdown-item suggestion-item" data-name="${product.name}">
                                ${product.name}
                            </button>`;
                    });
                    const parentOffset = input.position();
                    suggestionBox.html(suggestions)
                        .addClass('dropdown-menu')
                        .css({
                            position: 'absolute',
                            top: parentOffset.top + input.outerHeight(), // directly below input
                            left: parentOffset.left,                     // align with input start
                            width: input.outerWidth() + 'px',
                            zIndex: 9999
                        })
                        .show();
                }
            });
        } else {
            suggestionBox.hide();
        }

        // Hide if clicked outside
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.autocomplete-model, .suggestion-box').length) {
                suggestionBox.hide();
            }
        });
    });

    // On suggestion click → fill only model_name
    $(document).on('click', '.suggestion-item', function () {
        const modelName = $(this).data('name');
        const input = $(this).closest('.d-flex').find('#modal_name');
        const box = $(this).parent();

        input.val(modelName);  // ✅ only model_name filled
        box.hide();
    });
});


$(document).ready(function () {
    // 🔹 Date change hote hi filter apply ho
    // $('#keywordfromdate, #keywordtodate').on('change', loadProductsByKeyword);

    // 🔹 Keyword live search (debounce 0.5s)
    // let typingTimer;
    // $('#keyword').on('keyup', function () {
    //     clearTimeout(typingTimer);
    //     typingTimer = setTimeout(function () {
    //         loadProductsByKeyword();
    //     }, 500);
    // });

    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") loadProductsByKeyword();
    });

});

// ------------------ Date Filter via AJAX ------------------

function loadProductsByKeyword() {
    let fromDate = $('#keywordfromdate').val();
    let toDate = $('#keywordtodate').val();
    let keyword = $('#keyword').val();

    $.ajax({
        url: `/Inventory/list`,
        method: "GET",
        data: { fromDate, toDate, keyword },
        success: function (response) {
            const newRows = mapProductsToRows(response.result); // <- response.result use karo
            table.clear().rows.add(newRows).draw();
        }
    });
}
