/// <reference types="yup" />

import { BaseSchema } from "yup";

declare module "yup" {
    interface StringSchema<
        TType extends Maybe<string> = string | undefined,
        TContext extends AnyObject = AnyObject,
        TOut extends TType = TType
    > extends BaseSchema<TType, TContext, TOut> {
        tld(message?: string): StringSchema<TType, TContext>;
    }
}
