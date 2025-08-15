declare module 'mjml' {
    export interface MjmlOptions {
        [key: string]: any;
    }

    export interface MjmlResult {
        html: string;
        errors?: any[];
    }

    export default function mjml2html(input: string, options?: MjmlOptions): MjmlResult;
}