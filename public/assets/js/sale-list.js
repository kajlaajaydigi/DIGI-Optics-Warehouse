var table;
$(document).ready(function () {

    table = $('#allSalesTable').DataTable({
        data: window.salesData, // Pass the 'result' data as the data source
        columns: [
            {
                data: 'created_at', title: 'data'
                ,
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            { data: 'id', title: 'Sales ID' },
            { data: 'payment_for', title: 'Payment For' },
            { data: 'sold_by', title: 'Sold By' },
            { data: 'payment_reason', title: 'Payment Reason' },
            { data: 'transaction_type', title: 'Transaction Type' },
            { data: 'quantity', title: 'Quantity' },
            { data: 'gst_type', title: 'GST Type' },
            { data: 'gst_mode', title: 'GST Mode' },
            { data: 'unit_price', title: 'Price' },
            { data: 'gst', title: 'GST Amount' },
            { data: 'total', title: 'Total' },
            {
                title: 'Action',
                render: function (data, type, row) {

                    if (DeleteSale) {
                        return `
                        <center>
                            <span id='deletesales' class='material-icons text-danger cursor-pointer ms-2' title='Delete Sales'>delete</span>
                        </center>
                    `;
                    } else {
                        return ''; // hide button
                    }
                }
            }
        ],
        order: [[0, 'desc']],
    });


    // Attach event listener to table rows
    $('#allSalesTable tbody').on('click', 'span', function () {
        const table = $('#allSalesTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let sId = data['id'];


        if (spanId === "deletesales") {
            deleteSalesDetail(sId);
        }
    });



    // $('#fromDate, #toDate').on('change', loadSales);
    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") loadSales();
    });

});


function loadSales() {
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let keyword = $('#keyword').val();

    $.ajax({
        url: "/sales/list",
        type: "GET",
        data: { from_date: fromDate, to_date: toDate, keyword },
        success: function (response) {
            if (response.status === 'success') {
                table.clear().rows.add(response.data).draw();
            }
        },
        error: function () {
            toastr.error("Failed to fetch data.");
        }
    });
}

function refresh() {
    location.reload();
}

// Delete jobcard
function deleteSalesDetail(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete Sales data: ${id}`,
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
                url: `/sales/delete-sales/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Sales ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=Saleslist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Sales. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}
