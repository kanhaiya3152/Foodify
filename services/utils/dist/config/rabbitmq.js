"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannel = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib")); // this helps us to connect with rabbitmq
let channel;
const reconnectDelay = 5000; // 5 seconds
const connectRabbitMQ = async () => {
    try {
        const connection = await amqplib_1.default.connect(process.env.RABBITMQ_URL);
        // Handle connection-level errors (e.g. ECONNRESET) without crashing
        connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err.message);
        });
        // Auto-reconnect when connection closes unexpectedly
        connection.on("close", () => {
            console.warn("RabbitMQ connection closed. Reconnecting in 5s...");
            setTimeout(exports.connectRabbitMQ, reconnectDelay);
        });
        channel = await connection.createChannel();
        // Handle channel-level errors gracefully
        channel.on("error", (err) => {
            console.error("RabbitMQ channel error:", err.message);
        });
        await channel.assertQueue(process.env.PAYMENT_QUEUE, {
            durable: true,
        });
        console.log("🐇 connected to RabbitMQ!");
    }
    catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message, `Retrying in ${reconnectDelay / 1000}s...`);
        setTimeout(exports.connectRabbitMQ, reconnectDelay);
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const getChannel = () => channel;
exports.getChannel = getChannel;
