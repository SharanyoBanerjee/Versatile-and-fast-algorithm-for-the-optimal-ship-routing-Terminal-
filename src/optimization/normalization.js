export function normalize(value, minimum, maximum) {
    if (maximum === minimum) {
        return 0;
    }

    return (value - minimum) / (maximum - minimum);
}