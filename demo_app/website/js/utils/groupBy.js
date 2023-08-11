export const groupBy = (key, items) => {
    return items.reduce((a, c) => {
        const keyValue = c[key]
        a[keyValue] = a[keyValue] ?? [];
        a[keyValue].push(c)
        return a
    }, {})
}
