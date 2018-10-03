/**
 * Created by user on 7/16/2018.
 */

$(document).ready(function () {

    // Set window sizing
    $('#right_col').height($(window).height() - $('#top_nav').height() - 15);
    $('.tabbable').height($('#right_col').height() - $('.smart_nav').height() - 130);
    $('.tab-content').height($('#right_col').height() - $('.smart_nav').height() - 130);
    $('#editor-one').height($('#right_col').height() - $('.smart_nav').height() - 230);
    //$('#steps-nav').css('bottom', '0');
    var taxSlabs = {
        'totalTaxSlabTableCumulativeTax' : 0,
        'slabCount': 1,
        1 : {
            'lowerLimit': 0,
            'upperLimit' : null,
            'taxRate' : null,
            'difference': null,
            'tax' : null,
            'cumulativeTax': null
        }
    }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    $('#id_currency').change(function(event){
        // get currency.
        updateCurrency(getCurrency());
    })

    function getCurrency(){
        var currencyId =  $('#id_currency').val()
        if(currencyId=='None'){
            return '$';
        }
        if(currencyId == 0){
            return '$';
        }else if(currencyId == 1){
            return '£';
        }else if (currencyId == 2){
            return '€';
        }else{
            return '$'; // dollar is returned for any missing case
        }
    }

    function updateCurrency(symbol){
        var text = ' ('+ symbol +')'
        $('.span-currency').text(text);
    }

    $('#id_first_financial_year').change(function(event){
        // First financial year altered
        firstFinancialYear = parseInt($(this).val())
        $(this).attr('value', $(this).val());
    })


    $('#id_number_of_products_or_services').change(function(e){
        productCount = $(this).val(); // Product count updated
        // Creating table with these number of rows
        // Get count of tr in table
        $(this).attr('value', $(this).val());
        var productRowsCount = $('#tbl_assumptions_number_of_products_or_services tbody tr').length;
        var difference = productCount - productRowsCount

        if(difference > 0){
            // difference # rows need to be added
            var str = '';
            for(var k = 0; k < difference; k++) {
                productRowsCount++;
                var productOrServiceId = 'tbl_assumptions_number_of_products_or_services_' + productRowsCount;
                var productOrServiceName = productOrServiceId + '_name';
                var productOrServiceUnits = productOrServiceId + '_units';
                var productOrServiceGrowthRate = productOrServiceId + '_growth_rate'
                str +=
                    '<tr id="' + productOrServiceId + '">'
                    + '<td id="' + productOrServiceName + '" class="td-input"><input name="' + productOrServiceName +'" type="text" data-product_id="' + productOrServiceId +'" data-prop_affected="name"  class="form-control input-md product-change text-left render_required" placeholder="" required="required"></td>'
                    + '<td id="' + productOrServiceUnits + '" class="td-input"><input name="' + productOrServiceUnits +'" type="text" data-product_id="' + productOrServiceId +'" data-prop_affected="units"  class="form-control input-md product-change text-left render_required" placeholder="" required="required"></td>'
                    + '<td id="' + productOrServiceGrowthRate + '" class="td-input"><input name="' + productOrServiceGrowthRate +'" type="number" min="0" data-product_id="' + productOrServiceId +'" data-prop_affected="growth_rate"  class="form-control input-md product-change text-right render_required" placeholder="" required="required"></td>'
                    + '</tr>'
            }
            $('#tbl_assumptions_number_of_products_or_services').append(str);
            // Unbind change handler
            $('.product-change').unbind('change');
            // Bind event handler again
            $('.product-change').change(productDetailsChangeHandler)
            productRowsCount;

        }else{
            // difference # of rows need to be removed
            for(var k = 0; k < Math.abs(difference); k++){
                if(productRowsCount > 0){
                    $("#tbl_assumptions_number_of_products_or_services_"+(productRowsCount)).remove();
                    // Remove product from list
                    delete products['tbl_assumptions_number_of_products_or_services_' + productRowsCount];
                    productRowsCount--;
                }
            }
            productRowsCount = productCount;
        }

        // Update for the next 4 tables
        // Table 1:- Price Per Product Table

        // Table 2

        // table 3

        // table 4
    })

    $('#id_first_financial_year').change(function (event) {
        if($('#id_first_financial_year').val() != null && $('#id_first_financial_year').val() != ''){
            firstFinancialYear = parseInt($('#id_first_financial_year').val(), 0)
            generatePrijectionYearsList();
        }
        //console.log(projectionYearsList);
    })

    $('#id_projection_years').change(function (event) {
        if($('#id_projection_years').val() != null && $('#id_projection_years').val() != ''){
            projectionYears = parseInt($('#id_projection_years').val(), 0)
            generatePrijectionYearsList();
        }
        //console.log(projectionYearsList);
    })

    function generatePrijectionYearsList(){
        lastFinancialYear = parseInt(firstFinancialYear) + parseInt(projectionYears);
        // first clear everything in array
        projectionYearsList = [];
        for(var i= firstFinancialYear; i < lastFinancialYear; i++){
            // Getting the list of years
            projectionYearsList.push(i);
        }
    }

    function getMonthsListForYear(yearString, total){
        // total parameter is an bool flag to indicate if you need plus the totals month item
        var monthsList = {}
        $.each(projectionMonthsList, function (index, month) {
            if(month['year'] == yearString ){
                // Check if total is allowed for
                if(month['is_total'] && total){
                    monthsList[index] = month
                }else if(!month['is_total']){
                    monthsList[index] = month
                }

            }
        })
        return monthsList;
    }

    function generateProjectionMonthsList(){
        // Handle start month value
        // Handle # of months in a year
        var defaultStartMonth = 'January';
        var currentMonth = '';
        var nextMonth = '';
        var previousMonth = '';
        var calendarYear = 0;
        var iterate = true;
        var order = 1;
        var yearOrder = 1;
        var count = 0;
        $.each(projectionYearsList, function(yearIndex, projectionYear){
            iterate = true;
            while(iterate){
                // Get the start month value
                if(currentMonth == ''){
                    // Next month not set.
                    currentMonth = calendarMonths[defaultStartMonth];
                }
                nextMonth = currentMonth['next']; // Next month retrieved
                previousMonth = currentMonth['previous']; // previous month

                // Identify if nexMonth order is less than prevous month.
                if(nextMonth['order'] < currentMonth['order']){
                   // This is to ensure that the calendar year moves to the next year but the financial year remains
                   // That implies month is in a different/next year
                   // Check if there's more to the next year before proceeding
                   if(projectionYearsList.indexOf(projectionYear + 1) < 0){
                       // Include added year
                       calendarYear = projectionYear + 1;
                   }else{
                       // Next year in list... Proceed with normal processing
                       calendarYear = projectionYear;
                   }
                }else{
                    calendarYear = projectionYear;
                }
                // Populate projection months list details
                var listId = currentMonth['code'] + '-' +  projectionYear;
                projectionMonthsList[listId] = {}
                projectionMonthsList[listId]['year'] = projectionYear;
                projectionMonthsList[listId]['month'] = currentMonth['name'];
                projectionMonthsList[listId]['display'] = listId;
                projectionMonthsList[listId]['calendar_year'] = calendarYear;
                projectionMonthsList[listId]['financial_year'] = projectionYear;
                projectionMonthsList[listId]['is_total'] = false;
                projectionMonthsList[listId]['order'] = order;
                projectionMonthsList[listId]['total_year'] = projectionYear + '_Total';
                order++;

                count++; // Increment counter
                if(count >= countOfMonthsInFinancialYear){
                    // Break to the next Financial year
                    // Before break, add a total's month val
                    var listId = projectionYear + '_Total';
                    projectionMonthsList[listId] = {}
                    projectionMonthsList[listId]['year'] = projectionYear;
                    projectionMonthsList[listId]['month'] = 'Last';
                    projectionMonthsList[listId]['display'] = "Total";
                    projectionMonthsList[listId]['calendar_year'] = calendarYear;
                    projectionMonthsList[listId]['financial_year'] = projectionYear;
                    projectionMonthsList[listId]['is_total'] = true;
                    projectionMonthsList[listId]['year_order'] = yearOrder;
                    projectionMonthsList[listId]['total_year'] = '';
                    yearOrder++;

                    count = 0;
                    iterate = false;
                }

                // Prepare movement to next month. Means updating currentMonth to nextMonth
                currentMonth = calendarMonths[currentMonth['next']]
            }

        })
    }

    function truncateTable(tableId){
        $(tableId).html('')
    }

    function generatePricePerProductTable(isRegenerating){
        // Get the new list of products
        // For each product, log the details
        if(!$('#tbl_assumptions_price_per_product').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_price_per_product" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_price_per_product');
        }

        var strHead =   '<caption style="color: #73879C;"><label class="control-label">Price per <span class="span-item_offered"> ' + getItemOffered(false) + ' </span></label></caption>'
                        + '<thead>'
                        + '<tr >'
                        +   '<th class="text-left">'
                        +    'Product / Service Name'
                        +   '</th>'
                        +   '<th class="text-right">'
                        +       'Growth Rate (P.A)'
                        +   '</th>';

        $.each(projectionYearsList, function(index, projectionYear){
            strHead += '<th class="text-right">'
                        +    projectionYear + '<span class="span-currency"></span>'
                    +   '</th>'
        })
        // Complete hthead
        strHead += '</tr>'
                + '</thead>'

        var strBody = '<tbody>';
            $.each(products, function(productIndex, product){
                strBody += '<tr data-product_id="' + productIndex + '">'
                            + '<td class="td-label td-md" data-product_id="' + productIndex + '">'
                            +    '<span class="input-label">' + product['name'] + '</span>'
                            + '</td>'
                            + '<td class="td-label td-xs text-right" data-product_id="' + productIndex + '">'
                            +   '<span class="input-label">' + product['growth_rate'] + '</span>'
                            + '</td>'
                            // Add other td's depending on the projection years
                            var firstYear = true;
                            $.each(projectionYearsList, function(yearIndex, projectionYear){
                                // Remember, only the first year is editable. The rest are auto-populated
                                var readonlyText = ((!firstYear) ? 'readonly' : '');
                                var priceChangetext = ((firstYear) ? 'price-change' : '');
                                var autoFilledText = (!firstYear) ? 'auto-filled' : '';
                                strBody += '<td class="yearly ' + projectionYear +' td-input td-sm' + readonlyText + ' ' + autoFilledText + '"'
                                            +    ' data-projection_year="'+ projectionYear +'">'
                                            + '<input data-product_id="' + productIndex + '" name="' + productIndex + '_price_' + projectionYear +'" '
                                                    + 'type="text" data-projection_year="' + projectionYear +'" '
                                                    + ' value=""'
                                                    + ' class="form-control number-input-format input-md '+ priceChangetext +' text-right render_required" required="required " + ' + readonlyText + '></td>'
                                firstYear = false;
                            })
                strBody += '</tr>'
            })
            strBody += '</tbody>'

        $('#tbl_assumptions_price_per_product').append(strHead);
        $('#tbl_assumptions_price_per_product').append(strBody);

        $('.price-change').unbind('change');
        $('.price-change').change(productPriceChangeHandler);

        // Show parent content
        $('#tbl_assumptions_price_per_product').parent('.content-bordered').css('display', 'block');

    }

    function generateDirectCostPerProductTable(){
        if(!$('#tbl_assumptions_direct_cost_per_product').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_direct_cost_per_product" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_direct_cost_per_product');
        }
        var strHead =   '<caption style="color: #73879C;"><label class="control-label">Direct Cost per <span class="span-item_offered"> ' + getItemOffered(false) + ' </span> (% of Price)</label></caption>'
                        + '<thead>'
                        + '<tr >'
                        +   '<th class="text-left">'
                        +    'Product / Service Name'
                        +   '</th>'

        $.each(projectionYearsList, function(index, projectionYear){
            strHead += '<th class="text-right">'
                        +    projectionYear + ' (%)'
                    +   '</th>'
        })
        // Complete hthead
        strHead += '</tr>'
                + '</thead>'

        var strBody = '<tbody>';
        $.each(products, function(productIndex, product){
            strBody += '<tr data-product_id="' + productIndex + '">'
                        + '<td class="td-label td-md " data-product_id="' + productIndex + '">'
                        +    '<span class="input-label">' + product['name'] + '</span>'
                        + '</td>'
                        // Add other td's depending on the projection years
                        $.each(projectionYearsList, function(yearIndex, projectionYear){
                            // Every input field is editable
                            strBody += '<td class="yearly td-input td-sm"'
                                        + ' data-projection_year="'+ projectionYear +'">'
                                        + '<input data-product_id="' + productIndex + '" name="' + productIndex + '_direct_cost_' + projectionYear +'" '
                                                + 'type="number" data-projection_year="' + projectionYear +'" '
                                                + ' value=""'
                                                + ' class="form-control input-md text-right render_required cost-change" required="required" >'
                                        + '</td>'
                        })
            strBody += '</tr>';
        })

        strBody += '</tbody>'

        // Append thead to table
        $('#tbl_assumptions_direct_cost_per_product').append(strHead);
        $('#tbl_assumptions_direct_cost_per_product').append(strBody);

        // Bind and unbind change handlers whennever necessary
        // Unbind and bind change events
        $('.cost-change').unbind('change');
        $('.cost-change').change(productCostChangeHandler);
    }

    function generateUnitOfRevenueMeasurementTable(){
        if(!$('#tbl_assumptions_units_of_measurement_per_product').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_units_of_measurement_per_product" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_units_of_measurement_per_product');
        }
        var strHead = '<caption style="color: #73879C;"><label class="control-label">Units of Measurement</label></caption>'
                        +'<thead>'
                        + '<tr >'
                        +   '<th><span class="span-item_offered"> ' + getItemOffered(true) + ' </span> </th>'
                        +   '<th class="text-left">Units of Measuring Revenue  </th>'
                        +   '<th class="text-right"> Growth Rate (%) </th>'
        // Add tdata fro each month and year total... This should apply for the 1st year
        $.each(projectionMonthsList, function(index, projectionMonthYear){
            // Check if first year
            // Check if year end...
            var yearTotalClass = projectionMonthYear['is_total'] ? 'unit_year-total' : ''
            strHead += '<th class="text-right ' + yearTotalClass + '" >'
                        +    projectionMonthYear['display'];
                    +   '</th>'
        })
        // Complete hthead
        strHead += '</tr>'
                + '</thead>'

        // Construct body

        var strBody = '<tbody>';
            $.each(products, function(productIndex, product){
                strBody += '<tr data-product_id="' + productIndex + '">'
                            + '<td class="td-label td-md " data-product_id="' + productIndex + '">'
                            +    '<span class="input-label">' +  product['name'] + '</span>'
                            + '</td>'
                            + '<td class="td-label td-sm" data-product_id="' + productIndex + '">'
                            +    '<span class="input-label text-left">' +  product['units'] + '</span>'
                            + '</td>'
                            + '<td class="td-label td-xs text-right growth_rate_per_month" data-product_id="' + productIndex + '">'
                            +    '<span class="input-label text-right">' +  product['growth_rate'] + '</span>'
                            + '</td>'
                            // Add other td's depending on the projection years

                            $.each(projectionMonthsList, function(projectionMonthIndex, projectionMonthYear){
                                // Check if first year
                                var yearTotalClass = projectionMonthYear['is_total'] ? 'unit_year-total' : ''
                                var isReadonlyField = (projectionMonthYear['year'] != firstFinancialYear || yearTotalClass)
                                var readonlyText = (isReadonlyField) ? 'readonly' : '';
                                var autoFilledText = (isReadonlyField) ? 'auto-filled' : '';
                                var unitChangeText = (!isReadonlyField) ? 'unit-change' : '';

                                strBody += '<td class="monthly td-input td-xs ' + readonlyText + ' ' + autoFilledText + ' '  + yearTotalClass + ' ' + projectionMonthYear['total_year'] + ' ' + projectionMonthIndex + '"'
                                                + ' data-is_total_col="' + yearTotalClass + '"'
                                                + ' data-projection_month_id="' + projectionMonthIndex +'" '
                                                + ' data-projection_year="' + projectionMonthYear['year'] +'" '
                                                + ' width="200">'
                                                + '<input name="' + productIndex + '_units_of_measuring_revenue_' + projectionMonthIndex +'" '
                                                    + ' type="text" '
                                                    + ' data-product_id="' + productIndex + '" '
                                                    + ' data-projection_month_id="' + projectionMonthIndex +'" '
                                                    + ' data-projection_year="' + projectionMonthYear['year'] +'" '
                                                    + ' data-value="'+ 0 +'" '
                                                    + ' value=""'
                                                    + ' class="form-control number-input-format input-md '+ unitChangeText +' text-right render_required" required="required " + ' + readonlyText + '></td>'

                            })
                strBody += '</tr>'
            })
            strBody += '</tbody>'

        // Append thead and tbody
        $('#tbl_assumptions_units_of_measurement_per_product').append(strHead);
        $('#tbl_assumptions_units_of_measurement_per_product').append(strBody);

        // Unbind and bind change events
        $('.unit-change').unbind('change');
        $('.unit-change').change(measurementUnitChangeHandler);


        // Unbind/ bind events
        $('.number-input-format').unbind('keydown')
        $('.number-input-format').keydown(numberFormatKeyDownHandler)

        // Invoke DataTable
        // Wait 3 seconds then


    }

    function generateOperatingTableRow(costName){
        costName = (typeof costName !== 'undefined') ?  costName : '';
        var rowId = $('#tbl_assumptions_operating_costs tbody').children('tr').length + 1;
        var operatingCostId = 'assumptions_assumptions_operating_cost_' + rowId;
        var strRow =  '<tr data-row_id="' + operatingCostId +'">'
                      +      '<td class="td-action td-input">'
                      +          '<button type="button" class="btn btn-transparent action-danger action-delete-row" title="Delete row" data-toggle="confirmation"'
                      +                  'data-btn-ok-label="Continue" data-btn-ok-class="btn-success"'
                      +                  'data-btn-cancel-label="Cancel!" data-btn-cancel-class="btn-danger"'
                      +                  'data-title="Delete Operation Cost Row?" data-content="This action cannot be reversed and can lead to data loss.">'
                      +              '<i class="fa fa-times fa-2x" style="font-size:16px" aria-hidden="true"></i>'
                      +          '</button>'
                      +      '</td>'
                      +      '<td  class="operating_cost_name td-input td-md">'
                      +          '<input type="text" class="form-control" name="' + operatingCostId +'" value="' + costName +'" placeholder="" required="required"  >'
                      +      '</td>'
                      +      '<td class="costing_period td-input td-sm">'
                      +          '<select class="form-control render_required" required="required">'
                                    $.each(costAppropriationMethods, function(appMethodIndex, appMethod){
            strRow    +=                '<option value="' + appMethodIndex + '">' + appMethod + '</option>'
                                    })
             strRow   +=          '</select>'
                      +      '</td>'
                             // Add year specific rows
                             var colOrder = 0;
                             $.each(projectionYearsList, function(projectionYearIndex, projectionYear){
                                 var isReadonlyField = (colOrder != 0);
                                 var readonlyText = (isReadonlyField) ? 'readonly' : '';
                                 var autoFilledText = (isReadonlyField) ? 'auto-filled' : '';
                                 var inputName = operatingCostId + '_' + projectionYear
                                 var operatingCostChange = (colOrder == 0) ? 'operating-cost-change' : '';
             strRow +=       '<td class="cost td-input td-sm ' + readonlyText + ' ' + autoFilledText + '" '
                      +             ' data-projection_year= "'+ projectionYear +'">'
                      +          '<input type="text" class="form-control number-input-format input-md text-right render_required ' + operatingCostChange + '" name="' + inputName + '" value="" required="required" ' + readonlyText + '>'
                      +      '</td>'
                                 colOrder++;
                             })
             strRow   +='</tr>'
        return strRow;

    }

    function generateOperatingCostsTable(){
        if(!$('#tbl_assumptions_operating_costs').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_operating_costs" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_operating_costs');
        }
        var strTableInner ='<caption style="color: #73879C;"><label class="control-label">Operating Costs</label></caption>'
                          +'<thead>'
                          + '<tr>'
                          +     '<th> </th>'
                          +     '<th>Cost Item</th>'
                          +     '<th>Period Charged</th>'
                                $.each(projectionYearsList, function(projectionYearIndex, projectionYear){
        strTableInner     +=    '<th class="text-right">' + projectionYear + '<span class="span-currency"></span>' + '</th>'
                                });
        strTableInner     += '</tr>'
                          +'</thead>'
                          +'<tbody>'
                          +'</tbody>'

        $('#tbl_assumptions_operating_costs').append(strTableInner);

        // Get table rows:
        $.each(operatingCostList, function (index, operatingCost) {
            var rowHtml = generateOperatingTableRow(operatingCost);
            $('#tbl_assumptions_operating_costs tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('.action-delete-row').unbind('click');
        $('.action-delete-row').click(deleteRowEventHandler);

        // Unbind bind change events
        $('.operating-cost-change').unbind('change');
        $('.operating-cost-change').change(operatingCostChangeHandler);



        // Show div section
        $('#div_assumptions_operating_costs').css('display','block');
    }

    function generateEmployeeRolesListTableRow(employeeRole){
        employeeRole = (typeof employeeRole !== 'undefined') ?  employeeRole : '';
        var rowId = $('#tbl_assumptions_employee_roles_list tbody').children('tr').length + 1;
        var employeeRoleId = 'tbl_assumptions_assumptions_employee_roles_list_' + rowId;

        // Generating rows
        var strRowHtml = '<tr id="'+ employeeRoleId +'" data-row_id="'+ employeeRoleId +'">'
                     +   '<td class="td-action td-input">'
                     +       '<button type="button" class="btn btn-transparent action-danger action-delete-row" title="Delete row" data-toggle="confirmation"'
                     +               'data-btn-ok-label="Continue" data-btn-ok-class="btn-success"'
                     +               'data-btn-cancel-label="Cancel!" data-btn-cancel-class="btn-danger"'
                     +               'data-title="Delete Operation Cost Row?" data-content="This action cannot be reversed and can lead to data loss.">'
                     +           '<i class="fa fa-times fa-2x" style="font-size:16px" aria-hidden="true"></i>'
                     +       '</button>'
                     +   '</td>'
                     +   '<td class="role_name td-input td-md">'
                     +       '<input type="text" name="'+ rowId +'" class="form-control" value="'+ employeeRole +'" placeholder="" required="required" >'
                     +   '</td>'
                         // Make provision for number of years
        $.each(projectionYearsList, function (index, projectionYear) {
            var inputName = employeeRoleId + '_' + projectionYear
          strRowHtml += '<td class="number_of_employees td-input td-sm"'
                     +      'data-projection_year="'+ projectionYear +'">'
                     +       '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" placeholder="" value="" required="required" >'
                     +   '</td>'
        });
          strRowHtml +=   '<td class="td-input td-sm">'
                     +       '<select class="form-control text-center render_required" name="cost_type" required="required">'
                     +           '<option value="1">Direct Cost</option>'
                     +           '<option value="2">Indirect Cost</option>'
                     +       '</select>'
                     +   '</td>'
                     + '</tr>'
        return strRowHtml;
    }

    function generateEmployeeRolesListTable(){
        if(!$('#tbl_assumptions_employee_roles_list').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_employee_roles_list" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_employee_roles_list');
        }

        var strTableInner = '<caption style="color: #73879C;"><label class="control-label">Number of Employees </label></caption>'
                          + '<thead>'
                          +     '<th></th>'
                          +     '<th>Employees Roles</th>'
                                // Make adjustment for number of years
        $.each(projectionYearsList, function (index, projectionYear) {
            strTableInner +=    '<th class="text-right" >' + projectionYear + '</th>'
        })
            strTableInner +=    '<th>Direct/Indirect Cost</th>'
                          + '</thead>'
                          +'<tbody>'
                          +'</tbody>';
        $('#tbl_assumptions_employee_roles_list').append(strTableInner);
        // Get table rows:
        $.each(employeesList, function (index, employee) {
            var rowHtml = generateEmployeeRolesListTableRow(employee);
            $('#tbl_assumptions_employee_roles_list tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('.action-delete-row').unbind('click');
        $('.action-delete-row').click(deleteRowEventHandler);

        // Show div section
        $('#div_assumptions_employee_roles_list').css('display','block');
    }

    function generateEmployeeWorkingHoursTableRow(employeeRole){
        employeeRole = (typeof employeeRole !== 'undefined') ?  employeeRole : '';
        var rowId = $('#tbl_assumptions_employees_working_hours tbody').children('tr').length + 1;
        var employeeRoleId = 'tbl_assumptions_assumptions_employee_roles_list_' + rowId;

         var strRowHtml = '<tr class="'+ employeeRoleId +'" data-row_id="' + employeeRoleId + '">'
                        +       '<td class=" td-input td-md">'
                        +            '<input type="text" class="form-control" name="' + employeeRole + '" value="' + employeeRole + '" placeholder="" required="required" >'
                        +        '</td>'
        $.each(projectionYearsList, function (index, projectionYear) {
            var inputName = employeeRoleId + '_' + projectionYear
            strRowHtml +=       '<td class="working_hours td-input td-sm '
                       +            'data-projection_year="'+ projectionYear + '">'
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" placeholder="" value="" required="required" >'
                       +        '</td>'
        });

        return strRowHtml;
    }

    function generateEmployeeWorkingHoursTable(){
        if(!$('#tbl_assumptions_employees_working_hours').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_employees_working_hours" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_employees_working_hours');
        }
        var strTableInner = '<caption style="color: #73879C;"><label class="control-label">Number of Working Hours per Month</label></caption>'
                           +' <thead>'
                           +       '<tr>'
                           +             '<th>Employee Role</th>';
                // Providing for years
        $.each(projectionYearsList, function (index, projectionYear) {
            strTableInner  +=            '<th class="text-right">' + projectionYear + '</th>'
        })
            strTableInner  +=       '</tr>'
                           +'</thead>'
                           +'<tbody>'
                           +'</tbody>';

        $('#tbl_assumptions_employees_working_hours').append(strTableInner);
        // Get table rows:
        $.each(employeesList, function (index, employee) {
            var rowHtml = generateEmployeeWorkingHoursTableRow(employee);
            $('#tbl_assumptions_employees_working_hours tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('.action-delete-row').unbind('click');
        $('.action-delete-row').click(deleteRowEventHandler);

        // Show div section
        $('#div_assumptions_employees_working_hours').css('display','block');
    }

    function generateEmployeeHourlyRatesTableRow(employeeRole){
        employeeRole = (typeof employeeRole !== 'undefined') ?  employeeRole : '';
        var rowId = $('#tbl_assumptions_employees_hourly_rates tbody').children('tr').length + 1;
        var employeeRoleId = 'tbl_assumptions_assumptions_employee_roles_list_' + rowId;

         var strRowHtml = '<tr class="'+ employeeRoleId +'" data-row_id="' + employeeRoleId + '">'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control" name="' + employeeRoleId + '" value="' + employeeRole + '" placeholder="" required="required" >'
                        +        '</td>';
        var colOrder = 0;
        $.each(projectionYearsList, function (index, projectionYear) {
             var inputName = employeeRoleId + '_' + projectionYear;
             var isReadonlyField = (colOrder != 0);
             var readonlyText = (isReadonlyField) ? 'readonly' : '';
             var autoFilledText = (isReadonlyField) ? 'auto-filled' : '';
             var hourlyRateChangeText = (!isReadonlyField) ? 'hourly-rate-change' : '';
            strRowHtml +=       '<td class="hourly_rate td-input td-sm ' + readonlyText + ' ' + autoFilledText + '">'
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required ' + hourlyRateChangeText +' " placeholder="" value="" required="required" ' + readonlyText + '>'
                       +        '</td>'
            colOrder++;
        });
            strRowHtml +='</tr>'

        return strRowHtml;
    }

    function generateEmployeeHourlyRatesTable(){
        if(!$('#tbl_assumptions_employees_hourly_rates').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_employees_hourly_rates" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_employees_hourly_rates');
        }
        var strTableInner = '<caption style="color: #73879C;"><label class="control-label">Hourly Rates</label></caption>'
                           + ' <thead>'
                           +       '<tr>'
                           +             '<th>Employee Role</th>';
                // Providing for years
        $.each(projectionYearsList, function (index, projectionYear) {
            strTableInner  +=            '<th class="text-right">' + projectionYear + '<span class="span-currency"></span>' + '</th>'
        })
            strTableInner  +=       '</tr>'
                           +'</thead>'
                           +'<tbody>'
                           +'</tbody>';

        $('#tbl_assumptions_employees_hourly_rates').append(strTableInner);
        // Get table rows:
        $.each(employeesList, function (index, employee) {
            var rowHtml = generateEmployeeHourlyRatesTableRow(employee);
            $('#tbl_assumptions_employees_hourly_rates tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('.action-delete-row').unbind('change');
        $('.action-delete-row').click(deleteRowEventHandler);

        // Unbind and bind events again
        $('.hourly-rate-change').unbind('change');
        $('.hourly-rate-change').change(employeeHourlyRateChangeHandler);

        // Show div section
        $('#div_assumptions_employees_hourly_rates').css('display','block');
    }

    function generateCapitalTableRow(capitalSource, rowCount){
        capitalSource = (typeof capitalSource !== 'undefined') ?  capitalSource : '';
        var rowId = $('#tbl_assumptions_capital tbody').children('tr').length + 1;
        var capitalSourceId = 'tbl_assumptions_capital_' + rowId;

        var strRowHtml  = '<tr class="' + capitalSourceId + '" data-row_id="' + capitalSourceId + '">'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control" name="' + capitalSourceId + '" value="' + capitalSource + '" placeholder="" required="required" >'
                        +        '</td>'
        $.each(projectionYearsList, function (index, projectionYear) {
            var inputName = capitalSourceId + '_' + projectionYear;
            var investmentMonth = inputName + '_investment_month'
            var capitalChangedClassText = ' capital-changed ';
            strRowHtml +=       '<td class="td-input td-sm ' + capitalChangedClassText + ' ' + projectionYear + ' investment ">'
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" placeholder="" value="" required="required">'
                       +        '</td>'
                       +        '<td class="td-input text-right td-md ' + projectionYear +' month_of_investment">'
                                if(rowCount <= 1)
                                {
            strRowHtml +=           '<select class="form-control text-right" name="' + investmentMonth + '" required="required">'
            $.each(getMonthsListForYear(projectionYear, false), function (monthIndex, projectionMonth) {
                strRowHtml +=             '<option value="'+ monthIndex +'">'+ projectionMonth['display'] +'</option>'
            })
            strRowHtml +=           '</select>'
                                }
            strRowHtml +=      '</td>'
        });

            strRowHtml += '</tr>'
        return strRowHtml;
    }

    function generateCapitalTable(){
        if(!$('#tbl_assumptions_capital').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_capital" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_capital');
        }
        var strTableInner ='<caption style="color: #73879C;"><label class="control-label">Capital Sources</label></caption>'
                           +' <thead>'
                           +       '<tr>'
                           +             '<th>Capital Source</th>';
                // Providing for years
        $.each(projectionYearsList, function (index, projectionYear) {
            strTableInner  +=            '<th class="text-right" >' + projectionYear + '<span class="span-currency"></span>' + '</th>'
                           +             '<th class="text-center"> Month of Investment</th>'
        })
            strTableInner  +=       '</tr>'
                           +'</thead>'
                           +'<tbody>'
                           +'</tbody>';
        $('#tbl_assumptions_capital').append(strTableInner);
        // Get table rows:
        var rowCount = 0;
        $.each(capitalSourcesList, function (index, capitalSource) {
            var rowHtml = generateCapitalTableRow(capitalSource, rowCount);
            $('#tbl_assumptions_capital tbody').append(rowHtml);
            rowCount++;
        })

        // Show div section
        $('#div_assumptions_capital').css('display','block');
    }

    function generateUsageTangibleAssetsTableRow(assetName){
        assetName = (typeof assetName !== 'undefined') ?  assetName : '';
        var rowId = $('#tbl_assumptions_usage_tangible_assets tbody').children('tr').length + 1;
        var assetNameId = 'assumptions_usage_tangible_assets_' + rowId;
         var depreciationRate = assetNameId + '_depreciation_rate'
        var strRowHtml  = '<tr data-row_id="' + assetNameId + '">'
                        +       '<td class="td-action td-input">'
                            +       '<button type="button" class="btn btn-transparent action-danger action-delete-row" title="Delete row" data-toggle="confirmation"'
                        +               'data-btn-ok-label="Continue" data-btn-ok-class="btn-success"'
                        +               'data-btn-cancel-label="Cancel!" data-btn-cancel-class="btn-danger"'
                        +               'data-title="Delete Operation Cost Row?" data-content="This action cannot be reversed and can lead to data loss.">'
                        +               '<i class="fa fa-times fa-2x" style="font-size:16px" aria-hidden="true"></i>'
                        +           '</button>'
                        +       '</td>'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control " name="' + assetNameId + '" value="' + assetName + '" placeholder="" required="required" >'
                        +        '</td>'
        $.each(projectionYearsList, function (index, projectionYear) {
            var inputName = assetName + '_' + projectionYear;
            var investmentMonth = inputName + '_investment_month'

            var tangibleAssetUsageChangedClassText = ' tangible-assets-changed ';
            strRowHtml +=       '<td class=" '+ projectionYear +' amount_added td-input td-sm ' + tangibleAssetUsageChangedClassText +'">'
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right" placeholder="" value="" required="required">'
                       +        '</td>'
                       +        '<td class="'+ projectionYear+' month_added td-input td-sm">'
                       +            '<select class="form-control text-center" name="' + investmentMonth + '" required="required">'
            $.each(getMonthsListForYear(projectionYear, false), function (monthIndex, projectionMonth) {
                strRowHtml +=             '<option value="'+ monthIndex +'">'+ projectionMonth['display'] +'</option>'
            })
            strRowHtml +=           '</select>'
                       +        '</td>'
        });
            strRowHtml +=       '<td class="td-input td-sm">'
                       +            '<input type="text" name="' + depreciationRate + '" class="form-control number-input-format text-right render_required" placeholder="" required="required">'
                       +        '</td>'
                       +    '</tr>'
        return strRowHtml;
    }

    function generateUsageTangibleAssetsTable(){
        if(!$('#tbl_assumptions_usage_tangible_assets').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_usage_tangible_assets" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_usage_tangible_assets');
        }
        var strTableInner = '<caption style="color: #73879C;"><label class="control-label">Usage: Investment in Tangible Fixed Assets</label></caption>'
                           + ' <thead>'
                           +       '<tr>'
                           +             '<th></th>'
                           +             '<th>Tangible Assets</th>'
                // Providing for years
        $.each(projectionYearsList, function (index, projectionYear) {
            strTableInner  +=            '<th class="text-right">' + projectionYear + '<span class="span-currency"></span>' + '</th>'
                           +             '<th class="text-center"> Month of Addition</th>'
        })
            strTableInner  +=            '<th class="text-right">Depreciation Rate (%)</th>'
            strTableInner  +=       '</tr>'
                           +'</thead>'
                           +'<tbody>'
                           +'</tbody>';
        $('#tbl_assumptions_usage_tangible_assets').append(strTableInner);
        // Get table rows:
        $.each(tangibleAssetsList, function (index, assetName) {
            var rowHtml = generateUsageTangibleAssetsTableRow(assetName);
            $('#tbl_assumptions_usage_tangible_assets tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('.action-delete-row').unbind('click');
        $('.action-delete-row').click(deleteRowEventHandler);

        // Show div section
        $('#div_assumptions_usage_tangible_assets').css('display','block');
    }

    function generateUsageInTangibleAssetsTableRow(assetName){
        assetName = (typeof assetName !== 'undefined') ?  assetName : '';
        var rowId = $('#tbl_assumptions_usage_intangible_assets tbody').children('tr').length + 1;
        var assetNameId = 'assumptions_usage_intangible_assets' + rowId;
        var strRowHtml  = '<tr data-row_id="' + assetNameId + '">'
                        +       '<td class="td-action td-input">'
                            +       '<button type="button" class="btn btn-transparent action-danger action-delete-row" title="Delete row" data-toggle="confirmation"'
                        +               'data-btn-ok-label="Continue" data-btn-ok-class="btn-success"'
                        +               'data-btn-cancel-label="Cancel!" data-btn-cancel-class="btn-danger"'
                        +               'data-title="Delete Operation Cost Row?" data-content="This action cannot be reversed and can lead to data loss.">'
                        +               '<i class="fa fa-times fa-2x" style="font-size:16px" aria-hidden="true"></i>'
                        +           '</button>'
                        +       '</td>'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control " name="' + assetNameId + '" value="' + assetName + '" placeholder="" value="" required="required" >'
                        +        '</td>'
        $.each(projectionYearsList, function (index, projectionYear) {
            var inputName = assetName + '_' + projectionYear;
            var investmentMonth = inputName + '_investment_month'

            var intangibleAssetUsageChangedClassText = ' intangible-assets-changed ';
            strRowHtml +=       '<td class="'+ projectionYear +' amount_added td-input td-sm ' + intangibleAssetUsageChangedClassText +'">'
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" placeholder="" required="required">'
                       +        '</td>'
                       +        '<td class="'+ projectionYear + ' month_added td-input td-sm">'
                       +            '<select class="form-control text-center" name="' + investmentMonth + '" required="required">'
            $.each(getMonthsListForYear(projectionYear, false), function (monthIndex, projectionMonth) {
                strRowHtml +=             '<option value="'+ monthIndex +'">'+ projectionMonth['display'] +'</option>'
            })
            strRowHtml +=           '</select>'
                       +        '</td>'
        });
            strRowHtml +=   '</tr>'
        return strRowHtml;
    }

    function generateUsageInTangibleAssetsTable(){
        if(!$('#tbl_assumptions_usage_intangible_assets').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_usage_intangible_assets" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_usage_intangible_assets');
        }
        var strTableInner = '<caption style="color: #73879C;"><label class="control-label">Usage: Investment in Intangible Fixed Assets</label></caption>'
                           + '<thead>'
                           +       '<tr>'
                           +             '<th></th>'
                           +             '<th>Intangible Assets</th>'
                // Providing for years
        $.each(projectionYearsList, function (index, projectionYear) {
            strTableInner  +=            '<th class="text-right" >' + projectionYear + '<span class="span-currency"></span>' + '</th>'
                           +             '<th class="text-center"> Month of Addition</th>'
        })
            strTableInner  +=       '</tr>'
                           +'</thead>'
                           +'<tbody>'
                           +'</tbody>';
        $('#tbl_assumptions_usage_intangible_assets').append(strTableInner);
        // Get table rows:
        $.each(intangibleAssetsList, function (index, assetName) {
            var rowHtml = generateUsageInTangibleAssetsTableRow(assetName);
            $('#tbl_assumptions_usage_intangible_assets tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('#tbl_assumptions_usage_intangible_assets .action-delete-row').unbind('click');
        $('#tbl_assumptions_usage_intangible_assets .action-delete-row').click(deleteRowEventHandler);

    }

    function generateUsageDepositsTableRow(depositItemName){
        depositItemName = (typeof depositItemName !== 'undefined') ?  depositItemName : '';
        var rowId = $('#tbl_assumptions_usage_deposits tbody').children('tr').length + 1;
        var depositItemNameId = 'assumptions_usage_deposits' + rowId;
        var inputName = depositItemNameId + '_' + firstFinancialYear;
        var strRowHtml  = '<tr data-row_id="' + depositItemNameId + '">'
                        +       '<td class="td-action td-input">'
                            +       '<button type="button" class="btn btn-transparent action-danger action-delete-row" title="Delete row" data-toggle="confirmation"'
                        +               'data-btn-ok-label="Continue" data-btn-ok-class="btn-success"'
                        +               'data-btn-cancel-label="Cancel!" data-btn-cancel-class="btn-danger"'
                        +               'data-title="Delete Operation Cost Row?" data-content="This action cannot be reversed and can lead to data loss.">'
                        +               '<i class="fa fa-times fa-2x" style="font-size:16px" aria-hidden="true"></i>'
                        +           '</button>'
                        +       '</td>'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control" name="' + depositItemNameId + '" value="' + depositItemName + '" placeholder="" required="required" >'
                        +        '</td>'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control number-input-format text-right render_required" name="' + inputName + '" placeholder="" value="" required="required" >'
                        +        '</td>'
                        +   '</tr>'
        return strRowHtml;
    }

    function generateUsageDepositsTable(){
        if(!$('#tbl_assumptions_usage_deposits').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_usage_deposits" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_usage_deposits');
        }
        var strTableInner = '<caption style="color: #73879C;"><label class="control-label">Usage: Deposits</label></caption>'
                           + ' <thead>'
                           +       '<tr>'
                           +             '<th></th>'
                           +             '<th>Deposits</th>'
                           +             '<th class="text-right" >' + firstFinancialYear + '<span class="span-currency"></span>' + '</th>'
                           +        '</tr>'
                           +'</thead>'
                           +'<tbody>'
                           +'</tbody>';
        $('#tbl_assumptions_usage_deposits').append(strTableInner);
        // Get table rows:
        $.each(depositItemList, function (index, depositItemName) {
            var rowHtml = generateUsageDepositsTableRow(depositItemName);
            $('#tbl_assumptions_usage_deposits tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('#tbl_assumptions_usage_deposits .action-delete-row').unbind('click');
        $('#tbl_assumptions_usage_deposits .action-delete-row').click(deleteRowEventHandler);

    }

    function generateUsageOtherStartupCostsTableRow(costName){
        costName = (typeof costName !== 'undefined') ?  costName : '';
        var rowId = $('#tbl_assumptions_usage_other_startup_costs tbody').children('tr').length + 1;
        var costItemNameId = 'assumptions_usage_other_startup_costs' + rowId;
        var inputName = costItemNameId + '_' + firstFinancialYear;
        var strRowHtml  = '<tr data-row_id="' + costItemNameId + '">'
                        +       '<td class="td-action td-input">'
                            +       '<button type="button" class="btn btn-transparent action-danger action-delete-row" title="Delete row" data-toggle="confirmation"'
                        +               'data-btn-ok-label="Continue" data-btn-ok-class="btn-success"'
                        +               'data-btn-cancel-label="Cancel!" data-btn-cancel-class="btn-danger"'
                        +               'data-title="Delete Operation Cost Row?" data-content="This action cannot be reversed and can lead to data loss.">'
                        +               '<i class="fa fa-times fa-2x" style="font-size:16px" aria-hidden="true"></i>'
                        +           '</button>'
                        +       '</td>'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control" name="' + costItemNameId + '" value="' + costName + '" placeholder="" required="required" >'
                        +        '</td>'
                        +       '<td class="td-input td-sm">'
                        +            '<input type="text" class="form-control text-right number-input-format render_required" name="' + inputName + '" placeholder="" value="" required="required" >'
                        +        '</td>'
                        +   '</tr>'
        return strRowHtml;
    }

    function generateUsageOtherStartupCostsTable(){
        if(!$('#tbl_assumptions_usage_other_startup_costs').length){
            $('#frm_bplanner_financial_data_input_page').append('<table id="tbl_assumptions_usage_other_startup_costs" class="table table-bordered table-hover table-dynamic margin-15"></table>')
        }else{
            truncateTable('#tbl_assumptions_usage_other_startup_costs');
        }
        var strTableInner = '<caption style="color: #73879C;"><label class="control-label">Usage: Other Start-up Costs</label></caption>'
                           + ' <thead>'
                           +       '<tr>'
                           +             '<th></th>'
                           +             '<th>Other Startup Costs</th>'
                           +             '<th class="text-right">' + firstFinancialYear + '<span class="span-currency"></span>' + '</th>'
                           +        '</tr>'
                           +'</thead>'
                           +'<tbody>'
                           +'</tbody>';
        $('#tbl_assumptions_usage_other_startup_costs').append(strTableInner);
        // Get table rows:
        $.each(startupCostItemList, function (index, costName) {
            var rowHtml = generateUsageOtherStartupCostsTableRow(costName);
            $('#tbl_assumptions_usage_other_startup_costs tbody').append(rowHtml);
        })

        // Unbind and bind events again
        $('#tbl_assumptions_usage_other_startup_costs .action-delete-row').unbind('click');
        $('#tbl_assumptions_usage_other_startup_costs .action-delete-row').click(deleteRowEventHandler);

    }

    function inputTaxUpperLimitChangeHandler(event){
        var isValidStatus = true;
        var currentSlabKey = taxSlabs['slabCount'];
        $('#btn-add_tax_slab').addClass('disabled');
        $('#span-add_tax_slab_help').text('(You can only add a tax slab when current slab is completed.)')
        // Check if upper limit is greater than lower limit
        var upperLimitTD = $(this).parent();
        var upperLimitInput =$(upperLimitTD).children('input').first();
        var upperLimit = parseInt($(upperLimitInput).val(), 0);

        var lowerLimitTD = $($(upperLimitTD).siblings('.lower-limit'))[0];
        var lowerLimitInput =$(lowerLimitTD).children('input').first();
        var lowerLimit =  parseInt($(lowerLimitInput).val(), 0);

        var taxRateTD = $($(upperLimitTD).siblings('.tax-rate'))[0];
        var taxRateInput =$(taxRateTD).children('input').first();
        var taxRate = parseInt($(taxRateInput).val(),0)
        if(taxRate == null || taxRate == 0){
            isValidStatus = false;
        }

        var differenceTD = $($(upperLimitTD).siblings('.difference'))[0];
        var differenceInput =$(differenceTD).children('input').first();


        var taxTD = $($(upperLimitTD).siblings('.tax'))[0];
        var taxInput =$(taxTD).children('input').first();
        var oldTaxValue = 0;
        if($(taxInput).val() != null  && $(taxInput).val() != ''){
            oldTaxValue = parseInt($(taxInput).val(), 0);
        }


        var cumulativeTaxTD = $($(upperLimitTD).siblings('.cumulative_tax'))[0];
        var cumulativeTaxInput =$(cumulativeTaxTD).children('input').first();
        var currentCumulativeTaxVal = $(cumulativeTaxInput).val() != '' ? parseInt($(cumulativeTaxInput).val()) : 0
        // reset all the computed values
            //1. difference
        $(differenceInput).val('')
            //2. tax
        $(taxInput).val('')

            //3. cumulativeTax
        $(cumulativeTaxInput).val('')
        // validate upper and lower limits
        if(lowerLimit == null ){
            markAsInvalid(lowerLimitInput)
            alert('Invalid upper limit value.: ' + upperLimit)
            isValidStatus = false;
        }else{
            // mark lower limit as valid
            markAsValid(lowerLimitInput)
        }


        if(upperLimit == null){
            markAsInvalid(upperLimitInput)
            alert('Invalid upper limit value.: ' + upperLimit)
            isValidStatus = false;
        }else{
            markAsValid(upperLimitInput)
        }

        if (upperLimit <= lowerLimit){
            // show error and let them know that upper limit cannot be less than lower limit
            alert('Upper limit must be greater than lower limit.')
            $(upperLimitInput).val('')
            markAsInvalid(upperLimitInput)
            // return
            isValidStatus = false;
        }else{
            markAsValid(upperLimitInput)
        }

        // Else upper limit and lower limits are all in order
        // compute difference


        taxSlabs[currentSlabKey]['upperLimit'] = upperLimit;
        taxSlabs[currentSlabKey]['lowerLimit'] = lowerLimit
        var difference = upperLimit - lowerLimit;
        taxSlabs[currentSlabKey]['difference'] = difference
        taxSlabs[currentSlabKey]['taxRate'] = taxRate
        $(differenceInput).val(difference);
        // check if tax rate is set
        if(taxRate == null || isNaN(taxRate) || taxRate == '' || taxRate == 0){
            // set focus to taxrate input
            isValidStatus = false;
        }

        if(!isValidStatus){
            return isValidStatus;
        }
        // new tax
        var newTax = differenceInput * taxRate / 100 ; // Tax rate is in percentage
        $(taxInput).val(newTax);
        taxSlabs[currentSlabKey]['tax'] = newTax;

        // Update cumulative tax val
        var taxDifference = newTax - oldTaxValue;
        if(isNaN(taxSlabs['totalTaxSlabTableCumulativeTax'])){
            taxSlabs['totalTaxSlabTableCumulativeTax'] = 0;
        }
        taxSlabs['totalTaxSlabTableCumulativeTax'] += taxDifference;
        $(cumulativeTaxInput).val(taxSlabs['totalTaxSlabTableCumulativeTax'])
        taxSlabs[currentSlabKey]['cumulativeTax'] = taxSlabs['totalTaxSlabTableCumulativeTax']

        $('#btn-add_tax_slab').removeClass('disabled');
        $('#span-add_tax_slab_help').text('(You can now add a tax slab.)')
    }

    // Handling change in upper liumit
    $('.input-tax-upper-limit').change(inputTaxUpperLimitChangeHandler)

    function inputTaxRateChangeHandler(event){
        var isValidStatus = true;
        // Get current tax slab key
        var currentSlabKey = taxSlabs['slabCount'];

        $('#btn-add_tax_slab').addClass('disabled');
        $('#span-add_tax_slab_help').text('(You can only add a tax slab when current slab is completed.)')
        // Tax rate has chaged.
        var taxRateTD = $(this).parent();
        var taxRateInput =  $(taxRateTD).children('input').first();
        var taxRate = parseInt($(taxRateInput).val(),0)

        if (taxRate == null){
            markAsInvalid(taxRateInput);
            alert('Please provide tax rate for the current tax slab.')
            isValidStatus = false
        }else{
            markAsValid(taxRateInput)
            taxSlabs[currentSlabKey]['taxRate'] = taxRate;
        }

        var upperLimitTD = $($(taxRateTD).siblings('.upper-limit'))[0];
        var upperLimitInput =$(upperLimitTD).children('input').first();
        var upperLimit = parseInt($(upperLimitInput).val(), 0);


        var lowerLimitTD = $($(taxRateTD).siblings('.lower-limit'))[0];
        var lowerLimitInput =$(lowerLimitTD).children('input').first();
        var lowerLimit =  parseInt($(lowerLimitInput).val(), 0);


        var differenceTD = $($(taxRateTD).siblings('.difference'))[0];
        var differenceInput =$(differenceTD).children('input').first();


        var taxTD = $($(taxRateTD).siblings('.tax'))[0];
        var taxInput =$(taxTD).children('input').first();
        var oldTaxValue = $(taxInput).val() != '' ? parseInt($(taxInput).val(), 0) : 0;


        var cumulativeTaxTD = $($(upperLimitTD).siblings('.cumulative_tax'))[0];
        var cumulativeTaxInput =$(cumulativeTaxTD).children('input').first();
        var currentCumulativeTaxVal = $(cumulativeTaxInput).val() != '' ? parseInt($(cumulativeTaxInput).val()) : 0

        // reset all the computed values
        //2. tax

        // validate upper and lower limits
        if(lowerLimit == null ){
            isValidStatus = false;
        }

        if(upperLimit == null){
            isValidStatus = false;
        }


        if (upperLimit <= lowerLimit){
            // show error and let them know that upper limit cannot be less than lower limit
            alert('Upper limit must be greater than lower limit.')
            $(upperLimitInput).val('')
            markAsInvalid(upperLimitInput)
            isValidStatus= false;
        }

        // Else upper limit and lower limits are all in order
        // compute difference
        if(!isValidStatus){
            return isValidStatus;
        }

        taxSlabs[currentSlabKey]['upperLimit'] = upperLimit;
        taxSlabs[currentSlabKey]['lowerLimit'] = lowerLimit;
        var difference = upperLimit - lowerLimit;
        taxSlabs[currentSlabKey]['difference'] = difference
        taxSlabs[currentSlabKey]
        var newTax = difference * taxRate / 100; // Tax rate is in percentage
        $(taxInput).val(newTax);
        taxSlabs[currentSlabKey]['tax'] = newTax;



        // Update cumulative tax val
        var taxDifference = newTax - oldTaxValue;
        if(isNaN(taxSlabs['totalTaxSlabTableCumulativeTax'])){
            taxSlabs['totalTaxSlabTableCumulativeTax'] = 0;
        }
        taxSlabs['totalTaxSlabTableCumulativeTax'] += taxDifference;
        taxSlabs[currentSlabKey]['cumulativeTax'] = taxSlabs['totalTaxSlabTableCumulativeTax']

        $(cumulativeTaxInput).val(taxSlabs['totalTaxSlabTableCumulativeTax'])

        $('#btn-add_tax_slab').removeClass('disabled');
        $('#span-add_tax_slab_help').text('(You can now add a tax slab.)')

    }

    $('.input-tax-rate').change(inputTaxRateChangeHandler)

    function generateTaxSlabTableRow(){
        var rowCount = $('#tbl_assumptions_tax_slabs tbody').children('tr').length;

        // Before generating a new row, disable the previous row input fields...
        var currentUpperLimitTD = $($('#tbl_assumptions_tax_slabs_' + rowCount).children('.upper-limit'))[0];
        $(currentUpperLimitTD).addClass('readonly')
        var currentUpperLimitInput = $($(currentUpperLimitTD).children('input'))[0]
        $(currentUpperLimitInput).attr('readonly', 'true')

        var currentTaxRateTD = $($('#tbl_assumptions_tax_slabs_' + rowCount).children('.tax-rate'))[0];
        $(currentTaxRateTD).addClass('readonly')
        var currentTaxRateInput = $($(currentTaxRateTD).children('input'))[0]
        $(currentTaxRateInput).attr('readonly', 'true')
        // End of disabling input in previous row field

        var currentUpperLimit = $($($('#tbl_assumptions_tax_slabs_' + rowCount).children('td')[2]).children('input')[0]).val()
        if(currentUpperLimit == null || currentUpperLimit == ''){
            return -1;
        }
        var newLowerLimit = parseFloat(currentUpperLimit) + 1;
        // Set new min upper limit
        var minUpperLimit = newLowerLimit + 1;
        var rowId = rowCount + 1;
        var taxSlabTRId = 'tbl_assumptions_tax_slabs_' + rowId;
        var taxSlabLowerTD = taxSlabTRId + '_lower';
        var taxSlabUpperTD = taxSlabTRId + '_upper';
        var taxRateTD = taxSlabTRId + '_rate';
        var differenceTD =  taxSlabTRId + '_difference';
        var taxTD = taxSlabTRId + '_tax';
        var taxCumulativeTD = taxSlabTRId + '_cumulative_tax'
        var strRowHtml = '<tr id="'+ taxSlabTRId +'">'
                       +     '<td class="td-action td-input">'
                       +           '<button type="button" class="btn btn-transparent action-danger action-delete-row" title="Delete row" data-toggle="confirmation"'
                       +               'data-btn-ok-label="Continue" data-btn-ok-class="btn-success"'
                       +               'data-btn-cancel-label="Cancel!" data-btn-cancel-class="btn-danger"'
                       +               'data-title="Delete Operation Cost Row?" data-content="This action cannot be reversed and can lead to data loss.">'
                       +               '<i class="fa fa-times fa-2x" style="font-size:16px;" aria-hidden="true"></i>'
                       +           '</button>'
                       +       '</td>'
                       +     '<td class="td-input readonly lower-limit">'
                       +         '<input type="number" class="form-control text-right input-tax-lower-limit"  placeholder="" min="0" value="'+ newLowerLimit +'" readonly>'
                       +     '</td>'
                       +     '<td class="td-input upper-limit">'
                       +         '<input type="number" class="form-control text-right input-tax-upper-limit" placeholder="" min="'+ newLowerLimit +'">'
                       +     '</td>'
                       +     '<td class="td-input tax-rate">'
                       +         '<input type="number" class="form-control text-right input-tax-rate" placeholder="" min="0">'
                       +     '</td>'
                       +     '<td class="td-input readonly difference">'
                       +         '<input type="number" class="form-control input-md text-right" min="0" readonly>'
                       +     '</td>'
                       +     '<td class="td-input readonly tax">'
                       +         '<input type="number" class="form-control input-md text-right" min="0" readonly>'
                       +     '</td>'
                       +     '<td class="td-input readonly cumulative_tax">'
                       +         '<input type="number" class="form-control input-md text-right" name="'+ taxCumulativeTD +'" min="0" readonly>'
                       +     '</td>'
                       + '</tr>'

        $('#btn-add_tax_slab').addClass('disabled');
        $('#span-add_tax_slab_help').text('(You can only add a tax slab when current slab is completed.)')

        // Update tax slab object
        var newSlabCount = taxSlabs['slabCount'] + 1;
        taxSlabs['slabCount'] = newSlabCount;
        taxSlabs[newSlabCount] = {
            'lowerLimit': newLowerLimit,
            'upperLimit' : null,
            'taxRate' : null,
            'difference': null,
            'tax' : null,
            'cumulativeTax': null
        }

        return strRowHtml;
    }

    function measurementUnitChangeHandler(event){
        var $currTD = $(this).parent(); // This is what has changed...
        var $currTR = $currTD.parent();
        var productId = $(this).data('product_id');
        // -- Code in this section should happen once
        var pivotMonth = null;
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            if(projectionMonth['order'] == countOfMonthsInFinancialYear){
                pivotMonth = projectionMonth;
                return false;
            }
        })

        var pivotTD = $currTR.children('.' + pivotMonth['display'])[0]; // Get td with correspoding class
        var pivotInput = $(pivotTD).children('input')[0];
        var principalVal = removeCommas($(pivotInput).val());
        principalVal = principalVal != '' ? parseInt(principalVal) : 0;
        var growthRate = parseFloat(products[productId]['growth_rate'] || 0)

        // Get year totals
        // Each td has a year and monthIndex classes
        var $autoFillTDSiblings = $currTD.siblings('.auto-filled');
        $.each($autoFillTDSiblings, function (autoFillTDIndex,autoFillTD) {
            // Check if total col
            var projectionMonthId = $(autoFillTD).data('projection_month_id');
            var isTotalCol = $(autoFillTD).data('is_total_col');
            var autoFillTDInput = $(autoFillTD).children('input')[0];
            if(isTotalCol == 'unit_year-total'){
                var childrenTds = $(autoFillTD).siblings('.' + projectionMonthId);
                var newTotal = 0;
                $.each(childrenTds, function (childTdIndex, childTd) {
                    // Get the total and update input value
                    var childTdInput = $(childTd).children('input')[0];
                    var val = removeCommas($(childTdInput).val());
                    val = val != '' ? parseInt(val, 10) : 0
                    if(val){
                        newTotal += parseInt(val, 10);
                    }
                })

                // Update Input value
                $(autoFillTDInput).val(newTotal.toLocaleString('en'));
                $(autoFillTDInput).attr('value', newTotal.toLocaleString('en'));
            }else{
                // Process non-total autofill co
                var currProjectionMonth = projectionMonthsList[projectionMonthId];
                // Get our t Value to feed into the equation
                var t = currProjectionMonth['order'] - pivotMonth['order'];
                //console.log("Value of t: " + t);

                if(!principalVal || principalVal == '' || principalVal == 0 ){
                    //console.log("Principal: " + principalVal)
                    return; // This is a simple continue to the next iteration command
                }

                var newVal = Math.ceil(calculateCompoundedGrowth(principalVal, growthRate/100, 1, t));
                $(autoFillTDInput).val(newVal.toLocaleString('en'));
                $(autoFillTDInput).attr('value', newVal.toLocaleString('en'));
            }
        })

        $(this).attr('value', $(this).val());
    }

    function productDetailsChangeHandler(event){
        // Check if currentProductId is in products
        var propAffected = $(this).data('prop_affected');
        var productId = $(this).data('product_id');
        var newVal = $(this).val();
        if(!products[productId])
            products[productId] = {}; // Create a new instance of product id
        // Update value in products variable
        products[productId][propAffected] = newVal;
        $(this).attr('value', $(this).val());
    }

    function productPriceChangeHandler(event) {
        var principalVal = removeCommas($(this).val())
        principalVal = principalVal != '' ? parseFloat(principalVal) : 0;
        var productId = $(this).data('product_id');
        var growthRate = parseFloat(products[productId]['growth_rate'], 0);
        // Get siblings...
        var autoFillTds = $(this).parent().siblings('.auto-filled'); // Give's you td's within same row with auto-fill class
        $.each($(autoFillTds), function (index, val) {
            // Get the first child
            var inputField = $(val).children('input')[0]; // First input field
            // Check year
            var dtYear = $(inputField).data('projection_year');
            var dtYearIndex = projectionYearsList.indexOf(dtYear);
            // Check compounding formula
            var newVal = Math.round(calculateCompoundedGrowth(principalVal, (growthRate / 100), 1, dtYearIndex) * 100)/100 ;
            // Update new value
            $(inputField).val(newVal.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
            $(inputField).attr('value', newVal.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
        })
        $(this).attr('value', $(this).val());
    }

    function productCostChangeHandler(event){
        $(this).attr('value', $(this).val());
    }

    function operatingCostChangeHandler(event){
        $(this).attr('value', $(this).val());
        // Operating cost changed
        var inflationRate = parseFloat($('#id_inflation_rate').val())/100;
        var principal = removeCommas($(this).val()); // Get's the value or zero
        var principal = principal != '' ? parseFloat(principal) : 0; // Get's the value or zero
        // get auto filled tds
        var currentTD = $(this).parent();
        var autoFillTDs = $(currentTD).siblings('.auto-filled');
        $.each(autoFillTDs, function (tdIndex, autofillTD) {
            // compute compounded growth
            var compoundedGrowth = Math.round(calculateCompoundedGrowth(principal, inflationRate, 1, (tdIndex + 1)) * 100)/100;
            // Update dt value
            var currentInput = $(autofillTD).children('input')[0];
            $(currentInput).val(compoundedGrowth.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}))
        })
    }

    function employeeHourlyRateChangeHandler(event){
        $(this).attr('value', $(this).val());
        // Operating cost changed
        var salaryGrowthRate = parseFloat($('#id_salary_growth_rate').val()) / 100;
        var principal = removeCommas($(this).val()); // Get's the value or zero
        principal = principal != '' ? parseFloat(principal) : 0; // Get's the value or zero
        // get auto filled tds
        var currentTD = $(this).parent();
        var autoFillTDs = $(currentTD).siblings('.auto-filled');
        $.each(autoFillTDs, function (tdIndex, autofillTD) {
            // compute compounded growth
            var compoundedGrowth = Math.round(calculateCompoundedGrowth(principal, salaryGrowthRate, 1, (tdIndex + 1)) * 100)/100;
            // Update dt value
            var currentInput = $(autofillTD).children('input')[0];
            $(currentInput).val(compoundedGrowth.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}))
        })
    }

    function deleteRowEventHandler(event){
        // This happended from button within td
        // Check table id
        var row = $(this).closest('tr');
        var tableId = $(this).closest('table').attr('id');
        if(tableId == 'tbl_assumptions_employee_roles_list'){
            // cascade delete corresponding trs for
            // 1. tbl_assumptions_employees_working_hours
            // 2. tbl_assumptions_employees_hourly_rates
            var roleId = $(row).attr('id');
            $('#tbl_assumptions_employees_working_hours tr.' + roleId).remove();
            $('#tbl_assumptions_employees_hourly_rates tr.' + roleId).remove();
        }else if(tableId == 'tbl_assumptions_tax_slabs'){
            // adjust totalCumulativeTaxValue by the amount of tax
            var rowCount = $('#tbl_assumptions_tax_slabs tbody').children('tr').length;
            var taxTD = $($('#tbl_assumptions_tax_slabs_' + rowCount).children('.tax'))[0];
            var taxInput = $($(taxTD).children('input'))[0]
            var currentTax = $(taxInput).val() != '' ? parseInt($(taxInput).val(), 0) : 0
            // get current tax slab and remove
            var currentTaxSlabKey = taxSlabs['slabCount'];
            delete taxSlabs[currentTaxSlabKey]; // does the deletion
            taxSlabs['slabCount'] -= 1;
            taxSlabs['totalTaxSlabTableCumulativeTax'] -= currentTax;
        }

        $(row).remove();

        //Look for any other necessary action after that!!
        if(tableId == 'tbl_assumptions_tax_slabs'){
            // Need to enable what was disabled after removing
            var rowCount = $('#tbl_assumptions_tax_slabs tbody').children('tr').length;
            var currentUpperLimitTD = $($('#tbl_assumptions_tax_slabs_' + rowCount).children('.upper-limit'))[0];
            $(currentUpperLimitTD).removeClass('readonly')
            var currentUpperLimitInput = $($(currentUpperLimitTD).children('input'))[0]
            $(currentUpperLimitInput).attr('readonly', false)

            var currentTaxRateTD = $($('#tbl_assumptions_tax_slabs_' + rowCount).children('.tax-rate'))[0];
            $(currentTaxRateTD).removeClass('readonly')
            var currentTaxRateInput = $($(currentTaxRateTD).children('input'))[0]
            $(currentTaxRateInput).attr('readonly', false)

            // Re-enable addition of row
            $('#btn-add_tax_slab').removeClass('disabled');
            $('#span-add_tax_slab_help').text('(You can now add a tax slab.)')
        }
    }

    function  calculateCompoundedGrowth(principal, rate, numberOfTimesCompoundedPerYear, timeInYears){
        // rate is given in decimal and not percentage
        var nt = numberOfTimesCompoundedPerYear * timeInYears;
        var innerBracket = 1 + Math.round((rate/numberOfTimesCompoundedPerYear) * 100)/100
        return principal * Math.pow(innerBracket, nt); //  Whole numbers always returned
    }

    $('#btn-generate_pricing_tables').click(function(event){
        // Handle changes in years of projection
        // Check if years all required details are provided
        // Check that all required details are provided
        var requiredFinance1Inputs = $('#finance-1 input,textarea,select').filter('[required]:visible');
        var validated = true;
        $.each(requiredFinance1Inputs, function(index, val){
            var itemVal = $(val).val();
            if(!itemVal || itemVal == ''){
                // Change css and give a red border
                $(val).css('border','red solid 3px');
                validated = false;
            }
        })
        if(!validated){
            return;
        }

        // Everything is cool, and validated, so far.
        // Moving to step 2 of input entry!

        // generate projectionYearsList
        generatePrijectionYearsList();
        generateProjectionMonthsList();

        //console.log(projectionYearsList);
        generatePricePerProductTable();
        generateDirectCostPerProductTable();
        generateUnitOfRevenueMeasurementTable();

        // Generate Operational costs table
        generateOperatingCostsTable();
        //console.log("Generate pricing tables btn has been clicked");

        // Generating employee tables
        generateEmployeeRolesListTable();
        generateEmployeeWorkingHoursTable();
        generateEmployeeHourlyRatesTable();

        // Generating sources tables
        generateCapitalTable();
        generateUsageTangibleAssetsTable();
        generateUsageInTangibleAssetsTable();

        generateUsageDepositsTable();
        generateUsageOtherStartupCostsTable();

    })
    $('.product-change').change(productDetailsChangeHandler);
    $('.price-change').change(productPriceChangeHandler);
    $('.cost-change').change(productCostChangeHandler);
    $('.operating-cost-change').change(operatingCostChangeHandler);
    $('.hourly-rate-change').change(employeeHourlyRateChangeHandler);
    $('.table-footer button').click(function(event){
        // Get nearest table
        var tableFooter = $(this).closest('.table-footer');
        var targetTableId = $(tableFooter).data('table');
        if(targetTableId == '#tbl_assumptions_operating_costs'){
            // Assumptions operating cost table
            var rowHtml = generateOperatingTableRow();
            $('#tbl_assumptions_operating_costs tbody').append('<tr>' + rowHtml + '</tr>');
            $('#tbl_assumptions_operating_costs .action-delete-row').unbind('click');
            $('#tbl_assumptions_operating_costs .action-delete-row').click(deleteRowEventHandler);

            // Unbind bind change events
            $('.operating-cost-change').unbind('change');
            $('.operating-cost-change').change(operatingCostChangeHandler);

        }else if(targetTableId == '#tbl_assumptions_employees_list'){
            // Employee details table row addition

            // This affects 2 more tables, namely
            //#tbl_assumptions_employees_details_working_hours
            //#tbl_assumptions_employees_details_hourly_rates

            var costRowHtml = '';
            $('#tbl_assumptions_employee_roles_list tbody').append('<tr>' + costRowHtml + '</tr>');
            $('#tbl_assumptions_employee_roles_list .action-delete-row').unbind('click');
            // NOTE THAT MORE EVENTS WILL BE UNBOUD AGAIN
            $('#tbl_assumptions_employee_roles_list .action-delete-row').click(deleteRowEventHandler);

            //-- #tbl_assumptions_employees_details_working_hours
            var workingHoursRowHtml = '';
            $('#tbl_assumptions_employees_working_hours tbody').append('<tr>' + workingHoursRowHtml + '</tr>');
            $('#tbl_assumptions_employees_working_hours .action-delete-row').unbind('click');
            // NOTE THAT MORE EVENTS WILL BE UNBOUD AGAIN
            $('#tbl_assumptions_employees_working_hours .action-delete-row').click(deleteRowEventHandler);

            //-- #tbl_assumptions_employees_details_hourly_rates
            var hourlyRateRowHtml = '';
            $('#tbl_assumptions_employees_hourly_rates tbody').append('<tr>' + workingHoursRowHtml + '</tr>');
            $('#tbl_assumptions_employees_hourly_rates .action-delete-row').unbind('click');
            // NOTE THAT MORE EVENTS WILL BE UNBOUD AGAIN
            $('#tbl_assumptions_employees_hourly_rates .action-delete-row').click(deleteRowEventHandler);
        }else if(targetTableId == '#tbl_assumptions_usage_tangible_assets'){
            // Tangible assets table

            var rowHtml = generateUsageTangibleAssetsTableRow();
            $('#tbl_assumptions_usage_tangible_assets tbody').append('<tr>' + rowHtml + '</tr>');
            $('#tbl_assumptions_usage_tangible_assets .action-delete-row').unbind('click');
            $('#tbl_assumptions_usage_tangible_assets .action-delete-row').click(deleteRowEventHandler);
        }else if(targetTableId == '#tbl_assumptions_usage_intangible_assets'){
            var rowHtml = generateUsageInTangibleAssetsTableRow();
            $('#tbl_assumptions_usage_intangible_assets tbody').append('<tr>' + rowHtml + '</tr>');
            $('#tbl_assumptions_usage_intangible_assets .action-delete-row').unbind('click');
            $('#tbl_assumptions_usage_intangible_assets .action-delete-row').click(deleteRowEventHandler);
        }else if(targetTableId == '#tbl_assumptions_usage_deposits'){
            var rowHtml = generateUsageDepositsTableRow();
            $('#tbl_assumptions_usage_deposits tbody').append('<tr>' + rowHtml + '</tr>');
            $('#tbl_assumptions_usage_deposits .action-delete-row').unbind('click');
            $('#tbl_assumptions_usage_deposits .action-delete-row').click(deleteRowEventHandler);
        }else if(targetTableId == '#tbl_assumptions_usage_other_startup_costs'){
            var rowHtml = generateUsageOtherStartupCostsTableRow();
            $('#tbl_assumptions_usage_other_startup_costs tbody').append('<tr>' + rowHtml + '</tr>');
            $('#tbl_assumptions_usage_other_startup_costs .action-delete-row').unbind('click');
            $('#tbl_assumptions_usage_other_startup_costs .action-delete-row').click(deleteRowEventHandler);
        }else if(targetTableId == '#tbl_assumptions_tax_slabs'){
            var rowHtml = generateTaxSlabTableRow();
            if(rowHtml == -1)
                return;
            $('#tbl_assumptions_tax_slabs tbody').append($(rowHtml));

            // Unbind and bind click event
            $('#tbl_assumptions_tax_slabs .action-delete-row').unbind('click');
            $('#tbl_assumptions_tax_slabs .action-delete-row').click(deleteRowEventHandler);

            // Unbind and bind change event
            $('#tbl_assumptions_tax_slabs .input-tax-upper-limit').unbind('change');
            $('#tbl_assumptions_tax_slabs .input-tax-upper-limit').change(inputTaxUpperLimitChangeHandler);

            $('#tbl_assumptions_tax_slabs .input-tax-rate').unbind('change');
            $('#tbl_assumptions_tax_slabs .input-tax-rate').change(inputTaxRateChangeHandler);
        }


    });
    $('.action-delete-row').click(deleteRowEventHandler);


    $('#btn_pnl_test').click(function (event) {
        generatePNL_RevenuesTable();
        generateAmortizationSchedule();
    })
//    Beginning of reporting
    //Monthly Summary P&L
    // This is divided into 3 main tables and a summaries section
    // Table 1- PNL_RevenuesTable
    /*
    * Picks it's details from 2 tables
    * 1. tbl_assumptions_price_per_product:- contains price per unit
    * 2. tbl_assumptions_units_of_measurement_per_product :- contains projected Units
    * Eac row is a result of price_per_unit_product * units for the month
     */

    // Get price per product
    function getPricePerProductPerYear(){
        var pricePerProductPerYearDict = {}
        var priceTableRows = $('#tbl_assumptions_price_per_product tbody tr');
        $.each(priceTableRows, function (index, row) {
            // We're into each product
            var productId = $(row).data('product_id');
            pricePerProductPerYearDict[productId] = {}
            // Get yearly prices
            // Each of td's with yearly prices
            $.each($(row).children('.yearly'), function (yearlyTDIndex, yearlyTD) {
                // Get projection_year data
                var year = $(yearlyTD).data('projection_year');
                // get price val
                var priceInput = $(yearlyTD).children('input')[0]
                var price = removeCommas($(priceInput).val())
                pricePerProductPerYearDict[productId][year] = parseInt(price);
            })
        })

        return pricePerProductPerYearDict;
    }

    function getRevenueTotalsPerYear(revenueTotals){
        var revenueTotalsPerYearDict = {};
        $.each(revenueTotals, function (monthIndex, revenueAmount) {
            var projectionMonth = projectionMonthsList[monthIndex];
            if(projectionMonth['is_total']){
                // Total month found.. Get the value
                revenueTotalsPerYearDict[projectionMonth['year']] = revenueAmount;
            }
        })

        return revenueTotalsPerYearDict;
    }

    function getReceivablesTotalsPerYear(revenueTotalsPerYear){
        var receivableTotalsPerYearDict = {};
        // Receivables total = revenueTotals x Receivables Period/ Number of months in a year
        var receivablesPeriod = parseFloat($('#id_trade_receivables').val() || 0);
        $.each(revenueTotalsPerYear, function (projectionYear, revenueAmount) {
            receivableTotalsPerYearDict[projectionYear] = revenueAmount * receivablesPeriod / countOfMonthsInFinancialYear;
        })

        return receivableTotalsPerYearDict;
    }

    function getReceivablesPerMonth(receivableTotalsPerYear){
        var receivablePerMonthDict = {};
        // Remember the formula... CurrentYear - Previous Year / # of months
        var previousReceivables = 0;
        $.each(receivableTotalsPerYear, function (projectionYear, receivableTotalAmount) {
            // Get projection Months in year
            var projectionMonths = getMonthsListForYear(projectionYear, true);
            // We have the months including the total column
            var difference = receivableTotalAmount - previousReceivables;
            $.each(projectionMonths, function (monthIndex, projectionMonth) {
                if(projectionMonth['is_total']){
                    // Handle the totals section
                    receivablePerMonthDict[monthIndex] = difference
                }else{
                    // Handle individual month sections
                    receivablePerMonthDict[monthIndex] = difference/ countOfMonthsInFinancialYear;
                }
            })
            previousReceivables = receivableTotalAmount;
        })
        return receivablePerMonthDict;
    }

    /*
    Payables functions
     */
    function getDirectCostTotalsPerYear(directCostTotals){
        var directCostTotalsPerYearDict = {}
        $.each(directCostTotals, function (monthIndex, directCostAmount) {
            var projectionMonth = projectionMonthsList[monthIndex];
            if(projectionMonth['is_total']){
                // Total month found.. Get the value
                directCostTotalsPerYearDict[projectionMonth['year']] = directCostAmount;
            }
        })

        return directCostTotalsPerYearDict;
    }

    function getPayableTotalsPerYear(directCostTotalsPerYear){
        var payableTotalsPerYearDict = {}
        // Receivables total = revenueTotals x Receivables Period/ Number of months in a year
        var payablesPeriod = parseInt($('#id_trade_payables').val(), 10);
        $.each(directCostTotalsPerYear, function (projectionYear, directCostAmount) {
            payableTotalsPerYearDict[projectionYear] = directCostAmount * payablesPeriod / countOfMonthsInFinancialYear;
        })
        return payableTotalsPerYearDict;
    }

    function getPayablesPerMonth(payableTotalsPerYear){
        var payablesPerMonthDict = {}
        var previousYearPayables = 0;
        $.each(payableTotalsPerYear, function (projectionYear, payableTotalAmount) {
            // Get projection Months in year
            var projectionMonths = getMonthsListForYear(projectionYear, true);
            // We have the months including the total column
            var difference = previousYearPayables - payableTotalAmount;
            $.each(projectionMonths, function (monthIndex, projectionMonth) {
                if(projectionMonth['is_total']){
                    // Handle the totals section
                    payablesPerMonthDict[monthIndex] = difference;
                }else{
                    // Handle individual month sections
                    payablesPerMonthDict[monthIndex] = Math.round(difference / countOfMonthsInFinancialYear * 100)/100;
                }
            })
            previousYearPayables = payableTotalAmount;
        })
        return payablesPerMonthDict;
    }

    /*
    Other Payables per month section
     */

    function computeRevenueTotalsPerMonth(){
        var unitsPerProductPerMonth = getUnitsPerProductPerMonth()
        var pricePerProductPerYear = getPricePerProductPerYear();
        var revenueTotals = {}
        $.each(unitsPerProductPerMonth, function (productIdIndex, productMonthlyUnits) {
            // Inside each product
            $.each(productMonthlyUnits, function (monthIndex, monthlyUnit) {
                // Inside each monthly context
                if (revenueTotals[monthIndex] == null) {
                    revenueTotals[monthIndex] = 0
                }

                var year = monthlyUnit['year']
                var yearlyPrice = parseInt(pricePerProductPerYear[productIdIndex][year], 0);
                var units = parseInt(monthlyUnit['units'], 0);
                var revenue = yearlyPrice * units;
                revenueTotals[monthIndex] += revenue;
            })
        })
        return revenueTotals;
    }

    function computeEmployeeCostTotalsPerMonth(){
        var employeeCostTotals = {};
        var employeeCostPerMonth = getEmployeeCostPerMonth();
        $.each(employeeCostPerMonth, function (employeeRoleIndex, employeeRoleCost) {
            $.each(employeeRoleCost['projection_months'], function (monthIndex, employmentCost) {
                if(employeeCostTotals[monthIndex] == null){
                    employeeCostTotals[monthIndex] = 0;
                }
                employeeCostTotals[monthIndex] += employmentCost;
            })
        })
        return employeeCostTotals;
    }

    function getOperatingCostPerMonth(){
        //var operatingCostPerYearDict = {}
        try {

            // pre- computed values
            //1. Revenue totals per year
            var revenueTotalsPerMonth = computeRevenueTotalsPerMonth();
            //2. Employee totals per month
            var employeeCostTotalsPerMonth = computeEmployeeCostTotalsPerMonth();

            var operatingCostPerMonthDict = {};
            var operatingCostTableRows = $('#tbl_assumptions_operating_costs tbody tr');
            $.each(operatingCostTableRows, function (operatingCostTRIndex, operatingCostTR) {
                var operatingCostId = $(operatingCostTR).data('row_id');
                operatingCostPerMonthDict[operatingCostId] = {}
                // Getting operating cost details
                // 1. Opearing cost name
                var opearingCostNameTD = $(operatingCostTR).children('td.operating_cost_name')[0]
                var opearingCostNameInput = $(opearingCostNameTD).children('input')[0]
                var opearingCostName = $(opearingCostNameInput).val();
                operatingCostPerMonthDict[operatingCostId]['name'] = opearingCostName;
                operatingCostPerMonthDict[operatingCostId]['monthly'] = {}
                // 2. Costing period
                var costingPeriodTD = $(operatingCostTR).children('td.costing_period')[0]
                var opearingCostNameInput = $(costingPeriodTD).children('select')[0]
                var costingPeriod = parseInt($(opearingCostNameInput).val(), 10);
                // 3. Cost values
                if (costingPeriod == 0)
                {
                    // per month
                    var costTds = $(operatingCostTR).children('td.cost');
                    $.each(costTds, function (costTDIndex, costTD) {
                        // For each of the cost items
                        // Get year and value
                        var year = $(costTD).data('projection_year');
                        var costInput = $(costTD).children('input')[0];
                        var cost = parseInt(removeCommas($(costInput).val()), 10);
                        var months = getMonthsListForYear(year + "", true);
                        var total = 0;
                        $.each(months, function (monthIndex, month) {
                            if (month['is_total']) {
                                // Total item
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = total;
                                total = 0;
                            } else {
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = cost;
                                total += cost;
                            }

                        })

                    })
                }
                else if (costingPeriod == 1)
                {
                    // Per year
                    var costTds = $(operatingCostTR).children('td.cost');
                    $.each(costTds, function (costTDIndex, costTD) {
                        // For each of the cost items
                        // Get year and value
                        var year = $(costTD).data('projection_year');
                        var costInput = $(costTD).children('input')[0];
                        var cost = parseInt(removeCommas($(costInput).val()), 10); // This should be replicated everywhere.. Return 0 if value is non or undefined
                        var costPerMonth = cost / 12
                        var months = getMonthsListForYear(year + "", true);
                        var total = 0;
                        $.each(months, function (monthIndex, month) {
                            if (month['is_total']) {
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = total;
                                total = 0
                            } else {
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = costPerMonth;
                                total += costPerMonth
                            }

                        })

                    })
                }
                else if (costingPeriod == 2)
                {
                    // % of revenue
                    var costTds = $(operatingCostTR).children('td.cost');
                    $.each(costTds, function (costTDIndex, costTD) {
                        // For each of the cost items
                        // Get year and value
                        var year = $(costTD).data('projection_year');
                        var costInput = $(costTD).children('input')[0];
                        var percentage = parseFloat(removeCommas($(costInput).val())); // This should be replicated everywhere.. Return 0 if value is non or undefined

                        // Get all months belonging to this year
                        var months = getMonthsListForYear(year + "", true);
                        var total = 0;
                        $.each(months, function (monthIndex, month) {
                            if (month['is_total']) {
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = total;
                                total = 0
                            } else {
                                var amount = Math.round(revenueTotalsPerMonth[monthIndex] * percentage) / 100 ;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = amount;
                                total += amount;
                            }

                        })
                    })
                }
                else
                { //if(costingPeriod == 3){
                    // % of employee salary
                    var costTds = $(operatingCostTR).children('td.cost');
                    $.each(costTds, function (costTDIndex, costTD) {
                        // For each of the cost items
                        // Get year and value
                        var year = $(costTD).data('projection_year');
                        var costInput = $(costTD).children('input')[0];
                        var percentage = parseInt(removeCommas($(costInput).val()), 10)
                        var months = getMonthsListForYear(year + "", true);
                        var total = 0;
                        $.each(months, function (monthIndex, month) {
                            if (month['is_total']) {
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = total;
                                total = 0;
                            } else {
                                var amount = Math.round(employeeCostTotalsPerMonth[monthIndex] * percentage) / 100;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex] = {}
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['year'] = year;
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['costing_period'] = costingPeriod
                                operatingCostPerMonthDict[operatingCostId]['monthly'][monthIndex]['cost'] = amount;
                                total += amount;
                            }

                        })

                    })
                }
            })
        }
        catch (error){
            console.log("Error ocurring")
            console.log(error)
        }
        return operatingCostPerMonthDict;
    }

    function getOperatingCostTotalsPeryear(operatingCostPerMonthTotals){
        var operatingCostTotalsPerYearDict = {};
        $.each(operatingCostPerMonthTotals, function (monthIndex, operatingCostTotalAmount) {
            var projectionMonth = projectionMonthsList[monthIndex];
            if(projectionMonth['is_total']){
                // Total month found.. Get the value
                operatingCostTotalsPerYearDict[projectionMonth['year']] = operatingCostTotalAmount;
            }
        })

        return operatingCostTotalsPerYearDict;
    }

    function getOtherExpensesPayableTotalsPerYear(operatingCostTotalsPerYear){
        var otherExpensesPayableTotalsPerYearDict = {};
        var otherExpensesPayablesPeriod = parseFloat(removeCommas($('#id_other_expenses_payables').val()), 10);
        var previousYearPayable = 0;
        $.each(operatingCostTotalsPerYear, function (projectionYear, operatingCostAmount) {
            otherExpensesPayableTotalsPerYearDict[projectionYear] = (previousYearPayable - operatingCostAmount) * otherExpensesPayablesPeriod / countOfMonthsInFinancialYear;
            previousYearPayable = operatingCostAmount;
        })

        console.log('otherExpensesPayableTotalsPerYearDict')
        console.log(otherExpensesPayableTotalsPerYearDict)
        return otherExpensesPayableTotalsPerYearDict;
    }

    function getOtherExpensesPayablePerMonth(otherExpensesPayableTotalsPerYear){
        var otherExpensesPayablePerMonthDict = {};
        $.each(otherExpensesPayableTotalsPerYear, function (projectionYear, otherExpensesPayableTotalAmount) {
            // Get projection Months in year
            var projectionMonths = getMonthsListForYear(projectionYear, true);
            // We have the months including the total column
            $.each(projectionMonths, function (monthIndex, projectionMonth) {
                if(projectionMonth['is_total']){
                    // Handle the totals section
                    otherExpensesPayablePerMonthDict[monthIndex] = otherExpensesPayableTotalAmount;
                }else{
                    // Handle individual month sections
                    otherExpensesPayablePerMonthDict[monthIndex] = otherExpensesPayableTotalAmount / countOfMonthsInFinancialYear;
                }
            })
        })
        console.log('otherExpensesPayablePerMonthDict')
        console.log(otherExpensesPayablePerMonthDict)
        return otherExpensesPayablePerMonthDict;
    }

    /*
        Getting investment in Assets
     */

    function  getAssetsInvestmentDict(isTangibleAssets){
        /*
        assetId : {
            'name': "Computer",
            'depreciation': 10,
            'years': {
                2018: {
                    'amount_added': 50000,
                    'month_added': 'Jan-2018'
                },
                2019: 40000
            }
        }
        */
        var investmentDict = {};
        // Get fixed asset rows
        var assetTRs = isTangibleAssets ? $('#tbl_assumptions_usage_tangible_assets tbody tr') : $('#tbl_assumptions_usage_intangible_assets tbody tr')
        $.each(assetTRs, function (index, assetTr) {
            // Each asset table row..
            // Get rowId
            var assetId = $(assetTr).data('row_id')
            investmentDict[assetId] = {}
            // Get asset name
            var assetNameTD = $(assetTr).children('td')[1];
            var assetNameInput = $(assetNameTD).children('input')[0];
            var assetName = $(assetNameInput).val();
            investmentDict[assetId]['name'] = assetName;

            // get depreciation rate
            var depreciationTD = $(assetTr).children('td').last();
            var depreciationInput = $(depreciationTD).children('input')[0];
            var depreciation = parseFloat(removeCommas($(depreciationInput).val()));
            investmentDict[assetId]['depreciation'] = depreciation;
            investmentDict[assetId]['years'] = {}

            // Iterate through all the projection years
            $.each(projectionYearsList, function (projectionYeadIndex, projectionyear) {
                // We have the year...

                if(investmentDict[assetId]['years'][projectionyear] == null){
                    investmentDict[assetId]['years'][projectionyear] = {}
                }

                var amountTD = $(assetTr).children('td.' + projectionyear + '.amount_added')[0];
                var amountInput = $(amountTD).children('input')[0];
                var amount = parseFloat(removeCommas($(amountInput).val()));
                investmentDict[assetId]['years'][projectionyear]['amount_added'] = amount;

                var monthTD = $(assetTr).children('td.' + projectionyear + '.month_added')[0];
                var monthSelect = $(monthTD).children('select')[0];
                var monthIndex = $(monthSelect).val();
                investmentDict[assetId]['years'][projectionyear]['month_added'] = monthIndex;
            })
        })
        return investmentDict;
    }

    function  getInvestmentPerAssetPerYear(investmentDict){
        var investmentPerAssetPerYearDict = {};
        // Get fixed asset rows

        $.each(investmentDict, function (assetId, assetInvestmentDict) {
            investmentPerAssetPerYearDict[assetId] = {}
            investmentPerAssetPerYearDict[assetId]['name'] = assetInvestmentDict['name'];
            investmentPerAssetPerYearDict[assetId]['years'] = {}
            var cumulativeInvestment = 0;
            $.each(assetInvestmentDict['years'], function (projectionYear, yearInvestmentDict) {
                cumulativeInvestment += yearInvestmentDict['amount_added']
                investmentPerAssetPerYearDict[assetId]['years'][projectionYear] = cumulativeInvestment;
            })
        })
        return investmentPerAssetPerYearDict
    }

    function getInvestmentPerAssetPerMonth(investmentDict){
        var investmentPerAssetPerMonthDict = {}
        $.each(investmentDict, function (assetId, assetInvestmentDict) {
            investmentPerAssetPerMonthDict[assetId] = {}
            investmentPerAssetPerMonthDict[assetId]['name'] = assetInvestmentDict['name'];
            investmentPerAssetPerMonthDict[assetId]['months'] = {};
            // For each of the years
            $.each(assetInvestmentDict['years'], function (investmentYear, yearInvestmentDict) {
                // Get projection months in year, including totals
                var projectionMonths = getMonthsListForYear(investmentYear, true);
                var totalAmount = 0;
                var yearAdded = null;
                $.each(projectionMonths, function (projectionMonthIndex, projectionMonth) {
                    // get year
                    if(yearInvestmentDict['month_added'] == projectionMonthIndex){
                        totalAmount = parseInt(yearInvestmentDict['amount_added'],0)
                        yearAdded = projectionMonth['year'];
                        investmentPerAssetPerMonthDict[assetId]['months'][projectionMonthIndex] = totalAmount;
                    }else{
                        investmentPerAssetPerMonthDict[assetId]['months'][projectionMonthIndex] = 0;
                    }

                    if(projectionMonth['is_total'] && projectionMonth['year'] == yearAdded){
                        investmentPerAssetPerMonthDict[assetId]['months'][projectionMonthIndex] = totalAmount;
                    }

                    // Add value if month== investment month
                })
            })
        })
        return investmentPerAssetPerMonthDict;
    }

    /*
        Share Capital dict
     */
    function getShareCapitalDict(){
        var shareCapitalDict = {};
        var shareCapitalTR = $('#tbl_assumptions_capital tr.tbl_assumptions_capital_1')[0];
        // For each projection year,  get value
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            // year.investment
            // year.month_of_investment
            var year = projectionMonth['year'];

            shareCapitalDict[year] = {}

            var investmentTD = $(shareCapitalTR).children('td.' + year + '.investment')[0];
            var investmentInput = $(investmentTD).children('input')[0];
            var investment = removeCommas($(investmentInput).val());
            investment = investment != '' ?  parseInt(investment) : 0;


            var monthOfInvestmentTD = $(shareCapitalTR).children('td.' + year + '.month_of_investment')[0];
            var monthOfInvestmentSelect = $(monthOfInvestmentTD).children('select')[0];
            var monthOfInvestment = $(monthOfInvestmentSelect).val();

            shareCapitalDict[year]['month_of_investment'] = monthOfInvestment;
            shareCapitalDict[year]['investment'] = investment;
        })
        return shareCapitalDict;
    }

    function getLoanDebtDict(){
        // Structure
        /*
            2018 : {
                'month_of_investment' = 'Jan-2018',
                'investment' = 1000000
            }
         */
        var loanDebtDict = {}
        var loanDebtTR = $('#tbl_assumptions_capital tr.tbl_assumptions_capital_2')[0];
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            // year.investment
            // year.month_of_investment
            var year = projectionMonth['year'];

            loanDebtDict[year] = {}

            var investmentTD = $(loanDebtTR).children('td.' + year + '.investment')[0];
            var investmentInput = $(investmentTD).children('input')[0];
            var investment = removeCommas($(investmentInput).val());
            var investment = investment != '' ?  parseInt(investment) : 0;

            var monthOfInvestmentTD = $(loanDebtTR).children('td.' + year + '.month_of_investment')[0];
            var monthOfInvestmentSelect = $(monthOfInvestmentTD).children('select')[0];
            var monthOfInvestment = $(monthOfInvestmentSelect).val();

            loanDebtDict[year]['month_of_investment'] = monthOfInvestment;
            loanDebtDict[year]['investment'] = investment;
        })

        return loanDebtDict;
    }

    function getCapitalOrDebtInvestmentPerMonth(investmentDict){
        var investmentPerMonthDict = {}
        $.each(investmentDict, function (investmentYear, investmentYearDict) {

            var projectionMonths = getMonthsListForYear(investmentYear, true);  // true to include the totals dict
            var totalAmount = 0;
            var yearAdded = null;
            $.each(projectionMonths, function (projectionMonthIndex, projectionMonth)
            {

                if(investmentYearDict['month_of_investment'] == projectionMonthIndex)
                {
                    totalAmount = investmentYearDict['investment'];
                    investmentPerMonthDict[projectionMonthIndex] = totalAmount;
                    yearAdded= projectionMonth['year'];
                }
                else{
                    investmentPerMonthDict[projectionMonthIndex] = 0;
                }

                if(projectionMonth['is_total'] && projectionMonth['year'] == yearAdded){
                    investmentPerMonthDict[projectionMonthIndex] = totalAmount;
                }
            })

        })
        return investmentPerMonthDict;
    }

    function getDirectCostPerProductPerYear(){
        var directCostPerProductPerYearDict = {}
        var directCostTableRows = $('#tbl_assumptions_direct_cost_per_product tbody tr');
        $.each(directCostTableRows, function (index, row) {
            var productId = $(row).data('product_id')
            directCostPerProductPerYearDict[productId] = {}
            $.each($(row).children('.yearly'), function (yearlyTDIndex, yearlyTD)
            {
                var year = $(yearlyTD).data('projection_year');
                var directCostInput = $(yearlyTD).children('input')[0]
                var cost = removeCommas($(directCostInput).val())
                cost = cost != '' ? parseInt(cost, 10) : 0; // Remember this is the cost percentage
                directCostPerProductPerYearDict[productId][year] = cost
            })
        })

        return directCostPerProductPerYearDict;
    }

    function getUnitsPerProductPerMonth(){
        var unitsPerProductPerMonthDict = {}
        var unitsTableRows = $('#tbl_assumptions_units_of_measurement_per_product tbody tr');
        $.each(unitsTableRows, function (index, row) {
            var productId = $(row).data('product_id');
            unitsPerProductPerMonthDict[productId] = {}
            $.each($(row).children('.monthly'), function (monthlyTDIndex, monthlyTD) {
                var month = $(monthlyTD).data('projection_month_id');
                var year = $(monthlyTD).data('projection_year');
                var unitsInput = $(monthlyTD).children('input')[0];
                var units = removeCommas($(unitsInput).val());
                units = units != '' ? parseInt(units) : 0;
                unitsPerProductPerMonthDict[productId][month] = {}
                unitsPerProductPerMonthDict[productId][month]['units'] = units;
                unitsPerProductPerMonthDict[productId][month]['year'] = year;
            })
        })
        return unitsPerProductPerMonthDict;
    }

    function getEmployeeCostPerMonth(){
        var employeeCostPerMonthDict_Final = {}
        var employeeCostPerMonthDict = {}
        var numberOfEmployeesPerRoleTableRows = $('#tbl_assumptions_employee_roles_list tbody tr');
        $.each(numberOfEmployeesPerRoleTableRows, function (employeeRoleTRIndex, employeeRoleTR) {
            var employeeRoleId = $(employeeRoleTR).data('row_id')
            employeeCostPerMonthDict[employeeRoleId] = {}
            employeeCostPerMonthDict[employeeRoleId]['hours'] = {}
            employeeCostPerMonthDict[employeeRoleId]['rates'] = {}
            // Store year and number
            var roleNameTD = $(employeeRoleTR).children('td.role_name')[0]
            var roleNameInput = $(roleNameTD).children('input')[0]
            var roleName = $(roleNameInput).val()
            // Get number_of_employees td for each year
            var numberTDs = $(employeeRoleTR).children('.number_of_employees')
            // For each numberTD, pick year and val
            employeeCostPerMonthDict[employeeRoleId]['yearly'] = {};
            $.each(numberTDs, function (tdIndex, numberTD) {
                var year = $(numberTD).data('projection_year');
                var numberInput = $(numberTD).children('input')[0];
                var number = removeCommas($(numberInput).val());
                number = number != '' ? parseInt(number) : 0;
                // Store values
                employeeCostPerMonthDict[employeeRoleId]['name'] = roleName;
                employeeCostPerMonthDict[employeeRoleId]['yearly'][year] = number;
            })
        })


        // Adding working hours per month.... Note that this should also be given per year
        var workingHoursPerRoleTableRows = $('#tbl_assumptions_employees_working_hours tr');
        $.each(workingHoursPerRoleTableRows, function (workingHoursTRIndex, workingHoursTR) {
            // get employeeRoleId from data
            var projectionYearIndex = 0;
            var employeeRoleId = $(workingHoursTR).data('row_id');
            var workingHoursTDs = $(workingHoursTR).children('.working_hours')
            $.each(workingHoursTDs, function (tdIndex, workingHoursTD) {
                // get projection year
                var projectionYear = $(workingHoursTD).data('projection_year')
                var workingHoursInput = $(workingHoursTD).children('input')[0]
                var hours = removeCommas($(workingHoursInput).val());
                hours = hours != '' ? parseInt(hours) : 0 ;
                employeeCostPerMonthDict[employeeRoleId]['hours'][projectionYearsList[projectionYearIndex]] = hours;
                projectionYearIndex++;
            })
        })


        // Adding Rate per hour... Note that this should also be given per year
        var hourlyRatesPerRoleTableRows = $('#tbl_assumptions_employees_hourly_rates tr');
        $.each(hourlyRatesPerRoleTableRows, function (hourlyRatesTRIndex, hourlyRatesTR) {
            // Get employeeRoleId
            var projectionYearIndex = 0;
            var employeeRoleId = $(hourlyRatesTR).data('row_id');
            var hourlyRatesTDs = $(hourlyRatesTR).children('.hourly_rate');
            $.each(hourlyRatesTDs, function (tdIndex, hourlyRateTD) {
                // get projection year
                var projectionYear = $(hourlyRateTD).data('projection_year')
                var hourlyRateInput = $(hourlyRateTD).children('input')[0]
                var rate = removeCommas($(hourlyRateInput).val());
                rate = rate != '' ? parseInt(rate) : 0;
                employeeCostPerMonthDict[employeeRoleId]['rates'][projectionYearsList[projectionYearIndex]] = rate;
                projectionYearIndex++;
            })
        })

        // Dividing this into monthly values for all the years
        $.each(employeeCostPerMonthDict, function (employeeRoleId, employeeRoleDetails) {
            employeeCostPerMonthDict_Final[employeeRoleId] = {}
            var name = employeeRoleDetails['name'];

            employeeCostPerMonthDict_Final[employeeRoleId]['name'] = name
            employeeCostPerMonthDict_Final[employeeRoleId]['projection_months'] = {}
            $.each(employeeRoleDetails['yearly'], function(year, number) {
                employeeCostPerMonthDict_Final[employeeRoleId]['year'] = year
                var rate = parseInt(employeeRoleDetails['rates'][year]);
                var hours = parseInt(employeeRoleDetails['hours'][year]);
                var monthCost = hours * rate * parseInt(number);

                // Get the list of month projections for the year
                var yearTotal = 0;
                var projectionMonthsInYear = getMonthsListForYear(year, true);
                // Set values for each month
                $.each(projectionMonthsInYear, function (projectionMonthIndex, projectionMonth) {
                    if (!projectionMonth['is_total']) {
                        // Not total month
                        employeeCostPerMonthDict_Final[employeeRoleId]['projection_months'][projectionMonthIndex] = monthCost
                        yearTotal += monthCost;
                    } else {
                        // Total month
                        employeeCostPerMonthDict_Final[employeeRoleId]['projection_months'][projectionMonthIndex] = yearTotal
                    }
                })
            })
        })

        return employeeCostPerMonthDict_Final;
    }

    function getBadDebtsPerMonth(revenueTotals){
        var badDebtsPerMonthDict = {}
        // Get bad debt percentage
        var badDebtPercentage = $('#id_bad_debts').val() || 0; // Return 0 if value is not provided
        $.each(revenueTotals, function (monthIndex, revenueTotal) {
            badDebtsPerMonthDict[monthIndex] = revenueTotal * badDebtPercentage/100;
        })
        return badDebtsPerMonthDict;
    }

    function getAssetNameFromId(assetId){
        var assetName = '';
        var assetTrs = $('#tbl_assumptions_usage_tangible_assets tbody tr');
        $.each(assetTrs, function (index, assetTR) {
            var rowId = $(assetTR).data('row_id');
            if(rowId == assetId){
                var assetNameTD = $(assetTR).children('td')[1];
                var assetNameInput = $(assetNameTD).children('input')[0];
                assetName = $(assetNameInput).val();
            }
        })
        return assetName;
    }

    function getDepreciationPerAssetPerMonth(){
        // Initially on a straight line basis
        // Needs to be changed to reducing balance basis
        var depreciationSettingsPerYearDict = {}
        var assetTRs = $('#tbl_assumptions_usage_tangible_assets tbody tr');
        $.each(assetTRs, function (index, assetTr) {
            // Each asset table row..
            // Get rowId
            var assetId = $(assetTr).data('row_id')
            depreciationSettingsPerYearDict[assetId] = {}
            // Get asset name
            var assetNameTD = $(assetTr).children('td')[1];
            var assetNameInput = $(assetNameTD).children('input')[0];
            var assetName = $(assetNameInput).val();
            depreciationSettingsPerYearDict[assetId]['name'] = assetName;

            // get depreciation rate
            var depreciationTD = $(assetTr).children('td').last();
            var depreciationInput = $(depreciationTD).children('input')[0];
            var depreciation = removeCommas($(depreciationInput).val());
            depreciation = depreciation != '' ? parseInt(depreciation) : 0;
            depreciationSettingsPerYearDict[assetId]['depreciation'] = depreciation;
            depreciationSettingsPerYearDict[assetId]['years'] = {}

            // Iterate through all the projection years
            $.each(projectionYearsList, function (projectionYeadIndex, projectionyear) {
                // We have the year...

                if(depreciationSettingsPerYearDict[assetId]['years'][projectionyear] == null){
                    depreciationSettingsPerYearDict[assetId]['years'][projectionyear] = {}
                }

                var amountTD = $(assetTr).children('td.' + projectionyear + '.amount_added')[0];
                var amountInput = $(amountTD).children('input')[0];
                var amount = removeCommas($(amountInput).val());
                amount = amount != '' ? parseInt(amount) : 0;
                depreciationSettingsPerYearDict[assetId]['years'][projectionyear]['amount_added'] = amount;

                var monthTD = $(assetTr).children('td.' + projectionyear + '.month_added')[0];
                var monthSelect = $(monthTD).children('select')[0];
                var monthIndex = $(monthSelect).val();
                depreciationSettingsPerYearDict[assetId]['years'][projectionyear]['month_added'] = monthIndex;
            })
        })
        
        // We now need depreciation Per asset per month
        var depreciationPerAssetPerMonth = {}
        $.each(depreciationSettingsPerYearDict, function (assetId, depreciationSettingPerProjectionYearList) {
            // This is setting per asset year...
            depreciationPerAssetPerMonth[assetId] = {} // For each asset item
            var depreciationRate = depreciationSettingPerProjectionYearList['depreciation']
            $.each(depreciationSettingPerProjectionYearList['years'], function (additionYear, depreciationSetting)
            {
                // Each addition per year......
                // Each needs to be depreciated over a period of time
                // Get depreciation years
                var amountAdded = depreciationSetting['amount_added'];
                var monthAdded =  projectionMonthsList[depreciationSetting['month_added']];
                var depreciationPerMonth = amountAdded * (depreciationRate/100) / countOfMonthsInFinancialYear;

                var totalDepreciation = 0;
                var financialYearTotals = 0;
                $.each(projectionMonthsList, function (projectionMontIndex, projectionMonth) {
                    if(depreciationPerAssetPerMonth[assetId][projectionMontIndex] == null){
                        depreciationPerAssetPerMonth[assetId][projectionMontIndex] = 0;
                    }
                    // Check if this month is within depreciation period
                    if(projectionMonth['order'] < monthAdded['order']){
                        // Month before depreciation started... add zero
                        depreciationPerAssetPerMonth[assetId][projectionMontIndex] += 0;
                    }else{
                        // Month is within depreciation period
                        // check if assets has been completely depreciated
                        if(totalDepreciation >= amountAdded)
                        {
                            // Total depreciation reached. Add zero
                            depreciationPerAssetPerMonth[assetId][projectionMontIndex] += 0;
                        }
                        else
                        {
                            // Still some amount to be depreciated.
                            if(projectionMonth['is_total'])
                            {
                                // Handling of yearly totals
                                depreciationPerAssetPerMonth[assetId][projectionMontIndex] += financialYearTotals; // Total col set to 0.00 for the meantime
                                // adjust depreciation amount
                                depreciationPerMonth = (amountAdded - totalDepreciation) * depreciationRate / 100 / countOfMonthsInFinancialYear
                                // reset financialYearTotals
                                financialYearTotals = 0;
                            }
                            else
                            {
                                // Increment amount depreciated for projection month
                                depreciationPerAssetPerMonth[assetId][projectionMontIndex] += depreciationPerMonth;
                                // increment financialYearTotals
                                financialYearTotals += depreciationPerMonth;
                                // increment totalDepreciation
                                totalDepreciation += depreciationPerMonth;
                            }
                        }

                    }

                })
            })
        })

        return depreciationPerAssetPerMonth;
    }

    function getDepreciationPerAssetPerYear(depreceiationPerAssetPerMonth){
        var depreciationPerAssetPerYear = {}
        var depreciationPerAssetPerYearCumulative = {}
        $.each(depreceiationPerAssetPerMonth, function (assetId, depreciationPerMonthList) {
            depreciationPerAssetPerYear[assetId] = {}
            $.each(depreciationPerMonthList, function (projectionMonthIndex, depreciationAmount) {
                if(projectionMonthIndex.indexOf('_') < 0){
                    var projectionMonth = projectionMonthsList[projectionMonthIndex];
                    var year = projectionMonth['year'];
                    if(depreciationPerAssetPerYear[assetId][year] == null)
                    {
                        depreciationPerAssetPerYear[assetId][year] = 0;
                    }

                    depreciationPerAssetPerYear[assetId][year] += depreciationAmount
                }

            })
        })


        // Workign cumulative depreciation

        $.each(depreciationPerAssetPerYear, function (assetId, depreciationDict) {
            depreciationPerAssetPerYearCumulative[assetId] = {}
            var cumulativeDepreciation = 0;
            $.each(depreciationDict, function (year, depreciationAmount) {
                cumulativeDepreciation += depreciationAmount;
                depreciationPerAssetPerYearCumulative[assetId][year] = cumulativeDepreciation;
            })
        })

        return depreciationPerAssetPerYearCumulative;
    }

    function getDepreciationTotalPerMonth(depreciationPerAssetPerMonth)
    {
        var depreciationTotalPerMonthDict = {};
        $.each(depreciationPerAssetPerMonth, function (assetId, depreciationPerAsset) {
            $.each(depreciationPerAsset, function (monthIndex, depreciationAmountPerMonth) {
                if(depreciationTotalPerMonthDict[monthIndex] == null)
                {
                    depreciationTotalPerMonthDict[monthIndex] = 0
                }
                depreciationTotalPerMonthDict[monthIndex] += depreciationAmountPerMonth
            })
        })
        return depreciationTotalPerMonthDict;
    }

    function calculateTaxFromSlab(EBT){
        var taxAmount = 0;
        var amountTaxed = 0;

        for(var i = 1; i <= taxSlabs['slabCount']; i++){
            // Everything within the slabs
            // starting from the very first slab
            // check if EBT is greater than tax slab
            var currentSlab = taxSlabs[i];
            // check if upper limit exist
            if(currentSlab['upperLimit'] == null){
                // This is the last slab with over $above
                // check if tax rate exists...
                var rate = currentSlab['taxRate'];
                if(currentSlab['taxRate'] == null){
                    // User did not enter tax rate...
                    // User previous rate
                    rate = taxSlabs[(i-1)]['taxRate']; // That's what to be used for tax computation
                }

                var balanceToTax = EBT - amountTaxed;
                    taxAmount += balanceToTax * rate / 100
                    amountTaxed += balanceToTax;
                // proceed to compute tax
            }else{
                // Upper limit exists
                // Normal slab
                if(EBT > currentSlab['upperLimit']){
                    // Means this overlaps to the next slab
                    // No need to compute tax... Just add already computed tax
                    taxAmount += currentSlab['tax'];
                    amountTaxed += currentSlab['upperLimit']
                }else{
                    // EBT lies within this slab. Get amount not yet taxed
                    var balanceToTax = EBT - amountTaxed;
                    taxAmount += balanceToTax * currentSlab['taxRate'] / 100
                    amountTaxed += balanceToTax;
                }

            }

        }

        // Supposed EBT is still greater than amount taxed, tax the balance at the last rate
        if(EBT > amountTaxed){
            var relSlab = taxSlabs[taxSlabs['slabCount']]['taxRate'] == null ? taxSlabs[taxSlabs['slabCount'] -1 ]['taxRate'] : taxSlabs[taxSlabs['slabCount']];
            var balanceToTax = EBT - amountTaxed;
            taxAmount += balanceToTax * relSlab['taxRate'] / 100
        }

        return taxAmount;
    }

    function getTaxPerMonth(EBT){
        // Return Tax dict per month;
        // Get taxation system, 0= Slab System, 1= Single Rate
        var taxPerMonthDict = {};
        var taxationSystem = $('#id_taxation_system').val();
        if(taxationSystem == 0)
        {
            // 0= Slab System
            $.each(EBT, function (monthInex, ebtAmount) {
                taxPerMonthDict[monthInex] = calculateTaxFromSlab(ebtAmount);
            })
        }
        else
        {
            // 1= Single Rate
            var corporateTaxRate = $('#id_corporate_tax_rate').val();
            $.each(EBT, function (monthInex, ebtAmount) {
                taxPerMonthDict[monthInex] = parseInt(ebtAmount) * parseInt(corporateTaxRate) / 100
            })
        }

        return taxPerMonthDict;
    }

    function getEATPerYear(EAT){
        // Returns EAT Aggregated Per year
        var eatPerYearDict = {}
        $.each(EAT, function (monthIndex, eatAmount) {
            // Check if is totals column
            if(monthIndex.indexOf('Total') != -1){
                // Is a totals column
                // Get year
                var year = monthIndex.split('_')[0];
                eatPerYearDict[year] = parseFloat(eatAmount);
            }
        })
        return eatPerYearDict;
    }

    function getReservesAndSurplusesPerYear(EATPerYear){
        var reservesAndSurplusesDict = {}
        var currentReserves = 0;
        var count = 0;
        $.each(EATPerYear, function (projectionYear, eatAmount) {
            reservesAndSurplusesDict[projectionYear] = currentReserves
            currentReserves = parseInt(currentReserves) + parseInt(eatAmount);
        })
        return reservesAndSurplusesDict;
    }

    function generatePNL_RevenuesTable(){
        // Get each product and it's unit price for each of the n projection years
        var fullTableColSpan = ((projectionYears * countOfMonthsInFinancialYear) + 1)
        var pricePerProductPerYear = getPricePerProductPerYear();

        var revenuePerProductPerMonth = {}
        var directCostPerProductPerYear = getDirectCostPerProductPerYear();
        var employeeCostPerMonth = getEmployeeCostPerMonth();
        var unitsPerProductPerMonth = getUnitsPerProductPerMonth();
        var operatingCostPerMonthList = getOperatingCostPerMonth();

        var badDebtsPerMonthList = {}
        var depositAmountPerMonthList = getDepositItems();
        var depositAmountPerItemPerYearTotals = getDepositItemsPerYearTotals(depositAmountPerMonthList)
        var otherStartUpCostsPerMonthList = getOtherStartUpCostItems();

        var startUpCostPerMonthTotals = getOtherStartUpCostPerMonthTotals(otherStartUpCostsPerMonthList)

        var depreciationPerAssetPerMonth = getDepreciationPerAssetPerMonth();
        var depreciationTotalPerMonth = getDepreciationTotalPerMonth(depreciationPerAssetPerMonth);

        // Totals
        var revenueTotals = {}              // Revenue totals per month
        revenueTotalsPerYear = {}       // Revenue totals per year
        var receivableTotalsPerYear = {}    // Receivable totals per year
        var receivablesPerMonth = {};       // Receivables appropriated per month
        var employeeCostTotals = {}
        var operatingCostPerMonthTotals = {} //Operating cost + BAd debts
        operatingCostTotalsPeryear = {}  // operatingCostPerMonthTotals aggregated per year
        var otherExpensesPayableTotalsPerYear = {}  // Other expensesPayable bit of operatingCostTotalsPeryear using payables formula
        var otherExpensesPayablePerMonth = {}   // otherExpensesPayableTotalsPerYear appropriated per month

        var directCostTotals = {}           // Direct Production cost + EmployeeCost , and is given monthly
        directCostTotalsPerYear = {}    // directCostTotals Aggregated per year
        var payableTotalsPerYear = {}       // Payable bit of directCostTotalsPerYear using payables formula
        var payablesPerMonth = {}           // payableTotalsPerYear appropriated per month of the said year
        grossProfit = {}            // Revenue - Direct Cost
        var overallCost = {}            // Total direct costs + opearting costs
        var EBITDA = {}                 // RevenueTotals - Overall Costs
        var amortizationSchedule = generateAmortizationSchedule();
        var depreciationPerMonthTotals = {}
        var EBT = {};                   // Earnings before tax
        var taxPerMonth = {};
        EAT = {}                    //Earnings after Tax
        netMarginPerMonth = {}      // Monthly net margin

        var tangibleAssetInvestmentDict = getAssetsInvestmentDict(true);
        var tangibleAssetInvestmentPerAssetPerMonth = getInvestmentPerAssetPerMonth(tangibleAssetInvestmentDict);

        var intangibleAssetsInvestmentDict = getAssetsInvestmentDict(false);
        var intangibleAssetsInvestmentPerAssetPerMonth = getInvestmentPerAssetPerMonth(intangibleAssetsInvestmentDict);

        var cashBalancePerYear = {} // Cash balance per year returned from cash flow generation function

        // shareCapitalDict and debtDict are similar in structure and will be processed by the same function
        var shareCapitalDict = getShareCapitalDict()
        var shareCapitalInvestmentPerMonthDict = getCapitalOrDebtInvestmentPerMonth(shareCapitalDict);
        var loanDebtDict = getLoanDebtDict();
        var loanDebtInvestmentPerMonthDict = getCapitalOrDebtInvestmentPerMonth(loanDebtDict);



        truncateTable('#tbl_pnl', true, true);
        // Create table head
        var strHtml = '<thead><tr><th class="td-md">Particulars </th>'
        $.each(projectionMonthsList, function(index, projectionMonthYear){
            var yearTotalClass = projectionMonthYear['is_total'] ? 'unit_year-total' : ''
            strHtml += '<th class="text-right td-sm ' + yearTotalClass + '" >'
                        +    projectionMonthYear['display'] + '<span class="span-currency"></span>'
                    +   '</th>'
        })
        strHtml += '</tr></thead><tbody></tbody>'
        $('#tbl_pnl').append(strHtml);

        //Add revenues section rows
        var rowCount = 0;
        $.each(unitsPerProductPerMonth, function (productIdIndex, productMonthlyUnits) {
            // Inside each product
            if(revenuePerProductPerMonth[productIdIndex] == null){
                revenuePerProductPerMonth[productIdIndex]
            }
            var isHeaderRow = rowCount == 0 ? true : false;
            var strHtml = ''
            if(isHeaderRow){
                strHtml = '<tr>'
                          +     '<td class="text-left text-underline">Revenue </td>'
                          $.each(projectionMonthsList, function(index, projectionMonthYear){
                                strHtml += '<td> </td>'
                          })
                          + '</tr>'
                $('#tbl_pnl tbody').append(strHtml);
            }
            strHtml = '<tr>'
                      +     '<td>' + products[productIdIndex]['name'] + '</td>'
                            $.each(productMonthlyUnits, function (monthIndex, monthlyUnit) {
                                        // Inside each monthly context
                                            if(revenueTotals[monthIndex] == null){
                                                revenueTotals[monthIndex] = 0
                                            }
                                            if(revenuePerProductPerMonth[productIdIndex] == null){
                                                revenuePerProductPerMonth[productIdIndex] = {}
                                            }
                                            if(revenuePerProductPerMonth[productIdIndex][monthIndex] == null){
                                                revenuePerProductPerMonth[productIdIndex][monthIndex] = {}
                                            }
                                            var year = monthlyUnit['year']
                                            var yearlyPrice = parseInt(pricePerProductPerYear[productIdIndex][year], 10);
                                            var units = parseInt(monthlyUnit['units'], 10);
                                            var revenue = yearlyPrice * units;
                                            revenueTotals[monthIndex] += revenue;
                                            revenuePerProductPerMonth[productIdIndex][monthIndex]['revenue'] = revenue;
                                            revenuePerProductPerMonth[productIdIndex][monthIndex]['year'] = year;
            strHtml +=    '<td class=" monthly td-input text-right readonly ' + ' Addmonth ' + ' ' + ' Showistotal ' + ' "'
                                            + ' data-is_total_col="' + 'Showistotal' + '"'
                                            + ' data-projection_month_id="' + 'Addmonth' +'" '
                                            + ' data-projection_year="' + 'Addyear' +'" '
                                            + ' data-val="' + revenue + '"'
                                            + ' width="200">'
                                            +   '<input name="" '
                                            +       ' type="text"'
                                            +       ' value="' + revenue + '"'
                                            +       ' class="form-control input-md text-right rpt_presentation" readonly></td>'
                                            + '</td>'
                                    })

            $('#tbl_pnl tbody').append(strHtml);
            rowCount++;
        })

        // Reset rowCount
        rowCount = 0;
        // Revenue Totals Row
        strHtml = '<tr class="tr-totals">'
                + '<td>Total Revenue</td>'
        $.each(revenueTotals, function (monthIndex, monthlyRevenueTotal) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + monthlyRevenueTotal + '"'
                                        +       ' class="form-control input-md text-right rpt_presentation" readonly></td>'
        })
        strHtml          +='</tr>'

        $('#tbl_pnl tbody').append(strHtml);
        // --- End Revenues Totals Row

        // Revenue Totals per year
        revenueTotalsPerYear = getRevenueTotalsPerYear(revenueTotals);
        receivableTotalsPerYear = getReceivablesTotalsPerYear(revenueTotalsPerYear);
        receivablesPerMonth = getReceivablesPerMonth(receivableTotalsPerYear);
        // End-- Revenue Totals per year

        // Direct cost sections:- very important!!
        // Add a section header for direct cost
        strHtml = '<tr><td class="text-underline">Direct Cost</td>'
                $.each(projectionMonthsList, function(projectionMonthIndex, projectionMonth){
                    strHtml += '<td> </td>'
                })
        strHtml += '</tr>'
        $('#tbl_pnl tbody').append(strHtml);

        // Add direct cost attributed to product
        $.each(revenuePerProductPerMonth, function(productIndex, productMonthlyRevenues){
            strHtml = '<tr>'
                    +     '<td>' + products[productIndex]['name'] + '</td>'
            $.each(productMonthlyRevenues, function (monthIndex, monthRevenue) {
                if(directCostTotals[monthIndex] == null){
                    directCostTotals[monthIndex] = 0;
                    overallCost[monthIndex] = 0;
                }
                // get corresponding year
                var year = productMonthlyRevenues[monthIndex]['year'];
                var revenue = productMonthlyRevenues[monthIndex]['revenue']
                var yearlyDirectCostRevenuePercentage = directCostPerProductPerYear[productIndex][year]
                var productMonthlyDireCost = (revenue * yearlyDirectCostRevenuePercentage)/100;
                directCostTotals[monthIndex] += productMonthlyDireCost; //Direct cost incremented per month
                overallCost[monthIndex] += productMonthlyDireCost;
                strHtml += '<td class="monthly td-input readonly ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                            + ' data-is_total_col="' + 'Showistotal' + '"'
                                            + ' data-projection_month_id="' + 'Addmonth' +'" '
                                            + ' data-projection_year="' + 'Addyear' +'" '
                                            + ' width="200">'
                                            + '<input name="" '
                                            + ' type="text"'
                                            + ' value="'+ productMonthlyDireCost +'"'
                                            + ' class="form-control input-md text-right rpt_presentation" readonly></td>'
            })
            strHtml += '</tr>'
            $('#tbl_pnl tbody').append(strHtml);
        })

        //  EMPLOYEE COSTS
        // Add other direct costs:- Employee cost
        // Add Employee cost header
        strHtml = '<tr><td class="text-underline">Employee Cost</td>'
                $.each(projectionMonthsList, function(projectionMonthIndex, projectionMonth){
                    strHtml += '<td> </td>'
                })
        strHtml += '</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // Add employee cost rows
        $.each(employeeCostPerMonth, function (employeeRoleIndex, employeeRoleCost) {
            strHtml = '<tr>'
                    +     '<td>' + employeeRoleCost['name'] + '</td>'
            $.each(employeeRoleCost['projection_months'], function (monthIndex, employmentCost) {
                if(employeeCostTotals[monthIndex] == null){
                    employeeCostTotals[monthIndex] = 0;
                }
                if(directCostTotals[monthIndex] == null){
                    directCostTotals[monthIndex] = 0;
                }
                if(overallCost[monthIndex] == null){
                    overallCost[monthIndex] = 0;
                }
                employeeCostTotals[monthIndex] += employmentCost;
                directCostTotals[monthIndex] += employmentCost;
                overallCost[monthIndex] += employmentCost;
                strHtml += '<td class="monthly td-input readonly ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                            + ' data-is_total_col="' + 'Showistotal' + '"'
                            + ' data-projection_month_id="' + 'Addmonth' +'" '
                            + ' data-projection_year="' + 'Addyear' +'" '
                            + ' width="200">'
                            + '<input name="" '
                            + ' type="text"'
                            + ' value="'+ employmentCost +'"'
                            + ' class="form-control input-md text-right rpt_presentation" readonly></td>'
            })
            $('#tbl_pnl tbody').append(strHtml);
        })
        // Reset strHtml
        strHtml = '';

        // Remember totals row: This will apply for all direct costs(Product and employment Tomorrow!!!

        // TOTAL DIRECT COST ROW
        strHtml = '<tr class="tr-totals">'
                +   '<td>Direct Cost Totals</td>'
        $.each(directCostTotals, function (monthIndex, monthlyDirectCostTotal) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + monthlyDirectCostTotal + '"'
                                        +       ' class="form-control input-md text-right rpt_presentation" readonly></td>'
            })
            strHtml          +='</tr>'

        $('#tbl_pnl tbody').append(strHtml);

        directCostTotalsPerYear = getDirectCostTotalsPerYear(directCostTotals);
        payableTotalsPerYear = getPayableTotalsPerYear(directCostTotalsPerYear);
        payablesPerMonth = getPayablesPerMonth(payableTotalsPerYear);

        // ---TOTAL DIRECT COST ROW

        // GROSS PROFIT
        strHtml = '<tr class="tr-totals">'
                +   '<td>Gros Profit</td>'
        $.each(revenueTotals, function (monthIndex, monthlyRevenueTotal) {
            // This is a difference between Revenue and Direct cost totals
            grossProfit[monthIndex] = monthlyRevenueTotal - directCostTotals[monthIndex]; // Needs parsong
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + grossProfit[monthIndex] + '"'
                                        +       ' class="form-control input-md text-right rpt_presentation" readonly></td>'
            })
            strHtml          +='</tr>'

        $('#tbl_pnl tbody').append(strHtml);
        // -- END ---GROSS PROFIT
        
        // Add operating costs header
        strHtml = '<tr><td class="text-underline">Operating Cost</td>'
                $.each(projectionMonthsList, function(projectionMonthIndex, projectionMonth){
                    strHtml += '<td> </td>'
                })
        strHtml += '</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // Add operating cost rows
        // OPERATING COST ROWS
        $.each(operatingCostPerMonthList, function (operatingCostIndex, monthlyOperatingCost) {
            strHtml = '<tr class="">'
                    +   '<td>'+ monthlyOperatingCost['name'] +'</td>'
            $.each(monthlyOperatingCost['monthly'], function (monthIndex, costDict) {
                var year = costDict['year'];
                var costingPeriod = costDict['costing_period'];
                var costValue = costDict['cost'];
                // Overall Cost value needs to be added
                operatingCostPerMonthTotals[monthIndex] = parseFloat(operatingCostPerMonthTotals[monthIndex] || 0) + parseFloat(costValue);
                overallCost[monthIndex] = parseFloat(overallCost[monthIndex] || 0) +  parseFloat(costValue);
                strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + costValue + '"'
                                        +       ' class="form-control input-md text-right rpt_presentation" readonly></td>'

            })
            strHtml          +='</tr>'
            $('#tbl_pnl tbody').append(strHtml);
        })

        // BAD DEBTS AS PART OF OPERATING COSTS
        badDebtsPerMonthList = getBadDebtsPerMonth(revenueTotals);
        strHtml = '<tr class="">'
                +   '<td class="td-label">Bad Debts</td>'
        $.each(badDebtsPerMonthList, function (monthIndex, badDebtAmount) {
            // Increment total operating cost
            operatingCostPerMonthTotals[monthIndex] = parseFloat(operatingCostPerMonthTotals[monthIndex] || 0) + parseFloat(badDebtAmount);
            // Increment overall cost value
            overallCost[monthIndex] = parseFloat(overallCost[monthIndex] || 0) + parseFloat(badDebtAmount);
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + badDebtAmount + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);

        //  OPERATING COST TOTALS ROW
        strHtml = '<tr class="tr-totals">'
                +   '<td class="td-label">Total Operating Cost</td>'
        $.each(operatingCostPerMonthTotals, function (monthIndex, operatingCostTotal) {
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + operatingCostTotal + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" ' +
        'readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);


        operatingCostTotalsPeryear = getOperatingCostTotalsPeryear(operatingCostPerMonthTotals);
        otherExpensesPayableTotalsPerYear = getOtherExpensesPayableTotalsPerYear(operatingCostTotalsPeryear);
        otherExpensesPayablePerMonth = getOtherExpensesPayablePerMonth(otherExpensesPayableTotalsPerYear);

        // END-- OPERATING COST ROWS

        // EBITDA ROW & COMPUTATION
        // EBITDS = REVENUE TOTALS - TOTAL COST
        strHtml = '<tr class="">'
                +   '<td class="td-label">EBITDA</td>'
        $.each(revenueTotals, function (monthIndex, revenueTotal) {
            var monthEbitda = revenueTotal - overallCost[monthIndex];
            EBITDA[monthIndex] = monthEbitda
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + monthEbitda + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" required="required " readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);

        // INTEREST ON DEBT
        // This is retrieved from amortization schedule which we already have
        //amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex]['interest_paid'] = Math.round(interestPaid );
        var monthlyInterestOnDebt = {};
        var yearTotal = 0;
        $.each(projectionMonthsList, function (monthIndex, projectionMonth) {
            // for each amortization Schedule Item, retrieve interest paid
            // Plan on handling totals... Should be very easy...
            if(projectionMonth['is_total']){
                monthlyInterestOnDebt[monthIndex] = yearTotal;
                yearTotal = 0;
            }
            $.each(amortizationSchedule, function (amortizationScheduleId, scheduleDict) {
                // get corresponding month index val
                var interesPaid = 0;
                try{
                    interesPaid = parseInt(scheduleDict['monthly'][monthIndex]['interest_paid']);
                }catch(error){
                    //console.log('Error wiht monthIndex: ' + monthIndex)
                }

                if(monthlyInterestOnDebt[monthIndex] == null){
                    monthlyInterestOnDebt[monthIndex] = 0;
                }
                monthlyInterestOnDebt[monthIndex] += interesPaid
                yearTotal += interesPaid;
                //costsBeforeTaxAfterEBITDS[monthIndex] += interesPaid
            })
        })


        strHtml = '<tr class="">'
                +   '<td class="td-label">Interest on Debt</td>'
        $.each(monthlyInterestOnDebt, function (monthIndex, interestAmount) {
            if(EBT[monthIndex] == null){
                EBT[monthIndex] = EBITDA[monthIndex];
            }
            EBT[monthIndex] -= interestAmount;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + interestAmount + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // END -- INTEREST ON DEBT

        // DEPRECIATION
        strHtml = '<tr class="">'
                +   '<td class="td-label">Depreciation of Fixed Assets</td>'
        $.each(depreciationTotalPerMonth, function (monthIndex, depreciationAmount) {
            if(EBT[monthIndex] == null){
                EBT[monthIndex] = EBITDA[monthIndex];
            }
            EBT[monthIndex] -= parseFloat(depreciationAmount || 0);
            strHtml+= '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + depreciationAmount + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // END--- DEPRECIATION

        // AMORTIZATION OF STARTUP COST
        strHtml = '<tr class="">'
                +   '<td class="td-label">Amortisation of Start-up Cost</td>'
        $.each(startUpCostPerMonthTotals, function (monthIndex, startupCostAmount) {
            if(EBT[monthIndex] == null){
                EBT[monthIndex] = EBITDA[monthIndex];
            }
            EBT[monthIndex] -= startupCostAmount;
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + startupCostAmount + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // END -- AMORTIZATION OF STARTUP COST

        // EBT EARNING BEFORE TAX ROW
        strHtml = '<tr class="">'
                +   '<td class="td-label">Earnings Before Tax</td>'
        $.each(EBT, function (monthIndex, ebtAmount) {

        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + ebtAmount + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // END --EARNING BEFORE TAX ROW

        // TAX COMPUTATION AND TAX ROWS
        taxPerMonth = getTaxPerMonth(EBT);
        strHtml = '<tr class="">'
                +   '<td class="td-label">Tax</td>'
        $.each(taxPerMonth, function (monthIndex, taxAmount) {
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + taxAmount + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // END-- TAX

        // EARNINGS AFTER TAX
        $.each(EBT, function (monthIndex, ebtAmount) {
            var monthlyEarningAfterTax = ebtAmount - taxPerMonth[monthIndex];
            EAT[monthIndex] = monthlyEarningAfterTax
        })

        taxPerMonth = getTaxPerMonth(EBT);
        strHtml = '<tr class="">'
                +   '<td class="td-label">Earnings after Tax</td>'
        $.each(EAT, function (monthIndex, eatAmount) {
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + eatAmount + '"'
                    +           ' class="form-control input-md text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        var EATPerYear = getEATPerYear(EAT);
        //END-- EARNINGS AFTER TAX


        // NET MARGIN
        $.each(EAT, function (monthIndex, eatAmount) {
            var revAmount = parseInt(revenueTotals[monthIndex])
            netMarginPerMonth[monthIndex] = eatAmount / revAmount * 100 / 100; // This is the only one not rounded
        })

        strHtml = '<tr class="">'
                +   '<td class="td-label">Net Margin (%)</td>'
        $.each(netMarginPerMonth, function (monthIndex, netMarginPerMonthAmount) {
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + netMarginPerMonthAmount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '"'
                    +           ' class="form-control input-md text-right" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_pnl tbody').append(strHtml);

        var EATPerYear = getEATPerYear(EAT)

        // Generate amortization Schedule Statement
        generateAmortizationScheduleTable(amortizationSchedule); // Statement in form of a table
        // Generate Cashflow statements

        // This should return net cash flow per Month then converted to per year later
        var cashFlowClosingCashBalancePerMonth = generateCashFlowStatement(revenuePerProductPerMonth, revenueTotals, directCostTotals,
            employeeCostTotals, operatingCostPerMonthList, otherStartUpCostsPerMonthList,
            depositAmountPerMonthList, taxPerMonth, badDebtsPerMonthList,
            receivablesPerMonth, payablesPerMonth, otherExpensesPayablePerMonth,
            tangibleAssetInvestmentPerAssetPerMonth, intangibleAssetsInvestmentPerAssetPerMonth,
            shareCapitalInvestmentPerMonthDict, loanDebtInvestmentPerMonthDict,
            amortizationSchedule, depreciationPerAssetPerMonth
        );

        updateReportPresentation('#tbl_pnl');

        var cashFlowClosingBalancePerYear = getCashFlowClosingBalancePerYear(cashFlowClosingCashBalancePerMonth);
        // Aggregate changes in cashflow during the year per month to yearly

        // Generate Balance Sheet

        generateBalanceSheet(tangibleAssetInvestmentDict, intangibleAssetsInvestmentDict,
            depreciationPerAssetPerMonth, depositAmountPerItemPerYearTotals,
            receivableTotalsPerYear, payableTotalsPerYear, otherExpensesPayableTotalsPerYear,
            cashFlowClosingBalancePerYear, shareCapitalDict, loanDebtDict, EATPerYear,
            amortizationSchedule, monthlyInterestOnDebt
        );
    }

    function calculateAmortizationValue(principal, interestRate, paymentPeriod){
        // Principal is the initial investment amount
        // interestRate is rate per period. Note that we pass interest rate percentage per annum and we have to convert it to per month ove 100
        var convertedRate = (interestRate/countOfMonthsInFinancialYear)/100
        var innerBracket = Math.pow(1 + convertedRate, paymentPeriod);
        var upper  = convertedRate * innerBracket;
        var lower = innerBracket - 1;
        return principal * upper / lower; // To 2 decimal places
    }

    function getMonthOfInvestmentFromCode(monthCode){
        var foundMonth = {}
        $.each(calendarMonths, function (index, calendarMonth) {
            if(monthCode == calendarMonth['code']){
                foundMonth = calendarMonth;
            }
        })
        return foundMonth;
    }

    function getAmortizationMonths(amortizationYears, monthOfInvestmentIndex){
        // Start month is the month of investment
        var monthParts = monthOfInvestmentIndex.split('-');
        var monthCode = monthParts[0];
        var year = monthParts[1];
        var totalMonthCount = amortizationYears * countOfMonthsInFinancialYear;
        var currentMonth = getMonthOfInvestmentFromCode(monthCode);
        if(currentMonth == null){
            return {}; // Return empty object if no matching month is found
        }
        var amortizationMonths = {}
        for(var monthCount = 0; monthCount < totalMonthCount; monthCount++){
            // Get month details
            // Get year details
            var monthIndex = currentMonth['code'] + '-' + year;
            amortizationMonths[monthIndex] = currentMonth;
            var nextMonth = calendarMonths[currentMonth['next']];
            if(nextMonth['order'] < currentMonth['order']){
                // Need to move to the next year
                year++;
            }
            // Adjust current month
            currentMonth = nextMonth;
        }
        return(amortizationMonths);
    }

    function generateAmortizationScheduleTableRowGroup(amortizationScheduleItem){
        // Generate row group header
        var strHtml = '<tr class="tr-totals">'
                    +   '<td class="td-md"></td>'
        $.each(amortizationScheduleItem['monthly'], function (monthIndex, monthScheduleItem) {
            strHtml    += '<td class="td-input td-xs readonly text-right"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                + monthIndex + '<span class="span-currency"> </span> '
                                + '</td>'

        })
        strHtml          +='</tr>'
        $('#tbl_amortization tbody').append(strHtml);

        // End of row group header

        strHtml = '<tr class="">'
                    +   '<td class="">Opening balance</td>'
        $.each(amortizationScheduleItem['monthly'], function (monthIndex, monthScheduleItem) {
            strHtml    += '<td class="td-input readonly"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                +   '<input name="" '
                                +       ' type="text"'
                                +       ' value="' + monthScheduleItem['opening_balance'] + '"'
                                +       ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_amortization tbody').append(strHtml);

        // Installment number row
        strHtml = '<tr class="">'
                +   '<td class="">Installment Number</td>'
        $.each(amortizationScheduleItem['monthly'], function (monthIndex, monthScheduleItem) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                + ' data-is_total_col="' + 'Showistotal' + '"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                +   '<input name="" '
                                +       ' type="number" min="0"'
                                +       ' value="' + monthScheduleItem['installment_number'] + '"'
                                +       ' class="form-control text-right" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_amortization tbody').append(strHtml);

        //Installment amount row
        strHtml = '<tr class="">'
                +   '<td class="">Installment Amount</td>'
        $.each(amortizationScheduleItem['monthly'], function (monthIndex, monthScheduleItem) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                + ' data-is_total_col="' + 'Showistotal' + '"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                +   '<input name="" '
                                +       ' type="text"'
                                +       ' value="' + monthScheduleItem['installment_amount'] + '"'
                                +       ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_amortization tbody').append(strHtml);

        // Interest charged row
        strHtml = '<tr class="">'
                +   '<td class="">Interest Paid</td>'
        $.each(amortizationScheduleItem['monthly'], function (monthIndex, monthScheduleItem) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                + ' data-is_total_col="' + 'Showistotal' + '"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                +   '<input name="" '
                                +       ' type="text"'
                                +       ' value="' + monthScheduleItem['interest_paid'] + '"'
                                +       ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_amortization tbody').append(strHtml);

        // Capital repaid row
        strHtml = '<tr class="">'
                +   '<td class="">Capital Repaid</td>'
        $.each(amortizationScheduleItem['monthly'], function (monthIndex, monthScheduleItem) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                + ' data-is_total_col="' + 'Showistotal' + '"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                +   '<input name="" '
                                +       ' type="text"'
                                +       ' value="' + monthScheduleItem['capital_repaid'] + '"'
                                +       ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_amortization tbody').append(strHtml);

        // Closing balance row
        strHtml = '<tr class="tr-totals">'
                +   '<td class="">Closing balance</td>'
        $.each(amortizationScheduleItem['monthly'], function (monthIndex, monthScheduleItem) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                + ' data-is_total_col="' + 'Showistotal' + '"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                +   '<input name="" '
                                +       ' type="text"'
                                +       ' value="' + monthScheduleItem['closing_balance'] + '"'
                                +       ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_amortization tbody').append(strHtml);
    }

    function generateAmortizationScheduleTable(amortizationSchedule){
        // Add a table head
        truncateTable('#tbl_amortization', true, true);
        var rowGroupCounter = 0;
        var strHtml = '<tbody></tbody>';
        $('#tbl_amortization').append(strHtml);

        // Add specific rows for each amortization item
        $.each(amortizationSchedule, function (amortizationScheduleId, amortizationScheduleItem) {
            // Each amortization schedules
            generateAmortizationScheduleTableRowGroup(amortizationScheduleItem);
            rowGroupCounter++;
        })

        updateReportPresentation('#tbl_amortization');
    }

    function generateAmortizationSchedule(){
        // Get each debt and month of investment
        var amortizationScheduleSettingsDict = {}
        var amortizationSchedule = {}; // This is the complete amortization schedule for each item of investment
        
        // Debt, Annual interest rate, loan period
        var debtTR = $('#tbl_assumptions_capital tr.tbl_assumptions_capital_2');
        var interestRateTR = $('#tbl_assumptions_capital tr.tbl_assumptions_capital_3');
        var loanPeriodTR = $('#tbl_assumptions_capital tr.tbl_assumptions_capital_4');
        
        // iterate each projection year

        $.each(projectionYearsList, function (index, projectionyear) {
            // Get the values in the tables.
            var amortizationScheduleId = projectionyear + '_amortization_schedule';
            amortizationScheduleSettingsDict[amortizationScheduleId] = {}
            amortizationScheduleSettingsDict[amortizationScheduleId]['year'] = projectionyear;
            // debt amount

            var debtTD = $(debtTR).children('.' + projectionyear + '.investment')[0];
            var debtInput = $(debtTD).children('input')[0];
            var debt = removeCommas($(debtInput).val());
            debt = debt != '' ? parseInt(debt) : 0;

            amortizationScheduleSettingsDict[amortizationScheduleId]['debt'] = debt;
            // Get month of investment
            var monthOfInvestmentTD = $(debtTR).children('.' + projectionyear + '.month_of_investment');
            var monthOfInvestmentSelect = $(monthOfInvestmentTD).children('select')[0];
            var monthOfInvestment = $(monthOfInvestmentSelect).val();
            amortizationScheduleSettingsDict[amortizationScheduleId]['month_of_investment'] = monthOfInvestment;
            // Interest rate
            var interestRateTD = $(interestRateTR).children('.' + projectionyear + '.investment')[0];
            var interestRateInput = $(interestRateTD).children('input')[0];
            var interestRate = removeCommas($(interestRateInput).val());
            interestRate = interestRate != '' ? parseInt(interestRate) : 0;

            amortizationScheduleSettingsDict[amortizationScheduleId]['rate'] = interestRate;
            // Loan period
            var loanPeriodTD = $(loanPeriodTR).children('.' + projectionyear + '.investment')[0];
            var loanPeriodInput = $(loanPeriodTD).children('input')[0];
            var loanPeriod = $(loanPeriodInput).val();
            amortizationScheduleSettingsDict[amortizationScheduleId]['period'] = parseFloat(loanPeriod || 0)
            amortizationScheduleSettingsDict[amortizationScheduleId]['value'] = calculateAmortizationValue(debt, interestRate, loanPeriod);
        })

        // Building of amortization schedule table
        // Get amortization months... Similar to the previous one but more interesting
        $.each(amortizationScheduleSettingsDict, function (amortizationScheduleId, amortizationScheduleItem) {
            // get months in amortization schedule, excluding totals
            var amortizationYears = amortizationScheduleSettingsDict[amortizationScheduleId]['period'];
            // We use projectionYears as opposed to amortizationYears so that we can have the same number of cols each
            var amortizationStartMonthIndex = amortizationScheduleSettingsDict[amortizationScheduleId]['month_of_investment']
            var amortizationMonths = getAmortizationMonths(projectionYears, amortizationStartMonthIndex);

            amortizationSchedule[amortizationScheduleId] = {}
            amortizationSchedule[amortizationScheduleId]['year'] = amortizationScheduleItem['year']
            amortizationSchedule[amortizationScheduleId]['monthly'] = {}

            // Keep track of values bd/cf
            var openingBalance = amortizationScheduleItem['debt'] || 0
            var installment = amortizationScheduleItem['value']
            var installmentNumber = 1;
            // Months are successfully retrieved
            $.each(amortizationMonths, function (monthIndex, amortizationMonth) {
                // Create a list of amortization schedule items.
                amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex] = {}
                amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex]['opening_balance'] = openingBalance;
                amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex]['installment_number'] = installmentNumber;
                amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex]['installment_amount'] = installment;
                var interestPaid = openingBalance * ((amortizationScheduleItem['rate']/12)/100)
                amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex]['interest_paid'] = interestPaid;
                var capitalRepaid = installment - interestPaid;
                amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex]['capital_repaid'] = capitalRepaid;
                var closingBalance = openingBalance - capitalRepaid;
                amortizationSchedule[amortizationScheduleId]['monthly'][monthIndex]['closing_balance'] = closingBalance;
                // Adjust new opening balance
                openingBalance = closingBalance;
                installmentNumber++;
            })
        })
        return amortizationSchedule;
    }

    /*

        Debt and Interest repayment per Month

     */
    function getDebtAndInterestRepaymentPerMonth(amortizationSchedule){
        var debtAndInterestRepaymentPerMonth = {};
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            debtAndInterestRepaymentPerMonth[projectionMonthIndex] = 0;
        })

        $.each(amortizationSchedule, function (amortizationScheduleId, amortizationScheduleItem) {
            // into each amortization schedule item
            $.each(amortizationScheduleItem['monthly'], function (amortizationMonthIndex,amortizationScheduleMonthlyItem ) {
                // We have access to opening_balance, installment_number, installment_amount, interest_paid, capital_paid and closing_balance
                // However, we only need installment amount
                // Check if is in projectionMonthsList
                var matchingMonthInProjectionMonthList = projectionMonthsList[amortizationMonthIndex];
                if(matchingMonthInProjectionMonthList != null){
                    // Matching month found.. Increment value for the month
                    if(debtAndInterestRepaymentPerMonth[amortizationMonthIndex] == null){
                        debtAndInterestRepaymentPerMonth[amortizationMonthIndex] = 0;
                    }
                    debtAndInterestRepaymentPerMonth[amortizationMonthIndex] += amortizationScheduleMonthlyItem['installment_amount'];
                }
            })
        })

        // Incorporate totals cols
        var debtAndInterestRepaymentPerMonthPlusTotals = {};
        var yearTotal = 0;
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            //
            if(projectionMonth['is_total']){
                debtAndInterestRepaymentPerMonthPlusTotals[projectionMonthIndex] = yearTotal;
                yearTotal = 0; // Reset year total in readiness for the next year
            }else{
                var amount = parseInt(debtAndInterestRepaymentPerMonth[projectionMonthIndex]) || 0;
                debtAndInterestRepaymentPerMonthPlusTotals[projectionMonthIndex] = amount;
                yearTotal += amount; // Increment year totals
            }
        })
        return debtAndInterestRepaymentPerMonthPlusTotals;
    }

    function getDebtAndInterestRepaymentPerYear(amortizationSchedule){
        var debtAnInterestRepaymentPerYearDict = {};
        var repaymentPerMonth = getDebtAndInterestRepaymentPerMonth(amortizationSchedule);
        $.each(repaymentPerMonth, function (projectionMonthIndex, repaymentAmount) {
            if(projectionMonthIndex.indexOf('_') > -1){
                // this is a totals object.
                // get year
                var year = projectionMonthIndex.split('_')[0];
                // update value
                debtAnInterestRepaymentPerYearDict[year] = repaymentAmount
            }
        })
        return debtAnInterestRepaymentPerYearDict;
    }

    function getInterestRepaymentOnDebtPerYear(monthlyInterestOnDebt){
        var interestRepaymentPerYearDict = {};

        $.each(monthlyInterestOnDebt, function (projectionMonthIndex, interestAmount) {
            if(projectionMonthIndex.indexOf('_') > -1){
                // this is a totals object.
                // get year
                var year = projectionMonthIndex.split('_')[0];
                // update value
                interestRepaymentPerYearDict[year] = interestAmount
            }
        })

        return interestRepaymentPerYearDict;
    }

    function getDepositItems(){
        // This returns an object per depositItemId with name and monthly values
        var depositItemsDictPerMonthDict = {};
        var depositItemsDict = {};
        var depositTRs = $('#tbl_assumptions_usage_deposits tbody tr');
        $.each(depositTRs, function (index, depositTR) {
            // Each deposIt TR.
            // Retrieve deposit name
            var depositItemId = $(depositTR).data('row_id');
            depositItemsDict[depositItemId] = {};

            var depositItemNameTD = $(depositTR).children('td')[1];
            var depositItemNameInput = $(depositItemNameTD).children('input')[0];
            var depositItemName = $(depositItemNameInput).val() || '';

            var depositItemAmountTD = $(depositTR).children('td')[2];
            var depositItemAmountInput = $(depositItemAmountTD).children('input')[0];
            var depositItemAmount = removeCommas($(depositItemAmountInput).val());

            depositItemsDict[depositItemId]['name'] = depositItemName;
            depositItemsDict[depositItemId]['amount'] = depositItemAmount != '' ? parseInt(depositItemAmount, 10) : 0;
        })

        $.each(depositItemsDict, function (depositItemId, depositItemDict) {
            depositItemsDictPerMonthDict[depositItemId] = {}
            depositItemsDictPerMonthDict[depositItemId]['name'] = depositItemDict['name'];
            depositItemsDictPerMonthDict[depositItemId]['monthly'] = {}
            var counter = 0;
            var yearAdded = null;
            $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
                if(counter == 0){
                    // Add cost to the first monthly item
                    depositItemsDictPerMonthDict[depositItemId]['monthly'][projectionMonthIndex] = depositItemDict['amount'];
                    yearAdded = projectionMonth['year'];
                }else{
                    if(projectionMonth['is_total'] && projectionMonth['year'] == yearAdded){
                        depositItemsDictPerMonthDict[depositItemId]['monthly'][projectionMonthIndex] = depositItemDict['amount'];
                    }else{
                        depositItemsDictPerMonthDict[depositItemId]['monthly'][projectionMonthIndex] = 0;
                    }

                }
                counter++; // Increment counter
            })
        })
        return depositItemsDictPerMonthDict;
    }

    function getDepositItemsPerYearTotals(depositItemsDictPerMonthDict){
        // This is an aggregation of the results of getDepositItems() function per year
        var depositItemsTotalPerYear = {};
        $.each(depositItemsDictPerMonthDict, function (depositItemId, depositItem) {
            if(depositItemsTotalPerYear[depositItemId] == null){
                depositItemsTotalPerYear[depositItemId] = {};
                depositItemsTotalPerYear[depositItemId]['name'] = depositItem['name'];
                depositItemsTotalPerYear[depositItemId]['yearly'] = {}

                var cumulativeYearly = 0;
                $.each(depositItem['monthly'], function(projectionMonthId, depositAmount){
                    // Get corresponding year
                    var year = projectionMonthId.split('-')[1]; // Get's second item in projection month index after split
                    if(year == null)
                        return; // Move on to the next
                    if(depositItemsTotalPerYear[depositItemId]['yearly'][year] == null){
                        depositItemsTotalPerYear[depositItemId]['yearly'][year] = 0;
                    }
                    cumulativeYearly += parseInt(depositAmount);
                    depositItemsTotalPerYear[depositItemId]['yearly'][year] = cumulativeYearly
                })
            }
        })
        return depositItemsTotalPerYear
    }

    function getOtherStartUpCostItemsFirstYear(){
        var startUpCostItemsDict = {}
        var startUpTRs = $('#tbl_assumptions_usage_other_startup_costs tbody tr');
        $.each(startUpTRs, function (index, startUpTR) {
            // Each start up row
            var startUpItemId = $(startUpTR).data('row_id');
            startUpCostItemsDict[startUpItemId] = {};

            var startUpItemNameTD = $(startUpTR).children('td')[1];
            var startUpItemNameInput = $(startUpItemNameTD).children('input')[0];
            var startUpItemName = $(startUpItemNameInput).val() || '';

            var startUpItemAmountTD = $(startUpTR).children('td')[2];
            var startUpItemAmountInput = $(startUpItemAmountTD).children('input')[0];
            var startUpItemAmount = parseInt(removeCommas($(startUpItemAmountInput).val()), 10);

            startUpCostItemsDict[startUpItemId]['name'] = startUpItemName;
            startUpCostItemsDict[startUpItemId]['amount'] = startUpItemAmount;
        })

        return startUpCostItemsDict;
    }

    function appropriateOtherStartUpCostsOverAmortizationYears(otherStartUpCostsFirstYear){
        // Get startup cost totals for the first Year
        /*
        2018: {
            cost: 500,
            amortization: 100
            balance: 400
        }
         */
        var appropriationDict = {}
        var totalAmount = 0;
        $.each(otherStartUpCostsFirstYear, function (startUpItemId, startUpCostItemDict) {
            totalAmount += parseFloat(startUpCostItemDict['amount'] || 0);
        })

        // Get startup Cost amortization years
        var amortizationYears = parseInt($('#id_amortization_period').val() || $('#id_projection_years').val());
        if (amortizationYears == null) // This cannot be null
            return;

        // Get yearly amortization amount rounded to the nearest integer
        var amortizationAmountPerYear =  totalAmount / amortizationYears;
        // Get start projection period
        var startAmortizationYear = parseInt($('#id_first_financial_year').val());
        var endAmortizationYear = startAmortizationYear + amortizationYears;
        var openingBalance = totalAmount;
        while(startAmortizationYear < endAmortizationYear){
            appropriationDict[startAmortizationYear] = {}
            appropriationDict[startAmortizationYear]['cost'] = openingBalance;
            appropriationDict[startAmortizationYear]['amortization'] = amortizationAmountPerYear
            appropriationDict[startAmortizationYear]['balance'] = appropriationDict[startAmortizationYear]['cost'] - amortizationAmountPerYear
            openingBalance = appropriationDict[startAmortizationYear]['balance']
            startAmortizationYear++;
        }
        return appropriationDict;
    }

    function getOtherStartUpCostItems(){
        var startUpCostItemsPerMonthDict = {}
        var startUpCostItemsDict = getOtherStartUpCostItemsFirstYear()

        $.each(startUpCostItemsDict, function (startUpItemId, startUpItemDict) {
            startUpCostItemsPerMonthDict[startUpItemId] = {}
            startUpCostItemsPerMonthDict[startUpItemId]['name'] = startUpItemDict['name'];
            startUpCostItemsPerMonthDict[startUpItemId]['monthly'] = {}
            var counter = 0;
            var yearAdded = null;
            $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
                if(counter == 0){
                    // Add cost to the first monthly item
                    startUpCostItemsPerMonthDict[startUpItemId]['monthly'][projectionMonthIndex] = startUpItemDict['amount']
                    yearAdded = projectionMonth['year'];
                }else{
                    if(projectionMonth['is_total']  && projectionMonth['year'] == yearAdded){
                        startUpCostItemsPerMonthDict[startUpItemId]['monthly'][projectionMonthIndex] = startUpItemDict['amount']
                    }else{
                        startUpCostItemsPerMonthDict[startUpItemId]['monthly'][projectionMonthIndex] = 0;
                    }

                }
                counter++; // Increment counter
            })
        })
        // Distribute startup item costs
        return startUpCostItemsPerMonthDict;
    }

    function getOtherStartUpCostPerMonthTotals(otherStartUpCostsPerMonthList){
        var startUpCostPerMonthDict = {};
        var startupCostTotal = 0;
        //startUpCostItemsPerMonthDict[startUpItemId]['monthly'][projectionMonthIndex] = val
        $.each(otherStartUpCostsPerMonthList, function (startUpItemId, otherStartUpCostsPerItem ) {
            $.each(otherStartUpCostsPerItem['monthly'], function (projectionMonthIndex,  amount) {
                if(projectionMonthIndex.indexOf('_') < 0){  // Excluding year total values from summation
                    startupCostTotal += parseInt(amount,0);
                }
            })
        })



        // Amortize startup cost
        var amortizationYears = parseInt($('#id_amortization_period').val(), 10)
        if(amortizationYears == 0)
            return
        var amortizationMonthsCount = amortizationYears * countOfMonthsInFinancialYear;
        var monthlyAmortizationAmount = startupCostTotal / amortizationMonthsCount;
        var amortizedAmount = 0;
        var financialYearTotal = 0
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            // Check if this is total month
            if(projectionMonth['is_total'])
            {
                startUpCostPerMonthDict[projectionMonthIndex] =  financialYearTotal;
                // reset financialYearTotal
                financialYearTotal = 0;
            }
            else
            {
                if(amortizedAmount < startupCostTotal){
                    // Add amortization
                    startUpCostPerMonthDict[projectionMonthIndex] = monthlyAmortizationAmount;
                    amortizedAmount += monthlyAmortizationAmount;
                    financialYearTotal += monthlyAmortizationAmount
                }
                else
                {
                    startUpCostPerMonthDict[projectionMonthIndex] = 0;
                }
            }

        })

        return startUpCostPerMonthDict;
    }

    function getCashFlowClosingBalancePerYear(cashFlowClosingBalanceDuringTheYearPerMonth){
        var cashFlowClosingBalancePerYear = {}
        $.each(cashFlowClosingBalanceDuringTheYearPerMonth, function (projectionMonthIndex, closingBalance) {
            // split projection month index for year and month
            if(projectionMonthIndex.indexOf('Total') != -1){
                // This is a totals month
                // split on _ and pick the first value for the year
                var year = projectionMonthIndex.split('_')[0];
                if(year == null)
                    return;
                cashFlowClosingBalancePerYear[year] = parseFloat(closingBalance || 0);
            }
        })
        return cashFlowClosingBalancePerYear;
    }

    function generateCashFlowStatement(revenuePerProductPerMonth, revenueTotals, directCostTotals,
                                       employeeCostTotals, operatingCostPerMonthList, otherStartUpCostsPerMonthList,
                                       depositAmountPerMonthList, taxPerMonth, badDebtsPerMonthList,
                                       receivablesPerMonth, payablesPerMonth, otherExpensesPayablePerMonth,
                                       tangibleAssetInvestmentPerAssetPerMonth, intangibleAssetsInvestmentPerAssetPerMonth,
                                       shareCapitalInvestmentPerMonthDict, loanDebtInvestmentPerMonthDict,
                                       amortizationSchedule, depreciationPerAssetPerMonth
    ){

        var totalOutFlowsFromOperatingActivities = {};
        var netCashFlowFromOperatingActivities = {}     // Revenue - totalOuFlowFromOperatingActivities
        var netCashFlowsFromInvestingActivities = {}    // Tangible Assets Investment + Intangible Assets investment
        var debtAndInterestRepaymentPerMonth = getDebtAndInterestRepaymentPerMonth(amortizationSchedule);
        var netCashFlowFromFinancingActivities = {}     // Share Capital + Debt Capital - Repayment of Debt and Interest
        cashFlowChangesDuringTheYearPerMonth = {}   // netCashFlowFromOperatingActivities - netCashFlowsFromInvestingActivities + netCashFlowFromFinancingActivities
        var openingCashBalancePerMonth = {}
        closingCashBalancePerMonth = {}


        // Table header
        // Create table headtrade
        truncateTable('#tbl_cash_flow', true, true);

        var strHtml = '<thead><tr ><th class="td-md">Particulars </th>'
        $.each(projectionMonthsList, function(index, projectionMonthYear){
            var yearTotalClass = projectionMonthYear['is_total'] ? 'unit_year-total' : ''
            strHtml += '<th class="td-xs text-right ' + yearTotalClass + '" >'
                    +       projectionMonthYear['display'] + '<span class="span-currency"></span>';
                    +   '</th>'
        })
        strHtml += '</tr></thead><tbody></tbody>'
        $('#tbl_cash_flow').append(strHtml);

        // cashFlowFromOperatingActivities
        // cashFlowFromOperatingActivitiesInflow... Already done in PNL

        var rowCount = 0;
        $.each(revenuePerProductPerMonth, function (productIdIndex, productMonthlyRevenue) {
            // Inside each product
            var isHeaderRow = rowCount == 0 ? true : false;
            var strHtml = ''
            if(isHeaderRow){
                strHtml = '<tr>'
                        +     '<td class="text-underline">Cash Inflows from operating activities </td>'
                $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
                    strHtml += '<td></td>'
                })
                 strHtml +='</tr>'
                $('#tbl_cash_flow tbody').append(strHtml);
            }
            strHtml = '<tr>'
                    +    '<td class="">' + products[productIdIndex]['name'] + '</td>'
                            $.each(productMonthlyRevenue, function (monthIndex, monthlyRevenue) {
            strHtml +=    '<td class="monthly td-input td-xs readonly ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                            + ' data-is_total_col="' + 'Showistotal' + '"'
                                            + ' data-projection_month_id="' + 'Addmonth' +'" '
                                            + ' data-projection_year="' + 'Addyear' +'" '
                                            + ' width="200">'
                                            + '<input name="" '
                                            + ' type="text"'
                                            + ' value="'+ monthlyRevenue['revenue'] +'"'
                                            + ' class="form-control text-right rpt_presentation" readonly></td>'
                                    })
            $('#tbl_cash_flow tbody').append(strHtml);
            rowCount++;
        })

        // Total inflows from operating activities
        strHtml = '<tr class="">'
                +   '<td class="">Totals Cash Inflows from Operating Activities</td>'
        $.each(revenueTotals, function (monthIndex, monthlyRevenueTotal) {
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + monthlyRevenueTotal + '"'
                                        +       ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // Cash outflows header
        // Get total direct costs.. Already done in PNL
        rowCount = 0;
        strHtml = '<tr class="">'
                +   '<td class="">Direct Cost Totals</td>'
        $.each(directCostTotals, function (monthIndex, monthlyDirectCostTotal) {
            if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                totalOutFlowsFromOperatingActivities[monthIndex] = 0;
            }
            totalOutFlowsFromOperatingActivities[monthIndex] += parseInt(monthlyDirectCostTotal || 0);
            strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + monthlyDirectCostTotal + '"'
                                        +       ' class="form-control text-right rpt_presentation" readonly></td>'
            })
            strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // Get operating costs... Already done in PNL

        $.each(operatingCostPerMonthList, function (operatingCostIndex, monthlyOperatingCost) {
            strHtml = '<tr class="">'
                    +   '<td>'+ monthlyOperatingCost['name'] +'</td>'
            $.each(monthlyOperatingCost['monthly'], function (monthIndex, costDict) {
                var year = costDict['year'];
                var cost = parseFloat(costDict['cost']);

                if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                    totalOutFlowsFromOperatingActivities[monthIndex] = 0;
                }
                totalOutFlowsFromOperatingActivities[monthIndex] += cost;
                // Overall Cost value needs to be added
                strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + cost + '"'
                                        +       ' class="form-control text-right rpt_presentation" readonly></td>'

            })
            strHtml          +='</tr>'
            $('#tbl_cash_flow tbody').append(strHtml);
        })

        // OTHER START UP COSTS

        $.each(otherStartUpCostsPerMonthList, function (startUpCostItemId, monthlyStartUpCostDict) {
            strHtml = '<tr class="">'
                    +   '<td>'+ monthlyStartUpCostDict['name'] +'</td>'
            $.each(monthlyStartUpCostDict['monthly'], function (monthIndex, startUpCost) {
                // Overall Cost value needs to be added
                if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                    totalOutFlowsFromOperatingActivities[monthIndex] = 0;
                }
                totalOutFlowsFromOperatingActivities[monthIndex] += parseFloat(startUpCost || 0);


                strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + startUpCost + '"'
                                        +       ' class="form-control text-right rpt_presentation" readonly></td>'

            })
            strHtml          +='</tr>'
            $('#tbl_cash_flow tbody').append(strHtml);
        })
        // END --- OTHER START UP COSTS

        // DEPOSITS
        $.each(depositAmountPerMonthList, function (depositItemId, monthlyDepositItemDict) {
            strHtml = '<tr class="">'
                    +   '<td>'+ monthlyDepositItemDict['name'] +'</td>'
            $.each(monthlyDepositItemDict['monthly'], function (monthIndex, depositCost) {
                // Overall Cost value needs to be added
                if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                    totalOutFlowsFromOperatingActivities[monthIndex] = 0;
                }
                totalOutFlowsFromOperatingActivities[monthIndex] += parseFloat(depositCost || 0);
                strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                        + ' data-is_total_col="' + 'Showistotal' + '"'
                                        + ' data-projection_month_id="' + 'Addmonth' + '" '
                                        + ' data-projection_year="' + 'Addyear' + '" '
                                        + ' width="200">'
                                        +   '<input name="" '
                                        +       ' type="text"'
                                        +       ' value="' + depositCost + '"'
                                        +       ' class="form-control text-right rpt_presentation" readonly></td>'

            })
            strHtml          +='</tr>'
            $('#tbl_cash_flow tbody').append(strHtml);
        })
        // END--- DEPOSITS

        // TAX
        strHtml = '<tr class="">'
                +   '<td class="td-label">Tax</td>'
        $.each(taxPerMonth, function (monthIndex, taxAmount) {
            if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                totalOutFlowsFromOperatingActivities[monthIndex] = 0;
            }
            totalOutFlowsFromOperatingActivities[monthIndex] += parseFloat(taxAmount || 0);
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + taxAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);
        // END--- TAX

        // BAD DEBTS
        strHtml = '<tr class="">'
                +   '<td class="td-label">Bad Debts</td>'
        $.each(badDebtsPerMonthList, function (monthIndex, badDebtAmount) {
            if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                totalOutFlowsFromOperatingActivities[monthIndex] = 0;
            }
            totalOutFlowsFromOperatingActivities[monthIndex] += parseFloat(badDebtAmount || 0);
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + badDebtAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);
        // END--- BAD DEBTS


        // Trade receivables
        strHtml = '<tr class="">'
                +   '<td class="td-label">Trade Receivables</td>'
        $.each(receivablesPerMonth, function (monthIndex, receivableAmount) {
            if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                totalOutFlowsFromOperatingActivities[monthIndex] = 0;
            }
            totalOutFlowsFromOperatingActivities[monthIndex] += parseFloat(receivableAmount || 0);  // Note that receivables are added
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + receivableAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);


        // Trade Payables
        strHtml = '<tr class="">'
                +   '<td class="td-label">Trade Payables</td>'
        $.each(payablesPerMonth, function (monthIndex, payablesAmount) {
            if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                totalOutFlowsFromOperatingActivities[monthIndex] = 0;
            }
            totalOutFlowsFromOperatingActivities[monthIndex] += parseFloat(payablesAmount || 0);
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + payablesAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);


        // Other expenses payable


        strHtml = '<tr class="">'
                +   '<td class="td-label">Other expenses payable</td>'
        $.each(otherExpensesPayablePerMonth, function (monthIndex, otherExpensesPayablesAmount) {
            if(totalOutFlowsFromOperatingActivities[monthIndex] == null){
                totalOutFlowsFromOperatingActivities[monthIndex] = 0;
            }
            totalOutFlowsFromOperatingActivities[monthIndex] += parseFloat(otherExpensesPayablesAmount || 0);
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + otherExpensesPayablesAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // TOTAL OUTFLOW FROM OPERATING ACTIVITIES
        strHtml = '<tr class="tr-totals">'
                +   '<td class="td-label">Total Outflows from Operating Activities</td>'
        $.each(totalOutFlowsFromOperatingActivities, function (monthIndex, totalOutflowAmount) {
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + totalOutflowAmount + '"'
                    +           ' class="form-control text-right rpt_presentation"readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // cashFlowFromOperatingActivitiesOutflow
        // Net cashflow from operating activities: cashFlowFromOperatingActivitiesNet
        $.each(revenueTotals, function (monthIndex, revenueAmount) {
            netCashFlowFromOperatingActivities[monthIndex] = parseFloat(revenueAmount || 0) - parseFloat(totalOutFlowsFromOperatingActivities[monthIndex] || 0);
        })
        strHtml = '<tr class="">'
                +   '<td class="td-label">Net Cash Flow from Operating Activities</td>'
        $.each(netCashFlowFromOperatingActivities, function (monthIndex, netCahsFlowAmount) {
        strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +   ' data-is_total_col="' + 'Showistotal' + '"'
                    +   ' data-projection_month_id="' + 'Addmonth' + '" '
                    +   ' data-projection_year="' + 'Addyear' + '" '
                    +   ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + netCahsFlowAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml          +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // Cash flow from investing activities
        // TANGIBLE ASSETS
        $.each(tangibleAssetInvestmentPerAssetPerMonth, function (assetId, tangibleAssetInvestment) {
            strHtml = '<tr class="">'
                    +   '<td class="td-label">' + tangibleAssetInvestment['name'] + '</td>'
            $.each(tangibleAssetInvestment['months'], function (projectionMonthIndex, investmentAmount) {
                if(netCashFlowsFromInvestingActivities[projectionMonthIndex] == null){
                    netCashFlowsFromInvestingActivities[projectionMonthIndex] = 0;
                }
                netCashFlowsFromInvestingActivities[projectionMonthIndex] += parseFloat(investmentAmount || 0);
            strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' data-is_total_col="' + 'Showistotal' + '"'
                    +       ' data-projection_month_id="' + 'Addmonth' + '" '
                    +       ' data-projection_year="' + 'Addyear' + '" '
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + investmentAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

            })
            strHtml +='</tr>'
            $('#tbl_cash_flow tbody').append(strHtml);
        })

        // INTANGIBLE ASSETS
        $.each(intangibleAssetsInvestmentPerAssetPerMonth, function (assetId, intangibleAssetInvestment) {
            strHtml = '<tr class="">'
                    +   '<td class="td-label">' + intangibleAssetInvestment['name'] + '</td>'
            $.each(intangibleAssetInvestment['months'], function (projectionMonthIndex, investmentAmount) {
                if(netCashFlowsFromInvestingActivities[projectionMonthIndex] == null){
                    netCashFlowsFromInvestingActivities[projectionMonthIndex] = 0;
                }
                netCashFlowsFromInvestingActivities[projectionMonthIndex] += parseFloat(investmentAmount || 0);
            strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' data-is_total_col="' + 'Showistotal' + '"'
                    +       ' data-projection_month_id="' + 'Addmonth' + '" '
                    +       ' data-projection_year="' + 'Addyear' + '" '
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + investmentAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

            })
            strHtml +='</tr>'
            $('#tbl_cash_flow tbody').append(strHtml);
        })

        // Net cash flow from investing activities
        strHtml = '<tr class="tr-totals">'
                    +   '<td class="td-label">Net Cash used in Investing Activities</td>'
        $.each(netCashFlowsFromInvestingActivities, function (projectionMonthIndex, investmentAmount) {
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + investmentAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // Cash flow from financing activities
        //shareCapitalInvestmentPerMonthDict, loanDebtInvestmentPerMonthDict
        // SHARE CAPITAL
        strHtml = '<tr class="">'
                    +   '<td class="td-label">Share Capital</td>'
        $.each(shareCapitalInvestmentPerMonthDict, function (projectionMonthIndex, investmentAmount) {
            if(netCashFlowFromFinancingActivities[projectionMonthIndex] == null){
                netCashFlowFromFinancingActivities[projectionMonthIndex] = 0;
            }
            netCashFlowFromFinancingActivities[projectionMonthIndex] += parseFloat(investmentAmount || 0 )
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + investmentAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // DEBT LOAN
        strHtml = '<tr class="">'
                    +   '<td class="td-label">Debt</td>'
        $.each(loanDebtInvestmentPerMonthDict, function (projectionMonthIndex, investmentAmount) {
            if(netCashFlowFromFinancingActivities[projectionMonthIndex] == null){
                netCashFlowFromFinancingActivities[projectionMonthIndex] = 0;
            }
            netCashFlowFromFinancingActivities[projectionMonthIndex] += parseFloat(investmentAmount || 0 )
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + investmentAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // DEBT AND INTEREST REPAYMENT
        // --NB: This is supposed to be subtracted from netCashFlowsFromFinancingActivities
        strHtml = '<tr class="">'
                    +   '<td class="td-label">Repayment of Debt and interest</td>'
        $.each(debtAndInterestRepaymentPerMonth, function (projectionMonthIndex, repaymentAmount) {
            if(netCashFlowFromFinancingActivities[projectionMonthIndex] == null){
                netCashFlowFromFinancingActivities[projectionMonthIndex] = 0;
            }
            netCashFlowFromFinancingActivities[projectionMonthIndex] -= parseFloat(repaymentAmount || 0 )
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + repaymentAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // Net cash flows from financing activities
        strHtml = '<tr class="tr-totals">'
                    +   '<td class="td-label">Net Cash Flow From Financing Activities</td>'
        $.each(netCashFlowFromFinancingActivities, function (projectionMonthIndex, netAmount) {
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + netAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);


        // Changes in cash during the year
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            var operatingAmount = parseFloat(netCashFlowFromOperatingActivities[projectionMonthIndex] || 0);
            var investingAmount = parseFloat(netCashFlowsFromInvestingActivities[projectionMonthIndex] || 0);
            var financingAmount = parseFloat(netCashFlowFromFinancingActivities[projectionMonthIndex] || 0 )
            cashFlowChangesDuringTheYearPerMonth[projectionMonthIndex] = operatingAmount - investingAmount + financingAmount;
        })

        strHtml = '<tr class="">'
                    +   '<td class="td-label">Changes in Cash During the Year</td>'
        $.each(cashFlowChangesDuringTheYearPerMonth, function (projectionMonthIndex, changeAmount) {
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + changeAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        var openingBalance = 0;
        var openingYearBalance = 0;
        $.each(projectionMonthsList, function (projectionMonthIndex, projectionMonth) {
            if(projectionMonth['is_total']){
                // Set year opening balance
                openingCashBalancePerMonth[projectionMonthIndex] = openingYearBalance
                // Need to compute cashflow changes during the year
                var totalOperatingCashFlow = parseInt(netCashFlowFromOperatingActivities[projectionMonthIndex], 0)
                totalOperatingCashFlow = isNaN(totalOperatingCashFlow) ? 0 : totalOperatingCashFlow;
                var totalInvestingCashFlow = parseInt(netCashFlowsFromInvestingActivities[projectionMonthIndex], 0)
                totalInvestingCashFlow = isNaN(totalInvestingCashFlow) ? 0 : totalInvestingCashFlow;
                var totalFinancingCashFlow = parseInt(netCashFlowFromFinancingActivities[projectionMonthIndex], 0)
                totalFinancingCashFlow  = isNaN(totalFinancingCashFlow) ? 0 : totalFinancingCashFlow
                var changesDuringTheYearTotal = totalOperatingCashFlow - totalInvestingCashFlow + totalFinancingCashFlow;
                cashFlowChangesDuringTheYearPerMonth[projectionMonthIndex] = changesDuringTheYearTotal;
                closingCashBalancePerMonth[projectionMonthIndex] = openingYearBalance + changesDuringTheYearTotal

                // Update year opening balance
                openingYearBalance = openingYearBalance + changesDuringTheYearTotal
            }else{
                openingCashBalancePerMonth[projectionMonthIndex] = openingBalance;
                closingCashBalancePerMonth[projectionMonthIndex] = openingBalance + cashFlowChangesDuringTheYearPerMonth[projectionMonthIndex];
                openingBalance = closingCashBalancePerMonth[projectionMonthIndex];
            }

        })

        // Opening cash balance -- Row cashBalancePerYear
        strHtml = '<tr class="">'
                    +   '<td class="td-label">Opening Cash Balance</td>'
        $.each(openingCashBalancePerMonth, function (projectionMonthIndex, balanceAmount) {
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + balanceAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // Closing cash balance -- Row
        strHtml = '<tr class="tr-totals">'
                    +   '<td class="td-label">Closing Cash Balance</td>'
        $.each(closingCashBalancePerMonth, function (projectionMonthIndex, balanceAmount) {
        strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' data-is_total_col="' + 'Showistotal' + '"'
                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                +       ' data-projection_year="' + 'Addyear' + '" '
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           'value="' + balanceAmount + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'

        })
        strHtml +='</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        // Other calculations
        strHtml = '<tr class="tr-totals">'
                +   '<td colspan="'+ ((projectionYears * countOfMonthsInFinancialYear) + 1) +'" class="text-underline">Other Calculations</td>'
                + '</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);
        // Depreciation
        strHtml = '<tr class="tr-totals">'
                +   '<td colspan="'+ ((projectionYears * countOfMonthsInFinancialYear) + 1) +'" class="td-label">Depreciation</td>'
                + '</tr>'
        $('#tbl_cash_flow tbody').append(strHtml);

        //depreciationPerAssetPerMonth
        $.each(depreciationPerAssetPerMonth, function (assetId, depreciationPerAsset) {
            strHtml = '<tr class="">'
                    +   '<td class="td-label">' + (getAssetNameFromId(assetId) || '') + '</td>'
            $.each(depreciationPerAsset, function (monthIndex, depreciationAmountPerMonth) {
            strHtml +=  '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' data-is_total_col="' + 'Showistotal' + '"'
                    +       ' data-projection_month_id="' + 'Addmonth' + '" '
                    +       ' data-projection_year="' + 'Addyear' + '" '
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           'value="' + depreciationAmountPerMonth + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'

            })
            strHtml +='</tr>'
            $('#tbl_cash_flow tbody').append(strHtml);
        })

        // Returning Changes in cashflow during the year

        //update formatting
        updateReportPresentation('#tbl_cash_flow');

        return closingCashBalancePerMonth;
    }

    // Balance Sheet

    function generateBalanceSheet(tangibleAssetInvestmentDict, intangibleAssetsInvestmentDict,
            depreciationPerAssetPerMonth, depositAmountPerItemPerYearTotals,
            receivableTotalsPerYear, payableTotalsPerYear, otherExpensesPayableTotalsPerYear,
            cashFlowClosingBalancePerYear, shareCapitalDict, loanDebtDict, EATPerYear,
            amortizationSchedule,monthlyInterestOnDebt
    ){
        var tangibleAssetsInvestmentPerYear = getInvestmentPerAssetPerYear(tangibleAssetInvestmentDict);
        var depreciationPerAssetPerYear = getDepreciationPerAssetPerYear(depreciationPerAssetPerMonth);     // Depreciation on tangible assets
        var tangibleAssetsBalancePerYear = {};
        tangibleAssetsBalanceTotal = {}
        var intangibleAssetsInvestmentPerYear = getInvestmentPerAssetPerYear(intangibleAssetsInvestmentDict);
        intangibleAssetsBalanceTotal = {}
        var totalFixedAssets = {};
        var totalCurrentAssets = {}
        var otherStartUpCostsFirstYear = getOtherStartUpCostItemsFirstYear();
        var otherStartUpCostAppropriatedOverAmortizationYears = appropriateOtherStartUpCostsOverAmortizationYears(otherStartUpCostsFirstYear)
        totalAssets = {} // Given by Total Fixed Assets + Total Current Assets + Total Misc. Assets
        var totalCapital = {} // Given by Share Capital + Reserves & Surpluses + Profit/Loss for the year
        var totalCurrentLiabilities = {} // Trade payables + Other Expenses Payables
        totalLiabilities = {} // Given by Total current liabilities + Net debt + total capital
        var debtAndInterestRepaymentPerYear = getDebtAndInterestRepaymentPerYear(amortizationSchedule);
        var interestOnDebtRepaymentPerYear = getInterestRepaymentOnDebtPerYear(monthlyInterestOnDebt)

        var debtRepaymentPerYear = {} // Given by debtAndInterestRepaymentPerYear - interestOnDebtRepaymentPerYear
        var netDebtPerYear  = {} //


        // Header
        truncateTable('#tbl_balance_sheet', true, true);
        var strHtml = '<thead><tr ><th class="td-md">Particulars </th>'
        $.each(projectionYearsList, function(index, projectionYear){
            strHtml += '<th class="td-xs text-right" >'
                    +       projectionYear + '<span class="span-currency"></span>';
                    +   '</th>'
        })
        strHtml += '</tr></thead><tbody></tbody>'
        $('#tbl_balance_sheet').append(strHtml);

        // Tangible Assets
        // Tangible assets header
        strHtml = '<tr ><td class="text-underline">Tangible Assets </td>'
        $.each(projectionYearsList, function (index, year) {
            strHtml += '<td> </td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Tangible assets listing
        $.each(tangibleAssetsInvestmentPerYear, function (assetId, tangibleAssetInvestment) {
            var name = tangibleAssetInvestment['name'];
            strHtml = '<tr>'
                    +       '<td class="td-label">' + name +'</td>'
            $.each(tangibleAssetInvestment['years'], function (projectionYear, investmentAmount) {
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' data-is_total_col="' + 'Showistotal' + '"'
                    +       ' data-projection_month_id="' + 'Addmonth' + '" '
                    +       ' data-projection_year="' + 'Addyear' + '" '
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + investmentAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
            })
            strHtml += '</tr>'
            $('#tbl_balance_sheet tbody').append(strHtml);

            // Check on Depreciation per Asset year here..
            strHtml = '<tr>'
                    +       '<td class="td-label">Depreciation</td>'
            $.each(depreciationPerAssetPerYear, function (depAssetId, assetDepreciation) {
                if(assetId == depAssetId){
                    tangibleAssetsBalancePerYear[assetId] = {}
                    $.each(assetDepreciation, function (projectionYear, depreciationAmount) {

                        tangibleAssetsBalancePerYear[assetId][projectionYear] = parseFloat(tangibleAssetsInvestmentPerYear[assetId]['years'][projectionYear]) - parseFloat(depreciationAmount)
                        strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                +       ' data-is_total_col="' + 'Showistotal' + '"'
                                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                                +       ' data-projection_year="' + 'Addyear' + '" '
                                +       ' width="200">'
                                +       '<input name="" '
                                +           ' type="text"'
                                +           ' value="' + depreciationAmount  + '"'
                                +           ' class="form-control text-right rpt_presentation" readonly></td>'
                    })
                        strHtml += '</tr>'
                    $('#tbl_balance_sheet tbody').append(strHtml);
                }
            })

            // Balance for each
            strHtml = '<tr class="tr-totals">'
                    +       '<td class="td-label">Balance</td>'
            $.each(tangibleAssetsBalancePerYear, function (balAssetId, assetBalance) {
                if(assetId == balAssetId){
                    $.each(assetBalance, function (projectionYear, balanceAmount) {
                        if(tangibleAssetsBalanceTotal[projectionYear] == null){
                            tangibleAssetsBalanceTotal[projectionYear] = 0;
                        }
                        tangibleAssetsBalanceTotal[projectionYear] += parseInt(balanceAmount || 0);
                        strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                +       ' data-is_total_col="' + 'Showistotal' + '"'
                                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                                +       ' data-projection_year="' + 'Addyear' + '" '
                                +       ' width="200">'
                                +       '<input name="" '
                                +           ' type="text"'
                                +           ' value="' + balanceAmount + '"'
                                +           ' class="form-control text-right rpt_presentation" readonly></td>'
                        })
                        strHtml += '</tr>'
                        $('#tbl_balance_sheet tbody').append(strHtml);
                }
            })
        })

        // Tangible AssetsTotals
        strHtml = '<tr class="tr-totals">'
                    +       '<td class="td-label">Total Tangible Assets</td>'
        $.each(tangibleAssetsBalanceTotal, function (projectionYear, totalBalanceAmount) {
            if(totalFixedAssets[projectionYear] == null){
                totalFixedAssets[projectionYear] = 0;
            }
            totalFixedAssets[projectionYear] += parseFloat(totalBalanceAmount || 0);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                +       ' data-is_total_col="' + 'Showistotal' + '"'
                                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                                +       ' data-projection_year="' + 'Addyear' + '" '
                                +       ' width="200">'
                                +       '<input name="" '
                                +           ' type="text"'
                                +           ' value="' + totalBalanceAmount + '"'
                                +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        //--- Intangible Assets
        $.each(intangibleAssetsInvestmentPerYear, function (assetId, intangibleAssetInvestment) {
            var name = intangibleAssetInvestment['name'];
            strHtml = '<tr>'
                    +       '<td class="td-label">' + name +'</td>'
            $.each(intangibleAssetInvestment['years'], function (projectionYear, investmentAmount) {
                if(intangibleAssetsBalanceTotal[projectionYear] == null){
                    intangibleAssetsBalanceTotal[projectionYear] = 0;
                }
                intangibleAssetsBalanceTotal[projectionYear] += parseFloat(investmentAmount || 0);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' data-is_total_col="' + 'Showistotal' + '"'
                    +       ' data-projection_month_id="' + 'Addmonth' + '" '
                    +       ' data-projection_year="' + 'Addyear' + '" '
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + investmentAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
            })
            strHtml += '</tr>'
            $('#tbl_balance_sheet tbody').append(strHtml);
        })

        // Intangible AssetsTotals
        strHtml = '<tr class="tr-totals">'
                    +       '<td class="td-label">Total Intangible Assets</td>'
        $.each(intangibleAssetsBalanceTotal, function (projectionYear, totalBalanceAmount) {
            if(totalFixedAssets[projectionYear] == null){
                totalFixedAssets[projectionYear] = 0;
            }
            totalFixedAssets[projectionYear] += parseFloat(totalBalanceAmount || 0);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                +       ' data-is_total_col="' + 'Showistotal' + '"'
                                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                                +       ' data-projection_year="' + 'Addyear' + '" '
                                +       ' width="200">'
                                +       '<input name="" '
                                +           ' type="text"'
                                +           ' value="' + totalBalanceAmount + '"'
                                +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Total Fixed Assets
        strHtml = '<tr class="tr-totals">'
                    +       '<td class="td-label">Total Fixed Assets</td>'
        $.each(totalFixedAssets, function (projectionYear, totalBalanceAmount) {
            totalAssets[projectionYear] = (totalAssets[projectionYear] || 0) + totalBalanceAmount;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                +       ' data-is_total_col="' + 'Showistotal' + '"'
                                +       ' data-projection_month_id="' + 'Addmonth' + '" '
                                +       ' data-projection_year="' + 'Addyear' + '" '
                                +       ' width="200">'
                                +       '<input name="" '
                                +           ' type="text"'
                                +           ' value="' + totalBalanceAmount + '"'
                                +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Current Assets
        // 1. Current Assets TITLE
        strHtml = '<tr>'
                +  '<td class="td-label text-underline">Current Assets</td>'
        $.each(projectionYearsList, function (index, year) {
            strHtml += '<td> </td>'
        })
        strHtml +='</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);
        // 2. Rental Deposit and Other Deposits given by depositAmountPerItemPerYearTotals
        $.each(depositAmountPerItemPerYearTotals, function (depositItemId, depositItemDict) {
            strHtml = '<tr>'
                    +       '<td class="td-label">'+ depositItemDict['name'] +'</td>'
            $.each(depositItemDict['yearly'], function (projectionYear, depositAmount) {
                // Increment total current assets
                totalCurrentAssets[projectionYear] = (totalCurrentAssets[projectionYear] || 0) + depositAmount;
                strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                        +       ' width="200">'
                        +       '<input name="" '
                        +           ' type="text"'
                        +           ' value="' + depositAmount + '"'
                        +           ' class="form-control text-right rpt_presentation" readonly></td>'
            })
            strHtml += '</tr>'
            $('#tbl_balance_sheet tbody').append(strHtml);
        })

        // 2. Trade Receivables
        strHtml = '<tr>'
                +       '<td class="td-label">Trade Receivables</td>'
        $.each(receivableTotalsPerYear, function (projectionYear, receivablesAmount) {
            // Increment total current assetes
            totalCurrentAssets[projectionYear] = (totalCurrentAssets[projectionYear] || 0) + receivablesAmount;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + receivablesAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // 3. Cash Balance Per Year
        strHtml = '<tr>'
                +       '<td class="td-label">Cash Balance</td>'
        $.each(cashFlowClosingBalancePerYear, function (projectionYear, cashBalance) {
            totalCurrentAssets[projectionYear] = (totalCurrentAssets[projectionYear] || 0) + cashBalance;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + cashBalance + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Total Current Assets
        strHtml = '<tr class="tr-totals">'
                +       '<td class="td-label">Total Current Assets</td>'
        $.each(totalCurrentAssets, function (projectionYear, currentAssetsAmount) {
            totalAssets[projectionYear] = (totalAssets[projectionYear] || 0) + currentAssetsAmount;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + currentAssetsAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // 4. Misc. Assets(Other Startup Costs
        strHtml = '<tr>'
                +       '<td class="td-label text-underline">Misc. Assets</td>'
        $.each(projectionYearsList, function (index, year) {
            strHtml += '<td> </td>'
        })
        strHtml +='</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);
        // 4.1 Start-up Cost
        strHtml = '<tr>'
                +       '<td class="td-label">Start-up Cost</td>'
        $.each(otherStartUpCostAppropriatedOverAmortizationYears, function (projectionYear, startUpCostDict) {
            if(projectionYearsList.indexOf(parseInt(projectionYear)) < 0)
                return;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                +       ' width="200">'
                +       '<input name="" '
                +           ' type="text"'
                +           ' value="' + startUpCostDict['cost'] + '"'
                +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);
        // 4.2 Amortization of Start-up Cost
        strHtml = '<tr>'
                +       '<td class="td-label">Amortization of Start-up Cost</td>'
        $.each(otherStartUpCostAppropriatedOverAmortizationYears, function (projectionYear, startUpCostDict) {
            if(projectionYearsList.indexOf(parseInt(projectionYear)) < 0)
                return;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + startUpCostDict['amortization'] + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);
        // 4.3 Balance
        strHtml = '<tr class="tr-totals">'
                +       '<td class="td-label">Balance</td>'
        $.each(otherStartUpCostAppropriatedOverAmortizationYears, function (projectionYear, startUpCostDict) {
            if(projectionYearsList.indexOf(parseInt(projectionYear)) < 0)
                return;
            totalAssets[projectionYear] = (totalAssets[projectionYear] || 0) + (startUpCostDict['balance'] || 0);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + startUpCostDict['balance'] + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);


        // Total Assets
        //-----------
        strHtml = '<tr class="tr-totals">'
                +       '<td class="td-label">Total Assets</td>'
        $.each(totalAssets, function (projectionYear, totalAmount) {
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + totalAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Liabilities
        strHtml =   '<tr>'
                    +       '<td class="td-label text-underline">Liabilities</td>'
        $.each(projectionYearsList, function (index, year) {
            strHtml += '<td> </td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Share Capital
        var cumulativeCapital = 0;
        strHtml = '<tr>'
                +       '<td class="td-label">Share Capital</td>'
        $.each(shareCapitalDict, function (investmentYear, investmentDict) {
            var yearCapital = parseInt(investmentDict['investment']);
            cumulativeCapital += yearCapital;
            totalCapital[investmentYear] = cumulativeCapital;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + cumulativeCapital + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);


        // Reserves & Surplus:- needs to be computed
        var reservesAndSurplusesPerYear = getReservesAndSurplusesPerYear(EATPerYear);
        strHtml = '<tr>'
                +       '<td class="td-label">Reserves & Surpluses</td>'
        $.each(reservesAndSurplusesPerYear, function (projetionYear, amount) {
            totalCapital[projetionYear] = parseFloat(totalCapital[projetionYear] || 0) + parseFloat(amount);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + amount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Profit/Loss for the year
        strHtml = '<tr>'
                +       '<td class="td-label">Profit/Loss for the Year</td>'
        $.each(EATPerYear, function (projetionYear, amount) {
            totalCapital[projetionYear] = parseFloat(totalCapital[projetionYear] || 0) + parseFloat(amount);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + amount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);


        // Total Capital
        strHtml = '<tr class="tr-totals">'
                +       '<td class="td-label">Total Capital</td>'
        $.each(totalCapital, function (projectionYear, amount) {
            if(totalLiabilities[projectionYear] == null){
                totalLiabilities[projectionYear] = 0;
            }
            totalLiabilities[projectionYear] += amount;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + amount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Non-current Liabilities:- Header
        strHtml =   '<tr>'
                    +       '<td class="td-label text-underline">Non-current Liabilities</td>'
        $.each(projectionYearsList, function (index, year) {
            strHtml += '<td> </td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);
        // Debt
        // We have debt
        // debt repayment
        //console.log()
        $.each(projectionYearsList, function (yearIndex, yearString) {
            debtRepaymentPerYear[yearString] = parseInt(debtAndInterestRepaymentPerYear[yearString] || 0) - parseFloat(interestOnDebtRepaymentPerYear[yearString] || 0)
        })

        var netDebtPreviousYear = 0
        var debtTotalsPerYear = {}
        $.each(loanDebtDict, function (investmentYear, investmentDict) {
            if (netDebtPerYear[investmentYear] == null)
                netDebtPerYear[investmentYear] = 0
            netDebtPerYear[investmentYear] = investmentDict['investment'] - debtRepaymentPerYear[investmentYear] + netDebtPreviousYear;
            debtTotalsPerYear[investmentYear] = parseFloat(investmentDict['investment'] || 0) + parseFloat(netDebtPreviousYear)
            // Increment totalLiabilities
            if(totalLiabilities[investmentYear] == null)
                totalLiabilities[investmentYear] = 0
            totalLiabilities[investmentYear] += netDebtPerYear[investmentYear]
            // Adjust net debt previous year
            netDebtPreviousYear = netDebtPerYear[investmentYear];
        })

        // Adding debt rows:-
        // 1. debtTotalsPerYear
        strHtml = '<tr>'
                +       '<td class="td-label">Debt</td>'
        $.each(debtTotalsPerYear, function (projetionYear, amount) {
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + amount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // 2. payment of debt
        strHtml = '<tr>'
                +       '<td class="td-label">Payment of Debt</td>'
        $.each(debtRepaymentPerYear, function (projetionYear, amount) {
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + amount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // 3. Net debt
        strHtml = '<tr>'
                +       '<td class="td-label">Net Debt</td>'
        $.each(netDebtPerYear, function (projetionYear, amount) {
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + amount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);




        // Current Liabilities:- header
         strHtml =   '<tr>'
                    +       '<td class="td-label text-underline">Current Liabilities</td>'
         $.each(projectionYearsList, function (index, year) {
            strHtml += '<td> </td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);
        // Trade payables
        strHtml = '<tr>'
                +       '<td class="td-label">Trade Payables</td>'
        $.each(payableTotalsPerYear, function (projectionYear, payablesAmount) {
            if(totalCurrentLiabilities[projectionYear] == null){
                totalCurrentLiabilities[projectionYear] = 0;
            }
            totalCurrentLiabilities[projectionYear] += parseFloat(payablesAmount || 0);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + payablesAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Other Expenses Payables
        strHtml = '<tr>'
                +       '<td class="td-label">Other Expenses Payables</td>'
        var cumulativePayables = 0;
        $.each(otherExpensesPayableTotalsPerYear, function (projectionYear, payablesAmount) {
            if(totalCurrentLiabilities[projectionYear] == null){
                totalCurrentLiabilities[projectionYear] = 0;
            }
            cumulativePayables += parseFloat(payablesAmount || 0)
            totalCurrentLiabilities[projectionYear] -= cumulativePayables;
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + cumulativePayables + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        // Total Current Liabilities
        strHtml = '<tr class="tr-totals">'
                +       '<td class="td-label">Total Current Liabilities</td>'
        $.each(totalCurrentLiabilities, function (projectionYear, liabilityAmount) {
            if(totalLiabilities[projectionYear] == null){
                totalLiabilities[projectionYear] = 0;
            }
            totalLiabilities[projectionYear] += parseFloat(liabilityAmount || 0);
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + liabilityAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);


        // Total Liabilities
        strHtml = '<tr class="tr-totals">'
                +       '<td class="td-label">Total Liabilities</td>'
        $.each(totalLiabilities, function (projectionYear, liabilityAmount) {
            // Increment total current assetes
            strHtml += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                    +       ' width="200">'
                    +       '<input name="" '
                    +           ' type="text"'
                    +           ' value="' + liabilityAmount + '"'
                    +           ' class="form-control text-right rpt_presentation" readonly></td>'
        })
        strHtml += '</tr>'
        $('#tbl_balance_sheet tbody').append(strHtml);

        updateReportPresentation('#tbl_balance_sheet')
        // Check total assets should be equal to total liabilities
        // End of balance Sheet
        //
    }

    function markAsInvalid(val){
        $(val).css('border', '1px solid #E85445');
        $(val).css('background-color', '#FAEDEC');
    }

    function markAsValid(val){
        $(val).css('border', '1px solid #ccc');
        $(val).css('background-color', '#fff');
    }

    function validateRequired(stepId){
        var validated = true;
        var returnObject = {};
        // validate for each validate_step
        $.each(stepMonitor[stepId]['validate_steps'], function (index, containerId) {
           var requiredFinance1Inputs = $(containerId + ' .render_required');
            $.each(requiredFinance1Inputs, function(index, val){
                var itemVal = $(val).val();
                if(!itemVal || itemVal == '') {
                    // Change css and give a red border
                    markAsInvalid(val)
                    if(returnObject[containerId] == null)
                        returnObject[containerId] = 0
                    returnObject[containerId] += 1; // Number of errors
                    validated = false;
                }else{
                    markAsValid(val)
                }
            })
        })
        if(!validated)  // Return item if not validated
            return returnObject;
        return null
    }

    // Ensure everything is update when changed
    $('#page_title input,textarea,select').change(function(event){
        $(this).attr('value', $(this).val());
    })

    $('#financial_assumptions input,textarea,select').change(function(event){
        $(this).attr('value', $(this).val());
    })

    $('.tabbable .nav-tabs li a').click(function (event) {
        // This is suppose to handle a few things
        var clickedStep = $(this).data('step');
        var previousStep = currentStepId;       // This is important. We note the step we are moving from
        var mode = $('#right_col').data('mode');
        // Check if previous step has been generated
        // work with the step monitor to determine if regeneration is necessary or not

        var validateResults = validateRequired(clickedStep) // validateRequired returns null if everything is validated, otherwise it returns an object
        // Show alert if messages exist
        if(validateResults != null){
            // Ensure you validate required fields before moving to new tab
            var clickedFriendlyName = stepMonitor[clickedStep]['friendly_name'];
            $('#message-dialog .header').text("Validation messages");
            $('#message-dialog .message').text('Provide missing details in the pages listed below to proceed to the ' + clickedFriendlyName)
            var listingTable = '<table class="table table-striped"><thead><tr><td class="td-md text-left">Page</td><td class="dt-sm text-right"># Errors</td</tr></thead><tbody>';
            var listingTableBody = '<tbody>'
            $.each(validateResults, function (sId, countOfErrors) {
                var fName = $(sId).data('friendly_name');
                listingTableBody += '<tr><td class="text-left">' + fName + '</td><td class="text-right">' + countOfErrors + '</td></tr>'
            })
            listingTable += listingTableBody;
            listingTable += '</body></table>'
            $('#message-dialog .table-container').html(listingTable)
            $('#message-dialog').modal("show")
            event.preventDefault();
            return false;
        }
        // Do any necessary auto-generations
        stepMonitor[clickedStep]['passed'] = true;
        if(currentStepId != clickedStep){
            if(currentStepId == '#step-1'){
                saveTitlePage();
            }else if(currentStepId == '#step-2'){
                saveMainContent()
            }else if(currentStepId == '#step-3'){
                saveFinancialAssumptions()
            }else if(currentStepId == '#step-4'){
                saveFinancialDataInput()
                stepMonitor['#step-4']['auto_generate'] = false
                stepMonitor['#step-4']['passed'] = true
            }else if(currentStepId == '#step-5'){
                // Nothing needs to be save for step 5
            }


            // Check if clicked step requires generation

            if(clickedStep == '#step-4'){
                $('#btn_regenerate_page').removeClass('hidden')
                if(stepMonitor[clickedStep]['auto_generate'] == true) {
                    // Autogenerate if necessary
                    // generate projectionYearsList
                    toggleSpinner(true, 'Generating financial data input tables/fields!')
                    generatePrijectionYearsList();
                    generateProjectionMonthsList();

                    //console.log(projectionYearsList);
                    generatePricePerProductTable();
                    generateDirectCostPerProductTable();
                    generateUnitOfRevenueMeasurementTable();

                    // Generate Operational costs table
                    generateOperatingCostsTable();
                    //console.log("Generate pricing tables btn has been clicked");

                    // Generating employee tables
                    generateEmployeeRolesListTable();
                    generateEmployeeWorkingHoursTable();
                    generateEmployeeHourlyRatesTable();

                    // Generating sources tables
                    generateCapitalTable();
                    generateUsageTangibleAssetsTable();
                    generateUsageInTangibleAssetsTable();

                    generateUsageDepositsTable();
                    generateUsageOtherStartupCostsTable();

                    // Unbind/ bind events
                    $('.number-input-format').unbind('keydown')
                    $('.number-input-format').keydown(numberFormatKeyDownHandler)


                    // Update currency symbols after every regeneration
                    updateCurrency(getCurrency());

                    toggleSpinner(false, 'Done!')
                }
            }else if(clickedStep == '#step-5' ){
                $('#btn_regenerate_page').removeClass('hidden')
                if(!reportsGenerated) {
                    toggleSpinner(true, 'Generating reports!')
                    generatePNL_RevenuesTable();

                    // Generate graphs
                    prepareAndRenderTotalAssetsBar();
                    prepareAndRenderTotalLiabilitiesBar();
                    prepareAndRenderFixedAssetClassificationBar();
                    prepareAndRenderCashFlowAnalysisBar();
                    prepareAndRenderTotalRevenueBar();
                    prepareAndRenderTotalDirectCostBar();
                    prepareAndRenderGrossProfitBar();
                    prepareAndRenderTotalOperatingCostBar();
                    prepareAndRenderEarningsAfterTaxtBar();
                    prepareAndRenderNetMarginBar();

                    // update currencies after every generation
                    updateCurrency(getCurrency());

                    stepMonitor[clickedStep]['auto_generate'] = false
                    stepMonitor[clickedStep]['passed'] = true
                    reportsGenerated = true
                    toggleSpinner(false, 'Done!')
                }
            }else{
                $('#btn_regenerate_page').addClass('hidden')
            }
        }else{
            // Nothing to be done here.....
        }
        // Update currentStepId after moving to the new tab
        currentStepId = clickedStep;
    })

    $('#frm_bplanner').submit(function(event){
        event.preventDefault();
        // This should then proceed to submit as default..

        var inputFields = $('#frm_bplanner input,textarea,select');
        $.each(inputFields, function (index, inputField) {
            $(inputField).attr('value', $(inputField).val());
        })
        // retrieve the various sections
        var mainContent = String($('#editor-one').html());
        var financialAssumptions = String($('#financial_assumptions').html());
        var financialInput = String($('#financial_data_input').html());
        var rptPnl = String($('#rpt_pnl').html());
        var rptAmortization = String($('#rpt_amortization').html());
        var rptCashFlow = String($('#rpt_cash_flow').html());
        var rptBalanceSheet = String($('#rpt_balance_sheet').html());
        var rptDashboard = String($('#rpt_dashboard').html());

        // Do an ajax post!!
        // serialize form
        var data = $(this).serializeArray();
        // add items to serialized data
        data.push({name: "main_content", value: mainContent});
        data.push({name: "financial_assumptions", value: financialAssumptions});
        data.push({name: "financial_input", value: financialInput});
        data.push({name: "rpt_pnl", value: rptPnl});
        data.push({name: "rpt_amortization", value: rptAmortization});
        data.push({name: "rpt_cash_flow", value: rptCashFlow});
        data.push({name: "rpt_balance_sheet", value: rptBalanceSheet});
        data.push({name: "rpt_dashboard", value: rptDashboard});

        $.ajax({
          type: "POST",
          url: '/dashboard/new/business-plan',
          data: data,
          success: function(response){
              window.location.href = 'dashboard';
          },
          error: function(response){
              alert('Error saving business plan.')
              console.log(response)
          },
          dataType: 'json'
        });


    })


    function toggleSpinner(show, message){
        if(show){
            // update image
            $('#spinner_modal .loading-gif').removeClass('hidden');
            $('#spinner_modal .message').text(message);
            $('#spinner_modal').modal('show');
        }else{
            // set message// done above
            // update image
            //$('#spinner_modal .loading-gif').attr('src','/static/imgs/loading-complete-gif.gif');
            // wait 1 second
            // hide spinner
            setTimeout(function () {
                $('#spinner_modal .loading-gif').addClass('hidden');
                $('#spinner_modal .message').text(message);
                setTimeout(function () {
                    $('#spinner_modal').modal('hide');
                }, 500);
            }, 1000);
        }
    }

    function updateFormIdField(formId, val){
        if(val == null || val){
            // try parse then update
            var idParsed =  parseInt(val);
            if(!isNaN(idParsed)){
                $(formId + ' .id').val(idParsed);
                $(formId + ' .id').attr('value', idParsed)
            }
        }
    }

    function alertUser(status, showStatus, message, showMessage){
        var statusList = ['alert-success', 'alert-info', 'alert-warning', 'alert-danger'];
        var alertClass = 'alert-default';
        var alertStatusText = 'alert-info'
        if(status == 200 || status == 'SUCCESS'){
            alertClass = 'alert-success';
            alertStatusText = 'Success!';
        }
        else if(status in [500, 400, 300,] || status == 'ERROR'){
            // Everything in list is danger
            alertClass = 'alert-danger';
            alertStatusText = 'Error!';
        }else if(status == 201 || status == 'WARING'){
            // 201 has been used as a warning
            alertClass = 'alert-warning';
            alertStatusText = 'Warning!';
        }else if(status == 'INFO'){
            // This is a case of info
            alertClass = 'alert-info';
            alertStatusText = 'Info!';
        }

        // Remove all other classes
        $.each(statusList, function (index, currStatus) {
            $('#alert_main').removeClass(currStatus);
        })

        // Set new class
        $('#alert_main').addClass(alertClass);

        // Set status and message
        if(showStatus)
            $('#alert_main .status').text(alertStatusText)
        if(showMessage)
            $('#alert_main .message').text(message)

        // Make alert visible
        $('#alert_main').removeClass('hidden');
        // Add hidden class after 5 seconds

        // You should trigger change in content size
        setTimeout(function () {
            $('#alert_main').addClass('hidden');
        }, 3000);

    }

    function syncValAttributes(sectionId){
        // Get all input fields
        var inputItems = $(sectionId + ' input,textarea,select');
        $.each(inputItems, function(index, inputItem){
            $(inputItem).attr('value', $(inputItem).val())
        })
    }

    function showSavingIndicator(tabId){
        $(tabId + ' .tab-name').text('Saving');
        $(tabId + ' .loading-gif').removeClass('hidden');
    }

    function hideSavingIndicator(tabId, tabName){
        $(tabId + ' .tab-name').text(tabName + ' saved.');
        $(tabId + ' .loading-gif').addClass('hidden');

        $(tabId + ' .alert').removeClass('text-default');
        $(tabId + ' .alert').addClass('text-success');

        setTimeout(function () {
            $(tabId + ' .tab-name').text(tabName);

            $(tabId + ' .alert').removeClass('text-success');
            $(tabId + ' .alert').addClass('text-default');
        }, 1000);
    }

    function saveTitlePage(){
        // Saves Title page... No validation is required at this phase
        var idInput = $('#frm_bplanner_title_page .id')[0];
        $('#frm_bplanner_title_page').val($(idInput).val())
        var data = $('#frm_bplanner_title_page').serializeArray();
        $.ajax({
          type: "POST",
          url: '/dashboard/new/business-plan/title_page',
          data: data,
          success: function(response){
              updateFormIdField('#frm_bplanner_title_page', response.id);
          },
          error: function(response){
          },
          dataType: 'json'
        });

    }

    function saveMainContent(){
        // Update main content input value
        var mission_visionContentHTML = $('#editor-mission_vision').html();
        $('#id_mission_vision').val(mission_visionContentHTML)
        var company_descriptionContentHTML = $('#editor-company_description').html();
        $('#id_company_description').val(company_descriptionContentHTML)

        var executive_summaryContentHTML = $('#editor-executive_summary').html();
        $('#id_executive_summary').val(executive_summaryContentHTML)

        var key_success_factorsContentHTML = $('#editor-key_success_factors').html();
        $('#id_key_success_factors').val(key_success_factorsContentHTML)
        var objectivesContentHTML = $('#editor-objectives').html();
        $('#id_objectives').val(objectivesContentHTML)
        var industry_analysisContentHTML = $('#editor-industry_analysis').html();
        $('#id_industry_analysis').val(industry_analysisContentHTML)
        var tam_sam_som_analysisContentHTML = $('#editor-tam_sam_som_analysis').html();
        $('#id_tam_sam_som_analysis').val(tam_sam_som_analysisContentHTML)
        var swot_analysisContentHTML = $('#editor-swot_analysis').html();
        $('#id_swot_analysis').val(swot_analysisContentHTML)
        var insightsContentHTML = $('#editor-insights').html();
        $('#id_insights').val(insightsContentHTML)
        var marketing_planContentHTML = $('#editor-marketing_plan').html();
        $('#id_marketing_plan').val(marketing_planContentHTML)
        var ownership_and_management_planContentHTML = $('#editor-ownership_and_management_plan').html();
        $('#id_ownership_and_management_plan').val(ownership_and_management_planContentHTML)
        var milestonesContentHTML = $('#editor-milestones').html();
        $('#id_milestones').val(milestonesContentHTML)

        var data = $('#frm_bplanner_main_content_page').serializeArray();
        // get titlePageId
        var titlePageId = $('#frm_bplanner_title_page .id').val()
        // add titlePageId to serialized data
        data.push({name: "title_page_id", value: titlePageId});
        // Show saving indicator
        $.ajax({
          type: "POST",
          url: '/dashboard/new/business-plan/main_content_page',
          data: data,
          success: function(response){
              //window.location.href = 'dashboard';
              updateFormIdField('#frm_bplanner_main_content_page', response.id);
          },
          error: function(response){

          },
          dataType: 'json'
        });

    }

    function saveFinancialAssumptions(){
        $('#financial_assumptions input,textarea,select').change(function(event){
            $(this).attr('value', $(this).val());
        })
        var data = $('#frm_bplanner_financial_assumptions_page').serializeArray();
        var titlePageId = $('#frm_bplanner_title_page .id').val()
        // add titlePageId to serialized data
        data.push({name: "title_page_id", value: titlePageId});
        // add tbl_assumptions_number_of_products_or_services // product_services_table
        var productServicesTableHTML = $('#tbl_assumptions_number_of_products_or_services').html()
        data.push({name: "product_services_table", value: productServicesTableHTML});
        // add tbl_assumptions_tax_slabs // tax_slabs_table
         var taxSlabsTableHTML = $('#tbl_assumptions_tax_slabs').html()
        data.push({name: "tax_slabs_table", value: taxSlabsTableHTML});

        $.ajax({
          type: "POST",
          url: '/dashboard/new/business-plan/financial_assumptions_page',
          data: data,
          success: function(response){
              updateFormIdField('#frm_bplanner_financial_assumptions_page', response.id);
              // alert what has happened
          },
          error: function(response){
              //alertUser(response.status, true, response.message, true);
          },
          dataType: 'json'
        });

        saveBusinessPlanSettingsModel();
    }

    function saveFinancialDataInput(){
        // For saving BusinessPlanSettingsModel
        // Ensure all input//select//values and attributes are set
        syncValAttributes('#frm_bplanner_financial_data_input_page')
        var data = $('#frm_bplanner_financial_data_input_page').serializeArray();
        var titlePageId = $('#frm_bplanner_title_page .id').val()
        // add titlePageId to serialized data
        data.push({name: "title_page_id", value: titlePageId});
        // add frm_bplanner_financial_data_input_page // financial_input
        var financialInputHTML = $('#frm_bplanner_financial_data_input_page').html()
        data.push({name: "financial_input", value: financialInputHTML});

        $.ajax({
          type: "POST",
          url: '/dashboard/new/business-plan/financial_data_input_page',
          data: data,
          success: function(response){
              updateFormIdField('#frm_bplanner_financial_data_input_page', response.id);
          },
          error: function(response){
              //alertUser(response.status, true, response.message, true);
          },
          dataType: 'json'
        });

        saveBusinessPlanSettingsModel()
    }

    function saveBusinessPlanSettingsModel(){
        var data = $('#frm_bplanner_settings').serializeArray();
        var titlePageId = $('#frm_bplanner_title_page .id').val()
        data.push({name: "title_page_id", value: titlePageId});
        // add titlePageId to serialized data


        data.push({name: "step_monitor", value: JSON.stringify(stepMonitor)});
        data.push({name: "id", value: settingsId});
        data.push({name: "calendar_months", value: JSON.stringify(calendarMonths)});
        data.push({name: "projection_months_list", value: JSON.stringify(projectionMonthsList)});
        data.push({name: "projection_years", value: projectionYears});
        data.push({name: "first_financial_year", value: firstFinancialYear}) // int
        data.push({name: "last_financial_year", value: lastFinancialYear}) // int
        data.push({name: "count_of_months_in_financial_year", value: countOfMonthsInFinancialYear})// int
        data.push({name: "projection_years_list", value: JSON.stringify(projectionYearsList)});
        data.push({name: "product_count", value: productCount}) // int
        data.push({name: "products", value: JSON.stringify(products)});

        data.push({name: "theme", value: JSON.stringify(theme)});
        data.push({name: "cost_appropriation_methods", value: JSON.stringify(costAppropriationMethods)});
        data.push({name: "operating_cost_list", value: JSON.stringify(operatingCostList)});
        data.push({name: "employees_list", value: JSON.stringify(employeesList)});
        data.push({name: "capital_sources_list", value: JSON.stringify(capitalSourcesList)});
        data.push({name: "tangible_assets_list", value: JSON.stringify(tangibleAssetsList)});
        data.push({name: "intangible_assets_list", value: JSON.stringify(intangibleAssetsList)});
        data.push({name: "deposit_item_list", value: JSON.stringify(depositItemList)});
        data.push({name: "startup_cost_item_list", value: JSON.stringify(startupCostItemList)});

        data.push({name: "total_assets", value: JSON.stringify(totalAssets)});
        data.push({name: "total_liabilities", value: JSON.stringify(totalLiabilities)});
        data.push({name: "tangible_assets_balance_total", value: JSON.stringify(tangibleAssetsBalanceTotal)});
        data.push({name: "intangible_assets_balance_total", value: JSON.stringify(intangibleAssetsBalanceTotal)});
        data.push({name: "cashFlow_changes_during_the_year_per_month", value: JSON.stringify(cashFlowChangesDuringTheYearPerMonth)});
        data.push({name: "closing_cash_balance_per_month", value: JSON.stringify(closingCashBalancePerMonth)});
        data.push({name: "revenue_totals_per_year", value: JSON.stringify(revenueTotalsPerYear)});
        data.push({name: "direct_cost_totals_per_year", value: JSON.stringify(directCostTotalsPerYear)});
        data.push({name: "gross_profit", value: JSON.stringify(grossProfit)});
        data.push({name: "operating_cost_totals_per_year", value: JSON.stringify(operatingCostTotalsPeryear)});
        data.push({name: "eat", value: JSON.stringify(EAT)});
        data.push({name: "net_margin_per_month", value: JSON.stringify(netMarginPerMonth)})


        $.ajax({
          type: "POST",
          url: '/dashboard/save/business-plan/settings',
          data: data,
          success: function(response){
              settingsId = response.id;
          },
          error: function(response){
              conole.log("some error has occurred saving business plan settings!!");
          },
          dataType: 'json'
        });
    }


    /* ECHRTS */
    function init_echarts_dboard() {
        if( typeof (echarts) === 'undefined'){ return; }
          theme = {
          color: [
              '#26B99A', '#34495E', '#BDC3C7', '#3498DB',
              '#9B59B6', '#8abb6f', '#759c6a', '#bfd3b7'
          ],

          title: {
              itemGap: 8,
              textStyle: {
                  fontWeight: 'normal',
                  color: '#408829'
              }
          },

          dataRange: {
              color: ['#1f610a', '#97b58d']
          },

          toolbox: {
              color: ['#408829', '#408829', '#408829', '#408829']
          },

          tooltip: {
              backgroundColor: 'rgba(0,0,0,0.5)',
              axisPointer: {
                  type: 'line',
                  lineStyle: {
                      color: '#408829',
                      type: 'dashed'
                  },
                  crossStyle: {
                      color: '#408829'
                  },
                  shadowStyle: {
                      color: 'rgba(200,200,200,0.3)'
                  }
              }
          },

          dataZoom: {
              dataBackgroundColor: '#eee',
              fillerColor: 'rgba(64,136,41,0.2)',
              handleColor: '#408829'
          },
          grid: {
              borderWidth: 0
          },

          categoryAxis: {
              axisLine: {
                  lineStyle: {
                      color: '#408829'
                  }
              },
              splitLine: {
                  lineStyle: {
                      color: ['#eee']
                  }
              }
          },

          valueAxis: {
              axisLine: {
                  lineStyle: {
                      color: '#408829'
                  }
              },
              splitArea: {
                  show: true,
                  areaStyle: {
                      color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
                  }
              },
              splitLine: {
                  lineStyle: {
                      color: ['#eee']
                  }
              }
          },
          timeline: {
              lineStyle: {
                  color: '#408829'
              },
              controlStyle: {
                  normal: {color: '#408829'},
                  emphasis: {color: '#408829'}
              }
          },

          k: {
              itemStyle: {
                  normal: {
                      color: '#68a54a',
                      color0: '#a9cba2',
                      lineStyle: {
                          width: 1,
                          color: '#408829',
                          color0: '#86b379'
                      }
                  }
              }
          },
          map: {
              itemStyle: {
                  normal: {
                      areaStyle: {
                          color: '#ddd'
                      },
                      label: {
                          textStyle: {
                              color: '#c12e34'
                          }
                      }
                  },
                  emphasis: {
                      areaStyle: {
                          color: '#99d2dd'
                      },
                      label: {
                          textStyle: {
                              color: '#c12e34'
                          }
                      }
                  }
              }
          },
          force: {
              itemStyle: {
                  normal: {
                      linkStyle: {
                          strokeColor: '#408829'
                      }
                  }
              }
          },
          chord: {
              padding: 4,
              itemStyle: {
                  normal: {
                      lineStyle: {
                          width: 1,
                          color: 'rgba(128, 128, 128, 0.5)'
                      },
                      chordStyle: {
                          lineStyle: {
                              width: 1,
                              color: 'rgba(128, 128, 128, 0.5)'
                          }
                      }
                  },
                  emphasis: {
                      lineStyle: {
                          width: 1,
                          color: 'rgba(128, 128, 128, 0.5)'
                      },
                      chordStyle: {
                          lineStyle: {
                              width: 1,
                              color: 'rgba(128, 128, 128, 0.5)'
                          }
                      }
                  }
              }
          },
          gauge: {
              startAngle: 225,
              endAngle: -45,
              axisLine: {
                  show: true,
                  lineStyle: {
                      color: [[0.2, '#86b379'], [0.8, '#68a54a'], [1, '#408829']],
                      width: 8
                  }
              },
              axisTick: {
                  splitNumber: 10,
                  length: 12,
                  lineStyle: {
                      color: 'auto'
                  }
              },
              axisLabel: {
                  textStyle: {
                      color: 'auto'
                  }
              },
              splitLine: {
                  length: 18,
                  lineStyle: {
                      color: 'auto'
                  }
              },
              pointer: {
                  length: '90%',
                  color: 'auto'
              },
              title: {
                  textStyle: {
                      color: '#333'
                  }
              },
              detail: {
                  textStyle: {
                      color: 'auto'
                  }
              }
          },
          textStyle: {
              fontFamily: 'Arial, Verdana, sans-serif'
          }
      };
    }

    init_echarts_dboard();

    function renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData){
        // containerId without
        if ($('#' + containerId).length ){
          var echartBar = echarts.init(document.getElementById(containerId), theme);
          echartBar.setOption({
            title: {
              text: title,
              subtext: subTitle
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: legendData
            },
            toolbox: {
              show: true
            },
            calculable: false,
            xAxis: [{
              type: 'category',
              data: dataX
            }],
            yAxis: [{
              type: 'value'
            }],
            series: seriesData
          });
        }
    }

    // Total assets bar graph
    function prepareAndRenderTotalAssetsBar(){
        var containerId = 'totalAssetsBar';
        var title = 'Total Assets';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = ['Capital',]
        $.each(totalAssets, function (projectionYear, amount) {
            data.push(amount);
        })
        var seriesData = [
            {
              name: 'Capital',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // totalLiabilitiesBar
    function prepareAndRenderTotalLiabilitiesBar(){
        var containerId = 'totalLiabilitiesBar';
        var title = 'Total Liabilities';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = ['Capital',]
        $.each(totalLiabilities, function (projectionYear, amount) {
            data.push(amount);
        })
        var seriesData = [
            {
              name: 'Liabilities',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // fixedAssetsClassifications
    function prepareAndRenderFixedAssetClassificationBar(){
        var containerId = 'fixedAssetsClassificationsBar';
        var title = 'Fixed Assets Classification';
        var subTitle = '';
        var dataX = projectionYearsList;
        var dataTangibleAssets = [];
        var dataInTangibleAssets = [];
        var legendData = ['Tangible Assets', 'Intangible Assets']
        $.each(tangibleAssetsBalanceTotal, function (projectionYear, amount) {
            dataTangibleAssets.push(amount);
        })
        $.each(intangibleAssetsBalanceTotal, function (projectionYear, amount) {
            dataInTangibleAssets.push(amount);
        })
        var seriesData = [
            {
              name: 'Tangible Assets',
              type: 'bar',
              data: dataTangibleAssets
            },
            {
              name: 'Intangible Assets',
              type: 'bar',
              data: dataInTangibleAssets
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // cashFlowAnalysisBar
    function prepareAndRenderCashFlowAnalysisBar(){
        var containerId = 'cashFlowAnalysisBar';
        var title = 'Cash Flow Analysis';
        var subTitle = '';
        var dataX = projectionMonthsList; // NB We are using projection months in this case
        var dataCashGenerated = [];
        var dataClosingCashBalance = [];
        var legendData = ['Closing Cash Balance', 'Cash Generated During the Year']
        //cashFlowChangesDuringTheYearPerMonth  closingCashBalancePerMonth

        $.each(cashFlowChangesDuringTheYearPerMonth, function (projectionMonthIndex, amount) {
            if(projectionMonthIndex.indexOf('total') < 0)
                dataCashGenerated.push(amount);
        })
        $.each(closingCashBalancePerMonth, function (projectionMonthIndex, amount) {
            if(projectionMonthIndex.indexOf('total') < 0)
                dataClosingCashBalance.push(amount);
        })
        var seriesData = [
            {
              name: 'Closing Cash Balance',
              type: 'line',
              data: dataClosingCashBalance
            },
            {
              name: 'Cash Generated During the Year',
              type: 'line',
              data: dataCashGenerated
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // totalRevenueBar
    function prepareAndRenderTotalRevenueBar(){
        var containerId = 'totalRevenueBar';
        var title = 'Total Revenue';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = []
        $.each(revenueTotalsPerYear, function (projectionYear, amount) {
            data.push(amount);
        })
        var seriesData = [
            {
              name: 'Revenue',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // totalDirectCostBar
    function prepareAndRenderTotalDirectCostBar(){
        var containerId = 'totalDirectCostBar';
        var title = 'Total Direct Cost';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = []
        $.each(directCostTotalsPerYear, function (projectionYear, amount) {
            data.push(amount);
        })
        var seriesData = [
            {
              name: 'Direct Cost',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // grossProfitBar
    function prepareAndRenderGrossProfitBar(){
        var containerId = 'grossProfitBar';
        var title = 'Gross Profit';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = []
        $.each(grossProfit, function (projectionMonthIndex, amount) {
            if(projectionMonthIndex.indexOf('total') > -1)
                data.push(amount);
        })
        var seriesData = [
            {
              name: 'Gross Profit',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // totalOperatingCostBars
    function prepareAndRenderTotalOperatingCostBar(){
        var containerId = 'totalOperatingCostBar';
        var title = 'Total Operating Cost';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = []
        $.each(operatingCostTotalsPeryear, function (projectionYear, amount) {
            data.push(amount);
        })
        var seriesData = [
            {
              name: 'Operating Cost',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // earningsAfterTaxtBar
    function prepareAndRenderEarningsAfterTaxtBar(){
        var containerId = 'earningsAfterTaxtBar';
        var title = 'Earnings After Tax';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = []
        $.each(EAT, function (projectionMonthIndex, amount) {
            if(projectionMonthIndex.indexOf('total') > -1)
                data.push(amount);
        })
        var seriesData = [
            {
              name: 'Earning aftr Tax',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    // netMarginBar  netMarginPerMonth
    function prepareAndRenderNetMarginBar(){
        var containerId = 'netMarginBar';
        var title = 'Net Margin (%)';
        var subTitle = '';
        var dataX = projectionYearsList;
        var data = [];
        var legendData = []
        $.each(netMarginPerMonth, function (projectionMonthIndex, amount) {
            if(projectionMonthIndex.indexOf('total') > -1)
                data.push(amount);
        })
        var seriesData = [
            {
              name: 'Net Margin',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData);
    }

    function regenerateCurentPate(){
        // Check if page validates
        var mode= $('#right_col').data('mode');
        var validateResults = validateRequired(currentStepId)
        // Show alert if messages exist
        if(validateResults != null){
            // Ensure you validate required fields before moving to new tab
            var clickedFriendlyName = stepMonitor[clickedStep]['friendly_name'];
            $('#message-dialog .header').text("Validation messages");
            $('#message-dialog .message').text('Provide missing details in the pages listed below to proceed to the ' + clickedFriendlyName)
            var listingTable = '<table class="table table-striped"><thead><tr><td class="td-md text-left">Page</td><td class="dt-sm text-right"># Errors</td</tr></thead><tbody>';
            var listingTableBody = '<tbody>'
            $.each(validateResults, function (sId, countOfErrors) {
                var fName = $(sId).data('friendly_name');
                listingTableBody += '<tr><td class="text-left">' + fName + '</td><td class="text-right">' + countOfErrors + '</td></tr>'
            })
            listingTable += listingTableBody;
            listingTable += '</body></table>'
            $('#message-dialog .table-container').html(listingTable)
            $('#message-dialog').modal("show")
            return false;
        }

        toggleSpinner(true, 'Regenerating page...')
        if(currentStepId == '#step-4'){
            generatePrijectionYearsList();
            generateProjectionMonthsList();

            //console.log(projectionYearsList);
            generatePricePerProductTable(true);
            generateDirectCostPerProductTable(true);
            generateUnitOfRevenueMeasurementTable(true);

            // Generate Operational costs table
            generateOperatingCostsTable(true);
            //console.log("Generate pricing tables btn has been clicked");

            // Generating employee tables
            generateEmployeeRolesListTable(true);
            generateEmployeeWorkingHoursTable(true);
            generateEmployeeHourlyRatesTable(true);

            // Generating sources tables
            generateCapitalTable();
            generateUsageTangibleAssetsTable(true);
            generateUsageInTangibleAssetsTable(true);

            generateUsageDepositsTable(true);
            generateUsageOtherStartupCostsTable(true);
        }else if(currentStepId == '#step5'){
            // Generate graphs
            prepareAndRenderTotalAssetsBar(true);
            prepareAndRenderTotalLiabilitiesBar(true);
            prepareAndRenderFixedAssetClassificationBar(true);
            prepareAndRenderCashFlowAnalysisBar(true);
            prepareAndRenderTotalRevenueBar(true);
            prepareAndRenderTotalDirectCostBar(true);
            prepareAndRenderGrossProfitBar(true);
            prepareAndRenderTotalOperatingCostBar(true);
            prepareAndRenderEarningsAfterTaxtBar(true);
            prepareAndRenderNetMarginBar(true);
        }else{
            // Do nothing. No other step needs regeneration
        }

        toggleSpinner(false, 'Done!')
    }

    // Enable contirmation
    $('[data-toggle=confirmation]').confirmation({
      rootSelector: '[data-toggle=confirmation]',
      onConfirm: function(value) {
        // Proceed to regenerate page...
          // disable regenerate button
          $('#btn_regenerate_page').addClass('disabled')
          regenerateCurentPate();

          // Unbind/ bind events
        $('.number-input-format').unbind('keydown')
        $('.number-input-format').keydown(numberFormatKeyDownHandler)

         // enable regenerate button
        $('#btn_regenerate_page').removeClass('disabled')
      },
      onCancel: function() {
        // page not regenerated... Don't do anything

      },
      placement: 'bottom',
      title: 'Sure to regenerate page?',
      content: 'Note: This action will clear all initial table data and require data entry.'
    });
    
    $('#btn_save_business_plan').click(function (event) {
        // Saving all passed business plan sections
        // disable save button
        $('#btn_save_business_plan').addClass('disabled')
        toggleSpinner(true, 'Saving business plan...')
        saveTitlePage();
        saveMainContent();
        saveFinancialDataInput()
        saveFinancialAssumptions();
        //$.each(stepsMonitor, function(stepId, stepObject){
        //    if(stepObject['passed']){
        //        // save step
        //        if(stepId == '#step-1'){
        //            saveTitlePage();
        //        }else if(stepId == '#step-2'){
        //            saveMainContent();
        //        }else if(stepId == '#step-3'){
        //            saveFinancialAssumptions();
        //        }else if(stepId == '#step-4'){
        //            saveFinancialDataInput()
        //        }
        //
        //    }
        //})
        toggleSpinner(false, 'Done!')
        $('#btn_save_business_plan').removeClass('disabled')
    })

    // update all currency spans at start.
    updateCurrency(getCurrency());

    function getTaxSystemId(){
        return $('#id_taxation_system').val();
    }

    $('#id_taxation_system').change(function (event) {
        // By default it's tiered system
        // Check value
        var systemId = $(this).val();
        if(systemId == 0){
            // Tiered system... Show tax slab
            $('#div-tax_slab').removeClass('hidden')
            $('#div_corporate_tax_rate').addClass('hidden');
        }else{
            // Single system.. Hide tax slab
            $('#div-tax_slab').addClass('hidden');
            $('#div_corporate_tax_rate').removeClass('hidden');
        }
    })

    function getItemOfferedId(){
        return $('#id_offerings_products_or_services').val()
    }

    function getItemOffered(plural){
        var itemOfferedId =  $('#id_offerings_products_or_services').val()
        if(itemOfferedId == 0){
            // products... Change everything to products
            return plural ? 'Products' : 'Product';
        }else{
            // services
            return plural ? 'Services' : 'Service';
        }
    }

    $('#id_offerings_products_or_services').change(function (event) {
        // get item
        var itemOfferedId = $(this).val();
        if(itemOfferedId == 0){
            // products... Change everything to products
            $('.span-item_offered').text('Product')
            $('.span-item_offered_plural').text('Products')
        }else{
            // services
            $('.span-item_offered').text('Service')
            $('.span-item_offered_plural').text('Services')
        }
    })

    function getYearTotalFromProjectionMonthsDict(dict, totalMonth){
        var total = 0;
        // get projection months in year
        var projectionMonths = getMonthsListForYear(totalMonth['year'], false) // don not include the total month dict
        $.each(dict, function (projectionMonthIndex, val) {
            $.each(projectionMonths, function (index, month) {
                if(index == projectionMonthIndex){
                    // Add
                    total += val;
                    return false; // to exit from current each iteration
                }
            })
        })

        return total;
    }
    
    // Data presentation...
    function updateReportPresentation(containerIds){

        $(containerIds + ' .rpt_presentation').each(function() {
            var val = parseInt($(this).val(), 0)
            $(this).val(val.toLocaleString('en'));
        })    
    }

    function formatNumber(num){

    }

    function removeCommas(val){
        if(val == null){
            return '';
        }
        return val.replace(/\,/g,'');
    }

    $('.number-input-format').keydown(numberFormatKeyDownHandler)

    function numberFormatKeyDownHandler(ev){

        var currVal = $(this).val();
        // Handle allowing only integers and 1 .
        var keyCode = window.event ? ev.keyCode : ev.which;
        //codes for 0-9
        if (keyCode < 48 || keyCode > 57) {
            if (keyCode == 46 || keyCode == 190) {
                // point typed..
                // Check if input has a point already
                if (currVal.indexOf('.') > -1) {
                    // Input has a decimal already.. prevent entry
                    ev.preventDefault();
                    direction = 0;
                }
            }
            //codes for backspace, delete, tab, enter
            else if (keyCode != 0 && keyCode != 8 && keyCode != 13 && keyCode != 9 && !ev.ctrlKey) {
                ev.preventDefault();
            }

            if( keyCode != 9){
            }
        }

        // wait seconds and update value
        setTimeout(function(){
            var currVal = $(ev.target).val();
            if(currVal == ''){
                return;
            }
            currVal = currVal.replace(/\,/g,'');
            var val = parseFloat(currVal, 10)
            $(ev.target).val(val.toLocaleString('en'));
        }, 10)

    }

//    Adjusting scrollable tab
    var hidWidth;
    var scrollBarWidths = 40;

    var widthOfList = function(){
      var itemsWidth = 0;
      $('.list li').each(function(){
        var itemWidth = $(this).outerWidth();
        itemsWidth+=itemWidth;
      });
      return itemsWidth;
    };

    var widthOfHidden = function(){
      return (($('.wrapper').outerWidth())-widthOfList()-getLeftPosi())-scrollBarWidths;
    };

    var getLeftPosi = function(){
      return $('.list').position().left;
    };

    var reAdjust = function(){
      if (($('.wrapper').outerWidth()) < widthOfList()) {
        $('.scroller-right').show();
      }
      else {
        $('.scroller-right').hide();
      }

      if (getLeftPosi()<0) {
        $('.scroller-left').show();
      }
      else {
        $('.item').animate({left:"-="+getLeftPosi()+"px"},'slow');
        $('.scroller-left').hide();
      }
    }

    reAdjust();

    $(window).on('resize',function(e){
        reAdjust();
    });

    $('.scroller-right').click(function() {

      $('.scroller-left').fadeIn('slow');
      $('.scroller-right').fadeOut('slow');

      $('.list').animate({left:"+="+widthOfHidden()+"px"},'slow',function(){

      });
    });

    $('.scroller-left').click(function() {

        $('.scroller-right').fadeIn('slow');
        $('.scroller-left').fadeOut('slow');

        $('.list').animate({left:"-="+getLeftPosi()+"px"},'slow',function(){

        });
    });
//    End-- Scrollable tab

    //WYSIWYG Editor focus in and out
    $('.editor-wrapper').focusin(function(event){
        var currentVal = $(this).html()
        if(currentVal.trim() == "Click to start writing..."){
            $(this).html("");
        }
    })

    $('.editor-wrapper').focusout(function(event){
        if($(this).html().trim() == ""){
            $(this).html("Click to start writing...");
        }
    })


    $('.unit-change').unbind('change');
    $('.unit-change').change(measurementUnitChangeHandler);


    // Unbind/ bind events
    $('.number-input-format').unbind('keydown')
    $('.number-input-format').keydown(numberFormatKeyDownHandler)


    // Unbind bind change events
    $('.operating-cost-change').unbind('change');
    $('.operating-cost-change').change(operatingCostChangeHandler);

    // Unbind and bind events again
    $('.hourly-rate-change').unbind('change');
    $('.hourly-rate-change').change(employeeHourlyRateChangeHandler);

    //// Sample dialog setup
    //$('#sample-dialog').on('show.bs.modal', function (e) {
    //  // do something..
    //    var $link = $(e.relatedTarget)
    //    var sample_id = $link.data('sample_id');
    //    // do an ajax to get sample html
    //
    //    console.log('sampleHtml')
    //    console.log(sampleHtml)
    //    $('#sample-dialog .modal-body').html(sampleHtml)
    //
    //})
})

