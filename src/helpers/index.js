export function byId(array) {
    return array.reduce(
        (byId, element) => (byId[element.id] = element) && byId,
        {}
    );
}

// Ruby's Array#chunk
export function chunk(array, func, keepNullOrUndefined = false) {
    if (!Array.isArray(array)) {
        throw new Error(`First argument should be an Array`);
    }

    if (typeof func !== "function") {
        throw new Error(`Second argument should be a Function`);
    }

    const chunks = array.reduce((chunks, element) => {
        const prev = chunks[chunks.length - 1];
        const [prevValue, prevElements] = prev || [];

        const newValue = func(element);

        if (newValue !== prevValue) {
            // This will become a new element
            chunks.push([newValue, [element]]);
        } else {
            // Add to previous
            prevElements.push(element);
        }

        return chunks;
    }, []);

    // Filter out any elements of a null or undefined key,
    // unless specified otherwise
    if (keepNullOrUndefined) return chunks;

    return chunks.filter(chunk => chunk[0] != null);
}

export function groupBy(array, func) {
    return array.reduce((grouped, element) => {
        const key = func(element);
        (grouped[key] || (grouped[key] = [])).push(element);
        return grouped;
    }, {});
}

// Ruby's Array#uniq
export function uniq(array) {
    return array.reduce((uniques, element) => {
        if (uniques.indexOf(element) === -1) {
            uniques.push(element);
        }

        return uniques;
    }, []);
}

// From: http://stackoverflow.com/a/6274381/2858155
// Modified to return new array
export function shuffle(a) {
    const newA = Array.from(a);

    var j, x, i;
    for (i = newA.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = newA[i - 1];
        newA[i - 1] = newA[j];
        newA[j] = x;
    }

    return newA;
}

function greaterThan(x, y) {
    if (x > y) return 1;
    if (x < y) return -1;
    return 0;
}

function lessThan(x, y) {
    return greaterThan(y, x);
}

function minOrMax(array, operator, compareBy = x => x, transform = x => x) {
    const [mmElement] = array.reduce(
        (mmData, element) => {
            const [, mmValue] = mmData;
            const value = compareBy(element);

            if (value == null) return mmData;

            if (mmValue == null || operator(value, mmValue) > 0) {
                return [element, value];
            }

            return mmData;
        },
        [null, null]
    ); // <= [ mmElement, mmValue ]

    return transform(mmElement);
}

function max(array, compareBy = x => x, transform = x => x) {
    return minOrMax(array, greaterThan, compareBy, transform);
}

function min(array, compareBy = x => x, transform = x => x) {
    return minOrMax(array, lessThan, compareBy, transform);
}

// Returns the maximum element, comparing the property obtained
// from calling `maxBy` on each element.
export function maxElement(array, maxBy = x => x) {
    return max(array, maxBy);
}

// Returns the maximum value, comparing the property obtained
// from calling `maxBy` on each element returning the maximum
// resulting value
export function maxValue(array, maxBy) {
    return max(array, maxBy, maxBy);
}

// Returns the minimum element, comparing the property obtained
// from calling `minBy` on each element.
export function minElement(array, minBy = x => x) {
    return min(array, minBy);
}

// Returns the minimum value, comparing the property obtained
// from calling `minBy` on each element returning the minimum
// resulting value
export function minValue(array, minBy = x => x) {
    return min(array, minBy, minBy);
}

export function transpose(array) {
    if (
        !Array.isArray(array) ||
        array.length === 0 ||
        array.some(subArray => !Array.isArray(subArray))
    ) {
        throw new Error(
            `Argument should be an Array of exclusively other Arrays`
        );
    }

    const maxColSize = maxValue(array, subArray => subArray.length);

    const transposed = [];

    for (let col = 0; col < maxColSize; col++) {
        for (let row = 0; row < array.length; row++) {
            (transposed[col] || (transposed[col] = []))[row] = array[row][col];
        }
    }

    return transposed;
}
