import { PrismaClient } from "@prisma/client";

// This creates one single, reusable client instance
export const prisma = new PrismaClient();
