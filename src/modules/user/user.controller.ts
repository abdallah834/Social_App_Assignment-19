import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { successResponse } from "../../common/response";
import { authentication, authorization } from "../../middleware";
import userService from "./user.service";
import { endpoint } from "./user.authorization";
import { Types } from "mongoose";
import { TokenType } from "../../common/enums";

const router = Router();
router.get(
  "/profile",
  authentication(),
  authorization(endpoint.profile),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.profile(req.user);
    return successResponse({ res, data });
  },
);
router.post(
  "/logout",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.logout(
      req.body,
      req.user,
      req.decoded as { jti: string; iat: number; sub: string | Types.ObjectId },
    );
    return successResponse({
      res,
      data,
      message:
        req.body.flag === 0
          ? "Logged out from all devices successfully"
          : "Logged out from one device successfully",
    });
  },
);
router.post(
  "/rotateToken",
  authentication(TokenType.REFRESH),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.rotateToken(
      req.user,
      req.decoded as { jti: string; iat: number; sub: string | Types.ObjectId },
      `${req.protocol}://${req.host}`,
    );
    return successResponse({ res, data });
  },
);
export default router;
