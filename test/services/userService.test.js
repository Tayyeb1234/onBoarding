const { expect } = require("chai");
const sinon = require("sinon");
const User = require("../../models/User");
const userService = require("../../services/userService");

describe("userService", () => {
    afterEach(() => sinon.restore());

    describe("getAllUsers", () => {
        it("should return all users", async () => {
            const users = [
                { _id: "id1", username: "user1", email: "a@a.com", role: "Viewer", isDeleted: false },
                { _id: "id2", username: "user2", email: "b@b.com", role: "Admin", isDeleted: false }
            ];
            const selectStub = sinon.stub().returns(users);
            sinon.stub(User, "find").returns({ select: selectStub });
            const result = await userService.getAllUsers();
            expect(result).to.deep.equal([
                { id: "id1", username: "user1", email: "a@a.com", role: "Viewer" },
                { id: "id2", username: "user2", email: "b@b.com", role: "Admin" }
            ]);
        });
    });

    describe("getUserByIdService", () => {
        it("should return user by id if admin", async () => {
            const users = [
                { _id: "id1", username: "user1", email: "a@a.com", role: "Viewer", isDeleted: false }
            ];
            const selectStub = sinon.stub().returns(users);
            sinon.stub(User, "find").returns({ select: selectStub });
            const result = await userService.getUserByIdService({
                requesterId: "adminId",
                requesterRole: "Admin",
                userId: "id1"
            });
            expect(result).to.deep.equal({
                id: "id1",
                username: "user1",
                email: "a@a.com",
                role: "Viewer"
            });
        });

        it("should throw if user not found", async () => {
            const selectStub = sinon.stub().returns([]);
            sinon.stub(User, "find").returns({ select: selectStub });
            try {
                await userService.getUserByIdService({
                    requesterId: "adminId",
                    requesterRole: "Admin",
                    userId: "id2"
                });
            } catch (err) {
                expect(err.message).to.equal("User not found.");
            }
        });

        it("should throw if not admin or self", async () => {
            const users = [
                { _id: "id1", username: "user1", email: "a@a.com", role: "Viewer", isDeleted: false }
            ];
            const selectStub = sinon.stub().returns(users);
            sinon.stub(User, "find").returns({ select: selectStub });
            try {
                await userService.getUserByIdService({
                    requesterId: "otherId",
                    requesterRole: "Viewer",
                    userId: "id1"
                });
            } catch (err) {
                expect(err.message).to.equal("Access forbidden: insufficient permissions.");
            }
        });
    });

    describe("updateUserRoleService", () => {
        it("should update user role", async () => {
            const user = { _id: "id1", username: "user1", email: "a@a.com", role: "Viewer", save: sinon.stub().resolves() };
            sinon.stub(User, "findById").resolves(user);
            const result = await userService.updateUserRoleService({
                requesterId: "adminId",
                requesterRole: "Admin",
                userId: "id1",
                newRole: "Admin"
            });
            expect(user.role).to.equal("Admin");
            expect(result).to.deep.equal({
                id: "id1",
                username: "user1",
                email: "a@a.com",
                role: "Admin"
            });
        });

        it("should throw if user not found", async () => {
            sinon.stub(User, "findById").resolves(null);
            try {
                await userService.updateUserRoleService({
                    requesterId: "adminId",
                    requesterRole: "Admin",
                    userId: "id2",
                    newRole: "Admin"
                });
            } catch (err) {
                expect(err.message).to.equal("User not found.");
            }
        });

        it("should prevent admin from downgrading self", async () => {
            try {
                await userService.updateUserRoleService({
                    requesterId: "id1",
                    requesterRole: "Admin",
                    userId: "id1",
                    newRole: "Viewer"
                });
            } catch (err) {
                expect(err.message).to.equal("Admins cannot downgrade their own role.");
            }
        });
    });

    describe("updateUserService", () => {
        it("should update user if admin", async () => {
            const updatedUser = { _id: "id1", username: "new", email: "new@mail.com", role: "Viewer" };
            sinon.stub(User, "findByIdAndUpdate").resolves(updatedUser);
            const result = await userService.updateUserService("id1", { username: "new" }, { _id: "adminId", role: "Admin" });
            expect(result).to.deep.equal(updatedUser);
        });

        it("should throw if not authorized", async () => {
            try {
                await userService.updateUserService("id1", { username: "new" }, { _id: "otherId", role: "Viewer" });
            } catch (err) {
                expect(err.message).to.equal("Not authorized to update this user");
            }
        });

        it("should throw if user not found", async () => {
            sinon.stub(User, "findByIdAndUpdate").resolves(null);
            try {
                await userService.updateUserService("id2", { username: "new" }, { _id: "adminId", role: "Admin" });
            } catch (err) {
                expect(err.message).to.equal("User not found");
            }
        });
    });

    describe("deleteUserService", () => {
        it("should delete user if admin", async () => {
            sinon.stub(User, "findByIdAndDelete").resolves({ _id: "id1" });
            const result = await userService.deleteUserService("id1", { _id: "adminId", role: "Admin" });
            expect(result.message).to.include("User deleted successfully");
        });

        it("should throw if not admin", async () => {
            try {
                await userService.deleteUserService("id1", { _id: "viewerId", role: "Viewer" });
            } catch (err) {
                expect(err.message).to.equal("Only admins can delete users");
            }
        });

        it("should throw if user not found", async () => {
            sinon.stub(User, "findByIdAndDelete").resolves(null);
            try {
                await userService.deleteUserService("id2", { _id: "adminId", role: "Admin" });
            } catch (err) {
                expect(err.message).to.equal("User not found");
            }
        });
    });
});