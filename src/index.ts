import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
const HOST = "0.0.0.0";
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "../data.json");

// ファイル初期化
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ data: [] }, null, 2));
}

// データを取得するエンドポイント
app.get("/cds", (req: Request, res: Response) => {
  try {
    const fileData = fs.readFileSync(DATA_FILE, "utf8");
    const jsonData = JSON.parse(fileData);
    res.json(jsonData);
  } catch (err) {
    console.error("Error reading data.json:", err);
    res.status(500).json({ error: "Failed to read data file" });
  }
});

type RequestData = {
  time: number;
}
const isRequestData = (value: unknown): value is RequestData => {
  // 値がオブジェクトなのか？
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "time" in value &&
    typeof value.time === "number"
  )
}

// データを追加するエンドポイント
app.post("/cds", (req: Request, res: Response) => {
  try {
    const requestBody = req.body as unknown;

    if (!Array.isArray(requestBody)) {
      res
        .status(400)
        .json({ error: "Invalid data format, expected an array" });
    }

    // 型チェック
    if (!isRequestData(requestBody)) {
      throw new Error(
        "The webhook request type is different from the expected type"
      );
    }
    const fileData = fs.readFileSync(DATA_FILE, "utf8");
    const jsonData = JSON.parse(fileData);

    jsonData.data.push(requestBody);

    fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2));

    res.send("success")
  } catch (err) {
    console.error("Error updating data.json:", err);
    res.send("failed");
  }
});

// サーバーを起動
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
