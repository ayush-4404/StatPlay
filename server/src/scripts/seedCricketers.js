const mongoose = require('mongoose');
const Cricketer = require('../models/cricketer.model');
require('dotenv').config();

// Sample cricketers for testing
const sampleCricketers = [
    {
        name: "Virat Kohli",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+1+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=Virat+Kohli",
        visibleStats: new Map([
            ["Matches Played", "500+"],
            ["Format", "All Formats"],
            ["Role", "Batsman"],
            ["Batting Style", "Right-handed"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "2008"],
            ["Jersey Number", "18"],
            ["Best Score", "183"],
            ["Century Count", "70+"]
        ]),
        difficulty: "easy",
        isActive: true
    },
    {
        name: "MS Dhoni",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+2+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=MS+Dhoni",
        visibleStats: new Map([
            ["Matches Played", "500+"],
            ["Format", "All Formats"],
            ["Role", "Wicket-keeper Batsman"],
            ["Batting Style", "Right-handed"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "2004"],
            ["Jersey Number", "7"],
            ["World Cups Won", "3"],
            ["Captain", "Yes"]
        ]),
        difficulty: "easy",
        isActive: true
    },
    {
        name: "Rohit Sharma",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+3+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=Rohit+Sharma",
        visibleStats: new Map([
            ["Matches Played", "400+"],
            ["Format", "All Formats"],
            ["Role", "Opening Batsman"],
            ["Batting Style", "Right-handed"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "2007"],
            ["Jersey Number", "45"],
            ["ODI Double Centuries", "3"],
            ["IPL Teams", "Mumbai Indians"]
        ]),
        difficulty: "easy",
        isActive: true
    },
    {
        name: "Jasprit Bumrah",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+4+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=Jasprit+Bumrah",
        visibleStats: new Map([
            ["Matches Played", "200+"],
            ["Format", "All Formats"],
            ["Role", "Fast Bowler"],
            ["Bowling Style", "Right-arm Fast"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "2016"],
            ["Jersey Number", "93"],
            ["Bowling Action", "Unique"],
            ["IPL Teams", "Mumbai Indians"]
        ]),
        difficulty: "medium",
        isActive: true
    },
    {
        name: "Sachin Tendulkar",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+5+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=Sachin+Tendulkar",
        visibleStats: new Map([
            ["Matches Played", "600+"],
            ["Format", "All Formats"],
            ["Role", "Batsman"],
            ["Batting Style", "Right-handed"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "1989"],
            ["Jersey Number", "10"],
            ["Test Centuries", "51"],
            ["ODI Centuries", "49"],
            ["Nickname", "Master Blaster"]
        ]),
        difficulty: "easy",
        isActive: true
    },
    {
        name: "Hardik Pandya",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+6+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=Hardik+Pandya",
        visibleStats: new Map([
            ["Matches Played", "200+"],
            ["Format", "Limited Overs"],
            ["Role", "All-rounder"],
            ["Batting Style", "Right-handed"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "2016"],
            ["Jersey Number", "33"],
            ["Bowling Style", "Right-arm Medium"],
            ["IPL Teams", "Multiple"]
        ]),
        difficulty: "medium",
        isActive: true
    },
    {
        name: "KL Rahul",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+7+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=KL+Rahul",
        visibleStats: new Map([
            ["Matches Played", "300+"],
            ["Format", "All Formats"],
            ["Role", "Wicket-keeper Batsman"],
            ["Batting Style", "Right-handed"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "2014"],
            ["Jersey Number", "1"],
            ["Test Debut Score", "3"],
            ["IPL Teams", "Multiple"]
        ]),
        difficulty: "medium",
        isActive: true
    },
    {
        name: "Ravindra Jadeja",
        imageHidden: "https://via.placeholder.com/300x400?text=Cricketer+8+Hidden",
        imageRevealed: "https://via.placeholder.com/300x400?text=Ravindra+Jadeja",
        visibleStats: new Map([
            ["Matches Played", "300+"],
            ["Format", "All Formats"],
            ["Role", "All-rounder"],
            ["Batting Style", "Left-handed"]
        ]),
        hiddenStats: new Map([
            ["Country", "India"],
            ["Debut Year", "2009"],
            ["Jersey Number", "8"],
            ["Bowling Style", "Left-arm Spin"],
            ["Fielding", "Excellent"],
            ["Nickname", "Sir Jadeja"]
        ]),
        difficulty: "medium",
        isActive: true
    }
];

async function seedCricketers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing cricketers (optional)
        await Cricketer.deleteMany({});
        console.log('🗑️  Cleared existing cricketers');

        // Insert sample cricketers
        const result = await Cricketer.insertMany(sampleCricketers);
        console.log(`✅ Successfully added ${result.length} cricketers`);

        console.log('\n📋 Cricketers added:');
        result.forEach((cricketer, index) => {
            console.log(`${index + 1}. ${cricketer.name} (${cricketer.difficulty})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding cricketers:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCricketers();
