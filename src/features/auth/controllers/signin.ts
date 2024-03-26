import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { joiValidation } from '@global/decorators/joi-validation.controllers';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/auth.service';
import { signinSchema } from '@auth/schemes/signin';
import { BadRequestError } from '@global/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';

export class SignIn {
  @joiValidation(signinSchema) //validate data that is sent
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    //check if user exists
    const existingUser: IAuthDocument = await authService.getAuthByUsername(username);
    //await authService.getAuthByEmail(email);

    if (!existingUser) {
      throw new BadRequestError('Username not found/does not exist');
    }
    const passwordMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid/Incorrect Password');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = JWT.sign(
      {
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    const userDocument: IUserDocument = {
      ...user,
      authID: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as unknown as IUserDocument;

    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.OK).json({ message: 'User Logged In Succcessfully', user: userDocument, token: userJwt });
  }
}
