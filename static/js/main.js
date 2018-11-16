/**
 * Created by user on 7/16/2018.
 */

$(document).ready(function () {

    // Set window sizing
    $('#right_col').height($(window).height() - $('#top_nav').height() - 65);
    $('.tabbable').height($('#right_col').height() - $('#main-nav').height());
    $('.tab-content').height($('#right_col').height() - $('#main-nav').height());
    $('#editor-one').height($('#right_col').height() - $('#main-nav').height());
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
    bindChangeEventHandler('#id_currency', function(event){
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

    function deleteRowWithClass(tableId, productId){
        $(tableId + ' .' + productId ).remove()
    }

    function addTableRow(tableId, productIndex){
        var strBody = '';
        if(tableId == '#tbl_assumptions_price_per_product')
        {
            strBody += '<tr data-product_id="' + productIndex + '" class="'+ productIndex +'">'
                            + '<td class="td-label td-md" data-product_id="' + productIndex + '">'
                            +    '<span class="input-label"></span>'
                            + '</td>'
                            + '<td class="td-label td-xs text-right" data-product_id="' + productIndex + '">'
                            +   '<span class="input-label"></span>'
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
                                                    + ' class="form-control number-input-format input-md '+ priceChangetext +' text-right render_required" data-validate_span_id="#span_tbl_assumptions_price_per_product" required="required " + ' + readonlyText + '></td>'
                                firstYear = false;
                            })
                strBody += '</tr>'
            $('#tbl_assumptions_price_per_product tbody').append(strBody)
            // Update bindings
            $('.price-change').unbind('change');
            bindChangeEventHandler('.price-change', productPriceChangeHandler)


        }else if(tableId == '#tbl_assumptions_direct_cost_per_product')
        {
            strBody += '<tr data-product_id="' + productIndex + '" class="'+ productIndex +'">'
                        + '<td class="td-label td-md " data-product_id="' + productIndex + '">'
                        +    '<span class="input-label">' + '' + '</span>'
                        + '</td>'
                        // Add other td's depending on the projection years
                        $.each(projectionYearsList, function(yearIndex, projectionYear){
                            // Every input field is editable
                            strBody += '<td class="yearly td-input td-sm"'
                                        + ' data-projection_year="'+ projectionYear +'">'
                                        + '<input data-product_id="' + productIndex + '" name="' + productIndex + '_direct_cost_' + projectionYear +'" '
                                                + 'type="number" data-projection_year="' + projectionYear +'" '
                                                + ' value=""'
                                                + ' class="form-control input-md text-right render_required cost-change" data-validate_span_id="#span_tbl_assumptions_direct_cost_per_product" required="required" >'
                                        + '</td>'
                        })
            strBody += '</tr>';
            $('#tbl_assumptions_direct_cost_per_product tbody').append(strBody)
            // Update bindings
            $('.cost-change').unbind('change');
            bindChangeEventHandler('.cost-change', productCostChangeHandler)
        }else if(tableId == '#tbl_assumptions_units_of_measurement_per_product')
        {
            strBody += '<tr data-product_id="' + productIndex + '" class="'+ productIndex +'">'
                            + '<td class="td-label td-md " data-product_id="' + productIndex + '">'
                            +    '<span class="input-label"></span>'
                            + '</td>'
                            + '<td class="td-label td-sm" data-product_id="' + productIndex + '">'
                            +    '<span class="input-label text-left"></span>'
                            + '</td>'
                            + '<td class="td-label td-xs text-right growth_rate_per_month" data-product_id="' + productIndex + '">'
                            +    '<span class="input-label text-right"></span>'
                            + '</td>'
                            // Add other td's depending on the projection years


                            $.each(projectionMonthsList, function(projectionMonthIndex, projectionMonthYear){
                                // Check if first year
                                var yearTotalClass = projectionMonthYear['is_total'] ? 'unit_year-total' : ''
                                var isReadonlyField = (projectionMonthYear['is_first_year'] == null || projectionMonthYear['is_first_year']) ? false : true;
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
                                                    + ' class="form-control number-input-format input-md '+ unitChangeText +' text-right render_required" data-validate_span_id="#span_tbl_assumptions_units_of_measurement_per_product" required="required " + ' + readonlyText + '></td>'

                            })
                strBody += '</tr>'
            $('#tbl_assumptions_units_of_measurement_per_product tbody').append(strBody);
            // Update bindings
            // Unbind and bind change events
            $('.unit-change').unbind('change');
            bindChangeEventHandler('.unit-change', measurementUnitChangeHandler);

            // Unbind/ bind events
            $('.number-input-format').unbind('keydown')
            $('.number-input-format').keydown(numberFormatKeyDownHandler)
        }
    }

    bindChangeEventHandler('#id_number_of_products_or_services',  function(e){
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
                    + '<td id="' + productOrServiceName + '" class="td-input"><input name="' + productOrServiceName +'" type="text" data-product_id="' + productOrServiceId +'" data-prop_affected="name"  class="form-control input-md product-change text-left render_required" data-validate_span_id="#span_tbl_assumptions_number_of_products_or_services" placeholder="" required="required"></td>'
                    + '<td id="' + productOrServiceUnits + '" class="td-input"><input name="' + productOrServiceUnits +'" type="text" data-product_id="' + productOrServiceId +'" data-prop_affected="units"  class="form-control input-md product-change text-left render_required" data-validate_span_id="#span_tbl_assumptions_number_of_products_or_services" placeholder="" required="required"></td>'
                    + '<td id="' + productOrServiceGrowthRate + '" class="td-input"><input name="' + productOrServiceGrowthRate +'" type="number" min="0" data-product_id="' + productOrServiceId +'" data-prop_affected="growth_rate"  class="form-control input-md product-change text-right render_required" data-validate_span_id="#span_tbl_assumptions_number_of_products_or_services" placeholder="" required="required"></td>'
                    + '</tr>'

                // add table rows for respective tables


                addTableRow('#tbl_assumptions_price_per_product', productOrServiceId)


                addTableRow('#tbl_assumptions_direct_cost_per_product', productOrServiceId)


                addTableRow('#tbl_assumptions_units_of_measurement_per_product', productOrServiceId)

            }
            $('#tbl_assumptions_number_of_products_or_services').append(str);
            // Unbind change handler
            $('.product-change').unbind('change');
            // Bind event handler again
            bindChangeEventHandler('.product-change', productDetailsChangeHandler);
            productRowsCount++;

            // add rows to affected tables
        }else{
            // difference # of rows need to be removed
            for(var k = 0; k < Math.abs(difference); k++){
                if(productRowsCount > 0){
                    $("#tbl_assumptions_number_of_products_or_services_"+(productRowsCount)).remove();
                    // Remove product from list
                    delete products['tbl_assumptions_number_of_products_or_services_' + productRowsCount];


                    // price per product
                    deleteRowWithClass('#tbl_assumptions_price_per_product', 'tbl_assumptions_number_of_products_or_services_' + productRowsCount)

                    // cost per product
                    deleteRowWithClass('#tbl_assumptions_direct_cost_per_product' , 'tbl_assumptions_number_of_products_or_services_' + productRowsCount)

                    // units of measurement
                    deleteRowWithClass('#tbl_assumptions_units_of_measurement_per_product' , 'tbl_assumptions_number_of_products_or_services_' + productRowsCount)

                    productRowsCount--;
                }
            }
            productRowsCount = productCount;
        }
    });

    bindChangeEventHandler('#id_projection_years', function (event) {
        if($('#id_projection_years').val() != null && $('#id_projection_years').val() != ''){
            projectionYears = parseInt($('#id_projection_years').val(), 0)
            generatePrijectionYearsList();
        }
        //console.log(projectionYearsList);
    });

    function returnProjectionYearsList(){
        var newFirstFinancialYear = parseInt($('#id_first_financial_year').val());
        var newProjectionYears = parseInt($('#id_projection_years').val());
        var lastFinancialYear =  newFirstFinancialYear + newProjectionYears
        // first clear everything in array
        var newProjectionYearsList = []; // Empty list in advance
        for(var i= newFirstFinancialYear; i < lastFinancialYear; i++){
            // Getting the list of years
            newProjectionYearsList.push(i);
        }

        return newProjectionYearsList;
    }

    function generatePrijectionYearsList(){
        if(yearListInitiated == true){
            return false;
        }

        if($('#id_projection_years').val() == ''){
            return;
        }

        if($('#id_first_financial_year').val() == ''){
            return;
        }

        firstFinancialYear = parseInt($('#id_first_financial_year').val(), 10);
        projectionYears = parseInt($('#id_projection_years').val(), 10)

        lastFinancialYear = parseInt(firstFinancialYear) + parseInt(projectionYears);
        // first clear everything in array
        projectionYearsList = []; // Empty list in advance
        for(var i= firstFinancialYear; i < lastFinancialYear; i++){
            // Getting the list of years
            projectionYearsList.push(i);
            projectionYearsList_Display.push(i)
        }

        yearListInitiated = true;
    }

    function returnProjectionMonthsList(yearsList){
        // Handle start month value
        // Handle # of months in a year

        var startMonthIndex = parseInt($('#id_first_financial_year_month').val(), 10)
        var defaultStartMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][(startMonthIndex-1)];
        var currentMonth = '';
        var nextMonth = '';
        var previousMonth = '';
        var calendarYear = 0;
        var iterate = true;
        var order = 1;
        var yearOrder = 1;
        var count = 0;
        var newProjectionMonthsList = {}; // Reset current list
        var isFirstYear = true;
        var currentDisplayYear = 0;
        $.each(yearsList, function(yearIndex, projectionYear){
            iterate = true;

            while(iterate){
                // Get the start month value
                if(currentMonth == ''){
                    // Next month not set.
                    currentMonth = calendarMonths[defaultStartMonth];
                    currentDisplayYear = projectionYear;
                }
                nextMonth = calendarMonths[currentMonth['next']]; // Next month retrieved
                previousMonth = calendarMonths[currentMonth['previous']]; // previous month


                // Populate projection months list details
                var listId = currentMonth['code'] + '-' +  projectionYear;
                newProjectionMonthsList[listId] = {}
                newProjectionMonthsList[listId]['year'] = projectionYear;
                newProjectionMonthsList[listId]['month'] = currentMonth['name'];
                newProjectionMonthsList[listId]['display'] = currentMonth['code'] + '-' +  currentDisplayYear;
                newProjectionMonthsList[listId]['calendar_year'] = currentDisplayYear;
                newProjectionMonthsList[listId]['financial_year'] = projectionYear;
                newProjectionMonthsList[listId]['is_total'] = false;
                newProjectionMonthsList[listId]['is_first_year'] = isFirstYear;
                newProjectionMonthsList[listId]['order'] = order;
                newProjectionMonthsList[listId]['total_year'] = projectionYear + '_Total';
                order++;

                count++; // Increment counter
                if(count >= countOfMonthsInFinancialYear){
                    // Break to the next Financial year
                    // Before break, add a total's month val
                    var listId = projectionYear + '_Total';
                    newProjectionMonthsList[listId] = {}
                    newProjectionMonthsList[listId]['year'] = projectionYear;
                    newProjectionMonthsList[listId]['month'] = 'Last';
                    newProjectionMonthsList[listId]['display'] = "Total";
                    newProjectionMonthsList[listId]['calendar_year'] = currentDisplayYear;
                    newProjectionMonthsList[listId]['financial_year'] = projectionYear;
                    newProjectionMonthsList[listId]['is_total'] = true;
                    newProjectionMonthsList[listId]['is_first_year'] = false;
                    newProjectionMonthsList[listId]['year_order'] = yearOrder;
                    newProjectionMonthsList[listId]['total_year'] = '';
                    yearOrder++;

                    count = 0;
                    iterate = false;
                    isFirstYear = false;
                }


                // Identify if nexMonth order is less than prevous month.
                if(nextMonth['order'] < currentMonth['order']){
                   // This is to ensure that the calendar year moves to the next year but the financial year remains
                   // That implies month is in a different/next year
                   // Check if there's more to the next year before proceeding
                    currentDisplayYear = projectionYear + 1;
                }

                // Prepare movement to next month. Means updating currentMonth to nextMonth
                currentMonth = calendarMonths[currentMonth['next']]
            }

        })

        return newProjectionMonthsList;
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

    function getProjectionMonthIndex(projectionMonth){
        var retrievedIndex = ''
        $.each(projectionMonthsList, function (index, month) {
            if(month['display'] == projectionMonth['display']){
                retrievedIndex = index;
                return false
            }
        })
        return retrievedIndex;
    }

    function generateProjectionMonthsList(){
        // Handle start month value
        // Handle # of months in a year
        var proceed = false;
        if(!yearListInitiated){
            // Year has to be initiated first
            generatePrijectionYearsList() // give it 1 morechance
        }
        if(!yearListInitiated){
            return
        }

        if(monthListInitiated == true){
            return false;
        }

        var startMonthIndex = parseInt($('#id_first_financial_year_month').val(), 10)
        var defaultStartMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][(startMonthIndex-1)];
        firstFinancialYearMonth = startMonthIndex - 1;
        var currentMonth = '';
        var nextMonth = '';
        var previousMonth = '';
        var calendarYear = 0;
        var iterate = true;
        var order = 1;
        var yearOrder = 1;
        var count = 0;
        projectionMonthsList = {}; // Reset current list
        var currentDisplayYear = 0;
        var isFirstYear = true;
        $.each(projectionYearsList, function(yearIndex, projectionYear){
            iterate = true;
            while(iterate){
                // Get the start month value
                if(currentMonth == ''){
                    // Next month not set.
                    currentMonth = calendarMonths[defaultStartMonth];
                    currentDisplayYear = projectionYear;
                }
                nextMonth = currentMonth['next']; // Next month retrieved
                previousMonth = currentMonth['previous']; // previous month


                // Populate projection months list details
                var listId = currentMonth['code'] + '-' +  projectionYear;
                projectionMonthsList[listId] = {}
                projectionMonthsList[listId]['year'] = projectionYear;
                projectionMonthsList[listId]['month'] = currentMonth['name'];
                projectionMonthsList[listId]['display'] = currentMonth['code'] + '-' +  currentDisplayYear;;
                projectionMonthsList[listId]['calendar_year'] = currentDisplayYear;
                projectionMonthsList[listId]['financial_year'] = projectionYear;
                projectionMonthsList[listId]['is_total'] = false;
                projectionMonthsList[listId]['is_first_year'] = isFirstYear;
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
                    projectionMonthsList[listId]['calendar_year'] = currentDisplayYear;
                    projectionMonthsList[listId]['financial_year'] = projectionYear;
                    projectionMonthsList[listId]['is_total'] = true;
                    projectionMonthsList[listId]['is_first_year'] = false;
                    projectionMonthsList[listId]['year_order'] = yearOrder;
                    projectionMonthsList[listId]['total_year'] = '';
                    yearOrder++;

                    count = 0;
                    iterate = false;
                    isFirstYear = false
                }

                // Identify if nexMonth order is less than prevous month.
                if(nextMonth['order'] < currentMonth['order']){
                   // This is to ensure that the calendar year moves to the next year but the financial year remains
                   // That implies month is in a different/next year
                   // Check if there's more to the next year before proceeding
                    currentDisplayYear = projectionYear + 1;
                }

                // Prepare movement to next month. Means updating currentMonth to nextMonth
                currentMonth = calendarMonths[currentMonth['next']]
            }

        })
        monthListInitiated = true;
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
                        + '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYearsList_Display[index] + '</span>'
                        + '<span class="span-currency">($)</span>'
                    +   '</th>'
        })
        // Complete hthead
        strHead += '</tr>'
                + '</thead>'

        var strBody = '<tbody>';
            $.each(products, function(productIndex, product){
                strBody += '<tr data-product_id="' + productIndex + '" class="'+ productIndex +'">'
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
                                                    + ' class="form-control number-input-format input-md '+ priceChangetext +' text-right render_required" data-validate_span_id="#span_tbl_assumptions_price_per_product" required="required " + ' + readonlyText + '></td>'
                                firstYear = false;
                            })
                strBody += '</tr>'
            })
            strBody += '</tbody>'

        $('#tbl_assumptions_price_per_product').append(strHead);
        $('#tbl_assumptions_price_per_product').append(strBody);

        $('.price-change').unbind('change');
        bindChangeEventHandler('.price-change', productPriceChangeHandler)

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
                        +  '<span class="span-projection-year" data-projection_year_index="' + index + '">' +  projectionYearsList_Display[index] + '</span>' + ' (%)'
                    +   '</th>'
        })
        // Complete hthead
        strHead += '</tr>'
                + '</thead>'

        var strBody = '<tbody>';
        $.each(products, function(productIndex, product){
            strBody += '<tr data-product_id="' + productIndex + '" class="'+ productIndex +'">'
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
                                                + ' class="form-control input-md text-right render_required cost-change" data-validate_span_id="#span_tbl_assumptions_direct_cost_per_product" required="required" >'
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
        bindChangeEventHandler('.cost-change', productCostChangeHandler);
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
                        +  '<span class="span-projection-month" data-projection_month_index="' + index + '">' +  projectionMonthYear['display'] + '</span>'
                    +   '</th>'
        })
        // Complete hthead
        strHead += '</tr>'
                + '</thead>'

        // Construct body

        var strBody = '<tbody>';
            $.each(products, function(productIndex, product){
                strBody += '<tr data-product_id="' + productIndex + '" class="'+ productIndex +'">'
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
                                var isReadonlyField = (projectionMonthYear['is_first_year'] == null || projectionMonthYear['is_first_year']) ? false : true;
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
                                                    + ' class="form-control number-input-format input-md '+ unitChangeText +' text-right render_required" data-validate_span_id="#span_tbl_assumptions_units_of_measurement_per_product" required="required " + ' + readonlyText + '></td>'

                            })
                strBody += '</tr>'
            })
            strBody += '</tbody>'

        // Append thead and tbody
        $('#tbl_assumptions_units_of_measurement_per_product').append(strHead);
        $('#tbl_assumptions_units_of_measurement_per_product').append(strBody);

        // Unbind and bind change events
        $('.unit-change').unbind('change');
        bindChangeEventHandler('.unit-change', measurementUnitChangeHandler);

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
                      +          '<select class="form-control render_required" data-validate_span_id="#span_tbl_assumptions_operating_costs" required="required">'
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
                      +          '<input type="text" class="form-control number-input-format input-md text-right render_required ' + operatingCostChange + '" data-validate_span_id="#span_tbl_assumptions_operating_costs" name="' + inputName + '" value="" required="required" ' + readonlyText + '>'
                      +      '</td>'
                                 colOrder++;
                             })
             strRow   +='</tr>'
        return strRow;

    }

    function bindChangeEventHandler(idOrClass, handler){
        if (navigator.appName == 'Microsoft Internet Explorer' || navigator.appName == "Netscape"){
            $(idOrClass).focusout(handler);
        }else{
            $(idOrClass).change(handler);
        }
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
        strTableInner     +=    '<th class="text-right">'
                          +         '<span class="span-projection-year" data-projection_year_index="' + projectionYearIndex + '">' + projectionYearsList_Display[projectionYearIndex] + '</span> ' + '<span class="span-currency"></span>' + '</th>'
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
        bindChangeEventHandler('.operating-cost-change', operatingCostChangeHandler)

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
                     +       '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" data-validate_span_id="#span_tbl_assumptions_employee_roles_list" placeholder="" value="" required="required" >'
                     +   '</td>'
        });
          strRowHtml +=   '<td class="td-input td-sm">'
                     +       '<select class="form-control text-center render_required" data-validate_span_id="#span_tbl_assumptions_employee_roles_list" name="cost_type" required="required">'
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
            strTableInner +=    '<th class="text-right" >'
                          +         '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYearsList_Display[index] + '</span>' + '</th>'
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
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" data-validate_span_id="#span_tbl_assumptions_employees_working_hours" placeholder="" value="" required="required" >'
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
            strTableInner  +=            '<th class="text-right">'
                           +                '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYearsList_Display[index] + '</span>' + '</th>'
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
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required ' + hourlyRateChangeText +' " data-validate_span_id="#span_tbl_assumptions_employees_hourly_rates" placeholder="" value="" required="required" ' + readonlyText + '>'
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
            strTableInner  +=            '<th class="text-right">'
                           +                '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYearsList_Display[index] + '</span>' + '<span class="span-currency"></span>' + '</th>'
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
        bindChangeEventHandler('.hourly-rate-change', employeeHourlyRateChangeHandler);

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
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" data-validate_span_id="#span_tbl_assumptions_capital" placeholder="" value="" required="required">'
                       +        '</td>'
                       +        '<td class="td-input text-right td-md ' + projectionYear +' month_of_investment">'
                                if(rowCount <= 1)
                                {
            strRowHtml +=           '<select class="form-control text-right" name="' + investmentMonth + '" data-validate_span_id="#span_tbl_assumptions_capital" required="required">'
            $.each(getMonthsListForYear(projectionYear, false), function (monthIndex, projectionMonth) {
                strRowHtml +=             '<option value="'+ monthIndex +'"  class="span-projection-month" data-projection_month_index="' + monthIndex + '">'+  projectionMonth['display'] +'</option>'
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
            strTableInner  +=            '<th class="text-right" >'
                           +                    '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYearsList_Display[index] + '</span>' + '<span class="span-currency"></span>' + '</th>'
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
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right" data-validate_span_id="#span_tbl_assumptions_usage_tangible_assets" placeholder="" value="" required="required">'
                       +        '</td>'
                       +        '<td class="'+ projectionYear+' month_added td-input td-sm">'
                       +            '<select class="form-control text-center" name="' + investmentMonth + '" data-validate_span_id="#span_tbl_assumptions_usage_tangible_assets" required="required">'
            $.each(getMonthsListForYear(projectionYear, false), function (monthIndex, projectionMonth) {
                strRowHtml +=             '<option value="'+ monthIndex +'" class="span-projection-month" data-projection_month_index="' + monthIndex + '">'+ projectionMonth['display'] +'</option>'
            })
            strRowHtml +=           '</select>'
                       +        '</td>'
        });
            strRowHtml +=       '<td class="td-input td-sm">'
                       +            '<input type="number" max="100" min="0" name="' + depreciationRate + '" class="form-control number-input-format text-right render_required" data-validate_span_id="#span_tbl_assumptions_usage_tangible_assets" placeholder="" required="required">'
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
            strTableInner  +=            '<th class="text-right">'
                           +                '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYearsList_Display[index] + '</span>' + '<span class="span-currency"></span>' + '</th>'
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
                       +            '<input type="text" name="' + inputName + '" class="form-control number-input-format text-right render_required" data-validate_span_id="#span_tbl_assumptions_usage_intangible_assets" placeholder="" required="required">'
                       +        '</td>'
                       +        '<td class="'+ projectionYear + ' month_added td-input td-sm">'
                       +            '<select class="form-control text-center" name="' + investmentMonth + '" data-validate_span_id="#span_tbl_assumptions_usage_intangible_assets" required="required">'
            $.each(getMonthsListForYear(projectionYear, false), function (monthIndex, projectionMonth) {
                strRowHtml +=             '<option value="'+ monthIndex +'" class="span-projection-month" data-projection_month_index="' + monthIndex + '">'+ projectionMonth['display'] +'</option>'
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
            strTableInner  +=            '<th class="text-right" >'
                           +                '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYearsList_Display[index] + '</span>' + '<span class="span-currency"></span>' + '</th>'
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
                        +            '<input type="text" class="form-control" name="' + depositItemNameId + '" value="' + depositItemName + '"  placeholder="" required="required" >'
                        +        '</td>'
                        +       '<td class="td-input td-md">'
                        +            '<input type="text" class="form-control number-input-format text-right render_required" name="' + inputName + '" data-validate_span_id="#span_tbl_assumptions_usage_deposits" placeholder="" value="" required="required" >'
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
                           +             '<th class="text-right" >'
                           +                '<span class="span-projection-year" data-projection_year_index="0">' + projectionYearsList_Display[0] + '</span>' + '<span class="span-currency"></span>' + '</th>'
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
                        +            '<input type="text" class="form-control text-right number-input-format render_required" name="' + inputName + '" data-validate_span_id="#span_tbl_assumptions_usage_other_startup_costs"  placeholder="" value="" required="required" >'
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
                           +             '<th class="text-right">'
                           +                '<span class="span-projection-year" data-projection_year_index="0">' + projectionYearsList_Display[0] + '</span>' + '<span class="span-currency"></span>' + '</th>'
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
        var upperLimit = parseInt(removeCommas($(upperLimitInput).val()), 0);

        var lowerLimitTD = $($(upperLimitTD).siblings('.lower-limit'))[0];
        var lowerLimitInput =$(lowerLimitTD).children('input').first();
        var lowerLimit =  parseInt(removeCommas($(lowerLimitInput).val()), 0);

        var taxRateTD = $($(upperLimitTD).siblings('.tax-rate'))[0];
        var taxRateInput =$(taxRateTD).children('input').first();
        var taxRate = parseInt(removeCommas($(taxRateInput).val()),0)
        if(taxRate == null || taxRate == 0){
            isValidStatus = false;
        }

        var differenceTD = $($(upperLimitTD).siblings('.difference'))[0];
        var differenceInput =$(differenceTD).children('input').first();


        var taxTD = $($(upperLimitTD).siblings('.tax'))[0];
        var taxInput =$(taxTD).children('input').first();
        var oldTaxValue = 0;
        if($(taxInput).val() != null  && $(taxInput).val() != ''){
            oldTaxValue = parseInt(removeCommas($(taxInput).val()), 0);
        }


        var cumulativeTaxTD = $($(upperLimitTD).siblings('.cumulative_tax'))[0];
        var cumulativeTaxInput =$(cumulativeTaxTD).children('input').first();
        var currentCumulativeTaxVal = $(cumulativeTaxInput).val() != '' ? parseInt(removeCommas($(cumulativeTaxInput).val())) : 0
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
        $(differenceInput).val(difference.toLocaleString('en'));
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
        $(taxInput).val(newTax.toLocaleString('en'));
        taxSlabs[currentSlabKey]['tax'] = newTax;

        // Update cumulative tax val
        var taxDifference = newTax - oldTaxValue;
        if(isNaN(taxSlabs['totalTaxSlabTableCumulativeTax'])){
            taxSlabs['totalTaxSlabTableCumulativeTax'] = 0;
        }
        taxSlabs['totalTaxSlabTableCumulativeTax'] += taxDifference;
        $(cumulativeTaxInput).val(taxSlabs['totalTaxSlabTableCumulativeTax'].toLocaleString('en'))
        taxSlabs[currentSlabKey]['cumulativeTax'] = taxSlabs['totalTaxSlabTableCumulativeTax']

        $('#btn-add_tax_slab').removeClass('disabled');
        $('#span-add_tax_slab_help').text('(You can now add a tax slab.)')
    }

    // Handling change in upper liumit
    bindChangeEventHandler('.input-tax-upper-limit', inputTaxUpperLimitChangeHandler);

    function inputTaxRateChangeHandler(event){
        var isValidStatus = true;
        // Get current tax slab key
        var currentSlabKey = taxSlabs['slabCount'];

        $('#btn-add_tax_slab').addClass('disabled');
        $('#span-add_tax_slab_help').text('(You can only add a tax slab when current slab is completed.)')
        // Tax rate has chaged.
        var taxRateTD = $(this).parent();
        var taxRateInput =  $(taxRateTD).children('input').first();
        var taxRate = parseInt(removeCommas($(taxRateInput).val()), 0)

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
        var upperLimit = parseInt(removeCommas($(upperLimitInput).val()), 0);


        var lowerLimitTD = $($(taxRateTD).siblings('.lower-limit'))[0];
        var lowerLimitInput =$(lowerLimitTD).children('input').first();
        var lowerLimit =  parseInt(removeCommas($(lowerLimitInput).val()), 0);


        var differenceTD = $($(taxRateTD).siblings('.difference'))[0];
        var differenceInput =$(differenceTD).children('input').first();


        var taxTD = $($(taxRateTD).siblings('.tax'))[0];
        var taxInput =$(taxTD).children('input').first();
        var oldTaxValue = $(taxInput).val() != '' ? parseInt(removeCommas($(taxInput).val()), 0) : 0;


        var cumulativeTaxTD = $($(upperLimitTD).siblings('.cumulative_tax'))[0];
        var cumulativeTaxInput =$(cumulativeTaxTD).children('input').first();
        var currentCumulativeTaxVal = $(cumulativeTaxInput).val() != '' ? parseInt(removeCommas($(cumulativeTaxInput).val())) : 0

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
        $(taxInput).val(newTax.toLocaleString('en'));
        taxSlabs[currentSlabKey]['tax'] = newTax;



        // Update cumulative tax val
        var taxDifference = newTax - oldTaxValue;
        if(isNaN(taxSlabs['totalTaxSlabTableCumulativeTax'])){
            taxSlabs['totalTaxSlabTableCumulativeTax'] = 0;
        }
        taxSlabs['totalTaxSlabTableCumulativeTax'] += taxDifference;
        taxSlabs[currentSlabKey]['cumulativeTax'] = taxSlabs['totalTaxSlabTableCumulativeTax']

        $(cumulativeTaxInput).val(taxSlabs['totalTaxSlabTableCumulativeTax'].toLocaleString('en'))

        $('#btn-add_tax_slab').removeClass('disabled');
        $('#span-add_tax_slab_help').text('(You can now add a tax slab.)')

    }

    bindChangeEventHandler('.input-tax-rate', inputTaxRateChangeHandler)

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

        var currentUpperLimit = removeCommas($($($('#tbl_assumptions_tax_slabs_' + rowCount).children('td')[2]).children('input')[0]).val())
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
                       +         '<input type="text" class="form-control number-input-format text-right input-tax-lower-limit"  placeholder="" min="0" value="'+ newLowerLimit.toLocaleString('en') +'" readonly>'
                       +     '</td>'
                       +     '<td class="td-input upper-limit">'
                       +         '<input type="text" class="form-control number-input-format text-right input-tax-upper-limit" placeholder="" min="'+ newLowerLimit.toLocaleString('en') +'">'
                       +     '</td>'
                       +     '<td class="td-input tax-rate">'
                       +         '<input type="text" class="form-control number-input-format text-right input-tax-rate" placeholder="" min="0">'
                       +     '</td>'
                       +     '<td class="td-input readonly difference">'
                       +         '<input type="text" class="form-control number-input-format input-md text-right" min="0" readonly>'
                       +     '</td>'
                       +     '<td class="td-input readonly tax">'
                       +         '<input type="text" class="form-control number-input-format input-md text-right" min="0" readonly>'
                       +     '</td>'
                       +     '<td class="td-input readonly cumulative_tax">'
                       +         '<input type="text" class="form-control number-input-format input-md text-right" name="'+ taxCumulativeTD +'" min="0" readonly>'
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

        var pivotTD = $currTR.children('.' + getProjectionMonthIndex(pivotMonth))[0]; // Get td with correspoding class
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

                if(!principalVal || principalVal == '' || principalVal == 0 ){
                    return; // This is a simple continue to the next iteration command
                }


                var newVal = Math.ceil(calculateCompoundedGrowth(principalVal, growthRate/100, 1, t));
                $(autoFillTDInput).val(newVal.toLocaleString('en'));
                $(autoFillTDInput).attr('value', newVal.toLocaleString('en'));
            }
        })

        $(this).attr('value', $(this).val());
    }

    function triggerChange(inputElement){
        $(inputElement).trigger('change')
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

        // update price per product
        var productsTableRows = $('#tbl_assumptions_price_per_product tr');
        $.each(productsTableRows, function (index, TR) {
            var affectedProductId = $(this).data('product_id')
            if(affectedProductId == productId){
                // Check for affected property
                if(propAffected == 'name'){
                    // update name
                    var nameTD = $(this).children('td')[0];
                    var nameSpan = $(nameTD).children('span')[0]
                    $(nameSpan).text(newVal);
                }else if(propAffected == 'units'){
                    // units affected

                }else if(propAffected == 'growth_rate'){
                    // growth rate affected
                    var growth_rateTD = $(this).children('td')[1];
                    var growth_rateSpan = $(growth_rateTD).children('span')[0]
                    $(growth_rateSpan).text(newVal);
                    // trigger change for growth rate
                    triggerChange($($($($(TR).children('td'))[2])).children('input')[0])
                }
            }
        })

        // update cost per product
        var productCostTRs = $('#tbl_assumptions_direct_cost_per_product tr')
        $.each(productCostTRs, function (index, TR) {
            var affectedProductId = $(this).data('product_id')
            if(affectedProductId == productId){
                // Check for affected property
                if(propAffected == 'name'){
                    // update name
                    var nameTD = $(this).children('td')[0];
                    var nameSpan = $(nameTD).children('span')[0]
                    $(nameSpan).text(newVal);
                }

            }
        })

        // update units of measurement
        var measurementUnitsTRs = $('#tbl_assumptions_units_of_measurement_per_product tr')
        $.each(measurementUnitsTRs, function (index, TR) {
            var affectedProductId = $(this).data('product_id')
            if(affectedProductId == productId){
                // Check for affected property
                if(propAffected == 'name'){
                    // update name
                    var nameTD = $(this).children('td')[0];
                    var nameSpan = $(nameTD).children('span')[0]
                    $(nameSpan).text(newVal);
                }else if(propAffected == 'units'){
                    // units affected
                    var unitsTD = $(this).children('td')[1];
                    var unitsTDSpan = $(unitsTD).children('span')[0]
                    $(unitsTDSpan).text(newVal);

                }else if(propAffected == 'growth_rate'){
                    // growth rate affected
                    var growth_rateTD = $(this).children('td')[2];
                    var growth_rateSpan = $(growth_rateTD).children('span')[0]
                    $(growth_rateSpan).text(newVal);
                    // trigger change for growth rate
                    triggerChange($($($($(TR).children('td'))[3])).children('input')[0])
                }
            }
        })


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
        if(tableId == 'tbl_assumptions_employee_roles_list')
        {
            // cascade delete corresponding trs for
            // 1. tbl_assumptions_employees_working_hours
            // 2. tbl_assumptions_employees_hourly_rates
            var roleId = $(row).attr('id');
            $('#tbl_assumptions_employees_working_hours tr.' + roleId).remove();
            $('#tbl_assumptions_employees_hourly_rates tr.' + roleId).remove();
        }
        else if(tableId == 'tbl_assumptions_tax_slabs')
        {
            // adjust totalCumulativeTaxValue by the amount of tax
            var rowCount = $('#tbl_assumptions_tax_slabs tbody').children('tr').length;
            var taxTD = $($('#tbl_assumptions_tax_slabs_' + rowCount).children('.tax'))[0];
            var taxInput = $($(taxTD).children('input'))[0]
            var currentTax = $(taxInput).val() != '' ? parseInt(removeCommas($(taxInput).val()), 0) : 0
            // get current tax slab and remove
            var currentTaxSlabKey = taxSlabs['slabCount'];
            delete taxSlabs[currentTaxSlabKey]; // does the deletion
            taxSlabs['slabCount'] -= 1;
            taxSlabs['totalTaxSlabTableCumulativeTax'] -= currentTax;
        }

        $(row).remove();

        //Look for any other necessary action after that!!
        if(tableId == 'tbl_assumptions_tax_slabs')
        {
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
        //generatePrijectionYearsList();
        //generateProjectionMonthsList();


        generatePricePerProductTable();
        generateDirectCostPerProductTable();
        generateUnitOfRevenueMeasurementTable();

        // Generate Operational costs table
        generateOperatingCostsTable();


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
    bindChangeEventHandler('.product-change', productDetailsChangeHandler);
    bindChangeEventHandler('.price-change', productPriceChangeHandler);


    bindChangeEventHandler('.cost-change', productCostChangeHandler);
    bindChangeEventHandler('.operating-cost-change', operatingCostChangeHandler);
    bindChangeEventHandler('.hourly-rate-change', employeeHourlyRateChangeHandler)
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
            bindChangeEventHandler('.operating-cost-change', operatingCostChangeHandler);

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

            //number-input-format
            $('.number-input-format').unbind('keydown')
            $('.number-input-format').keydown(numberFormatKeyDownHandler)

            // Unbind and bind click event
            $('#tbl_assumptions_tax_slabs .action-delete-row').unbind('click');
            $('#tbl_assumptions_tax_slabs .action-delete-row').click(deleteRowEventHandler);

            // Unbind and bind change event
            $('#tbl_assumptions_tax_slabs .input-tax-upper-limit').unbind('change');
            bindChangeEventHandler('#tbl_assumptions_tax_slabs .input-tax-upper-limit', inputTaxUpperLimitChangeHandler);

            $('#tbl_assumptions_tax_slabs .input-tax-rate').unbind('change');
            bindChangeEventHandler('#tbl_assumptions_tax_slabs .input-tax-rate', inputTaxRateChangeHandler);
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

    function getEmployeeCostPerMonth(category){
        var employeeCostPerMonthDict_Final = {}
        var employeeCostPerMonthDict = {}
        var numberOfEmployeesPerRoleTableRows = $('#tbl_assumptions_employee_roles_list tbody tr');
        var excludedEmployeeRoleIds = [];
        $.each(numberOfEmployeesPerRoleTableRows, function (employeeRoleTRIndex, employeeRoleTR) {
            var employeeRoleId = $(employeeRoleTR).data('row_id')

            // Check direct/indirect option
            var costTypeTD = $(employeeRoleTR).children('td').last()
            var costTypeSelect = $(costTypeTD).children('select')[0]
            var costTypeId = parseInt($(costTypeSelect).val(), 10)
            if(costTypeId != category){
                excludedEmployeeRoleIds.push(employeeRoleId);
                return; // This takes you to the next iteration if cost does not match
            }

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

            if(excludedEmployeeRoleIds.indexOf(employeeRoleId) >= 0){
                return;
            }

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
            if(excludedEmployeeRoleIds.indexOf(employeeRoleId) >= 0){
                return;
            }
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
            if(excludedEmployeeRoleIds.indexOf(employeeRoleId) >= 0){
                return;
            }

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
                depreciationPerMonth = depreciationPerMonth > amountAdded ? amountAdded : depreciationPerMonth;

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
        var employeeCostPerMonth_Direct = getEmployeeCostPerMonth(1); // specify if direct, total or indirect
        var employeeCostPerMonth_Indirect = getEmployeeCostPerMonth(2); // specify if direct, total or indirect
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
        var employeeCostTotals_Indirect = {}

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
                        + '<span class="span-projection-month" data-projection_month_index="' + index + '">' +   projectionMonthYear['display'] + '</span>'+ '<span class="span-currency"></span>'
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
        strHtml = '<tr><td class="text-underline">Employee Cost (Direct Cost)</td>'
                $.each(projectionMonthsList, function(projectionMonthIndex, projectionMonth){
                    strHtml += '<td> </td>'
                })
        strHtml += '</tr>'
        $('#tbl_pnl tbody').append(strHtml);
        // Add employee cost rows
        $.each(employeeCostPerMonth_Direct, function (employeeRoleIndex, employeeRoleCost) {
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

        // check before adding
        if(!$.isEmptyObject(employeeCostPerMonth_Indirect)){
            strHtml = '<tr><td class="text-underline">Employee Cost (Indirect Cost)</td>'
                    $.each(projectionMonthsList, function(projectionMonthIndex, projectionMonth){
                        strHtml += '<td> </td>'
                    })
            strHtml += '</tr>'
            $('#tbl_pnl tbody').append(strHtml);
            // Add employee cost rows
            $.each(employeeCostPerMonth_Indirect, function (employeeRoleIndex, employeeRoleCost) {
                strHtml = '<tr>'
                        +     '<td>' + employeeRoleCost['name'] + '</td>'
                $.each(employeeRoleCost['projection_months'], function (monthIndex, employmentCost) {
                    if(employeeCostTotals_Indirect[monthIndex] == null){
                        employeeCostTotals_Indirect[monthIndex] = 0;
                    }

                    if(operatingCostPerMonthTotals[monthIndex] == null){
                        operatingCostPerMonthTotals[monthIndex] = 0;
                    }
                    if(overallCost[monthIndex] == null){
                        overallCost[monthIndex] = 0;
                    }
                    employeeCostTotals_Indirect[monthIndex] += employmentCost;
                    operatingCostPerMonthTotals[monthIndex] += employmentCost;
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
        }


        // Indirect Employee cost totals
        // check before adding
        if(!$.isEmptyObject(employeeCostTotals_Indirect)){
            strHtml = '<tr class="tr-totals">'
                    +   '<td>Employee Cost Totals (Indirect Costs)</td>'
            $.each(employeeCostTotals_Indirect, function (monthIndex, amount) {
                strHtml    += '<td class="monthly td-input readonly' + ' Addyear ' + ' ' + ' Addmonth ' + ' ' + ' Showistotal ' + '"'
                                            + ' data-is_total_col="' + 'Showistotal' + '"'
                                            + ' data-projection_month_id="' + 'Addmonth' + '" '
                                            + ' data-projection_year="' + 'Addyear' + '" '
                                            + ' width="200">'
                                            +   '<input name="" '
                                            +       ' type="text"'
                                            +       ' value="' + amount + '"'
                                            +       ' class="form-control input-md text-right rpt_presentation" readonly></td>'
                })
                strHtml          +='</tr>'

            $('#tbl_pnl tbody').append(strHtml);
        }


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
        var cashFlowClosingCashBalancePerMonth = generateCashFlowStatement(revenuePerProductPerMonth, revenueTotals, directCostTotals, employeeCostTotals_Indirect,
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
            if(projectionMonthsList[monthIndex] == null)
                return;
            strHtml    += '<td class="td-input td-xs readonly text-right"'
                                + ' data-projection_month_id="' + 'Addmonth' + '" '
                                + ' data-projection_year="' + 'Addyear' + '" '
                                + ' width="200">'
                                + '<span class="span-projection-month" data-projection_month_index="' + monthIndex + '">' + projectionMonthsList[monthIndex]['display'] + '</span>' + '<span class="span-currency"> </span> '
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

    function generateCashFlowStatement(revenuePerProductPerMonth, revenueTotals, directCostTotals, employeeCostTotals_Indirect,
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
                    +      '<span class="span-projection-month" data-projection_month_index="' + index + '">' + projectionMonthYear['display'] + '</span>' + '<span class="span-currency"></span>';
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

        // Indirect Employee cost totals


        // Check if available before adding
        if(!$.isEmptyObject(employeeCostTotals_Indirect)){
            strHtml = '<tr class="">'
                +   '<td class="">In-Direct Employee Cost Totals</td>'
            $.each(employeeCostTotals_Indirect, function (monthIndex, monthlyDirectCostTotal) {
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
        }

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
                    +      '<span class="span-projection-year" data-projection_year_index="' + index + '">' + projectionYear + '</span>' + '<span class="span-currency"></span>';
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
                    +           ' value="' + Math.abs(cumulativePayables) + '"'
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
        var validateSpanId = $(val).data('validate_span_id')
        console.log('validateSpanId: ' + validateSpanId)
        $(validateSpanId).text($(validateSpanId).data('message'))
    }

    function markAsValid(val){
        $(val).css('border', '1px solid #ccc');
        $(val).css('background-color', '#fff');
        var validateSpanId = $(val).data('validate_span_id')
        $(validateSpanId).text('')
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
    bindChangeEventHandler('input,textarea,select', function(event){
        $(this).attr('value', $(this).val());
        // validate
        var validationMessageSpanId = $(this).data('validate_span_id');
        if(validationMessageSpanId != null && validationMessageSpanId != ''){
            if($(validationMessageSpanId).hasClass('is-table-span-validate-message')){
                // not validating tables at this stage
            }else{
                //Validate
                if($(this).val() == ''){
                    markAsInvalid($(this))
                    $(validationMessageSpanId).text($(validationMessageSpanId).data('message'))
                }else{
                    markAsValid($(this))
                    $(validationMessageSpanId).text('');
                }

            }
        }

    });

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
            if(currentStepId == '#step-1')
            {
                saveTitlePage();
            }
            else if(currentStepId == '#step-2')
            {
                saveMainContent()
            }
            else if(currentStepId == '#step-3')
            {
                saveFinancialAssumptions()
            }
            else if(currentStepId == '#step-4')
            {
                saveFinancialDataInput()
                stepMonitor['#step-4']['auto_generate'] = false
                stepMonitor['#step-4']['passed'] = true
            }
            else if(currentStepId == '#step-5'){
                // Nothing needs to be save for step 5
            }


            // Check if clicked step requires generation
            //if(['#step-3', '#step-4', '#step-5'].indexOf(clickedStep) > -1){
            //    $('#main-nav').removeClass('section-fluid')
            //    $('#main-nav').addClass('section')
            //    console.log("Removing")
            //}else{
            //    $('#main-nav').removeClass('section')
            //    $('#main-nav').addClass('section-fluid')
            //    console.log('Adding ')
            //}

            if(clickedStep == '#step-4'){
                $('#btn_regenerate_page').removeClass('hidden')
                if(stepMonitor[clickedStep]['auto_generate'] == true) {
                    // Autogenerate if necessary
                    // generate projectionYearsList
                    toggleSpinner(true, 'Generating financial data input tables/fields!')
                    //generatePrijectionYearsList();
                    //generateProjectionMonthsList();
                    generatePricePerProductTable();
                    generateDirectCostPerProductTable();
                    generateUnitOfRevenueMeasurementTable();

                    // Generate Operational costs table
                    generateOperatingCostsTable();


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
                    stepMonitor[clickedStep]['auto_generate'] = false;
                }
            }else if(clickedStep == '#step-5' ){
                $('#btn_regenerate_page').removeClass('hidden')
                if(autogenerateReports) {
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
                    autogenerateReports = false;
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
        var form = $(this);

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

    bindChangeEventHandler('#financial_assumptions input,textarea,select', function(event){
        $(this).attr('value', $(this).val());
        autogenerateReports = true;
    });

    bindChangeEventHandler('#financial_data_input input,textarea,select', function(event){
        $(this).attr('value', $(this).val());
        autogenerateReports = true;
        console.log("Autogenerate flag changed!!")
    });

    function saveFinancialAssumptions(){
        $('#financial_assumptions input,textarea,select').each(function(index){
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
        $('#financial_data_input input,textarea,select').each(function(index){
            $(this).attr('value', $(this).val());
        })

        //syncValAttributes('#frm_bplanner_financial_data_input_page')
        var data = $('#frm_bplanner_financial_data_input_page').serializeArray();
        var titlePageId = $('#frm_bplanner_title_page .id').val()
        // add titlePageId to serialized data
        data.push({name: "title_page_id", value: titlePageId});
        // add frm_bplanner_financial_data_input_page // financial_input
        var financialInputHTML = $('#frm_bplanner_financial_data_input_page').html();

        data.push({name: "financial_input", value: financialInputHTML});
        //csrfmiddlewaretoken
        var token = getCookie('csrftoken')
        data.push({name: "csrfmiddlewaretoken", value: token});


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
        data.push({name: "projection_years_list_display", value: JSON.stringify(projectionYearsList_Display)});
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
        data.push({name: "month_list_initiated", value: JSON.stringify(monthListInitiated)})
        data.push({name: "year_list_initiated", value: JSON.stringify(yearListInitiated)})

        $.ajax({
          type: "POST",
          url: '/dashboard/save/business-plan/settings',
          data: data,
          success: function(response){
              settingsId = response.id;
          },
          error: function(response){
              console.log("some error has occurred saving business plan settings!!");
          },
          dataType: 'json'
        });
    }

    /* ECHRTS */
    function init_echarts_dboard() {
        if( typeof (echarts) === 'undefined'){ return; }
          theme = {
          color: [
              '#3a7fd5', '#f0ad4e', '#26B99A', '#34495E', '#BDC3C7', '#3498DB',
              '#9B59B6', '#8abb6f', '#759c6a', '#bfd3b7'
          ],

          title: {
              itemGap: 4,
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
              borderWidth: 1
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

    function renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, allowFloat){
        // containerId without
        if ($('#' + containerId).length ){
          var echartBar = echarts.init(document.getElementById(containerId), theme);
          echartBar.setOption({
            label: {
                normal: {
                    show: true,
                    position: 'top',
                    formatter: function (data) {
                        return formatNumber(data.value, allowFloat)
                    }
                }
            },
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
            data.push(Math.ceil(amount));
        })
        var seriesData = [
            {
              name: 'Capital',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            data.push(Math.ceil(amount));
        })
        var seriesData = [
            {
              name: 'Liabilities',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            dataTangibleAssets.push(Math.ceil(amount));
        })
        $.each(intangibleAssetsBalanceTotal, function (projectionYear, amount) {
            dataInTangibleAssets.push(Math.ceil(amount));
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
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
                dataCashGenerated.push(Math.ceil(amount));
        })
        $.each(closingCashBalancePerMonth, function (projectionMonthIndex, amount) {
            if(projectionMonthIndex.indexOf('total') < 0)
                dataClosingCashBalance.push(Math.ceil(amount));
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
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            data.push(Math.ceil(amount));
        })
        var seriesData = [
            {
              name: 'Revenue',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            data.push(Math.ceil(amount));
        })
        var seriesData = [
            {
              name: 'Direct Cost',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            if(projectionMonthIndex.indexOf('Total') > -1)
                data.push(Math.ceil(amount));
        })
        var seriesData = [
            {
              name: 'Gross Profit',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            data.push(Math.ceil(amount));
        })
        var seriesData = [
            {
              name: 'Operating Cost',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            if(projectionMonthIndex.indexOf('Total') > -1)
                data.push(Math.ceil(amount));
        })
        var seriesData = [
            {
              name: 'Earning aftr Tax',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, false);
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
            if(projectionMonthIndex.indexOf('Total') > -1)
                data.push(amount);
        })
        var seriesData = [
            {
              name: 'Net Margin',
              type: 'bar',
              data: data
            },
        ]
        renderBarChart(containerId, title, subTitle, dataX, seriesData, legendData, true);
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
            //generatePrijectionYearsList();
            //generateProjectionMonthsList();

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
          // Check if delete business plan $(this) represents what was clicked
          var id = $(this).attr('id')
          if(id == 'btn_regenerate_page'){
              // This is special for page regeneration
              $('#btn_regenerate_page').addClass('disabled')
              regenerateCurentPate();

              // Unbind/ bind events
              $('.number-input-format').unbind('keydown')
              $('.number-input-format').keydown(numberFormatKeyDownHandler)

              // enable regenerate button
              $('#btn_regenerate_page').removeClass('disabled')
          }

      },
      onCancel: function() {
        // page not regenerated... Don't do anything

      },
      placement: 'bottom',
      title: 'Sure to Proceed with this action?',
      content: 'Note: This action will make changes that cannot be undone.'
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
        toggleSpinner(false, 'Done!')
        $('#btn_save_business_plan').removeClass('disabled')
    })

    // update all currency spans at start.
    updateCurrency(getCurrency());

    function getTaxSystemId(){
        return $('#id_taxation_system').val();
    }

    bindChangeEventHandler('#id_taxation_system', function (event) {
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
    });

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

    bindChangeEventHandler('#id_offerings_products_or_services', function (event) {
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
    });

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

    function formatNumber(num, allowFloat){
        currVal = num + ''
        var currVal = num + ''
        if(currVal == ''){
            return '0';
        }
        currVal = currVal.replace(/\,/g,'');
        if(allowFloat){
            var val = parseFloat(currVal, 10)
            return val.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }else{
            var val = parseInt(currVal, 10)
            return val.toLocaleString('en');
        }

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

        if (keyCode > 64 && keyCode < 91){
            //codes for backspace, delete, tab, enter
            if((keyCode == 86 || keyCode == 88 || keyCode == 90 || keyCode == 65 || keyCode == 67) && ev.ctrlKey){

            }else{
                ev.preventDefault();
            }

        }else if (keyCode == 46 || keyCode == 190) {
            // point typed..
            // Check if input has a point already
            if (currVal.indexOf('.') > -1) {
                // Input has a decimal already.. prevent entry
                ev.preventDefault();
                direction = 0;
            }
        }

        // wait seconds and update value
        setTimeout(function(){
            var currVal = $(ev.target).val();
            if(currVal == ''){
                return;
            }
            currVal = currVal.replace(/([,.€$!# _()%^&*~])+/g,'');
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
    bindChangeEventHandler('.unit-change', measurementUnitChangeHandler);


    // Unbind/ bind events
    $('.number-input-format').unbind('keydown')
    $('.number-input-format').keydown(numberFormatKeyDownHandler)


    // Unbind bind change events
    $('.operating-cost-change').unbind('change');
    bindChangeEventHandler('.operating-cost-change', operatingCostChangeHandler)

    // Unbind and bind events again
    $('.hourly-rate-change').unbind('change');
    bindChangeEventHandler('.hourly-rate-change', employeeHourlyRateChangeHandler);

    function getBase64(file, selectorId, stringContainerId) {
       var reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = function () {
           var result = reader.result;
           $(selectorId).attr('src', result)
           $(stringContainerId).val(result)
       };
       reader.onerror = function (error) {
         console.log('Error: ', error);
       };
    }

    bindChangeEventHandler('#input-logo', function (event) {
        // File input has changed

        if($('#input-logo').get(0).files.length > 0){
            // Something is here
            var file = $('#input-logo').get(0).files[0]
            var base64 = getBase64(file, '#logo-img', '#id_logo');
        }else{
            // Empty... clear details
            // reset values
            var defaultVal = 'data:image/png;base64,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gDv33HPj3rghAAEIdIqA5Inkisf8q8mhFz3+eGWQAApA9hrtGivy/fFiT5o0yR122GFxb9wQgAAEOkRAckTyxGPuNz/JH0xOCKAAZKwhTfv+uxX5I2bbbROsamibzoEDB+oSAwEIQKDDBCQ/AtuNS958pCR/OpwuN6STAApAOtulYqlKnwIujEfSkp0LLrjAt1d3PCpuCEAAAu0IaI9/yY/A0uILS3Kn3T04sk0ABSCj7Wcv441W9GvjxR89erQ74YQT4t64IQABCFQkILkh+eEx15bkjScIrywTQAHIcuv9/22Cn49X4YMf/KDbf//94964IQABCHgJSF5IbniM5EtiO3JPPLwySAAFIION1lZk08q1JEfnA+vMgO1GQ3kXXnih22233bb7cQEBCEDAR0ByQvLCc8yv5MpZJTnjuxW/jBNAAch4A9rL+YhV4fJ4NXr37u0uvvhi161bt3gQbghAAAIRAckHyQnJC4+5vCRfPEF45YEACkAeWtG5b1o1dGhQOzNy5MjQPt7t4uGAAASKSUD7/EtOeIzkieQKJscEUABy0LimpW+zanzY7LJ4daZOneqmTZsW98YNAQgUnIDkguSDx0iOfLgkVzzBeOWFAApATlrSXtZXrConm30zXiWt6w1o+fGouCEAgQIQkDwIrPeX/Di5JE8KQKLYVUQByFH720v7qFXnk/Eqde/ePfrO17dv33gQbghAoGAEJAf03V9ywWM+WZIjniC88kYABSBnLWov70+sSj+KV0szfS+55BLXo0ePeBBuCECgIAT0/ksOBFYI/agkPwpCg2qiAOTzGfi0VWt2vGojRoxwF110ke+Er3hU3BCAQM4IWOcevf+SAx4jeSG5gSkQARSAHDa2vej6jneK2VXx6k2YMCH07S8eFTcEIJAjAvrmr/ffYyQnTinJDU8wXnklgAKQ05a1l1lHBx9n9vV4FY844gh3zDHHxL1xQwACOSWg913vvcdIPhxXkheeYLzyTAAFIMetay/1HKvemWbfilfztNNOcxMnTox744YABHJGQO+53nePkVw4syQnPMF45Z0ACkDOW9he7l9ZFT8br6a2/Tz//PPdmDFj4kG4IQCBnBDQ+6333LPNr2r42ZJ8yEltqUZHCaAAdJRYBuPbS/4/VuzvxouuGcGXXnqpGz58eDwINwQgkHECeq/1fgdW/ny3JBcy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'
            $('#logo-img').attr('src', defaultVal)
            $('#id_logo').val(defaultVal)
        }
    })


    bindChangeEventHandler('#id_first_financial_year', financialPeriodChangeHandler);

    bindChangeEventHandler('#id_first_financial_year_month', financialPeriodChangeHandler)

    bindChangeEventHandler('#id_projection_years', financialPeriodChangeHandler)

    function financialPeriodChangeHandler(event){
        // check if first month is set
        if($('#id_first_financial_year_month').val() == ''){
            return;
        }

        if(!yearListInitiated){
            firstFinancialYear = parseInt($('#id_first_financial_year').val(), 0)
            $(this).attr('value', $(this).val());
            if($('#id_projection_years').val() == ''){
                console.log('Missing projection years list')
                return;
            }
            generatePrijectionYearsList();
        }



        if(!monthListInitiated){
            generateProjectionMonthsList();
        }

        var firstFinYear = $('#id_first_financial_year').val()
        var projYears = $('#id_projection_years').val()
        if(projYears == ''){
            return;
        }

        if(firstFinYear == '' || projYears == ''){
            return false;
        }

        projectionYearsList_Display = returnProjectionYearsList();
        var newProjectionMonthsList = returnProjectionMonthsList(projectionYearsList_Display);


        // Update years display
        $('.span-projection-year').each(function (index) {
            // get projection year index
            $(this).text(projectionYearsList_Display[parseInt($(this).data('projection_year_index'), 10)])
        })


        // Update months display
        $.each(newProjectionMonthsList, function (index, newMonth) {
            $.each(projectionMonthsList, function (oldIndex, oldMonth) {
                if(newMonth['order'] == oldMonth['order']){
                    // this is our month of interest
                    projectionMonthsList[oldIndex]['display'] = newMonth['display'];
                }
            })
        })

        $('.span-projection-month').each(function (index) {
            var spanItem = $(this);
            // Update month indices
            var projectionMonthIndex = $(this).data('projection_month_index');
            // get current month
            var projectionMonth_old = projectionMonthsList[projectionMonthIndex];
            $.each(newProjectionMonthsList, function (index, newMonth) {
                if(newMonth['order'] == projectionMonth_old['order']){
                    $(spanItem).text(newMonth['display']);
                }
            })
        })
    }


    // clone projectionYearsList_Display on start
    // regenerate display
    if((projectionYearsList_Display == null || projectionYearsList_Display.length == 0)){
        projectionYearsList_Display = returnProjectionYearsList();
    }

    // update all selects...
    bindChangeEventHandler('select', function (index) {
        var val = $(this).val();
        $.each($(this).children('option'), function (index, obj) {
            //console.log($(obj.val()))
            if(val == obj.value){
                $(obj).attr('selected', true);
            }else{
                $(obj).removeAttr('selected')
            }
        })
    })

    // Update select values on load
    $('select').each(function (index) {
        var val = $(this).val();
        $.each($(this).children('option'), function (index, obj) {
            //console.log($(obj.val()))
            if(val == obj.value){
                $(obj).attr('selected', true);
            }else{
                $(obj).removeAttr('selected')
            }
        })
    })

})

