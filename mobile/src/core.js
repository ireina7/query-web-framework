import { config } from '../config.js';
import { get_random_Int } from './utils.js';
function main() {
    console.log("Debuging on " + navigator.userAgent);
    UI.init();
    apply_config(config);
}
function apply_config(c = config) {
    function set(id, content) {
        document.getElementById(id).innerHTML = content;
    }
    [
        ['title', c.UI.title],
        ['footer', c.UI.footer],
        ['prev_button', c.UI.prev],
        ['next_button', c.UI.next],
        ['menu_button', c.UI.menu],
        ['query_content', '<b>' + c.UI.default_query_content + '</b>']
    ].map(([k, v]) => set(k, v));
    UI.switch_theme(c.UI.theme);
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
class Test {
    constructor(queries, f_next = config.setting.random_next
        ? id => get_random_Int(queries.length)
        : id => id + 1) {
        this.queries = queries;
        this.current_id = 0;
        this.history = [];
        this.f_next = f_next;
    }
    get current_query() {
        return this.queries[this.current_id];
    }
    set iter_function(f_next) {
        this.f_next = f_next;
    }
    set query(queries) {
        this.queries = queries;
    }
    next() {
        if (this.queries.length <= 0) {
            alert("No query! Please load base file first of check your base file if empty!");
            return undefined;
        }
        this.history.push(this.current_id);
        this.current_id = this.f_next(this.current_id);
        if (this.current_id >= this.queries.length || this.current_id < 0) {
            this.current_id = 0;
        }
        return this.queries[this.current_id];
    }
    prev() {
        if (this.history.length === 0) {
            return this.queries[this.current_id];
        }
        this.current_id = this.history.pop();
        return this.queries[this.current_id];
    }
}
export var UI;
(function (UI) {
    function init(c) {
        set_file();
        $('#next_button').click(goto_next_query);
        $('#prev_button').click(goto_prev_query);
        $.mobile.changeGlobalTheme = function (theme) {
            var themes = " a b c d e";
            function setTheme(cssSelector, themeClass, theme) {
                $(cssSelector)
                    .removeClass(themes.split(" ").join(" " + themeClass + "-"))
                    .addClass(themeClass + "-" + theme)
                    .attr("data-theme", theme);
            }
            setTheme(".ui-mobile-viewport", "ui-overlay", theme);
            setTheme("[data-role='page']", "ui-body", theme);
            setTheme("[data-role='page']", "ui-page-theme", theme);
            setTheme("[data-role='header']", "ui-bar", theme);
            setTheme("[data-role='listview'] > li", "ui-bar", theme);
            setTheme(".ui-btn", "ui-btn-up", theme);
            setTheme(".ui-btn", "ui-btn-hover", theme);
            setTheme(".ui-btn", "ui-btn", theme);
        };
        $('#menu_switch_theme').click(() => {
            let theme = 'a';
            if (current_theme === 'a') {
                theme = 'b';
            }
            else {
                theme = 'a';
            }
            current_theme = theme;
            switch_theme(theme);
        });
    }
    UI.init = init;
    function show_message(msg) {
        document.getElementById('interaction').innerHTML = msg;
    }
    UI.show_message = show_message;
    function print_query_content(content) {
        document.getElementById('query_content').innerHTML = content;
    }
    UI.print_query_content = print_query_content;
    function switch_theme(theme) {
        $.mobile.changeGlobalTheme(theme);
        current_theme = theme;
    }
    UI.switch_theme = switch_theme;
    function get_reader_when_checked_file_API() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            let reader = new FileReader();
            return reader;
        }
        else {
            alert('The File APIs are not fully supported by your browser. Fallback required.');
            return undefined;
        }
    }
    function set_file() {
        document.getElementById('base_file').onchange = function () {
            let file = this.files[0];
            let reader = get_reader_when_checked_file_API();
            if (!reader) {
                return;
            }
            reader.onload = function () {
                let lines = this.result.split('\n');
                test.query = lines.filter((line) => line.trim() !== '').map((line) => parse_line_from_base(line));
                goto_next_query();
                console.log('Loaded ' + test.queries.length + ' queries.');
                UI.show_message('Loaded ' + test.queries.length + ' queries.');
            };
            reader.readAsText(file);
        };
    }
    let current_theme = 'b';
})(UI || (UI = {}));
let test = new Test([]);
function goto_next_query() {
    let next = test.next();
    if (!next) {
        return;
    }
    document.getElementById('interaction').innerHTML = "";
    show_query(next);
}
function goto_prev_query() {
    let prev = test.prev();
    if (!prev) {
        return;
    }
    document.getElementById('interaction').innerHTML = "";
    show_query(prev);
}
function parse_line_from_base(line) {
    let units = line.split('\t');
    return new Query(Number(units[0]), units[1], units[2], [units[3], units[4], units[5], units[6]], units[7]);
}
function check_answer() {
    let unit = test.current_query;
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
        UI.show_message('O');
    }
    else {
        UI.show_message('X');
    }
}
function show_answer() {
    UI.show_message(test.current_query.answer);
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
    $("#selection_board").html('<fieldset data-role="controlgroup"><legend><b>' + config.UI.select_msg + '</b></legend></fieldset>');
    for (var i = 0; i < selections.length; i++) {
        $("fieldset").append('<input type="checkbox" name="' + selections[i] + '" id="id' + i + '"><label for="id' + i + '">' + selections[i] + '</label>');
    }
    $("#selection_board").append('<div data-role="navbar"><ul>\
<li><a href="#" id="button_check_answer" class="ui-btn-active">' + config.UI.submit + '</a>\</li>\
<li><a href="#" id="button_show_answer">' + config.UI.answer + '</a>\
</li></ul></div>');
    $("#selection_board").trigger('create');
    $("#button_check_answer").click(check_answer);
    $("#button_show_answer").click(show_answer);
}
function show_query_single_selection(unit) {
    console.log(unit);
    UI.print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(unit.choice);
}
function show_query_multiple_selection(unit) {
    console.log(unit);
    UI.print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(unit.choice);
}
function show_query_fill(unit) {
    console.log(unit);
    UI.print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections([]);
}
function show_query_yes_no(unit) {
    console.log(unit);
    UI.print_query_content(unit.id + ". " + "<b>" + unit.category + '</b>\t' + unit.query);
    create_selections(['Y', 'N']);
}
main();
//# sourceMappingURL=core.js.map