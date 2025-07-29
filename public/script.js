// Thêm hàm này để cập nhật trạng thái cây
function updatePlantHealth() {
    fetch('/plant-health')
        .then(response => response.json())
        .then(data => {
            const healthElement = document.getElementById("plant-health");
            healthElement.textContent = data.status;
            healthElement.className = data.healthy ? "healthy" : "unhealthy";
            
            const descElement = document.getElementById("health-desc");
            descElement.textContent = data.description;
        });
}

// Sửa hàm fetchData để gọi cả updatePlantHealth
function fetchData() {
    fetch('/update-data')
        .then(response => response.json())
        .then(data => {
            // Cập nhật giá trị cảm biến
            document.getElementById("temp").textContent = data.temp;
            document.getElementById("humi").textContent = data.humi;

            
            // Cập nhật trạng thái cây
            updatePlantHealth();
        })
        .catch(err => console.error("Lỗi:", err))
        .finally(() => setTimeout(fetchData, 2000));
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
