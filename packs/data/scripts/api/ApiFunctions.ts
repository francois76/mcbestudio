export function camelize(key: string) {
    key = key.replace(/[\-_\s]+(.)?/g, function (match, ch) {
        return ch ? ch.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return key.substr(0, 1).toLowerCase() + key.substr(1);
}