using Microsoft.AspNetCore.Mvc;
using Service;

namespace backend.Controllers
{
    [Route("health")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        // 创建健康记录
        [HttpPost("create")]
        public HttpVO CreateHealth([FromBody] CreateHealthVO createHealthVO)
        {
            return HealthService.CreateHealth(createHealthVO);
        }

        // 删除健康记录
        [HttpPost("delete")]
        public HttpVO DeleteHealth([FromBody] DeleteVO deleteVO)
        {
            return HealthService.DeleteHealth(deleteVO.id);
        }

        // 更新健康记录
        [HttpPost("update")]
        public HttpVO UpdateHealth([FromBody] HealthDO healthDO)
        {
            return HealthService.UpdateHealth(healthDO);
        }

        // 获取用户所有健康记录
        [HttpGet("user")]
        public HttpVO GetUserHealthRecords([FromQuery] string userId)
        {
            return HealthService.GetUserHealthRecords(userId);
        }

        // 按日期范围过滤（用于趋势图）
        [HttpGet("filter")]
        public HttpVO GetHealthRecordsByDateRange(
            [FromQuery] string userId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            return HealthService.GetHealthRecordsByDateRange(userId, startDate, endDate);
        }

        // 获取单条记录
        [HttpGet("get")]
        public HttpVO GetHealthById([FromQuery] string id)
        {
            return HealthService.GetHealthById(id);
        }
    }
}