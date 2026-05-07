"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactEnums = exports.AvailabilityEnum = void 0;
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum[AvailabilityEnum["PUBLIC"] = 0] = "PUBLIC";
    AvailabilityEnum[AvailabilityEnum["FRIENDS"] = 1] = "FRIENDS";
    AvailabilityEnum[AvailabilityEnum["ONLY_ME"] = 2] = "ONLY_ME";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
var ReactEnums;
(function (ReactEnums) {
    ReactEnums[ReactEnums["REMOVE_LIKE"] = 0] = "REMOVE_LIKE";
    ReactEnums[ReactEnums["LIKE"] = 1] = "LIKE";
    ReactEnums[ReactEnums["LAUGH"] = 2] = "LAUGH";
    ReactEnums[ReactEnums["LOVE"] = 3] = "LOVE";
    ReactEnums[ReactEnums["CARE"] = 4] = "CARE";
    ReactEnums[ReactEnums["SAD"] = 5] = "SAD";
    ReactEnums[ReactEnums["ANGRY"] = 6] = "ANGRY";
})(ReactEnums || (exports.ReactEnums = ReactEnums = {}));
