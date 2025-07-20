import socket
import network
import json
import time
import _thread
from machine import Pin
import usocket as socket
import ujson as json

def send_data_to_server(sensor_data):
    try:
        # Kết nối tới server Node.js (giả định IP máy chủ là 192.168.4.2, bạn cần chỉnh cho đúng)
        addr = socket.getaddrinfo('192.168.4.2', 3000)[0][-1]
        s = socket.socket()
        s.connect(addr)

        # Tạo JSON body
        body = json.dumps(sensor_data)
        headers = (
            'POST /update-from-esp HTTP/1.1\r\n'
            'Host: 192.168.4.2\r\n'
            'Content-Type: application/json\r\n'
            'Content-Length: {}\r\n'
            '\r\n'
        ).format(len(body))

        # Gửi request
        s.send(bytes(headers + body, 'utf8'))

        # Nhận phản hồi
        response = s.recv(1024)
        print("Server response:", response)

        s.close()
    except Exception as e:
        print("Error sending data:", e)


# Cấu hình WiFi AP
ap = network.WLAN(network.AP_IF)
ap.active(True)
ap.config(essid='RASPI_AP', password='12345678')
ip = ap.ifconfig()[0]

# Khởi tạo motor
motor = Pin(4, Pin.OUT)

def read_sensors():
    # Giả lập dữ liệu cảm biến
    return {
        "temp": 27,
        "humi": 60,
        "light": 300,
        "gas": 67
    }

def start_server():
    s = socket.socket()
    s.bind((ip, 80))
    s.listen(5)
    print(f"Server running on {ip}")

    while True:
        conn, addr = s.accept()
        request = conn.recv(1024).decode()
        try:
            if "POST /update " in request:
                # Lấy phần body của request
                body = request.split('\r\n\r\n')[1]
                if "MOTOR_ON" in body:
                    motor.on()
                    conn.send("HTTP/1.1 200 OK\nContent-Type: application/json\n\n" + json.dumps({"status": "Motor ON"}))
                elif "MOTOR_OFF" in body:
                    motor.off()
                    conn.send("HTTP/1.1 200 OK\nContent-Type: application/json\n\n" + json.dumps({"status": "Motor OFF"}))
            
            if "POST /update-from-esp " in request:
                # Lấy dữ liệu cảm biến
                sensor_data = read_sensors()
    
                # Tạo request POST với dữ liệu JSON
                headers = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n"
                body = json.dumps({
                    "temp": sensor_data["temp"],
                    "humi": sensor_data["humi"],
                    "light": sensor_data["light"],
                    "gas": sensor_data["gas"]
                })
                conn.send(headers.encode() + body.encode())
                
        except Exception as e:
            print("Error:", e)
            conn.send("HTTP/1.1 500 Internal Server Error\n\n")
        finally:
            conn.close()
def auto_send_loop():
    while True:
        sensor_data = read_sensors()
        send_data_to_server(sensor_data)
        time.sleep(5)  # gửi mỗi 5 giây

# Bắt đầu vòng lặp gửi dữ liệu song song
_thread.start_new_thread(auto_send_loop, ())
start_server()