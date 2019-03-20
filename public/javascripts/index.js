ej.base.enableRipple(window.ripple)

    // initialize AutoComplete component
    var atcObj = new ej.dropdowns.MultiSelect({
        delimiterChar: " ",
        mode: "Box",
        allowCustomValue: false,
        //set the data to dataSource property
        dataSource: vecIndexToDescData,
        //openOnClick: false,
        sortOrder: "Ascending",
        fields: { text: 'description', value: 'vecIndex' },
        placeholder: 'e.g. ( Dog | Wolf ) & Snowman & Cake',
        ignoreAccent: true
    });
    atcObj.appendTo('#games');
