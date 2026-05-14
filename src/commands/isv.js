const { category } = require("./fish");

module.exports = {
  name: "isv",

  category: "other",

  description:
    "Tính ISV dựa trên team của bạn. Công thức: ISV = S1 + (S2 + S3 + S4 + S5) / 5",

  async execute(message, args) {
    // Chuyển args thành số
    let numbers = args.map(Number);

    // Kiểm tra dữ liệu hợp lệ
    if (numbers.some(isNaN)) {
      return message.reply("❌ Tất cả giá trị phải là số.");
    }

    if (numbers.length < 2) {
      return message.reply("❌ Vui lòng cung cấp ít nhất hai số.");
    }

    if (numbers.length > 5) {
      return message.reply("❌ Vui lòng cung cấp không quá năm số.");
    }

    // Nếu thiếu thì thêm 0 cho đủ 5 số
    while (numbers.length < 5) {
      numbers.push(0);
    }

    // Chỉ lấy 5 số đầu
    const [s1, s2, s3, s4, s5] = numbers.slice(0, 5);

    // Công thức
    const isv = s1 + (s2 + s3 + s4 + s5) / 5;

    // Reply kết quả
    message.reply(`ISV của bạn là: ${isv}%
`);
  },
};