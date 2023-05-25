import { ButtonHTMLAttributes, forwardRef, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

import styles from './Inputs.module.css';
import clsx from 'clsx';


export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    outline?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button({ className, outline, ...rest }, ref) {
        return (
            <button
                ref={ref}
                {...rest}
                className={clsx(
                    styles.Input,
                    styles.Button,
                    outline && styles.outline,
                    className,
                )}
            />
        );
    },
);


export const FileInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function FileInput(props, ref) {
        return (
            <input
                ref={ref}
                type='file'
                {...props}
                className={clsx(styles.Input, styles.FileInput, props.className)}
            />
        );
    },
);


export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className={clsx(styles.Input, styles.Select, props.className)}
        />
    );
}


export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={clsx(styles.Input, props.className)}
        />
    );
}


export function RangeInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            type='range'
            {...props}
            className={clsx(styles.Range, props.className)}
        />
    );
}
