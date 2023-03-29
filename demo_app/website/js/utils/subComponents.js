import { Children } from 'react';

export default function subComponents (children, items) {
    return items.map((type) => {
        return Children.map(children, (child) => {
            return child.type === type ? child : null
        })
    });
}