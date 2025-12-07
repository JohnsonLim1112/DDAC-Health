using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Service;
using Mapper;

namespace backend.Controllers
{
    [Route("UserInfo")]
    [ApiController]
    public class InfoController : ControllerBase
    {
        [HttpPost("create")]
        public HttpVO createInfo(CreateInfoVO createInfoVO)
        {
            return InfoService.createInfo(createInfoVO);
        }

        [HttpPost("delete")]
        public HttpVO deleteInfo(DeleteVO deleteVO)
        {
            return InfoService.deleteInfo(deleteVO.id);
        }

        [HttpPost("update")]
        public HttpVO updateInfo(UserInfoDO userInfoDO)
        {
            return InfoService.updateInfo(userInfoDO);
        }

        [HttpGet("get")]
        public HttpVO getInfo([FromQuery] string UserId)  // ✅ 修改为 FromQuery
        {
            return InfoService.getInfo(UserId);
        }

        // ✅ 新增：获取所有医生列表
        [HttpGet("GetDoctors")]
        public HttpVO GetAllDoctors()
        {
            HttpVO httpVO = new HttpVO();
            try
            {
                var doctors = UserInfoMapper.GetAllDoctors();
                httpVO.success = true;
                httpVO.message = "get doctors successfully";
                httpVO.data = doctors;
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