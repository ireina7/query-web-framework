export function dynamically_load_script(url: string) {
    var script = document.createElement("script");  // create a script DOM node
    script.src = url;  // set its src to the provided URL

    document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}


export const Nothing = Symbol('nothing');
export type Nothing = typeof Nothing;
export type Maybe<T> = T | Nothing;
