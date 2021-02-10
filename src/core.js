/* Core configuration js file */
//import * as config from '../config.js';
function dynamicallyLoadScript(url) {
    var script = document.createElement("script"); // create a script DOM node
    script.src = url; // set its src to the provided URL
    document.head.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
//dynamicallyLoadScript('./config.js');
function debug() {
    console.log("debug!");
    //read_base()
    apply_config(config);
    set_file();
}
function apply_config(config) {
    document.getElementById('title').innerHTML = config.UI.Title;
    document.getElementById('footer').innerHTML = config.UI.Footer;
    document.getElementById('prev_button').innerHTML = config.UI.Previous;
    document.getElementById('next_button').innerHTML = config.UI.Next;
    document.getElementById('menu_button').innerHTML = config.UI.Menu;
    document.getElementById('query_content').innerHTML = '<b>' + config.UI.default_query_content + '</b>';
}
function Query_Unit(id, category, query, choice, answer) {
    return {
        id: id,
        category: category,
        query: query,
        choice: choice,
        answer: answer
    };
}
var queries = [];
var current_query_id = 0;
var query_history = [];
var goto_next_query = config.setting.random_next ? rand_next : next_query;
/**
 * Check for the various File API support.
 */
function get_reader_when_checked_file_API() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var reader = new FileReader();
        return reader;
    }
    else {
        alert('The File APIs are not fully supported by your browser. Fallback required.');
        return false;
    }
}
function set_file() {
    document.getElementById('base_file').onchange = function () {
        var file = this.files[0];
        var reader = get_reader_when_checked_file_API();
        reader.onload = function (progressEvent) {
            // Entire file
            //console.log(this.result);
            // By lines
            var lines = this.result.split('\n');
            queries = lines.filter(function (line) { return line.trim() !== ''; }).map(function (line) { return parse_line_from_base(line); });
            console.log('Loaded ' + queries.length + ' queries.');
            next_query();
            //console.log(queries);
        };
        reader.readAsText(file);
    };
}
function print_query_content(content) {
    document.getElementById('query_content').innerHTML = content;
}
function parse_line_from_base(line) {
    var units = line.split('\t');
    return Query_Unit(units[0], units[1], units[2], [units[3], units[4], units[5], units[6]], units[7]);
}
function next_query() {
    if (queries.length <= 0) {
        console.log("No query! Please load base file first of check your base file if empty!");
        return;
    }
    if (current_query_id + 1 >= queries.length) {
        current_query_id = 0;
    }
    else {
        current_query_id += 1;
    }
    if (queries[current_query_id] === undefined) {
        current_query_id = 0;
    }
    document.getElementById('interaction').innerHTML = "";
    show_query(queries[current_query_id]);
}
function prev_query() {
    if (queries.length <= 0) {
        console.log("No query! Please load base file first of check your base file if empty!");
        return;
    }
    if (current_query_id <= 0 && queries.length > 0) {
        current_query_id = queries.length - 1;
    }
    else {
        current_query_id -= 1;
    }
    if (queries[current_query_id] === undefined) {
        current_query_id = 0;
    }
    document.getElementById('interaction').innerHTML = "";
    show_query(queries[current_query_id]);
}
function get_random_Int(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function rand_query() {
    if (queries.length <= 0) {
        console.log("No query! Please load base file first of check your base file if empty!");
        return;
    }
    var rand_id = get_random_Int(queries.length);
    current_query_id = rand_id;
    if (queries[current_query_id] === undefined) {
        current_query_id = 0;
    }
    document.getElementById('interaction').innerHTML = "";
    show_query(queries[current_query_id]);
}
function check_answer() {
    var unit = queries[current_query_id];
    var cat = unit.category;
    var res = false;
    if (cat == '单选题') {
        res = check_answer_selection(unit);
    }
    else if (cat == "多选题") {
        res = check_answer_selection(unit);
    }
    else if (cat == '判断题') {
        res = check_answer_yes_no(unit);
    }
    else if (cat == '填空题') {
        res = check_answer_fill(unit);
    }
    else if (cat == '问答题') {
        res = check_answer_fill(unit);
    }
    else if (cat == '简答题') {
        res = check_answer_fill(unit);
    }
    else {
        console.log('Query category of ' + cat + ' is not supported!');
        alert('Query category error, please reload base file.');
        return false;
    }
    if (res === unit.answer) {
        show_message('O');
    }
    else {
        show_message('X');
    }
    return res;
}
function show_answer() {
    show_message(queries[current_query_id].answer);
}
function show_message(msg) {
    document.getElementById('interaction').innerHTML = msg;
}
function check_answer_selection(unit) {
    var a = $("#id0").is(":checked");
    var b = $("#id1").is(":checked");
    var c = $("#id2").is(":checked");
    var d = $("#id3").is(":checked");
    var ans = '';
    if (a)
        ans += 'A';
    if (b)
        ans += 'B';
    if (c)
        ans += 'C';
    if (d)
        ans += 'D';
    return ans;
}
function check_answer_yes_no(unit) {
    var yes = $("#id0").is(":checked");
    var noo = $("#id1").is(":checked");
    var ans = '';
    if (yes)
        ans += 'Y';
    if (noo)
        ans += 'N';
    return ans;
}
function check_answer_fill(unit) {
    document.getElementById('interaction').innerHTML = "O";
}
function show_query(unit) {
    var cat = unit.category;
    if (cat == '单选题') {
        show_query_single_selection(unit);
    }
    else if (cat == "多选题") {
        show_query_multiple_selection(unit);
    }
    else if (cat == '判断题') {
        show_query_yes_no(unit);
    }
    else if (cat == '填空题') {
        show_query_fill(unit);
    }
    else if (cat == '问答题') {
        show_query_fill(unit);
    }
    else if (cat == '简答题') {
        show_query_fill(unit);
    }
    else {
        console.log('Query category of ' + cat + ' is not supported!');
        alert('Query category error, please reload base file.');
    }
}
function create_selections(selections) {
    $("#selection_board").html('<fieldset data-role="controlgroup"><legend><b>' + config.UI.Select_msg + '</b></legend></fieldset>');
    for (var i = 0; i < selections.length; i++) {
        $("fieldset").append('<input type="checkbox" name="' + selections[i] + '" id="id' + i + '"><label for="id' + i + '">' + selections[i] + '</label>');
    }
    //$("#selection_board").append('<a href="#" data-role="button" data-inline="true" id="btndelcat">Elimina</a>');
    $("#selection_board").append('<div data-role="navbar"><ul>\
<li><a href="#" class="ui-btn-active" onclick="check_answer()">' + config.UI.Submit + '</a>\</li>\
<li><a href="#" onclick="show_answer()">' + config.UI.Answer + '</a>\
</li></ul></div>');
    $("#selection_board").trigger('create');
}
function show_query_single_selection(unit) {
    console.log(unit);
    print_query_content("<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(unit.choice);
}
function show_query_multiple_selection(unit) {
    console.log(unit);
    print_query_content("<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(unit.choice);
}
function show_query_fill(unit) {
    console.log(unit);
    print_query_content("<b>" + unit.category + '</b>\t' + unit.query);
    create_selections([]);
}
function show_query_yes_no(unit) {
    console.log(unit);
    print_query_content("<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(['Y', 'N']);
}
debug();
