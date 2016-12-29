
function tuple<U, V>(a : U, b : V) : [U, V] {
    return [a, b];
}

function triple<U, V, W>(a : U, b : V, c : W) : [U, V, W] {
    return [a, b, c];
}

export function zip<U, V>(as : Array<U>, bs : Array<V>) : Array<[U, V]> {

    let xs : Array<[U, V]> = [];

    for(let i : number = 0; i < as.length && i < bs.length; ++i) {
        xs.push(tuple(as[i], bs[i]));
    }

    return xs;
}

export function zip3<U, V, W>(as : Array<U>, bs : Array<V>, cs : Array<W>) : Array<[U, V, W]> {

    let xs : Array<[U, V, W]> = [];

    for(let i : number = 0; i < as.length && i < bs.length && i < cs.length; ++i) {
        xs.push(triple(as[i], bs[i], cs[i]));
    }

    return xs;
}
