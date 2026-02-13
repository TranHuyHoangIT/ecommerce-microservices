# Service: Product Service
# Responsibility: Seed sample products for development
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from app.db.session import SessionLocal
from app.models.product import Product
from app.db.session import engine, Base
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    products = [
        Product(
            name="Áo thun nam cao cấp",
            description="Áo thun cotton 100% cao cấp, thoáng mát, thấm hút mồ hôi tốt. Thiết kế basic dễ phối đồ, form chuẩn Hàn Quốc. Chất liệu cotton mềm mại, không xù lông sau nhiều lần giặt.",
            image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            price=199000,
            stock=50,
            category="Thời trang",
            brand="Local Brand",
            images=[
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500",
                "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500"
            ],
            rating=4.5,
            reviews_count=128,
            sku="TS-001",
            specifications={
                "Chất liệu": "Cotton 100%",
                "Xuất xứ": "Việt Nam",
                "Kiểu dáng": "Basic fit",
                "Màu sắc": "Đen, Trắng, Xám",
                "Size": "S, M, L, XL, XXL"
            }
        ),
        Product(
            name="Giày thể thao Running Pro",
            description="Giày chạy bộ chuyên nghiệp với công nghệ đệm khí, siêu nhẹ chỉ 250g. Đế cao su chống trơn trượt, form ôm chân êm ái. Phù hợp cho chạy bộ đường dài và tập gym.",
            image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            price=1299000,
            stock=30,
            category="Giày dép",
            brand="Nike",
            images=[
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500"
            ],
            rating=4.8,
            reviews_count=256,
            sku="SHOE-002",
            specifications={
                "Chất liệu": "Mesh + Cao su",
                "Công nghệ": "Air Cushion",
                "Trọng lượng": "250g/chiếc",
                "Màu sắc": "Đen/Trắng, All Black",
                "Size": "39, 40, 41, 42, 43, 44"
            }
        ),
        Product(
            name="Balo laptop chống nước",
            description="Balo đựng laptop cao cấp với ngăn chống sốc riêng biệt cho laptop 15.6 inch. Thiết kế thông minh với nhiều ngăn tiện ích. Chất liệu chống nước, chống xước. Quai đeo êm ái, thoáng khí.",
            image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
            price=599000,
            stock=20,
            category="Phụ kiện",
            brand="Targus",
            images=[
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
                "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500",
                "https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=500"
            ],
            rating=4.6,
            reviews_count=89,
            sku="BAG-003",
            specifications={
                "Kích thước": "45 x 30 x 15 cm",
                "Dung tích": "25L",
                "Chất liệu": "Polyester chống nước",
                "Ngăn laptop": "Lên đến 15.6 inch",
                "Trọng lượng": "680g"
            }
        ),
        Product(
            name="Đồng hồ thông minh SmartWatch X5",
            description="Đồng hồ thông minh cao cấp với màn hình AMOLED 1.4 inch sắc nét. Theo dõi sức khỏe toàn diện: nhịp tim, SpO2, giấc ngủ, stress. Hỗ trợ 100+ chế độ thể thao. Pin 7 ngày. Chống nước IP68.",
            image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
            price=2499000,
            stock=15,
            category="Điện tử",
            brand="Apple",
            images=[
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500"
            ],
            rating=4.9,
            reviews_count=432,
            sku="WATCH-004",
            specifications={
                "Màn hình": "AMOLED 1.4 inch",
                "Pin": "7-10 ngày",
                "Chống nước": "IP68 (5 ATM)",
                "Kết nối": "Bluetooth 5.0",
                "Cảm biến": "Nhịp tim, SpO2, Gia tốc kế, La bàn"
            }
        ),
        Product(
            name="Tai nghe không dây ANC Pro",
            description="Tai nghe True Wireless với công nghệ chống ồn chủ động ANC. Chất âm Hi-Fi, bass mạnh mẽ sâu lắng. Thời gian nghe nhạc 6 giờ, kèm hộp sạc 24 giờ. Chống nước IPX5. Kết nối Bluetooth 5.2 ổn định.",
            image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
            price=1899000,
            stock=25,
            category="Điện tử",
            brand="Sony",
            images=[
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
                "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500"
            ],
            rating=4.7,
            reviews_count=298,
            sku="EAR-005",
            specifications={
                "Công nghệ": "ANC (Active Noise Cancelling)",
                "Pin tai nghe": "6 giờ",
                "Pin hộp sạc": "24 giờ",
                "Chống nước": "IPX5",
                "Codec": "AAC, SBC"
            }
        ),
        Product(
            name="Sách: Đắc Nhân Tâm",
            description="Cuốn sách kinh điển về kỹ năng giao tiếp và ứng xử của Dale Carnegie. Được coi là 'Nghệ thuật thu phục lòng người' giúp bạn thành công trong công việc và cuộc sống. Phiên bản tiếng Việt đầy đủ, bìa cứng cao cấp.",
            image="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
            price=89000,
            stock=100,
            category="Sách",
            brand="First News",
            images=[
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500"
            ],
            rating=4.9,
            reviews_count=1024,
            sku="BOOK-006",
            specifications={
                "Tác giả": "Dale Carnegie",
                "NXB": "First News",
                "Số trang": "320 trang",
                "Hình thức": "Bìa mềm",
                "Ngôn ngữ": "Tiếng Việt"
            }
        ),
        Product(
            name="Bàn phím cơ Gaming RGB",
            description="Bàn phím cơ cao cấp dành cho game thủ với switch Blue (click rõ nét). LED RGB 16.8 triệu màu có thể tùy chỉnh. Build chắc chắn, keycap PBT Double Shot không bị phai màu. Có phần mềm tùy chỉnh macro.",
            image="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500",
            price=1899000,
            stock=10,
            category="Phụ kiện",
            brand="Corsair",
            images=[
                "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
                "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=500"
            ],
            rating=4.8,
            reviews_count=167,
            sku="KB-007",
            specifications={
                "Switch": "Mechanical Blue Switch",
                "LED": "RGB 16.8M màu",
                "Keycap": "PBT Double Shot",
                "Kết nối": "USB Type-C có thể tháo rời",
                "Layout": "Full size 104 phím"
            }
        ),
        Product(
            name="Mũ bảo hiểm 3/4 cao cấp",
            description="Mũ bảo hiểm 3/4 đạt chuẩn CR đảm bảo an toàn tuyệt đối. Vỏ ABS cao cấp chống va đập tốt. Lót nỉ tháo rời giặt được. Kính chống tia UV, chống bám nước. Thiết kế aerodynamic giảm tiếng ồn gió.",
            image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
            price=450000,
            stock=40,
            category="Phụ kiện",
            brand="Royal",
            images=[
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
                "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500"
            ],
            rating=4.5,
            reviews_count=203,
            sku="HELM-008",
            specifications={
                "Chuẩn": "CR + DOT",
                "Chất liệu vỏ": "ABS cao cấp",
                "Trọng lượng": "950g",
                "Kính": "Chống UV, chống bám nước",
                "Size": "M (56-57cm), L (58-59cm), XL (60-61cm)"
            }
        ),
    ]
    for product in products:
        if not db.query(Product).filter_by(name=product.name).first():
            db.add(product)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed()
