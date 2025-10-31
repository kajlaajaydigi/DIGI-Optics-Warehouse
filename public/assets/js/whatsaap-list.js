var table;
$(document).ready(function () {
    table = $('#allWhatsaapTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: "/whatsaap/list",
            data: function (d) {
                d.from_date = $('#fromDate').val();
                d.to_date = $('#toDate').val();
                d.keyword = $('#keyword').val();
            }
        },
        columns: [
            { data: 'created_at', title: 'Date' },
            { data: 'id', title: 'Whatsapp status ID' },
            { data: 'job_card_id', title: 'Job card ID' },
            { data: 'recipient_number', title: 'Recipient Number' },
            { data: 'message_type', title: 'Message Type' },
            { data: 'message_status', title: 'Message Status' },
        ],
        order: [[0, 'desc']]
    });

    // 🔎 Keyword Enter press
    $('#keyword').on('keyup', function (e) {
        if (e.key === "Enter") {
            table.draw();
        }
    });

    // 🔎 Date filter
    $('#fromDate, #toDate').on('change', function () {
        table.draw();
    });

    // 🔎 Search button click
    $('#searchBtn').on('click', function () {
        table.draw();
    });
});

function refresh() {
    table.ajax.reload(null, false);
}
