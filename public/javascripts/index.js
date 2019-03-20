ej.base.enableRipple(window.ripple)


    // define the array of data
    var sportsData = [ "(",")", "&", "|", 'Badminton', 'Basketball', 'Cricket',
        'Football', 'Golf', 'Gymnastics',
        'Hockey', 'Rugby', 'Snooker', 'Tennis'];

    // initialize AutoComplete component
    var atcObj = new ej.dropdowns.MultiSelect({
        delimiterChar: " ",
        //mode: "Delimiter",
        mode: "Box",
        allowCustomValue: false,
        //set the data to dataSource property
        dataSource: sportsData,
        openonclick: false,
        // set the placeholder to AutoComplete input element
        placeholder: 'e.g. Dog'
    });
    atcObj.appendTo('#games');
