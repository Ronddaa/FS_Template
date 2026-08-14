import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

export class Database_Client extends PrismaClient {
  constructor(database_url: string) {
    const adapter = new PrismaPg({
      connectionString: database_url,
    });

    super({
      adapter,
    });
  }
}

export { PrismaClient };
export { Prisma } from "./generated/prisma/client";
export { User_Role, User_Status } from "./generated/prisma/client";
