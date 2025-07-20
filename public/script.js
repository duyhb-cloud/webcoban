function fetchData() {
    fetch('/update-data')
        .then(response => response.json())
        .then(data => {
            document.getElementById("temp").textContent = data.temp;
            document.getElementById("humi").textContent = data.humi;
            document.getElementById("light").textContent = data.light;
            document.getElementById("gas").textContent = data.gas;
        })
        .catch(err => console.error("Lỗi:", err))
        .finally(() => setTimeout(fetchData, 2000)); // Cập nhật mỗi 2 giây
}

// Khởi chạy khi trang load
document.addEventListener('DOMContentLoaded', fetchData);

// Dọn dẹp khi trang đóng
window.addEventListener('beforeunload', () => {
    clearTimeout(fetchTimeout);
});

// Gửi lệnh điều khiển motor
function controlMotor(command) {
    fetch('/control-motor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
    })
    .then(response => response.text())
    .then(message => alert(message));
}