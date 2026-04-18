import { HydratedDocument, Types } from "mongoose";
import { REFRESH_TOKEN_EXPIRATION_TIME } from "../../common/config/config";
import { LoggedOutDevices } from "../../common/enums";
import { ConflictException } from "../../common/exceptions";
import { IUser } from "../../common/interfaces";
import {
  redisService,
  RedisService,
  TokenService,
} from "../../common/services";
import { UserRepo } from "../../DB/repository/user.repo";

class UserService {
  private readonly userRepo: UserRepo;
  private readonly redis: RedisService;
  private readonly tokenService: TokenService;
  constructor() {
    this.userRepo = new UserRepo();
    this.tokenService = new TokenService();
    this.redis = redisService;
  }
  async profile(user: HydratedDocument<IUser>): Promise<any> {
    return user;
  }
  async logout(
    { flag }: { flag: LoggedOutDevices },
    user: HydratedDocument<IUser>,
    {
      jti,
      iat,
      sub,
    }: { jti: string; iat: number; sub: string | Types.ObjectId },
  ): Promise<number> {
    let statusCode = 200;
    // implementing logout from multiple devices or one device
    switch (flag) {
      case LoggedOutDevices.ALL:
        await this.userRepo.findByIdAndUpdate({
          _id: user._id,
          update: { changedCredentialsTime: new Date() },
        });
        await this.redis.redisDelKeys(
          await this.redis.redisKeys(this.redis.redisBaseRevokeTokenKey(sub)),
        );
        statusCode = 201;

        break;

      default:
        await this.tokenService.createRevokeToken({
          userId: sub,
          jti,
          ttl: iat + Number(REFRESH_TOKEN_EXPIRATION_TIME),
        });
        statusCode = 201;
        break;
    }

    return statusCode;
  }

  async rotateToken(
    user: HydratedDocument<IUser>,
    {
      sub,
      jti,
      iat,
    }: { jti: string; iat: number; sub: string | Types.ObjectId },
    issuer: string,
  ) {
    // checking if the token is about to expire (5mins before expiration at least 25min passed)

    if (Date.now() - iat < 25 * 60 * 1000) {
      throw new ConflictException("Current access token is still valid");
    }
    await this.tokenService.createRevokeToken({
      userId: sub,
      jti,
      ttl: iat + Number(REFRESH_TOKEN_EXPIRATION_TIME),
    });

    return await this.tokenService.createLoginTokens(user, issuer);
  }
}

export default new UserService();
