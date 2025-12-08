using Mapper;

namespace Service
{
    public class BookService
    {
        public static HttpVO createBook(CreateBookVO createBookVO)
        {
            string uuid = Guid.NewGuid().ToString();
            HttpVO httpVO = new HttpVO();
            var bookDO = new BookDO(
                Id: uuid,
                UserId: createBookVO.UserId,
                DoctorId: createBookVO.DoctorId,
                IsAccept: false,
                IllnessTxt: createBookVO.IllnessTxt,
                Medicine: "",
                Price: 0.0,
                Comment:"",
                Status: "0",
                Date: DateTime.Now,
                StartTime: createBookVO.StartTime,
                EndTime: createBookVO.EndTime
                );
            BookMapper.Insert(bookDO);
            httpVO.success = true;
            httpVO.message = "add successfully!";
            return httpVO;
        }

        public static HttpVO deleteBook(string id)
        {
            HttpVO httpVO = new HttpVO();
            BookMapper.Delete(id);
            httpVO.success= true;
            httpVO.message = "delete successfully";
            return httpVO;
        }

        //hhw change
        public static HttpVO updateBook(BookDO bookDO)
        {
            HttpVO httpVO = new HttpVO();

            BookMapper.Update(bookDO);
            httpVO.success = true;
            httpVO.message = "update successfully";
            return httpVO;
        }

        // Customer check their own Booklist/ Doctor check customer Booklist
        public static HttpVO UserGetBook(string userid)
        {
            HttpVO httpVO = new HttpVO();
            List<BookDO> bookDOs = BookMapper.SelectByUserId(userid);
            httpVO.success= true;
            httpVO.message = "get successfully";
            httpVO.data = bookDOs;
            return httpVO;
        }

        // Doctor check Booking list 
        public static HttpVO DoctorGetBook(string doctorid)
        {
            HttpVO httpVO = new HttpVO();
            List<BookDO> bookDOs = BookMapper.SelectByDoctorId(doctorid);
            httpVO.success = true;
            httpVO.message = "get successfully";
            httpVO.data = bookDOs;
            return httpVO;
        }
        // ========== 新增报告相关方法 ==========

        // 管理员：查看每月总 appointment 增长
        public static HttpVO GetMonthlyReport(int year)
        {
            HttpVO httpVO = new HttpVO();
            try
            {
                var report = BookMapper.GetMonthlyAppointmentCount(year);
                httpVO.success = true;
                httpVO.message = "get monthly report successfully";
                httpVO.data = report;
            }
            catch (Exception ex)
            {
                httpVO.success = false;
                httpVO.message = ex.Message;
            }
            return httpVO;
        }

        // 查看特定用户的月度报告
        public static HttpVO GetUserMonthlyReport(string userId, int year)
        {
            HttpVO httpVO = new HttpVO();
            try
            {
                var report = BookMapper.GetUserMonthlyAppointmentCount(userId, year);
                httpVO.success = true;
                httpVO.message = "get user monthly report successfully";
                httpVO.data = report;
            }
            catch (Exception ex)
            {
                httpVO.success = false;
                httpVO.message = ex.Message;
            }
            return httpVO;
        }

        // 医生：查看自己的月度报告
        public static HttpVO GetDoctorMonthlyReport(string doctorId, int year)
        {
            HttpVO httpVO = new HttpVO();
            try
            {
                var report = BookMapper.GetDoctorMonthlyAppointmentCount(doctorId, year);
                httpVO.success = true;
                httpVO.message = "get doctor monthly report successfully";
                httpVO.data = report;
            }
            catch (Exception ex)
            {
                httpVO.success = false;
                httpVO.message = ex.Message;
            }
            return httpVO;
        }

        // 医生：查看指定月份的详细 appointments
        public static HttpVO GetDoctorMonthlyDetails(string doctorId, int year, int month)
        {
            HttpVO httpVO = new HttpVO();
            try
            {
                var appointments = BookMapper.SelectByDoctorIdAndMonth(doctorId, year, month);
                httpVO.success = true;
                httpVO.message = "get appointments successfully";
                httpVO.data = appointments;
            }
            catch (Exception ex)
            {
                httpVO.success = false;
                httpVO.message = ex.Message;
            }
            return httpVO;
        }
    }
}
