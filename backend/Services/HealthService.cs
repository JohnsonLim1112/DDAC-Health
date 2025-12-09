using Mapper;

namespace Service
{
    public class HealthService
    {
       
        public static HttpVO CreateHealth(CreateHealthVO createHealthVO)
        {
            HttpVO httpVO = new HttpVO();

            var existing = HealthMapper.SelectByUserIdAndDate(createHealthVO.UserId, createHealthVO.RecordDate.Date);
            if (existing != null)
            {
                httpVO.success = false;
                httpVO.message = "Health record for this date already exists";
                return httpVO;
            }

            string uuid = Guid.NewGuid().ToString();
            var healthDO = new HealthDO(
                Id: uuid,
                UserId: createHealthVO.UserId,
                Height: createHealthVO.Height,
                Weight: createHealthVO.Weight,
                BloodPressureSystolic: createHealthVO.BloodPressureSystolic,
                BloodPressureDiastolic: createHealthVO.BloodPressureDiastolic,
                MedicalHistory: createHealthVO.MedicalHistory,
                RecordDate: createHealthVO.RecordDate.Date,
                Notes: createHealthVO.Notes,
                CreateTime: DateTime.Now,
                UpdateTime: DateTime.Now
            );

            HealthMapper.Insert(healthDO);
            httpVO.success = true;
            httpVO.message = "Health record created successfully";
            httpVO.data = healthDO;
            return httpVO;
        }

  
        public static HttpVO DeleteHealth(string id)
        {
            HttpVO httpVO = new HttpVO();
            HealthMapper.Delete(id);
            httpVO.success = true;
            httpVO.message = "Health record deleted successfully";
            return httpVO;
        }

      
        public static HttpVO UpdateHealth(HealthDO healthDO)
        {
            HttpVO httpVO = new HttpVO();

            var updatedHealthDO = healthDO with
            {
                UpdateTime = DateTime.Now
            };

            HealthMapper.Update(updatedHealthDO);
            httpVO.success = true;
            httpVO.message = "Health record updated successfully";
            return httpVO;
        }

     
        public static HttpVO GetUserHealthRecords(string userId)
        {
            HttpVO httpVO = new HttpVO();
            var records = HealthMapper.SelectByUserId(userId);
            httpVO.success = true;
            httpVO.message = "Get health records successfully";
            httpVO.data = records;
            return httpVO;
        }

       
        public static HttpVO GetHealthRecordsByDateRange(string userId, DateTime startDate, DateTime endDate)
        {
            HttpVO httpVO = new HttpVO();
            var records = HealthMapper.SelectByUserIdAndDateRange(userId, startDate, endDate);
            httpVO.success = true;
            httpVO.message = "Get filtered health records successfully";
            httpVO.data = records;
            return httpVO;
        }

        public static HttpVO GetHealthById(string id)
        {
            HttpVO httpVO = new HttpVO();
            var record = HealthMapper.SelectById(id);
            if (record == null)
            {
                httpVO.success = false;
                httpVO.message = "Health record not found";
            }
            else
            {
                httpVO.success = true;
                httpVO.message = "Get health record successfully";
                httpVO.data = record;
            }
            return httpVO;
        }
    }
}