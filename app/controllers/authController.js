
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const sendEmail = require("../utils/sendmail.js")
const OTPModel = require('../models/otpModel')



class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "all fields are required"
                })
            }

            const existUser = await User.findOne({ email })
            if (existUser) {
                return res.status(400).json({
                    success: false,
                    message: "user already exist"
                })
            }


            const userdata = new User({
                name,
                email,
                password
            })
            const user = await userdata.save()

            await sendEmail(req, user)

            return res.status(201).json({
                success: true,
                message: "User has registered successfully and otp sent to your email. Please verify your email. ",
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            })

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Registration failed"
            });
        }
    }


    async verify(req, res) {
        try {
            const { email, otp } = req.body;

            const normalizedEmail = email.toLowerCase();

            if (!normalizedEmail || !otp) {
                return res.status(400).json({
                    status: false,
                    message: "All fields are required"
                });
            }


            const existingUser = await User.findOne({ email: normalizedEmail });


            if (!existingUser) {
                return res.status(404).json({
                    status: "failed",
                    message: "Email doesn't exists"
                });
            }


            if (existingUser.is_verified) {
                return res.status(400).json({
                    status: false,
                    message: "Email is already verified"
                });
            }

            const emailVerification = await OTPModel.findOne({ userId: existingUser._id });

            if (!emailVerification) {
                await sendEmail(req, existingUser);
                return res.status(400).json({
                    status: false,
                    message: "OTP expired. New OTP sent to your email"
                });
            }

            // compare OTP
            const isValid = await bcrypt.compare(otp.toString(), emailVerification.otp);

            if (!isValid) {
                await sendEmail(req, existingUser);
                return res.status(400).json({
                    status: false,
                    message: "Invalid OTP, new OTP sent"
                });
            }
            // Check if OTP is expired
            const currentTime = new Date();
            // 5 * 60 * 1000 calculates the expiration period in milliseconds(5 minutes).
            const expirationTime = new Date(emailVerification.createdAt.getTime() + 5 * 60 * 1000);
            if (currentTime > expirationTime) {
                // OTP expired, send new OTP
                await OTPModel.deleteMany({ userId: existingUser._id });

                await sendEmail(req, existingUser);

                return res.status(400).json({
                    success: false,
                    message: "OTP expired, a new OTP sent to your email"
                });
            }
            // OTP is valid and not expired, mark email as verified
            existingUser.is_verified = true;
            await existingUser.save();

            // Delete email verification document
            await OTPModel.deleteMany({ userId: existingUser._id });
            return res.status(200).json({
                status: true,
                message: "Email verified successfully"
            });


        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Unable to verify email, please try again later"
            });
        }
    }


    async login(req, res) {
        try {
            const { email, password } = req.body

            const normalizedEmail = email.toLowerCase();

            if (!normalizedEmail || !password) {
                return res.status(400).json({
                    success: false,
                    message: "all fields are required"
                })
            }
            const user = await User.findOne({ email: normalizedEmail })
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "user not found"
                })
            }
            const isMatch = await user.comparePassword(password)
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials"
                })
            }
            if (!user.is_verified) {
                return res.status(401).json({
                    success: false,
                    message: "Your account is not verified"
                });
            }




            const token = jwt.sign({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role

            }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })



            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "Strict",
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });


            user.token = token
            await user.save()


            return res.status(200).json({
                success: true,
                message: "user login successfully",
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: "login failed"
            })

        }

    }

    async dashboard(req, res) {
        try {
            const user = req.user;

            if (user.role === "admin") {
                return res.status(200).json({
                    success: true,
                    message: `Welcome Admin. Hi ${user.name} . `,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }

            if (user.role === "user") {
                return res.status(200).json({
                    success: true,
                    message: `Welcome User. Helllo ${user.name}. `,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }

            // fallback
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong"
            });
        }
    }

    async resendOtp(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: "User already verified"
            });
        }


        await OTPModel.deleteMany({ userId: user._id });

        await sendEmail(req, user);

        return res.status(200).json({
            success: true,
            message: "New OTP sent to your email"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to resend OTP"
        });
    }
}

    async logout(req, res) {
        try {
            const user = req.user;

            user.token = null;
            await user.save();

            res.clearCookie("token");

            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }
    }

}


module.exports = new AuthController();

