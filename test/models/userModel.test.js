const mongoose = require("mongoose");
const { expect } = require("chai");
const User = require("../../models/User");

describe("User Model", () => {
  before(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/user_test_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it("should not save without required fields", async () => {
    const user = new User({});
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors.username).to.exist;
    expect(err.errors.email).to.exist;
    expect(err.errors.password).to.exist;
  });

  it("should not save with invalid email", async () => {
    const user = new User({
      username: "johnny",
      email: "invalidemail", "test": "mocha --timeout 10000",
      password: "123456"
    });

    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors.email).to.exist;
  });

  it("should save with valid data", async () => {
    const user = new User({
      username: "johnny",
      email: "johnny@test.com",
      password: "123456",
      role: "Editor"
    });

    const savedUser = await user.save();
    expect(savedUser._id).to.exist;
    expect(savedUser.role).to.equal("Editor");
    expect(savedUser.isVerified).to.be.false;
    expect(savedUser.isOTPVerified).to.be.false;
  });

  it("should not allow invalid role", async () => {
    const user = new User({
      username: "mary",
      email: "mary@test.com",
      password: "123456",
      role: "SuperAdmin" // invalid
    });

    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors.role).to.exist;
  });

  it("should update updatedAt before save", async () => {
    const user = new User({
      username: "timmy",
      email: "timmy@test.com",
      password: "123456"
    });

    const savedUser = await user.save();
    const oldUpdatedAt = savedUser.updatedAt;

    // wait 1 sec and update
    await new Promise(resolve => setTimeout(resolve, 1000));
    savedUser.username = "timmy2";
    const updatedUser = await savedUser.save();

    expect(updatedUser.updatedAt).to.be.greaterThan(oldUpdatedAt);
  });
});
