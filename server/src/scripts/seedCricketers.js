const mongoose = require('mongoose');
const Cricketer = require('../models/cricketer.model');
require('dotenv').config();

const cricketers = [

/* ================= 🇮🇳 INDIA ================= */

{
  name: "Virat Kohli",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "37"],
    ["Birthplace", "Delhi, India"],
    ["Role", "Batsman"],
    ["Matches Played", "550+"],
    ["IPL Team", "Royal Challengers Bangalore"],
    ["Runs", "26000+"],
    ["Wickets", "9"]
  ]),
  hiddenStats: new Map([
    ["Country", "India"]
  ]),
  difficulty: "easy",
  isActive: true
},
{
  name: "MS Dhoni",
  imageHidden: "/images/wicketkeeper.jpg",
  imageRevealed: "/images/wicketkeeper.jpg",
  visibleStats: new Map([
    ["Age", "44"],
    ["Birthplace", "Ranchi, India"],
    ["Role", "Wicketkeeper"],
    ["Matches Played", "538"],
    ["IPL Team", "Chennai Super Kings"],
    ["Runs", "17000+"],
    ["Wickets", "1"]
  ]),
  hiddenStats: new Map([
    ["Country", "India"]
  ]),
  difficulty: "easy",
  isActive: true
},
{
  name: "Jasprit Bumrah",
  imageHidden: "/images/bowler.jpg",
  imageRevealed: "/images/bowler.jpg",
  visibleStats: new Map([
    ["Age", "32"],
    ["Birthplace", "Ahmedabad, India"],
    ["Role", "Bowler"],
    ["Matches Played", "210+"],
    ["IPL Team", "Mumbai Indians"],
    ["Runs", "200+"],
    ["Wickets", "390+"]
  ]),
  hiddenStats: new Map([
    ["Country", "India"]
  ]),
  difficulty: "medium",
  isActive: true
},

/* ================= 🇦🇺 AUSTRALIA ================= */

{
  name: "Steve Smith",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "36"],
    ["Birthplace", "Sydney, Australia"],
    ["Role", "Batsman"],
    ["Matches Played", "450+"],
    ["IPL Team", "Delhi Capitals"],
    ["Runs", "17000+"],
    ["Wickets", "30+"]
  ]),
  hiddenStats: new Map([
    ["Country", "Australia"]
  ]),
  difficulty: "medium",
  isActive: true
},
{
  name: "David Warner",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "39"],
    ["Birthplace", "Sydney, Australia"],
    ["Role", "Batsman"],
    ["Matches Played", "470+"],
    ["IPL Team", "Delhi Capitals"],
    ["Runs", "18000+"],
    ["Wickets", "5"]
  ]),
  hiddenStats: new Map([
    ["Country", "Australia"]
  ]),
  difficulty: "easy",
  isActive: true
},
{
  name: "Pat Cummins",
  imageHidden: "/images/bowler.jpg",
  imageRevealed: "/images/bowler.jpg",
  visibleStats: new Map([
    ["Age", "32"],
    ["Birthplace", "Sydney, Australia"],
    ["Role", "Bowler"],
    ["Matches Played", "250+"],
    ["IPL Team", "Sunrisers Hyderabad"],
    ["Runs", "1500+"],
    ["Wickets", "430+"]
  ]),
  hiddenStats: new Map([
    ["Country", "Australia"]
  ]),
  difficulty: "medium",
  isActive: true
},

/* ================= 🏴 ENGLAND ================= */

{
  name: "Joe Root",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "35"],
    ["Birthplace", "Sheffield, England"],
    ["Role", "Batsman"],
    ["Matches Played", "500+"],
    ["IPL Team", "Rajasthan Royals"],
    ["Runs", "20000+"],
    ["Wickets", "50+"]
  ]),
  hiddenStats: new Map([
    ["Country", "England"]
  ]),
  difficulty: "medium",
  isActive: true
},
{
  name: "Ben Stokes",
  imageHidden: "/images/allrounder.jpg",
  imageRevealed: "/images/allrounder.jpg",
  visibleStats: new Map([
    ["Age", "34"],
    ["Birthplace", "Christchurch, New Zealand"],
    ["Role", "All-rounder"],
    ["Matches Played", "380+"],
    ["IPL Team", "Chennai Super Kings"],
    ["Runs", "12000+"],
    ["Wickets", "250+"]
  ]),
  hiddenStats: new Map([
    ["Country", "England"]
  ]),
  difficulty: "medium",
  isActive: true
},

/* ================= 🇵🇰 PAKISTAN ================= */

