                            HƯỚNG DẪN SỬ DỤNG KHÓA LUẬN TỐT NGHIÊP KỸ SƯ CNTT
Đề tài: Xây dựng Website kinh doanh sản phẩm thời trang
Giáo viên hướng dẫn: ThS. Nguyễn Minh Đạo
Nhóm: 01
Thành viên nhóm:
	Ngô Thừa Ân		20110144	
	Nguyễn Ngọc Thắng	20110727

1. CÀI ĐẶT
	Hệ thống đã được chúng em Deploy trên môi trường Internet, cụ thể:
		* Database (MySQL): atkltn.mysql.database.azure.com (Host)
		* BackEnd: https://dmve375ddqozi.cloudfront.net/ 
		* FrontEnd: https://242k-01-fe.vercel.app/   
	Chúng ta có thể tiến hành cài đặt hệ thống ở môi trường Local 
theo hướng dẫn được chúng em trình bày dưới đây. 

	1.1. Yêu cầu hệ thống
		Để có thể triển khai được ứng dụng, máy tính cần phải đáp ứng được các yêu cầu sau đây:
			+ JDK 17 và một trong các công cụ (IntelliJ, Eclipse hoặc Spring Tool Suite 4) 
			để chạy source code BackEnd
			+ Node.js 20.12.1 và Visual Studio Code để chạy source code FrontEnd

	1.2. Cài đặt hệ thống
	Bước 1: Mở source code BackEnd (01-be) và FrontEnd (01-fe) trên các công cụ tương ứng
	
	Bước 2: Cài đặt các package, dependency cần thiết
		+ Tại thư mục 01-fe, mở cửa sổ Terminal và gõ lệnh “npm install” để cài đặt 
		các package cho project FrontEnd.
		+ Khởi chạy project BackEnd để cài đặt các dependency, kiểm tra danh sách API
		http://localhost:8080/swagger-ui/index.html 
		
	Bước 3: Khởi chạy project FrontEnd
		+ Tại cửa sổ Terminal của project FrontEnd, gõ lệnh “npm run build” để build project
		+ Sau khi build project xong, gõ lệnh “npm run start” để khởi chạy, sau đó truy cập 
		vào http://localhost:3000 để tới với giao diện Website

2. SỬ DỤNG
    Để sử dụng Website, ta có thể truy cập vào đường dẫn https://242k-01-fe.vercel.app/ 
(Deploy trên môi trường Internet) hoặc tiến hành cài đặt rồi truy cập vào đường dẫn
http://localhost:3000 (Localhost).

	2.1. Truy cập Website với tư cách là  Khách (Guest)
		Khi truy cập vào Website với tư cách Khách thì sẽ được dẫn tới Trang chủ. 
	Sau đó Khách có thể sử dụng các tính năng mà Website dành cho khách, đó là xem/tìm kiếm sản phẩm,
	đăng ký, trò chuyện với Chatbot.
	
	2.2. Truy cập Website với tư cách là Người mua (Customer)
		Để truy cập vào Website với tư cách là Người mua, ta có thể đăng ký tài khoản rồi đăng nhập 
	hoặc sử dụng tài khoản sau: ngothuaan2002@gmail.com (Email), Myshop@123 (Mật khẩu). Ngoài ra 
	ta cũng có thể đăng nhập bằng Google, Facebook (hiện tại Facebook chỉ cho duy nhất tài khoản 
	người tạo có thể đăng nhập được, còn để nhiều người đăng nhập được phải đăng ký doanh nghiệp).
	
		Khi đăng nhập với tư cách là Người mua thì khách hàng có thể sử dụng các tính năng mà Website 
	dành cho Người mua như là xem/tìm kiếm sản phẩm, đặt hàng, thanh toán, quản lý thông tin cá nhân, 
	theo dõi đơn hàng, trò chuyện với Chatbot…
	
	2.3. Truy cập Website với tư cách là Quản trị viên (Admin)
		Để truy cập vào Website với tư cách là Quản trị viên, ta có thể sử dụng 
	tài khoản sau: admin@gmail.com (Email), admin@@123 (Mật khẩu). 
	
		Khi đăng nhập với tư cách là Quản trị viên thì ta có thể sử dụng các tính năng mà Website dành 
	cho Quản trị viên như là quản lý người dùng, quản lý danh mục sản phẩm, quản lý sản phẩm, quản lý đơn hàng, 
	thống kê doanh thu, thống kê đơn hàng,…

	2.4. Truy cập Website với tư cách là Người giao hàng (Shipper)
		Để truy cập vào Website với tư cách là Người giao hàng, ta có thể sử dụng 
	tài khoản sau: hochiminhcityshipper@gmail.com (Email), Hcmshipper@123 (Mật khẩu). 
	
		Khi đăng nhập với tư cách là Người giao hàng thì ta có thể sử dụng các tính năng mà Website dành 
	cho Người giao hàng là nhận hàng và giao hàng.

