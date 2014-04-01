# Custom Report's Syntax

Custom Reports give users the ability to present a single form's data in a custom format using standard web technologies: HTML, CSS and JavaScript.

In between the html report designers can put directives that tell RPM what data to show. These directives are composed of text between square brackets:

    [Directive]

These directive are used to define which form [field](#simple-fields) to show; more complex directives are used for repeating structures like [repeating fields](#repeating-fields), [actions](#actions) and [forms](#referencing-forms).

Many directives can have options, they are specified in the following format:

    [Directive option1:(valueA|valueB|...) option2:(valueI|valueII|...)]

If an option is not provided (or if the provided value is not valid), the first value on the list will be used.


## Common Form Information

Form information fields can be displayed using the `Information` directive:

    [Information
        display:(
            "Process"|"Title"|"Number"|
            "Status"|"Owner"|
            "Started"|"Started by"|
            "Modified"|"Modified by"|
            "Approval result"
        )
        format:(
            "%B %d, %Y"|
            <string>
        )
    ]

### Options

- `display` - determine which information field to show.
- `format` - define the date formatting to show.

    See the format options on [Date Formatting](#date-formatting).

    This field only applies when `display` is:
    - "Started"
    - "Modified"

The following directive are available to show common

## Simple fields

Custom fields can be displayed inside reports by using the field's name as the directive content:

    [FieldName display:(value|name)]

### Options

- `display` - determines if the output will be the field value or its name.

    This is useful for cases when the report needs to show the field name beside its value.

## Reference fields

**Reference fields** can be indicated in the same way as simple fields:

    /**
     * This will show the title of the referenced entity
     **/
    [MyReferenceField display:(value|name)]

Aditionally, you can show any simple field in the referenced entity (another Form, Staff user, etc.):

    /**
     * This will show the value of a field called FieldName
     * of the MyReferenceField Reference Field
     **/
    [MyReferenceField.FieldName  display:(value|name)]

### Options

Same as [simple fields](#simple-fields).

----

**Important:** it is not possible to access a referenced entity via a reference:

    // This will not work!
    [ReferenceField1.OtherReferenceField.SomeField]

One solution to this limitation is to keep a reference in your process to the second level reference. If you use RPM's process flows they can be populated automatically.

----

## Repeating fields

Repeating fields can be displayed inside reports with the `RepeatingFields` directive, it tells RPM how to show each set of repeating fields:

    [RepeatingFields format:(table|custom)]
        <content>
    [RepeatingFields]

The `<content>` of the directive can contain other directives. They have to be **simple fields** or **reference fields** that are *setup as repeating*.

### Options

- `format` - determines how each set of repeating field is displayed:
    -   **table**: shows each set of repeating fields as a row in a table.  
        The `<content>` has to contain a list of fields to be shown as columns on the table.

            [RepeatingFields format:table]
                [RepeatingFieldName1]
                [RepeatingReferenceFieldName1.FieldName]
                [RepeatingFieldName2]
                [RepeatingReferenceFieldName2.FieldName]
                ...
            [RepeatingFields]

        - Each set of repeating field will become a row
        - The name of the field becomes the header of the column

        This will generate the following markup:

            <table>
                <!-- Table Headers  -->
                <tr>
                    <th>RepeatingFieldName1</th>
                    <th>RepeatingReferenceFieldName1.FieldName</th>
                    <th>RepeatingFieldName2</th>
                    <th>RepeatingReferenceFieldName2.FieldName</th>
                    <!-- ... -->
                </tr>
                <!-- Table Content: each row is one set of repeating field -->
                <!-- Repeating set 1 -->
                <tr>
                    <td>Value for RepeatingFieldName1</td>
                    <td>Value for RepeatingReferenceFieldName1.FieldName</td>
                    <td>Value for RepeatingFieldName2</td>
                    <td>Value for RepeatingReferenceFieldName2.FieldName</td>
                    <!-- ... -->
                </tr>
                <!-- ... -->
            </table>

    -   **custom**: shows each set of repeating fields using custom formatting.  
        The `<content>` will contain other simple and reference fields interspersed inside some HTML.

            <ul> <!-- Outside RepeatingFields  -->
            [RepeatingFields format:custom]
                <li>
                    <span class="title>
                        [RepeatingFieldName1]
                    </span>
                    <span class="note">
                        [RepeatingReferenceFieldName1.FieldName] -
                        [RepeatingFieldName2]
                    </span>
                    <p>
                        [RepeatingReferenceFieldName2.FieldName]
                    </p>
                </li>
            [RepeatingFields]
            </ul> <!-- Outside RepeatingFields  -->

        This will generate the following markup:

            <ul> <!-- Outside RepeatingFields  -->
                <!-- Repeating set 1 -->
                <li>
                    <span class="title>
                        Value for RepeatingFieldName1
                    </span>
                    <span class="note">
                        Value for RepeatingReferenceFieldName1.FieldName -
                        Value for RepeatingFieldName2
                    </span>
                    <p>
                        Value for RepeatingReferenceFieldName2.FieldName
                    </p>
                </li>
                <!-- ... -->
            </ul> <!-- Outside RepeatingFields  -->

## Actions

Custom reports can show a list of actions attached to the reported form, or to a linked form via a reference field.

They can be displayed using the `Actions` directive, it is very similar to [RepeatingFields](#repeating-fields):

    [Actions format:(table|native|custom) show:(own|"Reference Field Name")]
        <content>
    [Actions]

The `<content>` of the directive can contain other directives. They have to be one of the available [**action fields**](#action-fields).

### Options

- `format` - determines how each set of repeating field is displayed:

    - **table**:  it behaves the same as the table format on [RepeatingFields](#repeating-fields).

        The `<content>` has to contain a list of [action fields](#action-fields) to be shown as columns on the table.
        - Each action will become a row
        - The name of the field becomes the header of the column.

    - **custom**:  it behaves the same as the custom format on [RepeatingFields](#repeating-fields).

- `show` - tells RPM the origin of the actions to show:

    - **own**: shows the actions from the form being reported.

    - **"Reference Field Name"**: the name of a process reference field.  
      It will show the actions created on the form linked via the reference field.

### Action fields

- `FormTitle` - title of the form that the action is attached to

      [FormTitle link:(false|true)]

- `Done` - wether the action has been marked as done

      [Done yes:("Yes"|<string>) no:("No"|<string>)]

- `Assignee` - user name of the action's assignee

      [Assignee link:(no|yes)]

- `AddedBy` - user name of the action's creator.

      [AddedBy link:(no|yes)]

- `Type` - type of action

      [Type]

- `Description` - the action's description

      [Description]

- `Result` - the resolution message written by the assignee.

      [Result]

- `Priority` -  the action's priotiry ("Normal" or "High")

      [Priority]

- `Due` - current due date for the action

      [Due format:("%B %d, %Y"|<string>)]

    See the format options on [Date Formatting](#date-formatting).

- `OriginalDue` - original due date of the action

      [OriginalDue format:("%B %d, %Y"|<string>)]

    See the format options on [Date Formatting](#date-formatting).

- `Start` - start date for the action

      [Start format:("%B %d, %Y"|<string>)]

    See the format options on [Date Formatting](#date-formatting).

- `Completed` - completed date for the action

      [Start format:("%B %d, %Y"|<string>)]
    
    See the format options on [Date Formatting](#date-formatting).

- `Duration` - the total number of days the action was/has been active

      [Duration]

## Referencing Forms

Custom reports can show a list of forms that link to the reported form via a reference field.

They can be displayed using the `Referenced` directive, it is very similar to [RepeatingFields](#repeating-fields):

    [Referenced format:(table|custom) in:"Process Name"]
        <content>
    [Referenced]

The `<content>` of the directive can contain other directives. They have to be **simple fields** or **reference fields** that are setup on the process defined on the `in` option.

### Options

- `format` - determines how each set of repeating field is displayed:

    - **table**: it behaves the same as the table format on [RepeatingFields](#repeating-fields).

        The `<content>` has to contain a list the fields from the referencing form to be shown as columns on the table.
        - Each referencing form will become a row.
        - Each field will become a column.

    - **custom**:  it behaves the same as the custom format on [RepeatingFields](#repeating-fields).

- `in` - indicate which process to look at for references to the reported form

    That process must have a reference field to the process of the form being reported.


# Date Formatting

When showing a field that contains a date, the `format` options can be defined using [Mootool's date format options][mootools-date].

The default date format `"%B %d, %Y"` will print dates as `January 12, 1986`.

[mootools-date]: http://mootools.net/docs/more/Types/Date#Date:format
