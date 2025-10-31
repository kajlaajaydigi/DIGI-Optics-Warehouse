$(document).ready(function () {

    //--------------------------- New Coupon create -----------------------
    $('#add_coupon_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        $.ajax({
            url: '/coupon/store',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message || 'Coupon created.');
                    $('#add_coupon_form')[0].reset();
                    setTimeout(function () {
                        location.reload();
                    }, 2000);
                } else if (response && response.errors) {
                    Object.keys(response.errors).forEach(function (key) {
                        toastr.error(response.errors[key][0]);
                    });
                } else {
                    toastr.error(response.message || 'Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);

                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    const errors = xhr.responseJSON.errors;
                    Object.keys(errors).forEach(function (key) {
                        toastr.error(errors[key][0]);
                    });
                    return;
                } else {
                    const msg =
                        (xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) ||
                        xhr.statusText || 'Something went wrong.';
                    toastr.error(msg);
                }
            }
        });
    });


    // -------------------update coupon -----------------
    $('#update_coupon_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        const id = $('#update_coupon_id').val();

        $.ajax({
            url: `/coupon/update/${id}`,
            type: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message);
                    $('#update_coupon_form')[0].reset();
                    setTimeout(function () {
                        location.reload();
                    }, 2000);
                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);
                if (xhr.status === 422) {
                    const errors = xhr.responseJSON.errors;
                    for (let field in errors) {
                        toastr.error(errors[field][0]);
                        break;
                    }
                } else {
                    toastr.error('Something went wrong.');
                }
            }
        });
    });

    // =============================== Coupon datatable ================================
    $('#allCouponsTable').DataTable({
        data: CouponData,
        columns: [
            // { data: 'id', title: 'Coupon ID' },
            { data: 'code', title: 'Code' },
            { data: 'type', title: 'Type' },
            { data: 'value', title: 'Value' },
            { data: 'max_usage', title: 'Max Usage' },
            { data: 'per_user_usage', title: 'Per User Usage' },
            { data: 'used_count', title: 'Used Count' },
            {
                data: 'valid_from', title: 'Valid From',
                render: function (data) {
                    if (!data) return '-';
                    const d = new Date(data);
                    return d.toLocaleDateString('en-IN');
                }
            },
            {
                data: 'valid_to', title: 'Valid To',
                render: function (data) {
                    if (!data) return '-';
                    const d = new Date(data);
                    return d.toLocaleDateString('en-IN');
                }
            },
            {
                data: 'status',
                title: 'Status',
                render: function (data) {
                    return data == 1 ? "Active" : "Not Active";
                }
            },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <center>
                           <span class='material-icons text-success cursor-pointer ms-2 toggleStatus'
                                title='Toggle Status'>autorenew</span>
                            <span class='material-icons text-danger cursor-pointer ms-2 deleteCoupon'
                                title='Delete Coupon'>delete</span>
                        </center>`;
                }
            }
        ],
        scrollX: true
    });


    // Attach event listener to table rows
    $('#allCouponsTable tbody').on('click', 'span', function () {
        const table = $('#allCouponsTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        let cId = data['id'];

        if ($(this).hasClass("toggleStatus")) {
            toggleCouponStatus(cId, data); // 👈 new function to toggle
        }
        else if ($(this).hasClass("deleteCoupon")) {
            deleteCouponDetails(cId);
        }
    });


    // =============================== Toggle Add / Update ================================
    $('#couponAction').on('change', function () {
        const selected = $(this).val();

        if (selected === 'new') {
            $('#add_coupon').show();
            $('#update_coupon_list').hide();
            $('#update_coupon').hide();
        } else if (selected === 'update') {
            $('#add_coupon').hide();
            $('#update_coupon_list').show();
            $('#update_coupon').hide();
            populateCouponList(CouponData);
        }
    });

    function populateCouponList(coupons) {
        const $dropdown = $('#update_coupon_select');
        $dropdown.empty().append('<option selected disabled>Select Coupon</option>');
        coupons.forEach(coupon => {
            $dropdown.append(`<option value="${coupon.id}">${coupon.code}</option>`);
        });
    }

    // When a coupon is selected in update dropdown
    $('#update_coupon_select').on('change', function () {
        const couponId = $(this).val();
        const coupon = CouponData.find(c => c.id == couponId);
        if (coupon) {
            fillUpdateCouponForm(coupon);
            $('#update_coupon').show();
        }
    });

    function fillUpdateCouponForm(coupon) {
        $('#update_coupon_id').val(coupon.id);
        $('#update_code').val(coupon.code);
        $('#update_type').val(coupon.type);
        $('#update_value').val(coupon.value);
        $('#update_max_usage').val(coupon.max_usage);
        $('#update_per_user_usage').val(coupon.per_user_usage);
        $('#update_valid_from').val(coupon.valid_from ? formatDate(coupon.valid_from) : '');
        $('#update_valid_to').val(coupon.valid_to ? formatDate(coupon.valid_to) : '');
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        const pad = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

});

function toggleCouponStatus(couponId, rowData) {
    $.ajax({
        url: '/coupon/' + couponId + '/toggle-status', // make sure leading slash `/` is here
        type: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
            if (response.success) {
                location.reload()
            }
        },
        error: function (xhr) {
            console.error(xhr.responseText);
        }
    });
}


// =============================== Delete Coupon ================================
function deleteCouponDetails(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete Coupon ID: ${id}`,
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
                url: `/coupon/delete/${id}`,
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Coupon ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=couponlist`);  // 👈 redirect ya refresh
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Coupon. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}
