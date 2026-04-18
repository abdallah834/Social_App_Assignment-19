import cors from "cors";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import { mongoDBConnection } from "./DB/db.connections";
import { userModel } from "./DB/models";
import { PORT } from "./common/config/config";
import { GenderEnum } from "./common/enums/user.enums";
import { redisService } from "./common/services/redis";
import { globalErrorHandler } from "./middleware";
import { authRouter } from "./modules";
import { userRouter } from "./modules/user";
import { ProviderEnums } from "./common/enums";
import { UserRepo } from "./DB/repository/user.repo";
import { Types } from "mongoose";

export const bootstrap = async () => {
  const app: Express = express();
  //////////// DB connections
  await mongoDBConnection();
  await redisService.connect();
  // await new userModel({
  //   username: "test username",
  //   password: "A12091259ajASF%2",
  //   // phone: "01245152124",
  //   provider: ProviderEnums.GOOGLE,
  //   email: `${Date.now()}@gmail.com`,
  //   paranoid: true,
  //   extra: {
  //     _name: "lol lol",
  //   },
  // }).save();
  const userRepository = new UserRepo();
  const user = await userRepository.deleteOne({
    filter: {
      _id: Types.ObjectId.createFromHexString("69e3ee560e844d1bc1efb5dd"),
      force: true,
    },
  });
  console.log(user);

  // await user.updateOne({ gender: GenderEnum.FEMALE });
  //////////// global middlewares
  app.use(cors(), express.json());
  //////////// APIs
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  ////////////// Invalid Routing
  app.use("/*dummy", (req, res, next) => {
    return res.status(404).json({ Error: "Invalid route" });
  });
  app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({ Success: "Hello World" });
  });
  ////////////// global error handling
  app.use(globalErrorHandler);
  ////////////// checking port connection

  app.listen(PORT, (err) => {
    try {
      console.log("app is running on port 3100");
    } catch (error) {
      console.error(err);
    }
  });
};
