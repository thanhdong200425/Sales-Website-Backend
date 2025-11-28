-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rating FLOAT DEFAULT 0,
    price FLOAT NOT NULL,
    "originalPrice" FLOAT,
    discount FLOAT,
    image TEXT NOT NULL,
    category VARCHAR(100),
    style VARCHAR(100),
    colors TEXT[],
    sizes TEXT[],
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
