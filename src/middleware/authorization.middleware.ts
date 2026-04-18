import type { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../common/exceptions";
import { RoleEnum } from "../common/enums";
export const authorization = (accessRoles: RoleEnum[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!accessRoles.includes(req.user?.role)) {
      throw new UnauthorizedException("Access denied");
    }
    next();
  };
};
