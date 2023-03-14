import dotenv from "dotenv";
import joi from "joi";
import path from "path";

const suffix = process.env.ENV ? `.${process.env.ENV}` : "";
dotenv.config({ path: path.join(__dirname, `../../.env${suffix}`) });

const configSchema = joi
    .object()
    .keys({
        NODE_ENV: joi
            .string()
            .valid("production", "development", "test")
            .required(),
        PORT: joi.number().positive().required(),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().positive().required(),
        DB_NAME: joi.string().required(),
        DB_USER: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        TOKEN_SECRET: joi.string().required(),
    })
    .unknown();

const { value: envConfig, error } = configSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export = {
    nodeEnv: envConfig.NODE_ENV as string,
    port: envConfig.PORT as string,
    dbHost: envConfig.DB_HOST as string,
    dbPort: envConfig.DB_PORT as number,
    dbName: envConfig.DB_NAME as string,
    dbUser: envConfig.DB_USER as string,
    dbPassword: envConfig.DB_PASSWORD as string,
    tokenSecret: envConfig.TOKEN_SECRET as string,
};
