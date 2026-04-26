import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { authentication, validation } from "../../middleware";
import {
  cloudFileUpload,
  fileFieldValidation,
} from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from "./post.validation";
import { postService } from "./post.service";
const router = Router();
router.post(
  "/",
  authentication(),
  cloudFileUpload({ validation: fileFieldValidation.image }).array(
    "attachments",
    2,
  ),
  validation(validators.createPost),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await postService.createPost(
      {
        ...req.body,
        files: req.files,
      },
      req.user,
    );
    successResponse({ res, message: "Post created successfully", data });
  },
);
export default router;
