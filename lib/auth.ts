import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "fixmate";
const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const globalForMongo = globalThis as unknown as {
  fixmateMongoClient?: MongoClient;
};

const client = globalForMongo.fixmateMongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.fixmateMongoClient = client;
}

const db = client.db(dbName);

export const auth = betterAuth({
  appName: "FixMate",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, {
    client,
    // BetterAuth defaults to singular model names (`user`). The API server and
    // the assignment's data model both expect a `users` collection.
    usePlural: true,
    // Multi-document transactions require a replica set; a plain local mongod
    // is standalone, so keep this off to make sign-up work anywhere.
    transaction: false,
  }),
  trustedOrigins: [
    baseURL,
    process.env.NEXT_PUBLIC_APP_URL ?? baseURL,
    "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: { type: "string", required: false, input: true },
      area: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      update: {
        // `role` is an input field so sign-up can pick customer/technician, but
        // it must never be editable afterwards through BetterAuth's update-user
        // endpoint. Role changes go through the admin-only Express API.
        before: async (user) => {
          const { role: _ignored, ...rest } = user as Record<string, unknown>;
          void _ignored;
          return { data: rest };
        },
      },
      create: {
        // Never allow a public sign-up to become an admin.
        before: async (user) => {
          const requested = (user as Record<string, unknown>).role;
          return {
            data: {
              ...user,
              role: requested === "technician" ? "technician" : "customer",
            },
          };
        },
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: baseURL,
        audience: baseURL,
        expirationTime: "1h",
        definePayload: ({ user }) => ({
          name: user.name,
          email: user.email,
          role: (user as Record<string, unknown>).role ?? "customer",
          image: user.image ?? null,
        }),
      },
    }),
  ],
});
