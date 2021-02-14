export function dynamically_load_script(url: string) {
    var script = document.createElement("script");  // create a script DOM node
    script.src = url;  // set its src to the provided URL

    document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

export function get_random_Int(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}


export type Maybe<T> = T | undefined;

export interface Iterable<T> {
    next(): Maybe<T>;
}