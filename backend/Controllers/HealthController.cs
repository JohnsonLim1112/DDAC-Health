using Microsoft.AspNetCore.Mvc;
using Service;

namespace Controller
{
    [Route("health")]
    [ApiController]
    public class HealthController : ControllerBase
    {
   
        [HttpPost("create")]
        public HttpVO CreateHealth([FromBody] CreateHealthVO createHealthVO)
        {
            return HealthService.CreateHealth(createHealthVO);
        }

       
        [HttpPost("delete")]
        public HttpVO DeleteHealth([FromBody] DeleteVO deleteVO)
        {
            return HealthService.DeleteHealth(deleteVO.id);
        }

     
        [HttpPost("update")]
        public HttpVO UpdateHealth([FromBody] HealthDO healthDO)
        {
            return HealthService.UpdateHealth(healthDO);
        }

        
        [HttpGet("user")]
        public HttpVO GetUserHealthRecords([FromQuery] string userId)
        {
            return HealthService.GetUserHealthRecords(userId);
        }

   
        [HttpGet("filter")]
        public HttpVO GetHealthRecordsByDateRange(
            [FromQuery] string userId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            return HealthService.GetHealthRecordsByDateRange(userId, startDate, endDate);
        }

    
        [HttpGet("get")]
        public HttpVO GetHealthById([FromQuery] string id)
        {
            return HealthService.GetHealthById(id);
        }
    }
}