const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config()

const emailsender = (user, otpcode)=>{

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER,
            pass: process.env.USER_PASS,
        },
    });

    const mailoption = {
    from: {
        name: "Silver Tlc",
        address: process.env.USER,
    }, // sender address
    to: [user],
    subject: "OTP Code",
    html: `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Code</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 10px;">

            <div style="max-width: 600px; margin: 20px auto; background-color: black; padding: 20px; border-radius: 8px; border: 2px solid rgb(205, 205, 205); text-align: center; box-shadow: 0px 0px 8px #71717a;">
                <h1 style="color: white; font-weight: bolder;">SILVER TLC<span style="color:aqua; font-weight: bolder;">.</span></h1>
                <h2 style="color: whitesmoke; margin-bottom: 10px;">Your 6-DIGIT OTP Code</h2>
                <p style="color: rgb(205, 205, 205); font-size: 16px;">Use the code below to complete your verification:</p>
                
                <div style="padding: 20px 0;">
                <div style="display: inline-block; width: 40px; height: 40px; background-color: black; border: 2px solid rgb(205, 205, 205); font-size: 24px; font-weight: bold; color: white; line-height: 40px; margin: 0 5px; border-radius: 10px; box-shadow: 0px 0px 8px #e4e4e7;">
                    <span>${otpcode[0]}</span>
                </div>
                <div style="display: inline-block; width: 40px; height: 40px; background-color: black; border: 2px solid rgb(205, 205, 205); font-size: 24px; font-weight: bold; color: white; line-height: 40px; margin: 0 5px; border-radius: 10px; box-shadow: 0px 0px 8px #e4e4e7;">
                    <span>${otpcode[1]}</span>
                </div>
                <div style="display: inline-block; width: 40px; height: 40px; background-color: black; border: 2px solid rgb(205, 205, 205); font-size: 24px; font-weight: bold; color: white; line-height: 40px; margin: 0 5px; border-radius: 10px; box-shadow: 0px 0px 8px #e4e4e7;">
                <span>${otpcode[2]}</span>
                </div>
                <div style="display: inline-block; width: 40px; height: 40px; background-color: black; border: 2px solid rgb(205, 205, 205); font-size: 24px; font-weight: bold; color: white; line-height: 40px; margin: 0 5px; border-radius: 10px; box-shadow: 0px 0px 8px #e4e4e7;">
                    <span>${otpcode[3]}</span>
                </div>
                <div style="display: inline-block; width: 40px; height: 40px; background-color: black; border: 2px solid rgb(205, 205, 205); font-size: 24px; font-weight: bold; color: white; line-height: 40px; margin: 0 5px; border-radius: 10px; box-shadow: 0px 0px 8px #e4e4e7;">
                    <span>${otpcode[4]}</span>
                </div>
                <div style="display: inline-block; width: 40px; height: 40px; background-color: black; border: 2px solid rgb(205, 205, 205); font-size: 24px; font-weight: bold; color: white; line-height: 40px; margin: 0 5px; border-radius: 10px; box-shadow: 0px 0px 8px #e4e4e7;">
                    <span>${otpcode[5]}</span>
                </div>
                </div>

                <p style="color: whitesmoke; font-size: 12px;">This code is valid for 2 minutes.</p>
                <p style="color: rgb(205, 205, 205); font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>

            </body>
            </html>
        `
    };

    const sendmail = async (transporter, mailoption) => {
    try {
        await transporter.sendMail(mailoption);
    } catch (error) {
        console.log(error);
    }
    };


    sendmail(transporter, mailoption);

} 

module.exports = {emailsender};