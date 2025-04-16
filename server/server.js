const express = require("express"); // 引入 express
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express(); // 创建服务器实例

// 设置 body-parser 选项，增加请求体大小限制
app.use(bodyParser.json({ limit: "50mb" })); // 允许最大 50MB 的 JSON 请求体
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // 允许最大 50MB 的 URL 编码请求体

let quizzes = {};
let answers = {};
// 存储问卷
app.post("/api/saveQuiz", (req, res) => {
  const { id, quizData } = req.body;
  quizzes[id] = quizData;
  res.status(200).send({ message: "Quiz saved" });
});
// 根据id获取问卷内容
app.get("/api/getQuiz/:id", (req, res) => {
  const quizData = quizzes[req.params.id];
  res.status(200).send(quizData);
});
// 存储答案
app.post("/api/submitAnswers", (req, res) => {
  const { quizId, answers: userAnswers } = req.body;
  answers[quizId] = userAnswers;
  console.table(answers);
  res.status(200).send({ message: "Answers submitted" });
});

// 设置 Multer 存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// 图片上传接口
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    res.status(200).send({
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).send({ message: "Image upload failed" });
  }
});

// 提供静态资源服务
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 监听 3000 端口
app.listen(3000, function () {
  console.log("服务器已启动...");
});
