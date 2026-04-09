const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
        token: {
            type: String,
            default: null
        }

    },
    {
        timestamps: true,
        versionKey: false,
    },
);


UserSchema.pre("save", async function () {
    try {

        if (!this.isModified("password")) {
            return;
        }

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    
    } 
    catch (err) {
        console.log(err);
    }
});


UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model("userModel", UserSchema);

module.exports = UserModel;