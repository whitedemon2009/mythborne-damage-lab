# Xuất bản Mythborne Damage Lab

Repository public dự kiến: `mythborne-damage-lab`.

Mỗi lần đẩy nhánh `main`, workflow `.github/workflows/pages.yml` chạy `python3 build.py`, tạo `public/index.html` độc lập rồi triển khai bằng GitHub Pages. Trong **Settings → Pages**, chọn **Source: GitHub Actions**.

Địa chỉ mặc định: `https://TEN_GITHUB.github.io/mythborne-damage-lab/`.

`public/index.html` chứa toàn bộ CSS, JavaScript và dữ liệu cần thiết nên không phụ thuộc localhost, đường dẫn gốc của tên miền hoặc máy chủ Python. File `.nojekyll` ngăn GitHub Pages xử lý lại nội dung.
