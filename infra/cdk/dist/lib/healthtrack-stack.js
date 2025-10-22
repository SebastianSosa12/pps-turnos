"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthTrackStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
class HealthTrackStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 👉 acá adentro definís los recursos de tu infraestructura
    }
}
exports.HealthTrackStack = HealthTrackStack;
