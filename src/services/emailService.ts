export const EmailService = {
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/vendor/reset-password?token=${resetToken}`;

    console.log("\n========================================");
    console.log("📧 PASSWORD RESET EMAIL (MVP - Console Log)");
    console.log("========================================");
    console.log(`To: ${email}`);
    console.log(`Subject: Reset Your Vendor Password`);
    console.log("----------------------------------------");
    console.log("Hi there,");
    console.log("");
    console.log("You requested to reset your password. Click the link below to reset it:");
    console.log("");
    console.log(`🔗 ${resetLink}`);
    console.log("");
    console.log("This link will expire in 1 hour.");
    console.log("");
    console.log("If you didn't request this, please ignore this email.");
    console.log("========================================\n");

    return true;
  },
};