{
  name: "Babar Azam",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "29"],
    ["Birthplace", "Lahore, Pakistan"],
    ["Role", "Batsman"],
    ["Matches Played", "300+"],
    ["IPL Team", "N/A"],
    ["Runs", "13000+"],
    ["Wickets", "2"]
  ]),
  hiddenStats: new Map([
    ["Country", "Pakistan"]
  ]),
  difficulty: "medium",
  isActive: true
},
{
  name: "Shaheen Afridi",
  imageHidden: "/images/bowler.jpg",
  imageRevealed: "/images/bowler.jpg",
  visibleStats: new Map([
    ["Age", "23"],
    ["Birthplace", "Khyber, Pakistan"],
    ["Role", "Bowler"],
    ["Matches Played", "160+"],
    ["IPL Team", "N/A"],
    ["Runs", "300+"],
    ["Wickets", "280+"]
  ]),
  hiddenStats: new Map([
    ["Country", "Pakistan"]
  ]),
  difficulty: "medium",
  isActive: true
},

/* ================= 🇿🇦 SOUTH AFRICA ================= */

{
  name: "AB de Villiers",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "39"],
    ["Birthplace", "Pretoria, South Africa"],
    ["Role", "Batsman"],
    ["Matches Played", "420+"],
    ["IPL Team", "Royal Challengers Bangalore"],
    ["Runs", "20000+"],
    ["Wickets", "7"]
  ]),
  hiddenStats: new Map([
    ["Country", "South Africa"]
  ]),
  difficulty: "easy",
  isActive: true
},
{
  name: "Kagiso Rabada",
  imageHidden: "/images/bowler.jpg",
  imageRevealed: "/images/bowler.jpg",
  visibleStats: new Map([
    ["Age", "28"],
    ["Birthplace", "Johannesburg, South Africa"],
    ["Role", "Bowler"],
    ["Matches Played", "230+"],
    ["IPL Team", "Punjab Kings"],
    ["Runs", "400+"],
    ["Wickets", "470+"]
  ]),
  hiddenStats: new Map([
    ["Country", "South Africa"]
  ]),
  difficulty: "medium",
  isActive: true
},

/* ================= 🇳🇿 NEW ZEALAND ================= */

{
  name: "Kane Williamson",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "33"],
    ["Birthplace", "Tauranga, New Zealand"],
    ["Role", "Batsman"],
    ["Matches Played", "410+"],
    ["IPL Team", "Gujarat Titans"],
    ["Runs", "18000+"],
    ["Wickets", "40+"]
  ]),
  hiddenStats: new Map([
    ["Country", "New Zealand"]
  ]),
  difficulty: "medium",
  isActive: true
},
{
  name: "Trent Boult",
  imageHidden: "/images/bowler.jpg",
  imageRevealed: "/images/bowler.jpg",
  visibleStats: new Map([
    ["Age", "34"],
    ["Birthplace", "Rotorua, New Zealand"],
    ["Role", "Bowler"],
    ["Matches Played", "320+"],
    ["IPL Team", "Rajasthan Royals"],
    ["Runs", "800+"],
    ["Wickets", "550+"]
  ]),
  hiddenStats: new Map([
    ["Country", "New Zealand"]
  ]),
  difficulty: "medium",
  isActive: true
},

/* ================= 🇦🇫 AFGHANISTAN ================= */

{
  name: "Rashid Khan",
  imageHidden: "/images/bowler.jpg",
  imageRevealed: "/images/bowler.jpg",
  visibleStats: new Map([
    ["Age", "25"],
    ["Birthplace", "Nangarhar, Afghanistan"],
    ["Role", "Bowler"],
    ["Matches Played", "250+"],
    ["IPL Team", "Gujarat Titans"],
    ["Runs", "1200+"],
    ["Wickets", "480+"]
  ]),
  hiddenStats: new Map([
    ["Country", "Afghanistan"]
  ]),
  difficulty: "hard",
  isActive: true
},

/* ================= 🇧🇩 BANGLADESH ================= */

{
  name: "Shakib Al Hasan",
  imageHidden: "/images/allrounder.jpg",
  imageRevealed: "/images/allrounder.jpg",
  visibleStats: new Map([
    ["Age", "36"],
    ["Birthplace", "Magura, Bangladesh"],
    ["Role", "All-rounder"],
    ["Matches Played", "450+"],
    ["IPL Team", "Kolkata Knight Riders"],
    ["Runs", "14000+"],
    ["Wickets", "650+"]
  ]),
  hiddenStats: new Map([
    ["Country", "Bangladesh"]
  ]),
  difficulty: "medium",
  isActive: true
},

/* ================= 🇯🇲 WEST INDIES ================= */

{
  name: "Chris Gayle",
  imageHidden: "/images/batsman.jpg",
  imageRevealed: "/images/batsman.jpg",
  visibleStats: new Map([
    ["Age", "44"],
    ["Birthplace", "Kingston, Jamaica"],
    ["Role", "Batsman"],
    ["Matches Played", "480+"],
    ["IPL Team", "Punjab Kings"],
    ["Runs", "19000+"],
    ["Wickets", "20+"]
  ]),
  hiddenStats: new Map([
    ["Country", "West Indies"]
  ]),
  difficulty: "easy",
  isActive: true
}

];

async function seedCricketers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    await Cricketer.deleteMany({});
    console.log("🗑️ Existing cricketers removed");

    await Cricketer.insertMany(cricketers);
    console.log(`🏏 ${cricketers.length} cricketers inserted successfully`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seedCricketers();
