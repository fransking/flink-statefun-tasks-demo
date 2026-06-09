export const groupBy = <T extends Record<string, unknown>>(key: string, items: T[]): Record<string, T[]> => {
    return items.reduce<Record<string, T[]>>((a, c) => {
        const keyValue = c[key] as string
        a[keyValue] = a[keyValue] ?? [];
        a[keyValue].push(c)
        return a
    }, {})
}
