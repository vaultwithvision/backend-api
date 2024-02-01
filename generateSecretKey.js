import crypto from 'crypto';

function generateSeretKey(length) {
    return crypto.randomBytes(length).toString('hex');
}

// Generate a 32-byte (256-bit) secret key
const secretKey = generateSeretKey(32);
console.log('Generated Secret Key : ', secretKey);