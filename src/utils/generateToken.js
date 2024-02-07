import crypto from 'crypto';


// Function to generate a 6-digit token
const generateToken = () => {
    // Generate random bytes and convert them to a hexadecimal string
    const token = crypto.randomBytes(3).toString('hex');
    // Convert the hexadecimal string to a decimal number and take modulo 1000000 to get a 6-digit token
    const sixDigitToken = parseInt(token, 16) % 1000000;
    // Pad the token with leading zeros if necessary and return as a string
    return sixDigitToken.toString().padStart(6, "0");
}

export { generateToken }