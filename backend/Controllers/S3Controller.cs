using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace Controllers
{
    [ApiController]
    [Route("file")]
    public class S3Controller : ControllerBase
    {

        [HttpPost("s3")]
        public async Task<HttpVO> UploadImage(IFormFile file)
        {
            HttpVO vo = new HttpVO();
            
            if (file == null || file.Length == 0)
            {
                vo.success = false;
                vo.message = "No file uploaded.";
                return vo;
            }
            try
            {
                // trun picture to base64
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                byte[] fileBytes = memoryStream.ToArray();
                string base64 = Convert.ToBase64String(fileBytes);
                string lambdaUrl = "https://rtzd7j47xktqhcytnpihqiqaje0jxrtn.lambda-url.ap-southeast-2.on.aws/";

                using var httpClient = new HttpClient();
                var content = new StringContent(base64,Encoding.UTF8, "text/plain");
                HttpResponseMessage response = await httpClient.PostAsync(lambdaUrl, content);

                // AWS serverless response (lambda of S3)
                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    vo = JsonSerializer.Deserialize<HttpVO>(responseBody)
                  ?? new HttpVO { success = false, message = "Invalid response" };
                }
                else
                {
                    vo.success = false;
                    vo.message = $"Lambda error: {response.StatusCode}";
                }
            }
            catch (Exception ex)
            {
                vo.success = false;
                vo.message = $"Upload failed: {ex.Message}";
            }

            return vo;
        }
    }
}
