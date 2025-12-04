// src/modules/orders/orders.controller.ts
import { Request, Response } from "express";
import { OrderService } from "./orders.service";

export class OrderController {
  static async getOrder(req: Request, res: Response) {
    try {
      const { orderNumber } = req.params;
      const order = await OrderService.getOrderByNumber(orderNumber);

      // Return data in a format close to what your Frontend expects
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async createTest(req: Request, res: Response) {
    try {
      const order = await OrderService.createTestOrder();
      res.json(order);
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
