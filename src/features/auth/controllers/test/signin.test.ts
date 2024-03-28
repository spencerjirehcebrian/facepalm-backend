/* eslint-disable @typescript-eslint/no-explicit-any */
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Request, Response } from 'express';
import { CustomError } from '@global/helpers/error-handler';
import { SignIn } from '@auth/controllers/signin';
import { Helpers } from '@global/helpers/helpers';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { mergedAuthAndUserData } from '@root/mocks/user.mock';

const USERNAME = 'danny';
const PASSWORD = '123123';
const MISSING_USERNAME = 'Danny';
const MISSING_PASSWORD = '123123123123';
const WRONG_USERNAME = 'ma';
const WRONG_PASSWORD = 'ma';
const LONG_PASSWORD = 'mathematics1mathematics1mathematics1';
const LONG_USERNAME = 'mathematicsmathematics1mathematics1';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must be more than 4 characters');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must be less than 16 characters');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password must be more than 4 characters');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password must be less than 16 characters');
    });
  });

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: MISSING_USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthByUsername').mockResolvedValueOnce(null as any);

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthByUsername).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username not found/does not exist');
    });
  });

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: MISSING_USERNAME, password: MISSING_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthByUsername').mockResolvedValueOnce(null as any);

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthByUsername).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username not found/does not exist');
    });
  });

  // IDK how to make this work
  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(true);
    console.log(authMock);
    jest.spyOn(authService, 'getAuthByUsername').mockResolvedValue(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);

    await SignIn.prototype.read(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User Logged In Succcessfully',
      user: mergedAuthAndUserData,
      token: req.session?.jwt
    });
  });
});
