import { Request, Response } from 'express';
import Controller from '@/utils/decorators/controller.decorator';
import { Get, Post, Delete } from '@/utils/decorators/handlers.decorator';
import { isAuth } from "@/utils/decorators/auth.decorator";
import { UserInterface } from '@/types/UserInterface';
import prisma from "@/libs/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

@Controller('/user')
export default class AuthController {

    @Get('/users')
    @isAuth()
    public async show(req: Request, res: Response): Promise<void | Response> {

        const users = await prisma.user.findMany({ include: { roles: true } });

        return res 
            .status(202)
            .json({ users })
    }

    @Get('/getuser')
    @isAuth()
    public index(req: Request, res: Response): void | Response {
        return res
            .status(200)
            .json({ user: "Your User Information" })
    }

    @Post('/register')
    public async register(req: Request, res: Response): Promise<void | Response> {

        const { email, password }: UserInterface = req.body;
        const newPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await prisma.user.create({ data: {
                    email,
                    password: newPassword
                },
                include: { roles: true }
            })

            let token = jwt.sign(newUser, 'asdasdasd', { expiresIn: '7d' });

            return res
                .status(201)
                .cookie('X-TOKEN', token, { 
                    maxAge: 7 * 24 * 60 * 60 * 1000, 
                    httpOnly: true 
                }).
                json({ user: newUser, token });

        } catch (error) {
            return res.status(422).json({ error })
        }
    }

    @Post('/login')
    public async login(req: Request, res: Response): Promise<void | Response> {
        
        const { email, password }: UserInterface = req.body;

        const findUser = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        })

        if (!findUser) return res
            .status(404)
            .json({ error: 'User not Found' })

        let test = await bcrypt.compare(password!, findUser!.password);

        if (!test) return res
            .status(400)
            .json({ error: 'Invalid password' })

        let token = jwt.sign(findUser!, 'asdasdasd', { expiresIn: '7d' });

        return res
            .status(201)
            .cookie('X-TOKEN', token, { 
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                httpOnly: true 
            })
            .json({ user: findUser!, token });
    }

}