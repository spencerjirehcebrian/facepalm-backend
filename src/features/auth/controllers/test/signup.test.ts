/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserCache } from '@service/redis/user.cache';
import { authService } from '@service/db/auth.service';
import { CustomError } from '@global/helpers/error-handler';
import { SignUp } from '@auth/controllers/signup';
import { Request, Response } from "express";
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { authMockRequest, authMockResponse, authMock } from "@mock/auth.mock";

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');


describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(()=> {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', ()=>{
    const req: Request = authMockRequest({}, {
      username: '',
      email: 'manny@test.com',
      password: '123123',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG*sIFdvcmxkIQ=='
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // console.log(error);

      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required feild');

    });
  });

  it('should throw an error if username is less than minimum length', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'ma',
      email: 'manny@test.com',
      password: '123123',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG*sIFdvcmxkIQ=='
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // console.log(error);

      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must be more than 4 characters');

    });
  });

  it('should throw an error if username is more than maximum length', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'mathematicsmathematicsmathematics',
      email: 'manny@test.com',
      password: '123123',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG*sIFdvcmxkIQ=='
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // console.log(error);

      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must be less than 16 characters');

    });
  });

  it('should throw an error if email is not valid', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'manny',
      email: 'not valid',
      password: '123123',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG*sIFdvcmxkIQ=='
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // console.log(error);

      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid email format');

    });
  });


  it('should throw an error if password is not available', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'manny',
      email: 'manny@test.com',
      password: '',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG*sIFdvcmxkIQ=='
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // console.log(error);

      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required feild');

    });
  });

  it('should throw an error if user already exists', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'danny',
      email: 'manny@test.com',
      password: '123123',
      avatarColor: 'black',
      avatarImage: 'data:text/plain;base64,SGVsbG*sIFdvcmxkIQ=='
    }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      // console.log(error);

      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('User/email already exists');


    });
  });

  it('should set session data for valid credentials and send corrrect json response', async ()=>{
    const req: Request = authMockRequest({}, {
      username: 'manny',
      email: 'manny@test.com',
      password: 'brown',
      avatarColor: 'black',
      avatarImage: 'data:text/plain;base64,SGVsbG*sIFdvcmxkIQ=='
    }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation(():any => Promise.resolve({version: '1234', public_id:'1234'}));


    await SignUp.prototype.create(req, res);
    // console.log(userSpy.mock);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User Created Successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
