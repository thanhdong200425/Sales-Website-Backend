import { Request, Response } from "express";

export const createContactRequest = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    // Hiện tại chỉ log ra server. Sau này có thể lưu DB hoặc gửi email.
    console.log("[Support][Contact]", {
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been received. We will contact you soon.",
    });
  } catch (error) {
    console.error("Error in createContactRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact request",
    });
  }
};

export const createChatMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body as { message?: string };

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Trả lời đơn giản dạng chatbot rule-based
    const normalized = message.toLowerCase();
    let reply =
      "Cảm ơn bạn đã liên hệ. Đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.";

    if (normalized.includes("đơn hàng") || normalized.includes("order")) {
      reply =
        "Bạn có thể xem trạng thái đơn hàng tại trang Order Status. Nếu cần hỗ trợ thêm, vui lòng cung cấp mã đơn hàng.";
    } else if (
      normalized.includes("thanh toán") ||
      normalized.includes("payment") ||
      normalized.includes("vnpay")
    ) {
      reply =
        "Nếu bạn gặp vấn đề với thanh toán VNPay, hãy chụp màn hình lỗi và gửi kèm thời gian, mã đơn hàng để chúng tôi kiểm tra.";
    } else if (
      normalized.includes("đổi trả") ||
      normalized.includes("refund") ||
      normalized.includes("return")
    ) {
      reply =
        "Chính sách đổi trả: trong vòng 7 ngày kể từ khi nhận hàng, sản phẩm còn nguyên tem mác. Vui lòng cung cấp mã đơn hàng để được hỗ trợ.";
    }

    return res.status(200).json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error("Error in createChatMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send chat message",
    });
  }
};


