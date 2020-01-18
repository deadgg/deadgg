import * as mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    email: string;
    discordId: string;
}

export const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        requred: true
    },

    discordId: {
        type: String,
        unique: true,
        required: true
    }
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
