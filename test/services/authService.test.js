const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const authService = require("../../services/authService");
const transporter = require("../../config/email");

describe("authService", () => {
    afterEach(() => sinon.restore());

    describe("registerUser", () => {
        it("should throw if email already exists", async () => {
            sinon.stub(User, "findOne").resolves({ email: "test@example.com" });
            try {
                await authService.registerUser({ username: "user", email: "test@example.com", password: "pass", role: "Viewer" });
            } catch (err) {
                expect(err.message).to.equal("User with this email already exists.");
            }
        });

        it("should throw if username already exists", async () => {
            sinon.stub(User, "findOne")
                .onFirstCall().resolves(null)
                .onSecondCall().resolves({ username: "user" });
            try {
                await authService.registerUser({ username: "user", email: "unique@example.com", password: "pass", role: "Viewer" });
            } catch (err) {
                expect(err.message).to.equal("Username is already taken.");
            }
        });

        it("should create user and send OTP email", async () => {
            sinon.stub(User, "findOne").resolves(null);
            sinon.stub(bcrypt, "genSalt").resolves("salt");
            sinon.stub(bcrypt, "hash").resolves("hashed");
            sinon.stub(User.prototype, "save").resolves();
            sinon.stub(transporter, "sendMail").resolves();
            sinon.stub(jwt, "sign").returns("token");

            const result = await authService.registerUser({ username: "user", email: "unique@example.com", password: "pass", role: "Viewer" });
            expect(result).to.have.property("token");
        });
    });

    describe("verifyUserOTP", () => {
        it("should throw if user not found", async () => {
            sinon.stub(User, "findOne").resolves(null);
            try {
                await authService.verifyUserOTP({ email: "notfound@example.com", otp: "123456" });
            } catch (err) {
                expect(err.message).to.equal("Invalid email or OTP.");
            }
        });

        it("should throw if OTP already verified", async () => {
            sinon.stub(User, "findOne").resolves({ isOTPVerified: true });
            try {
                await authService.verifyUserOTP({ email: "test@example.com", otp: "123456" });
            } catch (err) {
                expect(err.message).to.equal("OTP has already been verified.");
            }
        });

        it("should throw if OTP does not match", async () => {
            sinon.stub(User, "findOne").resolves({ isOTPVerified: false, otp: "654321" });
            try {
                await authService.verifyUserOTP({ email: "test@example.com", otp: "123456" });
            } catch (err) {
                expect(err.message).to.equal("Invalid OTP.");
            }
        });

        it("should throw if OTP expired", async () => {
            sinon.stub(User, "findOne").resolves({ isOTPVerified: false, otp: "123456", otpExpires: Date.now() - 1000 });
            try {
                await authService.verifyUserOTP({ email: "test@example.com", otp: "123456" });
            } catch (err) {
                expect(err.message).to.equal("OTP has expired.");
            }
        });

        it("should verify OTP successfully", async () => {
            const saveStub = sinon.stub().resolves();
            sinon.stub(User, "findOne").resolves({
                isOTPVerified: false,
                otp: "123456",
                otpExpires: Date.now() + 10000,
                save: saveStub,
            });
            const result = await authService.verifyUserOTP({ email: "test@example.com", otp: "123456" });
            expect(result.message).to.include("OTP verified successfully");
        });
    });

    describe("loginUser", () => {
        it("should throw if user not found", async () => {
            sinon.stub(User, "findOne").resolves(null);
            try {
                await authService.loginUser({ email: "notfound@example.com", password: "pass" });
            } catch (err) {
                expect(err.message).to.equal("Invalid email or password.");
            }
        });

        it("should throw if OTP not verified", async () => {
            sinon.stub(User, "findOne").resolves({ isOTPVerified: false });
            try {
                await authService.loginUser({ email: "test@example.com", password: "pass" });
            } catch (err) {
                expect(err.message).to.equal("Please verify your OTP before logging in.");
            }
        });

        it("should throw if password does not match", async () => {
            sinon.stub(User, "findOne").resolves({ isOTPVerified: true, password: "hashed" });
            sinon.stub(bcrypt, "compare").resolves(false);
            try {
                await authService.loginUser({ email: "test@example.com", password: "wrong" });
            } catch (err) {
                expect(err.message).to.equal("Invalid email or password.");
            }
        });

        it("should login and return token", async () => {
            sinon.stub(User, "findOne").resolves({ isOTPVerified: true, password: "hashed", _id: "id", role: "Viewer" });
            sinon.stub(bcrypt, "compare").resolves(true);
            sinon.stub(jwt, "sign").returns("token");
            const result = await authService.loginUser({ email: "test@example.com", password: "pass" });
            expect(result).to.have.property("token");
        });
    });
});