using Mapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace backend.Controllers
{
    [Route("book")]
    [ApiController]
    public class BookController : ControllerBase
    {
        [HttpPost("create")]
        public HttpVO createBook(CreateBookVO createBookVO)
        {
            return BookService.createBook(createBookVO);
        }

        [HttpPost("delete")]
        public HttpVO deleteBook(DeleteVO deleteVO)
        {
            return BookService.deleteBook(deleteVO.id);
        }

        [HttpPost("update")]
        public HttpVO updateBook(BookDO bookDO)
        {
            return BookService.updateBook(bookDO);
        }

        // ✅ 修改：使用 [FromQuery] 接受 query string
        [HttpGet("UserGet")]
        public HttpVO UserGetBook([FromQuery] string UserId)
        {
            return BookService.UserGetBook(UserId);
        }

        // ✅ 修改：使用 [FromQuery] 接受 query string
        [HttpGet("DoctorGet")]
        public HttpVO DoctorGetBook([FromQuery] string DoctorId)
        {
            return BookService.DoctorGetBook(DoctorId);
        }

        [HttpGet("GetAll")]
        public HttpVO GetAllBooks()
        {
            HttpVO httpVO = new HttpVO();
            try
            {
                List<BookDO> bookDOs = BookMapper.GetAll();
                httpVO.success = true;
                httpVO.message = "get successfully";
                httpVO.data = bookDOs;
            }
            catch (Exception ex)
            {
                httpVO.success = false;
                httpVO.message = ex.Message;
            }
            return httpVO;
        }
    
    // ========== 新增报告相关端点 ==========

        // 管理员：查看每月总 appointment 增长
        [HttpGet("MonthlyReport")]
        public HttpVO GetMonthlyReport([FromQuery] int year)
        {
            return BookService.GetMonthlyReport(year);
        }

        // 查看特定用户的月度报告
        [HttpGet("UserMonthlyReport")]
        public HttpVO GetUserMonthlyReport([FromQuery] string userId, [FromQuery] int year)
        {
            return BookService.GetUserMonthlyReport(userId, year);
        }

        // 医生：查看自己的月度报告
        [HttpGet("DoctorMonthlyReport")]
        public HttpVO GetDoctorMonthlyReport([FromQuery] string doctorId, [FromQuery] int year)
        {
            return BookService.GetDoctorMonthlyReport(doctorId, year);
        }

        // 医生：查看指定月份的详细 appointments
        [HttpGet("DoctorMonthlyDetails")]
        public HttpVO GetDoctorMonthlyDetails(
            [FromQuery] string doctorId,
            [FromQuery] int year,
            [FromQuery] int month)
        {
            return BookService.GetDoctorMonthlyDetails(doctorId, year, month);
        }
    }
}