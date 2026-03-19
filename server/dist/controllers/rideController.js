"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRide = exports.updateRide = exports.getRide = exports.createRide = exports.getRides = void 0;
const Ride_1 = __importDefault(require("../models/Ride"));
const AdminLog_1 = __importDefault(require("../models/AdminLog"));
const getRides = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status)
            filter.status = String(req.query.status);
        const rides = await Ride_1.default.find(filter).populate('userId', 'name phone').sort({ createdAt: -1 });
        res.json(rides);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getRides = getRides;
const createRide = async (req, res) => {
    try {
        const ride = await Ride_1.default.create({ ...req.body, userId: req.userId });
        await ride.populate('userId', 'name phone');
        res.status(201).json(ride);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.createRide = createRide;
const getRide = async (req, res) => {
    try {
        const ride = await Ride_1.default.findById(req.params.id).populate('userId', 'name phone');
        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }
        res.json(ride);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.getRide = getRide;
const updateRide = async (req, res) => {
    try {
        const ride = await Ride_1.default.findById(req.params.id);
        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }
        if (String(ride.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const updated = await Ride_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('userId', 'name phone');
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.updateRide = updateRide;
const deleteRide = async (req, res) => {
    try {
        const ride = await Ride_1.default.findById(req.params.id);
        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }
        if (String(ride.userId) !== req.userId && req.userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        if (req.userRole === 'admin') {
            await AdminLog_1.default.create({ adminId: req.userId, action: 'delete_post', targetId: String(ride._id), targetType: 'ride', details: `Deleted ride: ${ride.from} → ${ride.to}` });
        }
        await ride.deleteOne();
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};
exports.deleteRide = deleteRide;
