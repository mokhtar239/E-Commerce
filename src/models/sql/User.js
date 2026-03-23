const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../../config/mysql");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: "Name is required" },
                len: {
                    args: [2, 100],
                    msg: "Name must be between 2 and 100 characters",
                },
            },
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: { msg: "Email already exists" },
            validate: {
                isEmail: { msg: "Please provide a valid email" },
            },
            set(value) {
                this.setDataValue("email", value.toLowerCase());
            },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: { args: [6, 255], msg: "Password must be at least 6 characters" },
            },
        },
        role: {
            type: DataTypes.ENUM("buyer", "seller", "admin"),
            defaultValue: "buyer",
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verifyToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        resetToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        resetExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        googleId: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "users",
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            },
        },
    },
);

// Instance method: compare password for login
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields when converting to JSON
User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.verifyToken;
    delete values.resetToken;
    delete values.resetExpires;
    return values;
};

module.exports = User;
