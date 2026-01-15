using backend.Services;
using Mapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers
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

        
        [HttpGet("UserGet")]
        public HttpVO UserGetBook([FromQuery] string UserId)
        {
            return BookService.UserGetBook(UserId);
        }

       
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
    
  

      
        [HttpGet("MonthlyReport")]
        public HttpVO GetMonthlyReport([FromQuery] int year)
        {
            return BookService.GetMonthlyReport(year);
        }

    
        [HttpGet("UserMonthlyReport")]
        public HttpVO GetUserMonthlyReport([FromQuery] string userId, [FromQuery] int year)
        {
            return BookService.GetUserMonthlyReport(userId, year);
        }

    
        [HttpGet("DoctorMonthlyReport")]
        public HttpVO GetDoctorMonthlyReport([FromQuery] string doctorId, [FromQuery] int year)
        {
            return BookService.GetDoctorMonthlyReport(doctorId, year);
        }

     
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