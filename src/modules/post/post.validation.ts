import { generalValidationFields } from "./../../common/validation/general.validation";
import z from "zod";
import { AvailabilityEnum } from "../../common/enums";
import { Types } from "mongoose";
import { fileFieldValidation } from "../../common/utils/multer";

export const createPost = {
  body: z
    .strictObject({
      content: z.string().optional(),
      files: z
        .array(generalValidationFields.file(fileFieldValidation.image))
        .optional(),
      tags: z.array(z.string()).optional(),
      availability: z.coerce
        .number()
        .default(AvailabilityEnum.PUBLIC)
        .optional(),
    })
    .superRefine((args, ctx) => {
      if (!args.files?.length && !args.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "A post needs to contain at least content or an attachment",
        });
      }
      if (args.tags?.length) {
        //Creating a set for unique keys
        const uniqueTags = [...new Set(args.tags)];
        if (uniqueTags.length !== args.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "A post can't have duplicated tags",
          });
        }
        for (const tag of args.tags) {
          if (!Types.ObjectId.isValid(tag)) {
            ctx.addIssue({
              code: "custom",
              path: ["tags"],
              message: "Invalid tagged user ID",
            });
          }
        }
      }
    }),
};
//
