# Hướng dẫn cấu hình VNPay

## 📋 Thông tin cần thu thập từ VNPay

Trước khi bắt đầu, bạn cần đăng ký tài khoản merchant tại VNPay và lấy các thông tin sau:

### 1. Thông tin tài khoản VNPay (Bắt buộc)

- **TMN Code (Terminal Code)**: Mã định danh merchant
  - Ví dụ: `2QXUI4B4`
  - Nơi lấy: VNPay Merchant Portal → Thông tin tài khoản

- **Secret Key (Secure Hash)**: Khóa bảo mật để ký dữ liệu
  - Ví dụ: `RAOCTRGKRHJDHDHDFDFHDHDHDHDHDHDHD`
  - Nơi lấy: VNPay Merchant Portal → Cấu hình → Secret Key
  - ⚠️ **QUAN TRỌNG**: Giữ bí mật, không commit vào Git

### 2. Môi trường

- **Test (Sandbox)**:
  - Host: `https://sandbox.vnpayment.vn`
  - Dùng để test trước khi go-live

- **Production**:
  - Host: `https://www.vnpay.vn`
  - Dùng khi đã hoàn tất test

## 🔧 Cấu hình Backend

### Bước 1: Thêm biến môi trường vào file `.env`

Mở file `.env` trong thư mục `Sales-Website-Backend` và thêm các dòng sau:

```env
# ============================================
# VNPay Configuration
# ============================================
# TMN Code từ VNPay Portal
VNPAY_TMN_CODE=your_tmn_code_here

# Secret Key từ VNPay Portal (KHÔNG chia sẻ công khai!)
VNPAY_SECRET_KEY=your_secret_key_here

# VNPay Host URL
# Test: https://sandbox.vnpayment.vn
# Production: https://www.vnpay.vn
VNPAY_HOST=https://sandbox.vnpayment.vn

# Chế độ test (true cho sandbox, false cho production)
VNPAY_TEST_MODE=true

# ============================================
# Payment URLs
# ============================================
# URL backend nhận callback từ VNPay (Return URL)
# ⚠️ Phải là URL công khai, không dùng localhost trong production
VNPAY_RETURN_URL=http://localhost:8080/api/payments/vnpay-return

# URL backend nhận IPN từ VNPay (Instant Payment Notification)
# ⚠️ Phải là URL công khai, không dùng localhost trong production
VNPAY_IPN_URL=http://localhost:8080/api/payments/vnpay-ipn

# ============================================
# Frontend URL
# ============================================
# URL frontend để redirect sau khi thanh toán
FRONTEND_URL=http://localhost:3000

# URL backend (dùng cho return URL nếu không set VNPAY_RETURN_URL)
BACKEND_URL=http://localhost:8080
```

### Bước 2: Điền thông tin VNPay

Thay thế các giá trị sau trong file `.env`:

1. **VNPAY_TMN_CODE**: Thay `your_tmn_code_here` bằng TMN Code của bạn
2. **VNPAY_SECRET_KEY**: Thay `your_secret_key_here` bằng Secret Key của bạn
3. **VNPAY_HOST**:
   - Test: `https://sandbox.vnpayment.vn`
   - Production: `https://www.vnpay.vn`
4. **VNPAY_TEST_MODE**:
   - `true` cho môi trường test
   - `false` cho production

### Bước 3: Cấu hình URLs (Quan trọng!)

#### Cho môi trường Development (Local):

```env
VNPAY_RETURN_URL=http://localhost:8080/api/payments/vnpay-return
VNPAY_IPN_URL=http://localhost:8080/api/payments/vnpay-ipn
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
```

⚠️ **Lưu ý**: VNPay không thể gọi localhost từ internet. Để test local, bạn cần:
- Sử dụng ngrok hoặc công cụ tương tự để expose localhost ra internet
- Hoặc deploy lên server test có domain công khai

#### Cho môi trường Production:

```env
VNPAY_RETURN_URL=https://yourdomain.com/api/payments/vnpay-return
VNPAY_IPN_URL=https://yourdomain.com/api/payments/vnpay-ipn
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

⚠️ **Yêu cầu Production**:
- Phải sử dụng HTTPS (không hỗ trợ HTTP)
- Domain phải trỏ đúng server backend
- Server phải có thể truy cập từ internet

## 🧪 Test thanh toán

### 1. Khởi động Backend

```bash
cd Sales-Website-Backend
npm run dev
```

### 2. Khởi động Frontend

```bash
cd Sales-Website
npm run dev
```

### 3. Test flow thanh toán

1. Đăng nhập vào website
2. Thêm sản phẩm vào giỏ hàng
3. Vào trang Checkout (`/checkout`)
4. Điền thông tin shipping
5. Chọn phương thức thanh toán **VNPay**
6. Click "Place Order"
7. Sẽ được redirect đến trang thanh toán VNPay
8. Sử dụng thẻ test từ VNPay để thanh toán
9. Sau khi thanh toán, sẽ được redirect về trang Success/Failed

### 4. Thẻ test VNPay (Sandbox)

Tham khảo tài liệu VNPay để lấy thông tin thẻ test:
- [VNPay Sandbox Documentation](https://sandbox.vnpayment.vn/apis)

## 📝 Lưu ý quan trọng

### Bảo mật

1. **KHÔNG commit Secret Key vào Git**
   - Thêm `.env` vào `.gitignore`
   - Sử dụng biến môi trường trên server

2. **Sử dụng HTTPS trong Production**
   - VNPay yêu cầu HTTPS
   - Cấu hình SSL certificate

3. **Validate IPN Callback**
   - Luôn verify signature từ VNPay
   - Không tin tưởng dữ liệu từ client

### Tỷ giá chuyển đổi

Hiện tại code đang sử dụng tỷ giá cố định:
- 1 USD = 25,000 VND

Bạn có thể điều chỉnh trong file:
`Sales-Website-Backend/src/modules/payments/payment.controller.ts`

Tìm dòng:
```typescript
const amount = Math.round(Number(order.totalAmount) * 25000);
```

### Cấu trúc Order Reference

Order reference được tạo theo format:
```
ORDER_{orderId}_{timestamp}
```

Ví dụ: `ORDER_123_1703123456789`

Format này giúp parse lại orderId từ callback của VNPay.

## 🔍 Troubleshooting

### Lỗi: "Checksum failed"
- Kiểm tra Secret Key có đúng không
- Kiểm tra VNPAY_HOST có đúng môi trường không

### Lỗi: "Invalid order reference"
- Kiểm tra format orderId trong vnp_TxnRef
- Đảm bảo orderId tồn tại trong database

### VNPay không redirect về sau thanh toán
- Kiểm tra VNPAY_RETURN_URL có đúng không
- Kiểm tra URL có thể truy cập từ internet không (không dùng localhost)
- Kiểm tra CORS settings trên backend

### IPN không được gọi
- Kiểm tra VNPAY_IPN_URL trong VNPay Portal
- Đảm bảo URL có thể truy cập từ internet
- Kiểm tra firewall/security groups

## 📚 Tài liệu tham khảo

- [VNPay.js Documentation](https://vnpay.js.org/)
- [VNPay API Documentation](https://sandbox.vnpayment.vn/apis)
- [VNPay GitHub](https://github.com/lehuygiang28/vnpay)

## ✅ Checklist hoàn tất

- [ ] Đã đăng ký tài khoản VNPay
- [ ] Đã lấy TMN Code và Secret Key
- [ ] Đã cấu hình file `.env` với đầy đủ thông tin
- [ ] Đã test thanh toán thành công trên Sandbox
- [ ] Đã cấu hình HTTPS cho production
- [ ] Đã cấu hình domain và URLs cho production
- [ ] Đã test IPN callback
- [ ] Đã bảo mật Secret Key (không commit vào Git)

---

**Chúc bạn tích hợp thành công! 🎉**

