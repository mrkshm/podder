import { model, Model, Schema, ObjectId } from "mongoose";
import { compare, hash, } from "bcrypt";

interface emailTokenDocument {
  owner: ObjectId,
  token: string,
  createdAt: Date
}

interface Methods {
  compareToken(token: string): Promise<boolean>
}

const emailTokenSchema = new Schema<emailTokenDocument, {}, Methods>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      expires: 3600,
      default: Date.now()
    }
  }
)

emailTokenSchema.pre("save", async function(next) {
  if (this.isModified("token")) {
    this.token = await hash(this.token, 10);
  }

  next();
});

emailTokenSchema.methods.compareToken = async function(token) {
  const result = await compare(token, this.token)
  return result;
}

export default model("EmailToken", emailTokenSchema) as Model<emailTokenDocument, {}, Methods>;
