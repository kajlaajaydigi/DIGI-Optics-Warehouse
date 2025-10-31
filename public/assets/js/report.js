let Booking_Orders, Booking_Orders_Total, Delivered_Order, Delivered_Ordersm; //Main task table access

let Daily_Expense_List, Sold_Stock, Frames_Count, Daily_Sales_Payment_Methods, List_of_Transactions, Sales_Transactions, Today_Delivery_Count; //Daily report table access

let Total_Task_DataTable, Completed_Task_DataTable, Pending_Task_DataTable; //task report table access

$(document).ready(function () {
    // ===============================Main Task table =============================================

    // -----Booking order table using job card model ------
    Booking_Orders = $('#allBookOrderTable').DataTable({
        columns: [
            {
                data: 'created_at',
                title: 'Date of Booking',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            { data: 'job_card_no', title: 'Job card id' },
            { data: 'name', title: 'Cust. Name' },
            { data: 'mobile', title: 'Mobile' },
            { data: 'booked_by', title: 'Booked By' },
            {
                data: 'created_at', title: 'Delivery Date',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            { data: 'transaction_type', title: 'Transaction' },
            { data: 'grand_total', title: 'Total Price' },
            { data: 'advance', title: 'Advance' },
            { data: 'balance', title: 'Balance' },
            { data: 'status', title: 'JC Status' },
            { data: 'process_status', title: 'JC Process Status' },
        ],
        destroy: true,
        responsive: true
    });

    //------Booking order Total table using job card model data ------
    Booking_Orders_Total = $('#allBookOrderTotalTable').DataTable({
        columns: [
            { title: "Orders", data: "order" },
            { title: "Credit", data: "credit" },
            { title: "Cash", data: "cash" },
            { title: "UPI", data: "upi" },
            {
                title: "Credit Rs.",
                data: "creditRs",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2);
                }
            },
            {
                title: "Cash Rs.",
                data: "cashRs",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2);
                }
            },
            {
                title: "UPI Rs.",
                data: "upiRs",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2);
                }
            },
            {
                title: "Total Rs.",
                data: "totalRs",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2);
                }
            },
            {
                title: "Advance Rs.",
                data: "advance",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2);
                }
            },
            {
                title: "Balance Rs.",
                data: "balance",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2);
                }
            },
            {
                title: "Commission Rs.",
                data: "commissionRs",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2);
                }
            },
        ],
        destroy: true,
        responsive: true
    });


    // ------Delivered Ordertable using job card model data ------
    Delivered_Order = $('#allDeliveredOrderTable').DataTable({
        columns: [
            {
                title: "Date of Booking", data: "created_at",
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            { title: "Job Card ID", data: "job_card_no" },
            { title: "Cust. Name", data: "name" },
            { title: "Mobile", data: "mobile" },
            { title: "Booked By", data: "booked_by" },
            {
                title: "Delivered Date", data: "delivered_date"
            },
            { title: "Transaction", data: "transaction_type" },
            // { title: "Amt Received", data: "amount_received" },
            { title: "Total Price", data: "grand_total" },
            { title: "Advance", data: "advance" },
            { title: "Balance", data: "balance" },
            { title: "JC Status", data: "status" },
        ],
        destroy: true,
        responsive: true
    });


    //------Delivered Orders table using job card model data------
    Delivered_Orders = $('#allDeliveredOrdersTable').DataTable({
        columns: [
            { title: "Employee", data: "employee" },
            {
                title: "Total Commission",
                data: "total_commission",
                render: function (data, type, row) {
                    return parseFloat(data).toFixed(2); // Always show 2 decimals
                }
            },
            { title: "Total Orders", data: "total_orders" },
            { title: "Total Delivered Orders", data: "delivered_orders" },
            // {
            //     title: "Action",
            // }
        ],
        destroy: true,
        responsive: true
    });

    $('.parent_statusMain').hide();

    //   ------------------------- Main Report from to fetch data using job card model ----------------------------------
    $('#MainReportForm').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        $.ajax({
            url: `/report/show`,
            method: 'GET',
            data: $(this).serialize(),
            success: function (res) {
                toggleOverlay(false);

                let jc = res.jobcard;
                let order = res.orderdetails;
                let delivered = res.delivered;
                let employeeSummary = res.reportData;
                let Tb_receive = res.T_B_Received;
                let emp_commission = res.total_emp_commission;

                // console.log(employeeSummary);

                $('#Total_Delivered').text(delivered.length);
                $('#Total_Amount').text(parseFloat(order['totalRs']).toFixed(2));
                $('#Total_Balance_Received').text(Tb_receive);
                // $('#Total_Commission').text(order['commissionRs']);
                $('#Total_Commission').text(emp_commission);

                $('.parent_statusMain').show();

                // Update products table
                Booking_Orders.clear().rows.add(jc).draw();
                Booking_Orders_Total.clear().rows.add([order]).draw();  // controller pass single row but data use multiple data this reason order only data notshow on databel then use [order]
                Delivered_Order.clear().rows.add(delivered).draw();
                Delivered_Orders.clear().rows.add(employeeSummary).draw();

                $('#MainReportForm')[0].reset();
            },
            error: function (xhr) {
                toggleOverlay(false);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to fetch jobcard details. Please try again.",
                    icon: "error"
                });
            }
        });
    });

    // ===============================Daily Task tables =============================================

    //------ Daily Expense List datatable -------------
    Daily_Expense_List = $('#Daily_Expense_List').DataTable({
        columns: [
            {
                title: "Date", data: "created_at",
                render: function (data, type, row) {
                    if (!data) return '';
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                    const year = date.getFullYear();
                    return `<strong>${day}-${month}-${year}</strong>`;
                }
            },
            { title: "Name", data: "payment_reason" },
            { title: "Type", data: "payment_for" },
            { title: "Amount", data: "amount" },
        ],
        destroy: true,
        responsive: true,
        info: false,
    });

    //------ Sold Stock List datatable -------------
    Sold_Stock = $('#Sold_Stock').DataTable({
        columns: [
            { title: "Booking Type", data: "booking_type" },
            { title: "Model", data: "modal" },
        ],
        destroy: true,
        responsive: true,
        info: false,
    });

    //------ Frames Count List datatable -------------
    Frames_Count = $('#Frames_Count').DataTable({
        columns: [
            { title: "Booking Type", data: "booking_type" },
            { title: "Count", data: "count" },
        ],
        destroy: true,
        responsive: true,
        info: false,
    });


    //------ Daily Sales & Payment Methods -------------
    Daily_Sales_Payment_Methods = $('#Daily_Sales_Payment_Methods').DataTable({
        columns: [
            { title: "Total", data: "total_sum" },
            { title: "Credit", data: "credit_total" },
            { title: "Cash", data: "cash_total" },
            { title: "UPI", data: "upi_total" },
            { title: "Expense", data: "expense_total" },
            { title: "Cash in Hand", data: "cash_in_hand" },
        ],
        destroy: true,
        responsive: true,
        info: false,
    });

    //------ List of Transactions datatable ------------
    List_of_Transactions = $('#List_of_Transactions').DataTable({
        columns: [
            { title: "Transcation Type", data: "transaction_type" },
            { title: "Amount", data: "amount" },
        ],
        destroy: true,
        responsive: true,
        info: false,
    });

    //------ Sales Transactions datatable ------------
    Sales_Transactions = $('#Sales_Transactions').DataTable({
        columns: [
            {
                title: "Date", data: "created_at",
                render: function (data, type, row) {
                    if (!data) return '';
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                    const year = date.getFullYear();
                    return `<strong>${day}-${month}-${year}</strong>`;
                }
            },
            { title: "Item", data: "payment_for" },
            { title: "Name", data: "sold_by" },
            { title: "Type", data: "transaction_type" },
            { title: "Amount", data: "total" },
        ],
        destroy: true,
        responsive: true,
        info: false,

    });

    //------ Today Delivery Count -------------
    Today_Delivery_Count = $('#Today_Delivery_Count').DataTable({
        columns: [
            { title: "Count", data: "Today_count" },
            { title: "Amount", data: "Today_sum" },
        ],
        destroy: true,
        responsive: true,
        info: false,
    });


    $('.parent_statusDaily').hide();

    //   ------------------------- Daily Report from to fetch data using job card model ----------------------------------
    $('#DailyTaskReportForm').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        $.ajax({
            url: `/report/daily-task-show`,
            method: 'GET',
            data: $(this).serialize(),
            success: function (res) {
                toggleOverlay(false);

                let D_exp_List = res.Daily_exp_List;
                let Sold_Stock_List = res.Sold_Stock_List;
                let Frames_Count1 = res.Frames_Count;
                let sales_transaction = res.sales_transaction;
                let today_delivered_data1 = res.today_delivered_data;
                let sales_summary = res.sales_summary;

                let TransactionList = res.Expense_Transaction.list;
                let TransactionTotal = res.Expense_Transaction.total;

                List_of_Transactions.clear().rows.add(TransactionList).draw();

                // ✅ Append total row manually (yellow background row)
                $('#List_of_Transactions tbody').append(`
                    <tr style="background-color: #ffff99; font-weight: bold;">
                        <td>Total</td>
                        <td>₹${TransactionTotal}</td>
                    </tr>
                `);

                $('.parent_statusDaily').show();
                // Update products table
                Daily_Expense_List.clear().rows.add(D_exp_List).draw();
                Sold_Stock.clear().rows.add(Sold_Stock_List).draw();
                Frames_Count.clear().rows.add(Frames_Count1).draw();
                Sales_Transactions.clear().rows.add(sales_transaction).draw();
                Today_Delivery_Count.clear().rows.add([today_delivered_data1]).draw();
                Daily_Sales_Payment_Methods.clear().rows.add([sales_summary]).draw();


                $('#DailyTaskReportForm')[0].reset();
            },
            error: function (xhr) {
                toggleOverlay(false);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to fetch jobcard details. Please try again.",
                    icon: "error"
                });
            }
        });
    });

    // ===============================Total Task tables =============================================


    //------Total task table using dailyTask model data------
    Total_Task_DataTable = $('#TotalTaskTable').DataTable({
        columns: [
            { title: "Employee Name", data: "employee_name" },
            { title: "Total Tasks", data: "total_tasks" },
            { title: "Completed", data: "completed" },
            { title: "Pending", data: "pending" },
            { title: "Score in %", data: "score" },
        ],
        destroy: true,
        responsive: true
    });

    // ----------- Completed Task datatable -------------
    Completed_Task_DataTable = $('#CompletedTaskTable').DataTable({
        columns: [
            {
                title: "Date", data: "date",
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    });
                }
            },
            { title: "Task ID", data: "task_id" },
            { title: "Type", data: "type" },
            { title: "Assigned To", data: "assigned_to" },
            { title: "Task", data: "task" },
            { title: "Status", data: "status" },
            {
                title: "Work Proof", data: "work_proof",
                render: function (data) {
                    return data
                        ? `<a href="${window.location.origin}/${data}" target="_blank">View</a>`
                        : 'No Proof';
                }
            },
            { title: "Score", data: "score" },

        ],
        destroy: true,
        responsive: true
    });



    // ----------- Pending Task datatable -------------
    Pending_Task_DataTable = $('#PendingTaskTable').DataTable({
        columns: [
            {
                title: "Date", data: "date",
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    });
                }
            },
            { title: "Task ID", data: "task_id" },
            { title: "Type", data: "type" },
            { title: "Assigned To", data: "assigned_to" },
            { title: "Task", data: "task" },
            { title: "Status", data: "status" },
            {
                title: "Work Proof", data: "work_proof",
                render: function (data) {
                    return data
                        ? `<a href="${window.location.origin}/${data}" target="_blank">View</a>`
                        : 'No Proof';
                }
            },
            { title: "Score", data: "score" },

        ],
        destroy: true,
        responsive: true
    });

    $('.parent_statusTask').hide();

    //   ------------------------- Main Report from to fetch data using job card model ----------------------------------
    $('#TotalTaskReportForm').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        $('.parent_statusjobcards').show();
        $.ajax({
            url: `/report/total-task-show`,
            method: 'GET',
            data: $(this).serialize(),
            success: function (res) {
                toggleOverlay(false);

                let summary = res.summary;
                let completed = res.completedTasks;
                let pending = res.pendingTasks;

                $('.parent_statusTask').show();

                // Load tables
                Total_Task_DataTable.clear().rows.add(summary).draw();
                Completed_Task_DataTable.clear().rows.add(completed).draw();
                Pending_Task_DataTable.clear().rows.add(pending).draw();

                $('#TotalTaskReportForm')[0].reset();
            },
            error: function (xhr) {
                toggleOverlay(false);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to fetch data. Please try again.",
                    icon: "error"
                });
            }
        });
    });

});
