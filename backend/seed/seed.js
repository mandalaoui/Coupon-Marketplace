require("dotenv").config();
const mongoose = require("mongoose");

// Allow running standalone
const runStandalone = require.main === module;

if (runStandalone) {
  const { connect } = require("../db/mongoose");
  connect()
    .then(() => seed())
    .then(() => {
      console.log("Seed complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}

const UserRepository = require("../repositories/UserRepository");
const ProductRepository = require("../repositories/ProductRepository");

async function seed() {
  const {
    ADMIN_SEED_EMAIL,
    ADMIN_SEED_PASSWORD,
  } = require("../config/env");

  // Create admin if not exists
  if (ADMIN_SEED_EMAIL && ADMIN_SEED_PASSWORD) {
    const exists = await UserRepository.exists(ADMIN_SEED_EMAIL);
    if (!exists) {
      await UserRepository.create({
        email: ADMIN_SEED_EMAIL,
        password: ADMIN_SEED_PASSWORD,
      });
      console.log(`✅ Admin created: ${ADMIN_SEED_EMAIL}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${ADMIN_SEED_EMAIL}`);
    }
  }

  // Create sample coupons if none exist
  const existing = await ProductRepository.findAll();
  if (existing.length === 0) {
    const samples = [
      {
        name: "Amazon $10 Gift Card",
        description: "Redeem for $10 credit on Amazon.com",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/240px-Amazon_icon.svg.png",
        cost_price: 8.0,
        margin_percentage: 25,
        value_type: "STRING",
        value: "AMZN-XXXX-YYYY-ZZZZ",
      },
      {
        name: "Netflix 1-Month Subscription",
        description: "One month of Netflix Standard plan",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
        cost_price: 12.0,
        margin_percentage: 20,
        value_type: "STRING",
        value: "NFLX-ABCD-1234-WXYZ",
      },
      {
        name: "Spotify Premium 3 Months",
        description: "Three months of Spotify Premium",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/240px-Spotify_logo_without_text.svg.png",
        cost_price: 9.99,
        margin_percentage: 15,
        value_type: "STRING",
        value: "SPTFY-9999-AAAA-BBBB",
      },
      {
        name: "Google Play $25 Gift Code",
        description: "Redeemable for apps, games, and media on Google Play",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg",
        cost_price: 21.5,
        margin_percentage: 16,
        value_type: "STRING",
        value: "GOOG-PLAY-25-XXXX",
      },
      {
        name: "Apple Music 6 Months",
        description: "Enjoy six months of Apple Music subscription",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        cost_price: 52.99,
        margin_percentage: 12,
        value_type: "STRING",
        value: "APPL-MUSIC-6MOS-XXYY",
      },
      {
        name: "DoorDash $15 Credit",
        description: "Redeem $15 for DoorDash orders",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/5/58/DoorDash_Logo.png",
        cost_price: 12.5,
        margin_percentage: 18,
        value_type: "STRING",
        value: "DASH-DOOR-15-ZZZZ",
      },
      {
        name: "Disney+ 1-Year Subscription",
        description: "Access Disney+ for a full year",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
        cost_price: 65.0,
        margin_percentage: 20,
        value_type: "STRING",
        value: "DSNY-PLUS-1YR-YYZZ",
      },
      {
        name: "Uber Eats $20 Gift Card",
        description: "Eat your favorites with Uber Eats credit",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
        cost_price: 16.25,
        margin_percentage: 23,
        value_type: "STRING",
        value: "UBER-EATS-20-ABCD",
      },
      {
        name: "PlayStation Store $50 Card",
        description: "Games, add-ons, and more at PlayStation Store",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_store_logo.png",
        cost_price: 41.0,
        margin_percentage: 18,
        value_type: "STRING",
        value: "PSN-STORE-50-PSPS",
      },
      {
        name: "Xbox Game Pass Ultimate 3 Months",
        description: "Three months of access to Game Pass Ultimate",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Xbox_Game_Pass_logo.svg",
        cost_price: 30.0,
        margin_percentage: 15,
        value_type: "STRING",
        value: "XBOX-PASS-ULT3-XXAB",
      },
      {
        name: "Starbucks $25 Gift Card",
        description: "Enjoy treats and drinks at Starbucks worldwide",
        image_url: "https://upload.wikimedia.org/wikipedia/sco/4/45/Starbucks_Coffee_Logo.svg",
        cost_price: 21.0,
        margin_percentage: 19,
        value_type: "STRING",
        value: "STBKS-25-CARD-XYXY",
      },
    ];

    for (const s of samples) {
      await ProductRepository.createCoupon(s);
    }
    console.log(`✅ ${samples.length} sample coupons created`);
  }
}

async function seedIfNeeded() {
  try {
    await seed();
  } catch (err) {
    console.error("Seed warning (non-fatal):", err.message);
  }
}

module.exports = { seedIfNeeded };
