/**
 *  Issue #1 'unused code'
 */

(function ($) {
    class showDivWithText {
        constructor(param) {
            this.text = param;
            this.init();
        }

        init() {
            $("<div />")
                .text(this.text)
                .appendTo("body");
        }
    }
})(jQuery);

/**
 *  ES6 features
 */
let a = {
    bs: "fghfghfg",
    cs: "khfgjhkjfghkljfgjhfghfggfhgf",
    ds: "gfdgdjghdfjghdfjghdfjlghfd",
    es: "aaaaaaaaaaaaaaaaaaaaaaaaa"
};
const b = 43;

const c = (a, b) => {
    return a * b;
};

console.log(c(a, b));

async function foo(url) {
    return await fetch(url);
}
