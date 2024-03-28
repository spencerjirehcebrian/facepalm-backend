import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.controllers';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@service/db/auth.service';
import { Helpers } from '@global/helpers/helpers';
import { uploads } from '@global/helpers/cloudinary-upload';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import { omit } from 'lodash';
import { authQueue } from '@service/queues/auth.queue';
import { userQueue } from '@service/queues/user.queue';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';

const userCache: UserCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema) //validate data that is sent
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;

    //check if user exists
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('User/email already exists');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    //upload to cloudinary
    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occured. Try again.');
    }

    // Add to redis chache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);

    userDataForCache.profilePicture = `https://res.cloudinary.com/dsstdp7hw/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    //add to database
    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']); //remove listed stuff
    authQueue.addAuthUserJob('addAuthUserToDB', { value: userDataForCache });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });

    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: userJwt };

    res.status(HTTP_STATUS.CREATED).json({ message: 'User Created Successfully', user: userDataForCache, token: userJwt });
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as unknown as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, uId, username, email, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      blocked: [],
      blockedBy: [],
      postsCount: 0,
      profilePicture: '',
      followersCount: 0,
      followingCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageId: '',
      bgImageVersion: '',
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
