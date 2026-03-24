"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishPaymentSuccess = void 0;
const rabbitmq_js_1 = require("./rabbitmq.js");
const publishPaymentSuccess = async (payload) => {
    const channel = (0, rabbitmq_js_1.getChannel)();
    channel.sendToQueue(process.env.PAYMENT_QUEUE, Buffer.from(JSON.stringify({
        type: "PAYMENT_SUCCESS",
        data: payload,
    })), { persistent: true });
};
exports.publishPaymentSuccess = publishPaymentSuccess;
