using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Service;

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
        public HttpVO getInfo(getInfoVO getInfoVO)
        {
            return InfoService.getInfo(getInfoVO.UserId);
        }
    }
}
