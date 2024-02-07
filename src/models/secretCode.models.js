import mongoose from "mongoose";


const tokenSchema = new mongoose.Schema(
    {
        user: {
            trpe: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        code: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
        },
        used: {
            type: Boolean,
            default: false
        },
        dateCreated: {
            type: Date,
            default: Date.now(),
            expires: 600, // Automatically expire after 10 minutes
        }

    }
); 

// Index Optimization for faster queries
tokenSchema.index( { email: 1, purpose: 1 } );
tokenSchema.index(
    { dateCreated: 1 }, 
    { expireAfterSeconds: 0 }
); // To ensure expired documents are deleted

export const Token = mongoose.model("Token", tokenSchema);