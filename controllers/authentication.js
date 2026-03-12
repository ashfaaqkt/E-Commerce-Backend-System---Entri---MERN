const User = require('../models/user');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token
    });
};

const nodemailer = require('nodemailer');

// Helper to send email
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this to SendGrid, Mailgun, etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const message = {
        from: `${process.env.EMAIL_USER}`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'There is no user with that email' });
        }

        // Get reset token (OTP)
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create HTML Email Template
        const message = `
            <h2>Password Reset Request</h2>
            <p>You are receiving this email because you (or someone else) requested a password reset for your EvoStore account.</p>
            <p>Your OTP Code is: <b style="font-size: 24px; color: #1a56db; letter-spacing: 2px;">${resetToken}</b></p>
            <p>This code is valid for 10 minutes.</p>
        `;

        try {
            // Attempt to send the email
            await sendEmail({
                email: user.email,
                subject: 'EvoStore - Password Reset OTP Code',
                html: message
            });

            res.status(200).json({
                success: true,
                data: 'Email sent successfully',
                // ONLY expose OTP in dev mode for debugging, otherwise remove `otp` from response.
                // We're keeping it here for demonstration until you set up real SMTP.
                otp: process.env.NODE_ENV === 'development' ? resetToken : undefined
            });
        } catch (err) {
            console.error(err);
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordOtpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};
