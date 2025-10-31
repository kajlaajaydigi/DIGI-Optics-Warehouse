var table;
$(document).ready(function () {

    table = $('#allExpenseTable').DataTable({
        data: expenseData,
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
            { data: 'id', title: 'Expense ID' },
            { data: 'payment_for', title: 'Payment For' },
            { data: 'payment_by', title: 'Payment By' },
            { data: 'payment_reason', title: 'Payment Reason' },
            { data: 'transaction_type', title: 'Transaction Type' },
            { data: 'amount', title: 'Amount' },
            {
                title: 'Action',
                render: function (data, type, row) {

                    if (DeleteExpense) {
                    return `
                        <center>
                            <span id='deleteexpense' class='material-icons text-danger cursor-pointer ms-2' title='Delete Expense'>delete</span>
                        </center>
                    `;
                    } else {
                        return ''; // hide button
                    }
                }
            }
        ],
        order: [[0, 'desc']]
    });

    // Attach event listener to table rows
    $('#allExpenseTable tbody').on('click', 'span', function () {
        const table = $('#allExpenseTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let eId = data['id'];


        if (spanId === "deleteexpense") {
            deleteExpenseDetail(eId);
        }
    });

    // $('#fromDate, #toDate').on('change', loadExpenses);
    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") loadExpenses();
    });

});


function loadExpenses() {
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let keyword = $('#keyword').val();

    $.ajax({
        url: "/expense/list",
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
function deleteExpenseDetail(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete Expense data: ${id}`,
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
                url: `/expense/delete-expense/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Expense ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=Expenselist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Expense. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}
