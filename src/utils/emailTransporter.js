import nodemailer from 'nodemailer';


const sendEmail = async(emailID, subject, text) => {

    try {
        
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail(
            { from: process.env.USER,
            to: emailID,
            subject: subject,
            text: text }
        );
        console.log("VErification Email Sent Successfully!");

    } catch (error) {
        console.log(" Unable to send email.");
        console.log(error);
    }

}


export { sendEmail }