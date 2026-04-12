"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const axios_1 = __importDefault(require("axios"));
const razorpay_js_1 = require("../config/razorpay.js");
const verifyRazorpay_js_1 = require("../config/verifyRazorpay.js");
const payment_producer_js_1 = require("../config/payment.producer.js");
const createRazorpayOrder = async (req, res) => {
    const { orderId } = req.body;
    const { data } = await axios_1.default.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
    });
    const razorpayOrder = await razorpay_js_1.razorpay.orders.create({
        amount: data.amount * 100,
        currency: "INR",
        receipt: orderId,
    });
    res.json({
        razorpayOrderId: razorpayOrder.id,
        key: process.env.RAZORPAY_KEY_ID,
    });
};
exports.createRazorpayOrder = createRazorpayOrder;
const verifyRazorpayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, } = req.body;
    const isValid = (0, verifyRazorpay_js_1.verifyRazorpaySignature)(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
        return res.status(400).json({
            message: "Payment verification failed",
        });
    }
    await (0, payment_producer_js_1.publishPaymentSuccess)({
        orderId,
        paymentId: razorpay_payment_id,
        provider: "razorpay",
    });
    res.json({
        message: "Payment verified successfully",
    });
};
exports.verifyRazorpayPayment = verifyRazorpayPayment;
