import { config } from '../config.js';
function dynamicallyLoadScript(url) {
    var script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
}
function debug() {
    console.log("debug!");
    apply_config(config);
    set_file();
    $('#next_button').click(goto_next_query);
    $('#prev_button').click(prev_query);
}
function apply_config(config) {
    function set(id, content) {
        document.getElementById(id).innerHTML = content;
    }
    set('title', config.UI.Title);
    set('footer', config.UI.Footer);
    set('prev_button', config.UI.Previous);
    set('next_button', config.UI.Next);
    set('menu_button', config.UI.Menu);
    set('query_content', '<b>' + config.UI.default_query_content + '</b>');
}
class Query {
    constructor(id, category, query, choice, answer) {
        this.id = id;
        this.category = category;
        this.query = query;
        this.choice = choice;
        this.answer = answer;
    }
}
function Query_Unit(id, category, query, choice, answer) {
    return new Query(id, category, query, choice, answer);
}
var queries = [];
var current_query_id = 0;
var query_history = [];
var goto_next_query = config.setting.random_next ? rand_query : next_query;
function get_reader_when_checked_file_API() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var reader = new FileReader();
        return reader;
    }
    else {
        alert('The File APIs are not fully supported by your browser. Fallback required.');
        return undefined;
    }
}
function set_file() {
    document.getElementById('base_file').onchange = function () {
        var file = this.files[0];
        var reader = get_reader_when_checked_file_API();
        reader.onload = function (progressEvent) {
            var lines = this.result.split('\n');
            queries = lines.filter((line) => line.trim() !== '').map((line) => parse_line_from_base(line));
            console.log('Loaded ' + queries.length + ' queries.');
            next_query();
        };
        reader.readAsText(file);
    };
}
function print_query_content(content) {
    document.getElementById('query_content').innerHTML = content;
}
function parse_line_from_base(line) {
    let units = line.split('\t');
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
    let rand_id = get_random_Int(queries.length);
    current_query_id = rand_id;
    if (queries[current_query_id] === undefined) {
        current_query_id = 0;
    }
    document.getElementById('interaction').innerHTML = "";
    show_query(queries[current_query_id]);
}
function check_answer() {
    let unit = queries[current_query_id];
    let cat = unit.category;
    var res = "";
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
    let a = $("#id0").is(":checked");
    let b = $("#id1").is(":checked");
    let c = $("#id2").is(":checked");
    let d = $("#id3").is(":checked");
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
    let yes = $("#id0").is(":checked");
    let noo = $("#id1").is(":checked");
    var ans = '';
    if (yes)
        ans += 'Y';
    if (noo)
        ans += 'N';
    return ans;
}
function check_answer_fill(unit) {
    document.getElementById('interaction').innerHTML = "O";
    return "";
}
function show_query(unit) {
    let cat = unit.category;
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
    $("#selection_board").append('<div data-role="navbar"><ul>\
<li><a href="#" id="button_check_answer" class="ui-btn-active">' + config.UI.Submit + '</a>\</li>\
<li><a href="#" id="button_show_answer">' + config.UI.Answer + '</a>\
</li></ul></div>');
    $("#selection_board").trigger('create');
    $("#button_check_answer").click(check_answer);
    $("#button_show_answer").click(show_answer);
}
function show_query_single_selection(unit) {
    console.log(unit);
    print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(unit.choice);
}
function show_query_multiple_selection(unit) {
    console.log(unit);
    print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(unit.choice);
}
function show_query_fill(unit) {
    console.log(unit);
    print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections([]);
}
function show_query_yes_no(unit) {
    console.log(unit);
    print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(['Y', 'N']);
}
debug();
//# sourceMappingURL=core.js.map