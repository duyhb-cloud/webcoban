const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));
app.set('view engine', 'ejs');

let sensorData = {
    temp:0,
    humi:0,
    light:0,
    gas:0
};
setInterval(() => {
    console.log("📊 Gửi dữ liệu:", sensorData); // <--- debug
    io.emit('sensorUpdate', sensorData);
}, 2000);

// Thêm hàm phân tích bệnh cây
function analyzePlantHealth(sensorData) {
    // Logic phân tích dựa trên ngưỡng
    const { temp, humi, light, gas } = sensorData;
    
    let issues = [];
    
    // Ngưỡng cho cây thông thường
    if (temp > 30) issues.push("nhiệt độ cao");
    if (temp < 15) issues.push("nhiệt độ thấp");
    if (humi > 80) issues.push("độ ẩm cao");
    if (humi < 40) issues.push("độ ẩm thấp");


    if (issues.length === 0) {
        return {
            status: "KHỎE MẠNH",
            description: "Cây phát triển tốt",
            healthy: true
        };
    } else {
        return {
            status: "CÓ VẤN ĐỀ",
            description: `Phát hiện: ${issues.join(", ")}`,
            healthy: false
        };
    }
}

// Trang chính
app.get('/', (req, res) => {
  res.render('index', { sensorData }); // render views/index.ejs
});
// Thêm endpoint mới
app.get('/plant-health', (req, res) => {
    const analysis = analyzePlantHealth(sensorData);
    res.json(analysis);
});
// Endpoint để client (trình duyệt) lấy dữ liệu
app.get('/update-data', (req, res) => {
    res.json(sensorData);
});

// Endpoint để ESP32 gửi dữ liệu lên
app.post('/update-from-esp', express.json(), (req, res) => {
    sensorData = req.body;
    res.sendStatus(200);
});

// Gửi lệnh điều khiển đến ESP32
app.post('/control-motor', async (req, res) => {
    try {
        const { command } = req.body;
        console.log("📤 Gửi đến ESP32:", { command });
        const response = await axios.post(`http://192.168.4.1/update`, command);  // Cổng 80 (mặc định)
        console.log("📥 Nhận từ ESP32:", response.data);
        res.send(response.data);
    } catch (err) {
        res.status(500).send("Error controlling motor");
    }
});

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('sensorUpdate', sensorData); // gửi dữ liệu ngay khi client kết nối
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server listening on port 3000');
});




/*
// Gửi về ESP32 (giả định IP 192.168.1.100)
const axios = require('axios');

axios.post('http://192.168.1.100:5000/delivery', {
  method,
  address,
  gps
});
*/
