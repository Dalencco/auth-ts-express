import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuth = (): MethodDecorator => (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {

    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
        let res = args[0].res as Response;
        let req = args[0] as Request;

        const token: string = req.cookies!['X-TOKEN'];

        if (!token) return res
            .status(401)
            .json({ msg: "You not are authenticated" })

        jwt.verify(token, 'asdasdasd', err => {
            if (err) return res
                .status(401)
                .json({ msg: "You not are authenticated" })
        })

        return original.apply(this, args);
    }

}