# Custom Report's Syntax

This new syntax should remove any copy/paste step from the report design process. This should allow the designer to focus on understanding the process they are reporting on as well as all other related processes available via reference fields.

The new syntax allows the designer to define the field to be inserted via a simple directives composed of text between square brackets:

    [Directive]

These directive are used to define which form [field](#simple-fields) to show; more complex directives are used for repeating structures ([repeating fields](#repeating-fields), [actions](#actions) and [forms](#referencing-forms)) elements.

Many directives can have options, they are specified in the following format:

    [Directive option1:(valueA|valueB|...) option2:(valueI|valueII|...)]

The first possible value will be used as default in case the option is not provided, or if the value given is not valid.

## Simple fields

** Simple fields ** are indicated using the field's name:

    [FieldName]

## Reference fields

** Reference fields ** can be indicated similar to simple fields:

    /**
     * This will show the title of the referenced entity
     **/
    [MyReferenceField]

You can also refer to a ** Simple field inside the referenced entity: ** 

    /**
     * This will show the value of a field called FieldName
     * of the MyReferenceField Reference Field
     **/
    [MyReferenceField.FieldName] 

**Note:** it is not possible to access a referenced entity via a reference:

    // This will not work!
    [ReferenceField1.OtherReferenceField.SomeField]

One solution to this limitation is to keep a reference in your process to the second level reference. If you use RPM's process flows they can be populated automatically.

## Repeating fields

Repeating fields can be displayed inside reports with the `RepeatingFields` directive, you can use it in two ways:

    [RepeatingFields format:(table|custom)]
        <content>
    [/RepeatingFields]

The `<content>` of the directive can contain other directives. They have to be **simple fields** or **fields from reference fields** that are setup as repeating.

The **format** options are:

-   **table** show the actions in table format.  
    The `<content>` of the directive will be a list the fields to be shown as columns on the table.
    
-   **custom** uses the content as an HTML template to display each action.  
    The `<content>` of the directive will contain other directives interspersed inside some HTML code.

### The “table” format

The `table` format provides a way to generate a table in which:

- Each set of repeating field will become a row 
- The name of the field becomes the header of the column.


    [RepeatingFields format:table]
        [RepeatingFieldName1]
        [RepeatingReferenceFieldName1.FieldName]
        [RepeatingFieldName2]
        [RepeatingReferenceFieldName2.FieldName]
        ...
    [/RepeatingFields]

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


### The “custom” format

The `custom` format tells RPM to repeat its content for each repeating field set. 

    <ul>
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
    [/RepeatingFields]
    </ul>


This will generate the following markup:

    <ul>
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
    </ul>

## Actions

Custom Reports also allow to show a list of actions.

They can be displayed inside reports with the `Actions` directive, the format of this directive is very similar to RepeatingFields:

    [Actions format:(table|native|custom) show:(own|ReferenceField)]
        <content>
    [/Actions]

The **format** options are:

-   **table** show the actions in table format.  
    The `<content>` of the directive will be a list the fields to be shown as columns on the table.

-   **custom** uses the content as an HTML template to display each action.
    The `<content>` of the directive will contain other directives interspersed inside some HTML code.

-   **native** show the actions in the same format they are shown inside RPM.  
    This directive takes no `<content>`.



The **show** option tells RPM from which form to pull the actions to show:

-   **own** shows the actions from the form being reported.

-   **ReferenceField** the name of a process reference field. It will show the actions from the form referenced.


The `<content>` of the directive can contain other directives. They have to be one of the following **action fields**:


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

- <a name="due">`Due`</a> - current due date for the action

      [Due format:("%B %d, %Y"|<string>)]

    The format option can be built using [Mootool's date format options][mootools-date].
    The default format `"%B %d, %Y"` will print dates as `January 12, 1986`.

[mootools-date]: http://mootools.net/docs/more/Types/Date#Date:format

- `OriginalDue` - original due date of the action

      [OriginalDue format:("%B %d, %Y"|<string>)]

    See the format options on [Due](#due).

- `Start` - start date for the action

      [Start format:("%B %d, %Y"|<string>)]

    See the format options on [Due](#due).

- `Completed` - completed date for the action

      [Start format:("%B %d, %Y"|<string>)]
    
    See the format options on [Due](#due).

- `Duration` - the total number of days the action was/has been active

      [Duration]

### The “table” format

The `table` format provides a way to generate a table in which:

- Each action will become a row 
- The name of the field becomes the header of the column.


    [Actions format:table]
        [ActionField1]
        [ActionField2]
        ...
    [/Actions]

This will generate the following markup:

    <table>
        <!-- Table Headers  -->
        <tr>
            <th>ActionField1</th>
            <th>ActionField2</th>
            <!-- ... -->
        </tr>
        <!-- Table Content: each row is one action -->
        <!-- Action 1 -->
        <tr>
            <td>Value for ActionField1</td>
            <td>Value for ActionField2</td>
            <!-- ... -->
        </tr>
        <!-- ... -->
    </table>

### The “custom” format

The `custom` format tells RPM to repeat its content for each action. 

    <ul>
    [Actions format:custom]
        <li>
            <span class="title>
                [ActionField1]
            </span>
            <span class="note">
                [ActionField2] 
            </span>
            <p>
                [ActionField3]
            </p>
        </li>
    [/Actions]
    </ul>

This will generate the following markup:

    <ul>
        <!-- Action #1 -->
        <li>
            <span class="title>
                Value for ActionField1
            </span>
            <span class="note">
                Value for ActionField2
            </span>
            <p>
                Value for ActionField3
            </p>
        </li>
        <!-- ... -->
    </ul>


### The “native” format

The `native` format will show the actions in the same way RPM displays them in a form view.

    [Actions format:native]
        
    [/Actions]

The output will vary depending on the current implementation inside RPM.

## Referencing Forms

Reports also allow the designer to show list of forms that refer to the form beign reprorted (via a Reference Field). 

They can be displayed inside reports with the `Referenced` directive, the format of this directive is very similar to RepeatingFields:

    [Referenced in:"Process Name" format:(table|custom)]
        <content>
    [/Referenced]

The `<content>` of the directive can contain other directives. They have to be **simple fields** or **fields from reference fields** that are setup on the process defined in the `in` option.

The **in** option is the process name to load data from.

- That process must have a reference field to the process of the form being reported.

The **format** options are:

-   **table** show the referencing forms in table format.  
    The `<content>` of the directive will be a list the fields to be shown as columns on the table.

-   **custom** uses the content as an HTML template to display each referencing form.
    The `<content>` of the directive will contain other directives interspersed inside some HTML code.
