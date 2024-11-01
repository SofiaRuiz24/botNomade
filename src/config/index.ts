import "dotenv/config";

export const config = {
  port: process.env.PORT || 3008,
    jwtToken: process.env.jwtToken,
    numberId: process.env.numberId,
    verifyToken: process.env.verifyToken,
    version: "v21.0"
};