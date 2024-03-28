import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Helpers } from '@global/helpers/helpers';
import { AuthModel } from '@auth/models/auth.schema';
import { config } from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('authService');

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    //log.info('awdasdawdawd', data);
    await AuthModel.create(data);
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration:number): Promise<void> {
    await AuthModel.updateOne({_id: authId}, {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    });
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IAuthDocument;
    return user;
  }

  public async getUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: {$gt:Date.now()}
  }).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
