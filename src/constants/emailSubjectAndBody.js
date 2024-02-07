export let userEmail = ''; // Replace with the user's email
export let secretCode = ''; // Replace with the dynamically generated secret code
export let appName = 'VisionVault'; // Replace with your application name

export const emailSubject = "Verify Your Email Address";

export const emailBody = `Dear ${userEmail},

Thank you for registering with ${appName}. To complete the registration process and verify your email address, please use the following secret code:

Secret Code: ${secretCode}

Please enter this code in the verification page to activate your account.

If you did not sign up for an account with ${appName}, please ignore this email.

Thank you,
${appName} Team`