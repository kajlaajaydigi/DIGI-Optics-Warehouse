var table;
$(document).ready(function () {

    //--------------------------- New user create----------------------

    // Form submit
    $('#add_setting_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        const formData = $(this).serialize();

        $.ajax({
            url: '/add-Setting',
            type: 'POST',
            data: formData,
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message);
                    valueArray = []; // clear array

                    // Add new setting directly in DataTable
                    table.row.add(response.data).draw(false);

                    $('#add_setting_form')[0].reset();

                    setTimeout(function () {
                        location.reload();
                    }, 2500);
                    // location.reload();
                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);
                toastr.error('Something went wrong.');
            }
        });
    });




    // -------------------update user -----------------
    $('#update_user_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        const id = $('#update_id').val();
        const formData = $(this).serialize();

        $.ajax({
            url: `/update-setting/${id}`, // Apna Laravel route
            type: 'PUT',
            data: formData,
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message);

                    const rowIndex = table.rows().indexes().filter(function (idx) {
                        return table.cell(idx, 0).data() == id;
                    });

                    if (rowIndex.length) {
                        table.row(rowIndex[0]).data(response.data).draw(false);
                    }

                    // setTimeout(function () {
                    //     location.reload();
                    // }, 2500); // after toaster notification it run
                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);
                toastr.error('Something went wrong.');
            }
        });
    });

    // =============================== User datatable ================================
    table = $('#allSettingTable').DataTable({
        data: SettingData,
        columns: [
            { data: 'id', title: 'ID' },
            { data: 'key', title: 'Key' },
            {
                data: 'value',
                title: 'Value',
                render: function (data) {
                    if (Array.isArray(data)) {
                        return data.join(', ');
                    } else if (typeof data === 'object' && data !== null) {
                        // Map key-value pairs into "key: value" and join with comma
                        return Object.entries(data)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ');
                    } else {
                        return data ?? '';
                    }
                }
            },
            {
                title: 'Action',
                render: function (data, type, row) {

                    if (DeleteSetting) {
                        return `
                        <center>
                            <span id='deletessetting' class='material-icons text-danger cursor-pointer ms-2' title='Delete Setting'>delete</span>
                        </center>
                    `;
                    } else {
                        return ''; // hide button
                    }
                }
            }
        ],
        scrollX: true,
        order: [[0, 'desc']]
    });


    // Attach event listener to table rows
    $('#allSettingTable tbody').on('click', 'span', function () {
        const table = $('#allSettingTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let sId = data['id'];
        let Username = data[3];
        let Usermobile = data[4];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Username);
        // $('#invoicecmobile').val(Usermobile);
        selectedUser = data;


        // if (data) {
        //     // $('#taskType').val('update').trigger('change');
        //     $('#update_user_select').val(data.id).trigger('change');
        // }

        if (spanId === "editSetting") {
            if (data) {
                $('#update_user_select').val(data.id).trigger('change');
            }
            editUserDetail(data, sId);
        } else if (spanId === "deletessetting") {
            deleteSettingDetails(sId);
        }
    });


    $('#taskType').on('change', function () {
        const selected = $(this).val();

        // First, hide all sections
        $('#add_setting, #update_user_list, #update_user, #add_object_setting, #update_object_setting').hide();

        if (selected === 'new') {
            $('#add_setting').show();
        }
        else if (selected === 'update') {
            $('#update_user_list').show();
            $('#update_user').show();
            populateSettingList(SettingData);
        }
        else if (selected === 'new_object') {
            $('#add_object_setting').show();
        }
    });

    function populateSettingList(settings) {
        const $dropdown = $('#update_user_select');
        $dropdown.empty().append('<option selected disabled>Select Key</option>');
        settings.forEach(setting => {
            $dropdown.append(`<option value="${setting.id}">${setting.key}</option>`);
        });
    }


    // When a user is selected in update dropdown
    $('#update_user_select').on('change', function () {
        const settingId = $(this).val();
        const setting = SettingData.find(s => s.id == settingId);

        if (!setting) return;

        // Common key/id fill
        $('#update_id').val(setting.id);
        $('#update_key').val(setting.key);

        // Hide both forms initially
        $('#update_user').hide();
        $('#update_object_setting').hide();

        if (typeof setting.value === 'object' && setting.value !== null && !Array.isArray(setting.value)) {
            // If value is OBJECT => show object update form
            $('#update_object_setting').show();

            //Objject form key/id fill
            $('#update_id_obj').val(setting.id);
            $('#update_key_obj').val(setting.key);

            const wrapper = $('#update_object_setting_form #update_object_fields_wrapper');
            wrapper.empty(); // clear old fields

            Object.entries(setting.value).forEach(([k, v]) => {
                const fieldHtml = `
                <div class="d-flex mb-2">
                    <input type="text" name="obj_key[]" class="form-control me-2" value="${k}" placeholder="Field Name" required>
                    <input type="text" name="obj_value[]" class="form-control me-2" value="${v}" placeholder="Value" required>
                    <button type="button" class="btn btn-danger btn-sm remove_field">X</button>
                </div>`;
                wrapper.append(fieldHtml);
            });

        } else {
            // If value is ARRAY or STRING => show normal update form
            $('#update_user').show();

            $('#update_value').val(
                Array.isArray(setting.value) ? setting.value.join(', ') : setting.value
            );
        }
    });



    // Form with multiple object value submit
    $('#add_field_btn').on('click', function () {
        $('#object_fields_wrapper').append(`
        <div class="d-flex mb-2">
            <input type="text" name="obj_key[]" class="form-control me-2" placeholder="Field Name" required>
            <input type="text" name="obj_value[]" class="form-control me-2" placeholder="Value" required>
            <button type="button" class="btn btn-danger btn-sm remove_field">X</button>
        </div>
    `);
    });

    $('#object_fields_wrapper').on('click', '.remove_field', function () {
        $(this).parent('div').remove();
    });

    // Update object setting form with multiple object value submit
    $('#update_add_field_btn').on('click', function () {
        $('#update_object_fields_wrapper').append(`
        <div class="d-flex mb-2">
            <input type="text" name="obj_key[]" class="form-control me-2" placeholder="Field Name" required>
            <input type="text" name="obj_value[]" class="form-control me-2" placeholder="Value" required>
            <button type="button" class="btn btn-danger btn-sm remove_field">X</button>
        </div>
    `);
    });

    $('#update_object_fields_wrapper').on('click', '.remove_field', function () {
        $(this).parent('div').remove();
    });

    // Add object setting form submit
    $('#add_object_setting_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        let key = $(this).find('input[name="key"]').val();
        let objKeys = $(this).find('input[name="obj_key[]"]').map(function () { return $(this).val(); }).get();
        let objValues = $(this).find('input[name="obj_value[]"]').map(function () { return $(this).val(); }).get();

        let obj = {};
        objKeys.forEach((k, i) => {
            obj[k] = objValues[i];
        });

        $.ajax({
            url: '/add-Setting',
            type: 'POST',
            data: {
                key: key,
                value: JSON.stringify(obj),
                _token: $('input[name=_token]').val()
            },
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message);
                    $('#add_object_setting_form')[0].reset();
                    // setTimeout(function () {
                    //     location.reload();
                    // }, 2500);
                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);
                toastr.error('Something went wrong.');
            }
        });
    });

    //update object setting form submit
    $('#update_object_setting_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        let id = $(this).find('input[name="id"]').val();
        let key = $(this).find('input[name="key"]').val();
        let objKeys = $(this).find('input[name="obj_key[]"]').map(function () {
            return $(this).val();
        }).get();
        let objValues = $(this).find('input[name="obj_value[]"]').map(function () {
            return $(this).val();
        }).get();

        let obj = {};
        objKeys.forEach((k, i) => {
            obj[k] = objValues[i];
        });

        $.ajax({
            url: `/update-setting/${id}`,
            type: 'PUT',
            data: {
                key: key,
                value: JSON.stringify(obj),
                _token: $('input[name=_token]').val()
            },
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message);

                    // Reset the form
                    $('#update_object_setting_form').hide();
                    $('#update_object_setting_form')[0].reset();

                    // setTimeout(function () {
                    //     location.reload();
                    // }, 2500);

                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function () {
                toggleOverlay(false);
                toastr.error('Something went wrong.');
            }
        });
    });


});

function deleteSettingDetails(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete Setting data: ${id}`,
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
                url: `/delete-setting/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Setting ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=Settinglist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete Setting. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}
