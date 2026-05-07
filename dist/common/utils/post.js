"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsAvailability = void 0;
const enums_1 = require("../enums");
const getPostsAvailability = (user) => {
    return [
        { availability: enums_1.AvailabilityEnum.PUBLIC },
        { availability: enums_1.AvailabilityEnum.ONLY_ME, createdBy: user._id },
        {
            availability: enums_1.AvailabilityEnum.FRIENDS,
            createdBy: { $in: [user._id, ...(user.friends || [])] },
        },
        { tags: { $in: [user._id] } },
    ];
};
exports.getPostsAvailability = getPostsAvailability;
