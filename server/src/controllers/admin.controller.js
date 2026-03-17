const Cricketer = require('../models/cricketer.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const uploadOnCloudinary = require('../utils/FileUpload');

const parseStatsPayload = (stats) => {
    if (!stats) return {};
    if (typeof stats === 'string') {
        try {
            return JSON.parse(stats);
        } catch (error) {
            throw new ApiError(400, 'Invalid stats format');
        }
    }
    return stats;
};

// Add a new cricketer
module.exports.addCricketer = asyncHandler(async (req, res) => {
    const { name, difficulty, isActive } = req.body;
    const visibleStats = parseStatsPayload(req.body.visibleStats);
    const hiddenStats = parseStatsPayload(req.body.hiddenStats);

    // Validate required fields
    if (!name) {
        throw new ApiError(400, "Cricketer name is required");
    }

    if (!visibleStats || Object.keys(visibleStats).length === 0) {
        throw new ApiError(400, "Visible stats are required");
    }

    if (!hiddenStats || Object.keys(hiddenStats).length === 0) {
        throw new ApiError(400, "Hidden stats are required");
    }

    // Handle image upload for hidden image
    let imageHiddenUrl = null;
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload hidden image");
        }
        imageHiddenUrl = uploadResult.secure_url;
    }

    // Get role from visible stats to determine default shown image
    const role = visibleStats.Role || visibleStats.role;
    let imageRevealed = "/images/batsman.jpg"; // default

    if (role) {
        const roleLower = role.toLowerCase();
        if (roleLower.includes("batsman") || roleLower.includes("batter")) {
            imageRevealed = "/images/batsman.jpg";
        } else if (roleLower.includes("bowler")) {
            imageRevealed = "/images/bowler.jpg";
        } else if (roleLower.includes("wicketkeeper") || roleLower.includes("keeper")) {
            imageRevealed = "/images/wicketkeeper.jpg";
        } else if (roleLower.includes("all-rounder") || roleLower.includes("allrounder")) {
            imageRevealed = "/images/allrounder.jpg";
        }
    }

    // Use uploaded image or default based on role
    const imageHidden = imageHiddenUrl || imageRevealed;

    // Convert objects to Maps for MongoDB
    const visibleStatsMap = new Map(Object.entries(visibleStats));
    const hiddenStatsMap = new Map(Object.entries(hiddenStats));

    // Create the cricketer
    const cricketer = await Cricketer.create({
        name,
        imageHidden,
        imageRevealed,
        visibleStats: visibleStatsMap,
        hiddenStats: hiddenStatsMap,
        difficulty: difficulty || 'medium',
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(
        new ApiResponse(201, cricketer, "Cricketer added successfully")
    );
});

// Get all cricketers (for admin view)
module.exports.getAllCricketers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, difficulty, isActive } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const cricketers = await Cricketer.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await Cricketer.countDocuments(filter);

    // Convert Maps to objects for JSON response
    const cricketersWithObjects = cricketers.map(cricketer => {
        const cricketerObj = cricketer.toObject();
        if (cricketerObj.visibleStats instanceof Map) {
            cricketerObj.visibleStats = Object.fromEntries(cricketerObj.visibleStats);
        }
        if (cricketerObj.hiddenStats instanceof Map) {
            cricketerObj.hiddenStats = Object.fromEntries(cricketerObj.hiddenStats);
        }
        return cricketerObj;
    });

    res.status(200).json(
        new ApiResponse(200, {
            cricketers: cricketersWithObjects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Cricketers fetched successfully")
    );
});

// Update a cricketer
module.exports.updateCricketer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, difficulty, isActive } = req.body;
    const visibleStats = req.body.visibleStats ? parseStatsPayload(req.body.visibleStats) : null;
    const hiddenStats = req.body.hiddenStats ? parseStatsPayload(req.body.hiddenStats) : null;

    const cricketer = await Cricketer.findById(id);
    if (!cricketer) {
        throw new ApiError(404, "Cricketer not found");
    }

    // Update fields if provided
    if (name) cricketer.name = name;
    if (difficulty) cricketer.difficulty = difficulty;
    if (isActive !== undefined) cricketer.isActive = isActive;

    // Handle image upload for hidden image
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload hidden image");
        }
        cricketer.imageHidden = uploadResult.secure_url;
    }

    // Update visible stats
    if (visibleStats) {
        const visibleStatsMap = new Map(Object.entries(visibleStats));
        cricketer.visibleStats = visibleStatsMap;

        // Update revealed image based on role if role changed
        const role = visibleStats.Role || visibleStats.role;
        if (role) {
            const roleLower = role.toLowerCase();
            if (roleLower.includes("batsman") || roleLower.includes("batter")) {
                cricketer.imageRevealed = "/images/batsman.jpg";
            } else if (roleLower.includes("bowler")) {
                cricketer.imageRevealed = "/images/bowler.jpg";
            } else if (roleLower.includes("wicketkeeper") || roleLower.includes("keeper")) {
                cricketer.imageRevealed = "/images/wicketkeeper.jpg";
            } else if (roleLower.includes("all-rounder") || roleLower.includes("allrounder")) {
                cricketer.imageRevealed = "/images/allrounder.jpg";
            }
        }
    }

    // Update hidden stats
    if (hiddenStats) {
        const hiddenStatsMap = new Map(Object.entries(hiddenStats));
        cricketer.hiddenStats = hiddenStatsMap;
    }

    await cricketer.save();

    // Convert Maps to objects for response
    const cricketerObj = cricketer.toObject();
    if (cricketerObj.visibleStats instanceof Map) {
        cricketerObj.visibleStats = Object.fromEntries(cricketerObj.visibleStats);
    }
    if (cricketerObj.hiddenStats instanceof Map) {
        cricketerObj.hiddenStats = Object.fromEntries(cricketerObj.hiddenStats);
    }

    res.status(200).json(
        new ApiResponse(200, cricketerObj, "Cricketer updated successfully")
    );
});

// Delete a cricketer
module.exports.deleteCricketer = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cricketer = await Cricketer.findByIdAndDelete(id);
    if (!cricketer) {
        throw new ApiError(404, "Cricketer not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Cricketer deleted successfully")
    );
});

// Toggle cricketer active status
module.exports.toggleCricketerStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cricketer = await Cricketer.findById(id);
    if (!cricketer) {
        throw new ApiError(404, "Cricketer not found");
    }

    cricketer.isActive = !cricketer.isActive;
    await cricketer.save();

    res.status(200).json(
        new ApiResponse(200, { isActive: cricketer.isActive }, "Cricketer status updated")
    );
});
