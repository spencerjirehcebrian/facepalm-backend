import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { joiValidation } from '@global/decorators/joi-validation.controllers';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/auth.service';
import { signinSchema } from '@auth/schemes/signin';
import { BadRequestError } from '@global/helpers/error-handler';
import { IUserDocument, IResetPasswordParams } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
import { mailTransport } from '@service/emails/mail.transport';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';

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
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as unknown as IUserDocument;

    //await mailTransport.sendEmail('sincere.runte@ethereal.email', 'Meow', 'Meowmewo');


    //const resetLink = `${config.CLIENT_URL}/reset-password?token=123123123123`;
    // const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
    //emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: 'sincere.runte@ethereal.email', subject: 'Reset your password'});

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('MM/DD/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('resetPasswordEmail', {template, receiverEmail: 'sincere.runte@ethereal.email', subject: 'Password reset confirmation'});

    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.OK).json({ message: 'User Logged In Succcessfully', user: userDocument, token: userJwt });
  }
}
