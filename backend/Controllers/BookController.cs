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
    }
}