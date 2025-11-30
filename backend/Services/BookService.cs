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
                Medicine: null,
                Price: 0.0,
                Status: "0",
                CreateTime: DateTime.Now,
                UpdateTime: DateTime.Now
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

        public static HttpVO updateBook(BookDO bookDO)
        {
            HttpVO httpVO = new HttpVO();
            BookMapper.Update(bookDO);
            httpVO.success= true;
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
    }
}
